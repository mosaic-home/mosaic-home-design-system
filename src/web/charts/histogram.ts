import { cx } from '../dom.ts';
import { node, patch, r2, sizeModifier, toDom, type ChartNode, type ChartSize } from './tree.ts';

export type HistogramChannel = 'luminance' | 'red' | 'green' | 'blue';
/** How bin counts map to height: `linear`, or `sqrt` and `log` to lift the quiet tones next to a tall peak. */
export type HistogramScale = 'linear' | 'sqrt' | 'log';

/** Bin counts per channel, darkest bin first (any number of bins, usually 256). */
export type HistogramData = Partial<Record<HistogramChannel, readonly number[]>>;

export interface HistogramOptions {
  data: HistogramData;
  /** What it shows ("Snapshot histogram"); a description of the tones is added for screen readers. */
  label: string;
  /** Which channels to draw: `luminance`, `rgb` or `all`; default every channel in `data`. */
  mode?: 'luminance' | 'rgb' | 'all';
  scale?: HistogramScale;
  /** Markers at the ends when shadows or highlights are clipped (default true). */
  clipping?: boolean;
  size?: ChartSize;
}

export interface HistogramHandle {
  el: HTMLDivElement;
  update(options: HistogramOptions): void;
}

const ORDER: HistogramChannel[] = ['luminance', 'red', 'green', 'blue'];

/**
 * Bins RGBA pixel data (as from a canvas, 0–255 per byte) into per-channel histograms. Luminance uses the
 * Rec. 709 weights on the stored values.
 */
export function histogramFromPixels(rgba: ArrayLike<number>, bins = 256): Required<HistogramData> {
  const n = Math.max(1, Math.floor(bins));
  const make = (): number[] => Array<number>(n).fill(0);
  const out = { luminance: make(), red: make(), green: make(), blue: make() };
  const bin = (v: number): number => Math.min(n - 1, Math.floor((Math.min(255, Math.max(0, v)) / 256) * n));
  for (let i = 0; i + 2 < rgba.length; i += 4) {
    const r = rgba[i]!;
    const g = rgba[i + 1]!;
    const b = rgba[i + 2]!;
    out.red[bin(r)]! += 1;
    out.green[bin(g)]! += 1;
    out.blue[bin(b)]! += 1;
    out.luminance[bin(0.2126 * r + 0.7152 * g + 0.0722 * b)]! += 1;
  }
  return out;
}

/** The channels drawn for a mode. */
export function histogramChannels(data: HistogramData, mode?: HistogramOptions['mode']): HistogramChannel[] {
  const wanted = mode === 'luminance' ? ['luminance'] : mode === 'rgb' ? ['red', 'green', 'blue'] : ORDER;
  return ORDER.filter((c) => wanted.includes(c) && (data[c]?.length ?? 0) > 0);
}

const lift = (v: number, scale: HistogramScale): number => (scale === 'sqrt' ? Math.sqrt(v) : scale === 'log' ? Math.log1p(v) : v);

/** Closed area paths per channel in a 100 x 100 box, all on one height scale so channels compare. */
export function histogramPaths(data: HistogramData, channels: readonly HistogramChannel[], scale: HistogramScale = 'linear'): Partial<Record<HistogramChannel, string>> {
  const top = Math.max(0, ...channels.flatMap((c) => (data[c] ?? []).map((v) => lift(Math.max(0, v), scale))));
  const out: Partial<Record<HistogramChannel, string>> = {};
  for (const c of channels) {
    const bins = data[c] ?? [];
    const n = bins.length;
    const x = (i: number): number => (n === 1 ? 50 : r2((i / (n - 1)) * 100));
    const y = (v: number): number => (top > 0 ? r2(100 - (lift(Math.max(0, v), scale) / top) * 100) : 100);
    out[c] = `M0 100${bins.map((v, i) => `L${x(i)} ${y(v)}`).join('')}L100 100Z`;
  }
  return out;
}

/** Share of the pixels in the darkest and brightest bins, and the mean level (all 0–1). */
export function histogramStats(bins: readonly number[]): { mean: number; shadows: number; highlights: number } {
  const total = bins.reduce((a, b) => a + Math.max(0, b), 0);
  if (total === 0 || bins.length < 2) return { mean: 0, shadows: 0, highlights: 0 };
  const sum = bins.reduce((a, b, i) => a + Math.max(0, b) * i, 0);
  return { mean: sum / total / (bins.length - 1), shadows: Math.max(0, bins[0]!) / total, highlights: Math.max(0, bins[bins.length - 1]!) / total };
}

/** The bins the summary describes: luminance, or the average of the colour channels. */
function toneBins(data: HistogramData): readonly number[] {
  if (data.luminance?.length) return data.luminance;
  const rgb = (['red', 'green', 'blue'] as const).map((c) => data[c]).filter((b): b is readonly number[] => !!b?.length);
  if (rgb.length === 0) return [];
  return rgb[0]!.map((_, i) => rgb.reduce((a, b) => a + (b[i] ?? 0), 0) / rgb.length);
}

const pct = (v: number): string => `${v >= 0.1 ? Math.round(v * 100) : Number((v * 100).toFixed(1))}%`;

/** "Snapshot histogram: mostly midtones, mean level 48%, 2.5% clipped highlights". */
export function histogramSummary(label: string, data: HistogramData): string {
  const bins = toneBins(data);
  if (bins.reduce((a, b) => a + b, 0) <= 0) return `${label}: no data`;
  const s = histogramStats(bins);
  const tone = s.mean < 0.35 ? 'mostly shadows' : s.mean > 0.65 ? 'mostly highlights' : 'mostly midtones';
  const clipped = [s.shadows >= 0.001 && `${pct(s.shadows)} clipped shadows`, s.highlights >= 0.001 && `${pct(s.highlights)} clipped highlights`].filter(Boolean);
  return [`${label}: ${tone}`, `mean level ${Math.round(s.mean * 100)}%`, ...clipped].join(', ');
}

export function histogramClass(size?: ChartSize): string {
  return cx('mh-histogram', sizeModifier('mh-histogram', size));
}

/**
 * The markup of `.mh-histogram`: an `__svg` with quarter `__grid` lines and one `__channel--<name>` area per
 * channel, then `__clip--shadows` / `__clip--highlights` markers. `role="img"` with a description of the tones.
 */
export function histogramTree(o: HistogramOptions): ChartNode {
  const channels = histogramChannels(o.data, o.mode);
  const paths = histogramPaths(o.data, channels, o.scale);
  const stats = histogramStats(toneBins(o.data));
  const clip = o.clipping !== false;
  return node(
    'div',
    { class: histogramClass(o.size), role: 'img', 'aria-label': histogramSummary(o.label, o.data) },
    node(
      'svg',
      { class: 'mh-histogram__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
      node('path', { class: 'mh-histogram__grid', d: 'M25 0V100M50 0V100M75 0V100', 'vector-effect': 'non-scaling-stroke' }),
      channels.map((c) => node('path', { class: cx('mh-histogram__channel', `mh-histogram__channel--${c}`), d: paths[c]!, 'vector-effect': 'non-scaling-stroke' })),
    ),
    clip && stats.shadows >= 0.01 && node('span', { class: 'mh-histogram__clip mh-histogram__clip--shadows', 'aria-hidden': 'true' }),
    clip && stats.highlights >= 0.01 && node('span', { class: 'mh-histogram__clip mh-histogram__clip--highlights', 'aria-hidden': 'true' }),
  );
}

/**
 * `.mh-histogram`: a luminance and / or RGB histogram. Luminance is drawn in the muted text colour, the colour
 * channels in the theme's danger, success and info colours, translucent so overlaps show. Markers flag clipped
 * shadows and highlights (1% or more of the pixels in the end bins).
 */
export function createHistogram(options: HistogramOptions): HistogramHandle {
  const el = toDom(histogramTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, histogramTree(next)) };
}
