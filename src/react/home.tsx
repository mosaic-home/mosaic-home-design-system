// home group: React bindings. Same DOM and classes as the web renderer.
// The controls (control card, thermostat, light, position, lock) live in home-controls.tsx.
export * from './home-controls.tsx';
export * from './home-climate-energy.tsx';
export * from './home-security.tsx';
export * from './home-rooms.tsx';
export * from './home-media-voice.tsx';
export * from './home-info.tsx';
import { mdiCameraOutline, mdiMusic, mdiSkipNext, mdiSkipPrevious, mdiStop, mdiVolumeHigh, mdiVolumeOff } from '@mdi/js';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { sliderPosition } from '../web/choice-inputs/slider.ts';
import { cx } from '../web/dom.ts';
import { AGENDA_LABELS, agendaChipClass, agendaEventClass, agendaView, type AgendaOptions } from '../web/home/agenda.ts';
import { CAMERA_AGE_TICK_MS, cameraAgeText, cameraTileAspect, cameraTileClass, watchCameraRefresh, type CameraTileOptions } from '../web/home/cameraTile.ts';
import { formatMediaTime, mediaPlayerArtClass, mediaPlayerBannerClass, mediaPlayerButtonClass, mediaPlayerClass, mediaPlayerLevelClass, mediaPlayerMainIcon, mediaPlayerView, mediaTimeText, type MediaPlayerOptions } from '../web/home/mediaPlayer.ts';
import { formatTemperature, weatherIcon, weatherIconClass } from '../web/home/weather.ts';
import { weatherNowText, type WeatherNowOptions } from '../web/home/weatherNow.ts';
import { Icon } from './foundations.tsx';

// Weather now --------------------------------------------------------------------------------------------------

export interface WeatherNowProps extends WeatherNowOptions {
  className?: string;
}

/** Same DOM and classes as `createWeatherNow`. */
export function WeatherNow({ condition, temperature, unit, text, detail, place, className }: WeatherNowProps) {
  const word = weatherNowText({ condition, text });
  const where = place?.trim();
  const more = detail?.trim();
  return (
    <div className={cx('mh-weather-now', className)}>
      {where && <div className="mh-weather-now__place">{where}</div>}
      <div className="mh-weather-now__reading">
        <Icon icon={weatherIcon(condition)} className={weatherIconClass(condition, 'mh-weather-now__icon')} />
        <div className="mh-weather-now__temperature">{formatTemperature(temperature, unit)}</div>
      </div>
      <div className="mh-weather-now__text">
        {word && <div className="mh-weather-now__condition">{word}</div>}
        {more && <div className="mh-weather-now__detail">{more}</div>}
      </div>
    </div>
  );
}

// Agenda -------------------------------------------------------------------------------------------------------

export interface AgendaProps extends AgendaOptions {
  className?: string;
}

/** Same DOM and classes as `createAgenda`. */
export function Agenda({ days, empty = 'Nothing planned', max, headingLevel = 3, labels, className }: AgendaProps) {
  const L = { ...AGENDA_LABELS, ...labels };
  const view = agendaView(days, max);
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={cx('mh-agenda', className)}>
      {view.days.map((day, d) => (
        <div key={d} className="mh-agenda__day">
          <Heading className="mh-agenda__day-label">{day.label}</Heading>
          {day.allDay.length > 0 && (
            <ul className="mh-agenda__chips" role="list">
              {day.allDay.map((e, i) => (
                <li key={i} className={agendaChipClass(e.color)}>
                  <span className="mh-visually-hidden">{`${L.allDay}: `}</span>
                  {e.title}
                </li>
              ))}
            </ul>
          )}
          {day.timed.length > 0 && (
            <ul className="mh-agenda__events" role="list">
              {day.timed.map((e, i) => (
                <li key={i} className={agendaEventClass(e.color)}>
                  <span className="mh-agenda__bar" aria-hidden="true" />
                  <span className="mh-agenda__time">
                    <span className="mh-agenda__start">{e.time ?? ''}</span>
                    {e.end && <span className="mh-visually-hidden">{` ${L.to} `}</span>}
                    {e.end && <span className="mh-agenda__end">{e.end}</span>}
                  </span>
                  <span className="mh-agenda__body">
                    <span className="mh-agenda__title">{e.title}</span>
                    {e.location && <span className="mh-agenda__location">{e.location}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {view.days.length === 0 && <p className="mh-agenda__empty">{empty}</p>}
      {view.hidden > 0 && <p className="mh-agenda__more">{L.more(view.hidden)}</p>}
    </div>
  );
}

// Camera tile --------------------------------------------------------------------------------------------------

export interface CameraTileProps extends Omit<CameraTileOptions, 'action'> {
  /** A control in the caption row (a button). */
  action?: ReactNode;
  className?: string;
}

/** Same DOM and classes as `createCameraTile`; refreshes with the same off-screen loading and visibility rules. */
export function CameraTile({ src, name, status, refreshEvery, aspect, action, caption = true, onOpen, updated, className }: CameraTileProps) {
  const ref = useRef<HTMLElement>(null);
  // The latest refreshed frame of this `src`, and a `src` whose picture failed to load.
  const [frame, setFrame] = useState<{ src: string; url: string } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  // When the last frame arrived, and a clock that redraws its age label.
  const [frameAt, setFrameAt] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const showAge = !!updated && frameAt !== null && !!src && failed !== src;
  useEffect(() => {
    if (!showAge) return;
    const timer = setInterval(() => setTick((n) => n + 1), CAMERA_AGE_TICK_MS);
    return () => clearInterval(timer);
  }, [showAge]);
  useEffect(() => {
    if (!ref.current || !src) return;
    const refresher = watchCameraRefresh(ref.current, src, refreshEvery, (url) => {
      setFrame({ src, url });
      setFailed(null);
    });
    return () => refresher.stop();
  }, [src, refreshEvery]);
  const has = !!src && failed !== src;
  const url = src && frame?.src === src ? frame.url : src;
  const st = status?.trim();
  return (
    <figure ref={ref} className={cx(cameraTileClass(has, !!onOpen), className)}>
      <div
        className="mh-camera-tile__frame"
        style={{ aspectRatio: cameraTileAspect(aspect) }}
        role={onOpen ? 'button' : undefined}
        tabIndex={onOpen ? 0 : undefined}
        aria-label={onOpen ? name : undefined}
        onClick={onOpen ? () => onOpen() : undefined}
        onKeyDown={
          onOpen
            ? (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                onOpen();
              }
            : undefined
        }
      >
        <span className="mh-camera-tile__placeholder" aria-hidden="true">
          <Icon icon={mdiCameraOutline} />
        </span>
        {has && url && (
          <img
            className="mh-camera-tile__image"
            src={url}
            alt={name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(src)}
            onLoad={() => setFrameAt(Date.now())}
          />
        )}
        {showAge && <span className="mh-camera-tile__updated">{cameraAgeText(frameAt!)}</span>}
      </div>
      {caption && (
        <figcaption className="mh-camera-tile__caption">
          <span className="mh-camera-tile__text">
            <span className="mh-camera-tile__name">{name}</span>
            {st && <span className="mh-camera-tile__status">{st}</span>}
          </span>
          {action && <span className="mh-camera-tile__action">{action}</span>}
        </figcaption>
      )}
    </figure>
  );
}

// Media player -------------------------------------------------------------------------------------------------

interface CommitRangeProps {
  className: string;
  label: string;
  max: number;
  /** The value from the data; a drag shows its own value until the data catches up. */
  value: number;
  valueText: (value: number) => string;
  disabled?: boolean;
  onCommit: (value: number) => void;
  /** The value shown right now (while dragging, the drag's), for a visible label beside the range. */
  onShown?: (value: number) => void;
}

/** A themed native range that commits on release (the native `change` event). */
function CommitRange({ className, label, max, value, valueText, disabled, onCommit, onShown }: CommitRangeProps) {
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
  useEffect(() => {
    onShown?.(shown);
  }, [shown, onShown]);
  return (
    <div className={className}>
      <input
        ref={ref}
        type="range"
        className="mh-slider__input"
        min={0}
        max={max}
        step={1}
        value={shown}
        disabled={disabled}
        aria-label={label}
        aria-valuetext={valueText(shown)}
        style={{ '--_at': sliderPosition(shown, 0, max) } as CSSProperties}
        onChange={(e) => setDrag({ value: Number(e.currentTarget.value), base: value, active: true })}
      />
    </div>
  );
}

export interface MediaPlayerProps extends MediaPlayerOptions {
  className?: string;
}

/** Same DOM and classes as `createMediaPlayer`. */
export function MediaPlayer(props: MediaPlayerProps) {
  const { className, onPlay, onPause, onStop, onNext, onPrevious, onVolume, onMute, onSeek } = props;
  const v = mediaPlayerView(props);
  const L = v.labels;
  const [failedArt, setFailedArt] = useState<string | null>(null);
  const [seekShown, setSeekShown] = useState<number | null>(null);
  const [levelShown, setLevelShown] = useState<number | null>(null);
  const hasArt = !!v.art && failedArt !== v.art;
  const asBanner = v.banner && hasArt;
  const p = v.progress;
  const button = (part: 'previous' | 'stop' | 'next', icon: string, onClick: (() => void) | undefined) => (
    <button type="button" className={mediaPlayerButtonClass(part)} aria-label={L[part]} title={L[part]} onClick={() => onClick?.()}>
      <Icon icon={icon} />
    </button>
  );
  return (
    <div className={cx(mediaPlayerClass(v, asBanner), className)} role="group" aria-label={v.label}>
      {asBanner && (
        <div className={mediaPlayerBannerClass(v.artShape)} aria-hidden="true">
          {v.artShape === 'square' && (
            <img className="mh-media-player__banner-backdrop" src={v.art ?? undefined} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedArt(v.art)} />
          )}
          <img className="mh-media-player__banner-image" src={v.art ?? undefined} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedArt(v.art)} />
        </div>
      )}
      <div className="mh-media-player__row">
        {!asBanner && (
          <div className={mediaPlayerArtClass(hasArt)} aria-hidden="true">
            <span className="mh-media-player__placeholder">
              <Icon icon={mdiMusic} />
            </span>
            {hasArt && (
              <img className="mh-media-player__image" src={v.art ?? undefined} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailedArt(v.art)} />
            )}
          </div>
        )}
        <div className="mh-media-player__text">
          <div className="mh-media-player__title">{v.title}</div>
          {v.subtitle && <div className="mh-media-player__subtitle">{v.subtitle}</div>}
          <span className="mh-visually-hidden">{v.stateText}</span>
        </div>
        {v.transport && (
          <div className="mh-media-player__transport" role="group" aria-label={L.playback}>
            {v.previous && button('previous', mdiSkipPrevious, onPrevious)}
            {v.main && (
              <button
                type="button"
                className={mediaPlayerButtonClass('main')}
                aria-label={L[v.main]}
                title={L[v.main]}
                onClick={() => (v.main === 'pause' ? onPause?.() : onPlay?.())}
              >
                <Icon icon={mediaPlayerMainIcon(v.main)} />
              </button>
            )}
            {v.stop && button('stop', mdiStop, onStop)}
            {v.next && button('next', mdiSkipNext, onNext)}
          </div>
        )}
      </div>
      {p && !v.seek && (
        <div
          className="mh-media-player__progress"
          role="progressbar"
          aria-label={L.progress}
          aria-valuemin={0}
          aria-valuemax={Math.round(p.duration)}
          aria-valuenow={Math.round(p.position)}
          aria-valuetext={p.text}
          style={{ '--_at': p.at } as CSSProperties}
        >
          <span className="mh-media-player__progress-fill" />
        </div>
      )}
      {p && v.seek && (
        <CommitRange
          className="mh-slider mh-media-player__seek"
          label={L.seek}
          max={Math.round(p.duration)}
          value={Math.round(p.position)}
          valueText={(s) => mediaTimeText(s, p.duration, L)}
          onCommit={(s) => onSeek?.(s)}
          onShown={setSeekShown}
        />
      )}
      {p && (
        <div className="mh-media-player__times" aria-hidden="true">
          <span className="mh-media-player__elapsed">{v.seek && seekShown !== null ? formatMediaTime(seekShown) : p.elapsed}</span>
          <span className="mh-media-player__total">{p.total}</span>
        </div>
      )}
      {(v.mute || v.volume) && (
        <div className="mh-media-player__volume">
          {v.mute && (
            <button type="button" className={mediaPlayerButtonClass('mute')} aria-label={L.mute} title={L.mute} aria-pressed={v.muted} onClick={() => onMute?.(!v.muted)}>
              <Icon icon={v.muted ? mdiVolumeOff : mdiVolumeHigh} />
            </button>
          )}
          {v.volume && (
            <CommitRange
              className={mediaPlayerLevelClass(v.muted)}
              label={L.volume}
              max={100}
              value={v.level ?? 0}
              valueText={(n) => `${n}%`}
              disabled={v.level === null}
              onCommit={(n) => onVolume?.(n / 100)}
              onShown={setLevelShown}
            />
          )}
          {v.volume && v.levelText && (
            <span className="mh-media-player__level-value" aria-hidden="true">
              {levelShown !== null ? `${levelShown}%` : v.levelText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
