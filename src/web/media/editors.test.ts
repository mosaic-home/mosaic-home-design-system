import { describe, expect, it, vi } from 'vitest';
import {
  applyTransformField,
  clampZoomView,
  clipRoom,
  compareValueAt,
  compareValueText,
  createCompareSlider,
  createInspector,
  createLayersPanel,
  createMap,
  createMediaTimeline,
  createTransformFields,
  createTransport,
  createZoomControl,
  createZoomableImage,
  dragClip,
  findLayer,
  fitContain,
  fittedZoomView,
  formatRulerTime,
  formatTimecode,
  formatZoom,
  mapFitView,
  mapFromScreen,
  mapPan,
  mapRotateAround,
  mapScaleBar,
  mapSummary,
  mapTileAt,
  mapTileBox,
  mapTileUrl,
  mapTileZoom,
  mapTiles,
  mapToScreen,
  mapWorldSize,
  mapZoomAround,
  mercator,
  moveLayer,
  nextKeyframe,
  normaliseAngle,
  normaliseBearing,
  parseInspectorNumber,
  referenceFraction,
  snapTime,
  timelineTicks,
  transformKeyStep,
  transformShown,
  transportStepPosition,
  trimNumber,
  updateLayer,
  wheelZoomFactor,
  wrapLongitude,
  zoomControlModel,
  zoomStep,
  zoomViewTo,
  type LayerItem,
  type MapView,
  type TimelineTrack,
} from './index.ts';

const key = (el: Element, k: string, init: KeyboardEventInit = {}): void => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
};
const click = (el: Element | null): void => (el as HTMLElement).click();

describe('timecode', () => {
  it('formats minutes, hours, decimals and frames', () => {
    expect(formatTimecode(0)).toBe('0:00');
    expect(formatTimecode(65)).toBe('1:05');
    expect(formatTimecode(3725)).toBe('1:02:05');
    expect(formatTimecode(65, { hours: true })).toBe('0:01:05');
    expect(formatTimecode(65.25, { decimals: 2 })).toBe('1:05.25');
    expect(formatTimecode(-5)).toBe('-0:05');
    expect(formatTimecode(Number.NaN)).toBe('0:00');
    expect(formatTimecode(65.5, { fps: 24 })).toBe('00:01:05:12');
    // 0.1 s at 30 fps is frame 3, despite floating point.
    expect(formatTimecode(0.1, { fps: 30 })).toBe('00:00:00:03');
    expect(trimNumber(12.5)).toBe('12.5');
    expect(trimNumber(12.004)).toBe('12');
    expect(trimNumber(-0.001)).toBe('0');
  });

  it('scales wheel zoom by notch and mode', () => {
    expect(wheelZoomFactor({ deltaY: -100, deltaMode: 0, ctrlKey: false })).toBeGreaterThan(1.15);
    expect(wheelZoomFactor({ deltaY: 100, deltaMode: 0, ctrlKey: false })).toBeLessThan(1);
    expect(wheelZoomFactor({ deltaY: -3, deltaMode: 1, ctrlKey: false })).toBeCloseTo(wheelZoomFactor({ deltaY: -48, deltaMode: 0, ctrlKey: false }), 9);
  });
});

describe('zoom control', () => {
  it('steps through presets, then doubles and halves', () => {
    expect(zoomStep(1, 1)).toBe(1.5);
    expect(zoomStep(1, -1)).toBe(0.75);
    expect(zoomStep(1.2, 1)).toBe(1.5);
    expect(zoomStep(1.2, -1)).toBe(1);
    expect(zoomStep(4, 1)).toBe(8);
    expect(zoomStep(0.25, -1)).toBe(0.125);
    expect(zoomStep(8, 1)).toBe(8);
    expect(formatZoom(1.234)).toBe('123%');
  });

  it('lists the current level when it is not a preset', () => {
    const m = zoomControlModel(1.234);
    expect(m.options.map((o) => o.text)).toContain('123%');
    expect(m.selected).toBe(1.234);
    expect(zoomControlModel(1).options.filter((o) => o.text === '100%')).toHaveLength(1);
    expect(zoomControlModel(0.1).canZoomOut).toBe(false);
  });

  it('drives the value from −, +, the menu and Fit', () => {
    const onChange = vi.fn();
    const onFit = vi.fn();
    const z = createZoomControl({ value: 1, onChange, onFit, fitted: false });
    expect(z.el.getAttribute('role')).toBe('group');
    const [out, inn] = z.el.querySelectorAll<HTMLButtonElement>('.mh-zoom-control__step');
    click(inn!);
    expect(onChange).toHaveBeenLastCalledWith(1.5);
    click(out!);
    click(out!);
    expect(onChange).toHaveBeenLastCalledWith(0.75);
    const select = z.el.querySelector('select')!;
    select.value = '4';
    select.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenLastCalledWith(4);
    click(z.el.querySelector('.mh-zoom-control__fit'));
    expect(onFit).toHaveBeenCalled();
    z.setFitted(true);
    expect(z.el.querySelector('.mh-zoom-control__fit')!.getAttribute('aria-pressed')).toBe('true');
    z.setValue(8);
    expect(inn!.getAttribute('aria-disabled')).toBe('true');
    click(inn!);
    expect(onChange).toHaveBeenCalledTimes(4);
  });
});

describe('transport', () => {
  it('steps on the grid and stays in range', () => {
    expect(transportStepPosition(2, 1, 1, 10)).toBe(3);
    expect(transportStepPosition(2.4, 1, 1, 10)).toBe(3);
    expect(transportStepPosition(2.4, -1, 1, 10)).toBe(2);
    expect(transportStepPosition(0, -1, 1, 10)).toBe(0);
    expect(transportStepPosition(10, 1, 1, 10)).toBe(10);
    expect(transportStepPosition(1, 1, 1 / 25)).toBeCloseTo(1.04, 9);
  });

  it('plays, steps by frames and loops', () => {
    const onPlayingChange = vi.fn();
    const onSeek = vi.fn();
    const onLoopChange = vi.fn();
    const t = createTransport({ label: 'Playback', position: 1, duration: 10, fps: 25, loop: false, onPlayingChange, onSeek, onLoopChange });
    const play = t.el.querySelector<HTMLButtonElement>('.mh-transport__play')!;
    expect(play.getAttribute('aria-label')).toBe('Play');
    click(play);
    expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    expect(play.getAttribute('aria-label')).toBe('Pause');
    click(t.el.querySelector('[aria-label="Step forward"]'));
    expect(onSeek).toHaveBeenLastCalledWith(1.04);
    expect(t.el.querySelector('.mh-transport__current')!.textContent).toBe('00:00:01:01');
    click(t.el.querySelector('[aria-label="Go to end"]'));
    expect(onSeek).toHaveBeenLastCalledWith(10);
    const loop = t.el.querySelector('.mh-transport__loop')!;
    expect(loop.getAttribute('aria-pressed')).toBe('false');
    click(loop);
    expect(onLoopChange).toHaveBeenLastCalledWith(true);
    expect(loop.getAttribute('aria-pressed')).toBe('true');
  });

  it('hides parts it is not given', () => {
    const t = createTransport({ label: 'Playback', skip: false, steps: false });
    expect(t.el.querySelectorAll('button')).toHaveLength(1);
    expect(t.el.querySelector<HTMLElement>('.mh-transport__duration')!.hidden).toBe(true);
    t.setDisabled(true);
    expect(t.el.querySelector<HTMLButtonElement>('.mh-transport__play')!.disabled).toBe(true);
  });
});

describe('compare slider', () => {
  it('maps pointer positions and speaks the split', () => {
    const rect = { left: 100, top: 0, width: 200, height: 100 };
    expect(compareValueAt(rect, 150, 0)).toBe(25);
    expect(compareValueAt(rect, 50, 0)).toBe(0);
    expect(compareValueAt(rect, 999, 0)).toBe(100);
    expect(compareValueAt(rect, 0, 75, 'vertical')).toBe(75);
    expect(compareValueText(40)).toBe('40% before');
  });

  it('builds both panes and follows the range', () => {
    const onChange = vi.fn();
    const c = createCompareSlider({ label: 'Compare', before: { src: 'data:,a', alt: 'Before edit' }, after: { src: 'data:,b', alt: 'After edit' }, value: 30, onChange });
    expect(c.el.className).toBe('mh-compare');
    expect(c.el.querySelectorAll('img')).toHaveLength(2);
    expect(c.el.style.getPropertyValue('--_at')).toBe('0.3');
    expect(c.input.getAttribute('aria-valuetext')).toBe('30% before');
    c.input.value = '60';
    c.input.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenLastCalledWith(60);
    expect(c.el.style.getPropertyValue('--_at')).toBe('0.6');
    const v = createCompareSlider({ label: 'Compare', before: document.createElement('div'), after: document.createElement('div'), orientation: 'vertical' });
    expect(v.el.classList.contains('mh-compare--vertical')).toBe(true);
    expect(v.input.getAttribute('aria-orientation')).toBe('vertical');
  });
});

describe('zoomable image', () => {
  const box = { frameWidth: 400, frameHeight: 300, contentWidth: 400, contentHeight: 200 };
  const limits = { minScale: 1, maxScale: 4 };

  it('fits, centres and clamps', () => {
    expect(fitContain(400, 300, 1600, 800)).toEqual({ width: 400, height: 200 });
    expect(fittedZoomView(box)).toEqual({ scale: 1, x: 0, y: 50 });
    // Smaller than the frame along y: stays centred; larger along x: can't leave a gap.
    expect(clampZoomView({ scale: 1, x: 30, y: 0 }, box, limits)).toEqual({ scale: 1, x: 0, y: 50 });
    expect(clampZoomView({ scale: 2, x: 30, y: -150 }, box, limits)).toEqual({ scale: 2, x: 0, y: -100 });
    expect(clampZoomView({ scale: 9, x: -9999, y: 0 }, box, limits).x).toBe(400 - 400 * 4);
  });

  it('zooms about a point, holding it still', () => {
    const v = zoomViewTo(fittedZoomView(box), 2, { x: 100, y: 150 }, box, limits);
    expect(v.scale).toBe(2);
    // The picture point under (100, 150) was (100, 100) in fitted pixels; it is still under the pointer.
    expect(v.x + 100 * 2).toBeCloseTo(100, 9);
    expect(v.y + 100 * 2).toBeCloseTo(150, 9);
  });

  it('builds a focusable frame with keys and an optional zoom control', () => {
    const onChange = vi.fn();
    const z = createZoomableImage({ src: 'data:,x', alt: 'Floor plan', controls: true, onChange });
    expect(z.el.className).toContain('mh-zoomable-image');
    expect(z.el.getAttribute('role')).toBe('group');
    expect(z.el.getAttribute('aria-label')).toBe('Floor plan');
    expect(z.el.tabIndex).toBe(0);
    expect(z.el.querySelector('.mh-zoom-control')).not.toBeNull();
    z.setScale(2);
    expect(z.getView().scale).toBe(2);
    expect(z.el.classList.contains('is-zoomed')).toBe(true);
    key(z.el, '0');
    expect(z.getView().scale).toBe(1);
    key(z.el, '+');
    expect(z.getView().scale).toBeCloseTo(1.25, 9);
    expect(onChange).toHaveBeenCalled();
    z.destroy();
  });
});

describe('transform fields', () => {
  const box = { x: 10, y: 20, width: 100, height: 50, angle: 0 };

  it('shows and edits relative to the reference point', () => {
    expect(referenceFraction('top-left')).toEqual({ fx: 0, fy: 0 });
    expect(referenceFraction('center')).toEqual({ fx: 0.5, fy: 0.5 });
    expect(referenceFraction('bottom-right')).toEqual({ fx: 1, fy: 1 });
    expect(transformShown(box, 'center')).toMatchObject({ x: 60, y: 45 });
    expect(applyTransformField(box, 'x', 100, 'center')).toMatchObject({ x: 50 });
    // Resizing about the centre keeps the centre still.
    const wider = applyTransformField(box, 'width', 200, 'center');
    expect(wider).toMatchObject({ x: -40, width: 200, height: 50 });
    expect(transformShown(wider, 'center').x).toBe(60);
    // Kept proportions.
    expect(applyTransformField(box, 'width', 200, 'top-left', true)).toMatchObject({ x: 10, y: 20, width: 200, height: 100 });
    expect(applyTransformField(box, 'height', -5, 'top-left')).toMatchObject({ height: 0 });
    expect(normaliseAngle(270)).toBe(-90);
    expect(normaliseAngle(-180)).toBe(180);
    expect(transformKeyStep('ArrowUp', true, 5, 1)).toBe(15);
    expect(transformKeyStep('a', false, 5, 1)).toBeNull();
  });

  it('commits typed values, steps with keys and switches the reference point', () => {
    const onChange = vi.fn();
    const onReferenceChange = vi.fn();
    const t = createTransformFields({ value: box, onChange, onReferenceChange });
    expect(t.el.tagName).toBe('FIELDSET');
    expect(t.el.querySelectorAll('.mh-transform__radio')).toHaveLength(9);
    const x = t.el.querySelector<HTMLInputElement>('[aria-label="X position"]')!;
    expect(x.value).toBe('10');
    x.value = '42';
    x.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenLastCalledWith({ ...box, x: 42 }, 'x');
    key(x, 'ArrowUp', { shiftKey: true });
    expect(t.getValue().x).toBe(52);
    const centre = t.el.querySelector<HTMLInputElement>('[aria-label="Centre"]')!;
    centre.checked = true;
    centre.dispatchEvent(new Event('change'));
    expect(onReferenceChange).toHaveBeenLastCalledWith('center');
    expect(x.value).toBe('102');
    const lock = t.el.querySelector('.mh-transform__lock')!;
    click(lock);
    expect(lock.getAttribute('aria-pressed')).toBe('true');
    const w = t.el.querySelector<HTMLInputElement>('[aria-label="Width"]')!;
    w.value = '200';
    w.dispatchEvent(new Event('change'));
    expect(t.getValue()).toMatchObject({ width: 200, height: 100 });
  });
});

describe('inspector', () => {
  it('parses numbers and cycles keyframes', () => {
    expect(parseInspectorNumber('42,5', { min: 0, max: 100 })).toBe(42.5);
    expect(parseInspectorNumber('400', { min: 0, max: 100 })).toBe(100);
    expect(parseInspectorNumber('abc', {})).toBeNull();
    expect(nextKeyframe('off')).toBe('on');
    expect(nextKeyframe('animated')).toBe('on');
    expect(nextKeyframe('on')).toBe('off');
  });

  it('builds sections of sliders, switches and selects', () => {
    const onChange = vi.fn();
    const onKeyframe = vi.fn();
    const i = createInspector({
      label: 'Properties',
      onChange,
      onKeyframe,
      sections: [
        {
          id: 'look',
          title: 'Look',
          params: [
            { id: 'opacity', kind: 'slider', label: 'Opacity', value: 80, unit: '%', keyframe: 'animated' },
            { id: 'shadow', kind: 'toggle', label: 'Shadow', value: false },
            { id: 'blend', kind: 'choice', label: 'Blend', value: 'normal', options: [{ value: 'normal', label: 'Normal' }, { value: 'screen', label: 'Screen' }] },
          ],
        },
        { id: 'motion', title: 'Motion', open: false, params: [] },
      ],
    });
    const sections = i.el.querySelectorAll('details');
    expect(sections).toHaveLength(2);
    expect(sections[0]!.open).toBe(true);
    expect(sections[1]!.open).toBe(false);
    const range = i.el.querySelector<HTMLInputElement>('.mh-inspector__range')!;
    expect(range.style.getPropertyValue('--_at')).toBe('0.8');
    range.value = '40';
    range.dispatchEvent(new Event('input'));
    expect(onChange).toHaveBeenLastCalledWith('opacity', 40, false);
    expect(i.el.querySelector<HTMLInputElement>('.mh-inspector__number')!.value).toBe('40');
    const number = i.el.querySelector<HTMLInputElement>('.mh-inspector__number')!;
    number.value = '55';
    number.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenLastCalledWith('opacity', 55, true);
    const keyBtn = i.el.querySelector('.mh-inspector__key')!;
    expect(keyBtn.classList.contains('is-animated')).toBe(true);
    click(keyBtn);
    expect(onKeyframe).toHaveBeenLastCalledWith('opacity', true);
    expect(keyBtn.getAttribute('aria-pressed')).toBe('true');
    const sw = i.el.querySelector<HTMLInputElement>('[role="switch"]')!;
    sw.checked = true;
    sw.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenLastCalledWith('shadow', true, true);
    i.setValue('blend', 'screen');
    expect(i.el.querySelector('select')!.value).toBe('screen');
    i.setOpen('motion', true);
    expect(sections[1]!.open).toBe(true);
  });
});

describe('layers panel', () => {
  const tree: LayerItem[] = [
    { id: 'title', name: 'Title' },
    { id: 'group', name: 'Scenery', children: [{ id: 'tree', name: 'Tree' }, { id: 'hill', name: 'Hill', visible: false }] },
    { id: 'sky', name: 'Sky', locked: true },
  ];

  it('finds, updates and moves layers', () => {
    expect(findLayer(tree, 'hill')).toMatchObject({ index: 1, parent: { id: 'group' } });
    expect(findLayer(tree, 'nope')).toBeNull();
    expect(findLayer(updateLayer(tree, 'tree', { visible: false }), 'tree')!.layer.visible).toBe(false);
    expect(moveLayer(tree, 'sky', 0).map((l) => l.id)).toEqual(['sky', 'title', 'group']);
    expect(moveLayer(tree, 'tree', 5)[1]!.children!.map((l) => l.id)).toEqual(['hill', 'tree']);
  });

  it('toggles, selects, expands and reorders from the keyboard', () => {
    const onReorder = vi.fn();
    const onVisibleChange = vi.fn();
    const onSelect = vi.fn();
    const onExpandedChange = vi.fn();
    const p = createLayersPanel({ label: 'Layers', layers: tree, selected: 'title', onReorder, onVisibleChange, onSelect, onExpandedChange });
    document.body.append(p.el);
    expect(p.el.querySelectorAll('.mh-layers__item')).toHaveLength(5);
    expect(p.el.querySelector('.is-selected .mh-layers__name')!.getAttribute('aria-pressed')).toBe('true');
    expect(p.el.querySelectorAll('.is-hidden')).toHaveLength(1);
    click(p.el.querySelector('[aria-label="Hide Tree"]'));
    expect(onVisibleChange).toHaveBeenLastCalledWith('tree', false);
    expect(p.el.querySelector('[aria-label="Hide Tree"]')!.getAttribute('aria-pressed')).toBe('true');
    click(p.el.querySelector('[aria-label="Scenery contents"]'));
    expect(onExpandedChange).toHaveBeenLastCalledWith('group', false);
    expect(p.el.querySelector<HTMLElement>('.mh-layers__item--group > .mh-layers__list')!.hidden).toBe(true);
    const grip = p.el.querySelector('[aria-label="Move Sky"]')!;
    key(grip, 'ArrowUp');
    expect(onReorder).toHaveBeenLastCalledWith('sky', null, 1, expect.any(Array));
    expect(p.getLayers().map((l) => l.id)).toEqual(['title', 'sky', 'group']);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Move Sky');
    expect(p.el.querySelector('[role="status"]')!.textContent).toBe('Sky moved to position 2 of 3');
    click(p.el.querySelector('[data-layer="sky"] .mh-layers__name'));
    expect(onSelect).toHaveBeenLastCalledWith('sky');
    p.el.remove();
  });
});

describe('media timeline', () => {
  const tracks: TimelineTrack[] = [
    { id: 'v', name: 'Video', clips: [{ id: 'a', start: 0, end: 4, label: 'Opening' }, { id: 'b', start: 6, end: 10, label: 'Garden' }] },
    { id: 'm', name: 'Music', locked: true, clips: [{ id: 'c', start: 1, end: 9, tone: 2 }] },
  ];

  it('spaces ruler ticks for the zoom', () => {
    const t = timelineTicks(60, 48);
    expect(t.major).toBe(2);
    expect(t.minor * 48).toBeGreaterThanOrEqual(8);
    expect(t.ticks[0]).toBe(0);
    expect(t.ticks.at(-1)).toBe(60);
    expect(timelineTicks(10, 400).major).toBe(0.2);
    expect(formatRulerTime(1.5, 0.5)).toBe('0:01.5');
    expect(formatRulerTime(90, 30)).toBe('1:30');
  });

  it('snaps to targets first, then the grid', () => {
    expect(snapTime(4.9, [5], 1, 0.2)).toEqual({ time: 5, to: 5 });
    expect(snapTime(4.5, [5], 1, 0.2)).toEqual({ time: 4.5, to: null });
    expect(snapTime(3.05, [], 1, 0.2)).toEqual({ time: 3, to: 3 });
  });

  it('moves and trims clips inside their room, snapping edges', () => {
    const room = clipRoom(tracks[0]!, 'b', 20);
    expect(room).toEqual({ min: 4, max: 20 });
    const base = { start: 6, end: 10, room, minLength: 0.1, targets: [4, 12], grid: null, threshold: 0.3 };
    // Moving left stops at the clip before.
    expect(dragClip({ ...base, mode: 'move', delta: -5, threshold: 0 })).toMatchObject({ start: 4, end: 8 });
    // The end snaps to 12.
    expect(dragClip({ ...base, mode: 'move', delta: 1.8 })).toEqual({ start: 8, end: 12, to: 12 });
    expect(dragClip({ ...base, mode: 'start', delta: 3.95, threshold: 0 })).toMatchObject({ start: 9.9 });
    expect(dragClip({ ...base, mode: 'end', delta: -10, threshold: 0 })).toMatchObject({ end: 6.1 });
  });

  it('renders tracks, seeks from the ruler and moves clips with keys', () => {
    const onSeek = vi.fn();
    const onClipChange = vi.fn();
    const onSelect = vi.fn();
    const t = createMediaTimeline({ label: 'Timeline', duration: 20, tracks, zoom: 50, snapStep: 0.5, onSeek, onClipChange, onSelect });
    expect(t.el.classList.contains('mh-media-timeline')).toBe(true);
    expect(t.el.querySelectorAll('.mh-media-timeline__lane')).toHaveLength(2);
    expect(t.el.querySelectorAll('.mh-media-timeline__clip')).toHaveLength(3);
    const ruler = t.el.querySelector('[role="slider"]')!;
    expect(ruler.getAttribute('aria-valuemax')).toBe('20');
    key(ruler, 'ArrowRight');
    expect(onSeek).toHaveBeenLastCalledWith(1);
    key(ruler, 'End');
    expect(ruler.getAttribute('aria-valuetext')).toBe('0:20');
    const b = t.el.querySelectorAll<HTMLButtonElement>('.mh-media-timeline__clip')[1]!;
    expect(b.style.left).toBe('300px');
    expect(b.getAttribute('aria-label')).toBe('Garden, 0:06 to 0:10');
    click(b);
    expect(onSelect).toHaveBeenLastCalledWith('b');
    expect(b.classList.contains('is-selected')).toBe(true);
    key(b, 'ArrowRight');
    expect(onClipChange).toHaveBeenLastCalledWith({ trackId: 'v', clipId: 'b', start: 6.5, end: 10.5 }, true);
    key(b, 'ArrowLeft', { shiftKey: true });
    expect(onClipChange).toHaveBeenLastCalledWith({ trackId: 'v', clipId: 'b', start: 6.5, end: 10 }, true);
    const locked = t.el.querySelectorAll('.mh-media-timeline__clip')[2]!;
    expect(locked.getAttribute('aria-disabled')).toBe('true');
    key(locked, 'ArrowRight');
    expect(onClipChange).toHaveBeenCalledTimes(2);
    t.setZoom(100);
    expect(t.el.querySelectorAll<HTMLElement>('.mh-media-timeline__clip')[1]!.style.left).toBe('650px');
    t.destroy();
  });
});

describe('map maths', () => {
  const frame = { width: 512, height: 512, tileSize: 256 };
  const view: MapView = { lat: 51.0, lon: 7.0, zoom: 12, bearing: 0 };

  it('finds tiles and builds their URLs', () => {
    expect(mapWorldSize(0)).toBe(256);
    expect(mapWorldSize(2)).toBe(1024);
    expect(mapTileAt(0, 0, 1)).toEqual({ x: 1, y: 1 });
    expect(mapTileAt(85, -180, 3)).toEqual({ x: 0, y: 0 });
    expect(mapTileAt(-85, 179.9, 3)).toEqual({ x: 7, y: 7 });
    // Northern hemisphere, east of Greenwich, zoom 2: the second row, third column.
    expect(mapTileAt(40, 10, 2)).toEqual({ x: 2, y: 1 });
    expect(mapTileUrl('https://tiles.example/{z}/{x}/{y}.png', 3, 4, 5)).toBe('https://tiles.example/3/4/5.png');
    expect(mapTileUrl((z, x, y) => `t${z}-${x}-${y}`, 1, 0, 1)).toBe('t1-0-1');
    expect(mapTileZoom(12.4)).toBe(12);
    expect(mapTileZoom(12.6)).toBe(13);
    expect(mapTileZoom(25, 0, 19)).toBe(19);
  });

  it('covers the frame with tiles, wrapping columns round the world', () => {
    const tiles = mapTiles(view, frame, 12);
    // 512 px at 256 px a tile: 2 to 3 tiles each way.
    expect(tiles.length).toBeGreaterThanOrEqual(4);
    expect(tiles.length).toBeLessThanOrEqual(9);
    const wrap = mapTiles({ lat: 0, lon: 179.99, zoom: 1, bearing: 0 }, frame, 1);
    expect(wrap.some((t) => t.column === 2 && t.x === 0)).toBe(true);
    // Turned, the circumscribed circle needs more tiles.
    expect(mapTiles({ ...view, bearing: 45 }, frame, 12).length).toBeGreaterThan(tiles.length);
    // A tile's box at an overzoomed level doubles.
    const box = mapTileBox({ z: 12, column: 0, y: 0 }, { ...view, zoom: 13 }, frame);
    expect(box.size).toBe(512);
  });

  it('round-trips screen positions, with rotation', () => {
    const centre = mapToScreen(view.lat, view.lon, view, frame);
    expect(centre.x).toBeCloseTo(256, 9);
    expect(centre.y).toBeCloseTo(256, 9);
    for (const bearing of [0, 30, -120]) {
      const v = { ...view, bearing };
      const at = mapFromScreen(100, 400, v, frame);
      const back = mapToScreen(at.lat, at.lon, v, frame);
      expect(back.x).toBeCloseTo(100, 6);
      expect(back.y).toBeCloseTo(400, 6);
    }
    // Facing east (bearing 90), a place to the north is on the left.
    const north = mapToScreen(51.01, 7.0, { ...view, bearing: 90 }, frame);
    expect(north.x).toBeLessThan(256);
    expect(north.y).toBeCloseTo(256, 6);
  });

  it('pans, zooms and turns about a point', () => {
    const east = mapPan(view, 100, 0, frame);
    expect(east.lon).toBeGreaterThan(view.lon);
    expect(east.lat).toBeCloseTo(view.lat, 9);
    const at = { x: 400, y: 100 };
    const before = mapFromScreen(at.x, at.y, view, frame);
    const z = mapZoomAround(view, 14, at, frame);
    const after = mapToScreen(before.lat, before.lon, z, frame);
    expect(after.x).toBeCloseTo(at.x, 6);
    expect(after.y).toBeCloseTo(at.y, 6);
    const r = mapRotateAround(view, 40, at, frame);
    expect(r.bearing).toBe(40);
    const turned = mapToScreen(before.lat, before.lon, r, frame);
    expect(turned.x).toBeCloseTo(at.x, 6);
    expect(normaliseBearing(370)).toBe(10);
    expect(normaliseBearing(-190)).toBe(170);
    expect(wrapLongitude(190)).toBe(-170);
    expect(wrapLongitude(-180)).toBe(-180);
  });

  it('fits markers and sizes the scale bar', () => {
    const fit = mapFitView([{ lat: 51, lon: 7 }, { lat: 51.01, lon: 7.02 }], frame, 48);
    const a = mapToScreen(51, 7, fit, frame);
    const b = mapToScreen(51.01, 7.02, fit, frame);
    expect(Math.min(a.x, b.x)).toBeGreaterThanOrEqual(47.9);
    expect(Math.max(a.x, b.x)).toBeLessThanOrEqual(464.1);
    expect(mapFitView([{ lat: 51, lon: 7 }], frame, 48, 17).zoom).toBe(17);
    const bar = mapScaleBar(view);
    expect(bar.px).toBeLessThanOrEqual(96);
    expect(bar.px).toBeGreaterThan(30);
    expect(bar.text).toMatch(/ (m|km)$/);
    expect(mapSummary('Map', [{ lat: 1, lon: 1, label: 'Pier' }, { lat: 2, lon: 2 }])).toBe('Map: 2 places (Pier)');
    expect(mapSummary('Map', [])).toBe('Map');
    expect(mercator(0, 0)).toEqual({ x: 0.5, y: 0.5 });
  });
});

describe('map', () => {
  it('shows a grid and a notice without tiles, and loads nothing', () => {
    const m = createMap({ label: 'Garden', center: { lat: 51, lon: 7 }, zoom: 15, markers: [{ lat: 51, lon: 7, label: 'Shed' }] });
    expect(m.el.classList.contains('mh-map--no-tiles')).toBe(true);
    expect(m.el.querySelector<HTMLElement>('.mh-map__notice')!.hidden).toBe(false);
    expect(m.el.querySelector('img')).toBeNull();
    expect(m.el.getAttribute('aria-label')).toBe('Garden: 1 place (Shed)');
    expect(m.el.getAttribute('aria-roledescription')).toBe('map');
    expect(m.el.querySelector('.mh-map__marker-label')!.textContent).toBe('Shed');
    expect(m.el.querySelector('.mh-map__scale-text')!.textContent).toMatch(/m$/);
    m.destroy();
  });

  it('asks the source for tiles, zooms, turns and resets north', () => {
    const asked: string[] = [];
    const onViewChange = vi.fn();
    const m = createMap({
      label: 'Map',
      tiles: (z, x, y) => {
        asked.push(`${z}/${x}/${y}`);
        return `data:image/svg+xml,${z}-${x}-${y}`;
      },
      attribution: 'Stand-in tiles',
      center: { lat: 51, lon: 7 },
      zoom: 12,
      onViewChange,
      onMarkerSelect: () => undefined,
      markers: [{ lat: 51, lon: 7, label: 'Home' }],
    });
    expect(asked.length).toBeGreaterThan(0);
    expect(asked.every((k) => k.startsWith('12/'))).toBe(true);
    expect(m.el.querySelectorAll('.mh-map__tile').length).toBe(asked.length);
    expect(m.el.querySelector('.mh-map__attribution')!.textContent).toBe('Stand-in tiles');
    expect(m.el.querySelector('button.mh-map__marker')!.getAttribute('aria-label')).toBe('Home');
    click(m.el.querySelector('[aria-label="Zoom in"]'));
    expect(m.getView().zoom).toBe(13);
    expect(onViewChange).toHaveBeenLastCalledWith(expect.objectContaining({ zoom: 13 }));
    key(m.el, 'ArrowRight', { shiftKey: true });
    expect(m.getView().bearing).toBe(15);
    const compass = m.el.querySelector('.mh-map__compass')!;
    expect(compass.getAttribute('aria-label')).toBe('Reset to north (facing 15°)');
    click(compass);
    expect(m.getView().bearing).toBe(0);
    key(m.el, '-');
    expect(m.getView().zoom).toBe(12);
    m.setTiles(null);
    expect(m.el.querySelector('.mh-map__tile')).toBeNull();
    m.destroy();
  });
});
