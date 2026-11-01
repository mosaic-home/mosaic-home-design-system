import { act, useState, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  createAccentHeadline,
  createBackdrop,
  createBootSplash,
  createButtonGroup,
  createFavouriteToggle,
  createKbd,
  createLink,
  createNotice,
  createRecordingPill,
} from '../web/index.ts';
import { AccentHeadline, Backdrop, BootSplash, ButtonGroup, FavouriteToggle, Kbd, Link, Notice, RecordingPill } from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const REF_ATTRS = new Set(['id', 'aria-labelledby']);

/** Tags, sorted attributes (generated ids by order of appearance, styles without spaces) and text. */
function shape(root: Element): string {
  const ids = new Map<string, string>();
  const ref = (v: string): string => {
    if (!ids.has(v)) ids.set(v, `#${ids.size + 1}`);
    return ids.get(v)!;
  };
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof Element)) return '';
    const attrs = [...node.attributes]
      .filter((a) => a.name !== 'style')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => `${a.name}=${REF_ATTRS.has(a.name) ? ref(a.value) : a.value}`);
    const style = node.getAttribute('style');
    if (style) attrs.push(`style=${style.replace(/\s+/g, '').replace(/;$/, '')}`);
    return `<${node.tagName.toLowerCase()} ${attrs.join(' ')}>${[...node.childNodes].map(walk).join('')}</>`;
  };
  return walk(root);
}

function fromReact(element: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(element);
  return div.firstElementChild!;
}

const same = (element: ReactElement, web: Element): void => expect(shape(fromReact(element))).toBe(shape(web));
const noop = (): void => {};

function mount(element: ReactElement): { host: HTMLElement; unmount: () => void } {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  act(() => root.render(element));
  return {
    host,
    unmount: () => {
      act(() => root.unmount());
      host.remove();
    },
  };
}

describe('foundations parity', () => {
  it('AccentHeadline', () => {
    same(<AccentHeadline text="Good evening, home" accent="evening" size="display" level={1} />, createAccentHeadline({ text: 'Good evening, home', accent: 'evening', size: 'display', level: 1 }).el);
    same(<AccentHeadline text="Welcome" accent="home" tone="inherit" />, createAccentHeadline({ text: 'Welcome', accent: 'home', tone: 'inherit' }).el);
    same(<AccentHeadline text="Plain title" size="title" level={3} />, createAccentHeadline({ text: 'Plain title', size: 'title', level: 3 }).el);
  });

  it('Kbd', () => {
    same(<Kbd keys="Ctrl+K" />, createKbd({ keys: 'Ctrl+K' }).el);
    same(<Kbd keys={['ArrowUp', 'ArrowDown']} sequence size="small" />, createKbd({ keys: ['ArrowUp', 'ArrowDown'], sequence: true, size: 'small' }).el);
    same(<Kbd keys={['G', 'H']} sequence thenLabel="und" />, createKbd({ keys: ['G', 'H'], sequence: true, thenLabel: 'und' }).el);
    same(<Kbd keys="Ctrl++" />, createKbd({ keys: 'Ctrl++' }).el);
  });

  it('Backdrop', () => {
    same(<Backdrop />, createBackdrop().el);
    same(<Backdrop fixed drift dim />, createBackdrop({ fixed: true, drift: true, dim: true }).el);
  });

  it('BootSplash', () => {
    same(<BootSplash name="Mosaic Home" message="Starting" progress={null} />, createBootSplash({ name: 'Mosaic Home', message: 'Starting', progress: null }).el);
    same(<BootSplash message="Loading rooms" progress={40} progressLabel="Booting" inline />, createBootSplash({ message: 'Loading rooms', progress: 40, progressLabel: 'Booting', inline: true }).el);
    same(<BootSplash />, createBootSplash().el);
  });

  it('BootSplash calls onLeft after leaving', () => {
    vi.useFakeTimers();
    const onLeft = vi.fn();
    const m = mount(<BootSplash leaving onLeft={onLeft} />);
    expect(m.host.firstElementChild!.classList.contains('is-leaving')).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(onLeft).toHaveBeenCalledTimes(1);
    m.unmount();
    vi.useRealTimers();
  });
});

describe('actions parity', () => {
  const items = [
    { id: 'bold', label: 'Bold', icon: 'edit', iconOnly: true, pressed: true },
    { id: 'week', label: 'Week', pressed: false },
    { id: 'off', label: 'Off', icon: 'power', disabled: true },
  ];

  it('ButtonGroup', () => {
    same(<ButtonGroup label="Style" items={items} />, createButtonGroup({ label: 'Style', items }).el);
    same(
      <ButtonGroup label="Style" items={items} toolbar orientation="vertical" variant="tonal" size="small" fullWidth />,
      createButtonGroup({ label: 'Style', items, toolbar: true, orientation: 'vertical', variant: 'tonal', size: 'small', fullWidth: true }).el,
    );
  });

  it('ButtonGroup toolbar moves focus with the arrow keys', () => {
    const onClick = vi.fn();
    const m = mount(<ButtonGroup label="Playback" toolbar items={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B', disabled: true }, { id: 'c', label: 'C' }]} onClick={onClick} />);
    const buttons = [...m.host.querySelectorAll('button')];
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
    act(() => buttons[0]!.focus());
    act(() => {
      buttons[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    expect(document.activeElement).toBe(buttons[2]);
    expect(buttons.map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
    act(() => buttons[2]!.click());
    expect(onClick).toHaveBeenCalledWith('c', expect.anything());
    m.unmount();
  });

  it('Link', () => {
    same(
      <Link href="https://example.com/" external>
        Read more
      </Link>,
      createLink({ text: 'Read more', href: 'https://example.com/', external: true }).el,
    );
    same(
      <Link href="#x" tone="muted" underline="hover" icon="home">
        Living room
      </Link>,
      createLink({ text: 'Living room', href: '#x', tone: 'muted', underline: 'hover', icon: 'home' }).el,
    );
    same(<Link tone="inherit">Show more</Link>, createLink({ text: 'Show more', tone: 'inherit' }).el);
  });

  it('FavouriteToggle', () => {
    same(<FavouriteToggle />, createFavouriteToggle().el);
    same(<FavouriteToggle pressed label="Pinned" showLabel size="small" disabled />, createFavouriteToggle({ pressed: true, label: 'Pinned', showLabel: true, size: 'small', disabled: true }).el);
  });

  it('FavouriteToggle toggles, controlled or not', () => {
    const changes: boolean[] = [];
    const m = mount(<FavouriteToggle onPressedChange={(v) => changes.push(v)} />);
    const button = m.host.querySelector('button')!;
    act(() => button.click());
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.classList.contains('is-popping')).toBe(true);
    expect(changes).toEqual([true]);
    m.unmount();

    function Controlled() {
      const [on, setOn] = useState(false);
      return <FavouriteToggle pressed={on} onPressedChange={setOn} />;
    }
    const c = mount(<Controlled />);
    const b = c.host.querySelector('button')!;
    act(() => b.click());
    act(() => b.click());
    expect(b.getAttribute('aria-pressed')).toBe('false');
    c.unmount();
  });
});

describe('feedback parity', () => {
  it('Notice', () => {
    const actions = [{ label: 'Allow', primary: true }, { label: 'Not now' }];
    same(
      <Notice kind="permission" icon="microphone" title="Talk to your home" points={['Only while you hold the button', 'Off any time']} actions={actions}>
        Allow microphone access.
      </Notice>,
      createNotice({ kind: 'permission', icon: 'microphone', title: 'Talk to your home', message: 'Allow microphone access.', points: ['Only while you hold the button', 'Off any time'], actions }).el,
    );
    same(<Notice title="Tip" actions={[{ label: 'Got it', primary: true }]}>Long-press a tile.</Notice>, createNotice({ title: 'Tip', message: 'Long-press a tile.', actions: [{ label: 'Got it', primary: true }] }).el);
    same(
      <Notice kind="capability" icon={false} dismissible dismissLabel="Hide">
        No microphone here.
      </Notice>,
      createNotice({ kind: 'capability', icon: false, dismissible: true, dismissLabel: 'Hide', message: 'No microphone here.' }).el,
    );
    same(<Notice kind="permission">Untitled.</Notice>, createNotice({ kind: 'permission', message: 'Untitled.' }).el);
  });

  it('Notice hides itself when dismissed', () => {
    const onDismiss = vi.fn();
    const m = mount(
      <Notice actions={[{ label: 'Got it', dismisses: true }]} onDismiss={onDismiss}>
        Tip
      </Notice>,
    );
    act(() => m.host.querySelector<HTMLButtonElement>('.mh-notice__actions button')!.click());
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(m.host.querySelector('.mh-notice')).toBeNull();
    m.unmount();
  });

  it('RecordingPill', () => {
    same(<RecordingPill elapsed={42} level={0.5} />, createRecordingPill({ elapsed: 42, level: 0.5, ticking: false }).el);
    same(
      <RecordingPill elapsed={3725} paused floating="bottom" label="Dictating" onPauseToggle={noop} onStop={noop} />,
      createRecordingPill({ elapsed: 3725, paused: true, floating: 'bottom', label: 'Dictating', onPauseToggle: noop, onStop: noop, ticking: false }).el,
    );
  });

  it('RecordingPill counts up while not paused', () => {
    vi.useFakeTimers();
    const m = mount(<RecordingPill elapsed={5} />);
    act(() => vi.advanceTimersByTime(2100));
    expect(m.host.querySelector('.mh-recording-pill__timer')!.textContent).toBe('0:07');
    m.unmount();
    vi.useRealTimers();
  });
});
