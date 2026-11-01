// Pointer gestures for the pannable views (zoomable image, map): one-finger or mouse pan, two-finger pinch and
// twist, wheel and double tap. Positions are relative to the element's top-left corner, in CSS pixels.

export interface GesturePoint {
  x: number;
  y: number;
}

export interface GestureCallbacks {
  /** Return false to leave a pointer alone (for example one that went down on a button). */
  accept?(event: PointerEvent): boolean;
  /** A gesture began (first pointer down). */
  onStart?(): void;
  /** The pointers moved by `dx`, `dy` (the midpoint when there are two). */
  onPan?(dx: number, dy: number): void;
  /** Two pointers: distance grew by `factor` and the line between them turned by `rotation` degrees (clockwise). */
  onPinch?(factor: number, at: GesturePoint, rotation: number): void;
  /** A wheel turn over the element; call `preventDefault` on the event to keep the page from scrolling. */
  onWheel?(event: WheelEvent, at: GesturePoint): void;
  /** Two quick taps or clicks in about the same place. */
  onDoubleTap?(at: GesturePoint, event: PointerEvent): void;
  /** A press that didn't move. */
  onTap?(at: GesturePoint, event: PointerEvent): void;
  /** The last pointer lifted; `moved` says whether it was a drag. */
  onEnd?(moved: boolean): void;
}

/** Movement under this many pixels is still a tap. */
export const TAP_SLOP = 6;
/** Two taps within this many milliseconds are a double tap. */
export const DOUBLE_TAP_MS = 320;

/** Whole-wheel zoom factor for a wheel event: one notch (about 100 px) zooms by about 1.2x. */
export function wheelZoomFactor(event: Pick<WheelEvent, 'deltaY' | 'deltaMode' | 'ctrlKey'>): number {
  const lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1;
  // Trackpad pinches arrive as ctrl + wheel with small deltas; give them more weight.
  const k = event.ctrlKey ? 0.01 : 0.0018;
  return Math.exp(-event.deltaY * lines * k);
}

/** Wires the gestures onto `el`; returns a function that removes them. */
export function attachGestures(el: HTMLElement, cb: GestureCallbacks): () => void {
  const pointers = new Map<number, GesturePoint>();
  let moved = false;
  let maxPointers = 0;
  let start: GesturePoint = { x: 0, y: 0 };
  let lastTap: { at: GesturePoint; time: number } | null = null;

  const local = (e: { clientX: number; clientY: number }): GesturePoint => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: PointerEvent): void => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (cb.accept && !cb.accept(e)) return;
    const p = local(e);
    if (pointers.size === 0) {
      moved = false;
      maxPointers = 0;
      start = p;
      cb.onStart?.();
    }
    pointers.set(e.pointerId, p);
    maxPointers = Math.max(maxPointers, pointers.size);
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Not every environment supports capture; the gesture still works while the pointer stays over the element.
    }
  };

  const move = (e: PointerEvent): void => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    if (!moved && Math.hypot(p.x - start.x, p.y - start.y) > TAP_SLOP) moved = true;
    const others = [...pointers.entries()].filter(([id]) => id !== e.pointerId);
    const other = others[0]?.[1];
    if (other) {
      const before = { x: (prev.x + other.x) / 2, y: (prev.y + other.y) / 2 };
      const after = { x: (p.x + other.x) / 2, y: (p.y + other.y) / 2 };
      const d0 = Math.hypot(prev.x - other.x, prev.y - other.y);
      const d1 = Math.hypot(p.x - other.x, p.y - other.y);
      const a0 = Math.atan2(prev.y - other.y, prev.x - other.x);
      const a1 = Math.atan2(p.y - other.y, p.x - other.x);
      let turn = ((a1 - a0) * 180) / Math.PI;
      if (turn > 180) turn -= 360;
      if (turn < -180) turn += 360;
      cb.onPan?.(after.x - before.x, after.y - before.y);
      if (d0 > 0 && d1 > 0) cb.onPinch?.(d1 / d0, after, turn);
      moved = true;
    } else {
      cb.onPan?.(p.x - prev.x, p.y - prev.y);
    }
    pointers.set(e.pointerId, p);
  };

  const up = (e: PointerEvent): void => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size > 0) return;
    const at = local(e);
    if (!moved && maxPointers === 1 && e.type === 'pointerup') {
      const now = e.timeStamp || performance.now();
      if (lastTap && now - lastTap.time < DOUBLE_TAP_MS && Math.hypot(at.x - lastTap.at.x, at.y - lastTap.at.y) < TAP_SLOP * 4) {
        lastTap = null;
        cb.onDoubleTap?.(at, e);
      } else {
        lastTap = { at, time: now };
        cb.onTap?.(at, e);
      }
    }
    cb.onEnd?.(moved);
  };

  const wheel = (e: WheelEvent): void => cb.onWheel?.(e, local(e));

  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  el.addEventListener('lostpointercapture', up);
  el.addEventListener('wheel', wheel, { passive: false });
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('lostpointercapture', up);
    el.removeEventListener('wheel', wheel);
  };
}
