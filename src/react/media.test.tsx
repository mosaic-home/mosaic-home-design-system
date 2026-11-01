import { act, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  createCompareSlider,
  createInspector,
  createLayersPanel,
  createMap,
  createMediaTimeline,
  createTransformFields,
  createTransport,
  createZoomControl,
  createZoomableImage,
  type InspectorSection,
  type LayerItem,
  type TimelineTrack,
} from '../web/index.ts';
import { CompareSlider, Inspector, LayersPanel, MediaTimeline, TileMap, TransformFields, Transport, ZoomControl, ZoomableImage } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden`, `tabindex`, `type` and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => a.name === 'class' || a.name === 'role' || a.name === 'hidden' || a.name === 'tabindex' || a.name === 'type' || a.name.startsWith('aria-') || a.name === 'd')
      // Generated ids differ between renderers; only that the reference is there matters.
      .map((a) => `${a.name}=${a.name === 'aria-describedby' || a.name === 'aria-labelledby' ? 'id' : a.value}`)
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    Array.from(el.children).forEach(walk);
  };
  walk(root);
  return out;
}

/** Static markup, for bindings that render their own DOM. */
function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.querySelector(':scope > :not(link)')!;
}

/** Mounted with effects, for bindings that build the web component into their element. */
function mounted(node: ReactElement): { el: Element; unmount: () => void; host: HTMLDivElement } {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(node));
  return {
    el: host.firstElementChild!,
    host,
    unmount: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}

const picture = (name: string): string => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><title>${name}</title></svg>`)}`;

describe('media editors parity', () => {
  it('ZoomControl', () => {
    expect(shape(react(<ZoomControl value={1.234} fitted />))).toEqual(shape(createZoomControl({ value: 1.234, fitted: true }).el));
    expect(shape(react(<ZoomControl value={8} size="small" showFit={false} />))).toEqual(shape(createZoomControl({ value: 8, size: 'small', showFit: false }).el));
  });

  it('Transport', () => {
    expect(shape(react(<Transport label="Playback" position={65} duration={200} loop={false} playing />))).toEqual(
      shape(createTransport({ label: 'Playback', position: 65, duration: 200, loop: false, playing: true }).el),
    );
    expect(shape(react(<Transport label="Clip" fps={25} position={1.5} size="large" skip={false} />))).toEqual(shape(createTransport({ label: 'Clip', fps: 25, position: 1.5, size: 'large', skip: false }).el));
  });

  it('CompareSlider', () => {
    const before = { src: picture('a'), alt: 'Before the repaint' };
    const after = { src: picture('b'), alt: 'After the repaint' };
    const r = react(<CompareSlider label="Compare" before={before} after={after} defaultValue={30} />);
    const w = createCompareSlider({ label: 'Compare', before, after, value: 30 }).el;
    expect(shape(r)).toEqual(shape(w));
    expect((r as HTMLElement).style.getPropertyValue('--_at')).toBe('0.3');
    expect(shape(react(<CompareSlider label="Compare" before={<div>One</div>} after={<div>Two</div>} orientation="vertical" />))).toEqual(
      shape(
        createCompareSlider({
          label: 'Compare',
          before: Object.assign(document.createElement('div'), { textContent: 'One' }),
          after: Object.assign(document.createElement('div'), { textContent: 'Two' }),
          orientation: 'vertical',
        }).el,
      ),
    );
  });

  it('TransformFields', () => {
    const value = { x: 10, y: 20, width: 100, height: 50, angle: 15 };
    expect(shape(react(<TransformFields value={value} reference="center" lockAspect unit="mm" />))).toEqual(
      shape(createTransformFields({ value, reference: 'center', lockAspect: true, unit: 'mm' }).el),
    );
  });

  it('Inspector', () => {
    const sections: InspectorSection[] = [
      {
        id: 'look',
        title: 'Look',
        params: [
          { id: 'opacity', kind: 'slider', label: 'Opacity', value: 80, unit: '%', keyframe: 'on' },
          { id: 'blur', kind: 'slider', label: 'Blur', value: 2.5, max: 20, step: 0.5, keyframe: 'animated' },
          { id: 'shadow', kind: 'toggle', label: 'Shadow', value: true, keyframe: 'off' },
          { id: 'blend', kind: 'choice', label: 'Blend', value: 'screen', options: [{ value: 'normal', label: 'Normal' }, { value: 'screen', label: 'Screen' }] },
        ],
      },
      { id: 'motion', title: 'Motion', open: false, params: [] },
    ];
    expect(shape(react(<Inspector label="Properties" sections={sections} />))).toEqual(shape(createInspector({ label: 'Properties', sections }).el));
  });

  it('ZoomableImage', () => {
    const r = mounted(<ZoomableImage src={picture('plan')} alt="Floor plan" controls />);
    expect(shape(r.el)).toEqual(shape(createZoomableImage({ src: picture('plan'), alt: 'Floor plan', controls: true }).el));
    r.unmount();
  });

  it('LayersPanel', () => {
    const layers: LayerItem[] = [
      { id: 'title', name: 'Title', thumbnail: picture('t') },
      { id: 'group', name: 'Scenery', expanded: false, children: [{ id: 'hill', name: 'Hill', visible: false }] },
      { id: 'sky', name: 'Sky', locked: true },
    ];
    const r = mounted(<LayersPanel label="Layers" layers={layers} selected="sky" />);
    expect(shape(r.el)).toEqual(shape(createLayersPanel({ label: 'Layers', layers, selected: 'sky' }).el));
    r.unmount();
  });

  it('MediaTimeline', () => {
    const tracks: TimelineTrack[] = [
      { id: 'v', name: 'Video', icon: 'film', clips: [{ id: 'a', start: 0, end: 4, label: 'Opening' }] },
      { id: 'm', name: 'Music', locked: true, clips: [{ id: 'c', start: 1, end: 9, tone: 3 }] },
    ];
    const r = mounted(<MediaTimeline label="Timeline" duration={30} tracks={tracks} position={2} selected="a" />);
    expect(shape(r.el)).toEqual(shape(createMediaTimeline({ label: 'Timeline', duration: 30, tracks, position: 2, selected: 'a' }).el));
    r.unmount();
  });

  it('TileMap', () => {
    const markers = [{ lat: 51, lon: 7, label: 'Shed' }];
    const r = mounted(<TileMap label="Garden" center={{ lat: 51, lon: 7 }} zoom={15} markers={markers} />);
    expect(shape(r.el)).toEqual(shape(createMap({ label: 'Garden', center: { lat: 51, lon: 7 }, zoom: 15, markers }).el));
    r.unmount();
  });
});

describe('media editors behaviour', () => {
  it('ZoomControl reports steps', () => {
    const onChange = vi.fn();
    const r = mounted(<ZoomControl value={1} onChange={onChange} />);
    act(() => r.el.querySelectorAll<HTMLButtonElement>('.mh-zoom-control__step')[1]!.click());
    expect(onChange).toHaveBeenLastCalledWith(1.5);
    r.unmount();
  });

  it('Transport toggles play and steps without new props', () => {
    const onSeek = vi.fn();
    const onPlayingChange = vi.fn();
    const r = mounted(<Transport label="Playback" duration={10} onSeek={onSeek} onPlayingChange={onPlayingChange} />);
    act(() => r.el.querySelector<HTMLButtonElement>('.mh-transport__play')!.click());
    expect(onPlayingChange).toHaveBeenLastCalledWith(true);
    expect(r.el.querySelector('.mh-transport__play')!.getAttribute('aria-label')).toBe('Pause');
    act(() => r.el.querySelector<HTMLButtonElement>('[aria-label="Step forward"]')!.click());
    expect(onSeek).toHaveBeenLastCalledWith(1);
    expect(r.el.querySelector('.mh-transport__current')!.textContent).toBe('0:01');
    r.unmount();
  });

  it('TransformFields commits with keys', () => {
    const onChange = vi.fn();
    const r = mounted(<TransformFields value={{ x: 0, y: 0, width: 10, height: 10, angle: 0 }} onChange={onChange} />);
    const x = r.el.querySelector<HTMLInputElement>('[aria-label="X position"]')!;
    act(() => {
      x.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    });
    expect(onChange).toHaveBeenLastCalledWith({ x: 1, y: 0, width: 10, height: 10, angle: 0 }, 'x');
    expect(x.value).toBe('1');
    r.unmount();
  });

  it('LayersPanel follows new props', () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    act(() => root.render(<LayersPanel label="Layers" layers={[{ id: 'a', name: 'A' }]} />));
    expect(host.querySelectorAll('.mh-layers__item')).toHaveLength(1);
    act(() => root.render(<LayersPanel label="Layers" layers={[{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]} selected="b" />));
    expect(host.querySelectorAll('.mh-layers__item')).toHaveLength(2);
    expect(host.querySelector('.is-selected .mh-layers__label')!.textContent).toBe('B');
    act(() => root.unmount());
  });

  it('TileMap asks only the given source and moves with props', () => {
    const asked: string[] = [];
    const tiles = (z: number, x: number, y: number): string => {
      asked.push(`${z}/${x}/${y}`);
      return `data:image/svg+xml,${z}-${x}-${y}`;
    };
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    act(() => root.render(<TileMap label="Map" tiles={tiles} center={{ lat: 51, lon: 7 }} zoom={12} />));
    const first = asked.length;
    expect(first).toBeGreaterThan(0);
    // Re-rendering with the same source doesn't reload.
    act(() => root.render(<TileMap label="Map" tiles={tiles} center={{ lat: 51, lon: 7 }} zoom={12} />));
    expect(asked.length).toBe(first);
    act(() => root.render(<TileMap label="Map" tiles={tiles} center={{ lat: 51, lon: 7 }} zoom={13} />));
    expect(asked.some((k) => k.startsWith('13/'))).toBe(true);
    act(() => root.unmount());
    host.remove();
  });
});
