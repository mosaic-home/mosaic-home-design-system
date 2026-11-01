// React bindings for the home group: Rooms, lights and appliances: room card, scenes, light groups, floor plan, vacuum, appliance cycle, irrigation.
// Same DOM and classes as the web renderer.
import { mdiCheck, mdiCheckCircleOutline, mdiChevronDown, mdiPause, mdiPlay } from '@mdi/js';
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { formatBrightness } from '../web/home/lightControl.ts';
import {
  APPLIANCE_CYCLE_LABELS,
  APPLIANCE_ICON,
  applianceCycleClass,
  applianceProgress,
  applianceStageClass,
  applianceStages,
  applianceStateText,
  formatApplianceTime,
  type ApplianceCycleLabels,
  type ApplianceState,
} from '../web/home/rooms/applianceCycle.ts';
import {
  floorPlanBounds,
  floorPlanFocusVisible,
  floorPlanGlowId,
  floorPlanLabelStyle,
  floorPlanLevel,
  floorPlanMarkerClass,
  floorPlanMarkerLabel,
  floorPlanMove,
  floorPlanPercent,
  floorPlanPolygon,
  floorPlanRings,
  floorPlanRoomClass,
  floorPlanRoomLabel,
  floorPlanStops,
  floorPlanTabStop,
  floorPlanViewBox,
  type FloorPlanBounds,
  type FloorPlanMarker,
  type FloorPlanRoom,
  type FloorPlanStop,
} from '../web/home/rooms/floorPlan.ts';
import {
  IRRIGATION_ICON,
  IRRIGATION_RAIN_ICON,
  IRRIGATION_STOP_ICON,
  IRRIGATION_ZONES_LABELS,
  irrigationProgress,
  irrigationStateText,
  irrigationZoneClass,
  irrigationZonesClass,
  type IrrigationRun,
  type IrrigationZone,
  type IrrigationZonesLabels,
} from '../web/home/rooms/irrigationZones.ts';
import { LIGHT_GROUP_ICON, LIGHT_GROUP_LABELS, LIGHT_GROUP_SLIDER_CLASS, lightGroupClass, lightGroupState, type LightGroupLabels, type LightGroupMember } from '../web/home/rooms/lightGroup.ts';
import { ROOM_CARD_ICON, ROOM_CARD_LABELS, roomCardClimate, roomCardFactClass, roomCardFacts, roomCardToggleClass, type RoomCardLabels, type RoomToggle } from '../web/home/rooms/roomCard.ts';
import { SCENE_APPLIED_MS, SCENE_GRID_LABELS, sceneGridClass, sceneTileClass, sceneTileTag, type Scene, type SceneGridLabels } from '../web/home/rooms/sceneGrid.ts';
import {
  VACUUM_CONTROL_LABELS,
  VACUUM_ICON,
  vacuumBatteryClass,
  vacuumBatteryIcon,
  vacuumBatteryText,
  vacuumButtonClass,
  vacuumButtons,
  vacuumControlClass,
  vacuumStateText,
  type VacuumAction,
  type VacuumControlLabels,
  type VacuumRoom,
  type VacuumState,
} from '../web/home/rooms/vacuumControl.ts';
import { Button, IconButton } from './actions.tsx';
import { Chip, Switch } from './choice-inputs.tsx';
import { ProgressBar } from './feedback.tsx';
import { Icon } from './foundations.tsx';
import { ControlCard, HomeSlider, LightControl } from './home-controls.tsx';

// Room card ----------------------------------------------------------------------------------------------------

export interface RoomCardProps {
  name: string;
  icon?: IconName | string;
  temperature?: number | null;
  unit?: string;
  humidity?: number | null;
  lightsOn?: number | null;
  lightsTotal?: number | null;
  open?: number | null;
  toggles?: readonly RoomToggle[];
  labels?: Partial<RoomCardLabels>;
  unavailable?: boolean;
  onOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
  onToggle?: (id: string, on: boolean) => void;
  className?: string;
}

/** Same DOM and classes as `createRoomCard`. */
export function RoomCard(props: RoomCardProps) {
  const { name, icon = ROOM_CARD_ICON, toggles = [], unavailable, onOpen, onToggle, className } = props;
  const l = { ...ROOM_CARD_LABELS, ...props.labels };
  const facts = roomCardFacts(props, l);
  const body =
    facts.length || toggles.length ? (
      <div className="mh-room-card__body">
        {facts.length > 0 && (
          <ul className="mh-room-card__facts">
            {facts.map((f) => (
              <li key={f.kind} className={roomCardFactClass(f)}>
                <Icon icon={f.icon} />
                <span className="mh-room-card__fact-text">{f.text}</span>
              </li>
            ))}
          </ul>
        )}
        {toggles.length > 0 && (
          <div className="mh-room-card__toggles" role="group" aria-label={name}>
            {toggles.map((t) => (
              <button key={t.id} type="button" className={roomCardToggleClass(t)} aria-pressed={t.on} disabled={t.disabled} onClick={() => !unavailable && onToggle?.(t.id, !t.on)}>
                <Icon icon={t.icon} />
                <span className="mh-room-card__toggle-label">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    ) : null;
  return (
    <ControlCard title={name} icon={icon} state={roomCardClimate(props, l) || undefined} active={(props.lightsOn ?? 0) > 0} tone="warm" unavailable={unavailable} onOpen={onOpen} className={cx('mh-room-card', className)}>
      {body}
    </ControlCard>
  );
}

// Scene grid ---------------------------------------------------------------------------------------------------

export interface SceneGridProps {
  label?: string;
  scenes: readonly Scene[];
  active?: string | null;
  size?: 'compact' | 'regular' | 'large';
  labels?: Partial<SceneGridLabels>;
  appliedFor?: number;
  disabled?: boolean;
  onActivate?: (id: string) => void;
  className?: string;
}

/** Same DOM and classes as `createSceneGrid`. */
export function SceneGrid({ label = 'Scenes', scenes, active, size, labels, appliedFor = SCENE_APPLIED_MS, disabled, onActivate, className }: SceneGridProps) {
  const l = { ...SCENE_GRID_LABELS, ...labels };
  const [applied, setApplied] = useState<string | null>(null);
  // `presses` restarts the timer when the same tile is pressed again.
  const [said, setSaid] = useState({ text: '', presses: 0 });
  useEffect(() => {
    if (applied === null) return;
    const timer = setTimeout(() => setApplied(null), appliedFor);
    return () => clearTimeout(timer);
  }, [applied, appliedFor, said.presses]);
  const press = (s: Scene): void => {
    if (s.disabled || disabled) return;
    setApplied(s.id);
    setSaid({ text: l.announce(s.label), presses: said.presses + 1 });
    onActivate?.(s.id);
  };
  return (
    <div className={cx(sceneGridClass({ size, disabled }), className)} role="group" aria-label={label}>
      <ul className="mh-scene-grid__list" role="list">
        {scenes.map((s) => {
          const tag = sceneTileTag(s.id, active, applied, l);
          return (
            <li key={s.id} className="mh-scene-grid__item">
              <button type="button" className={sceneTileClass(active === s.id, applied === s.id)} aria-current={active === s.id ? 'true' : undefined} disabled={!!(s.disabled || disabled)} onClick={() => press(s)}>
                <span className="mh-scene-grid__icon">
                  <Icon icon={applied === s.id ? mdiCheck : s.icon} />
                </span>
                <span className="mh-scene-grid__text">
                  <span className="mh-scene-grid__label">{s.label}</span>
                  {s.description && <span className="mh-scene-grid__description">{s.description}</span>}
                </span>
                {tag && (
                  <span className="mh-scene-grid__tag" aria-hidden="true">
                    {tag}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <span className="mh-visually-hidden" aria-live="polite">
        {said.text}
      </span>
    </div>
  );
}

// Light group --------------------------------------------------------------------------------------------------

export interface LightGroupProps {
  name: string;
  icon?: IconName | string;
  members: readonly LightGroupMember[];
  /** Initially (or, when it changes, now) showing each member. */
  expanded?: boolean;
  labels?: Partial<LightGroupLabels>;
  unavailable?: boolean;
  onToggle?: (on: boolean) => void;
  onBrightness?: (value: number) => void;
  onMemberToggle?: (id: string, on: boolean) => void;
  onMemberBrightness?: (id: string, value: number) => void;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

/** Same DOM and classes as `createLightGroup`. */
export function LightGroup(props: LightGroupProps) {
  const { name, icon = LIGHT_GROUP_ICON, members, unavailable, className } = props;
  const l = { ...LIGHT_GROUP_LABELS, ...props.labels };
  const listId = useId();
  const [open, setOpen] = useState(!!props.expanded);
  const [seen, setSeen] = useState(props.expanded);
  if (seen !== props.expanded) {
    setSeen(props.expanded);
    setOpen(!!props.expanded);
  }
  const s = lightGroupState(members);
  return (
    <ControlCard
      title={name}
      icon={icon}
      state={l.summary(s.on, s.total, s.brightness)}
      active={s.on > 0}
      tone="warm"
      unavailable={unavailable}
      className={cx(lightGroupClass({ on: s.on > 0, expanded: open }), className)}
      control={<Switch aria-label={l.all(name)} checked={s.on > 0} disabled={!!unavailable || s.total === 0} onChange={(event) => props.onToggle?.(event.target.checked)} />}
    >
      {(s.dims || members.length > 0) && (
        <div className="mh-light-group__body">
          {s.dims && (
            <HomeSlider key={l.brightness} label={l.brightness} className={LIGHT_GROUP_SLIDER_CLASS} value={s.brightness ?? 0} min={0} max={100} disabled={!!unavailable} format={formatBrightness} onCommit={(v) => props.onBrightness?.(v)} />
          )}
          {members.length > 0 && (
            <button
              type="button"
              className="mh-light-group__expand"
              aria-controls={listId}
              aria-expanded={open}
              onClick={() => {
                setOpen(!open);
                props.onExpandedChange?.(!open);
              }}
            >
              <span className="mh-light-group__expand-label">{open ? l.hide : l.show(members.length)}</span>
              <Icon icon={mdiChevronDown} className="mh-light-group__chevron" />
            </button>
          )}
          {members.length > 0 && (
            <ul className="mh-light-group__members" id={listId} hidden={!open}>
              {members.map((m) => (
                <li key={m.id} className={cx('mh-light-group__member', m.unavailable && 'is-unavailable')}>
                  <LightControl
                    label={m.name}
                    on={m.on}
                    brightness={typeof m.brightness === 'number' ? m.brightness : null}
                    disabled={!!(m.unavailable || unavailable)}
                    labels={{ power: m.name, brightness: l.brightness }}
                    onToggle={(on) => props.onMemberToggle?.(m.id, on)}
                    onBrightness={(v) => props.onMemberBrightness?.(m.id, v)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </ControlCard>
  );
}

// Floor plan ---------------------------------------------------------------------------------------------------

export interface FloorPlanProps {
  label: string;
  rooms: readonly FloorPlanRoom[];
  markers?: readonly FloorPlanMarker[];
  bounds?: FloorPlanBounds | null;
  selected?: string | null;
  showNames?: boolean;
  onRoom?: (id: string) => void;
  onMarker?: (id: string) => void;
  className?: string;
}

/** Same DOM and classes as `createFloorPlan`. */
export function FloorPlan({ label, rooms, markers = [], bounds, selected, showNames = true, onRoom, onMarker, className }: FloorPlanProps) {
  const glowId = floorPlanGlowId(useId());
  const [current, setCurrent] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLElement | SVGGElement>());
  const b = bounds ?? floorPlanBounds(rooms, markers);
  const stops = floorPlanStops({ rooms, markers, onMarker });
  const tab = floorPlanTabStop(stops, current, selected);
  const tabKey = stops[tab] ? `${stops[tab].kind}:${stops[tab].id}` : null;
  const key = (s: FloorPlanStop): string => `${s.kind}:${s.id}`;
  const choose = (room: FloorPlanRoom): void => {
    if (room.disabled) return;
    setCurrent(`room:${room.id}`);
    onRoom?.(room.id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const from = stops.findIndex((s) => refs.current.get(key(s)) === event.target);
    if (from < 0) return;
    const stop = stops[from]!;
    if (stop.kind === 'room' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      const room = rooms.find((r) => r.id === stop.id);
      if (room) choose(room);
      return;
    }
    const to = floorPlanMove(stops, from, event.key);
    if (to === null) {
      if (event.key.startsWith('Arrow')) event.preventDefault();
      return;
    }
    event.preventDefault();
    const next = stops[to]!;
    setCurrent(key(next));
    refs.current.get(key(next))?.focus();
  };
  const setRef = (k: string) => (node: HTMLElement | SVGGElement | null) => {
    if (node) refs.current.set(k, node);
    else refs.current.delete(k);
  };
  return (
    <div className={cx('mh-floor-plan', className)} role="group" aria-label={label} onKeyDown={onKeyDown}>
      <div className="mh-floor-plan__canvas" style={{ aspectRatio: `${b.width} / ${b.height}` }}>
        <svg className="mh-floor-plan__svg" preserveAspectRatio="xMidYMid meet" viewBox={floorPlanViewBox(b)}>
          <defs>
            <radialGradient id={glowId} className="mh-floor-plan__gradient" cx="50%" cy="50%" r="65%">
              <stop offset="0" className="mh-floor-plan__stop mh-floor-plan__stop--core" />
              <stop offset="1" className="mh-floor-plan__stop mh-floor-plan__stop--edge" />
            </radialGradient>
          </defs>
          <g className="mh-floor-plan__rooms">
            {rooms.map((room) => {
              const points = floorPlanPolygon(room.shape);
              const level = floorPlanLevel(room);
              return (
                <g
                  key={room.id}
                  ref={setRef(`room:${room.id}`)}
                  role="button"
                  className={floorPlanRoomClass(room, selected === room.id)}
                  aria-label={floorPlanRoomLabel(room)}
                  style={{ '--_level': String(level) } as CSSProperties}
                  aria-current={selected === room.id ? 'true' : undefined}
                  aria-disabled={room.disabled ? 'true' : undefined}
                  tabIndex={room.disabled ? undefined : tabKey === `room:${room.id}` ? 0 : -1}
                  onClick={() => choose(room)}
                  onFocus={(event) => {
                    setFocused(floorPlanFocusVisible(event.currentTarget) ? room.id : null);
                    setCurrent(`room:${room.id}`);
                  }}
                  onBlur={() => setFocused(null)}
                >
                  <polygon className="mh-floor-plan__shape" points={points} />
                  {level > 0 && <polygon className="mh-floor-plan__glow" fill={`url(#${glowId})`} points={points} />}
                </g>
              );
            })}
          </g>
          <g className="mh-floor-plan__rings" aria-hidden="true">
            {floorPlanRings(rooms, selected, focused).map((ring) => (
              <polygon key={`${ring.kind}:${ring.id}`} className={`mh-floor-plan__ring mh-floor-plan__ring--${ring.kind}`} points={ring.points} />
            ))}
          </g>
        </svg>
        <div className="mh-floor-plan__labels" aria-hidden="true" hidden={!showNames}>
          {showNames &&
            rooms.map((room) => (
              <span key={room.id} className={cx('mh-floor-plan__label', room.disabled && 'is-disabled')} style={floorPlanLabelStyle(room, b)}>
                <span className="mh-floor-plan__name">{room.name}</span>
                {room.summary && <span className="mh-floor-plan__summary">{room.summary}</span>}
              </span>
            ))}
        </div>
        <div className="mh-floor-plan__markers">
          {markers.map((m) => {
            const at = floorPlanPercent([m.x, m.y], b);
            const style = { left: `${at.left}%`, top: `${at.top}%` };
            const name = floorPlanMarkerLabel(m);
            return onMarker ? (
              <button
                key={m.id}
                ref={setRef(`marker:${m.id}`)}
                type="button"
                className={floorPlanMarkerClass(m, true)}
                aria-label={name}
                title={name}
                tabIndex={tabKey === `marker:${m.id}` ? 0 : -1}
                style={style}
                onClick={() => {
                  setCurrent(`marker:${m.id}`);
                  onMarker(m.id);
                }}
                onFocus={() => setCurrent(`marker:${m.id}`)}
              >
                <Icon icon={m.icon} />
              </button>
            ) : (
              <span key={m.id} role="img" className={floorPlanMarkerClass(m, false)} aria-label={name} style={style}>
                <Icon icon={m.icon} />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Vacuum control -----------------------------------------------------------------------------------------------

export interface VacuumControlProps {
  name: string;
  icon?: IconName | string;
  state: VacuumState;
  battery?: number | null;
  charging?: boolean;
  detail?: string;
  error?: string;
  rooms?: readonly VacuumRoom[];
  /** The chosen rooms; leave out to let the control keep them. */
  selectedRooms?: readonly string[];
  labels?: Partial<VacuumControlLabels>;
  unavailable?: boolean;
  onStart?: (rooms: string[]) => void;
  onPause?: () => void;
  onDock?: () => void;
  onRoomsChange?: (rooms: string[]) => void;
  className?: string;
}

/** Same DOM and classes as `createVacuumControl`. */
export function VacuumControl(props: VacuumControlProps) {
  const { name, icon = VACUUM_ICON, state, battery, charging = false, rooms = [], unavailable, className } = props;
  const l = { ...VACUUM_CONTROL_LABELS, ...props.labels, states: { ...VACUUM_CONTROL_LABELS.states, ...props.labels?.states } };
  const [own, setOwn] = useState<readonly string[]>(props.selectedRooms ?? []);
  const known = new Set(rooms.map((r) => r.id));
  const chosen = (props.selectedRooms ?? own).filter((id) => known.has(id));
  const fire = (action: VacuumAction): void => {
    if (action === 'start') props.onStart?.([...chosen]);
    else if (action === 'pause') props.onPause?.();
    else props.onDock?.();
  };
  const bt = vacuumBatteryText(battery, charging, l);
  return (
    <ControlCard
      title={name}
      icon={icon}
      state={vacuumStateText(props, l)}
      active={state === 'cleaning' || state === 'returning'}
      unavailable={unavailable}
      className={cx(vacuumControlClass(props), className)}
      control={
        battery === undefined ? null : (
          <span className={vacuumBatteryClass(battery, charging)}>
            <span className="mh-vacuum-control__battery-icon">
              <Icon icon={vacuumBatteryIcon(battery, charging)} />
            </span>
            <span className="mh-vacuum-control__battery-text" aria-hidden="true">
              {bt.text}
            </span>
            <span className="mh-visually-hidden">{bt.label}</span>
          </span>
        )
      }
    >
      <div className="mh-vacuum-control__body">
        {state === 'error' && props.error && (
          <p className="mh-vacuum-control__error" role="alert">
            {props.error}
          </p>
        )}
        <div className="mh-vacuum-control__actions">
          {vacuumButtons(props, chosen.length, l).map((b) => (
            <Button key={b.action} variant={b.primary ? 'primary' : 'secondary'} icon={b.icon} className={vacuumButtonClass(b.action)} disabled={b.disabled} onClick={() => fire(b.action)}>
              {b.label}
            </Button>
          ))}
        </div>
        {rooms.length > 0 && (
          <div className="mh-vacuum-control__rooms">
            <span className="mh-vacuum-control__rooms-label" aria-hidden="true">
              {l.rooms}
            </span>
            <div className="mh-chip-group" role="group" aria-label={l.rooms}>
              {rooms.map((r) => (
                <Chip
                  key={r.id}
                  label={r.name}
                  selectable
                  selected={chosen.includes(r.id)}
                  disabled={!!unavailable}
                  onSelectedChange={(on) => {
                    const next = on ? [...chosen, r.id] : chosen.filter((id) => id !== r.id);
                    setOwn(next);
                    props.onRoomsChange?.(next);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ControlCard>
  );
}

// Appliance cycle ----------------------------------------------------------------------------------------------

export interface ApplianceCycleProps {
  name: string;
  icon?: IconName | string;
  state: ApplianceState;
  programme?: string;
  stages?: readonly string[];
  stage?: number | null;
  remaining?: number | null;
  progress?: number | null;
  duration?: number | null;
  endsAt?: string;
  error?: string;
  labels?: Partial<ApplianceCycleLabels>;
  unavailable?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/** Same DOM and classes as `createApplianceCycle`. */
export function ApplianceCycle(props: ApplianceCycleProps) {
  const { name, icon = APPLIANCE_ICON, state, remaining, endsAt, unavailable, onPause, onResume, onDismiss, className } = props;
  const l = { ...APPLIANCE_CYCLE_LABELS, ...props.labels, states: { ...APPLIANCE_CYCLE_LABELS.states, ...props.labels?.states } };
  const pct = applianceProgress(props);
  const showTime = (state === 'running' || state === 'paused') && typeof remaining === 'number';
  const stages = applianceStages(props);
  const paused = state === 'paused';
  const canStep = (state === 'running' && !!onPause) || (paused && !!onResume);
  return (
    <ControlCard
      title={name}
      icon={state === 'finished' ? mdiCheckCircleOutline : icon}
      state={applianceStateText(props, l)}
      active={state === 'running' || state === 'finished'}
      unavailable={unavailable}
      className={cx(applianceCycleClass(props), className)}
      control={canStep ? <IconButton icon={paused ? mdiPlay : mdiPause} label={paused ? l.resume : l.pause} filled className="mh-appliance-cycle__toggle" onClick={() => (paused ? onResume?.() : onPause?.())} /> : null}
    >
      <div className="mh-appliance-cycle__body">
        {(showTime || (endsAt && state !== 'finished')) && (
          <p className="mh-appliance-cycle__time">
            {showTime && <span className="mh-appliance-cycle__left">{l.left(formatApplianceTime(remaining))}</span>}
            {endsAt && <span className="mh-appliance-cycle__ends">{endsAt}</span>}
          </p>
        )}
        {state === 'error' && props.error && (
          <p className="mh-appliance-cycle__error" role="alert">
            {props.error}
          </p>
        )}
        {state === 'finished' && (
          <div className="mh-appliance-cycle__done">
            <span className="mh-appliance-cycle__done-icon">
              <Icon icon={mdiCheckCircleOutline} />
            </span>
            <span className="mh-appliance-cycle__done-text">{endsAt ?? l.states.finished}</span>
            {onDismiss && (
              <Button variant="tonal" size="small" className="mh-appliance-cycle__dismiss" onClick={() => onDismiss()}>
                {l.dismiss}
              </Button>
            )}
          </div>
        )}
        {state !== 'idle' && state !== 'finished' && pct !== null && <ProgressBar label={l.progress} value={pct} valueText={`${Math.round(pct)}%`} tone={state === 'error' ? 'danger' : 'accent'} className="mh-appliance-cycle__progress" />}
        {stages.length > 0 && (
          <ol className="mh-appliance-cycle__stages" aria-label={l.stages}>
            {stages.map((s, i) => (
              <li key={i} className={applianceStageClass(s.status)} aria-current={s.status === 'current' ? 'step' : undefined}>
                <span className="mh-appliance-cycle__stage-label">{s.label}</span>
              </li>
            ))}
          </ol>
        )}
        <span className="mh-visually-hidden" aria-live="polite">
          {l.states[state]}
        </span>
      </div>
    </ControlCard>
  );
}

// Irrigation zones ---------------------------------------------------------------------------------------------

export interface IrrigationZonesProps {
  name: string;
  icon?: IconName | string;
  zones: readonly IrrigationZone[];
  running?: IrrigationRun | null;
  nextRun?: string | null;
  rainSkip?: boolean;
  rainNote?: string;
  labels?: Partial<IrrigationZonesLabels>;
  unavailable?: boolean;
  onRun?: (id: string) => void;
  onStop?: () => void;
  onRainSkip?: (skip: boolean) => void;
  className?: string;
}

/** Same DOM and classes as `createIrrigationZones`. */
export function IrrigationZones(props: IrrigationZonesProps) {
  const { name, icon = IRRIGATION_ICON, zones, running, rainSkip, rainNote, unavailable, onRun, onStop, onRainSkip, className } = props;
  const l = { ...IRRIGATION_ZONES_LABELS, ...props.labels };
  const runZone = running ? zones.find((z) => z.id === running.zone) : undefined;
  const left = running ? l.left(formatApplianceTime(running.remaining)) : '';
  const off = !!unavailable;
  const hasBody = !!runZone || !!onRainSkip || zones.length > 0;
  return (
    <ControlCard title={name} icon={icon} state={irrigationStateText(props, l)} active={!!runZone} tone="cool" unavailable={unavailable} className={cx(irrigationZonesClass(props), className)}>
      {hasBody && (
        <div className="mh-irrigation-zones__body">
          {runZone && (
            <div className="mh-irrigation-zones__now">
              <span className="mh-irrigation-zones__now-icon">
                <Icon icon={IRRIGATION_ICON} />
              </span>
              <span className="mh-irrigation-zones__now-text">
                <span className="mh-irrigation-zones__now-name">{runZone.name}</span>
                <span className="mh-irrigation-zones__now-left">{left}</span>
              </span>
              <Button variant="secondary" size="small" icon={IRRIGATION_STOP_ICON} className="mh-irrigation-zones__stop" disabled={off} onClick={() => onStop?.()}>
                {l.stop}
              </Button>
              <ProgressBar key={l.progress} label={l.progress} size="small" value={irrigationProgress(props)} valueText={left} className="mh-irrigation-zones__progress" />
            </div>
          )}
          {onRainSkip && <Switch row label={l.rainSkip} description={rainNote} icon={IRRIGATION_RAIN_ICON} className="mh-irrigation-zones__rain" checked={!!rainSkip} disabled={off} onChange={(event) => onRainSkip(event.target.checked)} />}
          {zones.length > 0 && (
            <ul className="mh-irrigation-zones__zones" aria-label={l.zones}>
              {zones.map((z) => {
                const isRunning = running?.zone === z.id;
                const label = isRunning ? `${l.stop} ${z.name}` : l.run(z.name);
                return (
                  <li key={z.id} className={irrigationZoneClass(isRunning, !!z.disabled)}>
                    <span className="mh-irrigation-zones__zone-text">
                      <span className="mh-irrigation-zones__zone-name">{z.name}</span>
                      <span className="mh-irrigation-zones__zone-time">{l.minutes(z.duration)}</span>
                    </span>
                    <IconButton icon={isRunning ? IRRIGATION_STOP_ICON : mdiPlay} label={label} className="mh-irrigation-zones__run" disabled={off || (!isRunning && !!z.disabled)} onClick={() => (isRunning ? onStop?.() : onRun?.(z.id))} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </ControlCard>
  );
}
