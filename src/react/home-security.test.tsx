import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createAlarmPanel,
  createConnectionStatus,
  createDeviceSetup,
  createDoorbell,
  createHazardBanner,
  createOpeningsSummary,
  createPeopleStrip,
  type AlarmPanelOptions,
  type ConnectionStatusOptions,
  type DeviceSetupOptions,
  type DeviceSetupResult,
  type DoorbellOptions,
  type HazardBannerOptions,
  type OpeningsSummaryOptions,
  type PeopleStripOptions,
} from '../web/home/security/index.ts';
import { AlarmPanel, ConnectionStatus, DeviceSetup, Doorbell, HazardBanner, OpeningsSummary, PeopleStrip } from './home-security.tsx';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const REF_ATTRS = new Set(['id', 'for', 'aria-describedby', 'aria-labelledby', 'aria-controls', 'name']);
const SKIP_ATTRS = new Set(['value', 'checked', 'style']);

/** Tags, sorted attributes and text; generated ids are replaced by their order of first appearance. */
function shape(root: Element): string {
  const ids = new Map<string, string>();
  const ref = (v: string): string =>
    v
      .split(' ')
      .map((part) => {
        if (!ids.has(part)) ids.set(part, `#${ids.size + 1}`);
        return ids.get(part)!;
      })
      .join(' ');
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').trim();
    if (!(node instanceof Element)) return '';
    const attrs = [...node.attributes]
      .filter((a) => !SKIP_ATTRS.has(a.name))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => `${a.name}=${REF_ATTRS.has(a.name) ? ref(a.value) : a.value}`);
    return `<${node.tagName.toLowerCase()} ${attrs.join(' ')}>${[...node.childNodes].map(walk).filter(Boolean).join('')}</>`;
  };
  return walk(root);
}

function fromReact(element: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(element);
  // Server rendering puts image preload hints first.
  return Array.from(div.children).find((c) => c.tagName !== 'LINK')!;
}

const same = (element: ReactElement, web: Element): void => expect(shape(fromReact(element))).toBe(shape(web));

let root: Root | null = null;
let host: HTMLElement | null = null;
const render = (element: ReactElement): HTMLElement => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => root!.render(element));
  return host;
};
afterEach(() => {
  act(() => root?.unmount());
  root = null;
  host?.remove();
  host = null;
  vi.useRealTimers();
});

const noop = (): void => undefined;

describe('home security parity', () => {
  it('AlarmPanel', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const cases: AlarmPanelOptions[] = [
      { state: 'disarmed' },
      { state: 'disarmed', codeToArm: true, modes: [{ id: 'away', label: 'Away' }], label: 'House alarm' },
      { state: 'armed', mode: 'night', codeLength: 4 },
      { state: 'arming', mode: 'away', deadline: Date.now() + 45_000, delay: 60, codeToDisarm: false },
      { state: 'pending', deadline: Date.now() + 20_000, error: 'Wrong code' },
      { state: 'triggered', disabled: true },
      { state: 'disarming' },
      { state: null },
      { state: 'armed', mode: 'custom', labels: { disarm: 'Turn off', states: { armed: 'On · {mode}' } } },
    ];
    for (const c of cases) same(<AlarmPanel {...c} />, createAlarmPanel(c).el);
  });

  it('Doorbell', () => {
    const cases: DoorbellOptions[] = [
      { door: 'Front door', when: 'Just now', onAnswer: noop, onTalk: noop, onDismiss: noop },
      { door: 'Side gate', visitor: 'Parcel delivery', src: 'https://camera.example/side.jpg', takeover: true, answered: true, talking: true, canTalk: true },
      { door: 'Back door', ringing: false, aspect: 16 / 9, labels: { dismiss: 'Close' } },
    ];
    for (const c of cases) same(<Doorbell {...c} />, createDoorbell(c).el);
  });

  it('PeopleStrip', () => {
    const people: PeopleStripOptions['people'] = [
      { id: 'a', name: 'Robin Vale', where: 'home', since: '2 h' },
      { id: 'b', name: 'Kit Harrow', where: 'zone', zone: 'Studio', picture: 'https://pictures.example/kit.jpg' },
      { id: 'c', name: 'Ash Merrow', where: 'unknown' },
    ];
    same(<PeopleStrip people={people} />, createPeopleStrip({ people }).el);
    same(<PeopleStrip people={people} compact onSelect={noop} />, createPeopleStrip({ people, compact: true, onSelect: noop }).el);
    same(<PeopleStrip people={[]} />, createPeopleStrip({ people: [] }).el);
  });

  it('OpeningsSummary', () => {
    const items: OpeningsSummaryOptions['items'] = [
      { id: 'w1', name: 'Bathroom window', kind: 'window', open: true, area: 'Upstairs', since: '40 min' },
      { id: 'd1', name: 'Back door', kind: 'door', open: false },
      { id: 'g1', name: 'Garage', kind: 'garage', open: true, alert: true },
    ];
    const cases: OpeningsSummaryOptions[] = [
      { items, reason: 'Rain expected within the hour' },
      { items, showClosed: true, onSelect: noop, headingLevel: 4 },
      { items: [], labels: { title: 'Openings', allShut: 'Nothing open' } },
    ];
    for (const c of cases) same(<OpeningsSummary {...c} />, createOpeningsSummary(c).el);
  });

  it('HazardBanner', () => {
    const cases: HazardBannerOptions[] = [
      { kind: 'smoke', where: 'Kitchen', since: '10:42', advice: ['Leave the house', 'Call the fire service'], actions: [{ id: 'call', label: 'Call for help', primary: true }], onSilence: noop },
      { kind: 'leak', severity: 'warning', where: 'Utility room', advice: 'Turn off the water at the main valve', onDismiss: noop, headingLevel: 3 },
      { kind: 'co', severity: 'cleared', onDismiss: noop },
      { kind: 'other', title: 'Freezer is warm' },
    ];
    for (const c of cases) same(<HazardBanner {...c} />, createHazardBanner(c).el);
  });

  it('ConnectionStatus', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const cases: ConnectionStatusOptions[] = [
      { state: 'connected', server: 'homeassistant.local' },
      { state: 'connected', quietWhenConnected: true },
      { state: 'reconnecting', retryAt: Date.now() + 15_000, onRetry: noop, variant: 'banner' },
      { state: 'offline', detail: 'No network', onRetry: noop },
      { state: 'rejected', retryAt: Date.now() + 5000 },
    ];
    for (const c of cases) same(<ConnectionStatus {...c} />, createConnectionStatus(c).el);
  });

  it('DeviceSetup', () => {
    const test = async (): Promise<DeviceSetupResult> => ({ ok: true });
    const scan = async () => null;
    const cases: DeviceSetupOptions[] = [
      { placeholder: 'http://192.0.2.10:8123', onTest: test },
      { address: 'homeassistant.local:8123', token: 'fake-token', intro: 'Pair this screen with your server.', onCancel: noop, headingLevel: 3 },
      { method: 'qr', qrValue: 'http://192.0.2.10:8123/pair?code=EXAMPLE', onScan: scan, onTest: test },
      { methods: ['qr'], onScan: scan },
    ];
    for (const c of cases) same(<DeviceSetup {...c} />, createDeviceSetup(c).el);
  });
});

describe('home security behaviour', () => {
  it('AlarmPanel hands the code over once and forgets it', () => {
    const onDisarm = vi.fn();
    const el = render(<AlarmPanel state="armed" mode="away" onDisarm={onDisarm} />);
    const keys = Array.from(el.querySelectorAll<HTMLButtonElement>('.mh-alarm-panel__key'));
    act(() => keys.find((k) => k.textContent === '7')!.click());
    act(() => keys.find((k) => k.textContent === '3')!.click());
    expect(el.querySelectorAll('.mh-alarm-panel__slot.is-filled')).toHaveLength(2);
    act(() => el.querySelector<HTMLButtonElement>('.mh-alarm-panel__action--disarm')!.click());
    expect(onDisarm).toHaveBeenCalledWith('73');
    expect(el.querySelectorAll('.mh-alarm-panel__slot')).toHaveLength(0);
    expect(el.innerHTML).not.toContain('73');
  });

  it('DeviceSetup tests through the callback and finishes', async () => {
    const onTest = vi.fn(async (): Promise<DeviceSetupResult> => ({ ok: true, message: 'Connected to Home' }));
    const onFinish = vi.fn();
    const el = render(<DeviceSetup address="192.0.2.10:8123" token="fake-token-for-docs" onTest={onTest} onFinish={onFinish} />);
    await act(async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    expect(onTest).toHaveBeenCalledWith({ address: 'http://192.0.2.10:8123', token: 'fake-token-for-docs' });
    expect(el.querySelector('.mh-device-setup__result-text')!.textContent).toBe('Connected to Home');
    expect(onFinish).toHaveBeenCalledWith({ address: 'http://192.0.2.10:8123', token: 'fake-token-for-docs' });
  });
});
