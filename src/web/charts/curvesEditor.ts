import { cx } from '../dom.ts';
import { histogramPaths, type HistogramChannel } from './histogram.ts';
import { clamp, node, patch, r2, sizeModifier, toDom, type ChartNode, type ChartSize } from './tree.ts';

/** A control point of a tone curve: input `x` and output `y`, both 0 to 1. */
export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurvesEditorOptions {
  /** Control points, sorted by input; at least two. */
  points: readonly CurvePoint[];
  /** The accessible name ("Tone curve"). */
  label: string;
  /** Bin counts drawn behind the curve, darkest first. */
  histogram?: readonly number[];
  /** Which channel the curve is for; sets its colour (default luminance, in the accent). */
  channel?: HistogramChannel;
  /** Called with the new points while dragging and after key presses. */
  onChange?: (points: CurvePoint[]) => void;
  /** Most points allowed (default 16). */
  maxPoints?: number;
  /** Arrow-key step (default 1/255); Shift moves ten steps. */
  step?: number;
  /** Formats a 0–1 level for screen readers; default 0–255. */
  format?: (level: number) => string;
  size?: ChartSize;
  disabled?: boolean;
}

export interface CurvesEditorHandle {
  el: HTMLDivElement;
  getPoints(): CurvePoint[];
  setPoints(points: readonly CurvePoint[]): void;
  setHistogram(histogram: readonly number[] | undefined): void;
  update(options: CurvesEditorOptions): void;
  destroy(): void;
}

/** Smallest input gap between neighbouring points. */
const GAP = 0.01;
const r3 = (n: number): number => Math.round(n * 1000) / 1000;
const level255 = (v: number): string => String(Math.round(v * 255));

/** Points sorted by input, clamped to 0–1. */
export function curveSorted(points: readonly CurvePoint[]): CurvePoint[] {
  return points.map((p) => ({ x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) })).sort((a, b) => a.x - b.x);
}

/** Tangents of a monotone cubic Hermite spline (Fritsch–Carlson): no overshoot between points. */
function tangents(pts: readonly CurvePoint[]): number[] {
  const n = pts.length;
  const d: number[] = [];
  for (let k = 0; k < n - 1; k += 1) {
    const h = pts[k + 1]!.x - pts[k]!.x;
    d.push(h > 0 ? (pts[k + 1]!.y - pts[k]!.y) / h : 0);
  }
  const m = pts.map((_, k) => {
    if (k === 0) return d[0] ?? 0;
    if (k === n - 1) return d[n - 2] ?? 0;
    const a = d[k - 1]!;
    const b = d[k]!;
    return a * b <= 0 ? 0 : (a + b) / 2;
  });
  for (let k = 0; k < n - 1; k += 1) {
    const dk = d[k]!;
    if (dk === 0) {
      m[k] = 0;
      m[k + 1] = 0;
      continue;
    }
    const a = m[k]! / dk;
    const b = m[k + 1]! / dk;
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[k] = t * a * dk;
      m[k + 1] = t * b * dk;
    }
  }
  return m;
}

/** The curve's output at input `x` (flat before the first and after the last point), 0 to 1. */
export function curveSample(points: readonly CurvePoint[], x: number): number {
  const pts = curveSorted(points);
  if (pts.length === 0) return clamp(x, 0, 1);
  if (pts.length === 1 || x <= pts[0]!.x) return pts[0]!.y;
  if (x >= pts[pts.length - 1]!.x) return pts[pts.length - 1]!.y;
  const m = tangents(pts);
  let k = 0;
  while (k < pts.length - 2 && x > pts[k + 1]!.x) k += 1;
  const p0 = pts[k]!;
  const p1 = pts[k + 1]!;
  const h = p1.x - p0.x;
  if (h <= 0) return p1.y;
  const t = (x - p0.x) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  const y = (2 * t3 - 3 * t2 + 1) * p0.y + (t3 - 2 * t2 + t) * h * m[k]! + (-2 * t3 + 3 * t2) * p1.y + (t3 - t2) * h * m[k + 1]!;
  return clamp(y, 0, 1);
}

/** A lookup table of `size` entries (default 256) mapping input level to output level, both 0 to 1. */
export function curveLut(points: readonly CurvePoint[], size = 256): number[] {
  const n = Math.max(2, Math.floor(size));
  return Array.from({ length: n }, (_, i) => curveSample(points, i / (n - 1)));
}

/** Path data of the curve in a 100 x 100 box (y up). */
export function curvePath(points: readonly CurvePoint[], samples = 64): string {
  return curveLut(points, samples + 1)
    .map((y, i) => `${i ? 'L' : 'M'}${r2((i / samples) * 100)} ${r2(100 - y * 100)}`)
    .join('');
}

/** Moves point `index` to (x, y), keeping it between its neighbours. */
export function curveMove(points: readonly CurvePoint[], index: number, x: number, y: number): CurvePoint[] {
  const out = points.map((p) => ({ ...p }));
  const lo = index > 0 ? out[index - 1]!.x + GAP : 0;
  const hi = index < out.length - 1 ? out[index + 1]!.x - GAP : 1;
  if (!out[index]) return out;
  out[index] = { x: r3(clamp(x, Math.min(lo, hi), Math.max(lo, hi))), y: r3(clamp(y, 0, 1)) };
  return out;
}

/** Adds a point on the curve at input `x`; returns the points and the new index, or null when there's no room. */
export function curveAdd(points: readonly CurvePoint[], x: number, max = 16, y = curveSample(points, x)): { points: CurvePoint[]; index: number } | null {
  if (points.length >= max || x < 0 || x > 1 || points.some((p) => Math.abs(p.x - x) < GAP * 3)) return null;
  const out = [...points.map((p) => ({ ...p })), { x: r3(x), y: r3(clamp(y, 0, 1)) }].sort((a, b) => a.x - b.x);
  return { points: out, index: out.findIndex((p) => p.x === r3(x)) };
}

/** Removes a point; the two end points stay. */
export function curveRemove(points: readonly CurvePoint[], index: number): CurvePoint[] | null {
  if (index <= 0 || index >= points.length - 1) return null;
  return points.filter((_, i) => i !== index).map((p) => ({ ...p }));
}

/** What a key does to point `index`: new points and the point to focus, or null when it isn't handled. */
export function curvesKey(points: readonly CurvePoint[], index: number, key: string, shift: boolean, step = 1 / 255, max = 16): { points: CurvePoint[]; focus: number } | null {
  const p = points[index];
  if (!p) return null;
  const s = shift ? step * 10 : step;
  const moves: Record<string, [number, number]> = { ArrowUp: [0, s], ArrowDown: [0, -s], ArrowRight: [s, 0], ArrowLeft: [-s, 0], PageUp: [0, 0.1], PageDown: [0, -0.1] };
  const mv = moves[key];
  if (mv) return { points: curveMove(points, index, p.x + mv[0], p.y + mv[1]), focus: index };
  if (key === 'Delete' || key === 'Backspace') {
    const next = curveRemove(points, index);
    return next ? { points: next, focus: index - 1 } : null;
  }
  if (key === 'Insert' || key === '+') {
    const other = points[index + 1] ?? points[index - 1];
    if (!other) return null;
    const added = curveAdd(points, (p.x + other.x) / 2, max);
    return added ? { points: added.points, focus: added.index } : null;
  }
  return null;
}

export function curvesClass(channel: HistogramChannel = 'luminance', size?: ChartSize, disabled = false): string {
  return cx('mh-curves', `mh-curves--${channel}`, sizeModifier('mh-curves', size), disabled && 'is-disabled');
}

/**
 * The markup of `.mh-curves`: a square `__plot` holding the `__svg` (`__histogram` area, quarter `__grid`, the
 * `__identity` diagonal and the `__curve`) and one `__point` per control point. Each point is a focusable
 * `role="slider"` (output level) whose value text gives input and output.
 */
export function curvesTree(o: CurvesEditorOptions): ChartNode {
  const pts = curveSorted(o.points);
  const fmt = o.format ?? level255;
  const hist = o.histogram?.length ? histogramPaths({ luminance: o.histogram }, ['luminance'], 'sqrt').luminance : undefined;
  return node(
    'div',
    {
      class: curvesClass(o.channel, o.size, o.disabled),
      role: 'group',
      'aria-label': o.label,
      'aria-description': 'Arrow keys move a point, Shift moves it faster, Insert adds a point and Delete removes it.',
    },
    node(
      'div',
      { class: 'mh-curves__plot' },
      node(
        'svg',
        { class: 'mh-curves__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
        hist && node('path', { class: 'mh-curves__histogram', d: hist }),
        node('path', { class: 'mh-curves__grid', d: 'M25 0V100M50 0V100M75 0V100M0 25H100M0 50H100M0 75H100', 'vector-effect': 'non-scaling-stroke' }),
        node('path', { class: 'mh-curves__identity', d: 'M0 100L100 0', 'vector-effect': 'non-scaling-stroke' }),
        node('path', { class: 'mh-curves__curve', d: curvePath(pts), 'vector-effect': 'non-scaling-stroke' }),
      ),
      pts.map((p, i) =>
        node('span', {
          class: 'mh-curves__point',
          role: 'slider',
          tabindex: o.disabled ? -1 : 0,
          'data-index': i,
          'aria-label': `Point ${i + 1} of ${pts.length}`,
          'aria-valuemin': 0,
          'aria-valuemax': 1,
          'aria-valuenow': r3(p.y),
          'aria-valuetext': `Input ${fmt(p.x)}, output ${fmt(p.y)}`,
          'aria-disabled': o.disabled ? 'true' : undefined,
          style: `left: ${r2(p.x * 100)}%; top: ${r2(100 - p.y * 100)}%`,
        }),
      ),
    ),
  );
}

/**
 * Pointer and keyboard behaviour on a rendered curves editor, shared by the web handle and the React binding.
 * `change` gets the new points and, after keys and adds, the index of the point to focus. Returns a detach function.
 */
export function attachCurves(el: HTMLElement, get: () => CurvesEditorOptions, change: (points: CurvePoint[], focus?: number) => void): () => void {
  let drag: { id: number; index: number } | null = null;
  const plot = (): HTMLElement => el.querySelector<HTMLElement>('.mh-curves__plot') ?? el;
  const at = (e: PointerEvent): { x: number; y: number } => {
    const r = plot().getBoundingClientRect();
    return { x: r.width > 0 ? (e.clientX - r.left) / r.width : 0, y: r.height > 0 ? 1 - (e.clientY - r.top) / r.height : 0 };
  };
  const indexOf = (target: EventTarget | null): number => {
    const p = target instanceof Element ? target.closest<HTMLElement>('.mh-curves__point') : null;
    return p ? Number(p.dataset['index']) : -1;
  };
  const down = (e: PointerEvent): void => {
    const o = get();
    if (o.disabled || e.button !== 0) return;
    const pts = curveSorted(o.points);
    let index = indexOf(e.target);
    if (index < 0) {
      const { x } = at(e);
      const added = curveAdd(pts, clamp(x, 0, 1), o.maxPoints);
      if (!added) return;
      index = added.index;
      change(added.points, index);
    }
    e.preventDefault();
    drag = { id: e.pointerId, index };
    el.setPointerCapture?.(e.pointerId);
    el.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus();
  };
  const move = (e: PointerEvent): void => {
    if (!drag || e.pointerId !== drag.id) return;
    const { x, y } = at(e);
    change(curveMove(curveSorted(get().points), drag.index, x, y));
  };
  const up = (e: PointerEvent): void => {
    if (drag && e.pointerId === drag.id) drag = null;
  };
  const dbl = (e: MouseEvent): void => {
    const o = get();
    const index = indexOf(e.target);
    if (o.disabled || index < 0) return;
    const next = curveRemove(curveSorted(o.points), index);
    if (next) change(next, index - 1);
  };
  const key = (e: KeyboardEvent): void => {
    const o = get();
    const index = indexOf(e.target);
    if (o.disabled || index < 0) return;
    const res = curvesKey(curveSorted(o.points), index, e.key, e.shiftKey, o.step, o.maxPoints);
    if (!res) return;
    e.preventDefault();
    change(res.points, res.focus);
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('dblclick', dbl);
  el.addEventListener('keydown', key);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('dblclick', dbl);
    el.removeEventListener('keydown', key);
  };
}

/**
 * `.mh-curves`: a tone-curve editor. Drag a point to move it, press on an empty spot to add one and drag it,
 * double-click a point (or press Delete) to remove it; the end points stay. The curve is a monotone cubic spline
 * through the points (no overshoot), drawn over an optional histogram, with the identity diagonal for reference.
 * Use `curveLut` to apply it. The web handle keeps its own points and reports changes.
 */
export function createCurvesEditor(options: CurvesEditorOptions): CurvesEditorHandle {
  let current: CurvesEditorOptions = { ...options, points: curveSorted(options.points) };
  const el = toDom(curvesTree(current)) as HTMLDivElement;
  const update = (next: CurvesEditorOptions): void => {
    current = { ...next, points: curveSorted(next.points) };
    patch(el, curvesTree(current));
  };
  const detach = attachCurves(
    el,
    () => current,
    (points, focus) => {
      update({ ...current, points });
      if (focus !== undefined) el.querySelector<HTMLElement>(`[data-index="${focus}"]`)?.focus();
      current.onChange?.(curveSorted(points));
    },
  );
  return {
    el,
    update,
    getPoints: () => curveSorted(current.points),
    setPoints: (points) => update({ ...current, points }),
    setHistogram: (histogram) => update({ ...current, histogram }),
    destroy: detach,
  };
}
