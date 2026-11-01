import { cx, h, uid } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';

/** A point in plan units (any unit the app likes: centimetres, grid cells); y grows downwards. */
export type FloorPlanPoint = readonly [number, number];

/** A room's outline: a rectangle, or a polygon for L-shaped and angled rooms. */
export type FloorPlanShape = { x: number; y: number; width: number; height: number } | { points: readonly FloorPlanPoint[] };

export interface FloorPlanRoom {
  id: string;
  name: string;
  shape: FloorPlanShape;
  /** Brightness of the lights on in the room, 0 to 100; lit (a warm glow) while above 0. */
  light?: number | null;
  /** The room is being heated or cooled: a warm or cool tint. */
  climate?: 'heat' | 'cool' | null;
  /** Something needs attention (a window open, a leak): a danger outline. */
  alert?: boolean;
  /** A short state line shown under the name and read with it ("2 lights · 21 °C"). */
  summary?: string;
  /** Where the name goes (default the shape's centroid). */
  labelAt?: FloorPlanPoint;
  /** Shown, but can't be chosen. */
  disabled?: boolean;
}

/** The look of a device marker while active. */
export type FloorPlanMarkerTone = 'accent' | 'warm' | 'heat' | 'cool' | 'alert';

export interface FloorPlanMarker {
  id: string;
  /** Centre of the marker, in plan units. */
  x: number;
  y: number;
  icon: IconName | string;
  /** Accessible name ("Hall motion sensor"). */
  label: string;
  /** Read after the label ("Motion"). */
  state?: string;
  active?: boolean;
  /** Colour while active (default `accent`). */
  tone?: FloorPlanMarkerTone;
}

export interface FloorPlanBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FloorPlanOptions {
  /** Accessible name of the plan ("Ground floor"). */
  label: string;
  rooms: readonly FloorPlanRoom[];
  markers?: readonly FloorPlanMarker[];
  /** The area to show, in plan units (default: everything, fitted). */
  bounds?: FloorPlanBounds | null;
  /** The chosen room: outlined in the accent, `aria-current`. */
  selected?: string | null;
  /** Draw room names (and summaries) on the plan (default true). Off for small screens. */
  showNames?: boolean;
  /** A room was tapped or chosen with Enter or Space. */
  onRoom?: (id: string) => void;
  /** Makes the markers buttons. */
  onMarker?: (id: string) => void;
}

export interface FloorPlanHandle {
  el: HTMLDivElement;
  update(changes: Partial<FloorPlanOptions>): void;
}

/** One stop of the keyboard order: a room, or a marker when markers are buttons. */
export interface FloorPlanStop {
  kind: 'room' | 'marker';
  id: string;
  x: number;
  y: number;
}

/** The ring layer on top of the rooms (so no neighbour hides it): alert, selected and focused outlines. */
export interface FloorPlanRing {
  id: string;
  kind: 'alert' | 'selected' | 'focus';
  points: string;
}

/** The corners of a shape, clockwise for a rectangle. */
export function floorPlanPoints(shape: FloorPlanShape): FloorPlanPoint[] {
  if ('points' in shape) return [...shape.points];
  const { x, y, width: w, height: hgt } = shape;
  return [
    [x, y],
    [x + w, y],
    [x + w, y + hgt],
    [x, y + hgt],
  ];
}

/** The `points` attribute of a shape's `<polygon>`. */
export function floorPlanPolygon(shape: FloorPlanShape): string {
  return floorPlanPoints(shape)
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
}

/** The centroid of a shape (area-weighted for a polygon; the mean of its corners when it has no area). */
export function floorPlanCentroid(shape: FloorPlanShape): FloorPlanPoint {
  const pts = floorPlanPoints(shape);
  if (pts.length === 0) return [0, 0];
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i]!;
    const [x1, y1] = pts[(i + 1) % pts.length]!;
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(area) < 1e-9) return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  return [cx / (3 * area), cy / (3 * area)];
}

/** The box around a set of points. */
function box(points: readonly FloorPlanPoint[]): FloorPlanBounds {
  if (points.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(Math.max(...xs) - x, 1e-6), height: Math.max(Math.max(...ys) - y, 1e-6) };
}

/** The area that holds every room and marker. */
export function floorPlanBounds(rooms: readonly FloorPlanRoom[], markers: readonly FloorPlanMarker[] = []): FloorPlanBounds {
  return box([...rooms.flatMap((r) => floorPlanPoints(r.shape)), ...markers.map((m): FloorPlanPoint => [m.x, m.y])]);
}

/** Where a plan point sits in the canvas, as percentages from the top-left corner. */
export function floorPlanPercent(point: FloorPlanPoint, b: FloorPlanBounds): { left: number; top: number } {
  return { left: ((point[0] - b.x) / b.width) * 100, top: ((point[1] - b.y) / b.height) * 100 };
}

/** The keyboard order: rooms that can be chosen, then markers when they are buttons. */
export function floorPlanStops(o: Pick<FloorPlanOptions, 'rooms' | 'markers' | 'onMarker'>): FloorPlanStop[] {
  const rooms = o.rooms.filter((r) => !r.disabled).map((r): FloorPlanStop => {
    const [x, y] = r.labelAt ?? floorPlanCentroid(r.shape);
    return { kind: 'room', id: r.id, x, y };
  });
  const markers = o.onMarker ? (o.markers ?? []).map((m): FloorPlanStop => ({ kind: 'marker', id: m.id, x: m.x, y: m.y })) : [];
  return [...rooms, ...markers];
}

const DIRECTIONS: Record<string, FloorPlanPoint> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };

/**
 * The stop an arrow key moves to: the nearest one in that direction, favouring those straight ahead over those off
 * to the side. Home and End go to the first and last. Null when nothing lies that way.
 */
export function floorPlanMove(stops: readonly FloorPlanStop[], from: number, key: string): number | null {
  if (stops.length === 0) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return stops.length - 1;
  const d = DIRECTIONS[key];
  const here = stops[from];
  if (!d || !here) return null;
  let best: number | null = null;
  let bestScore = Infinity;
  let bestInCone = false;
  stops.forEach((s, i) => {
    if (i === from) return;
    const vx = s.x - here.x;
    const vy = s.y - here.y;
    const along = vx * d[0] + vy * d[1];
    if (along <= 1e-9) return;
    const across = Math.abs(vx * d[1] - vy * d[0]);
    const inCone = across <= along;
    const score = along + across * 2;
    if ((inCone && !bestInCone) || (inCone === bestInCone && score < bestScore)) {
      best = i;
      bestScore = score;
      bestInCone = inCone;
    }
  });
  return best;
}

/** The stop that takes Tab: the one last used, else the selected room, else the first. */
export function floorPlanTabStop(stops: readonly FloorPlanStop[], current: string | null, selected: string | null | undefined): number {
  const at = (id: string | null | undefined, kind?: 'room'): number => stops.findIndex((s) => s.id === id && (!kind || s.kind === kind));
  const used = current === null ? -1 : stops.findIndex((s) => `${s.kind}:${s.id}` === current);
  if (used >= 0) return used;
  const sel = at(selected, 'room');
  return sel >= 0 ? sel : 0;
}

/** A room's accessible name: the name and its summary. */
export function floorPlanRoomLabel(room: Pick<FloorPlanRoom, 'name' | 'summary'>): string {
  return room.summary ? `${room.name}, ${room.summary}` : room.name;
}

export function floorPlanMarkerLabel(marker: Pick<FloorPlanMarker, 'label' | 'state'>): string {
  return marker.state ? `${marker.label}, ${marker.state}` : marker.label;
}

/** 0 to 1: how lit a room is (0 when off). */
export function floorPlanLevel(room: Pick<FloorPlanRoom, 'light'>): number {
  return typeof room.light === 'number' && room.light > 0 ? Math.min(1, room.light / 100) : 0;
}

export function floorPlanRoomClass(room: FloorPlanRoom, selected: boolean): string {
  return cx(
    'mh-floor-plan__room',
    floorPlanLevel(room) > 0 && 'is-lit',
    room.climate && `is-${room.climate}`,
    room.alert && 'is-alert',
    selected && 'is-selected',
    room.disabled && 'is-disabled',
  );
}

export function floorPlanMarkerClass(marker: Pick<FloorPlanMarker, 'active' | 'tone'>, button: boolean): string {
  const tone = marker.tone ?? 'accent';
  return cx('mh-floor-plan__marker', tone !== 'accent' && `mh-floor-plan__marker--${tone}`, button && 'mh-floor-plan__marker--button', marker.active && 'is-active');
}

/** The outlines drawn on top: alert rooms, then the selected room, then the focused one. */
export function floorPlanRings(rooms: readonly FloorPlanRoom[], selected: string | null | undefined, focused: string | null): FloorPlanRing[] {
  const rings: FloorPlanRing[] = [];
  for (const r of rooms) if (r.alert) rings.push({ id: r.id, kind: 'alert', points: floorPlanPolygon(r.shape) });
  const sel = rooms.find((r) => r.id === selected);
  if (sel) rings.push({ id: sel.id, kind: 'selected', points: floorPlanPolygon(sel.shape) });
  const foc = rooms.find((r) => r.id === focused);
  if (foc) rings.push({ id: foc.id, kind: 'focus', points: floorPlanPolygon(foc.shape) });
  return rings;
}

/** The viewBox of the plan. */
export function floorPlanViewBox(b: FloorPlanBounds): string {
  return `${b.x} ${b.y} ${b.width} ${b.height}`;
}

/** A label's position and widest extent (the room's width), as inline style values. */
export function floorPlanLabelStyle(room: FloorPlanRoom, b: FloorPlanBounds): { left: string; top: string; maxWidth: string } {
  const at = floorPlanPercent(room.labelAt ?? floorPlanCentroid(room.shape), b);
  const w = box(floorPlanPoints(room.shape)).width;
  return { left: `${at.left}%`, top: `${at.top}%`, maxWidth: `${(w / b.width) * 100}%` };
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Whether focus came from the keyboard (true where the browser can't tell). */
export function floorPlanFocusVisible(el: Element): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}
const svg = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string> = {}): SVGElementTagNameMap[K] => {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
};

/** A token-safe id for the glow gradient. */
export function floorPlanGlowId(seed: string): string {
  return `mh-floor-plan-glow-${seed.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/**
 * `.mh-floor-plan`: rooms as `<polygon>` shapes in an SVG scaled to fit (`__canvas` keeps the plan's aspect ratio),
 * names in an HTML layer on top (`__labels`, theme type at any scale) and device markers (`__marker`, buttons with
 * `onMarker`). Each room is a `g.mh-floor-plan__room` with `role="button"`: lit rooms (`.is-lit`, `--_level`) glow
 * in the lit-light colour, `.is-heat` / `.is-cool` take a warm or cool tint, `.is-alert` a danger outline. Alert,
 * selected and focus outlines are drawn in a ring layer above every room. One tab stop; arrow keys move to the
 * nearest room or marker in that direction, Home and End to the first and last, Enter or Space chooses.
 */
export function createFloorPlan(options: FloorPlanOptions): FloorPlanHandle {
  let o: FloorPlanOptions = { ...options };
  const glowId = floorPlanGlowId(uid('g'));
  const gradient = svg('radialGradient', { id: glowId, class: 'mh-floor-plan__gradient', cx: '50%', cy: '50%', r: '65%' });
  gradient.append(svg('stop', { offset: '0', class: 'mh-floor-plan__stop mh-floor-plan__stop--core' }), svg('stop', { offset: '1', class: 'mh-floor-plan__stop mh-floor-plan__stop--edge' }));
  const defs = svg('defs');
  defs.append(gradient);
  const roomsLayer = svg('g', { class: 'mh-floor-plan__rooms' });
  const ringsLayer = svg('g', { class: 'mh-floor-plan__rings', 'aria-hidden': 'true' });
  const plan = svg('svg', { class: 'mh-floor-plan__svg', preserveAspectRatio: 'xMidYMid meet' });
  plan.append(defs, roomsLayer, ringsLayer);
  const labels = h('div', { class: 'mh-floor-plan__labels', 'aria-hidden': 'true' });
  const markers = h('div', { class: 'mh-floor-plan__markers' });
  const canvas = h('div', { class: 'mh-floor-plan__canvas' }, plan, labels, markers);
  const el = h('div', { class: 'mh-floor-plan', role: 'group' }, canvas);
  const roomEls = new Map<string, { g: SVGGElement; shape: SVGPolygonElement; glow: SVGPolygonElement }>();
  const markerEls = new Map<string, HTMLElement>();
  let current: string | null = null;
  let focused: string | null = null;

  const stopEl = (s: FloorPlanStop): Element | undefined => (s.kind === 'room' ? roomEls.get(s.id)?.g : markerEls.get(s.id));

  const choose = (id: string): void => {
    const room = o.rooms.find((r) => r.id === id);
    if (!room || room.disabled) return;
    current = `room:${id}`;
    o.onRoom?.(id);
    render();
  };

  const render = (): void => {
    const b = o.bounds ?? floorPlanBounds(o.rooms, o.markers);
    el.setAttribute('aria-label', o.label);
    canvas.style.setProperty('aspect-ratio', `${b.width} / ${b.height}`);
    plan.setAttribute('viewBox', floorPlanViewBox(b));
    const stops = floorPlanStops(o);
    const tab = floorPlanTabStop(stops, current, o.selected);
    const tabKey = stops[tab] ? `${stops[tab].kind}:${stops[tab].id}` : null;

    for (const [id, r] of roomEls) {
      if (o.rooms.some((x) => x.id === id)) continue;
      r.g.remove();
      roomEls.delete(id);
    }
    const gs = o.rooms.map((room) => {
      let r = roomEls.get(room.id);
      if (!r) {
        const g = svg('g', { role: 'button' });
        g.addEventListener('click', () => choose(room.id));
        g.addEventListener('focus', () => {
          focused = floorPlanFocusVisible(g) ? room.id : null;
          current = `room:${room.id}`;
          render();
        });
        g.addEventListener('blur', () => {
          focused = null;
          render();
        });
        const shape = svg('polygon', { class: 'mh-floor-plan__shape' });
        const glow = svg('polygon', { class: 'mh-floor-plan__glow', fill: `url(#${glowId})` });
        g.append(shape);
        r = { g, shape, glow };
        roomEls.set(room.id, r);
      }
      const points = floorPlanPolygon(room.shape);
      const level = floorPlanLevel(room);
      r.g.setAttribute('class', floorPlanRoomClass(room, o.selected === room.id));
      r.g.setAttribute('aria-label', floorPlanRoomLabel(room));
      r.g.style.setProperty('--_level', String(level));
      if (o.selected === room.id) r.g.setAttribute('aria-current', 'true');
      else r.g.removeAttribute('aria-current');
      if (room.disabled) {
        r.g.setAttribute('aria-disabled', 'true');
        r.g.removeAttribute('tabindex');
      } else {
        r.g.removeAttribute('aria-disabled');
        r.g.setAttribute('tabindex', tabKey === `room:${room.id}` ? '0' : '-1');
      }
      r.shape.setAttribute('points', points);
      r.glow.setAttribute('points', points);
      if (level > 0) r.g.append(r.glow);
      else r.glow.remove();
      return r.g;
    });
    syncChildren(roomsLayer, gs);

    ringsLayer.replaceChildren(...floorPlanRings(o.rooms, o.selected, focused).map((ring) => svg('polygon', { class: `mh-floor-plan__ring mh-floor-plan__ring--${ring.kind}`, points: ring.points })));

    labels.hidden = o.showNames === false;
    labels.replaceChildren(
      ...(o.showNames === false
        ? []
        : o.rooms.map((room) => {
            const s = floorPlanLabelStyle(room, b);
            const label = h('span', { class: cx('mh-floor-plan__label', room.disabled && 'is-disabled') }, h('span', { class: 'mh-floor-plan__name' }, room.name), room.summary ? h('span', { class: 'mh-floor-plan__summary' }, room.summary) : null);
            label.style.left = s.left;
            label.style.top = s.top;
            label.style.maxWidth = s.maxWidth;
            return label;
          })),
    );

    const button = !!o.onMarker;
    const list = o.markers ?? [];
    for (const [id, m] of markerEls) {
      if (list.some((x) => x.id === id) && (m.tagName === 'BUTTON') === button) continue;
      m.remove();
      markerEls.delete(id);
    }
    const ms = list.map((m) => {
      let mel = markerEls.get(m.id);
      if (!mel) {
        if (button) {
          const b2 = h('button', { type: 'button' });
          b2.addEventListener('click', () => {
            current = `marker:${m.id}`;
            o.onMarker?.(m.id);
            render();
          });
          b2.addEventListener('focus', () => {
            current = `marker:${m.id}`;
            render();
          });
          mel = b2;
        } else mel = h('span', { role: 'img' });
        markerEls.set(m.id, mel);
      }
      const at = floorPlanPercent([m.x, m.y], b);
      mel.className = floorPlanMarkerClass(m, button);
      mel.setAttribute('aria-label', floorPlanMarkerLabel(m));
      if (button) {
        mel.setAttribute('title', floorPlanMarkerLabel(m));
        mel.setAttribute('tabindex', tabKey === `marker:${m.id}` ? '0' : '-1');
      }
      mel.style.left = `${at.left}%`;
      mel.style.top = `${at.top}%`;
      mel.replaceChildren(createIcon(m.icon));
      return mel;
    });
    syncChildren(markers, ms);
  };

  el.addEventListener('keydown', (event) => {
    const stops = floorPlanStops(o);
    const from = stops.findIndex((s) => stopEl(s) === event.target);
    if (from < 0) return;
    const stop = stops[from]!;
    if (stop.kind === 'room' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      choose(stop.id);
      return;
    }
    const to = floorPlanMove(stops, from, event.key);
    if (to === null) {
      if (event.key in DIRECTIONS) event.preventDefault();
      return;
    }
    event.preventDefault();
    const next = stops[to]!;
    current = `${next.kind}:${next.id}`;
    render();
    (stopEl(next) as HTMLElement | SVGElement | undefined)?.focus();
  });

  render();

  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
