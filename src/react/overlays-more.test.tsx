import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSplitButton, type Command } from '../web/index.ts';
import { CommandPalette, Popover, SplitButton } from './index.ts';

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

/** Tag, classes, role, ARIA (ids excepted) and own text of every element, in document order. */
function shape(el: Element): string[] {
  const out: string[] = [];
  const walk = (node: Element): void => {
    const attrs = [...node.attributes]
      .filter((a) => ['class', 'role', 'type', 'title', 'd'].includes(a.name) || (a.name.startsWith('aria-') && !['aria-controls', 'aria-labelledby'].includes(a.name)))
      .map((a) => `${a.name}=${a.value}`)
      .sort();
    const text = [...node.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${node.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    [...node.children].forEach(walk);
  };
  walk(el);
  return out;
}

const ITEMS = [
  { value: 'later', label: 'Run in 10 minutes' },
  { separator: true as const },
  { value: 'edit', label: 'Edit scene', icon: 'edit' },
];

const COMMANDS: Command[] = [
  { value: 'lights-off', label: 'Turn off all lights', group: 'Lights' },
  { value: 'lock', label: 'Lock the front door', group: 'Security' },
];

describe('SplitButton', () => {
  it('renders the web DOM and opens the web menu', async () => {
    const picked: string[] = [];
    let main = 0;
    await act(async () => root.render(<SplitButton label="Run scene" icon="play" variant="tonal" size="large" items={ITEMS} onClick={() => (main += 1)} onSelect={(v) => picked.push(v)} />));
    const el = host.querySelector('.mh-split-button')!;
    const web = createSplitButton({ label: 'Run scene', icon: 'play', variant: 'tonal', size: 'large', items: ITEMS });
    expect(shape(el)).toEqual(shape(web.el));
    const [button, toggle] = [...el.querySelectorAll('button')];
    await act(async () => button!.click());
    expect(main).toBe(1);
    await act(async () => toggle!.click());
    const menu = document.querySelector('.mh-menu')!;
    expect(toggle!.getAttribute('aria-expanded')).toBe('true');
    expect(toggle!.getAttribute('aria-controls')).toBe(menu.id);
    expect(menu.getAttribute('aria-labelledby')).toBe(toggle!.id);
    await act(async () => menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')[1]!.click());
    expect(picked).toEqual(['edit']);
    expect(document.querySelector('.mh-menu')).toBeNull();
  });
});

describe('Popover', () => {
  it('wraps its trigger, portals the content and reports open changes', async () => {
    const changes: string[] = [];
    await act(async () =>
      root.render(
        <Popover trigger={<button className="probe-trigger">Brightness</button>} title="Brightness" onOpenChange={(open, reason) => changes.push(`${open}${reason ? `:${reason}` : ''}`)}>
          <input className="probe-range" type="range" />
        </Popover>,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>('.probe-trigger')!;
    expect(trigger.parentElement!.className).toBe('mh-popover-trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    await act(async () => trigger.click());
    const pop = document.querySelector<HTMLElement>('.mh-popover')!;
    expect(pop.querySelector('.mh-popover__body .probe-range')).not.toBeNull();
    expect(document.activeElement).toBe(pop.querySelector('.probe-range'));
    expect(pop.querySelector('.mh-popover__title')!.textContent).toBe('Brightness');
    expect(document.getElementById(pop.getAttribute('aria-labelledby')!)!.textContent).toBe('Brightness');
    await act(async () => {
      pop.querySelector('.probe-range')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    });
    expect(document.querySelector('.mh-popover')).toBeNull();
    expect(changes).toEqual(['true', 'false:escape']);
  });

  it('follows the open prop', async () => {
    function App() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button className="probe-outside" onClick={() => setOpen((o) => !o)}>
            Toggle
          </button>
          <Popover trigger={<button>Filter</button>} label="Filter" open={open} onOpenChange={setOpen}>
            <p>Body</p>
          </Popover>
        </>
      );
    }
    await act(async () => root.render(<App />));
    const outside = host.querySelector<HTMLButtonElement>('.probe-outside')!;
    await act(async () => outside.click());
    expect(document.querySelector('.mh-popover')!.getAttribute('aria-label')).toBe('Filter');
    await act(async () => outside.click());
    expect(document.querySelector('.mh-popover')).toBeNull();
  });
});

describe('CommandPalette', () => {
  it('opens with the prop, runs a command and reports the close', async () => {
    const picked: string[] = [];
    const reasons: string[] = [];
    function App() {
      const [open, setOpen] = useState(true);
      return (
        <CommandPalette
          open={open}
          commands={COMMANDS}
          onSelect={(v) => picked.push(v)}
          onClose={(r) => {
            reasons.push(r);
            setOpen(false);
          }}
        />
      );
    }
    await act(async () => root.render(<App />));
    const dlg = document.querySelector<HTMLDialogElement>('dialog.mh-palette')!;
    expect(dlg.open).toBe(true);
    const input = dlg.querySelector<HTMLInputElement>('.mh-palette__input')!;
    expect(document.activeElement).toBe(input);
    expect(dlg.querySelectorAll('[role="option"]')).toHaveLength(2);
    await act(async () => {
      input.value = 'lock';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    });
    expect(picked).toEqual(['lock']);
    expect(reasons).toEqual(['confirm']);
    expect(dlg.classList.contains('is-closing')).toBe(true);
  });

  it('updates its commands and stays quiet when the prop closes it', async () => {
    const reasons: string[] = [];
    function App({ open, commands }: { open: boolean; commands: Command[] }) {
      return <CommandPalette open={open} commands={commands} onClose={(r) => reasons.push(r)} />;
    }
    await act(async () => root.render(<App open commands={COMMANDS} />));
    await act(async () => root.render(<App open commands={COMMANDS.slice(0, 1)} />));
    expect(document.querySelectorAll('dialog.mh-palette [role="option"]')).toHaveLength(1);
    await act(async () => root.render(<App open={false} commands={COMMANDS.slice(0, 1)} />));
    expect(reasons).toEqual([]);
  });
});
