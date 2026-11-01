import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { createIconButton } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';

export interface CarouselOptions {
  /** Required: the region's accessible name ("Search results"). */
  label: string;
  /** One element per slide; each is wrapped in a `.mh-carousel__slide`. */
  items?: HTMLElement[];
  /** Name of the previous button (default "Previous"). */
  previousLabel?: string;
  /** Name of the next button (default "Next"). */
  nextLabel?: string;
}

export interface CarouselHandle {
  el: HTMLDivElement;
  /** The scrolling element. */
  track: HTMLDivElement;
  /** Replaces the slides. */
  setItems(items: HTMLElement[]): void;
  /** Scrolls one slide forwards (1) or backwards (-1). */
  step(direction: CarouselDirection): void;
  /** Stops watching the track's size. */
  destroy(): void;
}

export type CarouselDirection = 1 | -1;

export const CAROUSEL_SLIDE_CLASS = 'mh-carousel__slide';

export function carouselSlideLabel(index: number, count: number): string {
  return `${index + 1} of ${count}`;
}

export function carouselNavClass(direction: CarouselDirection): string {
  return cx('mh-carousel__nav', direction < 0 ? 'mh-carousel__nav--previous' : 'mh-carousel__nav--next');
}

const isRtl = (track: HTMLElement): boolean => getComputedStyle(track).direction === 'rtl';

/** Whether the track sits at its start and at its end (both when it doesn't scroll). */
export function carouselEdges(track: HTMLElement): { atStart: boolean; atEnd: boolean } {
  const offset = Math.abs(track.scrollLeft);
  return { atStart: offset <= 1, atEnd: offset + track.clientWidth >= track.scrollWidth - 1 };
}

/** The slide at the start of the track's view (0 when it doesn't scroll). */
export function carouselIndex(track: HTMLElement): number {
  const slides = track.querySelectorAll<HTMLElement>(`:scope > .${CAROUSEL_SLIDE_CLASS}`);
  const first = slides[0];
  if (!first || slides.length < 2) return 0;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const pitch = first.offsetWidth + gap;
  if (!(pitch > 0)) return 0;
  const { atEnd } = carouselEdges(track);
  if (atEnd) return slides.length - 1;
  return Math.max(0, Math.min(slides.length - 1, Math.round(Math.abs(track.scrollLeft) / pitch)));
}

/** A page dot's classes (`.is-current` for the slide in view). */
export function carouselDotClass(current: boolean): string {
  return cx('mh-carousel__dot', current && 'is-current');
}

/** Scrolls the track by one slide width plus the gap; snapping settles it on the slide. */
export function carouselStep(track: HTMLElement, direction: CarouselDirection): void {
  const slide = track.querySelector<HTMLElement>(`:scope > .${CAROUSEL_SLIDE_CLASS}`);
  if (!slide) return;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  const distance = (slide.offsetWidth + gap) * direction * (isRtl(track) ? -1 : 1);
  track.scrollBy({ left: distance });
}

/** The step an arrow key on the track asks for, or null for any other key. Follows the reading direction. */
export function carouselKeyDirection(event: KeyboardEvent, track: HTMLElement): CarouselDirection | null {
  const target = event.target as HTMLElement | null;
  if (target && target !== track && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return null;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return null;
  const forward = event.key === 'ArrowRight' ? 1 : -1;
  return (isRtl(track) ? -forward : forward) as CarouselDirection;
}

/**
 * `.mh-carousel`: a labelled region (`aria-roledescription="carousel"`) holding a horizontally scrolling,
 * snapping `__track` of `__slide`s (`role="group"`, `aria-roledescription="slide"`, "n of N"). On phones a slide
 * takes most of the width so the next one peeks; the track is focusable and Arrow Left / Right move one slide. On
 * wide screens with a fine pointer, `__nav` icon buttons step one slide and disable at the ends. When the slides
 * don't all fit, `__dots` (one `__dot` per slide, `.is-current` for the one in view) show how many there are.
 */
export function createCarousel(options: CarouselOptions): CarouselHandle {
  const track = h('div', { class: 'mh-carousel__track', tabindex: 0 });
  const previous = createIconButton({ icon: mdiChevronLeft, label: options.previousLabel ?? 'Previous', size: 'small', filled: true, disabled: true });
  const next = createIconButton({ icon: mdiChevronRight, label: options.nextLabel ?? 'Next', size: 'small', filled: true, disabled: true });
  previous.el.classList.add(...carouselNavClass(-1).split(' '));
  next.el.classList.add(...carouselNavClass(1).split(' '));
  const dots = h('div', { class: 'mh-carousel__dots', 'aria-hidden': 'true' });
  const el = h('div', { class: 'mh-carousel', role: 'region', 'aria-roledescription': 'carousel', 'aria-label': options.label }, track, previous.el, next.el);

  const update = (): void => {
    const { atStart, atEnd } = carouselEdges(track);
    previous.setDisabled(atStart);
    next.setDisabled(atEnd);
    const count = track.children.length;
    if (count < 2 || (atStart && atEnd)) {
      dots.remove();
      return;
    }
    const index = carouselIndex(track);
    if (dots.children.length !== count) dots.replaceChildren(...Array.from({ length: count }, () => h('span', { class: carouselDotClass(false) })));
    Array.from(dots.children).forEach((dot, i) => (dot.className = carouselDotClass(i === index)));
    if (dots.parentNode !== el) el.append(dots);
  };
  const step = (direction: CarouselDirection): void => carouselStep(track, direction);

  previous.el.addEventListener('click', () => step(-1));
  next.el.addEventListener('click', () => step(1));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', (e) => {
    const direction = carouselKeyDirection(e, track);
    if (direction === null) return;
    e.preventDefault();
    step(direction);
  });
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
  observer?.observe(track);

  const setItems = (items: HTMLElement[]): void => {
    track.replaceChildren(
      ...items.map((item, i) => h('div', { class: CAROUSEL_SLIDE_CLASS, role: 'group', 'aria-roledescription': 'slide', 'aria-label': carouselSlideLabel(i, items.length) }, item)),
    );
    update();
  };
  setItems(options.items ?? []);

  return {
    el,
    track,
    setItems,
    step,
    destroy() {
      observer?.disconnect();
    },
  };
}
