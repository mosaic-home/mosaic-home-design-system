import { mdiAlertCircle, mdiCheckCircle, mdiKeyVariant, mdiLanConnect, mdiQrcodeScan, mdiServerNetwork } from '@mdi/js';
import { buttonClass, createButton } from '../../actions/button.ts';
import { createSegmentedControl, type SegmentOption } from '../../choice-inputs/segmentedControl.ts';
import { createQrCode, type QrCodeHandle } from '../../data-display/qrCode.ts';
import { cx, h, uid } from '../../dom.ts';
import { createIcon } from '../../icons.ts';
import { createSecretField } from '../../text-inputs/secretField.ts';
import { createTextField } from '../../text-inputs/textField.ts';
import { syncChildren } from '../children.ts';

/** How the screen gets its access: a pasted token, or a QR code (shown for a phone to scan, or scanned by the screen). */
export type DeviceSetupMethod = 'token' | 'qr';

/** What the setup hands to the app. `address` is normalised (`http://` added when no scheme, no trailing slash). */
export interface DeviceSetupValues {
  address: string;
  token: string;
}

/** What a scan or the app fills in. */
export type DeviceSetupFill = Partial<DeviceSetupValues>;

/** The app's answer to "test connection". `field` puts the message on that field. */
export type DeviceSetupResult = { ok: true; message?: string } | { ok: false; message?: string; field?: 'address' | 'token' };

export type DeviceSetupPhase = 'idle' | 'testing' | 'success' | 'error';

export interface DeviceSetupLabels {
  title: string;
  addressStep: string;
  address: string;
  addressHelp: string;
  addressRequired: string;
  addressInvalid: string;
  accessStep: string;
  /** The method switch. */
  method: string;
  methodToken: string;
  methodQr: string;
  token: string;
  tokenHelp: string;
  tokenRequired: string;
  /** In QR mode, testing before a code was scanned or delivered. */
  tokenMissing: string;
  qrCode: string;
  qrCaption: string;
  scan: string;
  /** After a scan filled in a token. */
  scanned: string;
  /** The scan found nothing usable. */
  scanEmpty: string;
  testStep: string;
  test: string;
  testing: string;
  success: string;
  failed: string;
  finish: string;
  cancel: string;
}

export const DEVICE_SETUP_LABELS: DeviceSetupLabels = {
  title: 'Connect to your home server',
  addressStep: 'Server',
  address: 'Server address',
  addressHelp: 'The address you open the server at, with its port',
  addressRequired: 'Enter the server address',
  addressInvalid: 'That doesn’t look like an address',
  accessStep: 'Access',
  method: 'How to sign in',
  methodToken: 'Access token',
  methodQr: 'QR code',
  token: 'Access token',
  tokenHelp: 'Create a long-lived access token on the server and paste it here',
  tokenRequired: 'Paste the access token',
  tokenMissing: 'Scan a code or paste an access token first',
  qrCode: 'Setup code',
  qrCaption: 'Scan with a phone that is signed in to the server',
  scan: 'Scan a code',
  scanned: 'Code scanned',
  scanEmpty: 'No setup details in that code',
  testStep: 'Test',
  test: 'Test connection',
  testing: 'Testing…',
  success: 'Connected',
  failed: 'Couldn’t connect',
  finish: 'Finish',
  cancel: 'Cancel',
};

export interface DeviceSetupOptions {
  /** Starting address. */
  address?: string;
  /** Starting token (for example from a flash-time file). Never shown unless the user reveals it. */
  token?: string;
  /** The address field's example. */
  placeholder?: string;
  /** The methods offered (default: token, plus QR when `qrValue` or `onScan` is given). */
  methods?: readonly DeviceSetupMethod[];
  method?: DeviceSetupMethod;
  /** A code for a phone to scan (a pairing link from the app); shown in QR mode. */
  qrValue?: string | null;
  /** A line under the title. */
  intro?: string;
  /** Finish runs the test first when it hasn't passed yet (default true). */
  requireTest?: boolean;
  /** Level of the title heading (default 2); steps take the next level. */
  headingLevel?: 2 | 3 | 4 | 5;
  labels?: Partial<DeviceSetupLabels>;
  /** Tests the connection; the component sends nothing itself. */
  onTest?: (values: DeviceSetupValues) => Promise<DeviceSetupResult>;
  /** Opens the app's scanner; resolves to what the code held (or null when cancelled). */
  onScan?: () => Promise<DeviceSetupFill | null>;
  onFinish?: (values: DeviceSetupValues) => void;
  onCancel?: () => void;
  /** Any change of method or values (the token included; keep it out of logs). */
  onChange?: (values: { address: string; token: string; method: DeviceSetupMethod }) => void;
}

export interface DeviceSetupHandle {
  el: HTMLFormElement;
  /** The current values (address normalised, or as typed when it isn't valid). */
  getValues(): DeviceSetupValues;
  /** Fills in values (a delivered pairing, a scan) and resets the test. */
  fill(values: DeviceSetupFill): void;
  /** Runs the test as the button does; resolves to whether it passed. */
  test(): Promise<boolean>;
  update(changes: Partial<Pick<DeviceSetupOptions, 'qrValue' | 'intro' | 'labels' | 'placeholder'>>): void;
}

/**
 * The address as the app should use it: trimmed, `http://` added when there is no scheme, no trailing slash.
 * Null when it isn't an http(s) address with a host.
 */
export function normaliseServerAddress(text: string): string | null {
  let t = text.trim();
  if (!t) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) t = `http://${t}`;
  try {
    const url = new URL(t);
    if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) return null;
    return `${url.protocol}//${url.host}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    return null;
  }
}

export function deviceSetupLabels(labels: Partial<DeviceSetupLabels> | undefined): DeviceSetupLabels {
  return { ...DEVICE_SETUP_LABELS, ...labels };
}

/** The methods offered. */
export function deviceSetupMethods(o: Pick<DeviceSetupOptions, 'methods' | 'qrValue' | 'onScan'>): DeviceSetupMethod[] {
  if (o.methods?.length) return [...new Set(o.methods)];
  return o.qrValue || o.onScan ? ['token', 'qr'] : ['token'];
}

export function deviceSetupMethodOptions(labels: DeviceSetupLabels): SegmentOption[] {
  return [
    { value: 'token', label: labels.methodToken, icon: mdiKeyVariant },
    { value: 'qr', label: labels.methodQr, icon: mdiQrcodeScan },
  ];
}

export interface DeviceSetupCheck {
  values: DeviceSetupValues;
  addressError?: string;
  tokenError?: string;
  /** A problem with no field to put it on (QR mode without a token). */
  error?: string;
}

/** Checks the values before a test: the address must be valid and a token present. */
export function deviceSetupCheck(address: string, token: string, method: DeviceSetupMethod, labels: DeviceSetupLabels): DeviceSetupCheck {
  const normal = normaliseServerAddress(address);
  const values = { address: normal ?? address.trim(), token: token.trim() };
  const out: DeviceSetupCheck = { values };
  if (!address.trim()) out.addressError = labels.addressRequired;
  else if (!normal) out.addressError = labels.addressInvalid;
  if (!values.token) {
    if (method === 'token') out.tokenError = labels.tokenRequired;
    else out.error = labels.tokenMissing;
  }
  return out;
}

export function deviceSetupResultClass(phase: DeviceSetupPhase): string {
  return cx('mh-device-setup__result', phase === 'success' && 'is-success', phase === 'error' && 'is-error', phase === 'testing' && 'is-testing');
}

export const deviceSetupResultIcon = (phase: DeviceSetupPhase): string | null => (phase === 'success' ? mdiCheckCircle : phase === 'error' ? mdiAlertCircle : null);

export const DEVICE_SETUP_STEP_ICONS = { address: mdiServerNetwork, access: mdiKeyVariant, test: mdiLanConnect } as const;

/** The step's frame: a number, then a heading and the content. */
export function deviceSetupStep(step: keyof typeof DEVICE_SETUP_STEP_ICONS, n: number, title: string, level: number, ...content: (Node | null)[]): HTMLLIElement {
  return h(
    'li',
    { class: cx('mh-device-setup__step', `mh-device-setup__step--${step}`) },
    h('span', { class: 'mh-device-setup__number', 'aria-hidden': 'true' }, String(n)),
    h('div', { class: 'mh-device-setup__content' }, h(`h${level}` as 'h3', { class: 'mh-device-setup__step-title' }, title), ...content),
  );
}

/**
 * `form.mh-device-setup`: pairs a screen with a home server in three numbered `__step`s: the server address (a
 * URL field), access (a `__method` switch between a pasted access token in the secret field and a QR code:
 * `__qr` shown for a phone to scan, and a `__scan` button that asks the app's scanner and fills in what it read)
 * and a test (`__test` button, then the `__result`: `.is-testing`, `.is-success` or `.is-error`, a polite
 * status). `__actions` holds Cancel and Finish: Finish (or Enter in a field) runs the test first when it hasn't passed
 * yet, and finishes once it does (unless `requireTest` is off). The component sends nothing itself: `onTest`, `onScan` and `onFinish` do the
 * work. The token stays in the password input and the callbacks; it is never logged or written to an attribute.
 */
export function createDeviceSetup(options: DeviceSetupOptions): DeviceSetupHandle {
  let o: DeviceSetupOptions = { ...options };
  let l = deviceSetupLabels(o.labels);
  const methods = deviceSetupMethods(o);
  let method: DeviceSetupMethod = o.method && methods.includes(o.method) ? o.method : methods[0]!;
  let phase: DeviceSetupPhase = 'idle';
  let resultText = '';
  let scanned = '';
  let run = 0;
  const level = o.headingLevel ?? 2;
  const titleId = uid('mh-device-setup-title');

  const changed = (): void => {
    if (phase !== 'idle') {
      run++;
      phase = 'idle';
      resultText = '';
    }
    render();
    o.onChange?.({ address: address.getValue(), token: token.getValue(), method });
  };

  const address = createTextField({ label: l.address, type: 'url', inputMode: 'url', autocomplete: 'off', placeholder: o.placeholder, helper: l.addressHelp, value: o.address ?? '', icon: mdiServerNetwork, onInput: () => {
    address.setError(undefined);
    changed();
  } });
  address.input.setAttribute('spellcheck', 'false');
  address.input.setAttribute('autocapitalize', 'off');
  const token = createSecretField({ label: l.token, kind: 'key', copyable: false, helper: l.tokenHelp, value: o.token ?? '', onInput: () => {
    token.setError(undefined);
    scanned = '';
    changed();
  } });

  const switcher = methods.length > 1 ? createSegmentedControl({ label: l.method, options: deviceSetupMethodOptions(l).filter((m) => methods.includes(m.value as DeviceSetupMethod)), value: method, fullWidth: true, onChange: (value) => {
    method = value as DeviceSetupMethod;
    changed();
  } }) : null;
  switcher?.el.classList.add('mh-device-setup__method');

  let qr: QrCodeHandle | null = null;
  let qrShown: string | null = null;
  const qrBox = h('div', { class: 'mh-device-setup__qr' });
  const scanStatus = h('p', { class: 'mh-device-setup__scanned', role: 'status' });
  const scanButton = createButton({ label: l.scan, icon: mdiQrcodeScan, variant: 'secondary', onClick: () => void scan() });
  scanButton.el.className = cx(buttonClass('secondary'), 'mh-device-setup__scan');
  const tokenPanel = h('div', { class: 'mh-device-setup__panel mh-device-setup__panel--token' }, token.el);
  const qrPanel = h('div', { class: 'mh-device-setup__panel mh-device-setup__panel--qr' });

  const testButton = createButton({ label: l.test, icon: mdiLanConnect, variant: 'secondary', onClick: () => void test() });
  testButton.el.className = cx(buttonClass('secondary'), 'mh-device-setup__test');
  const resultIcon = h('span', { class: 'mh-device-setup__result-icon', 'aria-hidden': 'true' });
  const resultTextEl = h('span', { class: 'mh-device-setup__result-text' });
  const result = h('p', { class: deviceSetupResultClass('idle'), role: 'status' }, resultIcon, resultTextEl);

  const cancel = o.onCancel ? createButton({ label: l.cancel, variant: 'text', onClick: () => o.onCancel?.() }) : null;
  const finish = createButton({ label: l.finish, variant: 'primary', type: 'submit' });
  finish.el.classList.add('mh-device-setup__finish');
  cancel?.el.classList.add('mh-device-setup__cancel');
  const actions = h('div', { class: 'mh-device-setup__actions' }, cancel?.el ?? null, finish.el);

  const title = h(`h${level}` as 'h2', { class: 'mh-device-setup__title', id: titleId }, l.title);
  const intro = h('p', { class: 'mh-device-setup__intro' });
  const head = h('div', { class: 'mh-device-setup__head' }, title);
  const accessContent = h('div', { class: 'mh-device-setup__access' });
  const steps = h(
    'ol',
    { class: 'mh-device-setup__steps' },
    deviceSetupStep('address', 1, l.addressStep, level + 1, address.el),
    deviceSetupStep('access', 2, l.accessStep, level + 1, accessContent),
    deviceSetupStep('test', 3, l.testStep, level + 1, h('div', { class: 'mh-device-setup__check' }, testButton.el, result)),
  );
  const el = h('form', { class: 'mh-device-setup', novalidate: true, 'aria-labelledby': titleId }, head, steps, actions);

  const values = (): DeviceSetupValues => deviceSetupCheck(address.getValue(), token.getValue(), method, l).values;

  async function test(): Promise<boolean> {
    const check = deviceSetupCheck(address.getValue(), token.getValue(), method, l);
    address.setError(check.addressError);
    token.setError(check.tokenError);
    if (check.addressError || check.tokenError || check.error) {
      phase = check.error ? 'error' : 'idle';
      resultText = check.error ?? '';
      render();
      (check.addressError ? address.input : check.tokenError ? token.input : null)?.focus();
      return false;
    }
    if (!o.onTest) return false;
    const mine = ++run;
    phase = 'testing';
    resultText = l.testing;
    render();
    let answer: DeviceSetupResult;
    try {
      answer = await o.onTest(check.values);
    } catch {
      answer = { ok: false };
    }
    if (mine !== run) return false;
    phase = answer.ok ? 'success' : 'error';
    resultText = answer.message?.trim() || (answer.ok ? l.success : l.failed);
    if (!answer.ok && answer.field === 'address') address.setError(resultText);
    if (!answer.ok && answer.field === 'token' && method === 'token') token.setError(resultText);
    render();
    return answer.ok;
  }

  const fill = (v: DeviceSetupFill): void => {
    if (v.address !== undefined) {
      address.setValue(v.address);
      address.setError(undefined);
    }
    if (v.token !== undefined) {
      token.setValue(v.token);
      token.setError(undefined);
    }
    changed();
  };

  async function scan(): Promise<void> {
    if (!o.onScan) return;
    let got: DeviceSetupFill | null;
    try {
      got = await o.onScan();
    } catch {
      got = null;
    }
    if (!got) return;
    const useful = !!got.address?.trim() || !!got.token?.trim();
    fill(useful ? got : {});
    scanned = useful ? l.scanned : l.scanEmpty;
    render();
  }

  el.addEventListener('submit', (event) => {
    event.preventDefault();
    void submit();
  });

  async function submit(): Promise<void> {
    if (phase === 'testing') return;
    if (phase !== 'success') {
      if ((o.requireTest ?? true) && o.onTest) {
        if (!(await test())) return;
      } else {
        const check = deviceSetupCheck(address.getValue(), token.getValue(), method, l);
        address.setError(check.addressError);
        token.setError(check.tokenError);
        if (check.addressError || check.tokenError || check.error) {
          if (check.error) {
            phase = 'error';
            resultText = check.error;
          }
          render();
          return;
        }
      }
    }
    o.onFinish?.(values());
  }

  function render(): void {
    title.textContent = l.title;
    intro.textContent = o.intro ?? '';
    syncChildren(head, o.intro ? [title, intro] : [title]);
    if (method === 'qr') {
      if (o.qrValue) {
        if (!qr || qrShown !== o.qrValue) {
          qr = createQrCode({ value: o.qrValue, label: l.qrCode, caption: l.qrCaption });
          qrShown = o.qrValue;
          qrBox.replaceChildren(qr.el);
        }
      }
      scanStatus.textContent = scanned;
      syncChildren(qrPanel, [...(o.qrValue ? [qrBox] : []), ...(o.onScan ? [scanButton.el] : []), ...(scanned ? [scanStatus] : [])]);
    }
    syncChildren(accessContent, [...(switcher ? [switcher.el] : []), method === 'qr' ? qrPanel : tokenPanel]);
    testButton.setLoading(phase === 'testing');
    testButton.setDisabled(!o.onTest);
    result.className = deviceSetupResultClass(phase);
    const path = deviceSetupResultIcon(phase);
    resultIcon.replaceChildren(...(path ? [createIcon(path)] : []));
    resultTextEl.textContent = resultText;
    result.hidden = !resultText;
    finish.setDisabled(phase === 'testing');
  }
  render();

  return {
    el,
    getValues: values,
    fill,
    test,
    update(changes) {
      o = { ...o, ...changes };
      l = deviceSetupLabels(o.labels);
      if ('placeholder' in changes) address.input.placeholder = changes.placeholder ?? '';
      render();
    },
  };
}
