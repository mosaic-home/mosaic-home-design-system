import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPageHeader, createTabs } from '../web/index.ts';
import { createBottomSheet } from '../web/overlays/bottomSheet.ts';
import { BottomSheet, Dialog, Drawer, Menu, PageHeader, Tabs, Tooltip } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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

/** Every class name in a tree, in document order. */
const classes = (el: Element): string[] => [el, ...el.querySelectorAll('*')].map((n) => n.getAttribute('class') ?? '');

describe('overlay bindings', () => {
  it('BottomSheet builds the web DOM, portals children and reports user closes', async () => {
    const reasons: string[] = [];
    function App() {
      const [open, setOpen] = useState(true);
      return (
        <BottomSheet
          open={open}
          title="Display"
          footer={<button className="probe-footer">Apply</button>}
          onClose={(r) => {
            reasons.push(r);
            setOpen(false);
          }}
        >
          <p className="probe-body">Body</p>
        </BottomSheet>
      );
    }
    await act(async () => root.render(<App />));
    const dlg = document.querySelector<HTMLDialogElement>('dialog.mh-sheet')!;
    expect(dlg.open).toBe(true);
    expect(dlg.className).toBe(createBottomSheet({ title: 'x' }).el.className);
    expect(dlg.querySelector('.mh-sheet__body .probe-body')).not.toBeNull();
    expect(dlg.querySelector('.mh-sheet__footer .probe-footer')).not.toBeNull();
    expect(dlg.querySelector<HTMLElement>('.mh-sheet__footer')!.hidden).toBe(false);
    expect(dlg.querySelector('.mh-sheet__title')!.textContent).toBe('Display');
    await act(async () => {
      dlg.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(reasons).toEqual(['escape']);
    expect(dlg.classList.contains('is-closing')).toBe(true);
  });

  it('Dialog and Drawer open and close with the open prop, without calling onClose', async () => {
    let closes = 0;
    const render = (open: boolean) =>
      root.render(
        <>
          <Dialog open={open} title="Rename" size="large" onClose={() => closes++}>
            <input />
          </Dialog>
          <Drawer open={open} side="left" title="Nav" onClose={() => closes++} />
        </>,
      );
    await act(async () => render(true));
    const dialog = document.querySelector<HTMLDialogElement>('dialog.mh-dialog')!;
    expect(dialog.className).toBe('mh-overlay mh-dialog mh-dialog--lg');
    expect(document.querySelector('dialog.mh-drawer')!.className).toBe('mh-overlay mh-drawer mh-drawer--left');
    expect(dialog.querySelector<HTMLElement>('.mh-dialog__footer')!.hidden).toBe(true);
    await act(async () => render(false));
    expect(dialog.classList.contains('is-closing')).toBe(true);
    expect(closes).toBe(0);
  });

  it('Menu and Tooltip attach to their child', async () => {
    const picked: string[] = [];
    await act(async () =>
      root.render(
        <>
          <Menu items={[{ value: 'edit', label: 'Edit' }]} onSelect={(v) => picked.push(v)}>
            <button className="probe-menu">More</button>
          </Menu>
          <Tooltip text="A hint">
            <button className="probe-tip">Hover</button>
          </Tooltip>
        </>,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>('.probe-menu')!;
    expect(trigger.parentElement!.className).toBe('mh-menu-trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    await act(async () => trigger.click());
    const item = document.querySelector<HTMLButtonElement>('.mh-menu [role="menuitem"]')!;
    await act(async () => item.click());
    expect(picked).toEqual(['edit']);
    const tipTarget = host.querySelector('.probe-tip')!;
    expect(document.getElementById(tipTarget.getAttribute('aria-describedby')!)!.textContent).toBe('A hint');
  });
});

describe('navigation parity with the web renderer', () => {
  it('Tabs renders the same classes and roles as createTabs', () => {
    const items = [
      { id: 'a', label: 'A', icon: 'home', badge: 2 },
      { id: 'b', label: 'B', disabled: true },
    ];
    const div = document.createElement('div');
    div.innerHTML = renderToStaticMarkup(<Tabs tabs={items} value="a" onChange={() => undefined} variant="pill" fill label="Views" />);
    const web = createTabs({ tabs: items, value: 'a', variant: 'pill', fill: true, label: 'Views' }).el;
    expect(classes(div.firstElementChild!)).toEqual(classes(web));
    const roles = (el: Element) => [...el.querySelectorAll('[role]')].map((n) => `${n.getAttribute('role')}:${n.getAttribute('aria-selected')}`);
    expect(roles(div.firstElementChild!)).toEqual(roles(web));
  });

  it('Tabs moves with arrow keys through onChange', async () => {
    function App() {
      const [value, setValue] = useState('a');
      return (
        <Tabs
          value={value}
          onChange={setValue}
          tabs={[
            { id: 'a', label: 'A', panel: 'Panel A' },
            { id: 'b', label: 'B', panel: 'Panel B' },
          ]}
        />
      );
    }
    await act(async () => root.render(<App />));
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[0]!.focus();
    await act(async () => {
      tabs[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tabs[1]);
    const panels = host.querySelectorAll<HTMLElement>('[role="tabpanel"]');
    expect(panels[0]!.hidden).toBe(true);
    expect(panels[1]!.hidden).toBe(false);
    expect(panels[1]!.getAttribute('aria-labelledby')).toBe(tabs[1]!.id);
  });

  it('PageHeader renders the same classes as createPageHeader', () => {
    const div = document.createElement('div');
    div.innerHTML = renderToStaticMarkup(<PageHeader eyebrow="Settings" title="Display" subtitle="Sleep" back={{}} actions={<button className="mh-button">Save</button>} />);
    const action = document.createElement('button');
    action.className = 'mh-button';
    action.textContent = 'Save';
    const web = createPageHeader({ eyebrow: 'Settings', title: 'Display', subtitle: 'Sleep', back: {}, actions: [action] }).el;
    expect(classes(div.firstElementChild!)).toEqual(classes(web));
  });
});
