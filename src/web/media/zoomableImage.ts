import { h, uid } from '../dom.ts';
import { attachGestures, wheelZoomFactor, type GesturePoint } from './gestures.ts';
import { clamp } from './timecode.ts';
import { createZoomControl, type ZoomControlHandle } from './zoomControl.ts';

// The picture is laid out at its "contain" size (the whole picture in the frame, scale 1) and moved with a
// translate + scale transform from its top-left corner. Pure helpers below do the maths; the component wires
// gestures, keys and the optional zoom control to them.

/** Where the picture is: its top-left corner in frame pixels and its scale over the fitted size. */
export interface ZoomView {
  scale: number;
  x: number;
  y: number;
}

/** Sizes in CSS pixels: the frame, and the picture fitted inside it at scale 1. */
export interface ZoomBox {
  frameWidth: number;
  frameHeight: number;
  contentWidth: number;
  contentHeight: number;
}

export interface ZoomLimits {
  minScale: number;
  maxScale: number;
}

/** The size of a `naturalWidth` x `naturalHeight` picture fitted inside the frame without cropping. */
export function fitContain(frameWidth: number, frameHeight: number, naturalWidth: number, naturalHeight: number): { width: number; height: number } {
  if (!(naturalWidth > 0 && naturalHeight > 0 && frameWidth > 0 && frameHeight > 0)) return { width: Math.max(0, frameWidth), height: Math.max(0, frameHeight) };
  const s = Math.min(frameWidth / naturalWidth, frameHeight / naturalHeight);
  return { width: naturalWidth * s, height: naturalHeight * s };
}

/** Keeps the scale in its limits, centres the picture along an axis where it is smaller than the frame and keeps the frame covered where it is larger. */
export function clampZoomView(view: ZoomView, box: ZoomBox, limits: ZoomLimits): ZoomView {
  const scale = clamp(view.scale, limits.minScale, limits.maxScale);
  const axis = (pos: number, frame: number, content: number): number => {
    const size = content * scale;
    return size <= frame ? (frame - size) / 2 : clamp(pos, frame - size, 0);
  };
  return { scale, x: axis(view.x, box.frameWidth, box.contentWidth), y: axis(view.y, box.frameHeight, box.contentHeight) };
}

/** The view at rest: scale 1, centred. */
export function fittedZoomView(box: ZoomBox): ZoomView {
  return { scale: 1, x: (box.frameWidth - box.contentWidth) / 2, y: (box.frameHeight - box.contentHeight) / 2 };
}

/** Scales to `scale` keeping the picture point under `at` (frame pixels) where it is, then clamps. */
export function zoomViewTo(view: ZoomView, scale: number, at: GesturePoint, box: ZoomBox, limits: ZoomLimits): ZoomView {
  const next = clamp(scale, limits.minScale, limits.maxScale);
  const k = next / view.scale;
  return clampZoomView({ scale: next, x: at.x - (at.x - view.x) * k, y: at.y - (at.y - view.y) * k }, box, limits);
}

/** Moves by `dx`, `dy` frame pixels, then clamps. */
export function panZoomView(view: ZoomView, dx: number, dy: number, box: ZoomBox, limits: ZoomLimits): ZoomView {
  return clampZoomView({ scale: view.scale, x: view.x + dx, y: view.y + dy }, box, limits);
}

/** CSS transform of the picture for a view. */
export function zoomTransform(view: ZoomView): string {
  const r = (n: number): number => Math.round(n * 100) / 100;
  return `translate(${r(view.x)}px, ${r(view.y)}px) scale(${Math.round(view.scale * 10000) / 10000})`;
}

export interface ZoomableImageOptions {
  src: string;
  /** Describes the picture; also the frame's accessible name. */
  alt: string;
  /** Largest zoom over the fitted size (default 4). */
  maxScale?: number;
  /** Zoom a double tap or double click goes to, and back (default 2.5). */
  doubleTapScale?: number;
  /** Shows a zoom control in the corner. */
  controls?: boolean;
  /** Width / height of the frame (default 4 / 3). */
  aspect?: number;
  /** Spoken how-to; the default names the keys. */
  hint?: string;
  onChange?: (view: ZoomView) => void;
}

export interface ZoomableImageHandle {
  el: HTMLDivElement;
  getView(): ZoomView;
  /** Zooms about the middle of the frame. */
  setScale(scale: number, animate?: boolean): void;
  zoomBy(factor: number, animate?: boolean): void;
  /** Back to the fitted view. */
  reset(animate?: boolean): void;
  /** Re-measures the frame (it also follows resizes by itself where ResizeObserver exists). */
  layout(): void;
  destroy(): void;
}

export const ZOOMABLE_HINT = 'Drag to pan, pinch, scroll or double-tap to zoom. Keys: plus and minus zoom, arrows pan, 0 resets.';
export const ZOOMABLE_ASPECT = 4 / 3;
const KEY_PAN = 48;
const KEY_ZOOM = 1.25;

/** `mountZoomableImage` on a new `<div>`. */
export function createZoomableImage(options: ZoomableImageOptions): ZoomableImageHandle {
  return mountZoomableImage(h('div'), options);
}

/**
 * `.mh-zoomable-image`: a picture in a frame that pinches, wheels, drags and double-taps to zoom (states
 * `.is-zoomed`, `.is-dragging`, `.is-animating`). The frame is focusable (`role="group"`, named by `alt`, with a
 * spoken hint): + and − zoom, arrows pan, 0 resets. Parts: `__img`, `__hint`, `__controls` (a `.mh-zoom-control`
 * whose Fit resets). Builds into `root`, which may be an empty element another renderer owns.
 */
export function mountZoomableImage(root: HTMLDivElement, options: ZoomableImageOptions): ZoomableImageHandle {
  const limits: ZoomLimits = { minScale: 1, maxScale: Math.max(1, options.maxScale ?? 4) };
  const doubleTap = clamp(options.doubleTapScale ?? 2.5, 1, limits.maxScale);
  const hintId = uid('mh-zoom-hint');
  const img = h('img', { class: 'mh-zoomable-image__img', src: options.src, alt: '', draggable: 'false' });
  const hint = h('span', { class: 'mh-visually-hidden', id: hintId }, options.hint ?? ZOOMABLE_HINT);
  root.classList.add('mh-zoomable-image');
  root.tabIndex = 0;
  root.setAttribute('role', 'group');
  root.setAttribute('aria-roledescription', 'zoomable image');
  root.setAttribute('aria-label', options.alt);
  root.setAttribute('aria-describedby', hintId);
  root.style.aspectRatio = String(options.aspect && options.aspect > 0 ? options.aspect : ZOOMABLE_ASPECT);

  let box: ZoomBox = { frameWidth: 0, frameHeight: 0, contentWidth: 0, contentHeight: 0 };
  let view: ZoomView = { scale: 1, x: 0, y: 0 };
  let animTimer: ReturnType<typeof setTimeout> | undefined;
  let zoom: ZoomControlHandle | null = null;

  const paint = (): void => {
    img.style.width = `${box.contentWidth}px`;
    img.style.height = `${box.contentHeight}px`;
    img.style.transform = zoomTransform(view);
    root.classList.toggle('is-zoomed', view.scale > 1.001);
    zoom?.setValue(view.scale);
    zoom?.setFitted(view.scale <= 1.001);
  };
  const apply = (next: ZoomView, animate = false): void => {
    if (animate) {
      root.classList.add('is-animating');
      clearTimeout(animTimer);
      animTimer = setTimeout(() => root.classList.remove('is-animating'), 400);
    }
    const changed = next.scale !== view.scale || next.x !== view.x || next.y !== view.y;
    view = next;
    paint();
    if (changed) options.onChange?.({ ...view });
  };
  const layout = (): void => {
    const fw = root.clientWidth;
    const fh = root.clientHeight;
    const fitted = fitContain(fw, fh, img.naturalWidth, img.naturalHeight);
    const prev = box;
    box = { frameWidth: fw, frameHeight: fh, contentWidth: fitted.width, contentHeight: fitted.height };
    if (view.scale <= 1.001 || !prev.contentWidth) view = fittedZoomView(box);
    else {
      // Keep the same picture point in the middle when the frame changes size.
      const k = prev.contentWidth ? box.contentWidth / prev.contentWidth : 1;
      const cx = (prev.frameWidth / 2 - view.x) * k;
      const cy = (prev.frameHeight / 2 - view.y) * k;
      view = clampZoomView({ scale: view.scale, x: fw / 2 - cx, y: fh / 2 - cy }, box, limits);
    }
    paint();
  };
  const centre = (): GesturePoint => ({ x: box.frameWidth / 2, y: box.frameHeight / 2 });
  const zoomAt = (scale: number, at: GesturePoint, animate = false): void => apply(zoomViewTo(view, scale, at, box, limits), animate);

  img.addEventListener('load', layout);
  const detach = attachGestures(root, {
    accept: (e) => !(e.target as Element).closest('.mh-zoomable-image__controls'),
    onStart: () => root.classList.add('is-dragging'),
    onEnd: () => root.classList.remove('is-dragging'),
    onPan: (dx, dy) => apply(panZoomView(view, dx, dy, box, limits)),
    onPinch: (factor, at) => zoomAt(view.scale * factor, at),
    onWheel: (e, at) => {
      e.preventDefault();
      zoomAt(view.scale * wheelZoomFactor(e), at);
    },
    onDoubleTap: (at) => (view.scale > 1.001 ? apply(fittedZoomView(box), true) : zoomAt(doubleTap, at, true)),
  });
  const onKey = (e: KeyboardEvent): void => {
    if (e.target !== root || e.altKey || e.ctrlKey || e.metaKey) return;
    const pan = (dx: number, dy: number): void => apply(panZoomView(view, dx, dy, box, limits));
    switch (e.key) {
      case '+':
      case '=':
        zoomAt(view.scale * KEY_ZOOM, centre(), true);
        break;
      case '-':
      case '_':
        zoomAt(view.scale / KEY_ZOOM, centre(), true);
        break;
      case '0':
        apply(fittedZoomView(box), true);
        break;
      case 'ArrowLeft':
        pan(KEY_PAN, 0);
        break;
      case 'ArrowRight':
        pan(-KEY_PAN, 0);
        break;
      case 'ArrowUp':
        pan(0, KEY_PAN);
        break;
      case 'ArrowDown':
        pan(0, -KEY_PAN);
        break;
      default:
        return;
    }
    e.preventDefault();
  };
  root.addEventListener('keydown', onKey);

  const children: Node[] = [img, hint];
  if (options.controls) {
    zoom = createZoomControl({
      value: 1,
      min: 1,
      max: limits.maxScale,
      presets: [1, 1.5, 2, 3, 4, 6, 8].filter((p) => p <= limits.maxScale),
      size: 'small',
      fitted: true,
      onChange: (v) => zoomAt(v, centre(), true),
      onFit: () => apply(fittedZoomView(box), true),
    });
    children.push(h('div', { class: 'mh-zoomable-image__controls' }, zoom.el));
  }
  root.replaceChildren(...children);

  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(() => layout()) : null;
  observer?.observe(root);
  layout();

  return {
    el: root,
    getView: () => ({ ...view }),
    setScale: (scale, animate = false) => zoomAt(scale, centre(), animate),
    zoomBy: (factor, animate = false) => zoomAt(view.scale * factor, centre(), animate),
    reset: (animate = false) => apply(fittedZoomView(box), animate),
    layout,
    destroy() {
      detach();
      root.removeEventListener('keydown', onKey);
      observer?.disconnect();
      clearTimeout(animTimer);
      img.removeEventListener('load', layout);
    },
  };
}
