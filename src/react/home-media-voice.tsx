// React bindings for the home group: Timers, media and voice: timer, speaker selector, TV remote, up next, voice ring, assist reply.
import { mdiCheck, mdiClose, mdiMicrophone, mdiPause, mdiPlay, mdiVolumeHigh, mdiVolumeOff } from '@mdi/js';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { sliderPosition } from '../web/choice-inputs/slider.ts';
import { cx } from '../web/dom.ts';
import {
  ASSIST_REPLY_UNDO_ICON,
  assistReplyUndoClass,
  assistReplyView,
  type AssistReplyOptions,
} from '../web/home/media-voice/assistReply.ts';
import { speakerSelectorLevelClass, speakerSelectorMuteClass, speakerSelectorView, type SpeakerSelectorOptions } from '../web/home/media-voice/speakerSelector.ts';
import {
  timerAnnouncement,
  timerButtonClass,
  timerGlyph,
  timerNextTick,
  timerState,
  timerStates,
  timerView,
  type TimerOptions,
  type TimerState,
} from '../web/home/media-voice/timer.ts';
import {
  createTvRemoteRepeater,
  tvRemoteArrowKey,
  tvRemoteKeyClass,
  tvRemoteKeyIcon,
  tvRemoteRocker,
  tvRemoteSourceClass,
  tvRemoteView,
  type TvRemoteKey,
  type TvRemoteOptions,
} from '../web/home/media-voice/tvRemote.ts';
import { upNextArtClass, upNextButtonClass, upNextFocusAfterRemove, upNextView, type UpNextOptions } from '../web/home/media-voice/upNext.ts';
import { voiceRingClass, voiceRingIcon, voiceRingText, type VoiceRingOptions } from '../web/home/media-voice/voiceRing.ts';
import { voiceLevel } from '../web/feedback/voiceBar.ts';
import { Icon } from './foundations.tsx';

// Timer ------------------------------------------------------------------------------------------------------

export interface TimerProps extends TimerOptions {
  className?: string;
}

/** Same DOM and classes as `createTimer`: redraws itself from the end times once a second and when the page wakes. */
export function Timer(props: TimerProps) {
  const { timers, className, onPause, onResume, onAdd, onCancel, onStop, onFinish } = props;
  const clock = props.now ?? Date.now;
  const [, setTick] = useState(0);
  const at = clock();
  const view = timerView(props, at);

  // The next redraw: when a shown time changes.
  useEffect(() => {
    const wait = timerNextTick(timers, at);
    if (wait === null) return;
    const t = setTimeout(() => setTick((n) => n + 1), wait);
    return () => clearTimeout(t);
  });
  useEffect(() => {
    const wake = (): void => {
      if (document.visibilityState === 'visible') setTick((n) => n + 1);
    };
    document.addEventListener('visibilitychange', wake);
    return () => document.removeEventListener('visibilitychange', wake);
  }, []);

  // What the live region says, and the timers that ran out here.
  const before = useRef<Record<string, TimerState> | null>(null);
  const finishedHere = useRef(new Set<string>());
  // The region's text is written here, not rendered, so a repeated message is not lost to an unchanged render.
  const live = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const text = timerAnnouncement(before.current, view);
    if (text && live.current) live.current.textContent = text;
    before.current = timerStates(view);
    for (const t of timers) {
      if (t.state === 'running' && timerState(t, at) === 'finished') {
        if (!finishedHere.current.has(t.id)) {
          finishedHere.current.add(t.id);
          onFinish?.(t.id);
        }
      } else finishedHere.current.delete(t.id);
    }
  });

  const L = view.labels;
  return (
    <div className={cx('mh-timer', className)} role="group" aria-label={view.label}>
      {view.items.length ? (
        <ul className="mh-timer__list">
          {view.items.map((v) => {
            const glyph = timerGlyph(v.state);
            return (
              <li key={v.id} className={v.className} style={{ '--_left': v.fraction } as CSSProperties}>
                <span className="mh-timer__dial" aria-hidden="true">
                  <svg className="mh-timer__ring" viewBox="0 0 40 40">
                    <circle className="mh-timer__track" cx="20" cy="20" r="17" pathLength={100} />
                    <circle className="mh-timer__arc" cx="20" cy="20" r="17" pathLength={100} />
                  </svg>
                  <span className="mh-timer__glyph">{glyph && <Icon icon={glyph} />}</span>
                </span>
                <div className="mh-timer__text">
                  <span className="mh-timer__name">{v.name}</span>
                  <span className="mh-timer__time" role="timer">
                    {v.time}
                  </span>
                  <span className="mh-timer__state">{v.stateText}</span>
                </div>
                <div className="mh-timer__actions" role="group" aria-label={v.name}>
                  {v.main && (
                    <button
                      type="button"
                      className={timerButtonClass('main')}
                      aria-label={v.mainLabel}
                      title={v.mainLabel}
                      onClick={() => (v.main === 'pause' ? onPause?.(v.id) : onResume?.(v.id))}
                    >
                      <Icon icon={v.main === 'pause' ? mdiPause : mdiPlay} />
                    </button>
                  )}
                  <button type="button" className={timerButtonClass('add')} aria-label={v.addLabel} title={v.addLabel} onClick={() => onAdd?.(v.id, view.addStep)}>
                    <span className="mh-button__label">{v.addText}</span>
                  </button>
                  {v.state === 'finished' ? (
                    <button type="button" className={timerButtonClass('stop')} aria-label={v.stopLabel} title={v.stopLabel} onClick={() => (onStop ?? onCancel)?.(v.id)}>
                      <span className="mh-button__label">{L.stopText}</span>
                    </button>
                  ) : (
                    <button type="button" className={timerButtonClass('cancel')} aria-label={v.cancelLabel} title={v.cancelLabel} onClick={() => onCancel?.(v.id)}>
                      <Icon icon={mdiClose} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mh-timer__empty">{L.empty}</p>
      )}
      <div ref={live} className="mh-visually-hidden mh-timer__announce" aria-live="polite" />
    </div>
  );
}

// A themed range that commits on release ---------------------------------------------------------------------

interface ReleaseRangeProps {
  className: string;
  label: string;
  /** 0 to 100 from the data; a drag shows its own value until the data catches up. */
  value: number;
  disabled?: boolean;
  onCommit: (value: number) => void;
}

function ReleaseRange({ className, label, value, disabled, onCommit }: ReleaseRangeProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState<{ value: number; base: number; active: boolean } | null>(null);
  const latest = useRef({ value, onCommit });
  useEffect(() => {
    latest.current = { value, onCommit };
  });
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const commit = (): void => {
      const v = Number(input.value);
      setDrag({ value: v, base: latest.current.value, active: false });
      latest.current.onCommit(v);
    };
    input.addEventListener('change', commit);
    return () => input.removeEventListener('change', commit);
  }, []);
  const shown = drag && (drag.active || drag.base === value) ? drag.value : value;
  return (
    <div className={className}>
      <input
        ref={ref}
        type="range"
        className="mh-slider__input"
        min={0}
        max={100}
        step={1}
        value={shown}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={`${shown}%`}
        style={{ '--_at': sliderPosition(shown) } as CSSProperties}
        onChange={(e) => setDrag({ value: Number(e.currentTarget.value), base: value, active: true })}
      />
    </div>
  );
}

// Speaker selector -------------------------------------------------------------------------------------------

export interface SpeakerSelectorProps extends SpeakerSelectorOptions {
  className?: string;
}

/** Same DOM and classes as `createSpeakerSelector`. The picks are controlled by `speakers`. */
export function SpeakerSelector(props: SpeakerSelectorProps) {
  const { className, onSelect, onVolume, onMute } = props;
  const v = speakerSelectorView(props);
  const group = useId();
  return (
    <fieldset className={cx('mh-speaker-selector', className)}>
      <legend className="mh-visually-hidden">{v.label}</legend>
      {v.speakers.length ? (
        <ul className="mh-speaker-selector__list">
          {v.speakers.map((s) => (
            <li key={s.id} className={s.className}>
              <label className="mh-speaker-selector__pick">
                <span className="mh-speaker-selector__badge">
                  <Icon icon={s.icon} />
                </span>
                <span className="mh-speaker-selector__text">
                  <span className="mh-speaker-selector__name">{s.name}</span>
                  {s.detail && <span className="mh-speaker-selector__detail">{s.detail}</span>}
                </span>
                {s.playing && (
                  <span className="mh-speaker-selector__bars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                )}
                {v.multiple ? (
                  <span className="mh-checkbox__control">
                    <input
                      type="checkbox"
                      className="mh-checkbox__input mh-speaker-selector__input"
                      checked={s.selected}
                      disabled={s.unavailable}
                      onChange={(e) => onSelect?.(s.id, e.currentTarget.checked)}
                    />
                    <Icon icon={mdiCheck} className="mh-checkbox__check" />
                  </span>
                ) : (
                  <span className="mh-radio__control">
                    <input
                      type="radio"
                      name={group}
                      className="mh-radio__input mh-speaker-selector__input"
                      checked={s.selected}
                      disabled={s.unavailable}
                      onChange={(e) => {
                        if (e.currentTarget.checked) onSelect?.(s.id, true);
                      }}
                    />
                    <span className="mh-radio__dot" />
                  </span>
                )}
              </label>
              {(s.mute || s.volume) && (
                <div className="mh-speaker-selector__volume">
                  {s.mute && (
                    <button type="button" className={speakerSelectorMuteClass()} aria-label={s.muteLabel} title={s.muteLabel} aria-pressed={s.muted} onClick={() => onMute?.(s.id, !s.muted)}>
                      <Icon icon={s.muted ? mdiVolumeOff : mdiVolumeHigh} />
                    </button>
                  )}
                  {s.volume && (
                    <ReleaseRange className={speakerSelectorLevelClass(s.muted)} label={s.volumeLabel} value={s.level ?? 0} disabled={s.level === null} onCommit={(n) => onVolume?.(s.id, n / 100)} />
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mh-speaker-selector__empty">{v.labels.empty}</p>
      )}
    </fieldset>
  );
}

// TV remote --------------------------------------------------------------------------------------------------

export interface TvRemoteProps extends TvRemoteOptions {
  className?: string;
}

/** Same DOM and classes as `createTvRemote`. Direction, volume and channel keys repeat while held. */
export function TvRemote(props: TvRemoteProps) {
  const { className } = props;
  const v = tvRemoteView(props);
  const L = v.labels;
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  });
  const [repeater] = useState(() =>
    createTvRemoteRepeater((key) => {
      if (!latest.current.disabled) latest.current.onKey?.(key);
    }),
  );
  useEffect(() => () => repeater.up(), [repeater]);
  const send = (key: TvRemoteKey): void => {
    if (!v.disabled) props.onKey?.(key);
  };

  const key = (k: TvRemoteKey) => {
    const icon = tvRemoteKeyIcon(k);
    const up = (): void => repeater.up();
    return (
      <button
        key={k}
        type="button"
        className={tvRemoteKeyClass(k)}
        aria-label={L[k]}
        title={L[k]}
        aria-pressed={k === 'mute' ? v.muted : undefined}
        disabled={v.disabled}
        onPointerDown={(e: PointerEvent<HTMLButtonElement>) => {
          if (e.button === 0 && !e.currentTarget.disabled) repeater.down(k);
        }}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        onClick={(e) => {
          if (e.detail === 0) send(k);
        }}
      >
        {icon ? <Icon icon={icon} /> : <span className="mh-tv-remote__ok-text">{L[k]}</span>}
      </button>
    );
  };
  const rocker = (keys: TvRemoteKey[], name: string, short: string) => (
    <div className="mh-tv-remote__rocker" role="group" aria-label={name}>
      {tvRemoteRocker(keys).map((k) =>
        k === null ? (
          <span key="label" className="mh-tv-remote__rocker-label" aria-hidden="true">
            {short}
          </span>
        ) : (
          key(k)
        ),
      )}
    </div>
  );
  const onPadKey = (e: KeyboardEvent<HTMLDivElement>): void => {
    const dir = tvRemoteArrowKey(e.key);
    if (!dir || !v.pad.includes(dir)) return;
    e.preventDefault();
    send(dir);
  };

  return (
    <div className={cx('mh-tv-remote', v.disabled && 'is-disabled', className)} role="group" aria-label={v.label}>
      {v.top.length > 0 && <div className="mh-tv-remote__top">{v.top.map(key)}</div>}
      {v.pad.length > 0 && (
        <div className="mh-tv-remote__pad" role="group" aria-label={L.navigation} onKeyDown={onPadKey}>
          {v.pad.map(key)}
        </div>
      )}
      {v.nav.length > 0 && <div className="mh-tv-remote__nav">{v.nav.map(key)}</div>}
      {(v.volume.length > 0 || v.channel.length > 0) && (
        <div className="mh-tv-remote__rockers">
          {v.volume.length > 0 && rocker(v.volume, L.volume, L.volumeShort)}
          {v.channel.length > 0 && rocker(v.channel, L.channel, L.channelShort)}
        </div>
      )}
      {v.sources.length > 0 && (
        <div className="mh-tv-remote__sources" role="group" aria-label={L.sources}>
          {v.sources.map((s) => (
            <button key={s.id} type="button" className={tvRemoteSourceClass(!!s.active)} aria-pressed={!!s.active} disabled={v.disabled} onClick={() => props.onSource?.(s.id)}>
              {s.icon && <Icon icon={s.icon} />}
              <span className="mh-button__label">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Up next ----------------------------------------------------------------------------------------------------

export interface UpNextProps extends UpNextOptions {
  className?: string;
}

/** Same DOM and classes as `createUpNext`, including where the focus goes when a focused item is removed. */
export function UpNext(props: UpNextProps) {
  const { className, onPlay, onRemove } = props;
  const v = upNextView(props);
  const [failed, setFailed] = useState<Record<string, string>>({});
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<string, { play: HTMLButtonElement | null; remove: HTMLButtonElement | null }>());
  const focus = useRef<{ id: string; part: 'play' | 'remove' } | null>(null);
  const order = useRef<string[]>([]);

  useLayoutEffect(() => {
    const ids = v.items.map((i) => i.id);
    const was = focus.current;
    if (was && !ids.includes(was.id)) {
      const lost = order.current.indexOf(was.id);
      const before = order.current.slice(0, Math.max(0, lost)).filter((id) => ids.includes(id)).length;
      const to = upNextFocusAfterRemove(before, ids.length);
      const target = to < 0 ? undefined : buttons.current.get(ids[to]!);
      const button = target ? (was.part === 'remove' && onRemove ? target.remove : target.play) : null;
      focus.current = null;
      (button ?? root.current)?.focus();
    }
    order.current = ids;
  });

  const ref = (id: string, part: 'play' | 'remove') => (b: HTMLButtonElement | null) => {
    const entry = buttons.current.get(id) ?? { play: null, remove: null };
    entry[part] = b;
    if (!entry.play && !entry.remove) buttons.current.delete(id);
    else buttons.current.set(id, entry);
  };

  return (
    <div ref={root} className={cx('mh-up-next', className)} role="group" aria-label={v.label} tabIndex={-1}>
      {v.items.length ? (
        <ol className="mh-up-next__list">
          {v.items.map((item) => {
            const has = !!item.art && failed[item.id] !== item.art;
            return (
              <li
                key={item.id}
                className="mh-up-next__item"
                onFocus={(e) => {
                  const part = e.target.classList.contains('mh-up-next__remove') ? 'remove' : 'play';
                  focus.current = { id: item.id, part };
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null) && e.relatedTarget) focus.current = null;
                }}
              >
                <div className={upNextArtClass(has)} aria-hidden="true">
                  <span className="mh-up-next__placeholder">
                    <Icon icon={item.icon} />
                  </span>
                  {has && (
                    <img
                      className="mh-up-next__image"
                      src={item.art ?? undefined}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() => setFailed((f) => ({ ...f, [item.id]: item.art ?? '' }))}
                    />
                  )}
                </div>
                <div className="mh-up-next__text">
                  <div className="mh-up-next__title">{item.title}</div>
                  {item.subtitle && <div className="mh-up-next__subtitle">{item.subtitle}</div>}
                </div>
                {item.duration && <span className="mh-up-next__duration">{item.duration}</span>}
                <button ref={ref(item.id, 'play')} type="button" className={upNextButtonClass('play')} aria-label={item.playLabel} title={item.playLabel} onClick={() => onPlay?.(item.id)}>
                  <Icon icon={mdiPlay} />
                </button>
                {onRemove && (
                  <button ref={ref(item.id, 'remove')} type="button" className={upNextButtonClass('remove')} aria-label={item.removeLabel} title={item.removeLabel} onClick={() => onRemove(item.id)}>
                    <Icon icon={mdiClose} />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mh-up-next__empty">{v.labels.empty}</p>
      )}
      {v.more && <p className="mh-up-next__more">{v.more}</p>}
    </div>
  );
}

// Voice ring -------------------------------------------------------------------------------------------------

export interface VoiceRingProps extends VoiceRingOptions {
  className?: string;
}

/** Same DOM and classes as `createVoiceRing`. */
export function VoiceRing({ phase = 'idle', level, label, detail, size = 'large', onTap, className }: VoiceRingProps) {
  const text = voiceRingText(phase, label, !!onTap);
  const style = { '--_level': voiceLevel(level ?? 0) } as CSSProperties;
  const parts = (
    <>
      <span className="mh-voice-ring__halo" />
      <span className="mh-voice-ring__band" />
      <span className="mh-voice-ring__core">
        <Icon icon={voiceRingIcon(phase)} />
      </span>
    </>
  );
  const more = detail?.trim();
  return (
    <div className={cx(voiceRingClass(phase, size), className)}>
      {onTap ? (
        <button type="button" className="mh-voice-ring__ring" aria-label={text} style={style} onClick={() => onTap()}>
          {parts}
        </button>
      ) : (
        <span className="mh-voice-ring__ring" aria-hidden="true" style={style}>
          {parts}
        </span>
      )}
      <p className="mh-voice-ring__label" aria-live="polite">
        {text}
      </p>
      {more && <p className="mh-voice-ring__detail">{more}</p>}
    </div>
  );
}

// Assist reply -----------------------------------------------------------------------------------------------

export interface AssistReplyProps extends AssistReplyOptions {
  className?: string;
}

/** Same DOM and classes as `createAssistReply`. */
export function AssistReply(props: AssistReplyProps) {
  const { className, onUndo } = props;
  const v = assistReplyView({ ...props, canUndo: !!onUndo });
  const L = v.labels;
  const root = useRef<HTMLDivElement>(null);
  const undoFocused = useRef(false);
  useLayoutEffect(() => {
    if (v.undo === 'done' && undoFocused.current) {
      undoFocused.current = false;
      root.current?.focus();
    }
  });
  return (
    <div ref={root} className={cx(v.className, className)} role="group" aria-label={v.label} tabIndex={-1}>
      {v.heard && (
        <p className="mh-assist-reply__heard">
          <Icon icon={mdiMicrophone} />
          <span className="mh-visually-hidden">{`${L.heard}: `}</span>
          <span className="mh-assist-reply__heard-text">{v.heard}</span>
        </p>
      )}
      <p className="mh-assist-reply__reply" aria-live="polite">
        {v.reply}
      </p>
      {v.changes.length > 0 && (
        <ul className="mh-assist-reply__changes" aria-label={L.changes}>
          {v.changes.map((c) => (
            <li key={c.key} className={c.className}>
              <span className="mh-assist-reply__badge">
                <Icon icon={c.icon} />
              </span>
              <span className="mh-assist-reply__text">
                <span className="mh-assist-reply__name">{c.name}</span>
                {c.state && <span className="mh-assist-reply__state">{c.state}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {v.undo && (
        <div className="mh-assist-reply__footer">
          {v.undo === 'button' ? (
            <button
              type="button"
              className={assistReplyUndoClass(v.undoing)}
              disabled={v.undoing}
              aria-busy={v.undoing || undefined}
              onFocus={() => (undoFocused.current = true)}
              onBlur={(e) => {
                if (e.relatedTarget) undoFocused.current = false;
              }}
              onClick={() => onUndo?.()}
            >
              <Icon icon={ASSIST_REPLY_UNDO_ICON} />
              <span className="mh-button__label">{L.undo}</span>
            </button>
          ) : (
            <p className="mh-assist-reply__undone">
              <Icon icon={mdiCheck} />
              <span>{L.undone}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
