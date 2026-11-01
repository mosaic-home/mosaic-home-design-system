import {
  mdiBattery,
  mdiBattery10,
  mdiBattery20,
  mdiBattery30,
  mdiBattery40,
  mdiBattery50,
  mdiBattery60,
  mdiBattery70,
  mdiBattery80,
  mdiBattery90,
  mdiBatteryCharging,
  mdiBatteryOutline,
  mdiHomeLightningBoltOutline,
  mdiSolarPower,
  mdiTransmissionTower,
} from '@mdi/js';
import { node, patch, r2, toDom, type ChartNode } from '../../charts/tree.ts';
import { cx } from '../../dom.ts';
import { clampTo, formatPower, iconTree, isNum } from './shared.ts';

/** The places energy comes from and goes to. */
export type EnergyNode = 'solar' | 'grid' | 'battery' | 'home';

/** One direction of flow between two places, source first. */
export type EnergyFlowEdge = 'solar-home' | 'solar-battery' | 'solar-grid' | 'grid-home' | 'grid-battery' | 'battery-home' | 'battery-grid';

export const ENERGY_FLOW_EDGES: readonly EnergyFlowEdge[] = ['solar-home', 'solar-battery', 'solar-grid', 'grid-home', 'grid-battery', 'battery-home', 'battery-grid'];

/** Power through each edge, in watts (0 or more). */
export type EnergyFlows = Record<EnergyFlowEdge, number>;

/** The readings, in watts. `undefined` leaves the place out; `null` shows it with an unknown value. */
export interface EnergyFlowReadings {
  /** Produced, 0 or more. */
  solar?: number | null;
  /** Positive while importing, negative while exporting. */
  grid?: number | null;
  /** Positive while discharging (feeding the home), negative while charging. */
  battery?: number | null;
  /** Used by the home; default what the others add up to. */
  home?: number | null;
}

/** Every visible and spoken word, for translation. */
export interface EnergyFlowLabels {
  solar: string;
  grid: string;
  battery: string;
  home: string;
  producing: string;
  importing: string;
  exporting: string;
  charging: string;
  discharging: string;
  using: string;
  idle: string;
  unknown: string;
  /** Joins two places in the spoken flow list ("Solar to home"). */
  to: string;
  /** Short visible words under a value. */
  import: string;
  export: string;
}

export const ENERGY_FLOW_LABELS: EnergyFlowLabels = {
  solar: 'Solar',
  grid: 'Grid',
  battery: 'Battery',
  home: 'Home',
  producing: 'producing',
  importing: 'importing',
  exporting: 'exporting',
  charging: 'charging',
  discharging: 'discharging',
  using: 'using',
  idle: 'idle',
  unknown: 'unknown',
  to: 'to',
  import: 'Import',
  export: 'Export',
};

export interface EnergyFlowOptions extends EnergyFlowReadings {
  /** The accessible name (default "Energy flow"). */
  label?: string;
  /** Battery charge in percent, shown under the battery. */
  batteryLevel?: number | null;
  /** Power per edge, when the system reports it; default worked out from the readings. */
  flows?: Partial<EnergyFlows>;
  /** The power drawn at full width and speed, in watts (default the largest flow, at least 1 kW). */
  scale?: number;
  /** Flows below this are drawn as idle, in watts (default 10). */
  threshold?: number;
  /** Icons and values only, for watches and small tiles. */
  compact?: boolean;
  /** Formats watts (default "850 W", "1.2 kW"). */
  format?: (watts: number) => string;
  labels?: Partial<EnergyFlowLabels>;
}

export interface EnergyFlowHandle {
  el: HTMLDivElement;
  /** Replaces everything shown; running animations carry on. */
  update(options: EnergyFlowOptions): void;
}

const pos = (v: number | null | undefined): number => (isNum(v) && v > 0 ? v : 0);

/** What the home uses: given, or solar plus grid plus battery (never below zero). */
export function energyHomeUse(r: EnergyFlowReadings): number | null {
  if (isNum(r.home)) return Math.max(0, r.home);
  const parts = [r.solar, r.grid, r.battery].filter((v) => v !== undefined);
  if (parts.length === 0 || parts.some((v) => !isNum(v))) return null;
  return Math.max(0, (parts as number[]).reduce((a, b) => a + b, 0));
}

/**
 * Splits the readings into flows: solar serves the home first, then charges the battery, then exports; the battery
 * then covers what the home still needs, and the grid the rest. What is left of an import charges the battery, and
 * what is left of a discharge goes out to the grid.
 */
export function energyFlows(r: EnergyFlowReadings): EnergyFlows {
  const solar = pos(r.solar);
  const importing = pos(r.grid);
  const exporting = pos(isNum(r.grid) ? -r.grid : 0);
  const discharge = pos(r.battery);
  const charge = pos(isNum(r.battery) ? -r.battery : 0);
  let need = energyHomeUse(r) ?? 0;
  const solarHome = Math.min(solar, need);
  need -= solarHome;
  let spare = solar - solarHome;
  const solarBattery = Math.min(spare, charge);
  spare -= solarBattery;
  const solarGrid = Math.min(spare, exporting);
  const batteryHome = Math.min(discharge, need);
  need -= batteryHome;
  const gridHome = Math.min(importing, need);
  const gridBattery = Math.min(importing - gridHome, charge - solarBattery);
  const batteryGrid = Math.min(discharge - batteryHome, exporting - solarGrid);
  const f = { 'solar-home': solarHome, 'solar-battery': solarBattery, 'solar-grid': solarGrid, 'grid-home': gridHome, 'grid-battery': gridBattery, 'battery-home': batteryHome, 'battery-grid': batteryGrid };
  for (const k of ENERGY_FLOW_EDGES) f[k] = Math.max(0, Math.round(f[k]));
  return f;
}

type Point = readonly [number, number];
type Curve = readonly [Point, Point, Point, Point];

/** Node centres in the 100 x 84 drawing: solar on top, then grid, home and battery in a row. */
export const ENERGY_NODE_AT: Record<EnergyNode, Point> = { solar: [50, 15], grid: [14, 55], home: [50, 55], battery: [86, 55] };
export const ENERGY_FLOW_VIEW = { width: 100, height: 84 } as const;

const line = (a: Point, b: Point): Curve => [a, [a[0] + (b[0] - a[0]) / 3, a[1] + (b[1] - a[1]) / 3], [a[0] + ((b[0] - a[0]) * 2) / 3, a[1] + ((b[1] - a[1]) * 2) / 3], b];
const { solar: S, grid: G, home: H, battery: B } = ENERGY_NODE_AT;

/** The six links as cubic curves, drawn from the first place to the second. */
const LINKS: Record<'solar-home' | 'solar-grid' | 'solar-battery' | 'grid-home' | 'battery-home' | 'grid-battery', Curve> = {
  'solar-home': line(S, H),
  'grid-home': line(G, H),
  'battery-home': line(B, H),
  'solar-grid': [S, [30, 15], [14, 33], G],
  'solar-battery': [S, [70, 15], [86, 33], B],
  'grid-battery': [G, [14, 82], [86, 82], B],
};

/** The curve an edge flows along, oriented from its source. */
export function energyEdgeCurve(edge: EnergyFlowEdge): Curve {
  if (edge === 'battery-grid') {
    const [a, b, c, d] = LINKS['grid-battery'];
    return [d, c, b, a];
  }
  return LINKS[edge];
}

const pathOf = (c: Curve): string => `M${c[0][0]} ${c[0][1]}C${c[1][0]} ${c[1][1]} ${c[2][0]} ${c[2][1]} ${c[3][0]} ${c[3][1]}`;

/** A small chevron pointing along the curve at `t`, so the direction reads without motion or colour. */
export function energyArrowPath(c: Curve, t = 0.62, size = 2.6): string {
  const u = 1 - t;
  const at = (i: 0 | 1): number => u * u * u * c[0][i] + 3 * u * u * t * c[1][i] + 3 * u * t * t * c[2][i] + t * t * t * c[3][i];
  const d = (i: 0 | 1): number => 3 * u * u * (c[1][i] - c[0][i]) + 6 * u * t * (c[2][i] - c[1][i]) + 3 * t * t * (c[3][i] - c[2][i]);
  const x = at(0);
  const y = at(1);
  const len = Math.hypot(d(0), d(1)) || 1;
  const dx = d(0) / len;
  const dy = d(1) / len;
  const bx = x - dx * size;
  const by = y - dy * size;
  const nx = -dy * size * 0.75;
  const ny = dx * size * 0.75;
  return `M${r2(bx + nx)} ${r2(by + ny)}L${r2(x)} ${r2(y)}L${r2(bx - nx)} ${r2(by - ny)}`;
}

/** Stroke width (in drawing units) and seconds per dot spacing for a flow: wider and faster with more power. */
export function energyFlowStroke(watts: number, scale: number): { width: number; seconds: number } {
  const f = Math.sqrt(clampTo(watts / Math.max(scale, 1), 0, 1));
  return { width: r2(0.9 + f * 2.1), seconds: r2(1.6 - f * 1.25) };
}

const SOURCE: Record<EnergyFlowEdge, EnergyNode> = {
  'solar-home': 'solar',
  'solar-battery': 'solar',
  'solar-grid': 'solar',
  'grid-home': 'grid',
  'grid-battery': 'grid',
  'battery-home': 'battery',
  'battery-grid': 'battery',
};

const BATTERY_ICONS = [mdiBatteryOutline, mdiBattery10, mdiBattery20, mdiBattery30, mdiBattery40, mdiBattery50, mdiBattery60, mdiBattery70, mdiBattery80, mdiBattery90, mdiBattery];

/** The battery icon for a charge level (in tenths), or the charging one. */
export function energyBatteryIcon(level: number | null | undefined, charging = false): string {
  if (charging) return mdiBatteryCharging;
  if (!isNum(level)) return mdiBattery50;
  return BATTERY_ICONS[clampTo(Math.round(level / 10), 0, 10)]!;
}

export function energyFlowClass(compact = false): string {
  return cx('mh-energy-flow', compact && 'mh-energy-flow--compact');
}

interface NodeView {
  kind: EnergyNode;
  icon: string;
  value: string;
  word: string;
  spoken: string;
  idle: boolean;
}

/** What each shown place says: its value, the short word under it and the spoken sentence. */
export function energyNodes(o: EnergyFlowOptions): NodeView[] {
  const l = { ...ENERGY_FLOW_LABELS, ...o.labels };
  const fmt = o.format ?? formatPower;
  const t = o.threshold ?? 10;
  const out: NodeView[] = [];
  const unknown = (kind: EnergyNode, icon: string): NodeView => ({ kind, icon, value: '–', word: l[kind], spoken: `${l[kind]} ${l.unknown}`, idle: true });
  if (o.solar !== undefined) {
    if (!isNum(o.solar)) out.push(unknown('solar', mdiSolarPower));
    else {
      const idle = o.solar < t;
      out.push({ kind: 'solar', icon: mdiSolarPower, value: fmt(o.solar), word: l.solar, spoken: idle ? `${l.solar} ${l.idle}` : `${l.solar} ${l.producing} ${fmt(o.solar)}`, idle });
    }
  }
  if (o.grid !== undefined) {
    if (!isNum(o.grid)) out.push(unknown('grid', mdiTransmissionTower));
    else {
      const idle = Math.abs(o.grid) < t;
      const word = idle ? l.grid : o.grid > 0 ? l.import : l.export;
      out.push({ kind: 'grid', icon: mdiTransmissionTower, value: fmt(o.grid), word, spoken: idle ? `${l.grid} ${l.idle}` : `${l.grid} ${o.grid > 0 ? l.importing : l.exporting} ${fmt(o.grid)}`, idle });
    }
  }
  if (o.battery !== undefined) {
    const level = isNum(o.batteryLevel) ? `${Math.round(clampTo(o.batteryLevel, 0, 100))}%` : '';
    if (!isNum(o.battery)) out.push({ ...unknown('battery', energyBatteryIcon(o.batteryLevel)), word: level || l.battery, spoken: `${l.battery} ${l.unknown}${level ? `, ${level}` : ''}` });
    else {
      const idle = Math.abs(o.battery) < t;
      const doing = idle ? l.idle : o.battery > 0 ? `${l.discharging} ${fmt(o.battery)}` : `${l.charging} ${fmt(o.battery)}`;
      out.push({
        kind: 'battery',
        icon: energyBatteryIcon(o.batteryLevel, !idle && o.battery < 0),
        value: fmt(o.battery),
        word: level || l.battery,
        spoken: `${l.battery} ${doing}${level ? `, ${level}` : ''}`,
        idle,
      });
    }
  }
  const home = energyHomeUse(o);
  out.push(
    home === null
      ? unknown('home', mdiHomeLightningBoltOutline)
      : { kind: 'home', icon: mdiHomeLightningBoltOutline, value: fmt(home), word: l.home, spoken: `${l.home} ${l.using} ${fmt(home)}`, idle: home < t },
  );
  return out;
}

/**
 * The markup of `.mh-energy-flow`: a `__stage` holding the `__svg` (a `__track` for each link between shown places,
 * then for each live flow a `__flow--<source>` path of moving dots and an `__arrow--<source>` chevron) under one
 * `__node--<kind>` circle per place (`__icon`, `__value`, `__word`), then a visually hidden list that says every
 * place and flow. Flow width and speed come from `--_w` and `--_s` on each path. Modifier `--compact`.
 */
export function energyFlowTree(o: EnergyFlowOptions): ChartNode {
  const l = { ...ENERGY_FLOW_LABELS, ...o.labels };
  const fmt = o.format ?? formatPower;
  const t = o.threshold ?? 10;
  const nodes = energyNodes(o);
  const shown = new Set(nodes.map((n) => n.kind));
  const flows = { ...energyFlows(o), ...o.flows };
  const live = ENERGY_FLOW_EDGES.filter((e) => {
    const [from, to] = e.split('-') as [EnergyNode, EnergyNode];
    return shown.has(from) && shown.has(to) && pos(flows[e]) >= t;
  });
  const scale = o.scale ?? Math.max(1000, ...live.map((e) => flows[e]));
  const tracks = (Object.keys(LINKS) as (keyof typeof LINKS)[]).filter((k) => {
    const [a, b] = k.split('-') as [EnergyNode, EnergyNode];
    return shown.has(a) && shown.has(b);
  });
  const { width: vw, height: vh } = ENERGY_FLOW_VIEW;
  return node(
    'div',
    { class: energyFlowClass(o.compact), role: 'group', 'aria-label': o.label ?? 'Energy flow' },
    node(
      'div',
      { class: 'mh-energy-flow__stage' },
      node(
        'svg',
        { class: 'mh-energy-flow__svg', viewBox: `0 0 ${vw} ${vh}`, 'aria-hidden': 'true' },
        tracks.map((k) => node('path', { class: 'mh-energy-flow__track', d: pathOf(LINKS[k]) })),
        live.map((e) => {
          const s = energyFlowStroke(flows[e], scale);
          return node('path', { class: `mh-energy-flow__flow mh-energy-flow__flow--${SOURCE[e]}`, d: pathOf(energyEdgeCurve(e)), style: `--_w: ${s.width}; --_s: ${s.seconds}s` });
        }),
        live.map((e) => node('path', { class: `mh-energy-flow__arrow mh-energy-flow__arrow--${SOURCE[e]}`, d: energyArrowPath(energyEdgeCurve(e)) })),
      ),
      nodes.map((n) => {
        const [x, y] = ENERGY_NODE_AT[n.kind];
        return node(
          'div',
          { class: cx('mh-energy-flow__node', `mh-energy-flow__node--${n.kind}`, n.idle && 'is-idle'), style: `left: ${r2((x / vw) * 100)}%; top: ${r2((y / vh) * 100)}%`, 'aria-hidden': 'true' },
          iconTree(n.icon, 'mh-energy-flow__icon'),
          node('span', { class: 'mh-energy-flow__value' }, n.value),
          node('span', { class: 'mh-energy-flow__word' }, n.word),
        );
      }),
    ),
    node(
      'ul',
      { class: 'mh-visually-hidden' },
      nodes.map((n) => node('li', {}, n.spoken)),
      live.map((e) => {
        const [from, to] = e.split('-') as [EnergyNode, EnergyNode];
        return node('li', {}, `${l[from]} ${l.to} ${l[to].toLowerCase()} ${fmt(flows[e])}`);
      }),
    ),
  );
}

/**
 * `.mh-energy-flow`: solar, grid, battery and home as circles with the power moving between them as dots along
 * the links, wider and faster with more power, each with a chevron for its direction. Under reduced motion the dots
 * become still lines; the chevrons stay. Scales with its container down to a watch face (`compact` drops the words).
 */
export function createEnergyFlow(options: EnergyFlowOptions): EnergyFlowHandle {
  const el = toDom(energyFlowTree(options)) as HTMLDivElement;
  return { el, update: (next) => patch(el, energyFlowTree(next)) };
}
