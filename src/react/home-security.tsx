// React bindings for the home group: Security, presence and connection: alarm panel, doorbell, people, openings,
// hazards, connection status, device setup. Same DOM and classes as the web renderer.
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../web/dom.ts';
import {
  ALARM_BACK_ICON,
  ALARM_KEYS,
  alarmCodeSlots,
  alarmEnterAction,
  alarmKeyClass,
  alarmLive,
  alarmMaxCode,
  alarmNextCode,
  alarmPanelClass,
  alarmPanelLabels,
  alarmPanelView,
  alarmSecondsLeft,
  type AlarmPanelAction,
  type AlarmPanelOptions,
} from '../web/home/security/alarmPanel.ts';
import { CONNECTION_RETRY_CLASS, connectionStatusClass, connectionStatusLabels, connectionStatusView, connectionIcon, type ConnectionStatusOptions } from '../web/home/security/connectionStatus.ts';
import {
  DEVICE_SETUP_STEP_ICONS,
  deviceSetupCheck,
  deviceSetupLabels,
  deviceSetupMethodOptions,
  deviceSetupMethods,
  deviceSetupResultClass,
  deviceSetupResultIcon,
  type DeviceSetupFill,
  type DeviceSetupMethod,
  type DeviceSetupOptions,
  type DeviceSetupPhase,
  type DeviceSetupResult,
} from '../web/home/security/deviceSetup.ts';
import { doorbellAspect, doorbellButtonClass, doorbellButtons, doorbellClass, doorbellLabels, doorbellRefresh, doorbellText, doorbellTrapTab, type DoorbellOptions } from '../web/home/security/doorbell.ts';
import { watchCameraRefresh } from '../web/home/cameraTile.ts';
import { hazardAdvice, hazardBannerClass, hazardBannerLabels, hazardBannerText, hazardButtonClass, hazardButtons, hazardIcon, hazardRole, type HazardBannerOptions } from '../web/home/security/hazardBanner.ts';
import { openingIcon, openingItemClass, openingMetaText, openingsSummaryClass, openingsSummaryLabels, openingsSummaryView, type OpeningsSummaryOptions } from '../web/home/security/openingsSummary.ts';
import { peoplePersonClass, peoplePlaceText, peopleStripClass, peopleStripSummary, peopleWhereIcon, type PeopleStripOptions } from '../web/home/security/peopleStrip.ts';
import { mdiAlert, mdiBellRing, mdiDoorbellVideo, mdiQrcodeScan } from '@mdi/js';
import { Button } from './actions.tsx';
import { SegmentedControl } from './choice-inputs.tsx';
import { Avatar, QrCode } from './data-display.tsx';
import { Icon } from './foundations.tsx';
import { SecretField, TextField } from './text-inputs.tsx';

/** The current time, ticking every second while `active`. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

// Alarm panel --------------------------------------------------------------------------------------------------

export interface AlarmPanelProps extends AlarmPanelOptions {
  className?: string;
}

/** Same DOM and classes as `createAlarmPanel`. The code lives only in this component's state and is cleared once handed over. */
export function AlarmPanel(props: AlarmPanelProps) {
  const { label = 'Alarm', className } = props;
  const [code, setCode] = useState('');
  const [seen, setSeen] = useState({ state: props.state, error: props.error });
  if (seen.state !== props.state || seen.error !== props.error) {
    // A new state or a new error empties the code.
    if (seen.state !== props.state || props.error) setCode('');
    setSeen({ state: props.state, error: props.error });
  }
  const counting = (props.state === 'arming' || props.state === 'pending') && alarmSecondsLeft(props.deadline, Date.now()) !== null;
  const now = useNow(counting);
  const l = alarmPanelLabels(props.labels);
  const view = alarmPanelView(props, code.length, now);
  const max = alarmMaxCode(props);
  const press = (key: string): void => {
    if (props.disabled) return;
    setCode((c) => alarmNextCode(c, key, max));
  };
  const run = (action: AlarmPanelAction): void => {
    if (action.disabled) return;
    const given = code === '' ? undefined : code;
    setCode('');
    if (action.kind === 'arm') props.onArm?.(action.mode!, given);
    else props.onDisarm?.(given);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select, [contenteditable]')) return;
    if (!view.keypad && event.key !== 'Enter') return;
    if (/^[0-9]$/.test(event.key)) press(event.key);
    else if (event.key === 'Backspace') press('back');
    else if (event.key === 'Escape' && code) press('clear');
    else if (event.key === 'Enter' && target.tagName !== 'BUTTON') {
      const action = alarmEnterAction(view);
      if (action) run(action);
      else return;
    } else return;
    event.preventDefault();
    event.stopPropagation();
  };
  const slots = alarmCodeSlots(code.length, props.codeLength);
  const buttons = view.actions.map((a) => (
    <Button key={a.key} variant={a.variant} size="large" icon={a.icon} className={cx('mh-alarm-panel__action', `mh-alarm-panel__action--${a.kind}`)} aria-label={a.ariaLabel} disabled={a.disabled} onClick={() => run(a)}>
      {a.text}
    </Button>
  ));
  return (
    <div className={cx(alarmPanelClass(props), className)} role="group" aria-label={label} onKeyDown={onKeyDown}>
      <div className="mh-alarm-panel__status">
        <span className="mh-alarm-panel__icon" aria-hidden="true">
          <Icon icon={view.icon} />
        </span>
        <span className="mh-alarm-panel__text">
          <span className="mh-alarm-panel__state" aria-live={alarmLive(props.state)}>
            {view.stateText}
          </span>
          {view.detail && <span className="mh-alarm-panel__detail">{view.detail}</span>}
        </span>
        {view.time !== null && (
          <span className="mh-alarm-panel__time" role="timer">
            {view.time}
          </span>
        )}
      </div>
      {view.left !== null && (
        <div className="mh-alarm-panel__bar" aria-hidden="true">
          <span className="mh-alarm-panel__bar-fill" style={{ ['--_left' as string]: String(view.left) }} />
        </div>
      )}
      {view.keypad && (
        <div className="mh-alarm-panel__code">
          <span className="mh-alarm-panel__slots" aria-hidden="true">
            {slots.length === 0 ? <span className="mh-alarm-panel__prompt">{l.enterCode}</span> : slots.map((on, i) => <span key={i} className={cx('mh-alarm-panel__slot', on && 'is-filled')} />)}
          </span>
          <span className="mh-visually-hidden" aria-live="polite">
            {view.codeText}
          </span>
        </div>
      )}
      {props.error && (
        <p className="mh-alarm-panel__message" role="alert">
          {props.error}
        </p>
      )}
      {view.keypad && (
        <div className="mh-alarm-panel__keypad" role="group" aria-label={l.keypad}>
          {ALARM_KEYS.map((key) => {
            const edit = key === 'clear' || key === 'back';
            const disabled = !!props.disabled || (edit ? code === '' : code.length >= max);
            return (
              <button
                key={key}
                type="button"
                className={alarmKeyClass(key)}
                aria-label={key === 'back' ? l.back : undefined}
                title={key === 'back' ? l.back : undefined}
                disabled={disabled}
                onClick={() => press(key)}
              >
                {key === 'back' ? <Icon icon={ALARM_BACK_ICON} /> : key === 'clear' ? l.clear : key}
              </button>
            );
          })}
        </div>
      )}
      {view.actions.length > 0 && (
        <div className="mh-alarm-panel__actions">
          {view.actions[0]!.kind === 'arm' ? (
            <div className="mh-alarm-panel__modes" role="group" aria-label={l.armGroup}>
              {buttons}
            </div>
          ) : (
            buttons
          )}
        </div>
      )}
    </div>
  );
}

// Doorbell -----------------------------------------------------------------------------------------------------

export interface DoorbellProps extends DoorbellOptions {
  className?: string;
}

/** Same DOM and classes as `createDoorbell`. A takeover takes focus when it mounts. */
export function Doorbell(props: DoorbellProps) {
  const { door, src, takeover, className } = props;
  const l = doorbellLabels(props.labels);
  const text = doorbellText(props);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<{ src: string; url: string } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const every = doorbellRefresh(props.refreshEvery);
  useEffect(() => {
    if (!ref.current || !src) return;
    const refresher = watchCameraRefresh(ref.current, src, every, (url) => {
      setFrame({ src, url });
      setFailed(null);
    });
    return () => refresher.stop();
  }, [src, every]);
  useEffect(() => {
    if (takeover) ref.current?.querySelector<HTMLButtonElement>('.mh-doorbell__action')?.focus();
  }, [takeover]);
  const has = !!src && failed !== src;
  const url = src && frame?.src === src ? frame.url : src;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!takeover || !ref.current) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      props.onDismiss?.();
      return;
    }
    doorbellTrapTab(ref.current, event);
  };
  const press = (action: 'answer' | 'talk' | 'dismiss'): void => {
    if (action === 'answer') props.onAnswer?.();
    else if (action === 'talk') props.onTalk?.(!props.talking);
    else props.onDismiss?.();
  };
  return (
    <div
      ref={ref}
      className={cx(doorbellClass({ ...props, picture: has }), className)}
      role="alertdialog"
      aria-labelledby={`${id}title`}
      aria-describedby={`${id}detail`}
      aria-modal={takeover ? true : undefined}
      onKeyDown={onKeyDown}
    >
      <div className="mh-doorbell__panel">
        <div className="mh-doorbell__header">
          <span className="mh-doorbell__bell" aria-hidden="true">
            <Icon icon={mdiBellRing} />
          </span>
          <div className="mh-doorbell__text">
            <h2 className="mh-doorbell__title" id={`${id}title`}>
              {text.title}
            </h2>
            <p className="mh-doorbell__detail" id={`${id}detail`}>
              {text.detail}
            </p>
          </div>
        </div>
        <div className="mh-doorbell__picture" style={{ aspectRatio: doorbellAspect(props.aspect) }}>
          <span className="mh-doorbell__placeholder">
            <Icon icon={mdiDoorbellVideo} />
            <span className="mh-doorbell__placeholder-text">{l.noPicture}</span>
          </span>
          {has && url && <img className="mh-doorbell__image" alt={l.picture.replace('{door}', door)} decoding="async" referrerPolicy="no-referrer" src={url} onError={() => setFailed(src)} />}
        </div>
        <div className="mh-doorbell__actions">
          {doorbellButtons(props).map((b) => (
            <button key={b.action} type="button" className={doorbellButtonClass(b)} aria-pressed={b.pressed} onClick={() => press(b.action)}>
              <Icon icon={b.icon} />
              <span className="mh-button__label">{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// People strip -------------------------------------------------------------------------------------------------

export interface PeopleStripProps extends PeopleStripOptions {
  className?: string;
}

/** Same DOM and classes as `createPeopleStrip`. */
export function PeopleStrip({ people, compact, labels, onSelect, className }: PeopleStripProps) {
  return (
    <ul className={cx(peopleStripClass(compact), className)} aria-label={peopleStripSummary(people, labels)}>
      {people.map((p) => {
        const place = peoplePlaceText(p, labels);
        const inner = (
          <>
            <span className="mh-people-strip__face" aria-hidden="true">
              <Avatar name={p.name} src={p.picture} size={compact ? 'medium' : 'large'} />
              <span className="mh-people-strip__badge">
                <Icon icon={peopleWhereIcon(p.where)} />
              </span>
            </span>
            <span className={cx('mh-people-strip__text', compact && 'mh-visually-hidden')}>
              <span className="mh-people-strip__name">{p.name}</span>
              <span className="mh-people-strip__place">{place}</span>
            </span>
          </>
        );
        const title = compact ? `${p.name}: ${place}` : undefined;
        return (
          <li key={p.id} className={peoplePersonClass(p)}>
            {onSelect ? (
              <button type="button" className="mh-people-strip__main" title={title} onClick={() => onSelect(p.id)}>
                {inner}
              </button>
            ) : (
              <span className="mh-people-strip__main" title={title}>
                {inner}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Openings summary ---------------------------------------------------------------------------------------------

export interface OpeningsSummaryProps extends OpeningsSummaryOptions {
  className?: string;
}

/** Same DOM and classes as `createOpeningsSummary`. */
export function OpeningsSummary(props: OpeningsSummaryProps) {
  const { onSelect, headingLevel = 3, className } = props;
  const l = openingsSummaryLabels(props.labels);
  const view = openingsSummaryView(props);
  const id = useId();
  const Heading = `h${headingLevel}` as 'h3';
  const reason = view.warning ? props.reason?.trim() : '';
  return (
    <section className={cx(openingsSummaryClass(view), className)} aria-labelledby={`${id}title`}>
      <div className="mh-openings-summary__header">
        <span className="mh-openings-summary__icon" aria-hidden="true">
          <Icon icon={view.icon} />
        </span>
        <div className="mh-openings-summary__heading">
          <Heading className="mh-openings-summary__title" id={`${id}title`}>
            {l.title}
          </Heading>
          <span className="mh-openings-summary__count" aria-live="polite">
            {view.countText}
          </span>
        </div>
      </div>
      {reason && <p className="mh-openings-summary__reason">{reason}</p>}
      {view.items.length > 0 && (
        <ul className="mh-openings-summary__list">
          {view.items.map((item) => {
            const meta = openingMetaText(item, props.labels);
            const inner = (
              <>
                <span className="mh-openings-summary__item-icon" aria-hidden="true">
                  <Icon icon={openingIcon(item.kind, item.open)} />
                </span>
                <span className="mh-openings-summary__item-text">
                  <span className="mh-openings-summary__name">{item.name}</span>
                  {meta && <span className="mh-openings-summary__meta">{meta}</span>}
                </span>
                {item.open && item.alert && (
                  <span className="mh-openings-summary__flag">
                    <Icon icon={mdiAlert} />
                    <span className="mh-visually-hidden">{l.shouldBeShut}</span>
                  </span>
                )}
              </>
            );
            return (
              <li key={item.id} className={openingItemClass(item)} data-id={item.id}>
                {onSelect ? (
                  <button type="button" className="mh-openings-summary__row" onClick={() => onSelect(item.id)}>
                    {inner}
                  </button>
                ) : (
                  <span className="mh-openings-summary__row">{inner}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// Hazard banner ------------------------------------------------------------------------------------------------

export interface HazardBannerProps extends HazardBannerOptions {
  className?: string;
}

/** Same DOM and classes as `createHazardBanner`. */
export function HazardBanner(props: HazardBannerProps) {
  const { headingLevel = 2, className } = props;
  const l = hazardBannerLabels(props.labels);
  const text = hazardBannerText(props);
  const steps = hazardAdvice(props.advice);
  const buttons = hazardButtons(props);
  const id = useId();
  const Heading = `h${headingLevel}` as 'h2';
  return (
    <section className={cx(hazardBannerClass(props), className)} role={hazardRole(props.severity)} aria-labelledby={`${id}title`}>
      <span className="mh-hazard-banner__icon" aria-hidden="true">
        <Icon icon={hazardIcon(props.kind, props.severity)} />
      </span>
      <div className="mh-hazard-banner__body">
        <Heading className="mh-hazard-banner__title" id={`${id}title`}>
          {text.title}
        </Heading>
        {text.where && <p className="mh-hazard-banner__where">{text.where}</p>}
        {steps.length > 0 && (
          <ol className="mh-hazard-banner__advice" aria-label={l.advice}>
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
      </div>
      {buttons.length > 0 && (
        <div className="mh-hazard-banner__actions">
          {buttons.map((b) => (
            <button
              key={`${b.kind}:${b.id}`}
              type="button"
              className={hazardButtonClass(b)}
              data-action={b.id}
              onClick={() => (b.kind === 'silence' ? props.onSilence?.() : b.kind === 'dismiss' ? props.onDismiss?.() : props.onAction?.(b.id))}
            >
              {b.icon && <Icon icon={b.icon} />}
              <span className="mh-button__label">{b.label}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// Connection status --------------------------------------------------------------------------------------------

export interface ConnectionStatusProps extends ConnectionStatusOptions {
  className?: string;
}

/** Same DOM and classes as `createConnectionStatus`; the countdown ticks every second. */
export function ConnectionStatus(props: ConnectionStatusProps) {
  const { className } = props;
  const counting = props.state !== 'connected' && props.state !== 'rejected' && !props.detail && typeof props.retryAt === 'number' && props.retryAt > Date.now();
  const now = useNow(counting);
  const l = connectionStatusLabels(props.labels);
  const view = connectionStatusView(props, now);
  return (
    <div className={cx(connectionStatusClass(props, view), className)}>
      <span className="mh-connection-status__icon" aria-hidden="true">
        <Icon icon={connectionIcon(props.state)} />
      </span>
      <span className="mh-connection-status__text">
        <span className={cx('mh-connection-status__state', view.quiet && 'mh-visually-hidden')} role="status">
          {view.stateText}
        </span>
        {view.detail && <span className="mh-connection-status__detail">{view.detail}</span>}
      </span>
      {view.retry && (
        <button type="button" className={CONNECTION_RETRY_CLASS} onClick={() => props.onRetry?.()}>
          <span className="mh-button__label">{l.retry}</span>
        </button>
      )}
    </div>
  );
}

// Device setup -------------------------------------------------------------------------------------------------

export interface DeviceSetupProps extends DeviceSetupOptions {
  className?: string;
}

function Step({ step, n, title, level, children }: { step: keyof typeof DEVICE_SETUP_STEP_ICONS; n: number; title: string; level: number; children: ReactNode }) {
  const Heading = `h${level}` as 'h3';
  return (
    <li className={cx('mh-device-setup__step', `mh-device-setup__step--${step}`)}>
      <span className="mh-device-setup__number" aria-hidden="true">
        {n}
      </span>
      <div className="mh-device-setup__content">
        <Heading className="mh-device-setup__step-title">{title}</Heading>
        {children}
      </div>
    </li>
  );
}

/**
 * Same DOM and classes as `createDeviceSetup`. `address` and `token` are starting values; a later change of either
 * prop fills it in (a delivered pairing). The component sends nothing itself.
 */
export function DeviceSetup(props: DeviceSetupProps) {
  const { placeholder, qrValue, intro, onScan, onCancel, headingLevel = 2, className } = props;
  const l = deviceSetupLabels(props.labels);
  const methods = deviceSetupMethods(props);
  const [method, setMethod] = useState<DeviceSetupMethod>(props.method && methods.includes(props.method) ? props.method : methods[0]!);
  const [address, setAddress] = useState(props.address ?? '');
  const [token, setToken] = useState(props.token ?? '');
  const [errors, setErrors] = useState<{ address?: string; token?: string }>({});
  const [phase, setPhase] = useState<DeviceSetupPhase>('idle');
  const [resultText, setResultText] = useState('');
  const [scanned, setScanned] = useState('');
  const [seen, setSeen] = useState({ address: props.address, token: props.token });
  const run = useRef(0);
  const form = useRef<HTMLFormElement>(null);
  const id = useId();

  const reset = (): void => {
    if (phase !== 'idle') {
      run.current++;
      setPhase('idle');
      setResultText('');
    }
  };
  if (seen.address !== props.address || seen.token !== props.token) {
    // A changed prop fills that value in.
    if (seen.address !== props.address && props.address !== undefined) setAddress(props.address);
    if (seen.token !== props.token && props.token !== undefined) setToken(props.token);
    setSeen({ address: props.address, token: props.token });
    reset();
  }
  const changed = (next: { address?: string; token?: string; method?: DeviceSetupMethod }): void => {
    reset();
    props.onChange?.({ address: next.address ?? address, token: next.token ?? token, method: next.method ?? method });
  };

  const test = async (): Promise<boolean> => {
    const check = deviceSetupCheck(address, token, method, l);
    setErrors({ address: check.addressError, token: check.tokenError });
    if (check.addressError || check.tokenError || check.error) {
      setPhase(check.error ? 'error' : 'idle');
      setResultText(check.error ?? '');
      const step = check.addressError ? 'address' : check.tokenError ? 'access' : null;
      if (step) form.current?.querySelector<HTMLInputElement>(`.mh-device-setup__step--${step} input`)?.focus();
      return false;
    }
    if (!props.onTest) return false;
    const mine = ++run.current;
    setPhase('testing');
    setResultText(l.testing);
    let answer: DeviceSetupResult;
    try {
      answer = await props.onTest(check.values);
    } catch {
      answer = { ok: false };
    }
    if (mine !== run.current) return false;
    const message = answer.message?.trim() || (answer.ok ? l.success : l.failed);
    setPhase(answer.ok ? 'success' : 'error');
    setResultText(message);
    if (!answer.ok && answer.field === 'address') setErrors((e) => ({ ...e, address: message }));
    if (!answer.ok && answer.field === 'token' && method === 'token') setErrors((e) => ({ ...e, token: message }));
    return answer.ok;
  };

  const scan = async (): Promise<void> => {
    if (!onScan) return;
    let got: DeviceSetupFill | null;
    try {
      got = await onScan();
    } catch {
      got = null;
    }
    if (!got) return;
    const useful = !!got.address?.trim() || !!got.token?.trim();
    const next = { address: useful && got.address !== undefined ? got.address : address, token: useful && got.token !== undefined ? got.token : token };
    setAddress(next.address);
    setToken(next.token);
    setErrors({});
    setScanned(useful ? l.scanned : l.scanEmpty);
    changed(next);
  };

  const submit = async (): Promise<void> => {
    if (phase === 'testing') return;
    if (phase !== 'success') {
      if ((props.requireTest ?? true) && props.onTest) {
        if (!(await test())) return;
      } else {
        const check = deviceSetupCheck(address, token, method, l);
        setErrors({ address: check.addressError, token: check.tokenError });
        if (check.addressError || check.tokenError || check.error) {
          if (check.error) {
            setPhase('error');
            setResultText(check.error);
          }
          return;
        }
      }
    }
    props.onFinish?.(deviceSetupCheck(address, token, method, l).values);
  };

  const resultIcon = deviceSetupResultIcon(phase);
  const Title = `h${headingLevel}` as 'h2';
  return (
    <form
      ref={form}
      className={cx('mh-device-setup', className)}
      noValidate
      aria-labelledby={`${id}title`}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className="mh-device-setup__head">
        <Title className="mh-device-setup__title" id={`${id}title`}>
          {l.title}
        </Title>
        {intro && <p className="mh-device-setup__intro">{intro}</p>}
      </div>
      <ol className="mh-device-setup__steps">
        <Step step="address" n={1} title={l.addressStep} level={headingLevel + 1}>
          <TextField
            label={l.address}
            type="url"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="off"
            placeholder={placeholder}
            helper={l.addressHelp}
            error={errors.address}
            icon={DEVICE_SETUP_STEP_ICONS.address}
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setErrors((e) => ({ ...e, address: undefined }));
              changed({ address: event.target.value });
            }}
          />
        </Step>
        <Step step="access" n={2} title={l.accessStep} level={headingLevel + 1}>
          <div className="mh-device-setup__access">
            {methods.length > 1 && (
              <SegmentedControl
                label={l.method}
                options={deviceSetupMethodOptions(l).filter((m) => methods.includes(m.value as DeviceSetupMethod))}
                value={method}
                fullWidth
                className="mh-device-setup__method"
                onChange={(value) => {
                  setMethod(value as DeviceSetupMethod);
                  changed({ method: value as DeviceSetupMethod });
                }}
              />
            )}
            {method === 'qr' ? (
              <div className="mh-device-setup__panel mh-device-setup__panel--qr">
                {qrValue && (
                  <div className="mh-device-setup__qr">
                    <QrCode value={qrValue} label={l.qrCode} caption={l.qrCaption} />
                  </div>
                )}
                {onScan && (
                  <Button variant="secondary" icon={mdiQrcodeScan} className="mh-device-setup__scan" onClick={() => void scan()}>
                    {l.scan}
                  </Button>
                )}
                {scanned && (
                  <p className="mh-device-setup__scanned" role="status">
                    {scanned}
                  </p>
                )}
              </div>
            ) : (
              <div className="mh-device-setup__panel mh-device-setup__panel--token">
                <SecretField
                  label={l.token}
                  kind="key"
                  copyable={false}
                  helper={l.tokenHelp}
                  error={errors.token}
                  value={token}
                  onValueChange={(value) => {
                    setToken(value);
                    setErrors((e) => ({ ...e, token: undefined }));
                    setScanned('');
                    changed({ token: value });
                  }}
                />
              </div>
            )}
          </div>
        </Step>
        <Step step="test" n={3} title={l.testStep} level={headingLevel + 1}>
          <div className="mh-device-setup__check">
            <Button variant="secondary" icon={DEVICE_SETUP_STEP_ICONS.test} className="mh-device-setup__test" loading={phase === 'testing'} disabled={!props.onTest} onClick={() => void test()}>
              {l.test}
            </Button>
            <p className={deviceSetupResultClass(phase)} role="status" hidden={!resultText}>
              <span className="mh-device-setup__result-icon" aria-hidden="true">
                {resultIcon && <Icon icon={resultIcon} />}
              </span>
              <span className="mh-device-setup__result-text">{resultText}</span>
            </p>
          </div>
        </Step>
      </ol>
      <div className="mh-device-setup__actions">
        {onCancel && (
          <Button variant="text" className="mh-device-setup__cancel" onClick={() => onCancel()}>
            {l.cancel}
          </Button>
        )}
        <Button variant="primary" type="submit" className="mh-device-setup__finish" disabled={phase === 'testing'}>
          {l.finish}
        </Button>
      </div>
    </form>
  );
}

