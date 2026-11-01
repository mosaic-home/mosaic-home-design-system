import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  alarmCodeSlots,
  alarmNextCode,
  alarmPanelView,
  connectionStatusView,
  createAlarmPanel,
  createConnectionStatus,
  createDeviceSetup,
  createDoorbell,
  createHazardBanner,
  createOpeningsSummary,
  createPeopleStrip,
  deviceSetupCheck,
  DEVICE_SETUP_LABELS,
  doorbellButtons,
  formatAlarmCountdown,
  formatRetryIn,
  hazardBannerText,
  normaliseServerAddress,
  openingsSummaryView,
  peoplePlaceText,
  peopleStripSummary,
  type DeviceSetupResult,
  type OpeningEntry,
} from './index.ts';

const mount = <T extends { el: HTMLElement }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const q = <T extends Element = HTMLElement>(root: Element, selector: string): T => root.querySelector<T>(selector)!;
const all = (root: Element, selector: string): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(selector));
const key = (el: Element, k: string): void => void el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const tap = (root: Element, digit: string): void => all(root, '.mh-alarm-panel__key').find((b) => b.textContent === digit)!.click();
/** Every attribute value and text in the tree, to check a secret never lands there. */
const everything = (root: Element): string => [root.outerHTML, ...all(root, '*').map((e) => [...e.attributes].map((a) => a.value).join(' '))].join('\n');
const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('alarm panel', () => {
  it('formats countdowns and edits codes', () => {
    expect(formatAlarmCountdown(65)).toBe('1:05');
    expect(formatAlarmCountdown(-3)).toBe('0:00');
    expect(alarmNextCode('12', '3', 4)).toBe('123');
    expect(alarmNextCode('1234', '5', 4)).toBe('1234');
    expect(alarmNextCode('123', 'back', 4)).toBe('12');
    expect(alarmNextCode('123', 'clear', 4)).toBe('');
    expect(alarmCodeSlots(2, 4)).toEqual([true, true, false, false]);
    expect(alarmCodeSlots(3, null)).toEqual([true, true, true]);
  });

  it('arms in a mode without a code, and needs the code to disarm', () => {
    const onArm = vi.fn();
    const onDisarm = vi.fn();
    const panel = mount(createAlarmPanel({ state: 'disarmed', onArm, onDisarm }));
    expect(panel.el.querySelector('.mh-alarm-panel__keypad')).toBeNull();
    const away = all(panel.el, '.mh-alarm-panel__action--arm').find((b) => b.getAttribute('aria-label') === 'Arm Away')!;
    away.click();
    expect(onArm).toHaveBeenCalledWith('away', undefined);

    panel.update({ state: 'armed', mode: 'away' });
    expect(q(panel.el, '.mh-alarm-panel__state').textContent).toBe('Armed · Away');
    const disarm = q<HTMLButtonElement>(panel.el, '.mh-alarm-panel__action--disarm');
    expect(disarm.disabled).toBe(true);
    for (const d of '2580') tap(panel.el, d);
    expect(all(panel.el, '.mh-alarm-panel__slot.is-filled')).toHaveLength(4);
    expect(q(panel.el, '.mh-alarm-panel__code .mh-visually-hidden').textContent).toBe('4 digits entered');
    // Masked: the digits appear nowhere but in the keypad's own key labels.
    const keypad = q(panel.el, '.mh-alarm-panel__keypad');
    keypad.remove();
    expect(everything(panel.el)).not.toContain('2580');
    panel.el.append(keypad);
    expect(disarm.disabled).toBe(false);
    disarm.click();
    expect(onDisarm).toHaveBeenCalledWith('2580');
    expect(all(panel.el, '.mh-alarm-panel__slot')).toHaveLength(0);
  });

  it('takes the code from a keyboard, and Enter runs the only action', () => {
    const onDisarm = vi.fn();
    const panel = mount(createAlarmPanel({ state: 'triggered', codeLength: 4, onDisarm }));
    expect(panel.el.classList.contains('mh-alarm-panel--triggered')).toBe(true);
    expect(q(panel.el, '.mh-alarm-panel__state').getAttribute('aria-live')).toBe('assertive');
    expect(all(panel.el, '.mh-alarm-panel__slot')).toHaveLength(4);
    for (const d of '13579') key(panel.el, d);
    expect(all(panel.el, '.mh-alarm-panel__slot.is-filled')).toHaveLength(4);
    key(panel.el, 'Backspace');
    key(panel.el, '9');
    key(panel.el, 'Enter');
    expect(onDisarm).toHaveBeenCalledWith('1359');
  });

  it('needs a code to arm when asked, and Enter waits for a mode choice', () => {
    const onArm = vi.fn();
    const panel = mount(createAlarmPanel({ state: 'disarmed', codeToArm: true, onArm }));
    expect(all(panel.el, '.mh-alarm-panel__action--arm').every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    tap(panel.el, '4');
    key(panel.el, 'Enter');
    expect(onArm).not.toHaveBeenCalled();
    all(panel.el, '.mh-alarm-panel__action--arm')[2]!.click();
    expect(onArm).toHaveBeenCalledWith('night', '4');
  });

  it('counts down the exit delay and empties the code on a new error', () => {
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const panel = mount(createAlarmPanel({ state: 'arming', mode: 'home', deadline: Date.now() + 30_000, delay: 30, codeToDisarm: false }));
    expect(q(panel.el, '.mh-alarm-panel__time').textContent).toBe('0:30');
    expect(q(panel.el, '.mh-alarm-panel__action--disarm').textContent).toBe('Cancel');
    vi.advanceTimersByTime(5000);
    expect(q(panel.el, '.mh-alarm-panel__time').textContent).toBe('0:25');
    expect(q(panel.el, '.mh-alarm-panel__bar-fill').style.getPropertyValue('--_left')).toBe(String(25 / 30));

    panel.update({ state: 'pending', deadline: Date.now() + 20_000, codeToDisarm: true });
    tap(panel.el, '1');
    tap(panel.el, '2');
    panel.update({ error: 'Wrong code' });
    expect(panel.el.classList.contains('is-error')).toBe(true);
    expect(q(panel.el, '.mh-alarm-panel__message').textContent).toBe('Wrong code');
    expect(all(panel.el, '.mh-alarm-panel__slot')).toHaveLength(0);
    panel.destroy();
  });

  it('shows nothing to press while the state is unknown or disarming', () => {
    expect(alarmPanelView({ state: null }, 0, 0).actions).toEqual([]);
    const view = alarmPanelView({ state: 'disarming' }, 0, 0);
    expect(view.keypad).toBe(false);
    expect(view.actions[0]!.disabled).toBe(true);
  });
});

describe('doorbell', () => {
  it('offers Answer, Talk and Dismiss, then End once answered', () => {
    const onAnswer = vi.fn();
    const onTalk = vi.fn();
    const onDismiss = vi.fn();
    const bell = mount(createDoorbell({ door: 'Front door', when: 'Just now', onAnswer, onTalk, onDismiss }));
    expect(bell.el.getAttribute('role')).toBe('alertdialog');
    expect(q(bell.el, '.mh-doorbell__title').textContent).toBe('Someone is at the door');
    expect(q(bell.el, '.mh-doorbell__detail').textContent).toBe('Front door · Just now');
    expect(bell.el.classList.contains('is-ringing')).toBe(true);
    expect(bell.el.classList.contains('is-empty')).toBe(true);
    expect(all(bell.el, '.mh-doorbell__action').map((b) => b.textContent)).toEqual(['Answer', 'Talk', 'Dismiss']);
    q(bell.el, '.mh-doorbell__action--answer').click();
    expect(onAnswer).toHaveBeenCalled();
    bell.update({ answered: true, talking: true });
    expect(all(bell.el, '.mh-doorbell__action').map((b) => b.textContent)).toEqual(['Talk', 'End']);
    expect(bell.el.classList.contains('is-ringing')).toBe(false);
    const talk = q(bell.el, '.mh-doorbell__action--talk');
    expect(talk.getAttribute('aria-pressed')).toBe('true');
    talk.click();
    expect(onTalk).toHaveBeenCalledWith(false);
    q(bell.el, '.mh-doorbell__action--dismiss').click();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('takes over: modal, Escape dismisses, Tab stays inside', () => {
    const onDismiss = vi.fn();
    const bell = mount(createDoorbell({ door: 'Side gate', visitor: 'Parcel delivery', src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', takeover: true, onAnswer: () => undefined, onDismiss }));
    expect(bell.el.getAttribute('aria-modal')).toBe('true');
    expect(q(bell.el, '.mh-doorbell__image').getAttribute('alt')).toBe('Live picture from Side gate');
    bell.focus();
    const buttons = all(bell.el, '.mh-doorbell__action');
    expect(document.activeElement).toBe(buttons[0]);
    buttons[buttons.length - 1]!.focus();
    key(bell.el, 'Tab');
    expect(document.activeElement).toBe(buttons[0]);
    key(bell.el, 'Escape');
    expect(onDismiss).toHaveBeenCalled();
    bell.destroy();
  });

  it('leaves out what the app cannot do', () => {
    expect(doorbellButtons({ door: 'Back door' }).map((b) => b.action)).toEqual(['dismiss']);
    expect(doorbellButtons({ door: 'Back door', canTalk: true, onAnswer: () => undefined }).map((b) => b.action)).toEqual(['answer', 'talk', 'dismiss']);
  });
});

describe('people strip', () => {
  const people = [
    { id: 'a', name: 'Robin Vale', where: 'home' as const, since: '2 h' },
    { id: 'b', name: 'Kit Harrow', where: 'zone' as const, zone: 'Studio', since: '25 min' },
    { id: 'c', name: 'Ash Merrow', where: 'away' as const },
  ];

  it('names the strip with a count and shows where each person is', () => {
    expect(peopleStripSummary(people)).toBe('People, 1 of 3 home');
    expect(peoplePlaceText(people[1]!)).toBe('Studio · 25 min');
    expect(peoplePlaceText(people[2]!)).toBe('Away');
    const onSelect = vi.fn();
    const strip = createPeopleStrip({ people, onSelect });
    expect(strip.el.getAttribute('aria-label')).toBe('People, 1 of 3 home');
    expect(all(strip.el, '.mh-people-strip__person').map((li) => li.className)).toEqual([
      'mh-people-strip__person mh-people-strip__person--home',
      'mh-people-strip__person mh-people-strip__person--zone',
      'mh-people-strip__person mh-people-strip__person--away',
    ]);
    all(strip.el, 'button.mh-people-strip__main')[1]!.click();
    expect(onSelect).toHaveBeenCalledWith('b');
    strip.update({ compact: true, onSelect: undefined });
    expect(strip.el.classList.contains('mh-people-strip--compact')).toBe(true);
    expect(q(strip.el, '.mh-people-strip__main').title).toBe('Robin Vale: Home · 2 h');
    expect(strip.el.querySelector('button')).toBeNull();
  });
});

describe('openings summary', () => {
  const items: OpeningEntry[] = [
    { id: 'w1', name: 'Bathroom window', kind: 'window', open: true, area: 'Upstairs', since: '40 min' },
    { id: 'd1', name: 'Back door', kind: 'door', open: false },
    { id: 'w2', name: 'Skylight', kind: 'window', open: true, alert: true },
  ];

  it('counts open items, puts the ones to shut first and warns', () => {
    const view = openingsSummaryView({ items });
    expect(view.countText).toBe('2 open');
    expect(view.warning).toBe(true);
    expect(view.items.map((i) => i.id)).toEqual(['w2', 'w1']);
    const summary = createOpeningsSummary({ items, reason: 'Rain expected within the hour', onSelect: () => undefined });
    expect(summary.el.classList.contains('is-warning')).toBe(true);
    expect(q(summary.el, '.mh-openings-summary__reason').textContent).toBe('Rain expected within the hour');
    expect(q(summary.el, '.mh-openings-summary__item.is-alert .mh-visually-hidden').textContent).toBe('should be shut');
    expect(q(summary.el, '.mh-openings-summary__meta').textContent).toBe('Upstairs · 40 min');
    summary.update({ items: items.map((i) => ({ ...i, open: false })), showClosed: true });
    expect(summary.el.classList.contains('is-clear')).toBe(true);
    expect(q(summary.el, '.mh-openings-summary__count').textContent).toBe('All shut');
    expect(summary.el.querySelector('.mh-openings-summary__reason')).toBeNull();
    expect(all(summary.el, '.mh-openings-summary__item.is-closed')).toHaveLength(3);
  });

  it('warns on request only when something is open', () => {
    expect(openingsSummaryView({ items: [{ id: 'g', name: 'Gate', open: true }], warning: true }).warning).toBe(true);
    expect(openingsSummaryView({ items: [{ id: 'g', name: 'Gate', open: false }], warning: true }).warning).toBe(false);
  });
});

describe('hazard banner', () => {
  it('alerts with where, since when and what to do', () => {
    const onAction = vi.fn();
    const onSilence = vi.fn();
    const banner = createHazardBanner({ kind: 'smoke', where: 'Kitchen', since: '10:42', advice: ['Leave the house', 'Call the fire service'], actions: [{ id: 'call', label: 'Call for help', primary: true }], onAction, onSilence });
    expect(banner.el.getAttribute('role')).toBe('alert');
    expect(banner.el.className).toBe('mh-hazard-banner mh-hazard-banner--smoke mh-hazard-banner--alarm');
    expect(q(banner.el, '.mh-hazard-banner__title').textContent).toBe('Smoke detected');
    expect(q(banner.el, '.mh-hazard-banner__where').textContent).toBe('Kitchen · since 10:42');
    expect(all(banner.el, '.mh-hazard-banner__advice li').map((li) => li.textContent)).toEqual(['Leave the house', 'Call the fire service']);
    q(banner.el, '.mh-hazard-banner__action--action').click();
    q(banner.el, '.mh-hazard-banner__action--silence').click();
    expect(onAction).toHaveBeenCalledWith('call');
    expect(onSilence).toHaveBeenCalled();
    banner.update({ severity: 'cleared', onSilence: undefined, onDismiss: () => undefined });
    expect(banner.el.getAttribute('role')).toBe('status');
    expect(q(banner.el, '.mh-hazard-banner__title').textContent).toBe('Cleared: Smoke detected');
    expect(all(banner.el, '.mh-hazard-banner__action').map((b) => b.textContent)).toEqual(['Call for help', 'Dismiss']);
  });

  it('keeps a given title', () => {
    expect(hazardBannerText({ kind: 'leak', title: 'Water under the sink', severity: 'cleared' }).title).toBe('Water under the sink');
  });
});

describe('connection status', () => {
  it('counts down to the next attempt and offers a retry', () => {
    vi.setSystemTime(new Date(2030, 0, 1, 12, 0, 0));
    const onRetry = vi.fn();
    const status = createConnectionStatus({ state: 'reconnecting', server: 'homeassistant.local', retryAt: Date.now() + 12_000, onRetry });
    expect(q(status.el, '.mh-connection-status__state').getAttribute('role')).toBe('status');
    expect(q(status.el, '.mh-connection-status__detail').textContent).toBe('Retrying in 12 s');
    vi.advanceTimersByTime(3000);
    expect(q(status.el, '.mh-connection-status__detail').textContent).toBe('Retrying in 9 s');
    vi.advanceTimersByTime(10_000);
    expect(q(status.el, '.mh-connection-status__detail').textContent).toBe('Retrying…');
    q(status.el, '.mh-connection-status__retry').click();
    expect(onRetry).toHaveBeenCalled();
    status.update({ state: 'connected', retryAt: null });
    expect(status.el.querySelector('.mh-connection-status__retry')).toBeNull();
    expect(q(status.el, '.mh-connection-status__detail').textContent).toBe('homeassistant.local');
    status.update({ quietWhenConnected: true });
    expect(status.el.classList.contains('is-quiet')).toBe(true);
    expect(q(status.el, '.mh-connection-status__state').classList.contains('mh-visually-hidden')).toBe(true);
    status.destroy();
  });

  it('formats the wait and leaves the countdown out when access is refused', () => {
    expect(formatRetryIn(65)).toBe('1 min 5 s');
    expect(formatRetryIn(120)).toBe('2 min');
    expect(connectionStatusView({ state: 'rejected', retryAt: 10_000 }, 0).detail).toBe('');
  });
});

describe('device setup', () => {
  it('normalises addresses', () => {
    expect(normaliseServerAddress(' 192.0.2.10:8123/ ')).toBe('http://192.0.2.10:8123');
    expect(normaliseServerAddress('https://homeassistant.local')).toBe('https://homeassistant.local');
    expect(normaliseServerAddress('ftp://192.0.2.10')).toBeNull();
    expect(normaliseServerAddress('')).toBeNull();
    expect(deviceSetupCheck('', '', 'token', DEVICE_SETUP_LABELS)).toMatchObject({ addressError: 'Enter the server address', tokenError: 'Paste the access token' });
    expect(deviceSetupCheck('192.0.2.10', '', 'qr', DEVICE_SETUP_LABELS).error).toBe('Scan a code or paste an access token first');
  });

  it('tests through the callback, shows the result and finishes', async () => {
    let answer: (r: DeviceSetupResult) => void = () => undefined;
    const onTest = vi.fn(() => new Promise<DeviceSetupResult>((resolve) => (answer = resolve)));
    const onFinish = vi.fn();
    const setup = mount(createDeviceSetup({ placeholder: 'http://192.0.2.10:8123', onTest, onFinish }));
    const [address, token] = all(setup.el, 'input.mh-input__control') as HTMLInputElement[];
    q(setup.el, '.mh-device-setup__test').click();
    expect(onTest).not.toHaveBeenCalled();
    expect(address!.getAttribute('aria-invalid')).toBe('true');

    address!.value = '192.0.2.10:8123';
    address!.dispatchEvent(new Event('input', { bubbles: true }));
    token!.value = ' fake-token-for-docs ';
    token!.dispatchEvent(new Event('input', { bubbles: true }));
    expect(address!.hasAttribute('aria-invalid')).toBe(false);
    q(setup.el, '.mh-device-setup__test').click();
    expect(onTest).toHaveBeenCalledWith({ address: 'http://192.0.2.10:8123', token: 'fake-token-for-docs' });
    expect(q(setup.el, '.mh-device-setup__result').className).toContain('is-testing');
    answer({ ok: false, message: 'The token was refused', field: 'token' });
    await flush();
    expect(q(setup.el, '.mh-device-setup__result').className).toContain('is-error');
    expect(token!.getAttribute('aria-invalid')).toBe('true');

    setup.el.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(onTest).toHaveBeenCalledTimes(2);
    answer({ ok: true, message: 'Connected to Home' });
    await flush();
    expect(q(setup.el, '.mh-device-setup__result-text').textContent).toBe('Connected to Home');
    expect(onFinish).toHaveBeenCalledWith({ address: 'http://192.0.2.10:8123', token: 'fake-token-for-docs' });
    // The token is in the input's value only, never in an attribute or text.
    expect(everything(setup.el)).not.toContain('fake-token-for-docs');
  });

  it('ignores a stale result after the values change', async () => {
    let answer: (r: DeviceSetupResult) => void = () => undefined;
    const setup = mount(createDeviceSetup({ address: 'homeassistant.local:8123', token: 'fake', onTest: () => new Promise((resolve) => (answer = resolve)) }));
    const pending = setup.test();
    setup.fill({ token: 'fake-2' });
    answer({ ok: true });
    expect(await pending).toBe(false);
    expect(q(setup.el, '.mh-device-setup__result').hidden).toBe(true);
  });

  it('shows a QR code and fills in a scanned one', async () => {
    const onScan = vi.fn(async () => ({ address: 'http://192.0.2.10:8123', token: 'scanned-fake-token' }));
    const setup = mount(createDeviceSetup({ method: 'qr', qrValue: 'http://192.0.2.10:8123/pair?code=EXAMPLE', onScan }));
    expect(q(setup.el, '.mh-segmented').getAttribute('aria-label')).toBe('How to sign in');
    expect(q(setup.el, '.mh-qr-code__svg').getAttribute('aria-label')).toBe('Setup code');
    expect(setup.el.querySelector('.mh-secret')).toBeNull();
    q(setup.el, '.mh-device-setup__scan').click();
    await flush();
    expect(q(setup.el, '.mh-device-setup__scanned').textContent).toBe('Code scanned');
    expect(setup.getValues()).toEqual({ address: 'http://192.0.2.10:8123', token: 'scanned-fake-token' });
    expect(everything(setup.el)).not.toContain('scanned-fake-token');
  });
});
