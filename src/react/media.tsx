// media group: React bindings. Same DOM and classes as the web renderer.
import { useEffect, useRef, useState } from 'react';
import {
  GEO_MAP_DISPLAY_WIDTH,
  geoMapAccuracyClass,
  geoMapClass,
  geoMapAspect,
  geoMapGeometry,
  geoMapLabelClass,
  geoMapPointClass,
  geoMapPointIcon,
  geoMapShapeClass,
  geoMapSummary,
  geoMapTileStyle,
  type GeoMapDisplay,
  type GeoMapFit,
  type GeoMapPoint,
  type GeoMapShape,
  type GeoMapTiles,
} from '../web/media/geoMap.ts';
import { cx } from '../web/dom.ts';
import { Icon } from './foundations.tsx';

// Geo map ------------------------------------------------------------------------------------------------------

export interface GeoMapProps {
  /** Accessible name ("Map"); a summary of the contents is added. */
  label: string;
  points: readonly GeoMapPoint[];
  shapes: readonly GeoMapShape[];
  fit?: GeoMapFit;
  /** Width / height (default 16 / 10). */
  aspect?: number;
  /** Raster tiles under the drawing; off by default (then nothing is loaded). */
  tiles?: GeoMapTiles | null;
  className?: string;
}

const at = (p: { x: number; y: number }) => ({ left: `${p.x}%`, top: `${p.y}%` });

/**
 * Same DOM and classes as `createGeoMap`: drawn from coordinates; nothing is loaded unless `tiles` is set. With
 * tiles, the rendered width is measured (360 px until then) to choose the tile zoom.
 */
export function GeoMap({ label, points, shapes, fit, aspect, tiles, className }: GeoMapProps) {
  const root = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<Required<GeoMapDisplay>>({ width: GEO_MAP_DISPLAY_WIDTH, dpr: 1 });
  const hasTiles = !!tiles;
  useEffect(() => {
    const el = root.current;
    if (!hasTiles || !el) return;
    const measure = (): void => {
      const next = { width: el.getBoundingClientRect().width || GEO_MAP_DISPLAY_WIDTH, dpr: window.devicePixelRatio > 0 ? window.devicePixelRatio : 1 };
      setDisplay((prev) => (prev.width === next.width && prev.dpr === next.dpr ? prev : next));
    };
    measure();
    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasTiles]);
  const g = geoMapGeometry({ points, shapes, fit, aspect, tiles }, display);
  return (
    <div ref={root} className={cx(geoMapClass(!!g.tiles), className)} role="img" aria-label={geoMapSummary(label, points, shapes)} style={{ aspectRatio: geoMapAspect(g) }}>
      {g.tiles && (
        <div className="mh-geo-map__tiles" aria-hidden="true">
          {g.tiles.tiles.map((t) => (
            <img key={`${t.z}/${t.left}/${t.top}`} className="mh-geo-map__tile" src={t.url} alt="" loading="lazy" decoding="async" draggable={false} style={geoMapTileStyle(t)} />
          ))}
        </div>
      )}
      <svg className="mh-geo-map__svg" viewBox={g.viewBox} aria-hidden="true">
        {g.grid && <path className="mh-geo-map__grid" d={g.grid} vectorEffect="non-scaling-stroke" />}
        {g.shapes.map((s, i) => (
          <path key={i} className={geoMapShapeClass(s)} d={s.d} vectorEffect="non-scaling-stroke" />
        ))}
        {g.points.map((p, i) => p.accuracy && <path key={i} className={geoMapAccuracyClass(p.tone)} d={p.accuracy} vectorEffect="non-scaling-stroke" />)}
      </svg>
      {g.shapes.map(
        (s, i) =>
          s.name &&
          s.nameAt && (
            <span key={i} className="mh-geo-map__name" aria-hidden="true" style={at(s.nameAt)}>
              {s.name}
            </span>
          ),
      )}
      {g.points.map((p, i) => [
        <span key={`p${i}`} className={geoMapPointClass(p.tone)} aria-hidden="true" style={at(p)}>
          {geoMapPointIcon(p.tone) && <Icon icon={geoMapPointIcon(p.tone)!} />}
        </span>,
        p.label && (
          <span key={`l${i}`} className={geoMapLabelClass(p.side)} aria-hidden="true" style={at(p)}>
            {p.label}
          </span>
        ),
      ])}
      {g.scale && (
        <span className="mh-geo-map__scale" aria-hidden="true" style={{ width: `${g.scale.width}%` }}>
          <span className="mh-geo-map__scale-text">{g.scale.text}</span>
        </span>
      )}
      {g.tiles && <span className="mh-geo-map__attribution">{g.tiles.attribution}</span>}
    </div>
  );
}
export * from './media-editors.tsx';
