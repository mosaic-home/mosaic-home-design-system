import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createAppShell,
  createOnboarding,
  createPanel,
  createPanelGroup,
  createReorderableList,
  createScrollPanel,
  createSplitPane,
  createStatusBar,
  createSwipeRow,
  createToolbar,
} from '../web/index.ts';
import { AppShell, Onboarding, Panel, PanelGroup, ReorderableList, ScrollPanel, SplitPane, StatusBar, SwipeRow, Toolbar, ToolbarSeparator, ToolbarSpacer } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ID_REFS = new Set(['aria-controls', 'aria-labelledby', 'aria-describedby']);

/**
 * Tag, classes, role, ARIA, `hidden`, `tabindex` and own text of every element, in document order. Ids differ
 * between renderers, so id references are written as the position of the element they point at.
 */
function shape(root: Element): string[] {
  const all = [root, ...root.querySelectorAll('*')];
  const at = new Map(all.filter((el) => el.id).map((el) => [el.id, all.indexOf(el)]));
  const keep = (name: string): boolean => name === 'class' || name === 'role' || name === 'hidden' || name === 'tabindex' || name === 'data-id' || name === 'data-action' || name.startsWith('aria-');
  return all.map((el) => {
    const attrs = Array.from(el.attributes)
      .filter((a) => keep(a.name))
      .map((a) => `${a.name}=${ID_REFS.has(a.name) ? a.value.split(' ').map((ref) => `#${at.get(ref) ?? '?'}`).join(' ') : a.value}`)
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    return `${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim();
  });
}

function stat(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  return div.firstElementChild!;
}

let host: HTMLElement;
let root: Root;
beforeEach(() => {
  document.body.replaceChildren();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
});

async function mount(node: ReactElement): Promise<Element> {
  await act(async () => root.render(node));
  return host.firstElementChild!;
}

const key = (el: Element, k: string): void => {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
};
const button = (label: string): HTMLButtonElement => Object.assign(document.createElement('button'), { textContent: label });

describe('layout parity', () => {
  it('SplitPane', async () => {
    const r = await mount(<SplitPane start="List" end="Detail" size={35} collapsible="end" label="Resize list" startLabel="Rooms" />);
    const w = createSplitPane({ start: 'List', end: 'Detail', size: 35, collapsible: 'end', label: 'Resize list', startLabel: 'Rooms' }).el;
    expect(shape(r)).toEqual(shape(w));
    expect((r as HTMLElement).style.getPropertyValue('--_size')).toBe('35%');
    expect(shape(stat(<SplitPane orientation="vertical" collapsible="start" collapsed />))).toEqual(shape(createSplitPane({ orientation: 'vertical', collapsible: 'start', collapsed: true }).el));
  });

  it('Panel', () => {
    expect(
      shape(
        stat(
          <Panel title="Lights" description="Downstairs" icon="lightbulb" actions={<button>Go</button>} footer="Foot">
            Body
          </Panel>,
        ),
      ),
    ).toEqual(shape(createPanel({ title: 'Lights', description: 'Downstairs', icon: 'lightbulb', actions: [button('Go')], body: 'Body', footer: 'Foot' }).el));
    expect(shape(stat(<Panel title="Advanced" variant="section" collapsible open={false} flush headingLevel={2} />))).toEqual(
      shape(createPanel({ title: 'Advanced', variant: 'section', collapsible: true, open: false, flush: true, headingLevel: 2 }).el),
    );
  });

  it('PanelGroup', () => {
    const panels = [
      { id: 'log', label: 'Log', icon: 'info', content: 'Log body' },
      { id: 'off', label: 'Off', disabled: true },
      { id: 'vars', label: 'Variables', badge: 3, content: 'Vars body' },
    ];
    expect(shape(stat(<PanelGroup panels={panels} value="vars" label="Dock" actions={<button>Go</button>} collapsible flush />))).toEqual(
      shape(createPanelGroup({ panels, value: 'vars', label: 'Dock', actions: [button('Go')], collapsible: true, flush: true }).el),
    );
    expect(shape(stat(<PanelGroup panels={panels} collapsible collapsed />))).toEqual(shape(createPanelGroup({ panels, collapsible: true, collapsed: true }).el));
  });

  it('ScrollPanel', async () => {
    const r = await mount(
      <ScrollPanel label="Log" size="large" axis="x" shadows={false}>
        Line
      </ScrollPanel>,
    );
    expect(shape(r)).toEqual(shape(createScrollPanel({ label: 'Log', size: 'large', axis: 'x', shadows: false }, 'Line').el));
  });

  it('Toolbar', async () => {
    const r = await mount(
      <Toolbar label="Editing" orientation="vertical" variant="floating">
        <button>Cut</button>
        <ToolbarSeparator />
        <button>Paste</button>
        <ToolbarSpacer />
      </Toolbar>,
    );
    const w = createToolbar({ label: 'Editing', orientation: 'vertical', variant: 'floating', items: [button('Cut'), 'separator', button('Paste'), 'spacer'] }).el;
    expect(shape(r)).toEqual(shape(w));
  });

  it('StatusBar', () => {
    const items = [
      { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' as const, title: 'Wi-Fi' },
      { id: 'time', label: 'Updated', value: '14:02', end: true, announce: true },
    ];
    expect(shape(stat(<StatusBar items={[...items, { id: 'up', label: '2 updates', end: true, onClick: () => undefined }]} sticky label="Hub" />))).toEqual(
      shape(createStatusBar({ items: [...items, { id: 'up', label: '2 updates', end: true, onClick: () => undefined }], sticky: true, label: 'Hub' }).el),
    );
  });

  it('AppShell', () => {
    const r = stat(
      <AppShell title="Home" subtitle="Living room" leading={<button>Go</button>} actions={<button>Go</button>} nav={<nav>Nav</nav>} navPosition="start" status={<footer>S</footer>} label="Rooms" width="medium">
        Content
      </AppShell>,
    );
    const nav = Object.assign(document.createElement('nav'), { textContent: 'Nav' });
    const status = Object.assign(document.createElement('footer'), { textContent: 'S' });
    const w = createAppShell({ title: 'Home', subtitle: 'Living room', leading: button('Go'), actions: [button('Go')], nav, navPosition: 'start', status, label: 'Rooms', width: 'medium' }, 'Content').el;
    expect(shape(r)).toEqual(shape(w));
    expect(shape(stat(<AppShell title="Home" canvas={false} fixed={false} />))).toEqual(shape(createAppShell({ title: 'Home', canvas: false, fixed: false }).el));
  });

  it('ReorderableList', async () => {
    const items = [
      { id: 'a', label: 'Kitchen', icon: 'home' },
      { id: 'b', label: 'Hall', description: 'Ground floor' },
    ];
    const r = await mount(<ReorderableList items={[...items.slice(0, 1), { ...items[1]!, trailing: <button>Go</button> }]} label="Rooms" />);
    const w = createReorderableList({ items: [...items.slice(0, 1), { ...items[1]!, trailing: button('Go') }], label: 'Rooms' }).el;
    expect(shape(r)).toEqual(shape(w));
  });

  it('SwipeRow', async () => {
    const start = [{ id: 'fav', label: 'Favourite', icon: 'star', tone: 'accent' as const }];
    const end = [{ id: 'del', label: 'Delete', icon: 'delete', tone: 'danger' as const }];
    const r = await mount(
      <SwipeRow label="Kitchen light" start={start} end={end}>
        Kitchen light
      </SwipeRow>,
    );
    expect(shape(r)).toEqual(shape(createSwipeRow({ label: 'Kitchen light', content: 'Kitchen light', start, end }).el));
  });

  it('Onboarding', () => {
    const steps = [
      { title: 'Welcome', text: 'Your home at a glance.', icon: 'home' },
      { title: 'Ready', text: 'That is all.' },
    ];
    expect(shape(stat(<Onboarding steps={steps} />))).toEqual(shape(createOnboarding({ steps }).el));
    expect(shape(stat(<Onboarding steps={steps} step={1} skippable={false} labels={{ done: 'Finish' }} />))).toEqual(
      shape(createOnboarding({ steps, step: 1, skippable: false, labels: { done: 'Finish' } }).el),
    );
  });
});

describe('layout behaviour in React', () => {
  it('SplitPane resizes from the keyboard and reports it', async () => {
    const sizes: number[] = [];
    const r = await mount(<SplitPane start="A" end="B" onResize={(s) => sizes.push(s)} />);
    const handle = r.querySelector('.mh-split__handle')!;
    await act(async () => key(handle, 'ArrowLeft'));
    expect(sizes).toEqual([45]);
    expect(handle.getAttribute('aria-valuenow')).toBe('45');
  });

  it('Panel and PanelGroup toggle and switch', async () => {
    const r = await mount(
      <div>
        <Panel title="Advanced" collapsible open={false}>
          Body
        </Panel>
        <PanelGroup
          panels={[
            { id: 'a', label: 'A', content: 'Panel A' },
            { id: 'b', label: 'B', content: 'Panel B' },
          ]}
        />
      </div>,
    );
    const toggle = r.querySelector<HTMLButtonElement>('.mh-panel__toggle')!;
    await act(async () => toggle.click());
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(r.querySelector<HTMLElement>('.mh-panel__body')!.hidden).toBe(false);
    const tabs = r.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[0]!.focus();
    await act(async () => key(tabs[0]!, 'ArrowRight'));
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
  });

  it('ReorderableList reorders from the keyboard, keeps focus and announces', async () => {
    const orders: string[][] = [];
    const items = [
      { id: 'a', label: 'Kitchen' },
      { id: 'b', label: 'Hall' },
      { id: 'c', label: 'Office' },
    ];
    const r = await mount(<ReorderableList items={items} label="Rooms" onChange={(ids) => orders.push(ids)} />);
    const handle = (): HTMLButtonElement => r.querySelector<HTMLButtonElement>('[data-id="a"] .mh-reorder__handle')!;
    handle().focus();
    await act(async () => key(handle(), ' '));
    await act(async () => key(handle(), 'ArrowDown'));
    expect([...r.querySelectorAll<HTMLElement>('.mh-reorder__item')].map((li) => li.dataset.id)).toEqual(['b', 'a', 'c']);
    expect(document.activeElement).toBe(handle());
    expect(r.querySelector('.mh-reorder__live')!.textContent).toBe('Kitchen moved to position 2 of 3.');
    await act(async () => key(handle(), 'Enter'));
    expect(orders).toEqual([['b', 'a', 'c']]);
    expect(handle().getAttribute('aria-pressed')).toBe('false');
  });

  it('SwipeRow runs the action and its own callback', async () => {
    const ran: string[] = [];
    const r = await mount(
      <SwipeRow label="Kitchen light" end={[{ id: 'del', label: 'Delete', icon: 'delete', onAction: () => ran.push('own') }]} onAction={(id) => ran.push(id)}>
        Kitchen light
      </SwipeRow>,
    );
    await act(async () => r.querySelector<HTMLButtonElement>('.mh-swipe-row__more')!.click());
    expect(r.classList.contains('is-open-end')).toBe(true);
    await act(async () => r.querySelector<HTMLButtonElement>('[data-action="del"]')!.click());
    expect(ran).toEqual(['own', 'del']);
    expect(r.classList.contains('is-open-end')).toBe(false);
  });

  it('Onboarding steps through to done', async () => {
    let done = 0;
    const r = await mount(<Onboarding steps={[{ title: 'Welcome' }, { title: 'Ready' }]} onDone={() => done++} />);
    const next = r.querySelector<HTMLButtonElement>('.mh-onboarding__next')!;
    await act(async () => next.click());
    expect(r.querySelectorAll<HTMLElement>('.mh-onboarding__step')[1]!.hidden).toBe(false);
    expect(next.textContent).toBe('Get started');
    expect(r.querySelector('.mh-onboarding__live')!.textContent).toBe('Step 2 of 2: Ready');
    await act(async () => next.click());
    expect(done).toBe(1);
  });
});
