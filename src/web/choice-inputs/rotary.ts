// Geometry and keyboard rules shared by the radial dial and the click wheel. Angles are in degrees, 0 at twelve
// o'clock and growing clockwise; drawings use a 100 × 100 viewBox centred on (50, 50).

const decimalsOf = (n: number): number => {
  const text = String(n);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
};

const round2 = (n: number): string => (Math.round(n * 100) / 100).toString();

/** The point at `angle` on a circle of radius `r` around the centre. */
export function rotaryPoint(angle: number, r: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad) };
}

/** An SVG path along the circle of radius `r` from angle `from` to `to` (clockwise); a bare move when they meet. */
export function rotaryArc(from: number, to: number, r: number): string {
  const a = rotaryPoint(from, r);
  const start = `M ${round2(a.x)} ${round2(a.y)}`;
  const sweep = to - from;
  if (Math.abs(sweep) < 0.01) return start;
  const b = rotaryPoint(to, r);
  return `${start} A ${r} ${r} 0 ${Math.abs(sweep) > 180 ? 1 : 0} ${sweep > 0 ? 1 : 0} ${round2(b.x)} ${round2(b.y)}`;
}

/** The angle of a point relative to a box's centre, 0 to 360. */
export function rotaryAngleOf(clientX: number, clientY: number, box: { left: number; top: number; width: number; height: number }): number {
  const dx = clientX - (box.left + box.width / 2);
  const dy = clientY - (box.top + box.height / 2);
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** The signed shortest turn from angle `a` to angle `b`, -180 to 180. */
export function rotaryDelta(a: number, b: number): number {
  return ((((b - a) % 360) + 540) % 360) - 180;
}

/** Rounds to the step grid that starts at `min`, keeping the step's decimals. */
export function rotarySnap(value: number, min: number, step: number): number {
  const snapped = step > 0 ? min + Math.round((value - min) / step) * step : value;
  return Number(snapped.toFixed(Math.max(decimalsOf(step), decimalsOf(min))));
}

export interface RotaryLimits {
  min: number;
  max: number;
  step: number;
  /** Page Up / Page Down; default ten steps. */
  bigStep?: number;
  /** Past one end comes back at the other (angles, lists). The top end then equals the bottom one and is never shown. */
  wrap?: boolean;
}

/** Keeps a value inside the limits: clamped, or (with `wrap`) brought round into `min` ≤ v < `max`. */
export function rotaryClamp(value: number, limits: RotaryLimits): number {
  const { min, max, step } = limits;
  if (limits.wrap) {
    const span = max - min;
    if (span <= 0) return min;
    const v = rotarySnap(((((value - min) % span) + span) % span) + min, min, step);
    return v >= max ? min : v;
  }
  return rotarySnap(Math.min(max, Math.max(min, value)), min, step);
}

/** The value after a key on a rotary control (arrows, Page Up/Down, Home, End), or null for other keys. */
export function rotaryKey(key: string, value: number, limits: RotaryLimits): number | null {
  const { min, max, step } = limits;
  const big = limits.bigStep ?? step * 10;
  switch (key) {
    case 'ArrowUp':
    case 'ArrowRight':
      return rotaryClamp(value + step, limits);
    case 'ArrowDown':
    case 'ArrowLeft':
      return rotaryClamp(value - step, limits);
    case 'PageUp':
      return rotaryClamp(value + big, limits);
    case 'PageDown':
      return rotaryClamp(value - big, limits);
    case 'Home':
      return min;
    case 'End':
      return limits.wrap ? rotaryClamp(max - step, limits) : max;
    default:
      return null;
  }
}

/** Sets the ARIA slider attributes of a rotary control. */
export function setRotaryAria(el: HTMLElement, value: number, min: number, max: number, text: string | undefined, disabled: boolean): void {
  el.setAttribute('aria-valuemin', String(min));
  el.setAttribute('aria-valuemax', String(max));
  el.setAttribute('aria-valuenow', String(value));
  if (text === undefined) el.removeAttribute('aria-valuetext');
  else el.setAttribute('aria-valuetext', text);
  if (disabled) el.setAttribute('aria-disabled', 'true');
  else el.removeAttribute('aria-disabled');
  el.tabIndex = disabled ? -1 : 0;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** An SVG element with attributes; null children are skipped. */
export function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, ...children: (SVGElement | null)[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of children) if (c) el.append(c);
  return el;
}

/** Tick marks around a circle: `count` evenly spaced, or over `[from, to]` when given, from radius `r1` to `r2`. */
export function rotaryTicks(count: number, r1: number, r2: number, from = 0, to = 360): { x1: string; y1: string; x2: string; y2: string }[] {
  if (count <= 0) return [];
  const full = Math.abs(to - from) >= 360;
  const spacing = full ? (to - from) / count : count > 1 ? (to - from) / (count - 1) : 0;
  return Array.from({ length: count }, (_, i) => {
    const angle = from + i * spacing;
    const a = rotaryPoint(angle, r1);
    const b = rotaryPoint(angle, r2);
    return { x1: round2(a.x), y1: round2(a.y), x2: round2(b.x), y2: round2(b.y) };
  });
}
