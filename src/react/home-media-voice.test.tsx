import { act, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  createAssistReply,
  createSpeakerSelector,
  createTimer,
  createTvRemote,
  createUpNext,
  createVoiceRing,
  type AssistReplyOptions,
  type SpeakerSelectorOptions,
  type TimerItem,
  type TvRemoteOptions,
  type UpNextItem,
  type VoiceRingOptions,
} from '../web/home/media-voice/index.ts';
import { AssistReply, SpeakerSelector, Timer, TvRemote, UpNext, VoiceRing } from './home-media-voice.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden`, `tabindex`, input type and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => ['class', 'role', 'hidden', 'tabindex', 'type', 'referrerpolicy', 'd', 'disabled'].includes(a.name) || a.name.startsWith('aria-'))
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
  // React 19 hoists a preload <link> for images; skip it.
  return div.querySelector(':scope > :not(link)')!;
}

describe('home media and voice parity', () => {
  it('Timer', () => {
    const now = (): number => 50_000;
    const cases: { timers: TimerItem[]; addStep?: number; labels?: { empty: string } }[] = [
      {
        timers: [
          { id: 'a', name: 'Pasta', duration: 600, state: 'running', endsAt: 290_000 },
          { id: 'b', name: 'Bread', duration: 5400, state: 'paused', remaining: 3725 },
          { id: 'c', duration: 60, state: 'finished' },
          { id: 'd', name: 'Eggs', duration: 60, state: 'running', endsAt: 40_000 },
        ],
        addStep: 120,
      },
      { timers: [], labels: { empty: 'Keine' } },
    ];
    for (const c of cases) {
      const web = createTimer({ ...c, now });
      expect(shape(react(<Timer {...c} now={now} />))).toEqual(shape(web.el));
      web.destroy();
    }
  });

  it('SpeakerSelector', () => {
    const cases: SpeakerSelectorOptions[] = [
      {
        speakers: [
          { id: 'a', name: 'Kitchen', detail: 'Shelf', selected: true, playing: true, volume: 0.4, muted: true },
          { id: 'b', name: 'Study', icon: 'music', volume: null },
          { id: 'c', name: 'Garden', selected: true, volume: null },
          { id: 'd', name: 'Loft', unavailable: true },
        ],
      },
      { speakers: [{ id: 'a', name: 'TV', selected: true, volume: 0.6 }, { id: 'b', name: 'Hall' }], multiple: false, label: 'Send to' },
      { speakers: [] },
    ];
    for (const c of cases) expect(shape(react(<SpeakerSelector {...c} />))).toEqual(shape(createSpeakerSelector(c).el));
  });

  it('TvRemote', () => {
    const cases: TvRemoteOptions[] = [
      { sources: [{ id: 'h', label: 'HDMI 1', icon: 'film', active: true }, { id: 'a', label: 'Films' }], muted: true },
      { keys: ['up', 'down', 'ok', 'volume-down', 'channel-up', 'menu'], disabled: true, label: 'Bedroom TV' },
      { keys: ['power'] },
    ];
    for (const c of cases) expect(shape(react(<TvRemote {...c} />))).toEqual(shape(createTvRemote(c).el));
  });

  it('UpNext', () => {
    const items: UpNextItem[] = [
      { id: 'a', title: 'First Song', subtitle: 'Band', art: 'https://example.com/a.jpg', duration: 200 },
      { id: 'b', title: 'Episode 2', icon: 'film' },
      { id: 'c', title: 'Third' },
    ];
    const onRemove = (): void => {};
    expect(shape(react(<UpNext items={items} onRemove={onRemove} />))).toEqual(shape(createUpNext({ items, onRemove }).el));
    expect(shape(react(<UpNext items={items} max={1} label="Queue" />))).toEqual(shape(createUpNext({ items, max: 1, label: 'Queue' }).el));
    expect(shape(react(<UpNext items={[]} />))).toEqual(shape(createUpNext({ items: [] }).el));
  });

  it('VoiceRing', () => {
    const cases: VoiceRingOptions[] = [{}, { phase: 'listening', level: 0.7, detail: 'Turn on the…' }, { phase: 'muted', size: 'medium', onTap: () => {} }, { phase: 'error', label: 'Offline' }];
    for (const c of cases) expect(shape(react(<VoiceRing {...c} />))).toEqual(shape(createVoiceRing(c).el));
  });

  it('AssistReply', () => {
    const changes = [
      { id: 'l', name: 'Lamp', icon: 'lightbulb', state: 'On', active: true, tone: 'warm' as const },
      { name: 'Fan', icon: 'fan', failed: true },
    ];
    const cases: AssistReplyOptions[] = [
      { heard: 'Lights on', reply: 'Done.', changes, onUndo: () => {} },
      { reply: 'Undoing', changes, onUndo: () => {}, undoing: true },
      { heard: 'Lights on', reply: 'Done.', onUndo: () => {}, undone: true },
      { heard: 'Hello?', reply: 'I couldn’t reach it.', error: true },
    ];
    for (const c of cases) expect(shape(react(<AssistReply {...c} />))).toEqual(shape(createAssistReply(c).el));
  });
});

describe('home media and voice behaviour', () => {
  it('Timer ticks from the end time and announces a finish', () => {
    vi.useFakeTimers();
    let now = 0;
    const finished: string[] = [];
    const div = document.createElement('div');
    document.body.append(div);
    const root = createRoot(div);
    const timers: TimerItem[] = [{ id: 'a', name: 'Tea', duration: 3, state: 'running', endsAt: 2_000 }];
    act(() => root.render(<Timer timers={timers} now={() => now} onFinish={(id) => finished.push(id)} />));
    expect(div.querySelector('.mh-timer__time')!.textContent).toBe('0:02');
    now = 1_000;
    act(() => vi.advanceTimersByTime(1_000));
    expect(div.querySelector('.mh-timer__time')!.textContent).toBe('0:01');
    now = 2_000;
    act(() => vi.advanceTimersByTime(1_000));
    expect(div.querySelector('.mh-timer__item')!.className).toBe('mh-timer__item is-finished');
    expect(div.querySelector('.mh-timer__announce')!.textContent).toBe('Tea finished');
    expect(finished).toEqual(['a']);
    act(() => root.unmount());
    div.remove();
    vi.useRealTimers();
  });

  it('UpNext moves the focus to the next item when the focused one is removed', () => {
    const div = document.createElement('div');
    document.body.append(div);
    const root = createRoot(div);
    let items: UpNextItem[] = [
      { id: 'a', title: 'One' },
      { id: 'b', title: 'Two' },
      { id: 'c', title: 'Three' },
    ];
    const draw = (): void => root.render(<UpNext items={items} onRemove={remove} />);
    const remove = (id: string): void => {
      items = items.filter((i) => i.id !== id);
      draw();
    };
    act(draw);
    const button = (label: string): HTMLButtonElement => div.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
    act(() => button('Remove Two').focus());
    act(() => button('Remove Two').click());
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove Three');
    act(() => button('Remove Three').click());
    expect(document.activeElement!.getAttribute('aria-label')).toBe('Remove One');
    act(() => button('Remove One').click());
    expect(document.activeElement).toBe(div.querySelector('.mh-up-next'));
    act(() => root.unmount());
    div.remove();
  });

  it('TvRemote sends keys from keyboard clicks and arrow keys', () => {
    const div = document.createElement('div');
    document.body.append(div);
    const root = createRoot(div);
    const seen: string[] = [];
    act(() => root.render(<TvRemote onKey={(k) => seen.push(k)} />));
    act(() => div.querySelector<HTMLButtonElement>('.mh-tv-remote__ok')!.click());
    act(() => {
      div.querySelector('.mh-tv-remote__ok')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    });
    expect(seen).toEqual(['ok', 'down']);
    act(() => root.unmount());
    div.remove();
  });
});
