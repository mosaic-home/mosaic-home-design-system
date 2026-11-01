import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buttonGroupKeyTarget, buttonGroupTabStop, createButtonGroup, createFavouriteToggle, createLink } from './index.ts';

beforeEach(() => document.body.replaceChildren());

const key = (el: Element, k: string): void => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
};

describe('button group', () => {
  const items = [
    { id: 'a', label: 'Day' },
    { id: 'b', label: 'Week', disabled: true },
    { id: 'c', label: 'Month' },
  ];

  it('finds tab stops and key targets, skipping disabled buttons', () => {
    expect(buttonGroupTabStop(items, 1)).toBe(0);
    expect(buttonGroupTabStop(items, 2)).toBe(2);
    expect(buttonGroupKeyTarget(items, 0, 'ArrowRight')).toBe(2);
    expect(buttonGroupKeyTarget(items, 2, 'ArrowRight')).toBe(0);
    expect(buttonGroupKeyTarget(items, 0, 'ArrowLeft')).toBe(2);
    expect(buttonGroupKeyTarget(items, 2, 'Home')).toBe(0);
    expect(buttonGroupKeyTarget(items, 0, 'End')).toBe(2);
    expect(buttonGroupKeyTarget(items, 0, 'ArrowDown')).toBeNull();
    expect(buttonGroupKeyTarget(items, 0, 'ArrowDown', 'vertical')).toBe(2);
  });

  it('renders joined buttons in a named group', () => {
    const onClick = vi.fn();
    const g = createButtonGroup({ label: 'Range', items: [{ id: 'day', label: 'Day', pressed: true }, { id: 'week', label: 'Week', pressed: false }, { id: 'more', label: 'More', icon: 'more', iconOnly: true }], onClick });
    expect(g.el.className).toBe('mh-button-group');
    expect(g.el.getAttribute('role')).toBe('group');
    expect(g.el.getAttribute('aria-label')).toBe('Range');
    const [day, week, more] = [...g.el.querySelectorAll('button')];
    expect(day!.className).toBe('mh-button mh-button--secondary mh-button-group__item');
    expect(day!.getAttribute('aria-pressed')).toBe('true');
    expect(more!.className).toContain('mh-button-group__item--icon');
    expect(more!.getAttribute('aria-label')).toBe('More');
    expect(more!.hasAttribute('aria-pressed')).toBe(false);
    expect(more!.querySelector('.mh-button__label')).toBeNull();
    expect(day!.hasAttribute('tabindex')).toBe(false);
    week!.click();
    expect(onClick).toHaveBeenCalledWith('week', expect.any(MouseEvent));
    g.setPressed('week', true);
    expect(week!.getAttribute('aria-pressed')).toBe('true');
    g.setDisabled('week', true);
    expect(week!.disabled).toBe(true);
  });

  it('is a toolbar with a roving tab stop', () => {
    const g = createButtonGroup({ label: 'Playback', toolbar: true, orientation: 'vertical', variant: 'tonal', size: 'small', items });
    document.body.append(g.el);
    expect(g.el.className).toBe('mh-button-group mh-button-group--tonal mh-button-group--vertical');
    expect(g.el.getAttribute('role')).toBe('toolbar');
    expect(g.el.getAttribute('aria-orientation')).toBe('vertical');
    const buttons = [...g.el.querySelectorAll('button')];
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    buttons[0]!.focus();
    key(buttons[0]!, 'ArrowDown');
    expect(document.activeElement).toBe(buttons[2]);
    expect(buttons.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
    key(buttons[2]!, 'Home');
    expect(document.activeElement).toBe(buttons[0]);
    g.setDisabled('a', true);
    expect(buttons[2]!.tabIndex).toBe(0);
  });
});

describe('link', () => {
  it('renders an anchor, external with a spoken hint', () => {
    const l = createLink({ text: 'Read more', href: 'https://example.com/', external: true });
    expect(l.el.tagName).toBe('A');
    expect(l.el.className).toBe('mh-link mh-link--accent');
    expect(l.el.getAttribute('target')).toBe('_blank');
    expect(l.el.getAttribute('rel')).toBe('noopener noreferrer');
    expect(l.el.querySelector('.mh-link__external')).not.toBeNull();
    expect(l.el.querySelector('.mh-visually-hidden')!.textContent).toBe(' (opens in a new tab)');
    l.setText('Docs');
    expect(l.el.querySelector('.mh-link__text')!.textContent).toBe('Docs');
  });

  it('is a button without an href', () => {
    const onClick = vi.fn();
    const l = createLink({ text: 'Show more', tone: 'muted', underline: 'hover', external: true, onClick });
    expect(l.el.tagName).toBe('BUTTON');
    expect(l.el.getAttribute('type')).toBe('button');
    expect(l.el.className).toBe('mh-link mh-link--muted mh-link--subtle');
    expect(l.el.querySelector('.mh-link__external')).toBeNull();
    (l.el as HTMLButtonElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('favourite toggle', () => {
  it('toggles aria-pressed and the star, keeping its name', () => {
    const onChange = vi.fn();
    const f = createFavouriteToggle({ label: 'Favourite: Kitchen', onChange });
    expect(f.el.className).toBe('mh-favourite-toggle');
    expect(f.el.getAttribute('aria-pressed')).toBe('false');
    expect(f.el.getAttribute('aria-label')).toBe('Favourite: Kitchen');
    const before = f.el.querySelector('path')!.getAttribute('d');
    f.el.click();
    expect(f.pressed).toBe(true);
    expect(f.el.getAttribute('aria-pressed')).toBe('true');
    expect(f.el.getAttribute('aria-label')).toBe('Favourite: Kitchen');
    expect(f.el.querySelector('path')!.getAttribute('d')).not.toBe(before);
    expect(f.el.classList.contains('is-popping')).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    f.setPressed(false);
    expect(f.el.getAttribute('aria-pressed')).toBe('false');
  });

  it('shows a visible label instead of aria-label', () => {
    const f = createFavouriteToggle({ showLabel: true, size: 'large', pressed: true, disabled: true });
    expect(f.el.className).toBe('mh-favourite-toggle mh-favourite-toggle--lg mh-favourite-toggle--labelled');
    expect(f.el.hasAttribute('aria-label')).toBe(false);
    expect(f.el.querySelector('.mh-favourite-toggle__label')!.textContent).toBe('Favourite');
    expect(f.el.disabled).toBe(true);
  });
});
