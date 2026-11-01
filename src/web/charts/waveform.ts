import { cx } from '../dom.ts';
import { clamp, colorModifier, node, patch, r2, sizeModifier, toDom, type ChartColor, type ChartNode, type ChartSize } from './tree.ts';

/**
 * `bars`: rounded bars mirrored around the middle. `half`: bars rising from the bottom. `envelope`: a filled
 * outline mirrored around the middle. `line`: a trace swinging up and down with the loudness. `dots`: columns of
 * dots, like LEDs.
 */
export type WaveformStyle = 'bars' | 'half' | 'envelope' | 'line' | 'dots';

export interface WaveformSelection {
  /** Seconds. */
  start: number;
  end: number;
}

export interface WaveformOptions {
  /** Loudness per bucket, 0 to 1, oldest first (see `waveformPeaks`). */
  peaks: readonly number[];
  /** What it is ("Voice message", "Doorbell chime"). */
  label: string;
  style?: WaveformStyle;
  /** Length in seconds; with it the waveform shows the playhead and the played part. */
  duration?: number;
  /** Playhead in seconds. */
  position?: number;
  selection?: WaveformSelection | null;
  color?: ChartColor;
  size?: ChartSize;
  /** Makes it a slider: click, drag or arrow keys seek. */
  onSeek?: (time: number) => void;
  /** Dragging (or Shift + arrows) selects a range; Escape clears it. */
  onSelect?: (selection: WaveformSelection | null) => void;
  /** Arrow-key step in seconds (default 5); Page Up / Down move six steps. */
  step?: number;
  /** Formats times; default m:ss (h:mm:ss from an hour). */
  formatTime?: (seconds: number) => string;
}

export interface WaveformHandle {
  el: HTMLDivElement;
  setPeaks(peaks: readonly number[]): void;
  setPosition(time: number): void;
  setSelection(selection: WaveformSelection | null): void;
  update(options: WaveformOptions): void;
  /** Removes the listeners. */
  destroy(): void;
}

/** "1:05", "1:02:03". */
export function waveformTime(seconds: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return hh ? `${hh}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

/** Loudest absolute sample per bucket from raw samples (-1 to 1); scaled so the loudest bucket is 1 when `normalize`. */
export function waveformPeaks(samples: ArrayLike<number>, buckets: number, normalize = true): number[] {
  const n = Math.max(1, Math.floor(buckets));
  const out = Array<number>(n).fill(0);
  const len = samples.length;
  for (let b = 0; b < n; b += 1) {
    const from = Math.floor((b * len) / n);
    const to = Math.max(from + 1, Math.floor(((b + 1) * len) / n));
    let peak = 0;
    for (let i = from; i < to && i < len; i += 1) peak = Math.max(peak, Math.abs(samples[i] ?? 0));
    out[b] = Math.min(1, peak);
  }
  const top = Math.max(...out);
  return normalize && top > 0 ? out.map((p) => r2(p / top)) : out.map(r2);
}

/** Path data of the waveform in a 100 x 100 box. */
export function waveformPath(peaks: readonly number[], style: WaveformStyle = 'bars'): string {
  const n = peaks.length;
  if (n === 0) return '';
  const p = (i: number): number => clamp(Number.isFinite(peaks[i]!) ? peaks[i]! : 0, 0, 1);
  const centre = (i: number): number => r2(((i + 0.5) / n) * 100);
  const edge = (i: number): number => (n === 1 ? 50 : r2((i / (n - 1)) * 100));
  switch (style) {
    case 'half':
      return peaks.map((_, i) => `M${centre(i)} 100V${r2(100 - Math.max(0.04, p(i)) * 100)}`).join('');
    case 'envelope': {
      const top = peaks.map((_, i) => `L${edge(i)} ${r2(50 - p(i) * 48)}`).join('');
      const bottom = peaks.map((_, i) => `L${edge(n - 1 - i)} ${r2(50 + p(n - 1 - i) * 48)}`).join('');
      return `M0 50${top}L100 50${bottom}Z`;
    }
    case 'line':
      return peaks.map((_, i) => `${i ? 'L' : 'M'}${edge(i)} ${r2(50 + (i % 2 ? 1 : -1) * p(i) * 48)}`).join('');
    case 'dots': {
      const levels = 5;
      const gap = 48 / levels;
      return peaks
        .map((_, i) => {
          const k = Math.max(1, Math.round(p(i) * levels));
          const ys = new Set<number>();
          for (let j = 0; j < k; j += 1) {
            ys.add(r2(50 - j * gap));
            ys.add(r2(50 + j * gap));
          }
          return [...ys].map((y) => `M${centre(i)} ${y}h0`).join('');
        })
        .join('');
    }
    default:
      return peaks.map((_, i) => `M${centre(i)} ${r2(50 - Math.max(0.04, p(i)) * 46)}V${r2(50 + Math.max(0.04, p(i)) * 46)}`).join('');
  }
}

const interactive = (o: WaveformOptions): boolean => !!(o.onSeek || o.onSelect) && (o.duration ?? 0) > 0;

/** Spoken position: "1:05 of 3:20, selected 0:30 to 0:45". */
export function waveformValueText(o: Pick<WaveformOptions, 'duration' | 'position' | 'selection' | 'formatTime'>): string {
  const f = o.formatTime ?? waveformTime;
  const sel = o.selection ? `, selected ${f(o.selection.start)} to ${f(o.selection.end)}` : '';
  return `${f(o.position ?? 0)} of ${f(o.duration ?? 0)}${sel}`;
}

export function waveformClass(style: WaveformStyle = 'bars', color?: ChartColor, size?: ChartSize, isInteractive = false): string {
  return cx('mh-waveform', `mh-waveform--${style}`, colorModifier('mh-waveform', color), sizeModifier('mh-waveform', size), isInteractive && 'mh-waveform--interactive');
}

/**
 * The markup of `.mh-waveform`: the `__base` and `__played` SVGs (the same `__wave` path; the played copy is
 * clipped at the playhead, `--_pos`, and shows whole without a duration), the `__selection` band and the `__playhead`. A slider when it can seek,
 * otherwise `role="img"` with the label and length.
 */
export function waveformTree(o: WaveformOptions): ChartNode {
  const style = o.style ?? 'bars';
  const duration = Math.max(0, o.duration ?? 0);
  const position = clamp(o.position ?? 0, 0, duration);
  const at = (t: number): number => (duration ? r2((clamp(t, 0, duration) / duration) * 100) : 0);
  const d = waveformPath(o.peaks, style);
  const wave = (part: string): ChartNode =>
    node(
      'svg',
      { class: cx('mh-waveform__svg', `mh-waveform__${part}`), viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
      node('path', { class: 'mh-waveform__wave', d, 'vector-effect': 'non-scaling-stroke' }),
    );
  const f = o.formatTime ?? waveformTime;
  const sel = o.selection && duration ? { start: Math.min(o.selection.start, o.selection.end), end: Math.max(o.selection.start, o.selection.end) } : null;
  const isInteractive = interactive(o);
  const a11y = isInteractive
    ? { role: 'slider', tabindex: 0, 'aria-label': o.label, 'aria-valuemin': 0, 'aria-valuemax': r2(duration), 'aria-valuenow': r2(position), 'aria-valuetext': waveformValueText({ ...o, position, selection: sel }) }
    : { role: 'img', 'aria-label': duration ? `${o.label}, ${f(duration)}${position ? `, at ${f(position)}` : ''}` : o.label };
  return node(
    'div',
    { class: waveformClass(style, o.color, o.size, isInteractive), ...a11y, style: `--_n: ${Math.max(1, o.peaks.length)}; --_pos: ${duration ? at(position) : 100}%` },
    wave('base'),
    wave('played'),
    sel && node('div', { class: 'mh-waveform__selection', 'aria-hidden': 'true', style: `left: ${at(sel.start)}%; width: ${r2(at(sel.end) - at(sel.start))}%` }),
    duration > 0 && node('div', { class: 'mh-waveform__playhead', 'aria-hidden': 'true', style: `left: ${at(position)}%` }),
  );
}

/** What a key does to the playhead and selection, or null when it isn't handled. */
export function waveformKey(
  key: string,
  shift: boolean,
  o: Pick<WaveformOptions, 'duration' | 'position' | 'selection' | 'step' | 'onSelect'>,
): { position?: number; selection?: WaveformSelection | null } | null {
  const duration = o.duration ?? 0;
  const pos = clamp(o.position ?? 0, 0, duration);
  const step = o.step ?? 5;
  if (key === 'Escape') return o.selection && o.onSelect ? { selection: null } : null;
  const moves: Record<string, number> = { ArrowRight: pos + step, ArrowUp: pos + step, ArrowLeft: pos - step, ArrowDown: pos - step, PageUp: pos + step * 6, PageDown: pos - step * 6, Home: 0, End: duration };
  const target = moves[key];
  if (target === undefined) return null;
  const next = r2(clamp(target, 0, duration));
  if (!shift || !o.onSelect) return { position: next };
  const s = o.selection;
  const anchor = s ? (Math.abs(pos - s.start) < Math.abs(pos - s.end) ? s.end : s.start) : pos;
  return { position: next, selection: next === anchor ? null : { start: Math.min(anchor, next), end: Math.max(anchor, next) } };
}

/** Time under a pointer. */
export function waveformTimeAt(clientX: number, rect: { left: number; width: number }, duration: number): number {
  return rect.width > 0 ? r2(clamp((clientX - rect.left) / rect.width, 0, 1) * duration) : 0;
}

/**
 * Pointer and keyboard behaviour on a rendered waveform, shared by the web handle and the React binding. `get`
 * returns the current options; `seek` and `select` report changes. Returns a function that removes the listeners.
 */
export function attachWaveform(el: HTMLElement, get: () => WaveformOptions, seek: (time: number) => void, select: (selection: WaveformSelection | null) => void): () => void {
  let press: { id: number; x: number; t: number; dragging: boolean } | null = null;
  const timeAt = (e: PointerEvent): number => waveformTimeAt(e.clientX, el.getBoundingClientRect(), get().duration ?? 0);
  const down = (e: PointerEvent): void => {
    if (!interactive(get()) || e.button !== 0) return;
    press = { id: e.pointerId, x: e.clientX, t: timeAt(e), dragging: false };
    el.setPointerCapture?.(e.pointerId);
    el.focus();
  };
  const move = (e: PointerEvent): void => {
    if (!press || e.pointerId !== press.id) return;
    const o = get();
    if (o.onSelect && Math.abs(e.clientX - press.x) > 4) press.dragging = true;
    if (press.dragging) {
      const t = timeAt(e);
      select({ start: Math.min(press.t, t), end: Math.max(press.t, t) });
    } else if (!o.onSelect) seek(timeAt(e));
  };
  const up = (e: PointerEvent): void => {
    if (!press || e.pointerId !== press.id) return;
    if (!press.dragging) {
      if (get().selection) select(null);
      seek(timeAt(e));
    }
    press = null;
  };
  const cancel = (): void => {
    press = null;
  };
  const key = (e: KeyboardEvent): void => {
    const o = get();
    if (!interactive(o)) return;
    const res = waveformKey(e.key, e.shiftKey, o);
    if (!res) return;
    e.preventDefault();
    if (res.position !== undefined) seek(res.position);
    if ('selection' in res) select(res.selection ?? null);
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', cancel);
  el.addEventListener('keydown', key);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', cancel);
    el.removeEventListener('keydown', key);
  };
}

/**
 * `.mh-waveform`: an audio waveform in five styles (`--bars | --half | --envelope | --line | --dots`), with the
 * played part in the accent (or `--mh-series-N`), a playhead and a selection band. With `onSeek` it is a slider
 * (click, drag, arrows, Page Up / Down, Home / End); with `onSelect`, dragging or Shift + arrows select a range.
 * The web handle moves its own playhead and selection, then reports them.
 */
export function createWaveform(options: WaveformOptions): WaveformHandle {
  let current = options;
  const el = toDom(waveformTree(current)) as HTMLDivElement;
  const update = (next: WaveformOptions): void => {
    current = next;
    patch(el, waveformTree(next));
  };
  const detach = attachWaveform(
    el,
    () => current,
    (t) => {
      update({ ...current, position: t });
      current.onSeek?.(t);
    },
    (s) => {
      update({ ...current, selection: s });
      current.onSelect?.(s);
    },
  );
  return {
    el,
    update,
    setPeaks: (peaks) => update({ ...current, peaks }),
    setPosition: (position) => update({ ...current, position }),
    setSelection: (selection) => update({ ...current, selection }),
    destroy: detach,
  };
}
