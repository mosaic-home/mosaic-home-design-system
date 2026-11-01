import { mdiLockOutline } from '@mdi/js';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';
import { wheelZoomFactor } from './gestures.ts';
import { clamp, formatTimecode } from './timecode.ts';

export type TimelineClipTone = 1 | 2 | 3 | 4 | 5 | 6;

export interface TimelineClip {
  id: string;
  /** Seconds. */
  start: number;
  end: number;
  label?: string;
  /** A chart series colour (1 to 6); default the accent. */
  tone?: TimelineClipTone;
}

export interface TimelineTrack {
  id: string;
  name: string;
  icon?: IconName | string;
  clips: readonly TimelineClip[];
  /** Clips can't be moved or trimmed. */
  locked?: boolean;
}

export interface TimelineClipChange {
  trackId: string;
  clipId: string;
  start: number;
  end: number;
}

export interface MediaTimelineLabels {
  playhead: string;
  hint: string;
  locked: string;
}

export const MEDIA_TIMELINE_LABELS: MediaTimelineLabels = {
  playhead: 'Playhead',
  hint: 'Arrow keys move the clip, Shift and arrow keys change its length.',
  locked: 'locked',
};

export interface MediaTimelineOptions {
  /** Accessible name ("Timeline"). */
  label: string;
  /** Seconds. */
  duration: number;
  tracks: readonly TimelineTrack[];
  /** Playhead, seconds. */
  position?: number;
  /** Pixels per second (default 48). */
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** Frames per second: timecodes gain frames and keys step by a frame. */
  fps?: number;
  /** Snap to clip edges, the playhead and the grid while dragging (default true). */
  snap?: boolean;
  /** Grid for snapping and key steps, seconds; default the ruler's small tick (or one frame with `fps`). */
  snapStep?: number;
  selected?: string | null;
  /** Scroll to keep the playhead in view when `setPosition` moves it (default true). */
  follow?: boolean;
  labels?: Partial<MediaTimelineLabels>;
  onSeek?: (position: number) => void;
  onSelect?: (clipId: string | null) => void;
  /** A clip moved or was trimmed; `committed` once the drag ends (key presses commit at once). */
  onClipChange?: (change: TimelineClipChange, committed: boolean) => void;
  /** Ctrl or ⌘ + wheel (or a trackpad pinch) changed the zoom. */
  onZoomChange?: (zoom: number) => void;
}

export interface MediaTimelineHandle {
  el: HTMLDivElement;
  setPosition(position: number): void;
  setZoom(zoom: number): void;
  setTracks(tracks: readonly TimelineTrack[]): void;
  setSelected(clipId: string | null): void;
  setSnap(snap: boolean): void;
  getTracks(): TimelineTrack[];
  destroy(): void;
}

// Maths -----------------------------------------------------------------------------------------------------------

/** Labelled ticks are at least this far apart, in pixels. */
export const TICK_GAP = 72;
/** Small ticks are at least this far apart. */
export const MINOR_GAP = 8;
/** A dragged edge snaps within this many pixels. */
export const SNAP_PX = 8;

const STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200];

export interface TimelineTicks {
  /** Seconds between labelled ticks. */
  major: number;
  /** Seconds between small ticks (equal to `major` when there is no room for them). */
  minor: number;
  /** Times of the labelled ticks, from 0 to the duration. */
  ticks: number[];
}

/** Ruler spacing for a zoom: labelled ticks at least `TICK_GAP` apart, small ticks dividing them. */
export function timelineTicks(duration: number, zoom: number): TimelineTicks {
  const major = STEPS.find((s) => s * zoom >= TICK_GAP) ?? STEPS[STEPS.length - 1]!;
  const div = [10, 5, 4, 2].find((d) => (major / d) * zoom >= MINOR_GAP);
  const minor = div ? major / div : major;
  const ticks: number[] = [];
  for (let k = 0; k * major <= duration + 1e-9 && ticks.length < 10000; k++) ticks.push(Math.round(k * major * 1000) / 1000);
  return { major, minor, ticks };
}

/** A ruler label: `1:30`, or `0:01.5` when ticks are under a second apart. */
export function formatRulerTime(t: number, step: number): string {
  return formatTimecode(t, { decimals: step < 1 ? 1 : 0 });
}

export interface SnapResult {
  time: number;
  /** The time it snapped to, or null. */
  to: number | null;
}

/** The nearest target or grid line within `threshold` seconds of `t`; otherwise `t` itself. */
export function snapTime(t: number, targets: readonly number[], grid: number | null, threshold: number): SnapResult {
  let best: SnapResult = { time: t, to: null };
  let dist = threshold;
  for (const target of targets) {
    const d = Math.abs(target - t);
    if (d <= dist) {
      dist = d;
      best = { time: target, to: target };
    }
  }
  if (grid && grid > 0 && best.to === null) {
    const g = Math.round(t / grid) * grid;
    if (Math.abs(g - t) <= threshold) best = { time: Math.round(g * 1e6) / 1e6, to: Math.round(g * 1e6) / 1e6 };
  }
  return best;
}

/** Edges a dragged clip can snap to: other clips' starts and ends on every track, the playhead, 0 and the end. */
export function timelineSnapTargets(tracks: readonly TimelineTrack[], clipId: string, position: number, duration: number): number[] {
  const out = [0, duration, position];
  for (const track of tracks) for (const c of track.clips) if (c.id !== clipId) out.push(c.start, c.end);
  return out;
}

export type ClipDragMode = 'move' | 'start' | 'end';

/** Room a clip has on its track: from the end of the clip before it to the start of the one after. */
export function clipRoom(track: TimelineTrack, clipId: string, duration: number): { min: number; max: number } {
  const clip = track.clips.find((c) => c.id === clipId);
  if (!clip) return { min: 0, max: duration };
  let min = 0;
  let max = duration;
  for (const c of track.clips) {
    if (c.id === clipId) continue;
    if (c.end <= clip.start + 1e-9) min = Math.max(min, c.end);
    if (c.start >= clip.end - 1e-9) max = Math.min(max, c.start);
  }
  return { min, max };
}

export interface ClipDragInput {
  mode: ClipDragMode;
  /** The clip when the drag began. */
  start: number;
  end: number;
  /** Seconds the pointer has moved. */
  delta: number;
  room: { min: number; max: number };
  /** Shortest clip, seconds. */
  minLength: number;
  targets: readonly number[];
  grid: number | null;
  /** Snap distance in seconds; 0 turns snapping off. */
  threshold: number;
}

/** A clip's new start and end for a drag, snapped and kept inside its room; `to` is the edge it snapped to. */
export function dragClip(input: ClipDragInput): { start: number; end: number; to: number | null } {
  const { mode, start, end, delta, room, minLength, targets, grid, threshold } = input;
  const snap = (t: number): SnapResult => (threshold > 0 ? snapTime(t, targets, grid, threshold) : { time: t, to: null });
  if (mode === 'move') {
    const length = end - start;
    const raw = start + delta;
    const a = snap(raw);
    const b = snap(raw + length);
    let next = raw;
    let to: number | null = null;
    const da = a.to === null ? Infinity : Math.abs(a.time - raw);
    const db = b.to === null ? Infinity : Math.abs(b.time - (raw + length));
    if (da <= db && a.to !== null) {
      next = a.time;
      to = a.to;
    } else if (b.to !== null) {
      next = b.time - length;
      to = b.to;
    }
    const s = clamp(next, room.min, Math.max(room.min, room.max - length));
    return { start: s, end: s + length, to: s === next ? to : null };
  }
  if (mode === 'start') {
    const r = snap(start + delta);
    const s = clamp(r.time, room.min, end - minLength);
    return { start: s, end, to: s === r.time ? r.to : null };
  }
  const r = snap(end + delta);
  const e = clamp(r.time, start + minLength, room.max);
  return { start, end: e, to: e === r.time ? r.to : null };
}

export function timelineClipClass(clip: Pick<TimelineClip, 'tone'>, selected: boolean): string {
  return cx('mh-media-timeline__clip', clip.tone && `mh-media-timeline__clip--tone-${clip.tone}`, selected && 'is-selected');
}

// Component -------------------------------------------------------------------------------------------------------

/** `mountMediaTimeline` on a new `<div>`. */
export function createMediaTimeline(options: MediaTimelineOptions): MediaTimelineHandle {
  return mountMediaTimeline(h('div'), options);
}

/**
 * `.mh-media-timeline`: tracks of clips under a time ruler, with a playhead. Parts: `__scroll` (scrolls sideways)
 * > `__grid` > `__corner` (the playhead's timecode, `__time`), `__ruler` (a slider for the playhead: arrows, Page
 * Up / Down, Home / End; click or drag to seek) with `__tick`s, per track a sticky `__track-name` and a `__lane`
 * (`.is-locked`) of `__clip` buttons (`--tone-1…6`, `.is-selected`, with `__clip-label` and trim handles
 * `__clip-handle--start | --end`), and an `__overlay` with `__playhead` and the `__snap` guide. Drag a clip to move
 * it, its edges to trim; edges snap to other clips, the playhead and the grid. Ctrl or ⌘ + wheel zooms.
 * Builds into `root`.
 */
export function mountMediaTimeline(root: HTMLDivElement, options: MediaTimelineOptions): MediaTimelineHandle {
  const labels = { ...MEDIA_TIMELINE_LABELS, ...options.labels };
  const minZoom = options.minZoom ?? 4;
  const maxZoom = options.maxZoom ?? 400;
  const fps = options.fps && options.fps > 0 ? Math.round(options.fps) : 0;
  const hintId = uid('mh-timeline-hint');
  const duration = Math.max(0, options.duration);
  let tracks: TimelineTrack[] = options.tracks.map((t) => ({ ...t, clips: [...t.clips] }));
  let position = clamp(options.position ?? 0, 0, duration);
  let zoom = clamp(options.zoom ?? 48, minZoom, maxZoom);
  let selected = options.selected ?? null;
  let snap = options.snap !== false;
  const follow = options.follow !== false;

  const tc = (t: number): string => formatTimecode(t, { fps, hours: duration >= 3600 });
  const minLength = fps ? 1 / fps : 0.1;
  const gridStep = (): number => options.snapStep ?? (fps ? 1 / fps : timelineTicks(duration, zoom).minor);
  const keyStep = (): number => options.snapStep ?? (fps ? 1 / fps : timelineTicks(duration, zoom).minor);

  const time = h('span', { class: 'mh-media-timeline__time', 'aria-hidden': 'true' });
  const corner = h('div', { class: 'mh-media-timeline__corner' }, time);
  const ruler = h('div', { class: 'mh-media-timeline__ruler', role: 'slider', tabindex: 0, 'aria-label': labels.playhead, 'aria-valuemin': 0 });
  const playhead = h('div', { class: 'mh-media-timeline__playhead' });
  const guide = h('div', { class: 'mh-media-timeline__snap' });
  guide.hidden = true;
  const overlay = h('div', { class: 'mh-media-timeline__overlay', 'aria-hidden': 'true' }, playhead, guide);
  const grid = h('div', { class: 'mh-media-timeline__grid' });
  const scroll = h('div', { class: 'mh-media-timeline__scroll' }, grid);
  const hint = h('span', { class: 'mh-visually-hidden', id: hintId }, labels.hint);
  root.classList.add('mh-media-timeline');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', options.label);
  root.replaceChildren(scroll, hint);

  const clipEls = new Map<string, HTMLButtonElement>();

  const paintPosition = (): void => {
    playhead.style.left = `${position * zoom}px`;
    time.textContent = tc(position);
    ruler.setAttribute('aria-valuenow', String(Math.round(position * 1000) / 1000));
    ruler.setAttribute('aria-valuetext', tc(position));
  };
  const clipLabel = (track: TimelineTrack, clip: TimelineClip): string =>
    `${clip.label ?? track.name}, ${tc(clip.start)} to ${tc(clip.end)}${track.locked ? `, ${labels.locked}` : ''}`;
  const paintClip = (el: HTMLElement, track: TimelineTrack, clip: TimelineClip): void => {
    el.style.left = `${clip.start * zoom}px`;
    el.style.width = `${Math.max(2, (clip.end - clip.start) * zoom)}px`;
    el.setAttribute('aria-label', clipLabel(track, clip));
  };

  const seek = (t: number): void => {
    const next = clamp(t, 0, duration);
    if (next === position) return;
    position = next;
    paintPosition();
    options.onSeek?.(position);
  };
  const select = (id: string | null): void => {
    if (selected === id) return;
    selected = id;
    for (const [cid, el] of clipEls) {
      el.classList.toggle('is-selected', cid === id);
      el.setAttribute('aria-pressed', String(cid === id));
    }
    options.onSelect?.(id);
  };
  const setClip = (trackId: string, clipId: string, start: number, end: number, committed: boolean): void => {
    const track = tracks.find((t) => t.id === trackId);
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!track || !clip) return;
    const next = { ...clip, start: Math.round(start * 1e6) / 1e6, end: Math.round(end * 1e6) / 1e6 };
    track.clips = track.clips.map((c) => (c.id === clipId ? next : c));
    const el = clipEls.get(clipId);
    if (el) paintClip(el, track, next);
    options.onClipChange?.({ trackId, clipId, start: next.start, end: next.end }, committed);
  };
  const showGuide = (t: number | null): void => {
    guide.hidden = t === null;
    if (t !== null) guide.style.left = `${t * zoom}px`;
  };

  // Seeking on the ruler, and on empty lane space.
  const xToTime = (clientX: number): number => (clientX - ruler.getBoundingClientRect().left) / zoom;
  const seekDrag = (target: HTMLElement, lane: boolean): void => {
    let id: number | null = null;
    const at = (e: PointerEvent): number => {
      const t = xToTime(e.clientX);
      if (!snap) return t;
      const r = snapTime(t, timelineSnapTargets(tracks, '', -1, duration), null, SNAP_PX / zoom);
      return r.time;
    };
    target.addEventListener('pointerdown', (e) => {
      // On a lane only its empty space seeks; a press on a clip is the clip's.
      if ((lane && e.target !== target) || (e.pointerType === 'mouse' && e.button !== 0)) return;
      id = e.pointerId;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Capture is optional.
      }
      if (lane) select(null);
      seek(at(e));
    });
    target.addEventListener('pointermove', (e) => {
      if (id === e.pointerId) seek(at(e));
    });
    const end = (e: PointerEvent): void => {
      if (id === e.pointerId) id = null;
    };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  };
  seekDrag(ruler, false);
  ruler.addEventListener('keydown', (e) => {
    const step = fps ? 1 / fps : 1;
    const big = 10;
    let t: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') t = position + (e.shiftKey ? step * big : step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') t = position - (e.shiftKey ? step * big : step);
    else if (e.key === 'PageUp') t = position + big;
    else if (e.key === 'PageDown') t = position - big;
    else if (e.key === 'Home') t = 0;
    else if (e.key === 'End') t = duration;
    if (t === null) return;
    e.preventDefault();
    seek(Math.round(t * 1e6) / 1e6);
    keepInView();
  });

  const clipDrag = (el: HTMLButtonElement, track: TimelineTrack, clipId: string): void => {
    let drag: { id: number; x: number; mode: ClipDragMode; start: number; end: number; moved: boolean } | null = null;
    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      select(clipId);
      const live = tracks.find((t) => t.id === track.id);
      const clip = live?.clips.find((c) => c.id === clipId);
      if (!live || !clip || live.locked) return;
      const part = (e.target as Element).closest('.mh-media-timeline__clip-handle');
      const mode: ClipDragMode = part?.classList.contains('mh-media-timeline__clip-handle--start') ? 'start' : part ? 'end' : 'move';
      drag = { id: e.pointerId, x: e.clientX, mode, start: clip.start, end: clip.end, moved: false };
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Capture is optional.
      }
      el.classList.add('is-dragging');
    });
    el.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 3) return;
      drag.moved = true;
      const live = tracks.find((t) => t.id === track.id)!;
      const r = dragClip({
        mode: drag.mode,
        start: drag.start,
        end: drag.end,
        delta: dx / zoom,
        room: clipRoom(live, clipId, duration),
        minLength,
        targets: timelineSnapTargets(tracks, clipId, position, duration),
        grid: gridStep(),
        threshold: snap ? SNAP_PX / zoom : 0,
      });
      showGuide(r.to);
      setClip(track.id, clipId, r.start, r.end, false);
    });
    const end = (e: PointerEvent): void => {
      if (!drag || drag.id !== e.pointerId) return;
      const moved = drag.moved;
      drag = null;
      el.classList.remove('is-dragging');
      showGuide(null);
      if (moved) {
        const clip = tracks.find((t) => t.id === track.id)?.clips.find((c) => c.id === clipId);
        if (clip) setClip(track.id, clipId, clip.start, clip.end, true);
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('click', () => select(clipId));
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const live = tracks.find((t) => t.id === track.id);
      const clip = live?.clips.find((c) => c.id === clipId);
      if (!live || !clip || live.locked) return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const r = dragClip({
        mode: e.shiftKey ? 'end' : 'move',
        start: clip.start,
        end: clip.end,
        delta: dir * keyStep(),
        room: clipRoom(live, clipId, duration),
        minLength,
        targets: [],
        grid: null,
        threshold: 0,
      });
      setClip(track.id, clipId, r.start, r.end, true);
    });
  };

  const render = (): void => {
    const ticks = timelineTicks(duration, zoom);
    grid.style.setProperty('--_width', `${timelineWidth(duration, zoom)}px`);
    grid.style.setProperty('--_major', `${ticks.major * zoom}px`);
    grid.style.setProperty('--_minor', `${ticks.minor * zoom}px`);
    ruler.setAttribute('aria-valuemax', String(duration));
    ruler.replaceChildren(
      ...ticks.ticks.map((t) => h('span', { class: 'mh-media-timeline__tick', 'aria-hidden': 'true', style: `left: ${t * zoom}px` }, formatRulerTime(t, ticks.major))),
    );
    clipEls.clear();
    const rows: HTMLElement[] = [];
    for (const track of tracks) {
      const line = rows.length / 2 + 2;
      rows.push(h('div', { class: 'mh-media-timeline__track-name', style: `grid-area: ${line} / 1` }, track.icon ? createIcon(track.icon) : null, h('span', { class: 'mh-media-timeline__track-label' }, track.name), track.locked ? createIcon(mdiLockOutline, { class: 'mh-media-timeline__lock' }) : null));
      const lane = h('div', { class: cx('mh-media-timeline__lane', track.locked && 'is-locked'), role: 'group', 'aria-label': track.name, style: `grid-area: ${line} / 2` });
      for (const clip of track.clips) {
        const el = h(
          'button',
          { type: 'button', class: timelineClipClass(clip, selected === clip.id), 'aria-pressed': String(selected === clip.id), 'aria-describedby': track.locked ? undefined : hintId, 'aria-disabled': track.locked ? 'true' : undefined },
          h('span', { class: 'mh-media-timeline__clip-handle mh-media-timeline__clip-handle--start', 'aria-hidden': 'true' }),
          h('span', { class: 'mh-media-timeline__clip-label' }, clip.label ?? ''),
          h('span', { class: 'mh-media-timeline__clip-handle mh-media-timeline__clip-handle--end', 'aria-hidden': 'true' }),
        );
        paintClip(el, track, clip);
        clipDrag(el, track, clip.id);
        clipEls.set(clip.id, el);
        lane.append(el);
      }
      seekDrag(lane, true);
      rows.push(lane);
    }
    // Every cell is placed by hand: the overlay spans the rows of the time column, so auto-placement would move lanes.
    overlay.style.gridArea = `1 / 2 / ${tracks.length + 2} / 3`;
    grid.replaceChildren(corner, ruler, ...rows, overlay);
    paintPosition();
  };

  const namesWidth = (): number => corner.offsetWidth;
  function keepInView(): void {
    const view = scroll.clientWidth - namesWidth();
    if (view <= 0) return;
    const x = position * zoom;
    if (x < scroll.scrollLeft + view * 0.05 || x > scroll.scrollLeft + view * 0.9) scroll.scrollLeft = Math.max(0, x - view * 0.1);
  }
  const zoomTo = (next: number, anchorPx: number): void => {
    const z = clamp(next, minZoom, maxZoom);
    if (z === zoom) return;
    const t = (scroll.scrollLeft + anchorPx) / zoom;
    zoom = z;
    render();
    scroll.scrollLeft = Math.max(0, t * zoom - anchorPx);
  };
  const onWheel = (e: WheelEvent): void => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const anchor = Math.max(0, e.clientX - scroll.getBoundingClientRect().left - namesWidth());
    zoomTo(zoom * wheelZoomFactor(e), anchor);
    options.onZoomChange?.(zoom);
  };
  scroll.addEventListener('wheel', onWheel, { passive: false });
  render();

  return {
    el: root,
    setPosition(t) {
      position = clamp(t, 0, duration);
      paintPosition();
      if (follow) keepInView();
    },
    setZoom(z) {
      zoomTo(z, Math.max(0, (scroll.clientWidth - namesWidth()) / 2));
    },
    setTracks(next) {
      tracks = next.map((t) => ({ ...t, clips: [...t.clips] }));
      render();
    },
    setSelected(id) {
      selected = id;
      for (const [cid, el] of clipEls) {
        el.classList.toggle('is-selected', cid === id);
        el.setAttribute('aria-pressed', String(cid === id));
      }
    },
    setSnap(next) {
      snap = next;
    },
    getTracks: () => tracks.map((t) => ({ ...t, clips: [...t.clips] })),
    destroy() {
      scroll.removeEventListener('wheel', onWheel);
    },
  };
}

/** Width of the scrolling content in pixels: the duration at the zoom, plus room for the last label. */
export function timelineWidth(duration: number, zoom: number): number {
  return Math.ceil(Math.max(0, duration) * zoom) + 24;
}
