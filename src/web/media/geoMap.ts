import { mdiHome } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

// A map drawn from coordinates alone; no network unless the app passes a raster tile template. Positions use the Web Mercator projection in "world
// units" (the whole world is the unit square, x east from longitude -180, y south from latitude ~85.05), scaled
// into an SVG viewBox 1000 units wide. Places, names and the scale bar are HTML on top, positioned in percent, so
// dots stay round and text uses the theme's type at any size.

/** `home` draws a house marker (the place the map is relative to). */
export type GeoMapPointTone = 'accent' | 'neutral' | 'home';
export type GeoMapShapeTone = 'accent' | 'muted';
/** `all` fits everything; `focus` fits the points and accent shapes and shows muted shapes only as context. */
export type GeoMapFit = 'all' | 'focus';
/** `[lon, lat]`, in GeoJSON order. */
export type GeoMapPosition = readonly [number, number];
export type GeoMapRing = readonly GeoMapPosition[];

export interface GeoMapPoint {
  lat: number;
  lon: number;
  label?: string | null;
  /** Radius of the position's uncertainty in metres, drawn as a faint circle. */
  accuracy?: number | null;
  tone?: GeoMapPointTone;
}

export interface GeoMapCircle {
  lat: number;
  lon: number;
  /** Metres. */
  radius: number;
}

export interface GeoMapShape {
  name?: string | null;
  circle?: GeoMapCircle | null;
  /** Rings of `[lon, lat]`. Closed shapes fill with the even-odd rule, so inner rings are holes. */
  rings?: readonly GeoMapRing[];
  /** Lines (a route), not a filled area. */
  open?: boolean;
  /** `accent` for the areas the content is about (soft fill and outline), `muted` for context (dashed outline). */
  tone?: GeoMapShapeTone;
}

/** A raster tile background. The app chooses the server and must follow its usage policy. */
export interface GeoMapTiles {
  /** XYZ template with `{z}`, `{x}` and `{y}` ("https://tiles.example.org/{z}/{x}/{y}.png"). */
  url: string;
  /** Credit the tile server requires; always shown over the map, as text. */
  attribution: string;
  /** Deepest zoom the server has (default 19). */
  maxZoom?: number;
  /** Shallowest zoom to use (default 0). */
  minZoom?: number;
  /** Tile edge in pixels (default 256). */
  tileSize?: number;
}

export interface GeoMapData {
  points: readonly GeoMapPoint[];
  shapes: readonly GeoMapShape[];
  fit?: GeoMapFit;
  /** Width / height (default 16 / 10). */
  aspect?: number;
  /** Raster tiles under the drawing; off by default (then nothing is loaded). */
  tiles?: GeoMapTiles | null;
}

/** How the map is shown on screen, for choosing a tile zoom. */
export interface GeoMapDisplay {
  /** Rendered width in CSS pixels (default 360). */
  width?: number;
  /** Device pixels per CSS pixel (default 1). */
  dpr?: number;
}

export interface GeoMapOptions extends GeoMapData {
  /** Accessible name ("Map"); a summary of the contents is added. */
  label: string;
}

export interface GeoMapHandle {
  el: HTMLDivElement;
  /** Redraws with new options. */
  update(options: GeoMapOptions): void;
  /** Stops watching the element's size (only acted on with tiles). */
  destroy(): void;
}

// Projection ------------------------------------------------------------------------------------------------------

/** WGS 84 equatorial radius in metres, the sphere Web Mercator uses. */
export const EARTH_RADIUS = 6378137;
/** Latitude where Web Mercator's world becomes square. */
export const MAX_LATITUDE = 85.0511287798;
/** Default smallest span of the view, so a single place isn't zoomed in without end. */
export const GEO_MAP_MIN_SPAN = 300;
/** Smallest span with tiles: a single place shows its neighbourhood's streets. */
export const GEO_MAP_TILE_MIN_SPAN = 800;
/** Width assumed for choosing the tile zoom before the element has been measured. */
export const GEO_MAP_DISPLAY_WIDTH = 360;
/** Most tiles one view loads; past it the zoom steps out (or, at the minimum zoom, the tiles are left off). */
export const GEO_MAP_MAX_TILES = 64;
/** Default margin around the contents, as a share of each side. */
export const GEO_MAP_PADDING = 0.1;
/** Width of the viewBox; the height follows the aspect ratio. */
export const GEO_MAP_WIDTH = 1000;

const DEG = Math.PI / 180;
const clampLat = (lat: number): number => Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, lat));

/** Web Mercator in world units: (0, 0) is the north-west corner, (1, 1) the south-east. */
export function mercator(lat: number, lon: number): { x: number; y: number } {
  const phi = clampLat(lat) * DEG;
  return { x: (lon + 180) / 360, y: 0.5 - Math.log(Math.tan(Math.PI / 4 + phi / 2)) / (2 * Math.PI) };
}

/** Latitude of a world-unit y (the inverse of `mercator`). */
export function mercatorLatitude(y: number): number {
  return Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) / DEG;
}

/** Metres on the ground per world unit at a latitude (the parallel's circumference). */
export function metresPerWorldUnit(lat: number): number {
  return 2 * Math.PI * EARTH_RADIUS * Math.cos(clampLat(lat) * DEG);
}

/** A rectangle in world units. */
export interface GeoMapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface GeoMapProjectionOptions {
  /** Margin as a share of each side (default 0.1). */
  padding?: number;
  /** Smallest span in metres, across and down (default 300). */
  minSpan?: number;
}

export interface GeoMapProjection {
  /** Size of the viewBox. */
  width: number;
  height: number;
  /** viewBox units per world unit. */
  scale: number;
  /** World-unit rectangle the view shows. */
  view: GeoMapBounds;
  /** Latitude at the middle of the view. */
  centreLat: number;
  /** Ground metres per viewBox unit at the middle of the view. */
  metresPerUnit: number;
  /** True when nothing was given to fit (the whole world is shown). */
  empty: boolean;
  /** Position of a coordinate in the viewBox. */
  project(lat: number, lon: number): { x: number; y: number };
  /** Length in viewBox units of a distance in metres, measured at a latitude. */
  metres(distance: number, lat: number): number;
}

/**
 * Fits world-unit bounds into a `width` x `height` viewBox: grown to the minimum span, padded, centred, the same
 * scale both ways. `null` bounds show the whole world.
 */
export function geoMapProjection(bounds: GeoMapBounds | null, width: number, height: number, options: GeoMapProjectionOptions = {}): GeoMapProjection {
  const padding = options.padding ?? GEO_MAP_PADDING;
  const minSpan = options.minSpan ?? GEO_MAP_MIN_SPAN;
  const b = bounds ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const min = bounds ? minSpan / metresPerWorldUnit(mercatorLatitude(cy)) : 0;
  const spanX = Math.max(b.maxX - b.minX, min);
  const spanY = Math.max(b.maxY - b.minY, min);
  const inner = 1 - 2 * padding;
  const scale = Math.min((width * inner) / spanX, (height * inner) / spanY);
  const x0 = cx - width / 2 / scale;
  const y0 = cy - height / 2 / scale;
  const centreLat = mercatorLatitude(cy);
  return {
    width,
    height,
    scale,
    view: { minX: x0, minY: y0, maxX: x0 + width / scale, maxY: y0 + height / scale },
    centreLat,
    metresPerUnit: metresPerWorldUnit(centreLat) / scale,
    empty: bounds === null,
    project(lat, lon) {
      const p = mercator(lat, lon);
      return { x: (p.x - x0) * scale, y: (p.y - y0) * scale };
    },
    metres(distance, lat) {
      return (distance / metresPerWorldUnit(lat)) * scale;
    },
  };
}

// Scale bar -------------------------------------------------------------------------------------------------------

/** The largest 1, 2 or 5 x 10^n metres not above `max` (at least 1 m). */
export function niceScaleDistance(max: number): number {
  if (!(max >= 1)) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const step = [5, 2, 1].find((s) => s * power <= max) ?? 1;
  return step * power;
}

/** "500 m", "2 km". */
export function formatScaleDistance(metres: number): string {
  return metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
}

// Tiles -----------------------------------------------------------------------------------------------------------

/**
 * The tile zoom for a view: the deepest zoom whose tiles still show at least `tileSize / dpr` CSS pixels wide, so
 * they are sharp on the screen without loading more than it can show. `dpr` counts from 1 up to 2. Clamped to the
 * tile set's zoom range.
 */
export function geoMapTileZoom(scale: number, displayWidth: number, dpr: number, tiles: Pick<GeoMapTiles, 'minZoom' | 'maxZoom' | 'tileSize'> = {}): number {
  const minZoom = Math.max(0, Math.floor(tiles.minZoom ?? 0));
  const maxZoom = Math.max(minZoom, Math.floor(tiles.maxZoom ?? 19));
  const tileSize = tiles.tileSize && tiles.tileSize > 0 ? tiles.tileSize : 256;
  const ratio = Math.min(2, Math.max(1, Number.isFinite(dpr) ? dpr : 1));
  const worldCss = (scale * displayWidth) / GEO_MAP_WIDTH;
  const z = Math.floor(Math.log2((worldCss * ratio) / tileSize));
  return Math.max(minZoom, Math.min(maxZoom, Number.isFinite(z) ? z : minZoom));
}

/** The tiles covering a world-unit view at a zoom: x unwrapped (may run past the world), y kept inside it. */
export function geoMapTileRange(view: GeoMapBounds, zoom: number): { x0: number; x1: number; y0: number; y1: number } {
  const n = 2 ** zoom;
  return {
    x0: Math.floor(view.minX * n),
    x1: Math.ceil(view.maxX * n) - 1,
    y0: Math.max(0, Math.floor(view.minY * n)),
    y1: Math.min(n - 1, Math.ceil(view.maxY * n) - 1),
  };
}

/** A tile column wrapped into 0 .. 2^zoom - 1. */
export function geoMapWrapTileX(x: number, zoom: number): number {
  const n = 2 ** zoom;
  return ((x % n) + n) % n;
}

/** Fills `{z}`, `{x}` and `{y}` in a tile template. */
export function geoMapTileUrl(template: string, z: number, x: number, y: number): string {
  return template.replace(/\{z\}/g, String(z)).replace(/\{x\}/g, String(x)).replace(/\{y\}/g, String(y));
}

export interface GeoMapTile {
  z: number;
  /** Wrapped column, and row. */
  x: number;
  y: number;
  url: string;
  /** Box in percent of the map. */
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface GeoMapTileLayer {
  zoom: number;
  tiles: GeoMapTile[];
  attribution: string;
}

const r3 = (n: number): number => Math.round(n * 1000) / 1000;

/** The tiles a projected view needs, positioned in percent of the map, or null when there are none. */
export function geoMapTileLayer(proj: GeoMapProjection, tiles: GeoMapTiles, display: GeoMapDisplay = {}): GeoMapTileLayer | null {
  if (proj.empty || !tiles.url) return null;
  const width = display.width && display.width > 0 ? display.width : GEO_MAP_DISPLAY_WIDTH;
  const minZoom = Math.max(0, Math.floor(tiles.minZoom ?? 0));
  let zoom = geoMapTileZoom(proj.scale, width, display.dpr ?? 1, tiles);
  let range = geoMapTileRange(proj.view, zoom);
  const count = (r: typeof range): number => Math.max(0, r.x1 - r.x0 + 1) * Math.max(0, r.y1 - r.y0 + 1);
  while (count(range) > GEO_MAP_MAX_TILES && zoom > minZoom) range = geoMapTileRange(proj.view, --zoom);
  if (count(range) === 0 || count(range) > GEO_MAP_MAX_TILES) return null;
  const n = 2 ** zoom;
  const size = proj.scale / n;
  const out: GeoMapTile[] = [];
  for (let y = range.y0; y <= range.y1; y++)
    for (let x = range.x0; x <= range.x1; x++) {
      const wx = geoMapWrapTileX(x, zoom);
      out.push({
        z: zoom,
        x: wx,
        y,
        url: geoMapTileUrl(tiles.url, zoom, wx, y),
        left: r3((((x / n - proj.view.minX) * proj.scale) / proj.width) * 100),
        top: r3((((y / n - proj.view.minY) * proj.scale) / proj.height) * 100),
        width: r3((size / proj.width) * 100),
        height: r3((size / proj.height) * 100),
      });
    }
  return { zoom, tiles: out, attribution: tiles.attribution };
}

// Geometry --------------------------------------------------------------------------------------------------------

export interface GeoMapShapeGeometry {
  /** SVG path in viewBox units; areas fill even-odd. */
  d: string;
  kind: 'area' | 'line';
  tone: GeoMapShapeTone;
  name: string | null;
  /** Where the name goes, in percent of the map, or null when it doesn't fit. */
  nameAt: { x: number; y: number } | null;
}

export interface GeoMapPointGeometry {
  /** Percent of the map. */
  x: number;
  y: number;
  label: string | null;
  /** Which side of the dot the label sits on: `start` near the right edge. */
  side: 'start' | 'end';
  tone: GeoMapPointTone;
  /** Path of the accuracy circle, or ''. */
  accuracy: string;
}

export interface GeoMapScaleBar {
  metres: number;
  text: string;
  /** Percent of the map width. */
  width: number;
}

export interface GeoMapGeometry {
  width: number;
  height: number;
  viewBox: string;
  /** Faint grid lines one scale-bar distance apart, or ''. */
  grid: string;
  /** Muted shapes first, then accent areas, then accent lines. */
  shapes: GeoMapShapeGeometry[];
  points: GeoMapPointGeometry[];
  scale: GeoMapScaleBar | null;
  /** The raster tiles under the drawing, when `tiles` is set and there is something to show. */
  tiles: GeoMapTileLayer | null;
}

const r1 = (n: number): number => Math.round(n * 10) / 10;
const r2 = (n: number): number => Math.round(n * 100) / 100;
const finite = (...ns: number[]): boolean => ns.every((n) => Number.isFinite(n));

const validPoint = (p: GeoMapPoint): boolean => finite(p.lat, p.lon);
const validCircle = (c: GeoMapCircle | null | undefined): c is GeoMapCircle => !!c && finite(c.lat, c.lon, c.radius) && c.radius >= 0;
const validRings = (s: GeoMapShape): GeoMapRing[] =>
  (s.rings ?? []).map((ring) => ring.filter((p) => finite(p[0], p[1]))).filter((ring) => ring.length >= (s.open ? 2 : 3));
const hasGeometry = (s: GeoMapShape): boolean => validCircle(s.circle) || validRings(s).length > 0;

function growBox(box: GeoMapBounds | null, other: GeoMapBounds | null): GeoMapBounds | null {
  if (!other) return box;
  if (!box) return { ...other };
  return { minX: Math.min(box.minX, other.minX), minY: Math.min(box.minY, other.minY), maxX: Math.max(box.maxX, other.maxX), maxY: Math.max(box.maxY, other.maxY) };
}

function circleBox(lat: number, lon: number, radius: number): GeoMapBounds {
  const c = mercator(lat, lon);
  const rw = radius / metresPerWorldUnit(lat);
  return { minX: c.x - rw, minY: c.y - rw, maxX: c.x + rw, maxY: c.y + rw };
}

function shapeBox(s: GeoMapShape): GeoMapBounds | null {
  let box: GeoMapBounds | null = null;
  if (validCircle(s.circle)) box = circleBox(s.circle.lat, s.circle.lon, s.circle.radius);
  for (const ring of validRings(s)) for (const [lon, lat] of ring) {
    const p = mercator(lat, lon);
    box = growBox(box, { minX: p.x, minY: p.y, maxX: p.x, maxY: p.y });
  }
  return box;
}

function pointBox(p: GeoMapPoint): GeoMapBounds {
  return circleBox(p.lat, p.lon, p.accuracy && p.accuracy > 0 ? p.accuracy : 0);
}

/** World-unit bounds of what the view has to show, or null when there is nothing. */
export function geoMapBounds(points: readonly GeoMapPoint[], shapes: readonly GeoMapShape[], fit: GeoMapFit = 'all'): GeoMapBounds | null {
  const pts = points.filter(validPoint);
  const all = shapes.filter(hasGeometry);
  const focusShapes = fit === 'focus' ? all.filter((s) => (s.tone ?? 'accent') === 'accent') : all;
  const fitShapes = fit === 'focus' && pts.length === 0 && focusShapes.length === 0 ? all : focusShapes;
  let box: GeoMapBounds | null = null;
  for (const p of pts) box = growBox(box, pointBox(p));
  for (const s of fitShapes) box = growBox(box, shapeBox(s));
  return box;
}

const intersects = (a: GeoMapBounds, b: GeoMapBounds): boolean => a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;

/** A full circle as a path (two arcs). */
function circlePath(x: number, y: number, radius: number): string {
  const rr = r1(radius);
  return `M${r1(x - radius)} ${r1(y)}a${rr} ${rr} 0 1 0 ${r1(2 * radius)} 0a${rr} ${rr} 0 1 0 ${r1(-2 * radius)} 0Z`;
}

/** Rough room a name needs (and the area it covers): characters at caption size on a phone-width map, as a share of the map width. */
const NAME_CHAR = 0.016;
const NAME_HEIGHT = 0.04;
/** Past this share of the width, a point's label goes on the left. */
const LABEL_FLIP = 0.7;
/** Labelled places closer than this (percent of the map's width and height) share one label ("Sam, Kai"). */
const LABEL_MERGE_X = 8;
const LABEL_MERGE_Y = 7;

/** Labels of places drawn on top of each other merged into the first one's, so names never overlap. */
function mergeLabels(points: GeoMapPointGeometry[]): GeoMapPointGeometry[] {
  const out = points.map((p) => ({ ...p }));
  for (let i = 0; i < out.length; i++) {
    const p = out[i]!;
    if (!p.label) continue;
    const near = out.slice(0, i).find((q) => q.label && Math.abs(q.x - p.x) < LABEL_MERGE_X && Math.abs(q.y - p.y) < LABEL_MERGE_Y);
    if (!near) continue;
    if (!near.label!.split(', ').includes(p.label)) near.label = `${near.label}, ${p.label}`;
    p.label = null;
  }
  return out;
}

/** Pure geometry of a map: SVG paths, positions of places and names, the scale bar and any tiles. */
export function geoMapGeometry(data: GeoMapData, display: GeoMapDisplay = {}): GeoMapGeometry {
  const aspect = data.aspect && data.aspect > 0 && Number.isFinite(data.aspect) ? data.aspect : 16 / 10;
  const width = GEO_MAP_WIDTH;
  const height = r1(width / aspect);
  const fit = data.fit ?? 'all';
  const proj = geoMapProjection(geoMapBounds(data.points, data.shapes, fit), width, height, data.tiles ? { minSpan: GEO_MAP_TILE_MIN_SPAN } : {});
  const tiles = data.tiles ? geoMapTileLayer(proj, data.tiles, display) : null;
  const pct = (v: number, of: number): number => r2((v / of) * 100);

  const placed = data.points.filter(validPoint).map((p) => proj.project(p.lat, p.lon));
  const shapes: GeoMapShapeGeometry[] = [];
  // Names already placed, in viewBox units, so two never overlap.
  const names: { x: number; y: number; w: number }[] = [];
  const drawShape = (s: GeoMapShape): GeoMapShapeGeometry | null => {
    const box = shapeBox(s);
    if (!box || !intersects(box, proj.view)) return null;
    const parts: string[] = [];
    if (validCircle(s.circle)) {
      const c = proj.project(s.circle.lat, s.circle.lon);
      parts.push(circlePath(c.x, c.y, proj.metres(s.circle.radius, s.circle.lat)));
    }
    for (const ring of validRings(s)) {
      const path = ring
        .map(([lon, lat], i) => {
          const p = proj.project(lat, lon);
          return `${i ? 'L' : 'M'}${r1(p.x)} ${r1(p.y)}`;
        })
        .join('');
      parts.push(s.open ? path : `${path}Z`);
    }
    const name = s.name?.trim() || null;
    let nameAt: { x: number; y: number } | null = null;
    if (name) {
      const centre = validCircle(s.circle) ? mercator(s.circle.lat, s.circle.lon) : { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
      const x = (centre.x - proj.view.minX) * proj.scale;
      const y = (centre.y - proj.view.minY) * proj.scale;
      const w = (box.maxX - box.minX) * proj.scale;
      const hgt = (box.maxY - box.minY) * proj.scale;
      const nameW = name.length * NAME_CHAR * width;
      const nameH = NAME_HEIGHT * width;
      const fits = w >= nameW && hgt >= nameH;
      // Too small to hold its name, a circle (a zone) is named just below itself.
      const ny = fits || !validCircle(s.circle) ? y : y + hgt / 2 + nameH * 0.6;
      // A place drawn where the name would go wins (the name would cover its dot), and so does a name already there.
      const covers =
        placed.some((p) => Math.abs(p.x - x) < nameW / 2 && Math.abs(p.y - ny) < nameH) ||
        names.some((n) => Math.abs(n.x - x) < (nameW + n.w) / 2 && Math.abs(n.y - ny) < nameH);
      if ((fits || validCircle(s.circle)) && !covers && x >= 0 && x <= width && ny >= 0 && ny <= height) {
        nameAt = { x: pct(x, width), y: pct(ny, height) };
        names.push({ x, y: ny, w: nameW });
      }
    }
    return { d: parts.join(''), kind: s.open ? 'line' : 'area', tone: s.tone ?? 'accent', name, nameAt };
  };
  const drawn = data.shapes.filter(hasGeometry);
  const order = [...drawn.filter((s) => s.tone === 'muted'), ...drawn.filter((s) => s.tone !== 'muted' && !s.open), ...drawn.filter((s) => s.tone !== 'muted' && s.open)];
  // Names go to the shapes the content is about first, then to the context.
  const named = [...order.filter((s) => s.tone !== 'muted'), ...order.filter((s) => s.tone === 'muted')];
  const drawnBy = new Map(named.map((s) => [s, drawShape(s)] as const));
  for (const s of order) {
    const g = drawnBy.get(s);
    if (g) shapes.push(g);
  }

  const points: GeoMapPointGeometry[] = mergeLabels(data.points.filter(validPoint).map((p) => {
    const c = proj.project(p.lat, p.lon);
    const accuracy = p.accuracy && p.accuracy > 0 && Number.isFinite(p.accuracy) ? circlePath(c.x, c.y, proj.metres(p.accuracy, p.lat)) : '';
    const point: GeoMapPointGeometry = { x: pct(c.x, width), y: pct(c.y, height), label: p.label?.trim() || null, side: c.x > width * LABEL_FLIP ? 'start' : 'end', tone: p.tone ?? 'accent', accuracy };
    return point;
  }));

  let scale: GeoMapScaleBar | null = null;
  let grid = '';
  if (!proj.empty) {
    const metres = niceScaleDistance((width / 4) * proj.metresPerUnit);
    const barUnits = metres / proj.metresPerUnit;
    scale = { metres, text: formatScaleDistance(metres), width: pct(barUnits, width) };
    // Grid squares one scale distance wide, anchored to the world so they stay put when the view moves.
    const step = metres / metresPerWorldUnit(proj.centreLat);
    const lines: string[] = [];
    for (let k = Math.ceil(proj.view.minX / step); k * step <= proj.view.maxX; k++) lines.push(`M${r1((k * step - proj.view.minX) * proj.scale)} 0V${height}`);
    for (let k = Math.ceil(proj.view.minY / step); k * step <= proj.view.maxY; k++) lines.push(`M0 ${r1((k * step - proj.view.minY) * proj.scale)}H${width}`);
    // The streets replace the grid.
    grid = tiles ? '' : lines.join('');
  }

  return { width, height, viewBox: `0 0 ${width} ${height}`, grid, shapes, points, scale, tiles };
}

// Summary and classes ---------------------------------------------------------------------------------------------

const count = (n: number, one: string, many: string, names: string[]): string => `${n} ${n === 1 ? one : many}${names.length ? ` (${names.join(', ')})` : ''}`;

/** The accessible text: "Map: 2 places (Sam, Kai), 1 area (Park), 1 route". */
export function geoMapSummary(label: string, points: readonly GeoMapPoint[], shapes: readonly GeoMapShape[]): string {
  const pts = points.filter(validPoint);
  const drawn = shapes.filter(hasGeometry);
  const areas = drawn.filter((s) => !s.open);
  const routes = drawn.filter((s) => s.open);
  const names = (texts: (string | null | undefined)[]): string[] => texts.map((t) => t?.trim() ?? '').filter(Boolean);
  const parts: string[] = [];
  if (pts.length) parts.push(count(pts.length, 'place', 'places', names(pts.map((p) => p.label))));
  if (areas.length) parts.push(count(areas.length, 'area', 'areas', names(areas.map((s) => s.name))));
  if (routes.length) parts.push(count(routes.length, 'route', 'routes', names(routes.map((s) => s.name))));
  return `${label}: ${parts.length ? parts.join(', ') : 'nothing to show'}`;
}

export function geoMapClass(tiles: boolean): string {
  return cx('mh-geo-map', tiles && 'mh-geo-map--tiles');
}

/** Box of a tile, in percent; a hair larger so neighbouring tiles leave no seam. */
export function geoMapTileStyle(t: Pick<GeoMapTile, 'left' | 'top' | 'width' | 'height'>): { left: string; top: string; width: string; height: string } {
  return { left: `${t.left}%`, top: `${t.top}%`, width: `calc(${t.width}% + 0.5px)`, height: `calc(${t.height}% + 0.5px)` };
}

export function geoMapShapeClass(shape: Pick<GeoMapShapeGeometry, 'kind' | 'tone'>): string {
  return cx('mh-geo-map__shape', `mh-geo-map__shape--${shape.tone}`, shape.kind === 'line' && 'mh-geo-map__shape--line');
}

export function geoMapPointClass(tone: GeoMapPointTone): string {
  return cx('mh-geo-map__point', tone !== 'accent' && `mh-geo-map__point--${tone}`);
}

/** The icon inside a point's marker (a house for `home`), or null for a plain dot. */
export function geoMapPointIcon(tone: GeoMapPointTone): string | null {
  return tone === 'home' ? mdiHome : null;
}

export function geoMapAccuracyClass(tone: GeoMapPointTone): string {
  return cx('mh-geo-map__accuracy', tone !== 'accent' && 'mh-geo-map__accuracy--neutral');
}

export function geoMapLabelClass(side: 'start' | 'end'): string {
  return cx('mh-geo-map__label', side === 'start' && 'mh-geo-map__label--start');
}

/** CSS `aspect-ratio` of the root, matching the viewBox. */
export function geoMapAspect(g: Pick<GeoMapGeometry, 'width' | 'height'>): string {
  return `${g.width} / ${g.height}`;
}

const at = (p: { x: number; y: number }): string => `left: ${p.x}%; top: ${p.y}%`;

// Component -------------------------------------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

const devicePixelRatio = (): number => (typeof window !== 'undefined' && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1);

/**
 * `.mh-geo-map`: places, areas and routes drawn from coordinates on a plain themed background. Web Mercator,
 * fitted to the contents (or, with `fit: 'focus'`, to the places and accent shapes, muted shapes shown as
 * context). Nothing is loaded unless `tiles` is set: then `--tiles` adds a `__tiles` layer of `<img
 * class="__tile">` under the drawing (toned by `--mh-geo-map-tile-filter`), drops the grid and shows
 * `__attribution`. Parts: `__svg` with `__grid`, `__shape` (`--accent | --muted`, `--line`) and `__accuracy`;
 * HTML `__name`, `__point` (`--neutral`, `--home` with a house icon), `__label` (`--start` near the right edge;
 * places drawn on top of each other share one label) and `__scale` with `__scale-text`. `role="img"` with a
 * summary of the contents.
 */
export function createGeoMap(options: GeoMapOptions): GeoMapHandle {
  const el = h('div', { class: 'mh-geo-map', role: 'img' });
  let current = options;
  let zoom: number | null = null;
  const measure = (): GeoMapDisplay => ({ width: el.getBoundingClientRect().width || GEO_MAP_DISPLAY_WIDTH, dpr: devicePixelRatio() });
  const update = (next: GeoMapOptions): void => {
    current = next;
    const g = geoMapGeometry(next, next.tiles ? measure() : {});
    zoom = g.tiles?.zoom ?? null;
    el.classList.toggle('mh-geo-map--tiles', !!g.tiles);
    el.setAttribute('aria-label', geoMapSummary(next.label, next.points, next.shapes));
    el.style.aspectRatio = geoMapAspect(g);
    const svg = svgEl('svg', { class: 'mh-geo-map__svg', viewBox: g.viewBox, 'aria-hidden': 'true' });
    if (g.grid) svg.append(svgEl('path', { class: 'mh-geo-map__grid', d: g.grid, 'vector-effect': 'non-scaling-stroke' }));
    for (const s of g.shapes) svg.append(svgEl('path', { class: geoMapShapeClass(s), d: s.d, 'vector-effect': 'non-scaling-stroke' }));
    for (const p of g.points) if (p.accuracy) svg.append(svgEl('path', { class: geoMapAccuracyClass(p.tone), d: p.accuracy, 'vector-effect': 'non-scaling-stroke' }));
    const overlay: HTMLElement[] = [];
    for (const s of g.shapes) if (s.name && s.nameAt) overlay.push(h('span', { class: 'mh-geo-map__name', 'aria-hidden': 'true', style: at(s.nameAt) }, s.name));
    for (const p of g.points) {
      const icon = geoMapPointIcon(p.tone);
      overlay.push(h('span', { class: geoMapPointClass(p.tone), 'aria-hidden': 'true', style: at(p) }, ...(icon ? [createIcon(icon)] : [])));
      if (p.label) overlay.push(h('span', { class: geoMapLabelClass(p.side), 'aria-hidden': 'true', style: at(p) }, p.label));
    }
    if (g.scale) overlay.push(h('span', { class: 'mh-geo-map__scale', 'aria-hidden': 'true', style: `width: ${g.scale.width}%` }, h('span', { class: 'mh-geo-map__scale-text' }, g.scale.text)));
    if (!g.tiles) {
      el.replaceChildren(svg, ...overlay);
      return;
    }
    const layer = h('div', { class: 'mh-geo-map__tiles', 'aria-hidden': 'true' });
    for (const t of g.tiles.tiles) {
      const img = h('img', { class: 'mh-geo-map__tile', alt: '', loading: 'lazy', decoding: 'async', draggable: 'false' });
      Object.assign(img.style, geoMapTileStyle(t));
      img.src = t.url;
      layer.append(img);
    }
    // Text, never markup: the credit comes from the app.
    el.replaceChildren(layer, svg, ...overlay, h('span', { class: 'mh-geo-map__attribution' }, g.tiles.attribution));
  };
  // The zoom follows the rendered width; tiles are chosen again only when it changes.
  const observer =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(() => {
          if (!current.tiles) return;
          const next = geoMapGeometry(current, measure()).tiles?.zoom ?? null;
          if (next !== zoom) update(current);
        })
      : null;
  observer?.observe(el);
  update(options);
  return {
    el,
    update,
    destroy() {
      observer?.disconnect();
    },
  };
}
