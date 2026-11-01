import { mdiStar, mdiStarOutline } from '@mdi/js';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';

export type FavouriteToggleSize = 'small' | 'medium' | 'large';

export interface FavouriteToggleOptions {
  pressed?: boolean;
  /** The accessible name; it stays the same whether on or off (`aria-pressed` carries the state). Default "Favourite". */
  label?: string;
  /** Show the label next to the star. */
  showLabel?: boolean;
  size?: FavouriteToggleSize;
  disabled?: boolean;
  /** Runs after a press, with the new state. */
  onChange?: (pressed: boolean) => void;
}

export interface FavouriteToggleHandle {
  el: HTMLButtonElement;
  readonly pressed: boolean;
  setPressed(pressed: boolean): void;
  setDisabled(disabled: boolean): void;
}

/** The star for a state. */
export const favouriteIcon = (pressed: boolean): string => (pressed ? mdiStar : mdiStarOutline);

export function favouriteToggleClass(size: FavouriteToggleSize = 'medium', showLabel = false): string {
  return cx('mh-favourite-toggle', size !== 'medium' && `mh-favourite-toggle--${size === 'small' ? 'sm' : 'lg'}`, showLabel && 'mh-favourite-toggle--labelled');
}

/**
 * `.mh-favourite-toggle` (`--sm | --lg`, `--labelled`): a star toggle button with `aria-pressed`. Pressing it
 * toggles the star, plays a short pop (`.is-popping`, not with reduced motion) and calls `onChange`.
 */
export function createFavouriteToggle(options: FavouriteToggleOptions = {}): FavouriteToggleHandle {
  const label = options.label ?? 'Favourite';
  let pressed = options.pressed ?? false;
  const el = h('button', {
    type: 'button',
    class: favouriteToggleClass(options.size, options.showLabel),
    'aria-pressed': String(pressed),
    'aria-label': options.showLabel ? null : label,
    title: options.showLabel ? null : label,
    disabled: options.disabled ?? false,
  });
  const text = options.showLabel ? h('span', { class: 'mh-favourite-toggle__label' }, label) : null;
  const draw = (): void => {
    el.setAttribute('aria-pressed', String(pressed));
    el.replaceChildren(createIcon(favouriteIcon(pressed)));
    if (text) el.append(text);
  };
  draw();
  el.addEventListener('click', () => {
    pressed = !pressed;
    draw();
    el.classList.remove('is-popping');
    void el.offsetWidth;
    el.classList.add('is-popping');
    options.onChange?.(pressed);
  });
  el.addEventListener('animationend', (e) => {
    if (e.target === el.firstElementChild) el.classList.remove('is-popping');
  });
  return {
    el,
    get pressed() {
      return pressed;
    },
    setPressed(value) {
      pressed = value;
      draw();
    },
    setDisabled(value) {
      el.disabled = value;
    },
  };
}
