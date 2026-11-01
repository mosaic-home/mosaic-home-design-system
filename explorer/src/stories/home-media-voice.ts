import { mdiBlindsHorizontal, mdiCeilingLight, mdiFan, mdiGamepadVariant, mdiHdmiPort, mdiLockOutline, mdiRadiator, mdiSofa, mdiSpeakerMultiple, mdiTelevision, mdiTelevisionPlay } from '@mdi/js';
import { createButton } from '../../../src/web/actions/button.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createAssistReply, type AssistReplyOptions } from '../../../src/web/home/media-voice/assistReply.ts';
import { createSpeakerSelector, type Speaker } from '../../../src/web/home/media-voice/speakerSelector.ts';
import { createTimer, type TimerItem } from '../../../src/web/home/media-voice/timer.ts';
import { createTvRemote, type TvRemoteSource } from '../../../src/web/home/media-voice/tvRemote.ts';
import { createUpNext, type UpNextItem } from '../../../src/web/home/media-voice/upNext.ts';
import { createVoiceRing, type VoiceRingPhase } from '../../../src/web/home/media-voice/voiceRing.ts';
import { homeColorVariables } from '../../../src/tokens/home.ts';
import type { Tokens } from '../../../src/tokens/types.ts';
import type { Story } from './types.ts';

// Timers, speakers, TV remote, queue, voice ring and assistant reply. Every name, title and room is invented.

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const inCard = (body: HTMLElement, title?: string): HTMLElement => createCard({ title, body }).el;
const svgUrl = (svg: string): string => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Stand-in artwork in the theme's series colours, so the stories need no image files. */
const artUrl = (tokens: Tokens, a: number, b: number): string => {
  const s = tokens.theme.palette.series;
  return svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='${s[a]}'/><rect x='30' y='30' width='60' height='60' rx='12' fill='${s[b]}'/></svg>`);
};

/** Runs `fn` every `ms` while `el` is on screen. */
const whileShown = (el: HTMLElement, ms: number, fn: () => void): void => {
  let started = false;
  const t = setInterval(() => {
    if (el.isConnected) started = true;
    else if (started) clearInterval(t);
    if (started) fn();
  }, ms);
};

// Timer ------------------------------------------------------------------------------------------------------

/** Timers that keep their own state, like an app would: the buttons work. */
function liveTimers(start: TimerItem[]): HTMLElement {
  let timers = start;
  const set = (id: string, change: (t: TimerItem) => TimerItem | null): void => {
    timers = timers.flatMap((t) => (t.id === id ? (change(t) ?? []) : [t]));
    timer.update({ timers, ...events });
  };
  const left = (t: TimerItem): number => (t.state === 'running' && t.endsAt ? Math.max(0, (t.endsAt - Date.now()) / 1000) : (t.remaining ?? t.duration));
  const events = {
    onPause: (id: string) => set(id, (t) => ({ ...t, state: 'paused', remaining: left(t), endsAt: null })),
    onResume: (id: string) => set(id, (t) => ({ ...t, state: 'running', endsAt: Date.now() + left(t) * 1000, remaining: null })),
    onAdd: (id: string, seconds: number) =>
      set(id, (t) => {
        const rest = (t.state === 'finished' ? 0 : left(t)) + seconds;
        return t.state === 'paused'
          ? { ...t, remaining: rest, duration: Math.max(t.duration, rest) }
          : { ...t, state: 'running', endsAt: Date.now() + rest * 1000, remaining: null, duration: Math.max(t.duration, rest) };
      }),
    onCancel: (id: string) => set(id, () => null),
    onFinish: (id: string) => set(id, (t) => ({ ...t, state: 'finished', endsAt: null })),
  };
  const timer = createTimer({ timers, ...events });
  const again = createButton({
    label: 'Add a 10-second timer',
    variant: 'secondary',
    size: 'small',
    icon: 'add',
    onClick: () => {
      timers = [...timers, { id: `quick-${Date.now()}`, name: 'Quick check', duration: 10, state: 'running', endsAt: Date.now() + 10_000 }];
      timer.update({ timers, ...events });
    },
  });
  return stack(timer.el, row(again.el));
}

const timerStory: Story = {
  id: 'timer',
  render: () => {
    const now = Date.now();
    return stack(
      caption('Several at once: running, paused and finished (the buttons work; the eggs finish in eight seconds)'),
      inCard(
        liveTimers([
          { id: 'eggs', name: 'Eggs', duration: 20, state: 'running', endsAt: now + 8_000 },
          { id: 'pasta', name: 'Pasta', duration: 600, state: 'running', endsAt: now + 431_000 },
          { id: 'bread', name: 'Bread proving', duration: 5400, state: 'paused', remaining: 3725 },
          { id: 'tea', name: 'Tea', duration: 240, state: 'finished' },
        ]),
        'Kitchen timers',
      ),
      caption('No name, two minutes added each time; and nothing running'),
      grid(
        inCard(createTimer({ timers: [{ id: 'a', duration: 900, state: 'running', endsAt: now + 512_000 }], addStep: 120 }).el),
        inCard(createTimer({ timers: [] }).el),
      ),
    );
  },
};

// Speaker selector -------------------------------------------------------------------------------------------

function liveSpeakers(start: Speaker[], multiple = true): HTMLElement {
  let speakers = start;
  const set = (id: string, patch: Partial<Speaker>): void => {
    speakers = speakers.map((s) => (s.id === id ? { ...s, ...patch } : multiple || patch.selected === undefined ? s : { ...s, selected: false }));
    selector.update({ speakers, multiple, ...events });
  };
  const events = {
    onSelect: (id: string, selected: boolean) => set(id, { selected }),
    onVolume: (id: string, volume: number) => set(id, { volume, muted: false }),
    onMute: (id: string, muted: boolean) => set(id, { muted }),
  };
  const selector = createSpeakerSelector({ speakers, multiple, ...events });
  return selector.el;
}

const speakerStory: Story = {
  id: 'speaker-selector',
  render: () =>
    stack(
      caption('Grouped playback: pick several, each with its own volume (the controls work here)'),
      inCard(
        liveSpeakers([
          { id: 'living', name: 'Living room', detail: 'Soundbar', icon: mdiSofa, selected: true, playing: true, volume: 0.42, muted: false },
          { id: 'kitchen', name: 'Kitchen', detail: 'Shelf speaker', selected: true, playing: true, volume: 0.25, muted: true },
          { id: 'study', name: 'Study', detail: 'Desk speaker', volume: 0.5, muted: false },
          { id: 'garden', name: 'Garden', detail: 'Outdoor pair', icon: mdiSpeakerMultiple, volume: null, muted: false },
          { id: 'loft', name: 'Loft', detail: 'Bookshelf speaker', unavailable: true, volume: 0.3 },
        ]),
        'Play on',
      ),
      caption('One at a time (radios); the picked one has a volume without mute'),
      inCard(
        liveSpeakers(
          [
            { id: 'tv', name: 'Television', icon: mdiTelevision, selected: true, volume: 0.6 },
            { id: 'hall', name: 'Hallway', detail: 'Ceiling speaker', volume: 0.2 },
            { id: 'bath', name: 'Bathroom', detail: 'Mirror speaker', volume: 0.35 },
          ],
          false,
        ),
        'Send to',
      ),
    ),
};

// TV remote --------------------------------------------------------------------------------------------------

const SOURCES: TvRemoteSource[] = [
  { id: 'hdmi1', label: 'HDMI 1', icon: mdiHdmiPort },
  { id: 'console', label: 'Console', icon: mdiGamepadVariant },
  { id: 'films', label: 'Film Hall', icon: mdiTelevisionPlay, active: true },
  { id: 'aerial', label: 'Aerial' },
];

function liveRemote(): HTMLElement {
  let sources = SOURCES;
  let muted = false;
  const log = createText('Press a key (hold the arrows or volume to repeat)', { variant: 'label', tone: 'muted' });
  let count = 0;
  const events = {
    onKey: (key: string) => {
      count += 1;
      log.textContent = `Sent “${key}” (${count})`;
      if (key === 'mute') {
        muted = !muted;
        remote.update({ sources, muted, ...events });
      }
    },
    onSource: (id: string) => {
      sources = sources.map((s) => ({ ...s, active: s.id === id }));
      log.textContent = `Switched to ${sources.find((s) => s.id === id)!.label}`;
      remote.update({ sources, muted, ...events });
    },
  };
  const remote = createTvRemote({ sources, muted, ...events });
  return stack(remote.el, log);
}

const tvRemoteStory: Story = {
  id: 'tv-remote',
  render: () =>
    stack(
      caption('Every key, with inputs and apps (with focus on the pad, the arrow keys send directions)'),
      inCard(liveRemote(), 'Living room TV'),
      caption('Fewer keys: a streaming stick without channels or power; and a remote that is off'),
      grid(
        inCard(createTvRemote({ keys: ['up', 'down', 'left', 'right', 'ok', 'back', 'home', 'play-pause', 'volume-up', 'volume-down', 'mute'] }).el),
        inCard(createTvRemote({ keys: ['power', 'up', 'down', 'left', 'right', 'ok', 'back', 'home'], disabled: true }).el),
      ),
    ),
};

// Up next ----------------------------------------------------------------------------------------------------

function liveQueue(tokens: Tokens): HTMLElement {
  let items: UpNextItem[] = [
    { id: 'q1', title: 'Harbour Lights at Dusk', subtitle: 'Marram and the Low Hills', art: artUrl(tokens, 1, 4), duration: 214 },
    { id: 'q2', title: 'Slow Rivers', subtitle: 'Ines Okafor-Lund', art: artUrl(tokens, 2, 0), duration: 187 },
    { id: 'q3', title: 'A Map of Quiet Places', subtitle: 'Cinder Vale Quartet', art: null, duration: 301 },
    { id: 'q4', title: 'Copper Kettle Morning', subtitle: 'Wick and the Teaspoons', art: 'data:image/png;base64,broken', duration: 162 },
    { id: 'q5', title: 'Weekend in the Orchard', subtitle: 'Fen and Bramble', art: artUrl(tokens, 5, 3), duration: 248 },
  ];
  const playing = createText('Now playing: Lanterns Over the Quay', { variant: 'label', tone: 'muted' });
  const events = {
    onPlay: (id: string) => {
      const item = items.find((i) => i.id === id)!;
      playing.textContent = `Now playing: ${item.title}`;
      items = items.filter((i) => i.id !== id);
      queue.update({ items, ...events });
    },
    onRemove: (id: string) => {
      items = items.filter((i) => i.id !== id);
      queue.update({ items, ...events });
    },
  };
  const queue = createUpNext({ items, ...events });
  return stack(playing, queue.el);
}

const upNextStory: Story = {
  id: 'up-next',
  render: (tokens) =>
    stack(
      caption('Play now and remove work here (removing keeps the keyboard focus in the list); a broken picture shows the placeholder'),
      inCard(liveQueue(tokens), 'Up next'),
      caption('Episodes, at most two shown; and an empty queue'),
      grid(
        inCard(
          createUpNext({
            items: [
              { id: 'e1', title: 'Episode 4: The Lighthouse Keeper', subtitle: 'Saltmarsh Stories', icon: 'film', duration: 2710 },
              { id: 'e2', title: 'Episode 5: Low Tide', subtitle: 'Saltmarsh Stories', icon: 'film', duration: 2655 },
              { id: 'e3', title: 'Episode 6: The Storm Wall', subtitle: 'Saltmarsh Stories', icon: 'film', duration: 2930 },
              { id: 'e4', title: 'Episode 7: Homecoming', subtitle: 'Saltmarsh Stories', icon: 'film', duration: 3020 },
            ],
            max: 2,
            onPlay: () => {},
          }).el,
          'Next episodes',
        ),
        inCard(createUpNext({ items: [] }).el, 'Up next'),
      ),
    ),
};

// Voice ring -------------------------------------------------------------------------------------------------

const PHASES: VoiceRingPhase[] = ['idle', 'listening', 'transcribing', 'thinking', 'speaking', 'muted', 'error'];

const voiceRingStory: Story = {
  id: 'voice-ring',
  render: () => {
    const ring = createVoiceRing({ phase: 'listening', onTap: () => step(1) });
    let at = 1;
    const detail: Partial<Record<VoiceRingPhase, string>> = {
      listening: 'Turn on the lights in the…',
      transcribing: 'Turn on the lights in the study',
      error: 'The assistant didn’t answer. Try again in a moment.',
    };
    const step = (by: number): void => {
      at = (at + by + PHASES.length) % PHASES.length;
      ring.setPhase(PHASES[at]!);
      ring.setDetail(detail[PHASES[at]!]);
    };
    ring.setDetail(detail.listening);
    whileShown(ring.el, 90, () => {
      const t = Date.now() / 1000;
      ring.setLevel(Math.max(0, Math.min(1, 0.4 + 0.35 * Math.sin(t * 2.7) + (Math.random() - 0.5) * 0.45)));
    });
    const buttons = row(...PHASES.map((p, i) => createButton({ label: p, variant: 'tonal', size: 'small', onClick: () => step(i - at) }).el));
    return stack(
      caption('Tap the ring (or a phase) to step through the phases; the level here is made up'),
      inCard(stack(ring.el, buttons)),
      caption('Every phase at the medium size'),
      grid(...PHASES.map((phase) => inCard(createVoiceRing({ phase, size: 'medium', level: 0.6 }).el))),
    );
  },
};

// Assist reply -----------------------------------------------------------------------------------------------

function liveReply(tokens: Tokens): HTMLElement {
  let state: AssistReplyOptions = {
    heard: 'Turn off the living room lights and close the blinds',
    reply: 'Done. I turned off 2 lights and closed the blinds.',
    changes: [
      { id: 'l1', name: 'Ceiling light', icon: mdiCeilingLight, state: 'Off' },
      { id: 'l2', name: 'Reading lamp', icon: 'lightbulb', state: 'Off' },
      { id: 'b1', name: 'Living room blinds', icon: mdiBlindsHorizontal, state: 'Closing', active: true },
    ],
  };
  const onUndo = (): void => {
    state = { ...state, undoing: true };
    reply.update({ ...state, onUndo });
    setTimeout(() => {
      state = {
        ...state,
        undoing: false,
        undone: true,
        changes: [
          { id: 'l1', name: 'Ceiling light', icon: mdiCeilingLight, state: 'On', active: true, tone: 'warm' },
          { id: 'l2', name: 'Reading lamp', icon: 'lightbulb-on', state: 'On · 40%', active: true, tone: 'warm' },
          { id: 'b1', name: 'Living room blinds', icon: mdiBlindsHorizontal, state: 'Open' },
        ],
      };
      reply.update({ ...state, onUndo });
    }, 900);
  };
  const reply = createAssistReply({ ...state, onUndo });
  const el = reply.el;
  for (const [name, value] of Object.entries(homeColorVariables(tokens.theme))) el.style.setProperty(name, value);
  return el;
}

const assistReplyStory: Story = {
  id: 'assist-reply',
  render: (tokens) =>
    stack(
      caption('What was heard, the reply and what changed; Undo works here (and the lit lamps take the home colours)'),
      inCard(liveReply(tokens)),
      caption('One part failed, no undo'),
      inCard(
        createAssistReply({
          heard: 'Set the heating to 21 and start the fan',
          reply: 'The heating is set to 21 °C, but the bedroom fan didn’t respond.',
          changes: [
            { name: 'Hallway thermostat', icon: mdiRadiator, state: 'Heat · 21 °C', active: true, tone: 'heat' },
            { name: 'Bedroom fan', icon: mdiFan, failed: true },
          ],
        }).el,
      ),
      caption('A question answered (nothing changed), and an error'),
      grid(
        inCard(createAssistReply({ heard: 'Is the back door locked?', reply: 'Yes, the back door is locked.', changes: [{ name: 'Back door', icon: mdiLockOutline, state: 'Locked' }] }).el),
        inCard(createAssistReply({ heard: 'Dim the porch light', reply: 'I couldn’t reach the porch light.', error: true }).el),
      ),
    ),
};

export const homeMediaVoiceStories: Story[] = [timerStory, speakerStory, tvRemoteStory, upNextStory, voiceRingStory, assistReplyStory];
