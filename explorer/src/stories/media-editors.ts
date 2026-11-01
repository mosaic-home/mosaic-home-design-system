import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createSwitch } from '../../../src/web/choice-inputs/switch.ts';
import { createZoomControl } from '../../../src/web/media/zoomControl.ts';
import { createTransport } from '../../../src/web/media/transport.ts';
import { createMediaTimeline, type TimelineTrack } from '../../../src/web/media/mediaTimeline.ts';
import { createLayersPanel, type LayerItem } from '../../../src/web/media/layersPanel.ts';
import { createTransformFields, referenceFraction, type ReferencePoint, type TransformValue } from '../../../src/web/media/transformFields.ts';
import { createInspector } from '../../../src/web/media/inspector.ts';
import { createCompareSlider } from '../../../src/web/media/compareSlider.ts';
import { createZoomableImage } from '../../../src/web/media/zoomableImage.ts';
import { createMap, type MapMarker, type MapTileSource } from '../../../src/web/media/map.ts';
import { formatTimecode } from '../../../src/web/media/timecode.ts';
import type { Tokens } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const readout = (text = ''): HTMLElement => h('span', { class: 'ex-meta', 'aria-live': 'polite' }, text);
const svgUrl = (svg: string): string => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** A ticking clock for playback demos that stops by itself once the story is gone. */
function ticker(el: HTMLElement, every: number, tick: () => void): { start(): void; stop(): void } {
  let id: ReturnType<typeof setInterval> | undefined;
  const stop = (): void => {
    clearInterval(id);
    id = undefined;
  };
  return {
    start() {
      stop();
      id = setInterval(() => (el.isConnected ? tick() : stop()), every);
    },
    stop,
  };
}

// Stand-in pictures in the theme's colours -----------------------------------------------------------------------

/** A sitting room drawn flat: `lit` is the "after" version with lamps on and warmer colours. */
function roomUrl(tokens: Tokens, lit: boolean): string {
  const p = tokens.theme.palette;
  const s = p.series;
  const wall = lit ? s[4] : p.surfaceRaised;
  const floor = lit ? s[1] : p.surfacePressed;
  const sofa = lit ? s[0] : p.textFaint;
  const glow = lit ? `<circle cx='250' cy='70' r='60' fill='${p.accentLight}' opacity='0.35'/>` : '';
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='${wall}'/><rect y='210' width='400' height='90' fill='${floor}'/>${glow}<rect x='60' y='60' width='110' height='80' fill='${p.input}' stroke='${p.outline}' stroke-width='6'/><path d='M60 140 L170 60' stroke='${p.divider}' stroke-width='3'/><rect x='70' y='165' width='190' height='60' rx='18' fill='${sofa}'/><rect x='70' y='145' width='190' height='35' rx='14' fill='${sofa}' opacity='0.8'/><rect x='244' y='96' width='12' height='130' fill='${p.textMuted}'/><path d='M226 96 h48 l-12 -30 h-24z' fill='${lit ? p.accent : p.textMuted}'/><rect x='300' y='180' width='60' height='46' fill='${p.surface}'/></svg>`,
  );
}

/** An invented floor plan with small labels worth zooming into. */
function planUrl(tokens: Tokens): string {
  const p = tokens.theme.palette;
  const room = (x: number, y: number, w: number, hgt: number, name: string, fill: string): string =>
    `<rect x='${x}' y='${y}' width='${w}' height='${hgt}' fill='${fill}' stroke='${p.text}' stroke-width='4'/><text x='${x + 10}' y='${y + 24}' font-family='sans-serif' font-size='18' fill='${p.text}'>${name}</text><text x='${x + 10}' y='${y + 40}' font-family='sans-serif' font-size='9' fill='${p.textMuted}'>${Math.round(w / 40)} × ${Math.round(hgt / 40)} m</text>`;
  const s = p.series;
  return svgUrl(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'><rect width='800' height='520' fill='${p.surface}'/>${room(20, 20, 320, 260, 'Living room', p.surfaceRaised)}${room(340, 20, 220, 180, 'Kitchen', p.input)}${room(560, 20, 220, 180, 'Study', p.surfaceRaised)}${room(340, 200, 440, 80, 'Hall', p.surfacePressed)}${room(20, 280, 260, 220, 'Bedroom', p.input)}${room(280, 280, 200, 220, 'Bath', p.surfaceRaised)}${room(480, 280, 300, 220, 'Workshop', p.input)}<rect x='60' y='200' width='120' height='50' rx='10' fill='${s[0]}'/><circle cx='600' cy='120' r='26' fill='${s[2]}'/><rect x='60' y='330' width='120' height='90' rx='8' fill='${s[4]}'/><text x='66' y='440' font-family='sans-serif' font-size='7' fill='${p.textFaint}'>Bed: 1.6 m wide, window to the garden</text><rect x='520' y='330' width='200' height='22' fill='${s[1]}'/><text x='522' y='370' font-family='sans-serif' font-size='6' fill='${p.textFaint}'>Bench, tool wall above, sockets every 60 cm</text></svg>`,
  );
}

/** A layer thumbnail: a shape in a series colour on a clear ground. */
function thumbUrl(tokens: Tokens, kind: 'sky' | 'hill' | 'tree' | 'sun' | 'text', i: number): string {
  const s = tokens.theme.palette.series;
  const c = s[i % s.length];
  const body =
    kind === 'sky'
      ? `<rect width='40' height='30' fill='${c}'/>`
      : kind === 'hill'
        ? `<path d='M0 30 Q20 6 40 30Z' fill='${c}'/>`
        : kind === 'tree'
          ? `<rect x='18' y='18' width='4' height='10' fill='${tokens.theme.palette.textMuted}'/><circle cx='20' cy='14' r='9' fill='${c}'/>`
          : kind === 'sun'
            ? `<circle cx='20' cy='15' r='9' fill='${c}'/>`
            : `<text x='5' y='21' font-family='sans-serif' font-size='14' font-weight='700' fill='${c}'>Aa</text>`;
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 30'>${body}</svg>`);
}

/**
 * Stand-in map tiles drawn on the spot, so the story never contacts a tile server: a street grid along tile edges,
 * a park or a pond on some tiles (picked from the tile's numbers) and the tile's address, faint.
 */
function standInTiles(tokens: Tokens): MapTileSource {
  const p = tokens.theme.palette;
  const s = p.series;
  return (z, x, y) => {
    const hash = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791);
    const pick = Math.abs(hash) % 5;
    const feature =
      pick === 0
        ? `<rect x='40' y='50' width='120' height='90' rx='16' fill='${s[2]}' opacity='0.45'/>`
        : pick === 1
          ? `<ellipse cx='170' cy='170' rx='55' ry='38' fill='${s[3]}' opacity='0.5'/>`
          : pick === 2
            ? `<rect x='150' y='30' width='70' height='60' fill='${p.surfacePressed}'/><rect x='30' y='160' width='80' height='60' fill='${p.surfacePressed}'/>`
            : '';
    return svgUrl(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><rect width='256' height='256' fill='${p.input}'/>${feature}<path d='M0 128H256M128 0V256' stroke='${p.surfaceRaised}' stroke-width='6'/><path d='M0 0H256M0 0V256' stroke='${p.textFaint}' stroke-width='10' opacity='0.5'/><text x='8' y='248' font-family='monospace' font-size='12' fill='${p.textFaint}'>${z}/${x}/${y}</text></svg>`,
    );
  };
}

// Data ------------------------------------------------------------------------------------------------------------

const TRACKS: TimelineTrack[] = [
  {
    id: 'video',
    name: 'Video',
    icon: 'film',
    clips: [
      { id: 'v1', start: 0, end: 7.5, label: 'Morning garden' },
      { id: 'v2', start: 7.5, end: 15, label: 'Kitchen', tone: 2 },
      { id: 'v3', start: 17, end: 26, label: 'Lanterns over the quay', tone: 3 },
    ],
  },
  { id: 'titles', name: 'Titles', clips: [{ id: 't1', start: 1, end: 5, label: 'Our week', tone: 5 }] },
  { id: 'music', name: 'Music', icon: 'music', locked: true, clips: [{ id: 'm1', start: 0, end: 28, label: 'Quiet Harbour (locked)', tone: 4 }] },
];

const LAYERS = (tokens: Tokens): LayerItem[] => [
  { id: 'title', name: 'Title', thumbnail: thumbUrl(tokens, 'text', 0) },
  {
    id: 'scenery',
    name: 'Scenery',
    children: [
      { id: 'tree', name: 'Tree', thumbnail: thumbUrl(tokens, 'tree', 2) },
      { id: 'sun', name: 'Sun', thumbnail: thumbUrl(tokens, 'sun', 4), visible: false },
      { id: 'hill', name: 'Hill', thumbnail: thumbUrl(tokens, 'hill', 1) },
    ],
  },
  { id: 'sky', name: 'Sky', thumbnail: thumbUrl(tokens, 'sky', 3), locked: true },
  { id: 'notes', name: 'Notes', icon: 'edit', visible: false },
];

const PLACES: MapMarker[] = [
  { lat: 51.0004, lon: 7.0012, label: 'Home', icon: 'home' },
  { lat: 51.0042, lon: 7.0091, label: 'Workshop', tone: 'neutral' },
  { lat: 50.9968, lon: 7.0108, label: 'Pier' },
];

// Stories ---------------------------------------------------------------------------------------------------------

export const mediaEditorStories: Story[] = [
  {
    id: 'media-timeline',
    render: () => {
      const duration = 30;
      let position = 3;
      let playing = false;
      const log = readout('Drag clips to move them, their edges to trim; the music track is locked.');
      const el = stack();
      const clock = ticker(el, 100, () => {
        position = position + 0.1 >= duration ? 0 : Math.round((position + 0.1) * 10) / 10;
        timeline.setPosition(position);
        transport.setPosition(position);
      });
      const transport = createTransport({
        label: 'Playback',
        duration,
        position,
        size: 'small',
        onPlayingChange: (p) => {
          playing = p;
          if (playing) clock.start();
          else clock.stop();
        },
        onSeek: (t) => {
          position = t;
          timeline.setPosition(t);
        },
      });
      const timeline = createMediaTimeline({
        label: 'Edit timeline',
        duration,
        tracks: TRACKS,
        position,
        zoom: 40,
        selected: 'v2',
        onSeek: (t) => {
          position = t;
          transport.setPosition(t);
        },
        onClipChange: (c, done) => {
          if (done) log.textContent = `${c.clipId}: ${formatTimecode(c.start, { decimals: 1 })} to ${formatTimecode(c.end, { decimals: 1 })}`;
        },
        onZoomChange: (z) => zoom.setValue(z / 40),
      });
      const zoom = createZoomControl({
        value: 1,
        min: 0.25,
        max: 8,
        size: 'small',
        presets: [0.25, 0.5, 1, 2, 4, 8],
        onChange: (v) => timeline.setZoom(v * 40),
        onFit: () => {
          const fit = Math.max(0.25, (timeline.el.clientWidth - 160) / duration / 40);
          zoom.setValue(fit);
          timeline.setZoom(fit * 40);
        },
      });
      const snap = createSwitch({ label: 'Snap', checked: true, onChange: (on) => timeline.setSnap(on) });
      el.append(
        caption('Ruler, three tracks of clips, the playhead and snapping to edges, the playhead and the grid. Ctrl or ⌘ + wheel zooms.'),
        row(transport.el, zoom.el, snap.el),
        timeline.el,
        log,
      );
      return el;
    },
  },
  {
    id: 'transport',
    render: () => {
      const el = stack();
      const duration = 222;
      let position = 41;
      const live = createTransport({
        label: 'Playback',
        duration,
        position,
        loop: false,
        onPlayingChange: (p) => (p ? clock.start() : clock.stop()),
        onSeek: (t) => (position = t),
      });
      const clock = ticker(el, 1000, () => {
        position = position + 1 > duration ? 0 : position + 1;
        live.setPosition(position);
      });
      el.append(
        caption('Play / pause, step, skip to the ends, loop and the timecode (press play)'),
        live.el,
        caption('Frame-accurate at 25 fps, small'),
        createTransport({ label: 'Clip playback', fps: 25, duration: 12.4, position: 3.48, size: 'small' }).el,
        caption('Large, for a TV: no step buttons'),
        createTransport({ label: 'Film', steps: false, duration: 5400, position: 1830, size: 'large', playing: true, loop: true }).el,
        caption('Disabled, no duration known yet'),
        createTransport({ label: 'Stream', disabled: true, skip: false }).el,
      );
      return el;
    },
  },
  {
    id: 'layers-panel',
    render: (tokens) => {
      const log = readout('Up / Down on a grip moves its layer.');
      const panel = createLayersPanel({
        label: 'Layers',
        layers: LAYERS(tokens),
        selected: 'tree',
        onSelect: (id) => (log.textContent = `Selected ${id}`),
        onVisibleChange: (id, v) => (log.textContent = `${id} ${v ? 'shown' : 'hidden'}`),
        onLockedChange: (id, v) => (log.textContent = `${id} ${v ? 'locked' : 'unlocked'}`),
        onReorder: (id, parent, index) => (log.textContent = `${id} moved to ${index + 1}${parent ? ` in ${parent}` : ''}`),
      });
      panel.el.style.maxWidth = '22rem';
      return stack(caption('Front-most first: thumbnails, a group, a hidden layer (and one hidden with its group), a locked layer; drag the grips to reorder'), panel.el, log);
    },
  },
  {
    id: 'zoom-control',
    render: () => {
      const out = readout('100%');
      const zoom = createZoomControl({
        value: 1,
        onChange: (v) => {
          out.textContent = `${Math.round(v * 100)}%`;
          zoom.setFitted(false);
        },
        onFit: () => {
          out.textContent = 'Fitted (63%)';
          zoom.setValue(0.63);
          zoom.setFitted(true);
        },
      });
      return stack(
        caption('− / preset / + with Fit; a level that is not a preset joins the list'),
        row(zoom.el, out),
        caption('Small, without Fit, at the top of its range'),
        createZoomControl({ value: 4, max: 4, size: 'small', showFit: false }).el,
        caption('Disabled'),
        createZoomControl({ value: 1.5, disabled: true }).el,
      );
    },
  },
  {
    id: 'transform-fields',
    render: (tokens) => {
      let value: TransformValue = { x: 40, y: 30, width: 120, height: 80, angle: 12 };
      let ref: ReferencePoint = 'top-left';
      const p = tokens.theme.palette;
      const box = h('div', { style: `position:absolute; border:2px solid ${p.accent}; background:${p.accentLight}33; transform-origin: center` });
      const dot = h('div', { style: `position:absolute; width:8px; height:8px; margin:-4px 0 0 -4px; border-radius:50%; background:${p.accent}` });
      const preview = h('div', { style: 'position:relative; width:280px; height:200px; overflow:hidden; border-radius:var(--mh-radius-md); background:var(--mh-input)' }, box, dot);
      const draw = (): void => {
        const { fx, fy } = referenceFraction(ref);
        Object.assign(box.style, { left: `${value.x}px`, top: `${value.y}px`, width: `${value.width}px`, height: `${value.height}px`, transform: `rotate(${value.angle}deg)` });
        Object.assign(dot.style, { left: `${value.x + fx * value.width}px`, top: `${value.y + fy * value.height}px` });
      };
      const fields = createTransformFields({
        value,
        onChange: (v) => {
          value = v;
          draw();
        },
        onReferenceChange: (r) => {
          ref = r;
          draw();
        },
      });
      fields.el.style.maxWidth = '22rem';
      draw();
      return stack(
        caption('X and Y follow the reference point; resizing keeps it still. Up / Down step (Shift for ten); drag a field’s letter to scrub.'),
        fields.el,
        preview,
        caption('Disabled, in millimetres, proportions kept'),
        createTransformFields({ value: { x: 0, y: 0, width: 210, height: 297, angle: 0 }, unit: 'mm', lockAspect: true, reference: 'center', disabled: true }).el,
      );
    },
  },
  {
    id: 'inspector',
    render: () => {
      const log = readout();
      const inspector = createInspector({
        label: 'Clip properties',
        onChange: (id, v, done) => done && (log.textContent = `${id}: ${String(v)}`),
        onKeyframe: (id, on) => (log.textContent = `${id}: keyframe ${on ? 'added' : 'removed'}`),
        sections: [
          {
            id: 'transform',
            title: 'Transform',
            params: [
              { id: 'scale', kind: 'slider', label: 'Scale', value: 100, max: 400, unit: '%', keyframe: 'on' },
              { id: 'rotation', kind: 'slider', label: 'Rotation', value: 0, min: -180, max: 180, unit: '°', keyframe: 'animated' },
              { id: 'opacity', kind: 'slider', label: 'Opacity', value: 85, unit: '%', keyframe: 'off' },
            ],
          },
          {
            id: 'look',
            title: 'Look',
            params: [
              { id: 'blend', kind: 'choice', label: 'Blend', value: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'screen', label: 'Screen' }, { value: 'multiply', label: 'Multiply' }] },
              { id: 'blur', kind: 'slider', label: 'Blur', value: 2.5, max: 20, step: 0.5, unit: 'px', keyframe: 'off' },
              { id: 'shadow', kind: 'toggle', label: 'Drop shadow', value: true },
              { id: 'grain', kind: 'slider', label: 'Film grain', value: 0, disabled: true, keyframe: 'off' },
            ],
          },
          { id: 'audio', title: 'Audio', open: false, params: [{ id: 'volume', kind: 'slider', label: 'Volume', value: -6, min: -60, max: 6, unit: 'dB', keyframe: 'off' }] },
        ],
      });
      inspector.el.style.maxWidth = '26rem';
      return stack(caption('Sections open and close; the diamonds add or remove a keyframe (half-filled: keyed elsewhere)'), inspector.el, log);
    },
  },
  {
    id: 'compare-slider',
    render: (tokens) =>
      stack(
        caption('Drag anywhere, or focus and use the arrow keys'),
        createCompareSlider({
          label: 'Compare the lighting scene',
          before: { src: roomUrl(tokens, false), alt: 'Sitting room with the lights off' },
          after: { src: roomUrl(tokens, true), alt: 'Sitting room with the evening scene on' },
          beforeLabel: 'Off',
          afterLabel: 'Evening',
          value: 45,
        }).el,
        caption('Split top / bottom'),
        createCompareSlider({
          label: 'Compare',
          before: { src: roomUrl(tokens, true), alt: 'With the scene' },
          after: { src: roomUrl(tokens, false), alt: 'Without the scene' },
          orientation: 'vertical',
          aspect: 16 / 9,
          value: 60,
        }).el,
      ),
  },
  {
    id: 'zoomable-image',
    render: (tokens) =>
      stack(
        caption('Pinch, scroll or double-tap to zoom, drag to pan; focus it for + / − / arrows / 0. The small print only reads zoomed in.'),
        createZoomableImage({ src: planUrl(tokens), alt: 'Floor plan of an invented flat', controls: true, aspect: 16 / 10 }).el,
        caption('Without controls, square frame, up to 8×'),
        createZoomableImage({ src: roomUrl(tokens, true), alt: 'Sitting room', maxScale: 8, aspect: 1 }).el,
      ),
  },
  {
    id: 'map',
    render: (tokens) => {
      const log = readout('Places are buttons here.');
      const tiles = standInTiles(tokens);
      return stack(
        caption('Tiles from a caller-supplied source (stand-in tiles drawn on the spot: nothing is fetched), markers, zoom, recentre and compass. Twist with two fingers, or Shift + arrows, to turn.'),
        createMap({ label: 'Around the house', tiles, attribution: 'Stand-in tiles', markers: PLACES, onMarkerSelect: (m) => (log.textContent = `${m.label ?? 'Place'} selected`) }).el,
        log,
        caption('Turned 30°: the compass points north and resets on press'),
        createMap({ label: 'Turned map', tiles, attribution: 'Stand-in tiles', center: { lat: 51.0004, lon: 7.0012 }, zoom: 15.5, bearing: 30, markers: PLACES.slice(0, 1), aspect: 2 }).el,
        caption('No tile source set: a themed grid that still pans and zooms, and a notice'),
        createMap({ label: 'Map without tiles', markers: PLACES, aspect: 2 }).el,
      );
    },
  },
];
