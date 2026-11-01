import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyHomeColors,
  clearHomeColors,
  createControlCard,
  createLightControl,
  hueName,
  lightSliderClass,
  createLockControl,
  createPendingValue,
  createPositionControl,
  createThermostat,
  formatThermostatNumber,
  lockButtons,
  nudgeThermostat,
  positionButtons,
  thermostatPartState,
  thermostatTargetOf,
  withThermostatUnit,
  type ThermostatMode,
} from './index.ts';

/** Attached, so native inputs fire `change` on click. */
const mount = <T extends { el: HTMLElement }>(handle: T): T => {
  document.body.append(handle.el);
  return handle;
};
const click = (el: Element | null): void => {
  (el as HTMLElement).click();
};
const buttons = (el: Element, selector: string): HTMLButtonElement[] => Array.from(el.querySelectorAll<HTMLButtonElement>(selector));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe('pending value', () => {
  it('gathers scheduled changes into one send after the delay, then holds until the prop changes', () => {
    const sent: number[] = [];
    const changed = vi.fn();
    const p = createPendingValue<number>({ send: (v) => sent.push(v), changed, delay: 700, hold: 3000 });
    p.schedule(21.5, 21);
    vi.advanceTimersByTime(500);
    p.schedule(22, 21);
    vi.advanceTimersByTime(699);
    expect(sent).toEqual([]);
    expect(p.shown(21)).toBe(22);
    vi.advanceTimersByTime(1);
    expect(sent).toEqual([22]);
    expect(changed).toHaveBeenCalled();
    // Still the old prop: keep showing what was sent.
    expect(p.shown(21)).toBe(22);
    // The new state arrives.
    expect(p.shown(22)).toBe(22);
    expect(p.phase).toBe('idle');
    expect(p.shown(23)).toBe(23);
  });

  it('gives up the held value after the hold time', () => {
    const p = createPendingValue<number>({ send: () => undefined, hold: 3000 });
    p.commit(40, 10);
    expect(p.shown(10)).toBe(40);
    vi.advanceTimersByTime(3000);
    expect(p.shown(10)).toBe(10);
  });

  it('drafts without sending and sends on commit, flush or dispose', () => {
    const sent: number[] = [];
    const p = createPendingValue<number>({ send: (v) => sent.push(v) });
    p.draft(30, 10);
    vi.advanceTimersByTime(5000);
    expect(sent).toEqual([]);
    p.commit(35, 10);
    expect(sent).toEqual([35]);
    p.schedule(50, 10);
    p.dispose();
    expect(sent).toEqual([35, 50]);
    p.dispose();
    expect(sent).toEqual([35, 50]);
  });
});

describe('home colours', () => {
  it('sets and clears the opt-in variables', () => {
    const el = document.createElement('div');
    applyHomeColors('midnight', el);
    expect(el.style.getPropertyValue('--mh-home-heat')).toBe('#ff8a4c');
    expect(el.style.getPropertyValue('--mh-home-light-on')).not.toBe('');
    clearHomeColors(el);
    expect(el.style.getPropertyValue('--mh-home-heat')).toBe('');
  });
});

describe('control card', () => {
  it('lays out the badge, title, state and trailing control', () => {
    const control = document.createElement('button');
    const card = createControlCard({ title: 'Desk lamp', icon: 'lightbulb', state: 'On · 70%', active: true, tone: 'warm', control });
    expect(card.el.className).toBe('mh-control-card mh-control-card--warm is-active');
    expect(card.el.getAttribute('role')).toBe('group');
    expect(card.el.getAttribute('aria-label')).toBe('Desk lamp');
    expect(card.el.querySelector('.mh-control-card__title')!.textContent).toBe('Desk lamp');
    expect(card.el.querySelector('.mh-control-card__state')!.textContent).toBe('On · 70%');
    expect(card.el.querySelector('.mh-control-card__badge .mh-icon')).not.toBeNull();
    expect(card.el.querySelector('.mh-control-card__control')!.firstElementChild).toBe(control);
    expect(card.el.querySelector('.mh-control-card__body')).toBeNull();
    expect(card.el.querySelector('.mh-control-card__media')).toBeNull();
  });

  it('makes the header a button beside, not around, the control', () => {
    const onOpen = vi.fn();
    const control = document.createElement('input');
    const card = createControlCard({ title: 'Studio air', icon: 'fan', control, onOpen });
    const main = card.el.querySelector('.mh-control-card__main')!;
    expect(main.tagName).toBe('BUTTON');
    expect(main.contains(control)).toBe(false);
    expect(main.querySelector('button, input, a, select')).toBeNull();
    click(main);
    expect(onOpen).toHaveBeenCalledTimes(1);
    card.update({ onOpen: undefined });
    expect(card.el.querySelector('.mh-control-card__main')!.tagName).toBe('DIV');
  });

  it('shows a spinner while loading and disables the slots when unavailable', () => {
    const control = document.createElement('button');
    const body = document.createElement('input');
    const card = createControlCard({ title: 'Shed light', icon: 'lightbulb', control, body });
    card.update({ loading: true });
    expect(card.el.getAttribute('aria-busy')).toBe('true');
    expect(card.el.querySelector('.mh-control-card__control .mh-spinner')).not.toBeNull();
    expect(card.el.contains(control)).toBe(false);
    card.update({ loading: false, unavailable: true, state: 'Unavailable' });
    expect(card.el.hasAttribute('aria-busy')).toBe(false);
    expect(card.el.querySelector('.mh-control-card__control')!.firstElementChild).toBe(control);
    expect(card.el.querySelector<HTMLFieldSetElement>('.mh-control-card__control')!.disabled).toBe(true);
    expect(card.el.querySelector<HTMLFieldSetElement>('.mh-control-card__body')!.disabled).toBe(true);
    expect(card.el.classList.contains('is-unavailable')).toBe(true);
    expect(card.el.querySelector('.mh-control-card__state')!.textContent).toBe('Unavailable');
  });

  it('keeps slotted nodes in place on update, so focus survives', () => {
    const control = document.createElement('button');
    const card = createControlCard({ title: 'Desk lamp', icon: 'lightbulb', control });
    document.body.append(card.el);
    control.focus();
    card.update({ state: 'On', active: true });
    expect(document.activeElement).toBe(control);
    card.el.remove();
  });

  it('puts media on top and the body below the header', () => {
    const media = document.createElement('img');
    const body = document.createElement('div');
    const card = createControlCard({ title: 'Porch', icon: 'camera', media, body });
    const parts = Array.from(card.el.children).map((c) => c.className);
    expect(parts).toEqual(['mh-control-card__media', 'mh-control-card__header', 'mh-control-card__body']);
    card.update({ media: null });
    expect(card.el.querySelector('.mh-control-card__media')).toBeNull();
  });
});

describe('thermostat helpers', () => {
  it('formats numbers and units', () => {
    expect(formatThermostatNumber(21, 0.5)).toBe('21.0');
    expect(formatThermostatNumber(70, 1)).toBe('70');
    expect(formatThermostatNumber(null)).toBe('–');
    expect(withThermostatUnit('19.5', '°C')).toBe('19.5°C');
    expect(withThermostatUnit('300', 'K')).toBe('300 K');
  });

  it('reads a single target or a range', () => {
    expect(thermostatTargetOf({ target: 21 })).toBe(21);
    expect(thermostatTargetOf({ target: 21, targetLow: 19, targetHigh: 24 })).toEqual({ low: 19, high: 24 });
    expect(thermostatTargetOf({ targetLow: 19, targetHigh: null })).toBeNull();
  });

  it('nudges by the step within the limits and keeps a range in order', () => {
    const limits = { min: 7, max: 35, step: 0.5 };
    expect(nudgeThermostat(21, 'single', 1, limits)).toBe(21.5);
    expect(nudgeThermostat(35, 'single', 1, limits)).toBe(35);
    expect(nudgeThermostat(0.1 + 0.2, 'single', 1, { min: 0, max: 1, step: 0.1 })).toBe(0.4);
    expect(nudgeThermostat({ low: 21, high: 21 }, 'low', 1, limits)).toEqual({ low: 21, high: 21 });
    expect(nudgeThermostat({ low: 21, high: 21 }, 'high', -1, limits)).toEqual({ low: 21, high: 21 });
    expect(nudgeThermostat({ low: 19, high: 24 }, 'high', 1, limits)).toEqual({ low: 19, high: 24.5 });
    expect(thermostatPartState({ low: 21, high: 21 }, 'low', limits)).toEqual({ value: 21, canLower: true, canRaise: false });
    expect(thermostatPartState(null, 'single', limits)).toEqual({ value: null, canLower: false, canRaise: false });
  });
});

const MODES: ThermostatMode[] = [
  { value: 'off', label: 'Off' },
  { value: 'heat', label: 'Heat' },
  { value: 'cool', label: 'Cool' },
];

describe('thermostat', () => {
  it('shows the target big, the current reading small and the action', () => {
    const t = createThermostat({ current: 19.5, target: 21, action: 'heating' });
    expect(t.el.querySelector('.mh-thermostat__number')!.textContent).toBe('21.0');
    expect(t.el.querySelector('.mh-thermostat__unit')!.textContent).toBe('°C');
    expect(t.el.querySelector('.mh-thermostat__current')!.textContent).toBe('Now 19.5°C');
    expect(t.el.querySelector('.mh-thermostat__action')!.className).toBe('mh-thermostat__action mh-thermostat__action--heating');
    expect(t.el.querySelector('.mh-thermostat__action')!.textContent).toBe('Heating');
    const [lower, raise] = buttons(t.el, '.mh-thermostat__step');
    expect(lower!.getAttribute('aria-label')).toBe('Lower');
    expect(raise!.getAttribute('aria-label')).toBe('Raise');
    expect(t.el.querySelector('.mh-thermostat__target')!.getAttribute('aria-label')).toBe('Target temperature');
  });

  it('sends one target after the taps settle', () => {
    const onTarget = vi.fn();
    const t = createThermostat({ target: 21, onTarget });
    const [lower, raise] = buttons(t.el, '.mh-thermostat__step');
    click(raise!);
    click(raise!);
    click(raise!);
    click(lower!);
    expect(t.el.querySelector('.mh-thermostat__number')!.textContent).toBe('22.0');
    vi.advanceTimersByTime(699);
    expect(onTarget).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onTarget).toHaveBeenCalledTimes(1);
    expect(onTarget).toHaveBeenCalledWith(22);
    // The old state arriving again doesn't jump back; the new one replaces the local value.
    t.update({ current: 20 });
    expect(t.el.querySelector('.mh-thermostat__number')!.textContent).toBe('22.0');
    t.update({ target: 22 });
    t.update({ target: 23 });
    expect(t.el.querySelector('.mh-thermostat__number')!.textContent).toBe('23.0');
  });

  it('marks a target the device has not confirmed, and drops the mark when it does or gives up', () => {
    const t = createThermostat({ target: 21, onTarget: vi.fn() });
    expect(t.el.classList.contains('is-pending')).toBe(false);
    click(buttons(t.el, '.mh-thermostat__step')[1]!);
    expect(t.el.classList.contains('is-pending')).toBe(true);
    vi.advanceTimersByTime(700);
    t.update({ target: 21.5 });
    expect(t.el.classList.contains('is-pending')).toBe(false);
    // A device that never answers: back to its own value after the hold, unmarked.
    click(buttons(t.el, '.mh-thermostat__step')[1]!);
    vi.advanceTimersByTime(700 + 3000);
    expect(t.el.classList.contains('is-pending')).toBe(false);
    expect(t.el.querySelector('.mh-thermostat__number')!.textContent).toBe('21.5');
  });

  it('sends a pending target on destroy', () => {
    const onTarget = vi.fn();
    const t = createThermostat({ target: 20, onTarget });
    click(buttons(t.el, '.mh-thermostat__step')[1]!);
    t.destroy();
    expect(onTarget).toHaveBeenCalledWith(20.5);
  });

  it('adjusts a heat-and-cool range per end', () => {
    const onTarget = vi.fn();
    const t = createThermostat({ targetLow: 19, targetHigh: 24, onTarget });
    expect(t.el.classList.contains('mh-thermostat--range')).toBe(true);
    const groups = Array.from(t.el.querySelectorAll('.mh-thermostat__target'));
    expect(groups.map((g) => g.getAttribute('aria-label'))).toEqual(['Heat to', 'Cool to']);
    click(groups[1]!.querySelectorAll('.mh-thermostat__step')[1]!);
    click(groups[0]!.querySelectorAll('.mh-thermostat__step')[0]!);
    vi.advanceTimersByTime(700);
    expect(onTarget).toHaveBeenCalledWith({ low: 18.5, high: 24.5 });
  });

  it('disables − / + at the limits, when unknown and when disabled', () => {
    const t = createThermostat({ target: 35 });
    let [lower, raise] = buttons(t.el, '.mh-thermostat__step');
    expect(raise!.disabled).toBe(true);
    expect(lower!.disabled).toBe(false);
    t.update({ target: null });
    [lower, raise] = buttons(t.el, '.mh-thermostat__step');
    expect(t.el.querySelector('.mh-thermostat__number')!.textContent).toBe('–');
    expect(lower!.disabled && raise!.disabled).toBe(true);
    t.update({ target: 20, disabled: true });
    expect(buttons(t.el, '.mh-thermostat__step').every((b) => b.disabled)).toBe(true);
    expect(t.el.classList.contains('is-disabled')).toBe(true);
  });

  it('picks the mode with a segmented control, or a select past four modes', () => {
    const onMode = vi.fn();
    const t = mount(createThermostat({ target: 20, mode: 'heat', modes: MODES, onMode }));
    const radios = Array.from(t.el.querySelectorAll<HTMLInputElement>('.mh-segmented__input'));
    expect(radios.map((r) => r.checked)).toEqual([false, true, false]);
    radios[2]!.click();
    expect(onMode).toHaveBeenCalledWith('cool');
    t.update({ modes: [...MODES, { value: 'dry', label: 'Dry' }, { value: 'fan', label: 'Fan' }] });
    const select = t.el.querySelector<HTMLSelectElement>('.mh-thermostat__mode select')!;
    expect(select.getAttribute('aria-label')).toBe('Mode');
    expect(select.value).toBe('heat');
    select.value = 'dry';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onMode).toHaveBeenLastCalledWith('dry');
  });

  it('keeps the button that was tapped in the document', () => {
    const t = createThermostat({ target: 20 });
    document.body.append(t.el);
    const raise = buttons(t.el, '.mh-thermostat__step')[1]!;
    raise.focus();
    click(raise);
    t.update({ current: 18 });
    expect(document.activeElement).toBe(raise);
    t.el.remove();
  });
});

describe('light control', () => {
  it('shows only the sliders it has values for', () => {
    const l = createLightControl({ on: true, brightness: 50 });
    expect(l.el.className).toBe('mh-light-control is-on');
    expect(l.el.querySelectorAll('.mh-slider').length).toBe(1);
    expect(l.el.querySelector('.mh-light-control__slider--brightness')).not.toBeNull();
    l.update({ colorTemp: { value: 3000, min: 2000, max: 6500 }, hue: 120 });
    expect(Array.from(l.el.querySelectorAll('.mh-light-control__slider')).map((s) => s.classList[2])).toEqual([
      'mh-light-control__slider--brightness',
      'mh-light-control__slider--temperature',
      'mh-light-control__slider--hue',
    ]);
    l.update({ brightness: null });
    expect(l.el.querySelector('.mh-light-control__slider--brightness')).toBeNull();
  });

  it('toggles through a native switch', () => {
    const onToggle = vi.fn();
    const l = mount(createLightControl({ on: false, onToggle }));
    const input = l.el.querySelector<HTMLInputElement>('.mh-light-control__power input')!;
    expect(input.getAttribute('role')).toBe('switch');
    input.click();
    expect(onToggle).toHaveBeenCalledWith(true);
    l.update({ toggle: false });
    expect(l.el.querySelector('.mh-light-control__power')).toBeNull();
  });

  it('commits a slider on release, not while dragging, and holds the value meanwhile', () => {
    const onBrightness = vi.fn();
    const l = createLightControl({ on: true, brightness: 20, onBrightness });
    const input = l.el.querySelector<HTMLInputElement>('.mh-light-control__slider--brightness input')!;
    expect(input.getAttribute('aria-valuetext')).toBe('20%');
    input.value = '55';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onBrightness).not.toHaveBeenCalled();
    expect(l.el.querySelector('.mh-slider__value')!.textContent).toBe('55%');
    // A state update while dragging doesn't move the thumb.
    l.update({ brightness: 20 });
    expect(input.value).toBe('55');
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onBrightness).toHaveBeenCalledTimes(1);
    expect(onBrightness).toHaveBeenCalledWith(55);
    l.update({ brightness: 55 });
    l.update({ brightness: 60 });
    expect(input.value).toBe('60');
  });

  it('sends colour temperature and hue', () => {
    const onColorTemp = vi.fn();
    const onHue = vi.fn();
    const l = createLightControl({ on: true, colorTemp: { value: 3000, min: 2000, max: 6500 }, hue: 10, onColorTemp, onHue });
    const temp = l.el.querySelector<HTMLInputElement>('.mh-light-control__slider--temperature input')!;
    expect(temp.min).toBe('2000');
    expect(temp.getAttribute('aria-valuetext')).toBe('3000 K');
    temp.value = '4000';
    temp.dispatchEvent(new Event('change'));
    expect(onColorTemp).toHaveBeenCalledWith(4000);
    const hue = l.el.querySelector<HTMLInputElement>('.mh-light-control__slider--hue input')!;
    hue.value = '200';
    hue.dispatchEvent(new Event('change'));
    expect(onHue).toHaveBeenCalledWith(200);
    expect(hue.getAttribute('aria-valuetext')).toBe('Blue');
  });

  it('names colours and shows only the sliders asked for', () => {
    expect([0, 28, 60, 120, 180, 230, 270, 320, 350].map(hueName)).toEqual(['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Pink', 'Red']);
    const l = createLightControl({ on: true, brightness: 50, colorTemp: { value: 3000, min: 2000, max: 6500 }, hue: 10, sliders: ['brightness'] });
    expect(l.el.querySelectorAll('.mh-light-control__slider')).toHaveLength(1);
    l.update({ sliders: ['brightness', 'temperature'] });
    expect(l.el.querySelector('.mh-light-control__slider--hue')).toBeNull();
    expect(l.el.querySelector('.mh-light-control__slider--temperature')?.className).toContain(lightSliderClass('temperature'));
  });
});

describe('position control', () => {
  it('shows buttons only for what it can do, with custom labels', () => {
    expect(positionButtons({ can: { open: true, close: true } }).map((b) => b.action)).toEqual(['open', 'close']);
    const p = createPositionControl({ state: 'stopped', position: 40, can: { open: true, close: true, stop: true, position: true }, labels: { open: 'Raise', close: 'Lower' } });
    expect(buttons(p.el, '.mh-position-control__button').map((b) => b.textContent)).toEqual(['Raise', 'Stop', 'Lower']);
    expect(p.el.querySelector('.mh-position-control__slider input')).not.toBeNull();
    p.update({ can: { stop: true } });
    expect(buttons(p.el, '.mh-position-control__button').map((b) => b.textContent)).toEqual(['Stop']);
    expect(p.el.querySelector('.mh-position-control__slider')).toBeNull();
  });

  it('fires the events and disables open when fully open', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onStop = vi.fn();
    const p = createPositionControl({ state: 'open', position: 100, can: { open: true, close: true, stop: true }, onOpen, onClose, onStop });
    const [open, stop, close] = buttons(p.el, '.mh-position-control__button');
    expect(open!.disabled).toBe(true);
    click(close!);
    click(stop!);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
    p.update({ position: 0, state: 'closed' });
    expect(open!.disabled).toBe(false);
    expect(close!.disabled).toBe(true);
    click(open!);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('marks the moving direction', () => {
    const p = createPositionControl({ state: 'closing', position: 60 });
    expect(p.el.classList.contains('is-moving')).toBe(true);
    expect(p.el.querySelector('.mh-position-control__button--close')!.classList.contains('is-active')).toBe(true);
    expect(p.el.querySelector('.mh-position-control__button--open')!.classList.contains('is-active')).toBe(false);
    p.update({ state: 'stopped' });
    expect(p.el.querySelector('.is-active')).toBeNull();
  });

  it('sends the position on release', () => {
    const onPosition = vi.fn();
    const p = createPositionControl({ position: 10, can: { position: true }, onPosition });
    const input = p.el.querySelector<HTMLInputElement>('input')!;
    input.value = '70';
    input.dispatchEvent(new Event('input'));
    expect(onPosition).not.toHaveBeenCalled();
    input.dispatchEvent(new Event('change'));
    expect(onPosition).toHaveBeenCalledWith(70);
    p.update({ disabled: true });
    expect(input.disabled).toBe(true);
  });
});

describe('lock control', () => {
  it('disables the button for the current state and shows the state', () => {
    expect(lockButtons({ state: 'locked' }).map((b) => [b.action, b.disabled])).toEqual([
      ['lock', true],
      ['unlock', false],
    ]);
    expect(lockButtons({ state: 'jammed', canOpen: true }).every((b) => !b.disabled)).toBe(true);
    const lock = createLockControl({ state: 'unlocked', canOpen: true });
    expect(lock.el.className).toBe('mh-lock-control mh-lock-control--unlocked');
    expect(lock.el.querySelector('.mh-lock-control__state')!.textContent).toBe('Unlocked');
    expect(buttons(lock.el, '.mh-lock-control__button').map((b) => [b.textContent, b.disabled])).toEqual([
      ['Lock', false],
      ['Unlock', true],
      ['Open', false],
    ]);
  });

  it('takes the alert tone when jammed and says unknown for null', () => {
    const lock = createLockControl({ state: 'jammed' });
    expect(lock.el.classList.contains('mh-lock-control--jammed')).toBe(true);
    lock.update({ state: null });
    expect(lock.el.classList.contains('mh-lock-control--unknown')).toBe(true);
    expect(lock.el.querySelector('.mh-lock-control__state')!.textContent).toBe('Unknown');
  });

  it('fires at once without confirm', () => {
    const onUnlock = vi.fn();
    const lock = createLockControl({ state: 'locked', onUnlock });
    click(lock.el.querySelector('.mh-lock-control__button--unlock'));
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('asks for a second tap before unlocking, inline', () => {
    const onUnlock = vi.fn();
    const onLock = vi.fn();
    const lock = createLockControl({ state: 'locked', confirm: true, onUnlock, onLock });
    const unlock = lock.el.querySelector<HTMLButtonElement>('.mh-lock-control__button--unlock')!;
    click(unlock);
    expect(onUnlock).not.toHaveBeenCalled();
    expect(unlock.textContent).toBe('Tap again to unlock');
    expect(unlock.classList.contains('is-confirming')).toBe(true);
    expect(lock.el.classList.contains('is-confirming')).toBe(true);
    expect(lock.el.querySelector('.mh-visually-hidden')!.textContent).toBe('Tap again to unlock');
    click(unlock);
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(unlock.textContent).toBe('Unlock');
    // Lock never asks.
    lock.update({ state: 'unlocked' });
    click(lock.el.querySelector('.mh-lock-control__button--lock'));
    expect(onLock).toHaveBeenCalledTimes(1);
  });

  it('drops the second step after the timeout, on Escape and on a new state', () => {
    const onOpen = vi.fn();
    const lock = createLockControl({ state: 'locked', confirm: true, canOpen: true, onOpen });
    const open = lock.el.querySelector<HTMLButtonElement>('.mh-lock-control__button--open')!;
    click(open);
    expect(open.textContent).toBe('Tap again to open');
    vi.advanceTimersByTime(4000);
    expect(open.textContent).toBe('Open');
    click(open);
    lock.el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(open.textContent).toBe('Open');
    click(open);
    lock.update({ state: 'unlocked' });
    expect(open.textContent).toBe('Open');
    expect(onOpen).not.toHaveBeenCalled();
  });
});
