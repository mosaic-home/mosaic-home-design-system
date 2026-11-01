import { afterEach, describe, expect, it } from 'vitest';
import {
  createAppShell,
  createGrid,
  createOnboarding,
  createPanel,
  createPanelGroup,
  createReorderableList,
  createRow,
  createScreen,
  createScrollPanel,
  createSplitPane,
  createStack,
  createStatusBar,
  createSwipeRow,
  createToolbar,
  gridClass,
  moveItem,
  onboardingSwipe,
  reorderTarget,
  scrollOverflow,
  stackClass,
  swipeSettle,
} from './index.ts';

describe('screen', () => {
  it('wraps content in a canvas, a column and a main region', () => {
    const header = document.createElement('h1');
    const s = createScreen({ width: 'narrow', header, label: 'Home' }, 'Content');
    expect(s.el.className).toBe('mh-screen mh-canvas mh-screen--narrow');
    expect(s.el.querySelector('.mh-screen__column > header.mh-screen__header')!.firstElementChild).toBe(header);
    expect(s.main.tagName).toBe('MAIN');
    expect(s.main.getAttribute('aria-label')).toBe('Home');
    expect(s.main.textContent).toBe('Content');
    expect(createScreen({ canvas: false }).el.className).toBe('mh-screen');
  });
});

describe('stack and grid', () => {
  it('builds modifier classes', () => {
    expect(stackClass()).toBe('mh-stack');
    expect(stackClass({ direction: 'row', gap: 'xs', align: 'center', justify: 'between', wrap: true })).toBe(
      'mh-stack mh-stack--row mh-stack--gap-xs mh-stack--align-center mh-stack--justify-between mh-stack--wrap',
    );
    expect(createRow({}, 'a').el.className).toBe('mh-stack mh-stack--row mh-stack--align-center');
    expect(createStack({ as: 'ul' }).el.tagName).toBe('UL');
    expect(gridClass({ min: 'large', gap: 'sm' })).toBe('mh-grid mh-grid--lg mh-grid--gap-sm');
    expect(createGrid({}, 'x').el.className).toBe('mh-grid');
  });
});

const key = (el: Element, k: string, init: KeyboardEventInit = {}): void => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
};
const pointer = (el: Element, type: string, x: number, y: number, init: PointerEventInit = {}): void => {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, button: 0, pointerType: 'touch', ...init }));
};
const rect = (el: Element, r: { left?: number; top?: number; width: number; height: number }): void => {
  const left = r.left ?? 0;
  const top = r.top ?? 0;
  (el as HTMLElement).getBoundingClientRect = () => ({ left, top, width: r.width, height: r.height, right: left + r.width, bottom: top + r.height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
};

afterEach(() => document.body.replaceChildren());

describe('split pane', () => {
  it('renders two panes and a separator with the value', () => {
    const s = createSplitPane({ start: 'List', end: 'Detail', size: 30, label: 'Resize list', startLabel: 'Rooms' });
    expect(s.el.className).toBe('mh-split');
    expect(s.el.style.getPropertyValue('--_size')).toBe('30%');
    const handle = s.el.querySelector('.mh-split__handle')!;
    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuenow')).toBe('30');
    expect(handle.getAttribute('aria-valuemin')).toBe('20');
    expect(handle.getAttribute('aria-controls')).toBe(s.startPane.id);
    expect(s.startPane.getAttribute('role')).toBe('region');
    expect(s.endPane.hasAttribute('role')).toBe(false);
    expect(createSplitPane({ orientation: 'vertical' }).el.querySelector('.mh-split__handle')!.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('resizes from the keyboard within its limits and folds with Enter', () => {
    const sizes: number[] = [];
    const folds: boolean[] = [];
    const s = createSplitPane({ size: 50, min: 25, max: 75, collapsible: 'start', onResize: (v) => sizes.push(v), onCollapse: (v) => folds.push(v) });
    document.body.append(s.el);
    const handle = s.el.querySelector('.mh-split__handle')!;
    key(handle, 'ArrowRight');
    key(handle, 'PageDown');
    expect(s.size()).toBe(75);
    key(handle, 'Home');
    expect(s.size()).toBe(25);
    expect(sizes).toEqual([55, 75, 25]);
    key(handle, 'Enter');
    expect(s.collapsed()).toBe(true);
    expect(s.startPane.hidden).toBe(true);
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    expect(handle.getAttribute('aria-valuemin')).toBe('0');
    key(handle, 'ArrowLeft');
    expect(s.collapsed()).toBe(true);
    key(handle, 'ArrowRight');
    expect(s.collapsed()).toBe(false);
    expect(folds).toEqual([true, false]);
  });

  it('follows a drag on the divider and folds when dragged past half the minimum', () => {
    const s = createSplitPane({ collapsible: 'start' });
    document.body.append(s.el);
    rect(s.el, { width: 1000, height: 400 });
    const handle = s.el.querySelector('.mh-split__handle')!;
    pointer(handle, 'pointerdown', 500, 10, { pointerType: 'mouse' });
    pointer(handle, 'pointermove', 400, 10, { pointerType: 'mouse' });
    expect(s.size()).toBe(40);
    expect(s.el.classList.contains('is-resizing')).toBe(true);
    pointer(handle, 'pointermove', 50, 10, { pointerType: 'mouse' });
    expect(s.collapsed()).toBe(true);
    pointer(handle, 'pointerup', 50, 10, { pointerType: 'mouse' });
    expect(s.el.classList.contains('is-resizing')).toBe(false);
    s.setCollapsed(false);
    s.setSize(90);
    expect(s.size()).toBe(80);
  });
});

describe('panel', () => {
  it('renders a titled section with actions, body and footer', () => {
    const p = createPanel({ title: 'Lights', description: 'Downstairs', icon: 'lightbulb', actions: [document.createElement('button')], body: 'Body', footer: 'Foot' });
    expect(p.el.tagName).toBe('SECTION');
    expect(p.el.className).toBe('mh-panel');
    const title = p.el.querySelector('h3.mh-panel__heading > .mh-panel__title')!;
    expect(p.el.getAttribute('aria-labelledby')).toBe(title.id);
    expect(p.el.querySelector('.mh-panel__description')!.textContent).toBe('Downstairs');
    expect(p.el.querySelector('.mh-panel__actions button')).not.toBeNull();
    expect(p.body.textContent).toBe('Body');
    expect(createPanel({ title: 'Network', variant: 'section', flush: true }).el.className).toBe('mh-panel mh-panel--section mh-panel--flush');
  });

  it('collapses through its disclosure button', () => {
    const toggles: boolean[] = [];
    const p = createPanel({ title: 'Advanced', collapsible: true, open: false, body: 'Hidden', onToggle: (o) => toggles.push(o) });
    const toggle = p.el.querySelector<HTMLButtonElement>('.mh-panel__toggle')!;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(p.body.id);
    expect(p.body.hidden).toBe(true);
    expect(p.el.classList.contains('is-collapsed')).toBe(true);
    toggle.click();
    expect(p.open()).toBe(true);
    expect(p.body.hidden).toBe(false);
    p.setOpen(false);
    expect(toggles).toEqual([true]);
    p.setTitle('More');
    expect(p.el.querySelector('.mh-panel__title')!.textContent).toBe('More');
  });
});

describe('panel group', () => {
  const panels = [
    { id: 'log', label: 'Log', content: 'Log body' },
    { id: 'off', label: 'Off', disabled: true },
    { id: 'vars', label: 'Variables', badge: 3, content: 'Vars body' },
  ];

  it('shows one tab panel and moves with the arrow keys', () => {
    const changes: string[] = [];
    const g = createPanelGroup({ panels, label: 'Dock', onChange: (id) => changes.push(id) });
    document.body.append(g.el);
    const tabs = [...g.el.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const bodies = [...g.el.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(bodies.map((b) => b.hidden)).toEqual([false, true, true]);
    expect(tabs[0]!.getAttribute('aria-controls')).toBe(bodies[0]!.id);
    tabs[0]!.focus();
    key(tabs[0]!, 'ArrowRight');
    expect(g.value()).toBe('vars');
    expect(document.activeElement).toBe(tabs[2]);
    key(tabs[2]!, 'Home');
    expect(changes).toEqual(['vars', 'log']);
  });

  it('folds to its tab bar and opens again when a tab is picked', () => {
    const g = createPanelGroup({ panels, collapsible: true, collapsed: true });
    const fold = g.el.querySelector<HTMLButtonElement>('.mh-panel-group__fold')!;
    expect(fold.getAttribute('aria-expanded')).toBe('false');
    expect(fold.getAttribute('aria-label')).toBe('Expand panels');
    expect([...g.el.querySelectorAll<HTMLElement>('[role="tabpanel"]')].every((b) => b.hidden)).toBe(true);
    g.el.querySelectorAll<HTMLButtonElement>('[role="tab"]')[2]!.click();
    expect(g.collapsed()).toBe(false);
    expect(g.value()).toBe('vars');
    fold.click();
    expect(g.collapsed()).toBe(true);
  });
});

describe('scroll panel', () => {
  it('is a labelled, focusable region and marks overflowing edges', () => {
    const s = createScrollPanel({ label: 'Log', size: 'small', inset: true }, 'Line');
    expect(s.el.className).toBe('mh-scroll-panel mh-scroll-panel--sm mh-scroll-panel--inset');
    expect(s.viewport.getAttribute('role')).toBe('region');
    expect(s.viewport.getAttribute('aria-label')).toBe('Log');
    expect(s.viewport.tabIndex).toBe(0);
    Object.defineProperties(s.viewport, { clientHeight: { value: 100 }, scrollHeight: { value: 300 } });
    s.viewport.scrollTop = 0;
    s.update();
    expect(s.el.classList.contains('is-overflow-start')).toBe(false);
    expect(s.el.classList.contains('is-overflow-end')).toBe(true);
    expect(scrollOverflow(200, 100, 300)).toEqual({ start: true, end: false });
    expect(scrollOverflow(-50, 100, 300)).toEqual({ start: true, end: true });
    s.destroy();
  });
});

describe('toolbar', () => {
  const btn = (label: string, disabled = false): HTMLButtonElement => {
    const b = document.createElement('button');
    b.textContent = label;
    b.disabled = disabled;
    return b;
  };

  it('has one tab stop and moves with the arrows, skipping disabled controls', () => {
    const t = createToolbar({ label: 'Editing', items: [btn('Cut'), btn('Copy', true), 'separator', btn('Paste'), 'spacer', btn('Undo')] });
    document.body.append(t.el);
    expect(t.el.getAttribute('role')).toBe('toolbar');
    expect(t.el.querySelector('.mh-toolbar__separator')!.getAttribute('aria-orientation')).toBe('vertical');
    const [cut, , paste, undo] = [...t.el.querySelectorAll('button')];
    expect([cut, paste, undo].map((b) => b!.tabIndex)).toEqual([0, -1, -1]);
    cut!.focus();
    key(cut!, 'ArrowRight');
    expect(document.activeElement).toBe(paste);
    expect(paste!.tabIndex).toBe(0);
    expect(cut!.tabIndex).toBe(-1);
    key(paste!, 'End');
    expect(document.activeElement).toBe(undo);
    key(undo!, 'ArrowRight');
    expect(document.activeElement).toBe(cut);
  });

  it('uses Up and Down as a vertical rail and keeps arrows inside text fields', () => {
    const input = document.createElement('input');
    const t = createToolbar({ label: 'Tools', orientation: 'vertical', items: [btn('Select'), input] });
    document.body.append(t.el);
    expect(t.el.className).toBe('mh-toolbar mh-toolbar--vertical');
    const select = t.el.querySelector('button')!;
    select.focus();
    key(select, 'ArrowDown');
    expect(document.activeElement).toBe(input);
    key(input, 'ArrowLeft');
    expect(document.activeElement).toBe(input);
    t.add(btn('Zoom'));
    expect(t.el.querySelectorAll('button')[1]!.tabIndex).toBe(-1);
  });
});

describe('status bar', () => {
  it('splits items into start and end and updates them in place', () => {
    let clicks = 0;
    const s = createStatusBar({
      items: [
        { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' },
        { id: 'time', label: 'Updated', value: '14:02', end: true, announce: true },
        { id: 'up', label: '2 updates', onClick: () => clicks++, end: true },
      ],
    });
    expect(s.el.tagName).toBe('FOOTER');
    expect(s.el.getAttribute('aria-label')).toBe('Status');
    expect(s.el.querySelector('.mh-status-bar__start')!.children).toHaveLength(1);
    expect(s.el.querySelector('.mh-status-bar__end')!.children).toHaveLength(2);
    const button = s.el.querySelector<HTMLButtonElement>('button.mh-status-bar__item--interactive')!;
    button.click();
    expect(clicks).toBe(1);
    s.setItem('net', { label: 'Offline', tone: 'danger' });
    const net = s.el.querySelector('.mh-status-bar__start > *')!;
    expect(net.className).toBe('mh-status-bar__item mh-status-bar__item--danger');
    expect(net.textContent).toBe('Offline');
    expect(s.el.querySelector('[aria-live="polite"] .mh-status-bar__value')!.textContent).toBe('14:02');
  });
});

describe('app shell', () => {
  it('frames a title bar, navigation, a screen column and a status slot', () => {
    const nav = document.createElement('nav');
    const status = document.createElement('footer');
    const a = createAppShell({ title: 'Home', subtitle: 'Living room', nav, navPosition: 'bottom', status, label: 'Rooms' }, 'Content');
    expect(a.el.className).toBe('mh-app-shell mh-canvas mh-app-shell--nav-bottom mh-app-shell--fixed');
    expect(a.el.querySelector('header.mh-app-shell__bar h1.mh-app-shell__title')!.textContent).toBe('Home');
    expect(a.el.querySelector('.mh-app-shell__nav')!.firstElementChild).toBe(nav);
    expect(a.el.querySelector('.mh-app-shell__status')!.firstElementChild).toBe(status);
    expect(a.content.querySelector(':scope > .mh-screen.mh-screen--wide')).not.toBeNull();
    expect(a.main.tagName).toBe('MAIN');
    expect(a.main.getAttribute('aria-label')).toBe('Rooms');
    expect(a.main.textContent).toBe('Content');
    a.setSubtitle('');
    expect(a.el.querySelector<HTMLElement>('.mh-app-shell__subtitle')!.hidden).toBe(true);
    expect(createAppShell({ title: 'X', canvas: false, fixed: false }).el.className).toBe('mh-app-shell mh-app-shell--nav-auto');
  });
});

describe('reorderable list', () => {
  const items = [
    { id: 'a', label: 'Kitchen' },
    { id: 'b', label: 'Hall', description: 'Ground floor' },
    { id: 'c', label: 'Office' },
  ];
  const live = (el: HTMLElement): string => el.querySelector('.mh-reorder__live')!.textContent ?? '';

  it('moves rows from the keyboard and announces each step', () => {
    const orders: string[][] = [];
    const r = createReorderableList({ items, label: 'Rooms', onChange: (ids) => orders.push(ids) });
    document.body.append(r.el);
    const handle = (id: string): HTMLButtonElement => r.el.querySelector<HTMLButtonElement>(`[data-id="${id}"] .mh-reorder__handle`)!;
    expect(handle('a').getAttribute('aria-label')).toBe('Reorder Kitchen');
    expect(document.getElementById(handle('a').getAttribute('aria-describedby')!)!.textContent).toContain('Space');
    handle('a').focus();
    key(handle('a'), ' ');
    expect(handle('a').getAttribute('aria-pressed')).toBe('true');
    expect(live(r.el)).toBe('Kitchen picked up, position 1 of 3.');
    key(handle('a'), 'ArrowDown');
    expect(r.order()).toEqual(['b', 'a', 'c']);
    expect(document.activeElement).toBe(handle('a'));
    expect(live(r.el)).toBe('Kitchen moved to position 2 of 3.');
    key(handle('a'), 'End');
    expect(r.order()).toEqual(['b', 'c', 'a']);
    key(handle('a'), ' ');
    expect(live(r.el)).toBe('Kitchen dropped at position 3 of 3.');
    expect(handle('a').getAttribute('aria-pressed')).toBe('false');
    expect(orders).toEqual([
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
    ]);
  });

  it('puts a row back on Escape', () => {
    const r = createReorderableList({ items, label: 'Rooms', messages: { cancelled: (label, position) => `${label} back at ${position}` } });
    document.body.append(r.el);
    const handle = r.el.querySelector<HTMLButtonElement>('[data-id="c"] .mh-reorder__handle')!;
    handle.focus();
    key(handle, 'Enter');
    key(handle, 'ArrowUp');
    key(handle, 'ArrowUp');
    expect(r.order()).toEqual(['c', 'a', 'b']);
    key(handle, 'Escape');
    expect(r.order()).toEqual(['a', 'b', 'c']);
    expect(live(r.el)).toBe('Office back at 3');
  });

  it('reorders by dragging a handle', () => {
    const r = createReorderableList({ items, label: 'Rooms' });
    document.body.append(r.el);
    const rows = [...r.el.querySelectorAll('.mh-reorder__item')];
    rows.forEach((row, i) => rect(row, { top: i * 60, width: 300, height: 52 }));
    const handle = rows[0]!.querySelector('.mh-reorder__handle')!;
    pointer(handle, 'pointerdown', 10, 26);
    expect(r.el.classList.contains('is-sorting')).toBe(true);
    pointer(handle, 'pointermove', 10, 100);
    expect((rows[0] as HTMLElement).style.transform).toBe('translateY(74px)');
    expect((rows[1] as HTMLElement).style.transform).toBe('translateY(-60px)');
    pointer(handle, 'pointerup', 10, 100);
    expect(r.order()).toEqual(['b', 'a', 'c']);
    expect((rows[1] as HTMLElement).style.transform).toBe('');
    expect(r.el.classList.contains('is-sorting')).toBe(false);
  });

  it('has pure helpers for the order and the drop target', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(reorderTarget([26, 86, 146], 0, 100)).toBe(1);
    expect(reorderTarget([26, 86, 146], 2, 10)).toBe(0);
    expect(reorderTarget([26, 86, 146], 1, 90)).toBe(1);
  });
});

describe('swipe row', () => {
  const actions = {
    start: [{ id: 'fav', label: 'Favourite', icon: 'star', tone: 'accent' as const }],
    end: [
      { id: 'del', label: 'Delete', icon: 'delete', tone: 'danger' as const },
      { id: 'edit', label: 'Edit', icon: 'edit' },
    ],
  };

  it('opens from the actions button and runs an action', () => {
    const ran: string[] = [];
    const sides: (string | null)[] = [];
    const s = createSwipeRow({ label: 'Kitchen light', content: 'Kitchen light', ...actions, onAction: (id) => ran.push(id), onOpenChange: (side) => sides.push(side) });
    document.body.append(s.el);
    const more = s.el.querySelector<HTMLButtonElement>('.mh-swipe-row__more')!;
    const [start, end] = [...s.el.querySelectorAll<HTMLElement>('.mh-swipe-row__actions')];
    expect(more.getAttribute('aria-label')).toBe('Actions for Kitchen light');
    expect(more.getAttribute('aria-controls')).toBe(`${start!.id} ${end!.id}`);
    expect(start!.hasAttribute('inert') && end!.hasAttribute('inert')).toBe(true);
    more.click();
    expect(s.side()).toBe('end');
    expect(more.getAttribute('aria-expanded')).toBe('true');
    expect(end!.hasAttribute('inert')).toBe(false);
    expect(s.el.classList.contains('is-open-end')).toBe(true);
    end!.querySelector<HTMLButtonElement>('[data-action="del"]')!.click();
    expect(ran).toEqual(['del']);
    expect(s.side()).toBe(null);
    more.focus();
    key(more, 'ArrowRight');
    expect(s.side()).toBe('start');
    key(more, 'Escape');
    expect(s.side()).toBe(null);
    expect(sides).toEqual(['end', null, 'start', null]);
  });

  it('opens with a horizontal swipe and ignores vertical scrolling', () => {
    const s = createSwipeRow({ label: 'Row', content: 'Row', ...actions });
    document.body.append(s.el);
    const content = s.el.querySelector('.mh-swipe-row__content')!;
    Object.defineProperty(s.el.querySelector('.mh-swipe-row__actions--end'), 'offsetWidth', { value: 160 });
    pointer(content, 'pointerdown', 200, 20);
    pointer(content, 'pointermove', 190, 60);
    pointer(content, 'pointerup', 190, 60);
    expect(s.side()).toBe(null);
    pointer(content, 'pointerdown', 200, 20);
    pointer(content, 'pointermove', 150, 22);
    expect(s.el.classList.contains('is-dragging')).toBe(true);
    pointer(content, 'pointermove', 80, 22);
    pointer(content, 'pointerup', 80, 22);
    expect(s.side()).toBe('end');
    expect((content as HTMLElement).style.getPropertyValue('--_x')).toBe('-160px');
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(s.side()).toBe(null);
  });

  it('settles a released swipe', () => {
    expect(swipeSettle(60, 100, 160, 400)).toEqual({ side: 'start', run: false });
    expect(swipeSettle(40, 100, 160, 400)).toEqual({ side: null, run: false });
    expect(swipeSettle(-300, 100, 160, 400, true)).toEqual({ side: 'end', run: true });
    expect(swipeSettle(-300, 100, 0, 400, true)).toEqual({ side: null, run: false });
  });
});

describe('onboarding', () => {
  const steps = [
    { title: 'Welcome', text: 'Your home at a glance.', icon: 'home' },
    { title: 'Rooms', text: 'Group devices by room.' },
    { title: 'Ready', text: 'That is all.' },
  ];

  it('steps forward and back, then finishes', () => {
    let done = 0;
    let skipped = 0;
    const changes: number[] = [];
    const o = createOnboarding({ steps, onDone: () => done++, onSkip: () => skipped++, onStepChange: (i) => changes.push(i) });
    document.body.append(o.el);
    const groups = [...o.el.querySelectorAll<HTMLElement>('.mh-onboarding__step')];
    const back = o.el.querySelector<HTMLButtonElement>('.mh-onboarding__back')!;
    const next = o.el.querySelector<HTMLButtonElement>('.mh-onboarding__next')!;
    expect(o.el.getAttribute('aria-label')).toBe('Introduction');
    expect(groups.map((g) => g.hidden)).toEqual([false, true, true]);
    expect(groups[1]!.getAttribute('aria-label')).toBe('Step 2 of 3');
    expect(back.hidden).toBe(true);
    expect(o.el.querySelector('.mh-onboarding__media--icon')).not.toBeNull();
    next.click();
    expect(o.step()).toBe(1);
    expect(back.hidden).toBe(false);
    expect(o.el.querySelector('.mh-onboarding__live')!.textContent).toBe('Step 2 of 3: Rooms');
    expect([...o.el.querySelectorAll('.mh-onboarding__dot')].map((d) => d.className)).toEqual(['mh-onboarding__dot is-done', 'mh-onboarding__dot is-current', 'mh-onboarding__dot']);
    key(next, 'ArrowRight');
    expect(next.textContent).toBe('Get started');
    next.click();
    expect(done).toBe(1);
    back.focus();
    o.setStep(0);
    expect(document.activeElement).toBe(next);
    o.el.querySelector<HTMLButtonElement>('.mh-onboarding__skip')!.click();
    expect(skipped).toBe(1);
    expect(changes).toEqual([1, 2]);
  });

  it('turns pages with touch swipes only', () => {
    expect(onboardingSwipe(-80, 5, 'touch')).toBe(1);
    expect(onboardingSwipe(80, 5, 'touch')).toBe(-1);
    expect(onboardingSwipe(80, 5, 'touch', true)).toBe(1);
    expect(onboardingSwipe(-80, 5, 'mouse')).toBe(0);
    expect(onboardingSwipe(-30, 0, 'touch')).toBe(0);
    expect(onboardingSwipe(-60, 80, 'touch')).toBe(0);
    const o = createOnboarding({ steps, skippable: false });
    const area = o.el.querySelector('.mh-onboarding__steps')!;
    pointer(area, 'pointerdown', 300, 100);
    pointer(area, 'pointerup', 200, 104);
    expect(o.step()).toBe(1);
    expect(o.el.querySelector('.mh-onboarding__skip')).toBeNull();
  });
});
