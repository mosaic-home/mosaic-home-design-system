// feedback group: React bindings. Same DOM and classes as the web renderer.
import { mdiCheck, mdiClose, mdiMicrophone, mdiPause, mdiPhoneHangup, mdiStop } from '@mdi/js';
import { useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { buttonClass } from '../web/actions/button.ts';
import { NOTICE_ICONS, noticeActionStyle, noticeClass, noticeDismissible, type NoticeAction, type NoticeKind } from '../web/feedback/notice.ts';
import {
  elapsedDuration,
  emptyRecordingLevels,
  formatElapsed,
  pushRecordingLevel,
  recordingPillClass,
  type RecordingPillPlacement,
} from '../web/feedback/recordingPill.ts';
import { ALERT_ICONS, alertClass, alertRole, type AlertTone } from '../web/feedback/alert.ts';
import { badgeClass, badgeText, badgeTone, type BadgeTone } from '../web/feedback/badge.ts';
import { emptyStateClass } from '../web/feedback/emptyState.ts';
import { RING, progressAria, progressBarClass, progressPercent, progressRingClass, progressValueText, ringDash, type ProgressSize, type ProgressTone } from '../web/feedback/progress.ts';
import { progressListMeta, type ProgressListItem } from '../web/feedback/progressList.ts';
import { skeletonClass, skeletonLineWidths, skeletonShapeStyle, type SkeletonShape } from '../web/feedback/skeleton.ts';
import { spinnerClass, type SpinnerSize } from '../web/feedback/spinner.ts';
import { STATUS_LABELS, statusClass, type StatusState } from '../web/feedback/status.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { Icon } from './foundations.tsx';
import type { CSSProperties } from 'react';
import { iconButtonClass } from '../web/actions/iconButton.ts';
import { VOICE_PHASE_LABELS, emptyVoiceLevels, pushVoiceLevel, voiceBarClass, voiceLevel, type VoiceBarVariant, type VoicePhase } from '../web/feedback/voiceBar.ts';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
  icon?: IconName | string | false;
  action?: ReactNode;
  /** Shows a close button; the alert hides itself after `onDismiss`. */
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
  /** The message. */
  children?: ReactNode;
}

/** Same DOM and classes as `createAlert`. */
export function Alert({ tone = 'info', title, icon, action, dismissible, dismissLabel = 'Dismiss', onDismiss, className, children, ...rest }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div role={alertRole(tone)} {...rest} className={cx(alertClass(tone), className)}>
      {icon !== false && (
        <span className="mh-alert__icon">
          <Icon icon={icon ?? ALERT_ICONS[tone]} />
        </span>
      )}
      <div className="mh-alert__body">
        {title && <p className="mh-alert__title">{title}</p>}
        <p className="mh-alert__message">{children}</p>
      </div>
      {action && <div className="mh-alert__action">{action}</div>}
      {dismissible && (
        <button
          type="button"
          className="mh-alert__dismiss"
          aria-label={dismissLabel}
          title={dismissLabel}
          onClick={() => {
            onDismiss?.();
            setDismissed(true);
          }}
        >
          <Icon icon={mdiClose} />
        </button>
      )}
    </div>
  );
}

export interface ProgressBarProps {
  /** `null` or omitted: indeterminate. */
  value?: number | null;
  max?: number;
  label: string;
  showLabel?: boolean;
  showValue?: boolean;
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
  className?: string;
}

/** Same DOM and classes as `createProgressBar`. */
export function ProgressBar({ value = null, max = 100, label, showLabel, showValue, valueText, tone, size, className }: ProgressBarProps) {
  const pct = progressPercent(value, max);
  return (
    <div className={cx(progressBarClass(tone, size, pct === null), className)} {...progressAria(value, max, label, valueText)}>
      {(showLabel || showValue) && (
        <div className="mh-progress__header">
          {showLabel && (
            <span className="mh-progress__label" aria-hidden="true">
              {label}
            </span>
          )}
          {showValue && (
            <span className="mh-progress__value" aria-hidden="true">
              {progressValueText(value, max, valueText)}
            </span>
          )}
        </div>
      )}
      <div className="mh-progress__track">
        <div className="mh-progress__fill" style={pct === null ? undefined : { width: `${pct}%` }} />
      </div>
    </div>
  );
}

export interface ProgressRingProps {
  value?: number | null;
  max?: number;
  label: string;
  showValue?: boolean;
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
  className?: string;
}

/** Same DOM and classes as `createProgressRing`. */
export function ProgressRing({ value = null, max = 100, label, showValue = true, valueText, tone, size, className }: ProgressRingProps) {
  const pct = progressPercent(value, max);
  const circle = (cls: string, dash?: string) => <circle className={cls} cx={RING.center} cy={RING.center} r={RING.radius} pathLength={100} strokeDasharray={dash} />;
  return (
    <div className={cx(progressRingClass(tone, size, pct === null), className)} {...progressAria(value, max, label, valueText)}>
      <svg className="mh-progress-ring__svg" viewBox={`0 0 ${RING.size} ${RING.size}`} aria-hidden="true">
        {circle('mh-progress-ring__track')}
        {circle('mh-progress-ring__arc', ringDash(value, max))}
      </svg>
      <span className="mh-progress-ring__value" aria-hidden="true">
        {showValue ? progressValueText(value, max, valueText) : ''}
      </span>
    </div>
  );
}

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  inherit?: boolean;
  className?: string;
}

/** Same DOM and classes as `createSpinner`. */
export function Spinner({ size, label = 'Loading', inherit, className }: SpinnerProps) {
  return (
    <span className={cx(spinnerClass(size, inherit), className)} role="status">
      <span className="mh-visually-hidden">{label}</span>
    </span>
  );
}

export interface SkeletonProps {
  shape?: SkeletonShape;
  lines?: number;
  width?: string;
  height?: string;
  label?: string;
  className?: string;
}

/** Same DOM and classes as `createSkeleton`. */
export function Skeleton({ shape = 'text', lines, width, height, label = 'Loading', className }: SkeletonProps) {
  return (
    <div className={cx(skeletonClass(shape), className)} role="status" aria-busy="true" aria-label={label}>
      {shape === 'text' ? (
        skeletonLineWidths(lines).map((w, i) => <span key={i} className="mh-skeleton__line" aria-hidden="true" style={{ width: w }} />)
      ) : (
        <span className="mh-skeleton__shape" aria-hidden="true" style={skeletonShapeStyle(width, height) ? { width, height } : undefined} />
      )}
    </div>
  );
}

export interface BadgeProps {
  label?: string;
  count?: number;
  max?: number;
  tone?: BadgeTone;
  dot?: boolean;
  attached?: boolean;
  ariaLabel?: string;
  className?: string;
}

/** Same DOM and classes as `createBadge`. A zero count renders nothing visible (`hidden`). */
export function Badge({ label, count, max = 99, tone, dot, attached, ariaLabel, className }: BadgeProps) {
  const cls = cx(badgeClass(badgeTone({ tone, dot, count, label }), dot, attached), className);
  if (dot) return <span className={cls} role="img" aria-label={ariaLabel ?? label ?? 'New'} />;
  const hidden = count !== undefined && count <= 0 && label === undefined;
  return (
    <span className={cls} aria-label={ariaLabel} hidden={hidden || undefined}>
      {badgeText({ label, count, max })}
    </span>
  );
}

export interface StatusProps {
  state: StatusState;
  label?: ReactNode;
  announce?: boolean;
  className?: string;
}

/** Same DOM and classes as `createStatus`. */
export function Status({ state, label, announce, className }: StatusProps) {
  return (
    <span className={cx(statusClass(state), className)} role={announce ? 'status' : undefined}>
      <span className="mh-status__dot" aria-hidden="true" />
      <span className="mh-status__label">{label ?? STATUS_LABELS[state]}</span>
    </span>
  );
}

export interface EmptyStateProps {
  title: ReactNode;
  text?: ReactNode;
  icon?: IconName | string;
  action?: ReactNode;
  compact?: boolean;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Same DOM and classes as `createEmptyState`. */
export function EmptyState({ title, text, icon, action, compact, headingLevel = 3, className }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as 'h3';
  return (
    <div className={cx(emptyStateClass(compact), className)}>
      {icon && (
        <span className="mh-empty-state__icon">
          <Icon icon={icon} />
        </span>
      )}
      <Heading className="mh-empty-state__title">{title}</Heading>
      {text && <p className="mh-empty-state__text">{text}</p>}
      {action && <div className="mh-empty-state__action">{action}</div>}
    </div>
  );
}

export interface ProgressListProps {
  items: ProgressListItem[];
  /** Accessible name of the list. */
  label?: string;
  className?: string;
}

/** Same DOM and classes as `createProgressList`. */
export function ProgressList({ items, label, className }: ProgressListProps) {
  return (
    <ul className={cx('mh-progress-list', className)} aria-label={label}>
      {items.map((item, i) => {
        const meta = progressListMeta(item);
        return (
          <li key={i} className="mh-progress-list__item">
            <div className="mh-progress-list__header">
              <span className="mh-progress-list__name">{item.name}</span>
              <span className="mh-progress-list__value" aria-hidden="true">
                {progressValueText(item.value)}
              </span>
            </div>
            <ProgressBar label={item.name} value={item.value} tone={item.tone} />
            {meta && <span className="mh-progress-list__meta">{meta}</span>}
          </li>
        );
      })}
    </ul>
  );
}

export interface VoiceBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: VoiceBarVariant;
  phase?: VoicePhase;
  /** Input level, 0–1. In dictation each new value adds a bar to the waveform. */
  level?: number;
  /** Status text; defaults to the phase's (`VOICE_PHASE_LABELS`). */
  label?: string;
  leading?: ReactNode;
  onTap?: () => void;
  onEnd?: () => void;
  endLabel?: string;
  busy?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  onDone?: () => void;
  doneLabel?: string;
}

const levelStyle = (name: '--_level' | '--_v', value: number | undefined): CSSProperties => ({ [name]: voiceLevel(value) }) as CSSProperties;

/** Same DOM and classes as `createVoiceBar`. */
export function VoiceBar({
  variant = 'conversation',
  phase = 'listening',
  level,
  label,
  leading,
  onTap,
  onEnd,
  endLabel = 'End conversation',
  busy = false,
  onCancel,
  cancelLabel = 'Cancel',
  onDone,
  doneLabel = 'Done',
  className,
  ...rest
}: VoiceBarProps) {
  const text = label ?? VOICE_PHASE_LABELS[phase];
  // The waveform keeps the recent levels: a new `level` value adds one.
  const [levels, setLevels] = useState(() => (level === undefined ? emptyVoiceLevels() : pushVoiceLevel(emptyVoiceLevels(), level)));
  const [seen, setSeen] = useState(level);
  if (level !== seen) {
    setSeen(level);
    setLevels((old) => pushVoiceLevel(old, level));
  }
  const status = (
    <p className="mh-voice-bar__label" aria-live="polite">
      {text}
    </p>
  );
  if (variant === 'dictation') {
    return (
      <div {...rest} className={cx(voiceBarClass(variant, phase), className)}>
        <button type="button" className={cx(iconButtonClass(), 'mh-voice-bar__cancel')} aria-label={cancelLabel} title={cancelLabel} onClick={onCancel}>
          <Icon icon={mdiClose} />
        </button>
        <div className="mh-voice-bar__wave" aria-hidden="true">
          {levels.map((v, i) => (
            <span key={i} className="mh-voice-bar__bar" style={levelStyle('--_v', v)} />
          ))}
        </div>
        {status}
        <button type="button" className={cx(iconButtonClass('accent', 'medium', true), 'mh-voice-bar__done')} aria-label={doneLabel} title={doneLabel} disabled={busy} aria-busy={busy || undefined} onClick={onDone}>
          {busy ? (
            <span className={spinnerClass('small', true)} role="status">
              <span className="mh-visually-hidden">{doneLabel}</span>
            </span>
          ) : (
            <Icon icon={mdiCheck} />
          )}
        </button>
      </div>
    );
  }
  const tiles = [0, 1, 2, 3].map((i) => <span key={i} className="mh-voice-bar__tile" />);
  return (
    <div {...rest} className={cx(voiceBarClass(variant, phase), className)}>
      {leading !== null && leading !== undefined && leading !== false && <div className="mh-voice-bar__leading">{leading}</div>}
      {onTap ? (
        <button type="button" className="mh-voice-bar__mosaic" aria-label={text} style={levelStyle('--_level', level)} onClick={onTap}>
          {tiles}
        </button>
      ) : (
        <span className="mh-voice-bar__mosaic" aria-hidden="true" style={levelStyle('--_level', level)}>
          {tiles}
        </span>
      )}
      {status}
      <button type="button" className={cx(iconButtonClass('danger'), 'mh-voice-bar__end')} aria-label={endLabel} title={endLabel} onClick={onEnd}>
        <Icon icon={mdiPhoneHangup} />
      </button>
    </div>
  );
}

export interface NoticeProps {
  kind?: NoticeKind;
  title?: ReactNode;
  /** The message. */
  children?: ReactNode;
  icon?: IconName | string | false;
  points?: readonly ReactNode[];
  actions?: readonly NoticeAction[];
  /** A close button; default on for tips. The notice hides itself after `onDismiss`. */
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: () => void;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Same DOM and classes as `createNotice`. */
export function Notice({ kind = 'tip', title, children, icon, points, actions, dismissible, dismissLabel = 'Dismiss', onDismiss, headingLevel = 3, className }: NoticeProps) {
  const [dismissed, setDismissed] = useState(false);
  const titleId = useId();
  if (dismissed) return null;
  const dismiss = (): void => {
    onDismiss?.();
    setDismissed(true);
  };
  const Heading = `h${headingLevel}` as 'h3';
  const permission = kind === 'permission';
  const inner = (
    <>
      {icon !== false && (
        <span className="mh-notice__icon">
          <Icon icon={icon ?? NOTICE_ICONS[kind]} />
        </span>
      )}
      <div className="mh-notice__body">
        {title &&
          (permission ? (
            <Heading className="mh-notice__title" id={titleId}>
              {title}
            </Heading>
          ) : (
            <p className="mh-notice__title">{title}</p>
          ))}
        <p className="mh-notice__message">{children}</p>
        {points && points.length > 0 && (
          <ul className="mh-notice__points">
            {points.map((p, i) => (
              <li key={i} className="mh-notice__point">
                <Icon icon={mdiCheck} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
        {actions && actions.length > 0 && (
          <div className="mh-notice__actions">
            {actions.map((action, i) => {
              const { variant, size } = noticeActionStyle(kind, action.primary);
              return (
                <button
                  key={i}
                  type="button"
                  className={buttonClass(variant, size)}
                  onClick={() => {
                    action.onClick?.();
                    if (action.dismisses) dismiss();
                  }}
                >
                  <span className="mh-button__label">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {noticeDismissible(kind, dismissible) && (
        <button type="button" className="mh-notice__dismiss" aria-label={dismissLabel} title={dismissLabel} onClick={dismiss}>
          <Icon icon={mdiClose} />
        </button>
      )}
    </>
  );
  return permission ? (
    <section className={cx(noticeClass(kind), className)} aria-labelledby={title ? titleId : undefined}>
      {inner}
    </section>
  ) : (
    <div className={cx(noticeClass(kind), className)} role="note">
      {inner}
    </div>
  );
}

export interface RecordingPillProps {
  /** Seconds recorded so far. A new value resets the clock to it. */
  elapsed?: number;
  paused?: boolean;
  /** Count up once a second while not paused (default true). */
  ticking?: boolean;
  /** Input level, 0–1; each new value adds a bar to the waveform. */
  level?: number;
  label?: string;
  pausedLabel?: string;
  floating?: RecordingPillPlacement;
  /** Shows a pause / resume button; called with the state asked for. */
  onPauseToggle?: (paused: boolean) => void;
  pauseLabel?: string;
  resumeLabel?: string;
  /** Shows a stop button. */
  onStop?: () => void;
  stopLabel?: string;
  className?: string;
}

/** Same DOM and classes as `createRecordingPill`. `paused` is controlled by the parent through `onPauseToggle`. */
export function RecordingPill({
  elapsed = 0,
  paused = false,
  ticking = true,
  level,
  label = 'Recording',
  pausedLabel = 'Paused',
  floating,
  onPauseToggle,
  pauseLabel = 'Pause recording',
  resumeLabel = 'Resume recording',
  onStop,
  stopLabel = 'Stop recording',
  className,
}: RecordingPillProps) {
  const [seconds, setSeconds] = useState(Math.max(0, elapsed));
  const [seenElapsed, setSeenElapsed] = useState(elapsed);
  if (elapsed !== seenElapsed) {
    setSeenElapsed(elapsed);
    setSeconds(Math.max(0, elapsed));
  }
  const [levels, setLevels] = useState(() => (level === undefined ? emptyRecordingLevels() : pushRecordingLevel(emptyRecordingLevels(), level)));
  const [seenLevel, setSeenLevel] = useState(level);
  if (level !== seenLevel) {
    setSeenLevel(level);
    setLevels((old) => pushRecordingLevel(old, level));
  }
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;
  useEffect(() => {
    if (paused || !ticking) return;
    const anchor = Date.now() - secondsRef.current * 1000;
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - anchor) / 1000)), 250);
    return () => clearInterval(timer);
  }, [paused, ticking, seenElapsed]);
  const pauseText = paused ? resumeLabel : pauseLabel;
  return (
    <div className={cx(recordingPillClass(paused, floating), className)} role="group" aria-label={label}>
      <span className="mh-recording-pill__dot" aria-hidden="true" />
      <span className="mh-recording-pill__status mh-visually-hidden" aria-live="polite">
        {paused ? pausedLabel : label}
      </span>
      <time className="mh-recording-pill__timer" role="timer" dateTime={elapsedDuration(seconds)}>
        {formatElapsed(seconds)}
      </time>
      <span className="mh-recording-pill__wave" aria-hidden="true">
        {levels.map((v, i) => (
          <span key={i} className="mh-recording-pill__bar" style={levelStyle('--_v', v)} />
        ))}
      </span>
      {onPauseToggle && (
        <button type="button" className={cx(iconButtonClass('default', 'small'), 'mh-recording-pill__pause')} aria-label={pauseText} title={pauseText} onClick={() => onPauseToggle(!paused)}>
          <Icon icon={paused ? mdiMicrophone : mdiPause} />
        </button>
      )}
      {onStop && (
        <button type="button" className={cx(iconButtonClass('default', 'small'), 'mh-recording-pill__stop')} aria-label={stopLabel} title={stopLabel} onClick={onStop}>
          <Icon icon={mdiStop} />
        </button>
      )}
    </div>
  );
}
