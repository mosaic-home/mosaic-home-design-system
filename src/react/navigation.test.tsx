import { act, useState, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { createBreadcrumbs, createDocumentTabs, createMenuBar, createNavRail, createPagination, createSteps, type DocumentTab, type MenuBarMenu } from '../web/index.ts';
import { Breadcrumbs, DocumentTabs, MenuBar, NavRail, Pagination, Steps } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden`, `href`, `tabindex` and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => ['class', 'role', 'hidden', 'tabindex', 'href', 'title', 'd'].includes(a.name) || a.name.startsWith('aria-'))
      .map((a) => `${a.name}=${a.value}`)
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

function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

const mounted: { root: Root; host: HTMLElement }[] = [];
function mount(node: ReactElement): HTMLElement {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(node));
  mounted.push({ root, host });
  return host;
}
afterEach(() => {
  for (const { root, host } of mounted.splice(0)) {
    act(() => root.unmount());
    host.remove();
  }
});

const key = (target: Element, k: string): void => {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  });
};

const docTabs: DocumentTab[] = [
  { id: 'a', label: 'Morning.yaml', icon: 'edit', title: 'Scenes / Morning.yaml' },
  { id: 'b', label: 'Evening.yaml', dirty: true },
  { id: 'c', label: 'Readme', closable: false, dirty: true },
];

describe('navigation parity', () => {
  it('DocumentTabs', () => {
    const noop = (): void => undefined;
    expect(shape(react(<DocumentTabs tabs={docTabs} value="b" onChange={noop} onClose={noop} onAdd={noop} label="Open files" />))).toEqual(
      shape(createDocumentTabs({ tabs: docTabs, value: 'b', onAdd: noop, label: 'Open files' }).el),
    );
  });

  it('MenuBar builds the same DOM into its element', () => {
    const menus: MenuBarMenu[] = [
      { label: 'File', items: [{ value: 'new', label: 'New', icon: 'add', shortcut: 'Ctrl+N' }, { separator: true }, { value: 'recent', label: 'Recent', items: [{ value: 'r1', label: 'One' }] }] },
      { label: 'View', items: [{ value: 'grid', label: 'Grid', checked: false }] },
    ];
    const host = mount(<MenuBar menus={menus} label="Editor" />);
    const strip = (lines: string[]): string[] => lines.map((l) => l.replace(/mh-menu-bar-\d+-(trigger|menu|item)-?\d*/g, '#'));
    expect(strip(shape(host.firstElementChild!))).toEqual(strip(shape(createMenuBar({ menus, label: 'Editor' }).el)));
  });

  it('Breadcrumbs', () => {
    const items = [{ label: 'Home', href: '/', icon: 'home' }, { label: 'Ground floor', href: '/g' }, { label: 'Kitchen', onClick: () => undefined }, { label: 'Light' }];
    expect(shape(react(<Breadcrumbs items={items} />))).toEqual(shape(createBreadcrumbs({ items }).el));
    expect(shape(react(<Breadcrumbs items={items} maxItems={3} label="You are here" />))).toEqual(shape(createBreadcrumbs({ items, maxItems: 3, label: 'You are here' }).el));
  });

  it('Pagination', () => {
    const noop = (): void => undefined;
    expect(shape(react(<Pagination count={20} page={7} onChange={noop} />))).toEqual(shape(createPagination({ count: 20, page: 7 }).el));
    expect(shape(react(<Pagination count={5} page={1} onChange={noop} href={(n) => `?p=${n}`} />))).toEqual(shape(createPagination({ count: 5, page: 1, href: (n) => `?p=${n}` }).el));
    expect(shape(react(<Pagination count={9} page={3} onChange={noop} variant="compact" />))).toEqual(shape(createPagination({ count: 9, page: 3, variant: 'compact' }).el));
  });

  it('Steps', () => {
    const steps = [{ label: 'Connect' }, { label: 'Network', description: 'Wi-Fi', error: true }, { label: 'Rooms', optional: true }, { label: 'Done' }];
    expect(shape(react(<Steps steps={steps} current={1} />))).toEqual(shape(createSteps({ steps, current: 1 }).el));
    expect(shape(react(<Steps steps={steps} current={2} orientation="vertical" onSelect={() => undefined} />))).toEqual(
      shape(createSteps({ steps, current: 2, orientation: 'vertical', onSelect: () => undefined }).el),
    );
  });

  it('NavRail', () => {
    const items = [
      { id: 'home', label: 'Home', icon: 'home', iconSelected: 'star' },
      { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 4, badgeLabel: '4 new' },
      { id: 'media', label: 'Media', icon: 'music', badge: 'dot' as const },
      { id: 'cams', label: 'Cameras', icon: 'camera', disabled: true },
    ];
    const footerItems = [{ id: 'settings', label: 'Settings', icon: 'settings', href: '#settings' }];
    expect(shape(react(<NavRail items={items} footerItems={footerItems} value="home" header={<button>Go</button>} labels="selected" />))).toEqual(
      shape(createNavRail({ items, footerItems, value: 'home', header: Object.assign(document.createElement('button'), { textContent: 'Go' }), labels: 'selected' }).el),
    );
    expect(shape(react(<NavRail items={items} value="alerts" expanded />))).toEqual(shape(createNavRail({ items, value: 'alerts', expanded: true }).el));
  });
});

describe('navigation behaviour', () => {
  it('DocumentTabs is controlled and refocuses after a close', () => {
    function Demo() {
      const [tabs, setTabs] = useState(docTabs);
      const [value, setValue] = useState('a');
      return (
        <DocumentTabs
          tabs={tabs}
          value={value}
          onChange={setValue}
          onClose={(id, next) => {
            setTabs((t) => t.filter((x) => x.id !== id));
            setValue(next);
          }}
        />
      );
    }
    const host = mount(<Demo />);
    const tabs = () => host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    act(() => tabs()[0]!.focus());
    key(tabs()[0]!, 'ArrowRight');
    expect(tabs()[1]!.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    key(tabs()[1]!, 'Delete');
    expect(tabs().length).toBe(2);
    expect(tabs()[1]!.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs()[1]);
    key(tabs()[1]!, 'Delete');
    expect(tabs().length).toBe(2);
  });

  it('MenuBar works after mounting and rebuilds cleanly', () => {
    const picked: string[] = [];
    const menus: MenuBarMenu[] = [{ label: 'File', items: [{ value: 'save', label: 'Save' }] }];
    const host = mount(<MenuBar menus={menus} onSelect={(v) => picked.push(v)} />);
    const trigger = host.querySelector<HTMLButtonElement>('.mh-menu-bar__trigger')!;
    act(() => trigger.focus());
    key(trigger, 'ArrowDown');
    key(document.activeElement!, 'Enter');
    expect(picked).toEqual(['save']);
    expect(host.querySelectorAll('.mh-menu-bar__menu').length).toBe(1);
  });

  it('Breadcrumbs expand and Pagination calls onChange', () => {
    const items = [{ label: 'A', href: '#a' }, { label: 'B', href: '#b' }, { label: 'C', href: '#c' }, { label: 'D' }];
    const host = mount(<Breadcrumbs items={items} maxItems={3} />);
    act(() => host.querySelector<HTMLButtonElement>('.mh-breadcrumbs__more')!.click());
    expect(host.querySelectorAll('li').length).toBe(4);
    expect(document.activeElement!.textContent).toBe('B');

    const pages: number[] = [];
    const p = mount(<Pagination count={10} page={4} onChange={(n) => pages.push(n)} />);
    act(() => p.querySelector<HTMLButtonElement>('.mh-pagination__nav--next')!.click());
    act(() => p.querySelector<HTMLButtonElement>('[aria-current="page"]')!.click());
    expect(pages).toEqual([5]);
  });

  it('NavRail and Steps call back', () => {
    const changes: string[] = [];
    const host = mount(<NavRail items={[{ id: 'a', label: 'A', icon: 'home' }, { id: 'b', label: 'B', icon: 'bell' }]} value="a" onChange={(id) => changes.push(id)} />);
    const items = host.querySelectorAll<HTMLButtonElement>('.mh-nav-rail__item');
    act(() => items[1]!.click());
    act(() => items[0]!.click());
    expect(changes).toEqual(['b']);
    const back: number[] = [];
    const s = mount(<Steps steps={[{ label: 'One' }, { label: 'Two' }]} current={1} onSelect={(i) => back.push(i)} />);
    act(() => s.querySelector<HTMLButtonElement>('.mh-steps__button')!.click());
    expect(back).toEqual([0]);
  });
});
