import { mdiShieldHome } from '@mdi/js';
import { createButton } from '../../../src/web/actions/button.ts';
import { h } from '../../../src/web/dom.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createControlCard } from '../../../src/web/home/controlCard.ts';
import { createAlarmPanel, type AlarmPanelHandle, type AlarmState } from '../../../src/web/home/security/alarmPanel.ts';
import { createConnectionStatus, type ConnectionStatusHandle } from '../../../src/web/home/security/connectionStatus.ts';
import { createDeviceSetup, normaliseServerAddress, type DeviceSetupResult } from '../../../src/web/home/security/deviceSetup.ts';
import { createDoorbell, type DoorbellHandle } from '../../../src/web/home/security/doorbell.ts';
import { createHazardBanner, type HazardBannerHandle } from '../../../src/web/home/security/hazardBanner.ts';
import { createOpeningsSummary, type OpeningEntry } from '../../../src/web/home/security/openingsSummary.ts';
import { createPeopleStrip, type PersonEntry } from '../../../src/web/home/security/peopleStrip.ts';
import type { Story } from './types.ts';

// Alarm panel, doorbell, people, openings, hazards, connection status and device setup. Every name, place, address
// and token is invented; addresses are documentation addresses and tokens are obviously fake.

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);
const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const later = (fn: () => void, ms = 600): void => void setTimeout(fn, ms);
const card = (title: string, body: HTMLElement): HTMLElement => createControlCard({ title, icon: mdiShieldHome, body }).el;

/** The demo code; a real panel never knows it, the app checks it. */
const DEMO_CODE = '1234';

/** A panel that behaves like an alarm: exit delay, armed, entry delay when "a door opens", triggered. */
function liveAlarm(): HTMLElement {
  const log = caption(`Demo code ${DEMO_CODE}. Arm, wait for the exit delay, then use “Open a door”.`);
  let entry: ReturnType<typeof setTimeout> | undefined;
  const set = (state: AlarmState, extra: Parameters<AlarmPanelHandle['update']>[0] = {}): void => panel.update({ state, deadline: null, delay: null, error: null, ...extra });
  const panel = createAlarmPanel({
    label: 'House alarm',
    state: 'disarmed',
    onArm: (mode) => {
      set('arming', { mode, deadline: Date.now() + 10_000, delay: 10 });
      entry = setTimeout(() => set('armed', { mode }), 10_000);
    },
    onDisarm: (code) => {
      if (code !== DEMO_CODE && code !== undefined) {
        panel.update({ error: 'Wrong code' });
        return;
      }
      clearTimeout(entry);
      set('disarming');
      later(() => set('disarmed'));
    },
  });
  const door = createButton({
    label: 'Open a door',
    variant: 'secondary',
    size: 'small',
    onClick: () => {
      clearTimeout(entry);
      set('pending', { deadline: Date.now() + 15_000, delay: 15 });
      entry = setTimeout(() => set('triggered'), 15_000);
    },
  });
  return stack(log, card('House alarm', panel.el), row(door.el));
}

const DOOR_PICTURE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d6b80"/><stop offset="1" stop-color="#2a3140"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><rect x="250" y="40" width="110" height="260" fill="#3b2f2a"/><circle cx="340" cy="175" r="5" fill="#c9b27a"/><circle cx="150" cy="120" r="42" fill="#c8a68a"/><path d="M70 300c0-70 36-120 80-120s80 50 80 120z" fill="#32557a"/><rect x="40" y="250" width="70" height="50" rx="4" fill="#a87b4f"/></svg>`,
)}`;

function liveDoorbell(): HTMLElement {
  let takeover: DoorbellHandle | null = null;
  const close = (): void => {
    takeover?.destroy();
    takeover?.el.remove();
    takeover = null;
    ring.el.focus();
  };
  const ring = createButton({
    label: 'Ring the doorbell',
    icon: 'bell',
    onClick: () => {
      const bell = createDoorbell({
        door: 'Front door',
        visitor: 'Parcel delivery',
        when: 'Just now',
        src: DOOR_PICTURE,
        refreshEvery: 0,
        takeover: true,
        onAnswer: () => bell.update({ answered: true }),
        onTalk: (talking) => bell.update({ talking }),
        onDismiss: close,
      });
      takeover = bell;
      document.body.append(bell.el);
      bell.focus();
    },
  });
  const inline = createDoorbell({
    door: 'Side gate',
    when: '10:42',
    src: DOOR_PICTURE,
    refreshEvery: 0,
    onAnswer: () => inline.update({ answered: true }),
    onTalk: (talking) => inline.update({ talking }),
    onDismiss: () => inline.update({ answered: false, talking: false, ringing: false }),
  });
  return stack(
    caption('The takeover covers the screen, keeps focus inside and closes with Escape'),
    row(ring.el),
    caption('Inline: answer, then hold a conversation with Talk; End stops the call'),
    h('div', { style: 'max-width: 32rem' }, inline.el),
    caption('Without a picture, and without Answer or Talk'),
    h('div', { style: 'max-width: 32rem' }, createDoorbell({ door: 'Back door', when: '2 min ago', ringing: false, onDismiss: () => undefined }).el),
  );
}

const PEOPLE: PersonEntry[] = [
  { id: 'robin', name: 'Robin Vale', where: 'home', since: '2 h' },
  { id: 'kit', name: 'Kit Harrow', where: 'zone', zone: 'Studio', since: '25 min' },
  { id: 'ash', name: 'Ash Merrow', where: 'away', since: '3 h' },
  { id: 'juno', name: 'Juno Pell', where: 'home', since: '6 h' },
  { id: 'sol', name: 'Sol Brannock', where: 'unknown' },
];

function livePeople(): HTMLElement {
  const picked = caption('Tap someone');
  return stack(
    caption('Home is lit with a ring; away and in a place are dimmed, with a badge for where'),
    createPeopleStrip({ people: PEOPLE, onSelect: (id) => (picked.textContent = `Selected ${PEOPLE.find((p) => p.id === id)!.name}`) }).el,
    picked,
    caption('Compact (watches, narrow strips): avatars only, the words spoken and in the tooltip'),
    createPeopleStrip({ people: PEOPLE, compact: true }).el,
  );
}

const OPENINGS: OpeningEntry[] = [
  { id: 'skylight', name: 'Skylight', kind: 'window', open: true, area: 'Landing', since: '1 h', alert: true },
  { id: 'bath', name: 'Bathroom window', kind: 'window', open: true, area: 'Upstairs', since: '40 min' },
  { id: 'back', name: 'Back door', kind: 'door', open: true, area: 'Kitchen', since: '5 min' },
  { id: 'garage', name: 'Garage door', kind: 'garage', open: false },
  { id: 'gate', name: 'Garden gate', kind: 'gate', open: false },
];

function liveOpenings(): HTMLElement {
  let items = OPENINGS.map((i) => ({ ...i }));
  const summary = createOpeningsSummary({
    items,
    reason: 'Rain expected within the hour',
    onSelect: (id) => {
      items = items.map((i) => (i.id === id ? { ...i, open: !i.open, since: i.open ? undefined : 'Just now' } : i));
      summary.update({ items });
    },
  });
  return stack(
    caption('Tap an item to shut it (or open it again); the one that should be shut comes first'),
    grid(
      summary.el,
      createOpeningsSummary({ items: OPENINGS.map((i) => ({ ...i, alert: false })) }).el,
      createOpeningsSummary({ items: OPENINGS.map((i) => ({ ...i, open: false })) }).el,
    ),
    caption('With closed items listed'),
    h('div', { style: 'max-width: 24rem' }, createOpeningsSummary({ items: OPENINGS.slice(2), showClosed: true }).el),
  );
}

function liveHazard(): HTMLElement {
  const smoke: HazardBannerHandle = createHazardBanner({
    kind: 'smoke',
    where: 'Kitchen',
    since: '10:42',
    advice: ['Leave the house now and close doors behind you', 'Call the fire service from outside'],
    actions: [{ id: 'call', label: 'Call for help', primary: true }],
    onSilence: () => smoke.update({ onSilence: undefined, severity: 'warning', advice: 'Siren silenced. Check the kitchen before the all clear.', onDismiss: () => smoke.update({ severity: 'cleared', advice: undefined, actions: [], onDismiss: undefined }) }),
    onAction: () => undefined,
  });
  return stack(
    caption('An alarm: Silence turns it into a warning, Dismiss then clears it'),
    smoke.el,
    caption('Warnings and a cleared hazard'),
    createHazardBanner({ kind: 'leak', severity: 'warning', where: 'Utility room, under the sink', since: '3 min ago', advice: 'Turn off the water at the main valve.', actions: [{ id: 'valve', label: 'Shut off water' }], onAction: () => undefined }).el,
    createHazardBanner({ kind: 'freeze', severity: 'warning', where: 'Garden room', advice: 'Pipes may freeze tonight.' }).el,
    createHazardBanner({ kind: 'co', severity: 'cleared', where: 'Boiler cupboard', since: '09:15', onDismiss: () => undefined }).el,
  );
}

function liveConnection(): HTMLElement {
  // A screen that keeps losing its server: reconnecting with a countdown, then connected again.
  const cycle: ConnectionStatusHandle = createConnectionStatus({ state: 'connected', server: 'homeassistant.local', variant: 'banner', onRetry: () => connect() });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const connect = (): void => {
    clearTimeout(timer);
    cycle.update({ state: 'connecting', retryAt: null });
    timer = setTimeout(() => cycle.update({ state: 'connected' }), 1200);
  };
  const drop = createButton({
    label: 'Drop the connection',
    variant: 'secondary',
    size: 'small',
    onClick: () => {
      clearTimeout(timer);
      cycle.update({ state: 'reconnecting', retryAt: Date.now() + 8000 });
      timer = setTimeout(connect, 8000);
    },
  });
  return stack(
    caption('Banner: drop the connection to see the retry countdown'),
    cycle.el,
    row(drop.el),
    caption('Pills'),
    row(
      createConnectionStatus({ state: 'connected', server: '192.0.2.10' }).el,
      createConnectionStatus({ state: 'connected', quietWhenConnected: true }).el,
      createConnectionStatus({ state: 'connecting' }).el,
      createConnectionStatus({ state: 'reconnecting', retryAt: Date.now() + 75_000, onRetry: () => undefined }).el,
      createConnectionStatus({ state: 'offline', detail: 'No network', onRetry: () => undefined }).el,
      createConnectionStatus({ state: 'rejected', detail: 'Check the access token in Settings' }).el,
    ),
  );
}

/** Pretends to be the server: the documentation addresses answer, and only the fake tokens are accepted. */
const fakeTest = (values: { address: string; token: string }): Promise<DeviceSetupResult> =>
  new Promise((resolve) =>
    later(() => {
      const host = new URL(values.address).hostname;
      if (host !== '192.0.2.10' && host !== 'homeassistant.local') resolve({ ok: false, field: 'address', message: 'No server answered at that address' });
      else if (!values.token.startsWith('fake-')) resolve({ ok: false, field: 'token', message: 'The server refused that token' });
      else resolve({ ok: true, message: 'Connected to Home' });
    }, 1200),
  );

function liveSetup(): HTMLElement {
  const done = caption('Try http://192.0.2.10:8123 with the token fake-token-for-docs; other values show the errors.');
  const setup = createDeviceSetup({
    placeholder: 'http://192.0.2.10:8123',
    intro: 'This screen talks to your home server directly.',
    qrValue: `${normaliseServerAddress('192.0.2.10:8123')}/pair?code=EXAMPLE-ONLY`,
    onScan: () => new Promise((resolve) => later(() => resolve({ address: 'http://homeassistant.local:8123', token: 'fake-scanned-token' }), 800)),
    onTest: fakeTest,
    onFinish: (values) => (done.textContent = `Finished with ${values.address}`),
    onCancel: () => (done.textContent = 'Cancelled'),
  });
  return stack(done, h('div', { style: 'max-width: 36rem' }, setup.el));
}

export const homeSecurityStories: Story[] = [
  {
    id: 'alarm-panel',
    render: () =>
      stack(
        liveAlarm(),
        caption('States: exit delay (no code to cancel), entry delay with a fixed-length code, triggered'),
        grid(
          card('Arming', createAlarmPanel({ state: 'arming', mode: 'away', deadline: Date.now() + 40_000, delay: 60, codeToDisarm: false }).el),
          card('Entry delay', createAlarmPanel({ state: 'pending', deadline: Date.now() + 25_000, delay: 30, codeLength: 4 }).el),
          card('Triggered', createAlarmPanel({ state: 'triggered', error: 'Wrong code' }).el),
        ),
        caption('Arming that needs the code, with two modes'),
        h('div', { style: 'max-width: 24rem' }, card('Studio alarm', createAlarmPanel({ state: 'disarmed', codeToArm: true, modes: [{ id: 'away', label: 'Away' }, { id: 'night', label: 'Night' }] }).el)),
      ),
  },
  { id: 'doorbell', render: liveDoorbell },
  { id: 'people-strip', render: livePeople },
  { id: 'openings-summary', render: liveOpenings },
  { id: 'hazard-banner', render: liveHazard },
  { id: 'connection-status', render: liveConnection },
  { id: 'device-setup', render: liveSetup },
];
