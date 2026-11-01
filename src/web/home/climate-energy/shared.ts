// Small helpers shared by the climate and energy components. Not re-exported from the package.
import { iconPath, type IconName } from '../../icons.ts';
import { node, type ChartNode } from '../../charts/tree.ts';

/** A decorative `.mh-icon` as a tree node: the same markup `createIcon` and the React `Icon` render. */
export function iconTree(icon: IconName | string, extraClass?: string): ChartNode {
  return node(
    'svg',
    { viewBox: '0 0 24 24', class: extraClass ? `mh-icon ${extraClass}` : 'mh-icon', 'aria-hidden': 'true' },
    node('path', { d: iconPath(icon), fill: 'currentColor' }),
  );
}

export const isNum = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

export const clampTo = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Decimals a step needs (0.5 → 1, 1 → 0). */
export function stepDigits(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

/** Rounds to a multiple of `step`, without floating-point dust. */
export function roundToStep(value: number, step: number): number {
  return Number((Math.round(value / step) * step).toFixed(stepDigits(step)));
}

/** "1.2 kW" from watts (sign dropped): below 1 kW in whole watts, from 1 kW in kilowatts with one decimal. */
export function formatPower(watts: number): string {
  const a = Math.abs(watts);
  if (Math.round(a) < 1000) return `${Math.round(a)} W`;
  return `${(a / 1000).toFixed(1)} kW`;
}

/** "1 h 20 min", "45 min", "under a minute". */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 1) return 'under a minute';
  const hours = Math.floor(m / 60);
  const rest = m % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** "06:30" from minutes after midnight (24:00 stays 24:00). */
export function clockText(minutes: number): string {
  const m = Math.round(minutes);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
