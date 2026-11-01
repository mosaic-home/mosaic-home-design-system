import { beforeEach, describe, expect, it } from 'vitest';
import { createPageHeader } from './pageHeader.ts';
import { createTabs, tabsKeyTarget } from './tabs.ts';

const key = (target: Element, k: string): void => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
};

beforeEach(() => document.body.replaceChildren());

describe('tabs', () => {
  const make = (activation: 'auto' | 'manual' = 'auto') => {
    const changes: string[] = [];
    const tabs = createTabs({
      label: 'Sections',
      activation,
      tabs: [
        { id: 'a', label: 'A', panel: 'Panel A' },
        { id: 'b', label: 'B', disabled: true, panel: 'Panel B' },
        { id: 'c', label: 'C', badge: 2, panel: 'Panel C' },
      ],
      onChange: (id) => changes.push(id),
    });
    document.body.append(tabs.el);
    return { tabs, changes, buttons: tabs.el.querySelectorAll<HTMLButtonElement>('[role="tab"]'), panels: tabs.el.querySelectorAll<HTMLElement>('[role="tabpanel"]') };
  };

  it('wires tabs to panels with a roving tabindex', () => {
    const { tabs, buttons, panels } = make();
    expect(tabs.el.className).toBe('mh-tabs mh-tabs--underline');
    expect(tabs.el.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Sections');
    expect(buttons[0]!.getAttribute('aria-selected')).toBe('true');
    expect(buttons[0]!.tabIndex).toBe(0);
    expect(buttons[2]!.tabIndex).toBe(-1);
    expect(buttons[0]!.getAttribute('aria-controls')).toBe(panels[0]!.id);
    expect(panels[0]!.getAttribute('aria-labelledby')).toBe(buttons[0]!.id);
    expect(panels[0]!.hidden).toBe(false);
    expect(panels[2]!.hidden).toBe(true);
    expect(buttons[2]!.querySelector('.mh-tabs__badge')!.textContent).toBe('2');
  });

  it('selects with arrow keys, skipping disabled tabs', () => {
    const { tabs, buttons, panels, changes } = make();
    buttons[0]!.focus();
    key(buttons[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(buttons[2]);
    expect(tabs.value()).toBe('c');
    expect(panels[2]!.hidden).toBe(false);
    expect(changes).toEqual(['c']);
    key(buttons[2]!, 'ArrowRight');
    expect(tabs.value()).toBe('a');
  });

  it('waits for Enter or a click in manual mode', () => {
    const { tabs, buttons, changes } = make('manual');
    buttons[0]!.focus();
    key(buttons[0]!, 'End');
    expect(document.activeElement).toBe(buttons[2]);
    expect(tabs.value()).toBe('a');
    expect(buttons[2]!.tabIndex).toBe(0);
    buttons[2]!.click();
    expect(tabs.value()).toBe('c');
    expect(changes).toEqual(['c']);
  });

  it('setValue changes the selection without onChange', () => {
    const { tabs, changes } = make();
    tabs.setValue('c');
    expect(tabs.value()).toBe('c');
    tabs.setValue('b');
    expect(tabs.value()).toBe('a');
    expect(changes).toEqual([]);
  });

  it('key targets wrap', () => {
    expect(tabsKeyTarget([{}, {}, {}], 0, 'ArrowLeft')).toBe(2);
    expect(tabsKeyTarget([{}, { disabled: true }, {}], 0, 'ArrowRight')).toBe(2);
    expect(tabsKeyTarget([{}], 0, 'x')).toBeNull();
  });

  it('pill variant without panels leaves out aria-controls', () => {
    const t = createTabs({ variant: 'pill', fill: true, tabs: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }] });
    expect(t.el.className).toBe('mh-tabs mh-tabs--pill mh-tabs--fill');
    expect(t.el.querySelector('[role="tab"]')!.hasAttribute('aria-controls')).toBe(false);
    expect(t.el.querySelector('[role="tabpanel"]')).toBeNull();
  });
});

describe('page header', () => {
  it('renders the text, back button and actions', () => {
    let backs = 0;
    const action = document.createElement('button');
    const ph = createPageHeader({ eyebrow: 'Settings', title: 'Display', subtitle: 'Sleep and brightness', back: { onClick: () => backs++ }, actions: [action] });
    expect(ph.el.tagName).toBe('HEADER');
    expect(ph.el.querySelector('h1')!.textContent).toBe('Display');
    expect(ph.el.querySelector<HTMLElement>('.mh-page-header__eyebrow')!.hidden).toBe(false);
    const back = ph.el.querySelector<HTMLButtonElement>('.mh-page-header__back')!;
    expect(back.getAttribute('aria-label')).toBe('Back');
    back.click();
    expect(backs).toBe(1);
    expect(ph.el.querySelector('.mh-page-header__actions')!.contains(action)).toBe(true);
  });

  it('hides empty parts and supports heading levels and a back link', () => {
    const ph = createPageHeader({ title: 'Section', level: 2, back: { href: '#home', label: 'Home' } });
    expect(ph.el.querySelector('h2')).not.toBeNull();
    expect(ph.el.querySelector<HTMLElement>('.mh-page-header__subtitle')!.hidden).toBe(true);
    expect(ph.el.querySelector<HTMLElement>('.mh-page-header__actions')!.hidden).toBe(true);
    expect(ph.el.querySelector('a.mh-page-header__back')!.getAttribute('href')).toBe('#home');
    ph.setSubtitle('Now with text');
    expect(ph.el.querySelector<HTMLElement>('.mh-page-header__subtitle')!.hidden).toBe(false);
  });
});
