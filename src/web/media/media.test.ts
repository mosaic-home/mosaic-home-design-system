import { describe, expect, it } from 'vitest';
import {
  EARTH_RADIUS,
  GEO_MAP_MAX_TILES,
  createGeoMap,
  formatScaleDistance,
  geoMapBounds,
  geoMapGeometry,
  geoMapProjection,
  geoMapSummary,
  geoMapTileRange,
  geoMapTileUrl,
  geoMapTileZoom,
  geoMapWrapTileX,
  mercator,
  mercatorLatitude,
  metresPerWorldUnit,
  niceScaleDistance,
  type GeoMapShape,
} from './index.ts';

const EQUATOR = 2 * Math.PI * EARTH_RADIUS;

describe('Web Mercator', () => {
  it('projects known points into the unit world', () => {
    expect(mercator(0, 0)).toEqual({ x: 0.5, y: 0.5 });
    expect(mercator(0, -180).x).toBe(0);
    expect(mercator(0, 180).x).toBe(1);
    expect(mercator(0, 90).x).toBe(0.75);
    expect(mercator(85.0511287798, 0).y).toBeCloseTo(0, 9);
    expect(mercator(-85.0511287798, 0).y).toBeCloseTo(1, 9);
    // Latitudes past the limit are clamped, not infinite.
    expect(mercator(90, 0).y).toBeCloseTo(0, 9);
    // y = 0.5 - ln(tan(45° + 22.5°)) / 2π for 45° north.
    expect(mercator(45, 0).y).toBeCloseTo(0.5 - Math.log(Math.tan((67.5 * Math.PI) / 180)) / (2 * Math.PI), 12);
  });

  it('inverts latitude', () => {
    for (const lat of [-60, -12.5, 0, 33.3, 51, 80]) expect(mercatorLatitude(mercator(lat, 0).y)).toBeCloseTo(lat, 9);
  });

  it('measures ground metres per world unit by latitude', () => {
    expect(metresPerWorldUnit(0)).toBeCloseTo(EQUATOR, 3);
    expect(metresPerWorldUnit(60)).toBeCloseTo(EQUATOR / 2, 3);
  });
});

describe('fitting the view', () => {
  it('centres and fits bounds with padding, the same scale both ways', () => {
    const a = mercator(0, 0);
    const b = mercator(1, 1);
    const p = geoMapProjection({ minX: a.x, minY: b.y, maxX: b.x, maxY: a.y }, 1000, 500, { padding: 0.1 });
    // Square content in a 2:1 view: height decides; 80% of 500 units.
    expect((a.y - b.y) * p.scale).toBeCloseTo(400, 6);
    expect(p.project(0, 0).y).toBeCloseTo(450, 6);
    expect(p.project(1, 1).y).toBeCloseTo(50, 6);
    expect(p.project(0.5, 0.5).x).toBeCloseTo(500, 1);
    expect(p.empty).toBe(false);
  });

  it('keeps a minimum span around a single point', () => {
    const c = mercator(51, 7);
    const p = geoMapProjection({ minX: c.x, minY: c.y, maxX: c.x, maxY: c.y }, 1000, 1000, { padding: 0, minSpan: 300 });
    expect(p.project(51, 7).x).toBeCloseTo(500, 6);
    expect(p.project(51, 7).y).toBeCloseTo(500, 6);
    // 300 m across the whole width.
    expect(p.metresPerUnit * 1000).toBeCloseTo(300, 3);
    expect(p.metres(300, 51)).toBeCloseTo(1000, 1);
  });

  it('converts metres with the latitude', () => {
    const at = (lat: number) => {
      const c = mercator(lat, 0);
      return geoMapProjection({ minX: c.x - 0.001, minY: c.y - 0.001, maxX: c.x + 0.001, maxY: c.y + 0.001 }, 1000, 1000);
    };
    const eq = at(0);
    const north = at(60);
    expect(eq.scale).toBeCloseTo(north.scale, 6);
    // The same 100 m is twice as long on the map at 60°.
    expect(north.metres(100, 60) / eq.metres(100, 0)).toBeCloseTo(2, 6);
  });

  it('shows the whole world when there is nothing', () => {
    expect(geoMapBounds([], [])).toBeNull();
    const p = geoMapProjection(null, 1000, 1000, { padding: 0 });
    expect(p.empty).toBe(true);
    expect(p.project(0, -180).x).toBeCloseTo(0, 6);
    expect(p.project(0, 180).x).toBeCloseTo(1000, 6);
  });

  it('fits points with their accuracy and, in focus, only accent shapes', () => {
    const far: GeoMapShape = { tone: 'muted', circle: { lat: 10, lon: 10, radius: 100 } };
    const point = { lat: 0, lon: 0, accuracy: 1000 };
    const all = geoMapBounds([point], [far])!;
    const focus = geoMapBounds([point], [far], 'focus')!;
    expect(all.maxX).toBeGreaterThan(mercator(0, 10).x - 0.0001);
    expect(focus.maxX - focus.minX).toBeCloseTo((2 * 1000) / EQUATOR, 9);
    // With nothing to focus on, focus falls back to everything.
    expect(geoMapBounds([], [far], 'focus')).not.toBeNull();
  });
});

describe('scale bar', () => {
  it('picks 1, 2 or 5 x 10^n metres', () => {
    expect(niceScaleDistance(0.4)).toBe(1);
    expect(niceScaleDistance(1)).toBe(1);
    expect(niceScaleDistance(1.9)).toBe(1);
    expect(niceScaleDistance(4.99)).toBe(2);
    expect(niceScaleDistance(75)).toBe(50);
    expect(niceScaleDistance(180)).toBe(100);
    expect(niceScaleDistance(2500)).toBe(2000);
    expect(niceScaleDistance(1_000_000)).toBe(1_000_000);
    expect(formatScaleDistance(500)).toBe('500 m');
    expect(formatScaleDistance(2000)).toBe('2 km');
  });

  it('is about a quarter of the width', () => {
    const g = geoMapGeometry({ points: [{ lat: 51, lon: 7 }], shapes: [] });
    expect(g.scale!.width).toBeGreaterThan(10);
    expect(g.scale!.width).toBeLessThanOrEqual(25);
    expect(geoMapGeometry({ points: [], shapes: [] }).scale).toBeNull();
  });
});

describe('geometry', () => {
  const ring: [number, number][] = [
    [0, 0],
    [0.01, 0],
    [0.01, 0.01],
    [0, 0.01],
  ];
  const hole: [number, number][] = [
    [0.004, 0.004],
    [0.006, 0.004],
    [0.006, 0.006],
  ];

  it('draws rings as closed sub-paths, routes open, circles as arcs', () => {
    const g = geoMapGeometry({
      points: [],
      shapes: [
        { name: 'Park', rings: [ring, hole] },
        { name: 'Walk', open: true, rings: [ring] },
        { name: 'Zone', tone: 'muted', circle: { lat: 0.005, lon: 0.005, radius: 100 } },
      ],
    });
    expect(g.shapes.map((s) => [s.tone, s.kind])).toEqual([
      ['muted', 'area'],
      ['accent', 'area'],
      ['accent', 'line'],
    ]);
    expect(g.shapes[1]!.d.match(/Z/g)).toHaveLength(2);
    expect(g.shapes[2]!.d).not.toContain('Z');
    expect(g.shapes[0]!.d).toMatch(/^M[\d.]+ [\d.]+a[\d.]+ [\d.]+ 0 1 0/);
    expect(g.shapes[1]!.nameAt).toEqual({ x: 50, y: 50 });
  });

  it('places point labels, flipping near the right edge', () => {
    const g = geoMapGeometry({ points: [{ lat: 0, lon: 0, label: 'A' }, { lat: 0, lon: 0.01, label: 'B', accuracy: 20, tone: 'neutral' }], shapes: [] });
    expect(g.points[0]!.side).toBe('end');
    expect(g.points[1]!.side).toBe('start');
    expect(g.points[1]!.accuracy).not.toBe('');
    expect(g.points[0]!.accuracy).toBe('');
  });

  it('hides names that do not fit and muted shapes outside the focus', () => {
    const tiny: GeoMapShape = { name: 'A very long name for a tiny area', tone: 'muted', circle: { lat: 0, lon: 0, radius: 5 } };
    const far: GeoMapShape = { tone: 'muted', circle: { lat: 5, lon: 5, radius: 100 } };
    const g = geoMapGeometry({ points: [{ lat: 0, lon: 0.02 }], shapes: [tiny, far], fit: 'all' });
    expect(g.shapes[0]!.nameAt).toBeNull();
    const zone: GeoMapShape = { name: 'Home', tone: 'muted', circle: { lat: 0, lon: 0, radius: 500 } };
    expect(geoMapGeometry({ points: [], shapes: [zone] }).shapes[0]!.nameAt).toEqual({ x: 50, y: 50 });
    expect(geoMapGeometry({ points: [{ lat: 0, lon: 0 }], shapes: [zone] }).shapes[0]!.nameAt).toBeNull();
    const focus = geoMapGeometry({ points: [{ lat: 0, lon: 0 }], shapes: [far, tiny], fit: 'focus' });
    expect(focus.shapes).toHaveLength(1);
  });

  it('ignores bad coordinates and uses the aspect', () => {
    const g = geoMapGeometry({ points: [{ lat: Number.NaN, lon: 0 }], shapes: [{ rings: [[[0, 0]]] }], aspect: 2 });
    expect(g.points).toEqual([]);
    expect(g.shapes).toEqual([]);
    expect(g.viewBox).toBe('0 0 1000 500');
  });
});

describe('geo map', () => {
  it('summarises the contents and draws the parts', () => {
    expect(geoMapSummary('Map', [], [])).toBe('Map: nothing to show');
    const options = {
      label: 'Map',
      points: [{ lat: 0, lon: 0, label: 'Sam', accuracy: 30 }, { lat: 0.001, lon: 0.001 }],
      shapes: [{ name: 'Park', rings: [[[0, 0], [0.002, 0], [0.002, 0.002]]] as [number, number][][] }, { open: true, rings: [[[0, 0], [0.001, 0.001]]] as [number, number][][] }],
    };
    const m = createGeoMap(options);
    expect(m.el.className).toBe('mh-geo-map');
    expect(m.el.getAttribute('role')).toBe('img');
    expect(m.el.getAttribute('aria-label')).toBe('Map: 2 places (Sam), 1 area (Park), 1 route');
    expect(m.el.querySelectorAll('.mh-geo-map__point')).toHaveLength(2);
    expect(m.el.querySelectorAll('.mh-geo-map__label')).toHaveLength(1);
    expect(m.el.querySelector('.mh-geo-map__accuracy')).not.toBeNull();
    expect(m.el.querySelector('.mh-geo-map__shape--line')).not.toBeNull();
    expect(m.el.querySelector('.mh-geo-map__scale-text')!.textContent).toMatch(/ m$/);
    expect(m.el.querySelector('svg')!.getAttribute('viewBox')).toBe('0 0 1000 625');
    m.update({ label: 'Map', points: [], shapes: [] });
    expect(m.el.querySelector('.mh-geo-map__point')).toBeNull();
    expect(m.el.querySelector('.mh-geo-map__scale')).toBeNull();
    expect(m.el.getAttribute('aria-label')).toBe('Map: nothing to show');
  });

  it('never loads anything: no images, links or external references', () => {
    const m = createGeoMap({ label: 'Map', points: [{ lat: 0, lon: 0, label: 'A' }], shapes: [{ circle: { lat: 0, lon: 0, radius: 50 } }] });
    expect(m.el.querySelector('img, image, use, link, iframe, object')).toBeNull();
    expect(m.el.outerHTML).not.toMatch(/href|src=|url\(/);
  });
});

describe('tiles', () => {
  const TILES = { url: 'https://tiles.example.org/{z}/{x}/{y}.png', attribution: 'Map data: Example contributors' };

  it('chooses the zoom from the rendered size and pixel ratio', () => {
    // 1000 CSS px wide: the world spans `scale` CSS px; 256 x 2^10 means zoom 10 at native size.
    const scale = 256 * 1024;
    expect(geoMapTileZoom(scale, 1000, 1)).toBe(10);
    expect(geoMapTileZoom(scale - 1, 1000, 1)).toBe(9);
    expect(geoMapTileZoom(scale, 500, 1)).toBe(9);
    expect(geoMapTileZoom(scale, 1000, 2)).toBe(11);
    expect(geoMapTileZoom(scale, 1000, 3)).toBe(11);
    expect(geoMapTileZoom(scale, 1000, 0.5)).toBe(10);
    expect(geoMapTileZoom(scale, 1000, 1, { tileSize: 512 })).toBe(9);
    expect(geoMapTileZoom(scale, 1000, 1, { maxZoom: 8 })).toBe(8);
    expect(geoMapTileZoom(scale, 1000, 1, { minZoom: 12 })).toBe(12);
    expect(geoMapTileZoom(256 * 2 ** 25, 1000, 1)).toBe(19);
  });

  it('covers the view, wraps columns and keeps rows inside the world', () => {
    expect(geoMapTileRange({ minX: 0.49, maxX: 0.51, minY: 0.3, maxY: 0.31 }, 4)).toEqual({ x0: 7, x1: 8, y0: 4, y1: 4 });
    expect(geoMapTileRange({ minX: 0.25, maxX: 0.5, minY: 0, maxY: 0.5 }, 2)).toEqual({ x0: 1, x1: 1, y0: 0, y1: 1 });
    expect(geoMapTileRange({ minX: -0.1, maxX: 1.1, minY: -0.2, maxY: 1.2 }, 1)).toEqual({ x0: -1, x1: 2, y0: 0, y1: 1 });
    expect(geoMapWrapTileX(-1, 2)).toBe(3);
    expect(geoMapWrapTileX(4, 2)).toBe(0);
    expect(geoMapWrapTileX(2, 2)).toBe(2);
    expect(geoMapTileUrl(TILES.url, 3, 4, 5)).toBe('https://tiles.example.org/3/4/5.png');
  });

  it('lays out only the tiles the view needs, wrapped across the date line', () => {
    const g = geoMapGeometry({ points: [{ lat: 0, lon: 179.999 }], shapes: [], tiles: TILES }, { width: 360, dpr: 1 });
    const layer = g.tiles!;
    const n = 2 ** layer.zoom;
    expect(layer.tiles.length).toBeGreaterThan(0);
    expect(layer.tiles.length).toBeLessThanOrEqual(12);
    expect(layer.tiles.some((t) => t.x === 0)).toBe(true);
    expect(layer.tiles.some((t) => t.x === n - 1)).toBe(true);
    expect(layer.tiles.every((t) => t.x >= 0 && t.x < n && t.y >= 0 && t.y < n)).toBe(true);
    expect(Math.min(...layer.tiles.map((t) => t.left))).toBeLessThanOrEqual(0);
    expect(Math.max(...layer.tiles.map((t) => t.left + t.width))).toBeGreaterThanOrEqual(100);
    expect(Math.min(...layer.tiles.map((t) => t.top))).toBeLessThanOrEqual(0);
    expect(Math.max(...layer.tiles.map((t) => t.top + t.height))).toBeGreaterThanOrEqual(100);
    expect(layer.attribution).toBe(TILES.attribution);
    expect(g.grid).toBe('');
    // A sharper screen asks for one zoom deeper, never more.
    expect(geoMapGeometry({ points: [{ lat: 0, lon: 179.999 }], shapes: [], tiles: TILES }, { width: 360, dpr: 2 }).tiles!.zoom).toBe(layer.zoom + 1);
  });

  it('shows a neighbourhood around a single place, and leaves tiles off when there is nothing or too much', () => {
    const point = [{ lat: 51, lon: 7 }];
    expect(geoMapGeometry({ points: point, shapes: [], tiles: TILES }).scale!.metres).toBeGreaterThan(geoMapGeometry({ points: point, shapes: [] }).scale!.metres);
    expect(geoMapGeometry({ points: [], shapes: [], tiles: TILES }).tiles).toBeNull();
    const wide = [{ lat: 0, lon: 0 }, { lat: 1, lon: 1 }];
    expect(geoMapGeometry({ points: wide, shapes: [], tiles: { ...TILES, minZoom: 18 } }).tiles).toBeNull();
    expect(geoMapGeometry({ points: wide, shapes: [], tiles: TILES }).tiles!.tiles.length).toBeLessThanOrEqual(GEO_MAP_MAX_TILES);
  });

  it('renders the tile layer and the attribution as text, only with tiles', () => {
    const attribution = 'Tiles <b>Example</b> & contributors';
    const m = createGeoMap({ label: 'Map', points: [{ lat: 51, lon: 7, label: 'A' }], shapes: [], tiles: { ...TILES, attribution } });
    expect(m.el.className).toBe('mh-geo-map mh-geo-map--tiles');
    const imgs = Array.from(m.el.querySelectorAll<HTMLImageElement>('.mh-geo-map__tiles > img.mh-geo-map__tile'));
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) {
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('decoding')).toBe('async');
      expect(img.getAttribute('draggable')).toBe('false');
      // Plain template URLs: no cache-busting query.
      expect(img.getAttribute('src')).toMatch(/^https:\/\/tiles\.example\.org\/\d+\/\d+\/\d+\.png$/);
    }
    expect(m.el.firstElementChild!.className).toBe('mh-geo-map__tiles');
    expect(m.el.querySelector('.mh-geo-map__grid')).toBeNull();
    const credit = m.el.querySelector('.mh-geo-map__attribution')!;
    expect(credit.textContent).toBe(attribution);
    expect(credit.querySelector('b')).toBeNull();
    m.update({ label: 'Map', points: [{ lat: 51, lon: 7 }], shapes: [], tiles: null });
    expect(m.el.className).toBe('mh-geo-map');
    expect(m.el.querySelector('img, .mh-geo-map__tiles, .mh-geo-map__attribution')).toBeNull();
    expect(m.el.querySelector('.mh-geo-map__grid')).not.toBeNull();
    m.destroy();
  });
});

describe('geo map labels and home', () => {
  it('merges labels of places drawn on top of each other and draws a house for home', () => {
    const g = geoMapGeometry({
      points: [
        { lat: 51.5, lon: -0.1, label: 'Sam', tone: 'home' },
        { lat: 51.50001, lon: -0.10001, label: 'Kai' },
        { lat: 51.52, lon: -0.05, label: 'Ana' },
      ],
      shapes: [],
    });
    expect(g.points.map((p) => p.label)).toEqual(['Sam, Kai', null, 'Ana']);
    const { el } = createGeoMap({ label: 'Map', points: [{ lat: 51.5, lon: -0.1, label: 'Home', tone: 'home' }], shapes: [] });
    const home = el.querySelector('.mh-geo-map__point--home')!;
    expect(home.querySelector('svg path')!.getAttribute('d')!.length).toBeGreaterThan(5);
  });
});
