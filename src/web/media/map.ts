import { mdiCrosshairsGps, mdiMinus, mdiPlus } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { iconButtonClass } from '../actions/iconButton.ts';
import { attachGestures, wheelZoomFactor, type GesturePoint } from './gestures.ts';
import { MAX_LATITUDE, formatScaleDistance, mercator, mercatorLatitude, metresPerWorldUnit, niceScaleDistance } from './geoMap.ts';
import { clamp } from './timecode.ts';

// A slippy map: square raster tiles in the Web Mercator tiling scheme, fetched from a URL template the caller
// supplies (nothing is fetched without one). At zoom z the world is `tileSize * 2^z` pixels square and split into
// 2^z x 2^z tiles, x east from longitude -180 and y south from latitude ~85.05. Positions use the "world units" of
// geoMap.ts (the world is the unit square). The view may be rotated: `bearing` is the compass direction at the top
// of the frame, clockwise from north.

/** `{z}`, `{x}` and `{y}` are replaced (for example `https://tiles.example/{z}/{x}/{y}.png`), or a function. */
export type MapTileSource = string | ((z: number, x: number, y: number) => string);

export type MapMarkerTone = 'accent' | 'neutral';

export interface MapMarker {
  lat: number;
  lon: number;
  label?: string | null;
  tone?: MapMarkerTone;
  icon?: IconName | string;
}

export interface MapView {
  lat: number;
  lon: number;
  zoom: number;
  /** Degrees clockwise from north at the top of the frame. */
  bearing: number;
}

export interface MapLabels {
  zoomIn: string;
  zoomOut: string;
  recentre: string;
  compass: (bearing: number) => string;
  hint: string;
  noTiles: string;
  roleDescription: string;
}

export const MAP_LABELS: MapLabels = {
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  recentre: 'Show all places',
  compass: (bearing) => (bearing ? `Reset to north (facing ${Math.round(bearing)}°)` : 'Facing north'),
  hint: 'Drag to pan, pinch or scroll to zoom. Keys: arrows pan, plus and minus zoom, Shift with left or right turns, N faces north.',
  noTiles: 'No map tiles set up',
  roleDescription: 'map',
};

export interface MapOptions {
  /** Accessible name ("Map of the garden"). */
  label: string;
  /** Where tiles come from; without one the map draws a plain grid and says so. */
  tiles?: MapTileSource | null;
  /** Tile edge in pixels (default 256). */
  tileSize?: number;
  /** Zoom levels the tile source has (default 0 to 19); past the top, tiles are scaled up. */
  tileMinZoom?: number;
  tileMaxZoom?: number;
  /** Credit the tile source asks for, shown in the corner. */
  attribution?: string | null;
  /** Starting view; without `center` the view fits the markers. */
  center?: { lat: number; lon: number } | null;
  zoom?: number;
  bearing?: number;
  minZoom?: number;
  maxZoom?: number;
  markers?: readonly MapMarker[];
  /** Zoom and recentre buttons (default true). */
  controls?: boolean;
  /** The compass (default true). */
  compass?: boolean;
  /** Scale bar (default true). */
  scale?: boolean;
  /** Two-finger twist and Shift + arrows turn the map (default true). */
  rotate?: boolean;
  /** Width / height (default 16 / 10). */
  aspect?: number;
  labels?: Partial<MapLabels>;
  onViewChange?: (view: MapView) => void;
  /** Makes markers buttons. */
  onMarkerSelect?: (marker: MapMarker, index: number) => void;
}

export interface MapHandle {
  el: HTMLDivElement;
  getView(): MapView;
  setView(view: Partial<MapView>): void;
  setMarkers(markers: readonly MapMarker[]): void;
  setTiles(tiles: MapTileSource | null, attribution?: string | null): void;
  zoomBy(delta: number): void;
  /** Fits the markers (or goes back to the starting view). */
  recentre(): void;
  /** Re-measures the frame (it also follows resizes by itself where ResizeObserver exists). */
  layout(): void;
  destroy(): void;
}

// Maths -----------------------------------------------------------------------------------------------------------

export const MAP_TILE_SIZE = 256;
export const MAP_ASPECT = 16 / 10;
const DEG = Math.PI / 180;

/** Pixels across the whole world at a (fractional) zoom. */
export function mapWorldSize(zoom: number, tileSize = MAP_TILE_SIZE): number {
  return tileSize * 2 ** zoom;
}

/** The tile holding a coordinate at an integer zoom. */
export function mapTileAt(lat: number, lon: number, z: number): { x: number; y: number } {
  const n = 2 ** z;
  const p = mercator(lat, lon);
  return { x: clamp(Math.floor(p.x * n), 0, n - 1), y: clamp(Math.floor(p.y * n), 0, n - 1) };
}

/** A tile's URL from the source. */
export function mapTileUrl(source: MapTileSource, z: number, x: number, y: number): string {
  if (typeof source === 'function') return source(z, x, y);
  return source.replace(/\{z\}/g, String(z)).replace(/\{x\}/g, String(x)).replace(/\{y\}/g, String(y));
}

/** Longitude in [-180, 180). */
export function wrapLongitude(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

/** Rotates a screen vector clockwise by `deg` (y points down). */
export function rotateVector(x: number, y: number, deg: number): GesturePoint {
  if (!deg) return { x, y };
  const c = Math.cos(deg * DEG);
  const s = Math.sin(deg * DEG);
  return { x: x * c - y * s, y: x * s + y * c };
}

export interface MapFrame {
  width: number;
  height: number;
  tileSize: number;
}

/** Screen position (frame pixels) of a coordinate; longitude takes the copy of the world nearest the centre. */
export function mapToScreen(lat: number, lon: number, view: MapView, frame: MapFrame): GesturePoint {
  const c = mercator(view.lat, view.lon);
  const p = mercator(lat, lon);
  let dx = p.x - c.x;
  dx -= Math.round(dx);
  const size = mapWorldSize(view.zoom, frame.tileSize);
  const v = rotateVector(dx * size, (p.y - c.y) * size, -view.bearing);
  return { x: frame.width / 2 + v.x, y: frame.height / 2 + v.y };
}

/** The coordinate under a screen position. */
export function mapFromScreen(x: number, y: number, view: MapView, frame: MapFrame): { lat: number; lon: number } {
  const c = mercator(view.lat, view.lon);
  const size = mapWorldSize(view.zoom, frame.tileSize);
  const v = rotateVector(x - frame.width / 2, y - frame.height / 2, view.bearing);
  const wx = c.x + v.x / size;
  const wy = clamp(c.y + v.y / size, 0, 1);
  return { lat: mercatorLatitude(wy), lon: wrapLongitude(wx * 360 - 180) };
}

/** The view after zooming to `zoom` with the point under `at` held still. */
export function mapZoomAround(view: MapView, zoom: number, at: GesturePoint, frame: MapFrame): MapView {
  const before = mapFromScreen(at.x, at.y, view, frame);
  const next = { ...view, zoom };
  const moved = mapToScreen(before.lat, before.lon, next, frame);
  return mapPan(next, moved.x - at.x, moved.y - at.y, frame);
}

/** The view after turning by `deg` about a screen point. */
export function mapRotateAround(view: MapView, deg: number, at: GesturePoint, frame: MapFrame): MapView {
  const before = mapFromScreen(at.x, at.y, view, frame);
  const next = { ...view, bearing: normaliseBearing(view.bearing + deg) };
  const moved = mapToScreen(before.lat, before.lon, next, frame);
  return mapPan(next, moved.x - at.x, moved.y - at.y, frame);
}

/** The view after the centre moves by a screen offset (`dx` > 0 brings the east into view). */
export function mapPan(view: MapView, dx: number, dy: number, frame: MapFrame): MapView {
  const c = mercator(view.lat, view.lon);
  const size = mapWorldSize(view.zoom, frame.tileSize);
  const v = rotateVector(dx, dy, view.bearing);
  const y = clamp(c.y + v.y / size, 0, 1);
  return { ...view, lat: clamp(mercatorLatitude(y), -MAX_LATITUDE, MAX_LATITUDE), lon: wrapLongitude((c.x + v.x / size) * 360 - 180) };
}

export function normaliseBearing(deg: number): number {
  const b = ((deg % 360) + 360) % 360;
  return b > 180 - 1e-9 ? b - 360 : b;
}

/** A view showing every marker with `padding` pixels to spare, no closer than `maxZoom`. */
export function mapFitView(markers: readonly Pick<MapMarker, 'lat' | 'lon'>[], frame: MapFrame, padding = 48, maxZoom = 17): MapView {
  const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon));
  if (!valid.length) return { lat: 20, lon: 0, zoom: Math.max(0, Math.log2(Math.max(frame.width, 1) / frame.tileSize)), bearing: 0 };
  const pts = valid.map((m) => mercator(m.lat, m.lon));
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const w = Math.max(1, frame.width - 2 * padding);
  const hgt = Math.max(1, frame.height - 2 * padding);
  const spanX = Math.max(maxX - minX, 1e-12);
  const spanY = Math.max(maxY - minY, 1e-12);
  const zoom = Math.min(maxZoom, Math.log2(Math.min(w / spanX, hgt / spanY) / frame.tileSize));
  return { lat: mercatorLatitude((minY + maxY) / 2), lon: (minX + maxX) / 2 * 360 - 180, zoom: Math.max(0, zoom), bearing: 0 };
}

export interface MapTile {
  /** Unique per drawn copy (`z/x/y`, x before wrapping). */
  key: string;
  z: number;
  /** Tile column after wrapping round the world, for the URL. */
  x: number;
  y: number;
  /** Column before wrapping, for placing. */
  column: number;
}

/** Integer tile zoom for a view zoom, inside the source's levels. */
export function mapTileZoom(zoom: number, min = 0, max = 19): number {
  return clamp(Math.round(zoom), min, max);
}

/** Tiles covering the frame (its circumscribed circle when the map is turned) at tile zoom `z`. */
export function mapTiles(view: MapView, frame: MapFrame, z: number): MapTile[] {
  const n = 2 ** z;
  const c = mercator(view.lat, view.lon);
  const size = mapWorldSize(view.zoom, frame.tileSize);
  const half = view.bearing ? Math.hypot(frame.width, frame.height) / 2 : 0;
  const rx = (view.bearing ? half : frame.width / 2) / size;
  const ry = (view.bearing ? half : frame.height / 2) / size;
  const x0 = Math.floor((c.x - rx) * n);
  const x1 = Math.floor((c.x + rx) * n);
  const y0 = Math.max(0, Math.floor((c.y - ry) * n));
  const y1 = Math.min(n - 1, Math.floor((c.y + ry) * n));
  const out: MapTile[] = [];
  for (let j = y0; j <= y1; j++)
    for (let i = x0; i <= x1; i++) {
      out.push({ key: `${z}/${i}/${j}`, z, x: ((i % n) + n) % n, y: j, column: i });
      if (out.length > 512) return out;
    }
  return out;
}

/** Where a tile goes, relative to the frame's centre before rotation: left, top and edge in pixels. */
export function mapTileBox(tile: Pick<MapTile, 'z' | 'column' | 'y'>, view: MapView, frame: MapFrame): { left: number; top: number; size: number } {
  const n = 2 ** tile.z;
  const c = mercator(view.lat, view.lon);
  const world = mapWorldSize(view.zoom, frame.tileSize);
  const size = world / n;
  return { left: (tile.column / n - c.x) * world, top: (tile.y / n - c.y) * world, size };
}

/** A scale bar no longer than `maxPx`, measured at the view's centre. */
export function mapScaleBar(view: MapView, tileSize = MAP_TILE_SIZE, maxPx = 96): { metres: number; text: string; px: number } {
  const perPx = metresPerWorldUnit(view.lat) / mapWorldSize(view.zoom, tileSize);
  const metres = niceScaleDistance(maxPx * perPx);
  return { metres, text: formatScaleDistance(metres), px: Math.round((metres / perPx) * 10) / 10 };
}

/** "Map: 3 places (Home, Workshop, Pier)". */
export function mapSummary(label: string, markers: readonly MapMarker[]): string {
  const valid = markers.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon));
  if (!valid.length) return label;
  const names = valid.map((m) => m.label?.trim()).filter(Boolean);
  return `${label}: ${valid.length} ${valid.length === 1 ? 'place' : 'places'}${names.length ? ` (${names.join(', ')})` : ''}`;
}

export function mapMarkerClass(tone: MapMarkerTone = 'accent'): string {
  return cx('mh-map__marker', tone === 'neutral' && 'mh-map__marker--neutral');
}

// Component -------------------------------------------------------------------------------------------------------

/** `mountMap` on a new `<div>`. */
export function createMap(options: MapOptions): MapHandle {
  return mountMap(h('div'), options);
}

const KEY_PAN = 64;
const COMPASS_PATH = 'M12 2 16 12H8Z';
const COMPASS_TAIL = 'M8 12H16L12 22Z';

/**
 * `.mh-map` (`--no-tiles`): a pannable, zoomable, turnable tile map. Tiles come only from the caller's `tiles`
 * source; without one a themed grid stands in and `__notice` says so, and missing tiles fall back to the same grid.
 * Parts: `__layer` (turned with the map) holding `__ground` and `__tiles` (`__tile`, `.is-loaded`); `__markers`
 * (`__marker`, `--neutral`, with `__pin` and `__marker-label`, upright at any bearing); `__controls` with zoom
 * buttons, recentre and `__compass` (`__needle` points north); `__scale` with `__scale-text`; `__attribution`.
 * The frame is focusable (`role="region"`, `aria-roledescription="map"`): arrows pan, + and − zoom, Shift + Left /
 * Right turn, N faces north. Builds into `root`.
 */
export function mountMap(root: HTMLDivElement, options: MapOptions): MapHandle {
  const labels = { ...MAP_LABELS, ...options.labels };
  const tileSize = options.tileSize ?? MAP_TILE_SIZE;
  const minZoom = options.minZoom ?? 1;
  const maxZoom = options.maxZoom ?? 20;
  const tileMin = options.tileMinZoom ?? 0;
  const tileMax = options.tileMaxZoom ?? 19;
  const canRotate = options.rotate !== false;
  let tiles: MapTileSource | null = options.tiles ?? null;
  let markers: readonly MapMarker[] = options.markers ?? [];
  const hintId = uid('mh-map-hint');

  const ground = h('div', { class: 'mh-map__ground' });
  const tileLayer = h('div', { class: 'mh-map__tiles' });
  const layer = h('div', { class: 'mh-map__layer', 'aria-hidden': 'true' }, ground, tileLayer);
  const markerLayer = h('div', { class: 'mh-map__markers' });
  const notice = h('div', { class: 'mh-map__notice', 'aria-hidden': 'true' }, labels.noTiles);
  const attribution = h('div', { class: 'mh-map__attribution' });
  const scaleText = h('span', { class: 'mh-map__scale-text' });
  const scaleBar = h('div', { class: 'mh-map__scale', 'aria-hidden': 'true' }, scaleText);
  const hint = h('span', { class: 'mh-visually-hidden', id: hintId }, labels.hint);

  const button = (label: string, icon: string, onClick: () => void): HTMLButtonElement =>
    h('button', { type: 'button', class: cx(iconButtonClass('default', 'small', true), 'mh-map__button'), 'aria-label': label, title: label, onClick: () => onClick() }, createIcon(icon));
  const needle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  needle.setAttribute('viewBox', '0 0 24 24');
  needle.setAttribute('class', 'mh-map__needle');
  needle.setAttribute('aria-hidden', 'true');
  for (const [d, cls] of [
    [COMPASS_PATH, 'mh-map__needle-north'],
    [COMPASS_TAIL, 'mh-map__needle-south'],
  ] as const) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', cls);
    needle.append(path);
  }
  const compass = options.compass === false ? null : h('button', { type: 'button', class: cx(iconButtonClass('default', 'small', true), 'mh-map__button', 'mh-map__compass') }, needle);
  compass?.addEventListener('click', () => setView({ bearing: 0 }));
  const controls =
    options.controls === false && !compass
      ? null
      : h(
          'div',
          { class: 'mh-map__controls' },
          options.controls === false ? null : button(labels.zoomIn, mdiPlus, () => zoomBy(1)),
          options.controls === false ? null : button(labels.zoomOut, mdiMinus, () => zoomBy(-1)),
          options.controls === false ? null : button(labels.recentre, mdiCrosshairsGps, () => recentre()),
          compass,
        );

  root.classList.add('mh-map');
  root.tabIndex = 0;
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', labels.roleDescription);
  root.setAttribute('aria-describedby', hintId);
  root.style.aspectRatio = String(options.aspect && options.aspect > 0 ? options.aspect : MAP_ASPECT);
  root.replaceChildren(...[layer, markerLayer, notice, controls, scaleBar, attribution, hint].filter((n): n is HTMLDivElement | HTMLSpanElement => n !== null));

  let frame: MapFrame = { width: 0, height: 0, tileSize };
  const measure = (): MapFrame => {
    const w = root.clientWidth;
    const hgt = root.clientHeight;
    // Unlaid-out frames (hidden, or a test document) get a nominal size so the maths stays finite.
    const width = w || 320;
    return { width, height: hgt || width / (options.aspect && options.aspect > 0 ? options.aspect : MAP_ASPECT), tileSize };
  };
  frame = measure();

  const initial = (): MapView => {
    if (options.center) return { lat: options.center.lat, lon: options.center.lon, zoom: options.zoom ?? 14, bearing: options.bearing ?? 0 };
    const fit = mapFitView(markers, frame, 48, Math.min(maxZoom, 17));
    return { ...fit, zoom: clamp(options.zoom ?? fit.zoom, minZoom, maxZoom), bearing: options.bearing ?? 0 };
  };
  let view: MapView = initial();
  view = { ...view, zoom: clamp(view.zoom, minZoom, maxZoom), bearing: normaliseBearing(view.bearing) };

  const imgs = new Map<string, HTMLImageElement>();
  let currentZ = -1;

  const paintTiles = (): void => {
    if (!tiles) {
      for (const img of imgs.values()) img.remove();
      imgs.clear();
      return;
    }
    const z = mapTileZoom(view.zoom, tileMin, tileMax);
    currentZ = z;
    const wanted = mapTiles(view, frame, z);
    const keys = new Set(wanted.map((t) => t.key));
    const source = tiles;
    for (const t of wanted) {
      let img = imgs.get(t.key);
      if (!img) {
        img = h('img', { class: 'mh-map__tile', alt: '', draggable: 'false', decoding: 'async' });
        img.dataset.z = String(t.z);
        img.dataset.column = String(t.column);
        img.dataset.y = String(t.y);
        const el = img;
        el.addEventListener('load', () => {
          el.classList.add('is-loaded');
          dropStale();
        });
        el.addEventListener('error', () => {
          el.classList.add('is-missing');
          dropStale();
        });
        el.src = mapTileUrl(source, t.z, t.x, t.y);
        imgs.set(t.key, el);
        tileLayer.append(el);
      }
    }
    // Tiles of another level stay underneath until this level has loaded, so zooming doesn't flash.
    for (const [key, img] of imgs) {
      if (keys.has(key)) continue;
      if (Number(img.dataset.z) === z) {
        img.remove();
        imgs.delete(key);
      } else img.classList.add('is-stale');
    }
    for (const img of imgs.values()) {
      const box = mapTileBox({ z: Number(img.dataset.z), column: Number(img.dataset.column), y: Number(img.dataset.y) }, view, frame);
      // A hair of overlap hides seams between scaled tiles.
      img.style.transform = `translate(${box.left}px, ${box.top}px)`;
      img.style.width = `${box.size + 0.5}px`;
      img.style.height = `${box.size + 0.5}px`;
    }
    dropStale();
  };
  function dropStale(): void {
    const current = [...imgs.values()].filter((i) => Number(i.dataset.z) === currentZ);
    if (current.some((i) => !i.classList.contains('is-loaded') && !i.classList.contains('is-missing'))) return;
    for (const [key, img] of imgs)
      if (Number(img.dataset.z) !== currentZ) {
        img.remove();
        imgs.delete(key);
      }
  }

  const paintGround = (): void => {
    // A grid anchored to the world: lines one scale-bar distance apart, so the ground moves with the map.
    const bar = mapScaleBar(view, tileSize);
    const c = mercator(view.lat, view.lon);
    const world = mapWorldSize(view.zoom, tileSize);
    const step = bar.px;
    const half = Math.hypot(frame.width, frame.height) / 2 + step;
    const ox = (((-c.x * world) % step) + step) % step;
    const oy = (((-c.y * world) % step) + step) % step;
    ground.style.left = `${-half}px`;
    ground.style.top = `${-half}px`;
    ground.style.width = `${half * 2}px`;
    ground.style.height = `${half * 2}px`;
    ground.style.backgroundSize = `${step}px ${step}px`;
    ground.style.backgroundPosition = `${(ox + half) % step}px ${(oy + half) % step}px`;
    scaleBar.style.width = `${bar.px}px`;
    scaleText.textContent = bar.text;
  };

  const paintMarkers = (): void => {
    const valid = markers.map((m, i) => ({ m, i })).filter(({ m }) => Number.isFinite(m.lat) && Number.isFinite(m.lon));
    markerLayer.replaceChildren(
      ...valid.map(({ m, i }) => {
        const p = mapToScreen(m.lat, m.lon, view, frame);
        const label = m.label?.trim() || null;
        const inside = p.x > -24 && p.y > -24 && p.x < frame.width + 24 && p.y < frame.height + 24;
        const parts = [h('span', { class: 'mh-map__pin', 'aria-hidden': 'true' }, m.icon ? createIcon(m.icon) : null), label ? h('span', { class: 'mh-map__marker-label' }, label) : null];
        const el = options.onMarkerSelect
          ? h('button', { type: 'button', class: mapMarkerClass(m.tone), 'aria-label': label ?? `Place ${i + 1}` }, ...parts)
          : h('span', { class: mapMarkerClass(m.tone), 'aria-hidden': 'true' }, ...parts);
        el.style.left = `${Math.round(p.x * 10) / 10}px`;
        el.style.top = `${Math.round(p.y * 10) / 10}px`;
        el.hidden = !inside;
        if (options.onMarkerSelect) el.addEventListener('click', () => options.onMarkerSelect!(m, i));
        return el;
      }),
    );
  };

  const paint = (): void => {
    layer.style.transform = `rotate(${-view.bearing}deg)`;
    root.classList.toggle('mh-map--no-tiles', !tiles);
    notice.hidden = !!tiles;
    attribution.hidden = !attribution.textContent;
    root.setAttribute('aria-label', mapSummary(options.label, markers));
    scaleBar.hidden = options.scale === false;
    if (compass) {
      needle.style.transform = `rotate(${-view.bearing}deg)`;
      const text = labels.compass(view.bearing);
      compass.setAttribute('aria-label', text);
      compass.title = text;
      compass.classList.toggle('is-turned', Math.abs(view.bearing) > 0.5);
    }
    paintGround();
    paintTiles();
    paintMarkers();
  };

  // Fitted to the markers until someone moves the view, so a resize (or the first real layout) refits.
  let autoFit = !options.center;
  const setView = (next: Partial<MapView>, keepFit = false): void => {
    if (!keepFit) autoFit = false;
    const merged = { ...view, ...next };
    const v: MapView = {
      lat: clamp(Number.isFinite(merged.lat) ? merged.lat : 0, -MAX_LATITUDE, MAX_LATITUDE),
      lon: wrapLongitude(Number.isFinite(merged.lon) ? merged.lon : 0),
      zoom: clamp(Number.isFinite(merged.zoom) ? merged.zoom : minZoom, minZoom, maxZoom),
      bearing: canRotate || next.bearing === 0 ? normaliseBearing(merged.bearing || 0) : view.bearing,
    };
    const changed = v.lat !== view.lat || v.lon !== view.lon || v.zoom !== view.zoom || v.bearing !== view.bearing;
    view = v;
    paint();
    if (changed) options.onViewChange?.({ ...view });
  };
  const centre = (): GesturePoint => ({ x: frame.width / 2, y: frame.height / 2 });
  const zoomTo = (zoom: number, at: GesturePoint): void => setView(mapZoomAround(view, clamp(zoom, minZoom, maxZoom), at, frame));
  function zoomBy(delta: number): void {
    zoomTo(Math.round((view.zoom + delta) * 2) / 2, centre());
  }
  function recentre(): void {
    setView(markers.length ? { ...mapFitView(markers, frame, 48, Math.min(maxZoom, 17)), bearing: 0 } : { ...initial(), bearing: 0 });
  }

  let twist = 0;
  const detach = attachGestures(root, {
    accept: (e) => !(e.target as Element).closest('button, a, .mh-map__controls, .mh-map__attribution'),
    onStart: () => {
      twist = 0;
      root.classList.add('is-dragging');
    },
    onEnd: () => root.classList.remove('is-dragging'),
    onPan: (dx, dy) => setView(mapPan(view, -dx, -dy, frame)),
    onPinch: (factor, at, rotation) => {
      let next = mapZoomAround(view, clamp(view.zoom + Math.log2(factor), minZoom, maxZoom), at, frame);
      if (canRotate) {
        // A small twist while pinching shouldn't turn the map; past a threshold it follows the fingers.
        twist += rotation;
        if (Math.abs(twist) > 12) next = mapRotateAround(next, rotation, at, frame);
      }
      setView(next);
    },
    onWheel: (e, at) => {
      e.preventDefault();
      zoomTo(view.zoom + Math.log2(wheelZoomFactor(e)), at);
    },
    onDoubleTap: (at) => zoomTo(Math.floor(view.zoom + 1), at),
  });
  const onKey = (e: KeyboardEvent): void => {
    if (e.target !== root || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.shiftKey && canRotate && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) setView(mapRotateAround(view, e.key === 'ArrowLeft' ? -15 : 15, centre(), frame));
    else if (e.key === 'ArrowLeft') setView(mapPan(view, -KEY_PAN, 0, frame));
    else if (e.key === 'ArrowRight') setView(mapPan(view, KEY_PAN, 0, frame));
    else if (e.key === 'ArrowUp') setView(mapPan(view, 0, -KEY_PAN, frame));
    else if (e.key === 'ArrowDown') setView(mapPan(view, 0, KEY_PAN, frame));
    else if (e.key === '+' || e.key === '=') zoomBy(1);
    else if (e.key === '-' || e.key === '_') zoomBy(-1);
    else if (e.key === 'n' || e.key === 'N') setView({ bearing: 0 });
    else return;
    e.preventDefault();
  };
  root.addEventListener('keydown', onKey);

  const setAttribution = (text: string | null | undefined): void => {
    attribution.textContent = text ?? '';
  };
  setAttribution(options.attribution);

  const layout = (): void => {
    frame = measure();
    if (autoFit) setView(initial(), true);
    else paint();
  };
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => layout()) : null;
  observer?.observe(root);
  paint();

  return {
    el: root,
    getView: () => ({ ...view }),
    setView: (next) => setView(next),
    setMarkers(next) {
      markers = next;
      paint();
    },
    setTiles(next, credit) {
      tiles = next;
      for (const img of imgs.values()) img.remove();
      imgs.clear();
      if (credit !== undefined) setAttribution(credit);
      paint();
    },
    zoomBy,
    recentre,
    layout,
    destroy() {
      detach();
      root.removeEventListener('keydown', onKey);
      observer?.disconnect();
    },
  };
}
