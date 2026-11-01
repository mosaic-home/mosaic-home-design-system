import { beforeEach, describe, expect, it } from 'vitest';
import { breadcrumbSlots, createBreadcrumbs } from './breadcrumbs.ts';
import { createDocumentTabs, documentTabsAfterClose } from './documentTabs.ts';
import { createMenuBar, menuBarKeyShortcuts, menuBarMoveTarget, type MenuBarMenu } from './menuBar.ts';
import { createNavRail, navRailBadgeText } from './navRail.ts';
import { createPagination, paginationSlots } from './pagination.ts';
import { createSteps, stepState } from './steps.ts';

const key = (target: Element, k: string): void => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
};

beforeEach(() => document.body.replaceChildren());

describe('document-tabs', () => {
  const make = (onClose?: (id: string) => unknown) => {
    const changes: string[] = [];
    const closed: string[] = [];
    const tabs = createDocumentTabs({
      label: 'Open files',
      value: 'b',
      tabs: [
        { id: 'a', label: 'Morning.yaml', icon: 'edit' },
        { id: 'b', label: 'Evening.yaml', dirty: true },
        { id: 'c', label: 'Readme', closable: false },
      ],
      onChange: (id) => changes.push(id),
      onClose: (id) => {
        closed.push(id);
        return onClose?.(id);
      },
      onAdd: () => changes.push('add'),
    });
    document.body.append(tabs.el);
    const selects = () => tabs.el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    return { tabs, changes, closed, selects };
  };

  it('renders tabs with dirty state and close buttons', () => {
    const { tabs, selects } = make();
    expect(tabs.el.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Open files');
    const s = selects();
    expect(s.length).toBe(3);
    expect(s[1]!.getAttribute('aria-selected')).toBe('true');
    expect(s[1]!.tabIndex).toBe(0);
    expect(s[0]!.tabIndex).toBe(-1);
    expect(s[1]!.textContent).toBe('Evening.yaml, unsaved changes');
    const wraps = tabs.el.querySelectorAll('.mh-document-tabs__tab');
    expect(wraps[1]!.className).toBe('mh-document-tabs__tab is-selected is-dirty');
    expect(wraps[1]!.querySelector('.mh-document-tabs__close .mh-document-tabs__dirty')).not.toBeNull();
    const close = wraps[0]!.querySelector<HTMLButtonElement>('.mh-document-tabs__close')!;
    expect(close.getAttribute('aria-label')).toBe('Close Morning.yaml');
    expect(close.tabIndex).toBe(-1);
    expect(wraps[2]!.querySelector('.mh-document-tabs__close')).toBeNull();
    expect(tabs.el.querySelector('.mh-document-tabs__add')!.getAttribute('aria-label')).toBe('New tab');
  });

  it('arrows select; Delete and the close button close; onClose can veto', () => {
    let veto = true;
    const { tabs, changes, closed, selects } = make(() => (veto ? false : undefined));
    selects()[1]!.focus();
    key(selects()[1]!, 'ArrowRight');
    expect(tabs.value()).toBe('c');
    expect(document.activeElement).toBe(selects()[2]);
    key(selects()[2]!, 'Delete');
    expect(closed).toEqual([]);
    key(selects()[2]!, 'Home');
    expect(tabs.value()).toBe('a');
    key(selects()[0]!, 'Delete');
    expect(closed).toEqual(['a']);
    expect(selects().length).toBe(3);
    veto = false;
    key(selects()[0]!, 'Delete');
    expect(selects().length).toBe(2);
    expect(tabs.value()).toBe('b');
    expect(document.activeElement).toBe(selects()[0]);
    (tabs.el.querySelector('.mh-document-tabs__close') as HTMLButtonElement).click();
    expect(tabs.value()).toBe('c');
    expect(changes).toEqual(['c', 'a', 'b', 'c']);
    (tabs.el.querySelector('.mh-document-tabs__add') as HTMLButtonElement).click();
    expect(changes.at(-1)).toBe('add');
  });

  it('setDirty and closeTab', () => {
    const { tabs, closed, selects } = make();
    tabs.setDirty('a', true);
    expect(tabs.el.querySelectorAll('.is-dirty').length).toBe(2);
    tabs.closeTab('b');
    expect(closed).toEqual([]);
    expect(tabs.value()).toBe('c');
    expect(selects().length).toBe(2);
    expect(documentTabsAfterClose([{ id: 'a' }, { id: 'b' }], 'b', 'b')).toBe('a');
    expect(documentTabsAfterClose([{ id: 'a' }], 'a', 'a')).toBe('');
    expect(documentTabsAfterClose([{ id: 'a' }, { id: 'b' }], 'a', 'b')).toBe('b');
  });
});

describe('menu-bar', () => {
  const menus: MenuBarMenu[] = [
    {
      label: 'File',
      items: [
        { value: 'new', label: 'New scene', icon: 'add', shortcut: 'Ctrl+N' },
        { value: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
        {
          value: 'recent',
          label: 'Open recent',
          items: [
            { value: 'r1', label: 'Evening lights' },
            { value: 'r2', label: 'Away mode' },
          ],
        },
        { separator: true },
        { value: 'delete', label: 'Delete', danger: true, disabled: true },
      ],
    },
    { label: 'View', items: [{ value: 'grid', label: 'Show grid', checked: true }, { value: 'zoom', label: 'Zoom in', shortcut: 'Cmd++' }] },
    { label: 'Help', items: [{ value: 'about', label: 'About' }] },
  ];

  const make = () => {
    const picked: [string, boolean | undefined][] = [];
    const bar = createMenuBar({ menus, label: 'Editor', onSelect: (v, c) => picked.push([v, c]) });
    document.body.append(bar.el);
    const triggers = bar.el.querySelectorAll<HTMLButtonElement>('.mh-menu-bar__trigger');
    const popups = Array.from(bar.el.querySelectorAll<HTMLElement>('.mh-menu-bar__menu > .mh-menu-bar__popup'));
    const item = (value: string): HTMLElement =>
      Array.from(bar.el.querySelectorAll<HTMLElement>('.mh-menu-bar__item')).find((i) => i.querySelector('.mh-menu-bar__label')!.textContent === value)!;
    return { bar, picked, triggers, popups, item };
  };

  it('renders the menubar pattern', () => {
    const { bar, triggers, popups, item } = make();
    expect(bar.el.getAttribute('role')).toBe('menubar');
    expect(bar.el.getAttribute('aria-label')).toBe('Editor');
    expect(triggers[0]!.getAttribute('role')).toBe('menuitem');
    expect(triggers[0]!.getAttribute('aria-haspopup')).toBe('menu');
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[0]!.tabIndex).toBe(0);
    expect(triggers[1]!.tabIndex).toBe(-1);
    expect(popups[0]!.getAttribute('role')).toBe('menu');
    expect(popups[0]!.getAttribute('aria-labelledby')).toBe(triggers[0]!.id);
    expect(popups[0]!.hidden).toBe(true);
    expect(item('New scene').getAttribute('aria-keyshortcuts')).toBe('Control+N');
    expect(item('New scene').querySelector('.mh-menu-bar__shortcut')!.textContent).toBe('Ctrl+N');
    expect(item('Open recent').getAttribute('aria-haspopup')).toBe('menu');
    expect(item('Delete').getAttribute('aria-disabled')).toBe('true');
    expect(item('Delete').className).toBe('mh-menu-bar__item mh-menu-bar__item--danger');
    expect(item('Show grid').getAttribute('role')).toBe('menuitemcheckbox');
    expect(item('Show grid').getAttribute('aria-checked')).toBe('true');
    expect(bar.el.querySelector('[role="separator"]')).not.toBeNull();
  });

  it('keyboard: open, move, enter submenu, cross the bar, choose', () => {
    const { bar, picked, triggers, popups, item } = make();
    triggers[0]!.focus();
    key(triggers[0]!, 'ArrowDown');
    expect(popups[0]!.hidden).toBe(false);
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(item('New scene'));
    key(item('New scene'), 'ArrowUp');
    expect(document.activeElement).toBe(item('Delete'));
    key(item('Delete'), 'Enter');
    expect(picked).toEqual([]);
    key(item('Delete'), 'o');
    expect(document.activeElement).toBe(item('Open…'));
    key(item('Open…'), 'ArrowDown');
    key(item('Open recent'), 'ArrowRight');
    const sub = item('Open recent').nextElementSibling as HTMLElement;
    expect(sub.hidden).toBe(false);
    expect(item('Open recent').getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(item('Evening lights'));
    key(item('Evening lights'), 'ArrowLeft');
    expect(sub.hidden).toBe(true);
    expect(document.activeElement).toBe(item('Open recent'));
    key(item('Open recent'), 'ArrowLeft');
    expect(popups[0]!.hidden).toBe(true);
    expect(popups[2]!.hidden).toBe(false);
    expect(document.activeElement).toBe(item('About'));
    key(item('About'), 'ArrowRight');
    expect(popups[0]!.hidden).toBe(false);
    key(item('New scene'), 'Escape');
    expect(popups[0]!.hidden).toBe(true);
    expect(document.activeElement).toBe(triggers[0]);
    key(triggers[0]!, 'ArrowRight');
    expect(document.activeElement).toBe(triggers[1]);
    expect(triggers[1]!.tabIndex).toBe(0);
    key(triggers[1]!, 'Enter');
    key(item('Show grid'), ' ');
    expect(picked).toEqual([['grid', false]]);
    expect(item('Show grid').getAttribute('aria-checked')).toBe('false');
    expect(popups[1]!.hidden).toBe(true);
    expect(document.activeElement).toBe(triggers[1]);
    void bar;
  });

  it('pointer: click opens, hover follows, outside closes', () => {
    const { bar, picked, triggers, popups, item } = make();
    triggers[0]!.click();
    expect(popups[0]!.hidden).toBe(false);
    triggers[1]!.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    expect(popups[0]!.hidden).toBe(true);
    expect(popups[1]!.hidden).toBe(false);
    item('Zoom in').click();
    expect(picked).toEqual([['zoom', undefined]]);
    expect(popups[1]!.hidden).toBe(true);
    triggers[0]!.click();
    item('Open recent').dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    expect((item('Open recent').nextElementSibling as HTMLElement).hidden).toBe(false);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(popups[0]!.hidden).toBe(true);
    bar.destroy();
  });

  it('builds into an existing element and cleans up', () => {
    const root = document.createElement('div');
    const bar = createMenuBar({ menus }, root);
    expect(bar.el).toBe(root);
    expect(root.className).toBe('mh-menu-bar');
    expect(root.children.length).toBe(3);
    bar.destroy();
    expect(root.children.length).toBe(0);
  });

  it('helpers', () => {
    expect(menuBarKeyShortcuts('Ctrl+Shift+S')).toBe('Control+Shift+S');
    expect(menuBarKeyShortcuts('Cmd+K')).toBe('Meta+K');
    expect(menuBarMoveTarget(3, 2, 'ArrowDown')).toBe(0);
    expect(menuBarMoveTarget(3, 0, 'ArrowUp')).toBe(2);
    expect(menuBarMoveTarget(0, 0, 'Home')).toBeNull();
  });
});

describe('breadcrumbs', () => {
  const items = [{ label: 'Home', href: '/', icon: 'home' }, { label: 'Ground floor', href: '/ground' }, { label: 'Kitchen', href: '/ground/kitchen' }, { label: 'Ceiling light', href: '/x' }, { label: 'Settings' }];

  it('links the trail and marks the current page', () => {
    const b = createBreadcrumbs({ items });
    expect(b.el.tagName).toBe('NAV');
    expect(b.el.getAttribute('aria-label')).toBe('Breadcrumb');
    const lis = b.el.querySelectorAll('ol > li');
    expect(lis.length).toBe(5);
    expect(b.el.querySelectorAll('a.mh-breadcrumbs__link').length).toBe(4);
    const current = b.el.querySelector('.mh-breadcrumbs__current')!;
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.textContent).toBe('Settings');
    expect(b.el.querySelectorAll('.mh-breadcrumbs__separator[aria-hidden="true"]').length).toBe(4);
  });

  it('collapses the middle and expands on demand', () => {
    const b = createBreadcrumbs({ items, maxItems: 3 });
    document.body.append(b.el);
    const more = b.el.querySelector<HTMLButtonElement>('.mh-breadcrumbs__more')!;
    expect(more.getAttribute('aria-label')).toBe('Show 3 more');
    expect(b.el.querySelectorAll('ol > li').length).toBe(3);
    more.click();
    expect(b.el.querySelectorAll('ol > li').length).toBe(5);
    expect(document.activeElement!.textContent).toBe('Ground floor');
  });

  it('buttons for click-only crumbs; slots', () => {
    let clicks = 0;
    const b = createBreadcrumbs({ items: [{ label: 'Rooms', onClick: () => clicks++ }, { label: 'Office' }] });
    (b.el.querySelector('button.mh-breadcrumbs__link') as HTMLButtonElement).click();
    expect(clicks).toBe(1);
    expect(breadcrumbSlots(6, 4, false)).toEqual([0, 'more', 4, 5]);
    expect(breadcrumbSlots(4, 4, false)).toEqual([0, 1, 2, 3]);
    expect(breadcrumbSlots(6, 4, true)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('pagination', () => {
  it('slots keep a constant length', () => {
    expect(paginationSlots(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationSlots(1, 20)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 20]);
    expect(paginationSlots(5, 20)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 20]);
    expect(paginationSlots(17, 20)).toEqual([1, 'start-ellipsis', 16, 17, 18, 19, 20]);
    expect(paginationSlots(20, 20)).toEqual([1, 'start-ellipsis', 16, 17, 18, 19, 20]);
    expect(paginationSlots(10, 40, 2, 2)).toEqual([1, 2, 'start-ellipsis', 8, 9, 10, 11, 12, 'end-ellipsis', 39, 40]);
  });

  it('pages, arrows and the current page', () => {
    const pages: number[] = [];
    const p = createPagination({ count: 12, page: 1, onChange: (n) => pages.push(n) });
    document.body.append(p.el);
    expect(p.el.getAttribute('aria-label')).toBe('Pagination');
    const prev = p.el.querySelector<HTMLButtonElement>('.mh-pagination__nav--previous')!;
    expect(prev.disabled).toBe(true);
    expect(prev.getAttribute('aria-label')).toBe('Previous page');
    expect(p.el.querySelector('[aria-current="page"]')!.textContent).toBe('1');
    expect(p.el.querySelector('[aria-current="page"]')!.getAttribute('aria-label')).toBe('Page 1');
    expect(p.el.querySelectorAll('.mh-pagination__ellipsis').length).toBe(1);
    const next = p.el.querySelector<HTMLButtonElement>('.mh-pagination__nav--next')!;
    next.focus();
    next.click();
    expect(p.page()).toBe(2);
    expect(document.activeElement!.classList.contains('mh-pagination__nav--next')).toBe(true);
    (Array.from(p.el.querySelectorAll<HTMLButtonElement>('.mh-pagination__page')).find((b) => b.textContent === '12')!).click();
    expect(p.page()).toBe(12);
    expect(p.el.querySelector<HTMLButtonElement>('.mh-pagination__nav--next')!.disabled).toBe(true);
    expect(pages).toEqual([2, 12]);
    p.setCount(4);
    expect(p.page()).toBe(4);
  });

  it('links and the compact variant', () => {
    const p = createPagination({ count: 3, page: 2, href: (n) => `?page=${n}` });
    expect(p.el.querySelector<HTMLAnchorElement>('[aria-current="page"]')!.getAttribute('href')).toBe('?page=2');
    expect(p.el.querySelector('.mh-pagination__nav--previous')!.getAttribute('href')).toBe('?page=1');
    const c = createPagination({ count: 9, page: 9, variant: 'compact' });
    expect(c.el.className).toBe('mh-pagination mh-pagination--compact');
    expect(c.el.querySelector('.mh-pagination__status')!.textContent).toBe('9 of 9');
    expect(c.el.querySelector('.mh-pagination__page')).toBeNull();
  });
});

describe('steps', () => {
  const steps = [{ label: 'Connect' }, { label: 'Network', description: 'Wi-Fi and password' }, { label: 'Rooms', optional: true }, { label: 'Done' }];

  it('derives complete, current and upcoming states', () => {
    const s = createSteps({ steps, current: 1 });
    expect(s.el.tagName).toBe('OL');
    expect(s.el.className).toBe('mh-steps mh-steps--horizontal');
    const lis = s.el.querySelectorAll('li');
    expect(Array.from(lis, (li) => li.className)).toEqual(['mh-steps__step is-complete', 'mh-steps__step is-current', 'mh-steps__step is-upcoming', 'mh-steps__step is-upcoming']);
    expect(lis[1]!.getAttribute('aria-current')).toBe('step');
    expect(lis[0]!.querySelector('.mh-steps__marker svg')).not.toBeNull();
    expect(lis[2]!.querySelector('.mh-steps__marker')!.textContent).toBe('3');
    expect(lis[0]!.querySelector('.mh-visually-hidden')!.textContent).toBe(', completed');
    expect(lis[2]!.querySelector('.mh-steps__optional')!.textContent).toBe('Optional');
    expect(s.el.querySelectorAll('.mh-steps__connector').length).toBe(3);
  });

  it('errors, vertical layout and going back', () => {
    const back: number[] = [];
    const s = createSteps({ steps: [{ label: 'Connect' }, { label: 'Network', error: true }, { label: 'Done' }], current: 1, orientation: 'vertical', onSelect: (i) => back.push(i) });
    const lis = s.el.querySelectorAll('li');
    expect(lis[1]!.className).toBe('mh-steps__step is-error');
    expect(lis[1]!.getAttribute('aria-current')).toBe('step');
    (lis[0]!.querySelector('button.mh-steps__button') as HTMLButtonElement).click();
    expect(back).toEqual([0]);
    expect(lis[2]!.querySelector('button')).toBeNull();
    s.setCurrent(3);
    expect(s.el.querySelectorAll('.is-complete').length).toBe(2);
    expect(stepState({}, 2, 2)).toBe('current');
  });
});

describe('nav-rail', () => {
  it('marks the current item, shows badges and announces them', () => {
    const changes: string[] = [];
    const rail = createNavRail({
      label: 'Sections',
      value: 'home',
      items: [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 3, badgeLabel: '3 new' },
        { id: 'media', label: 'Media', icon: 'music', badge: 'dot' },
        { id: 'cams', label: 'Cameras', icon: 'camera', disabled: true },
      ],
      footerItems: [{ id: 'settings', label: 'Settings', icon: 'settings', href: '#settings' }],
      onChange: (id) => changes.push(id),
    });
    expect(rail.el.tagName).toBe('NAV');
    expect(rail.el.getAttribute('aria-label')).toBe('Sections');
    const items = rail.el.querySelectorAll<HTMLElement>('.mh-nav-rail__item');
    expect(items[0]!.getAttribute('aria-current')).toBe('page');
    expect(items[1]!.querySelector('.mh-nav-rail__badge')!.textContent).toBe('3');
    expect(items[1]!.textContent).toBe('3Alerts, 3 new');
    expect(items[2]!.querySelector('.mh-nav-rail__badge--dot')).not.toBeNull();
    expect(items[2]!.querySelector('.mh-visually-hidden')!.textContent).toBe(', new');
    expect((items[3] as HTMLButtonElement).disabled).toBe(true);
    expect(items[4]!.tagName).toBe('A');
    expect(rail.el.querySelector('.mh-nav-rail__list--footer')).not.toBeNull();
    items[1]!.click();
    expect(rail.value()).toBe('alerts');
    expect(items[1]!.getAttribute('aria-current')).toBe('page');
    expect(items[0]!.hasAttribute('aria-current')).toBe(false);
    items[3]!.click();
    expect(changes).toEqual(['alerts']);
    rail.setBadge('alerts', 0);
    expect(items[1]!.querySelector('.mh-nav-rail__badge')).toBeNull();
    expect(items[1]!.querySelector('.mh-visually-hidden')).toBeNull();
    rail.setBadge('alerts', 120);
    expect(items[1]!.querySelector('.mh-nav-rail__badge')!.textContent).toBe('99+');
    rail.setExpanded(true);
    expect(rail.el.classList.contains('mh-nav-rail--expanded')).toBe(true);
    expect(navRailBadgeText('New')).toBe('New');
  });
});
