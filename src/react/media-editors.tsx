// media group, editors and viewers: React bindings. Same DOM and classes as the web renderer. Simple controls
// render their markup here; the gesture-heavy widgets (zoomable image, layers panel, media timeline, map) build the
// web component into an element React renders and owns.
import { isValidElement, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { mdiArrowSplitHorizontal, mdiArrowSplitVertical, mdiChevronDown, mdiLinkVariant, mdiLinkVariantOff, mdiMinus, mdiPause, mdiPlay, mdiPlus, mdiRepeat, mdiSkipNext, mdiSkipPrevious, mdiStepBackward, mdiStepForward } from '@mdi/js';
import { cx } from '../web/dom.ts';
import { iconButtonClass } from '../web/actions/iconButton.ts';
import { COMPARE_ASPECT, attachCompareDrag, compareSliderClass, compareValueText, type CompareImage, type CompareOrientation } from '../web/media/compareSlider.ts';
import {
  REFERENCE_POINTS,
  REFERENCE_POINT_NAMES,
  TRANSFORM_LABELS,
  TRANSFORM_SHORT,
  applyTransformField,
  attachTransformScrub,
  transformKeyStep,
  transformShown,
  type ReferencePoint,
  type TransformField,
  type TransformLabels,
  type TransformValue,
} from '../web/media/transformFields.ts';
import {
  inspectorParamClass,
  keyframeClass,
  keyframeIcon,
  keyframeLabel,
  nextKeyframe,
  parseInspectorNumber,
  type InspectorChoiceParam,
  type InspectorParam,
  type InspectorSection,
  type InspectorSliderParam,
  type InspectorToggleParam,
  type InspectorValue,
  type KeyframeState,
} from '../web/media/inspector.ts';
import { mountLayersPanel, type LayerItem, type LayersPanelHandle, type LayersPanelLabels } from '../web/media/layersPanel.ts';
import { mountMap, type MapHandle, type MapLabels, type MapMarker, type MapTileSource, type MapView } from '../web/media/map.ts';
import { mountMediaTimeline, type MediaTimelineHandle, type MediaTimelineLabels, type TimelineClipChange, type TimelineTrack } from '../web/media/mediaTimeline.ts';
import { clamp, formatTimecode, trimNumber } from '../web/media/timecode.ts';
import {
  TRANSPORT_LABELS,
  transportButtonClass,
  transportClass,
  transportPlayClass,
  transportStep,
  transportStepPosition,
  type TransportLabels,
  type TransportSize,
} from '../web/media/transport.ts';
import { mountZoomableImage, type ZoomableImageHandle, type ZoomView } from '../web/media/zoomableImage.ts';
import {
  ZOOM_CONTROL_LABELS,
  ZOOM_PRESETS,
  zoomControlButtonClass,
  zoomControlClass,
  zoomControlModel,
  zoomStep,
  type ZoomControlLabels,
  type ZoomControlSize,
} from '../web/media/zoomControl.ts';
import { sliderPosition } from '../web/choice-inputs/slider.ts';
import { Icon } from './foundations.tsx';

/** State that follows a prop when the prop changes, and the component's own changes in between. */
function useSynced<T>(value: T): [T, (next: T) => void] {
  const [state, setState] = useState(value);
  const [prev, setPrev] = useState(value);
  if (!Object.is(prev, value)) {
    setPrev(value);
    setState(value);
  }
  return [state, setState];
}

/** The latest value, for callbacks used inside effects that shouldn't re-run when the callback changes. */
function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

// Zoom control ----------------------------------------------------------------------------------------------------

export interface ZoomControlProps {
  value: number;
  min?: number;
  max?: number;
  presets?: readonly number[];
  showFit?: boolean;
  fitted?: boolean;
  size?: ZoomControlSize;
  disabled?: boolean;
  labels?: Partial<ZoomControlLabels>;
  onChange?: (value: number) => void;
  onFit?: () => void;
  className?: string;
}

/** Same DOM and classes as `createZoomControl`. Controlled: pass the new `value` back from `onChange`. */
export function ZoomControl({ value, min = 0.1, max = 8, presets = ZOOM_PRESETS, showFit = true, fitted = false, size = 'medium', disabled = false, labels, onChange, onFit, className }: ZoomControlProps) {
  const l = { ...ZOOM_CONTROL_LABELS, ...labels };
  const v = clamp(value, min, max);
  const m = zoomControlModel(v, presets, min, max);
  const set = (next: number): void => onChange?.(clamp(next, min, max));
  return (
    <div className={cx(zoomControlClass(size), className)} role="group" aria-label={l.group}>
      <button type="button" className={zoomControlButtonClass(size)} aria-label={l.zoomOut} title={l.zoomOut} disabled={disabled} aria-disabled={!m.canZoomOut} onClick={() => m.canZoomOut && set(zoomStep(v, -1, presets, min, max))}>
        <Icon icon={mdiMinus} />
      </button>
      <span className="mh-zoom-control__level">
        <select className="mh-zoom-control__select" aria-label={l.level} value={String(m.selected)} disabled={disabled} onChange={(e) => set(Number(e.target.value))}>
          {m.options.map((o) => (
            <option key={o.value} value={String(o.value)}>
              {o.text}
            </option>
          ))}
        </select>
        <Icon icon={mdiChevronDown} className="mh-zoom-control__chevron" />
      </span>
      <button type="button" className={zoomControlButtonClass(size)} aria-label={l.zoomIn} title={l.zoomIn} disabled={disabled} aria-disabled={!m.canZoomIn} onClick={() => m.canZoomIn && set(zoomStep(v, 1, presets, min, max))}>
        <Icon icon={mdiPlus} />
      </button>
      {showFit && (
        <button type="button" className="mh-zoom-control__fit" aria-pressed={fitted} disabled={disabled} onClick={() => onFit?.()}>
          {l.fit}
        </button>
      )}
    </div>
  );
}

// Transport -------------------------------------------------------------------------------------------------------

export interface TransportProps {
  label: string;
  playing?: boolean;
  position?: number;
  duration?: number;
  fps?: number;
  step?: number;
  /** Shows the loop toggle with this state. */
  loop?: boolean;
  skip?: boolean;
  steps?: boolean;
  size?: TransportSize;
  disabled?: boolean;
  labels?: Partial<TransportLabels>;
  onPlayingChange?: (playing: boolean) => void;
  onSeek?: (position: number) => void;
  onLoopChange?: (loop: boolean) => void;
  className?: string;
}

/** Same DOM and classes as `createTransport`. The props are the state; presses update it until new props arrive. */
export function Transport(props: TransportProps) {
  const { label, fps, size = 'medium', disabled = false, skip = true, steps = true, onPlayingChange, onSeek, onLoopChange, className } = props;
  const l = { ...TRANSPORT_LABELS, ...props.labels };
  const [playing, setPlaying] = useSynced(props.playing ?? false);
  const [position, setPosition] = useSynced(Math.max(0, props.position ?? 0));
  const [loop, setLoop] = useSynced(props.loop ?? false);
  const duration = Math.max(0, props.duration ?? 0);
  const step = transportStep({ fps, step: props.step });
  const tc = (s: number): string => formatTimecode(s, { fps, hours: duration >= 3600 });
  const seek = (next: number): void => {
    setPosition(next);
    onSeek?.(next);
  };
  const button = (text: string, icon: string, onClick: () => void, extra?: string, pressed?: boolean, isDisabled = disabled) => (
    <button type="button" className={cx(transportButtonClass(size), extra)} aria-label={text} title={text} aria-pressed={pressed} disabled={isDisabled} onClick={onClick}>
      <Icon icon={icon} />
    </button>
  );
  const playText = playing ? l.pause : l.play;
  return (
    <div className={cx(transportClass(size), className)} role="group" aria-label={label}>
      <div className="mh-transport__buttons">
        {skip && button(l.start, mdiSkipPrevious, () => seek(0), 'mh-transport__skip')}
        {steps && button(l.stepBack, mdiStepBackward, () => seek(transportStepPosition(position, -1, step, duration)))}
        <button
          type="button"
          className={transportPlayClass(size)}
          aria-label={playText}
          title={playText}
          disabled={disabled}
          onClick={() => {
            setPlaying(!playing);
            onPlayingChange?.(!playing);
          }}
        >
          <Icon icon={playing ? mdiPause : mdiPlay} />
        </button>
        {steps && button(l.stepForward, mdiStepForward, () => seek(transportStepPosition(position, 1, step, duration)))}
        {skip && button(l.end, mdiSkipNext, () => seek(duration), 'mh-transport__skip', undefined, disabled || duration <= 0)}
        {props.loop !== undefined &&
          button(
            l.loop,
            mdiRepeat,
            () => {
              setLoop(!loop);
              onLoopChange?.(!loop);
            },
            'mh-transport__loop',
            loop,
          )}
      </div>
      <span className="mh-transport__time">
        <span className="mh-transport__current" aria-label={`${l.position} ${tc(position)}`}>
          {tc(position)}
        </span>
        <span className="mh-transport__sep" aria-hidden="true" hidden={duration <= 0}>
          /
        </span>
        <span className="mh-transport__duration" aria-label={`${l.duration} ${tc(duration)}`} hidden={duration <= 0}>
          {duration > 0 ? tc(duration) : ''}
        </span>
      </span>
    </div>
  );
}

// Compare slider --------------------------------------------------------------------------------------------------

export interface CompareSliderProps {
  label: string;
  /** A picture (`{ src, alt }`) or any content. */
  before: CompareImage | ReactNode;
  after: CompareImage | ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  value?: number;
  defaultValue?: number;
  orientation?: CompareOrientation;
  aspect?: number;
  disabled?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const isCompareImage = (side: CompareImage | ReactNode): side is CompareImage =>
  !!side && typeof side === 'object' && !isValidElement(side) && typeof (side as CompareImage).src === 'string';

/** Same DOM and classes as `createCompareSlider`. */
export function CompareSlider({ label, before, after, beforeLabel = 'Before', afterLabel = 'After', value, defaultValue = 50, orientation = 'horizontal', aspect, disabled = false, onChange, className }: CompareSliderProps) {
  const [own, setOwn] = useState(defaultValue);
  const v = clamp(value ?? own, 0, 100);
  const root = useRef<HTMLDivElement>(null);
  const set = useLatest((next: number) => {
    const n = clamp(next, 0, 100);
    if (value === undefined) setOwn(n);
    onChange?.(n);
  });
  const disabledRef = useLatest(disabled);
  useEffect(() => attachCompareDrag(root.current!, orientation, () => disabledRef.current, (n) => set.current(n)), [orientation, set, disabledRef]);
  const pane = (side: 'before' | 'after', content: CompareImage | ReactNode) => (
    <div className={`mh-compare__pane mh-compare__pane--${side}`}>{isCompareImage(content) ? <img className="mh-compare__img" src={content.src} alt={content.alt} draggable="false" /> : content}</div>
  );
  return (
    <div ref={root} className={cx(compareSliderClass(orientation), className)} style={{ aspectRatio: String(aspect && aspect > 0 ? aspect : COMPARE_ASPECT), ['--_at' as string]: String(Math.round(v * 10) / 1000) }}>
      {pane('after', after)}
      {pane('before', before)}
      <span className="mh-compare__label mh-compare__label--before" aria-hidden="true">
        {beforeLabel}
      </span>
      <span className="mh-compare__label mh-compare__label--after" aria-hidden="true">
        {afterLabel}
      </span>
      <div className="mh-compare__divider" aria-hidden="true">
        <span className="mh-compare__handle">
          <Icon icon={orientation === 'vertical' ? mdiArrowSplitHorizontal : mdiArrowSplitVertical} />
        </span>
      </div>
      <input
        type="range"
        className="mh-compare__input"
        min={0}
        max={100}
        step={1}
        aria-label={label}
        aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
        aria-valuetext={compareValueText(v, beforeLabel)}
        value={Math.round(v)}
        disabled={disabled}
        onChange={(e) => set.current(Number(e.target.value))}
      />
    </div>
  );
}

// Transform fields ------------------------------------------------------------------------------------------------

export interface TransformFieldsProps {
  label?: string;
  value: TransformValue;
  reference?: ReferencePoint;
  lockAspect?: boolean;
  unit?: string;
  step?: number;
  decimals?: number;
  disabled?: boolean;
  labels?: Partial<TransformLabels>;
  onChange?: (value: TransformValue, field: TransformField) => void;
  onReferenceChange?: (reference: ReferencePoint) => void;
  onLockAspectChange?: (lockAspect: boolean) => void;
  className?: string;
}

function TransformInput({ field, shown, decimals, step, label, unit, disabled, onCommit }: { field: TransformField; shown: number; decimals: number; step: number; label: string; unit: string; disabled: boolean; onCommit: (n: number) => void }) {
  const text = trimNumber(shown, decimals);
  const [draft, setDraft] = useState<string | null>(null);
  const name = useRef<HTMLSpanElement>(null);
  const read = useLatest(shown);
  const commit = useLatest(onCommit);
  const enabled = useLatest(!disabled);
  useEffect(() => attachTransformScrub(name.current!, () => enabled.current, () => read.current, step, (n) => commit.current(n)), [step, enabled, read, commit]);
  const finish = (): void => {
    if (draft === null) return;
    const n = Number.parseFloat(draft);
    setDraft(null);
    if (Number.isFinite(n) && trimNumber(n, decimals) !== text) onCommit(n);
  };
  return (
    <label className={`mh-transform__field mh-transform__field--${field}`}>
      <span ref={name} className="mh-transform__name" aria-hidden="true">
        {TRANSFORM_SHORT[field]}
      </span>
      <input
        type="number"
        className="mh-transform__input"
        inputMode="decimal"
        step="any"
        aria-label={label}
        min={field === 'width' || field === 'height' ? 0 : undefined}
        value={draft ?? text}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === 'Enter') return finish();
          const n = transformKeyStep(e.key, e.shiftKey, shown, step);
          if (n === null) return;
          e.preventDefault();
          setDraft(null);
          onCommit(n);
        }}
      />
      <span className="mh-transform__unit" aria-hidden="true">
        {field === 'angle' ? '°' : unit}
      </span>
    </label>
  );
}

/** Same DOM and classes as `createTransformFields`. The props are the state; edits update it until new props arrive. */
export function TransformFields(props: TransformFieldsProps) {
  const { unit = 'px', step = 1, decimals = 2, disabled = false, onChange, onReferenceChange, onLockAspectChange, className } = props;
  const l = { ...TRANSFORM_LABELS, ...props.labels };
  const [value, setValue] = useSynced(props.value);
  const [ref, setRef] = useSynced<ReferencePoint>(props.reference ?? 'top-left');
  const [lock, setLock] = useSynced(props.lockAspect ?? false);
  const name = useId();
  const shown = transformShown(value, ref);
  const commit = (field: TransformField, n: number): void => {
    const next = applyTransformField(value, field, n, ref, lock);
    setValue(next);
    onChange?.({ ...next }, field);
  };
  const input = (f: TransformField) => <TransformInput key={f} field={f} shown={shown[f]} decimals={decimals} step={step} label={l[f]} unit={unit} disabled={disabled} onCommit={(n) => commit(f, n)} />;
  return (
    <fieldset className={cx('mh-transform', className)} disabled={disabled}>
      <legend className="mh-visually-hidden">{props.label ?? 'Transform'}</legend>
      <fieldset className="mh-transform__anchor">
        <legend className="mh-visually-hidden">{l.reference}</legend>
        <div className="mh-transform__grid">
          {REFERENCE_POINTS.map((p) => (
            <label key={p} className="mh-transform__point" title={REFERENCE_POINT_NAMES[p]}>
              <input
                type="radio"
                className="mh-transform__radio"
                name={name}
                value={p}
                aria-label={REFERENCE_POINT_NAMES[p]}
                checked={ref === p}
                onChange={() => {
                  setRef(p);
                  onReferenceChange?.(p);
                }}
              />
              <span className="mh-transform__dot" aria-hidden="true" />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="mh-transform__fields">
        {input('x')}
        {input('y')}
        {input('width')}
        <button
          type="button"
          className={`${iconButtonClass('default', 'small')} mh-transform__lock`}
          aria-label={l.lock}
          title={l.lock}
          aria-pressed={lock}
          onClick={() => {
            setLock(!lock);
            onLockAspectChange?.(!lock);
          }}
        >
          <Icon icon={lock ? mdiLinkVariant : mdiLinkVariantOff} />
        </button>
        {input('height')}
        {input('angle')}
      </div>
    </fieldset>
  );
}

// Inspector -------------------------------------------------------------------------------------------------------

export interface InspectorProps {
  label: string;
  sections: readonly InspectorSection[];
  onChange?: (id: string, value: InspectorValue, committed: boolean) => void;
  onKeyframe?: (id: string, on: boolean) => void;
  onSectionToggle?: (id: string, open: boolean) => void;
  className?: string;
}

function KeyButton({ param, onKeyframe }: { param: InspectorParam; onKeyframe?: (id: string, on: boolean) => void }) {
  const [state, setState] = useSynced<KeyframeState | undefined>(param.keyframe);
  if (state === undefined) return <span className="mh-inspector__key-space" aria-hidden="true" />;
  return (
    <button
      type="button"
      className={keyframeClass(state)}
      aria-label={keyframeLabel(param.label)}
      title={keyframeLabel(param.label)}
      aria-pressed={state === 'on'}
      disabled={param.disabled ?? false}
      onClick={() => {
        const next = nextKeyframe(state);
        setState(next);
        onKeyframe?.(param.id, next === 'on');
      }}
    >
      <Icon icon={keyframeIcon(state)} />
    </button>
  );
}

function SliderParam({ p, onChange, onKeyframe }: { p: InspectorSliderParam } & Pick<InspectorProps, 'onChange' | 'onKeyframe'>) {
  const id = useId();
  const min = p.min ?? 0;
  const max = p.max ?? 100;
  const [value, setValue] = useSynced(p.value);
  const [draft, setDraft] = useState<string | null>(null);
  const set = (v: number, committed: boolean): void => {
    const n = clamp(v, min, max);
    setValue(n);
    onChange?.(p.id, n, committed);
  };
  const finish = (): void => {
    if (draft === null) return;
    const n = parseInspectorNumber(draft, p);
    setDraft(null);
    if (n !== null) set(n, true);
  };
  return (
    <div className={inspectorParamClass('slider')}>
      <KeyButton param={p} onKeyframe={onKeyframe} />
      <label className="mh-inspector__label" htmlFor={id}>
        {p.label}
      </label>
      <input
        type="range"
        className="mh-slider__input mh-inspector__range"
        id={id}
        min={min}
        max={max}
        step={p.step ?? 1}
        value={value}
        disabled={p.disabled}
        style={{ ['--_at' as string]: String(sliderPosition(value, min, max)) }}
        onChange={(e) => set(Number(e.target.value), false)}
        onPointerUp={(e) => set(Number(e.currentTarget.value), true)}
        onKeyUp={(e) => set(Number(e.currentTarget.value), true)}
      />
      <span className="mh-inspector__value">
        <input
          type="number"
          className="mh-inspector__number"
          inputMode="decimal"
          min={min}
          max={max}
          step={p.step ?? 1}
          aria-label={`${p.label} value`}
          disabled={p.disabled}
          value={draft ?? trimNumber(value, p.decimals ?? 2)}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finish}
          onKeyDown={(e) => e.key === 'Enter' && finish()}
        />
        {p.unit && (
          <span className="mh-inspector__unit" aria-hidden="true">
            {p.unit}
          </span>
        )}
      </span>
    </div>
  );
}

function ToggleParam({ p, onChange, onKeyframe }: { p: InspectorToggleParam } & Pick<InspectorProps, 'onChange' | 'onKeyframe'>) {
  const labelId = useId();
  const [value, setValue] = useSynced(p.value);
  return (
    <div className={inspectorParamClass('toggle')}>
      <KeyButton param={p} onKeyframe={onKeyframe} />
      <span className="mh-inspector__label" id={labelId}>
        {p.label}
      </span>
      <label className="mh-switch mh-inspector__switch">
        <span className="mh-switch__control">
          <input
            type="checkbox"
            role="switch"
            className="mh-switch__input"
            aria-labelledby={labelId}
            checked={value}
            disabled={p.disabled}
            onChange={(e) => {
              setValue(e.target.checked);
              onChange?.(p.id, e.target.checked, true);
            }}
          />
          <span className="mh-switch__thumb" aria-hidden="true" />
        </span>
      </label>
    </div>
  );
}

function ChoiceParam({ p, onChange, onKeyframe }: { p: InspectorChoiceParam } & Pick<InspectorProps, 'onChange' | 'onKeyframe'>) {
  const id = useId();
  const [value, setValue] = useSynced(p.value);
  return (
    <div className={inspectorParamClass('choice')}>
      <KeyButton param={p} onKeyframe={onKeyframe} />
      <label className="mh-inspector__label" htmlFor={id}>
        {p.label}
      </label>
      <span className="mh-inspector__choice">
        <select
          className="mh-inspector__select"
          id={id}
          value={value}
          disabled={p.disabled}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(p.id, e.target.value, true);
          }}
        >
          {p.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon icon={mdiChevronDown} className="mh-inspector__chevron" />
      </span>
    </div>
  );
}

/** Same DOM and classes as `createInspector`. Values follow the props; edits show at once and are reported. */
export function Inspector({ label, sections, onChange, onKeyframe, onSectionToggle, className }: InspectorProps) {
  return (
    <div className={cx('mh-inspector', className)} role="group" aria-label={label}>
      {sections.map((s) => (
        <details key={s.id} className="mh-inspector__section" open={s.open !== false} onToggle={(e) => onSectionToggle?.(s.id, e.currentTarget.open)}>
          <summary className="mh-inspector__summary">
            <span className="mh-inspector__title">{s.title}</span>
            <Icon icon={mdiChevronDown} className="mh-inspector__caret" />
          </summary>
          <div className="mh-inspector__body">
            {s.params.map((p) =>
              p.kind === 'slider' ? (
                <SliderParam key={p.id} p={p} onChange={onChange} onKeyframe={onKeyframe} />
              ) : p.kind === 'toggle' ? (
                <ToggleParam key={p.id} p={p} onChange={onChange} onKeyframe={onKeyframe} />
              ) : (
                <ChoiceParam key={p.id} p={p} onChange={onChange} onKeyframe={onKeyframe} />
              ),
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

// Zoomable image --------------------------------------------------------------------------------------------------

export interface ZoomableImageProps {
  src: string;
  alt: string;
  maxScale?: number;
  doubleTapScale?: number;
  controls?: boolean;
  aspect?: number;
  hint?: string;
  onChange?: (view: ZoomView) => void;
  className?: string;
}

/** Builds `mountZoomableImage` into a `<div>` it renders; same DOM and classes once mounted. Rebuilt when `src` or the setup changes. */
export function ZoomableImage({ src, alt, maxScale, doubleTapScale, controls, aspect, hint, onChange, className }: ZoomableImageProps) {
  const root = useRef<HTMLDivElement>(null);
  const change = useLatest(onChange);
  useEffect(() => {
    const handle: ZoomableImageHandle = mountZoomableImage(root.current!, { src, alt, maxScale, doubleTapScale, controls, aspect, hint, onChange: (v) => change.current?.(v) });
    return () => handle.destroy();
  }, [src, alt, maxScale, doubleTapScale, controls, aspect, hint, change]);
  return <div ref={root} className={className} />;
}

// Layers panel ----------------------------------------------------------------------------------------------------

export interface LayersPanelProps {
  label: string;
  layers: readonly LayerItem[];
  selected?: string | null;
  labels?: Partial<LayersPanelLabels>;
  onSelect?: (id: string) => void;
  onVisibleChange?: (id: string, visible: boolean) => void;
  onLockedChange?: (id: string, locked: boolean) => void;
  onExpandedChange?: (id: string, expanded: boolean) => void;
  onReorder?: (id: string, parentId: string | null, index: number, layers: LayerItem[]) => void;
  className?: string;
}

/** Builds `mountLayersPanel` into a `<div>` it renders; same DOM and classes once mounted. New `layers` or `selected` props redraw it. */
export function LayersPanel({ label, layers, selected = null, labels, className, ...callbacks }: LayersPanelProps) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<LayersPanelHandle | null>(null);
  const cb = useLatest(callbacks);
  const first = useRef({ layers, selected, labels });
  useEffect(() => {
    const h = mountLayersPanel(root.current!, {
      label,
      layers: first.current.layers,
      selected: first.current.selected,
      labels: first.current.labels,
      onSelect: (id) => cb.current.onSelect?.(id),
      onVisibleChange: (id, v) => cb.current.onVisibleChange?.(id, v),
      onLockedChange: (id, v) => cb.current.onLockedChange?.(id, v),
      onExpandedChange: (id, v) => cb.current.onExpandedChange?.(id, v),
      onReorder: (id, parent, index, next) => cb.current.onReorder?.(id, parent, index, next),
    });
    handle.current = h;
    return () => {
      h.destroy();
      handle.current = null;
    };
  }, [label, cb]);
  useEffect(() => handle.current?.setLayers(layers), [layers]);
  useEffect(() => handle.current?.setSelected(selected), [selected]);
  return <div ref={root} className={className} />;
}

// Media timeline --------------------------------------------------------------------------------------------------

export interface MediaTimelineProps {
  label: string;
  duration: number;
  tracks: readonly TimelineTrack[];
  position?: number;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  fps?: number;
  snap?: boolean;
  snapStep?: number;
  selected?: string | null;
  follow?: boolean;
  labels?: Partial<MediaTimelineLabels>;
  onSeek?: (position: number) => void;
  onSelect?: (clipId: string | null) => void;
  onClipChange?: (change: TimelineClipChange, committed: boolean) => void;
  onZoomChange?: (zoom: number) => void;
  className?: string;
}

/**
 * Builds `mountMediaTimeline` into a `<div>` it renders; same DOM and classes once mounted. `position`, `zoom`,
 * `tracks`, `selected` and `snap` props update it in place; the duration, frame rate and limits rebuild it.
 */
export function MediaTimeline({ label, duration, tracks, position = 0, zoom = 48, minZoom, maxZoom, fps, snap = true, snapStep, selected = null, follow, labels, className, ...callbacks }: MediaTimelineProps) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<MediaTimelineHandle | null>(null);
  const cb = useLatest(callbacks);
  const live = useLatest({ tracks, position, zoom, selected, snap, labels });
  useEffect(() => {
    const s = live.current;
    const h = mountMediaTimeline(root.current!, {
      label,
      duration,
      tracks: s.tracks,
      position: s.position,
      zoom: s.zoom,
      minZoom,
      maxZoom,
      fps,
      snap: s.snap,
      snapStep,
      selected: s.selected,
      follow,
      labels: s.labels,
      onSeek: (t) => cb.current.onSeek?.(t),
      onSelect: (id) => cb.current.onSelect?.(id),
      onClipChange: (c, done) => cb.current.onClipChange?.(c, done),
      onZoomChange: (z) => cb.current.onZoomChange?.(z),
    });
    handle.current = h;
    return () => {
      h.destroy();
      handle.current = null;
    };
  }, [label, duration, minZoom, maxZoom, fps, snapStep, follow, cb, live]);
  useEffect(() => handle.current?.setPosition(position), [position]);
  useEffect(() => handle.current?.setZoom(zoom), [zoom]);
  useEffect(() => handle.current?.setTracks(tracks), [tracks]);
  useEffect(() => handle.current?.setSelected(selected), [selected]);
  useEffect(() => handle.current?.setSnap(snap), [snap]);
  return <div ref={root} className={className} />;
}

// Map -------------------------------------------------------------------------------------------------------------

export interface MapProps {
  label: string;
  tiles?: MapTileSource | null;
  tileSize?: number;
  tileMinZoom?: number;
  tileMaxZoom?: number;
  attribution?: string | null;
  center?: { lat: number; lon: number } | null;
  zoom?: number;
  bearing?: number;
  minZoom?: number;
  maxZoom?: number;
  markers?: readonly MapMarker[];
  controls?: boolean;
  compass?: boolean;
  scale?: boolean;
  rotate?: boolean;
  aspect?: number;
  labels?: Partial<MapLabels>;
  onViewChange?: (view: MapView) => void;
  onMarkerSelect?: (marker: MapMarker, index: number) => void;
  className?: string;
}

/**
 * Builds `mountMap` into a `<div>` it renders; same DOM and classes once mounted. The view props set the starting
 * view (and move it when they change); `markers`, `tiles` and `attribution` update in place.
 */
export function TileMap({ label, tiles = null, attribution = null, markers = [], center, zoom, bearing, className, onViewChange, onMarkerSelect, ...setup }: MapProps) {
  const root = useRef<HTMLDivElement>(null);
  const handle = useRef<MapHandle | null>(null);
  const viewCb = useLatest(onViewChange);
  const markerCb = useLatest(onMarkerSelect);
  const selectable = !!onMarkerSelect;
  const { tileSize, tileMinZoom, tileMaxZoom, minZoom, maxZoom, controls, compass, scale, rotate, aspect, labels } = setup;
  const live = useLatest({ tiles, attribution, markers, center, zoom, bearing, labels });
  // What the map was built or last updated with, so mounting doesn't reload the same tiles.
  const applied = useRef<{ tiles: MapTileSource | null; attribution: string | null }>({ tiles: null, attribution: null });
  useEffect(() => {
    const s = live.current;
    const h = mountMap(root.current!, {
      label,
      tiles: s.tiles,
      attribution: s.attribution,
      markers: s.markers,
      center: s.center,
      zoom: s.zoom,
      bearing: s.bearing,
      tileSize,
      tileMinZoom,
      tileMaxZoom,
      minZoom,
      maxZoom,
      controls,
      compass,
      scale,
      rotate,
      aspect,
      labels: s.labels,
      onViewChange: (v) => viewCb.current?.(v),
      onMarkerSelect: selectable ? (m, i) => markerCb.current?.(m, i) : undefined,
    });
    handle.current = h;
    applied.current = { tiles: s.tiles, attribution: s.attribution };
    return () => {
      h.destroy();
      handle.current = null;
    };
  }, [label, tileSize, tileMinZoom, tileMaxZoom, minZoom, maxZoom, controls, compass, scale, rotate, aspect, selectable, viewCb, markerCb, live]);
  useEffect(() => handle.current?.setMarkers(markers), [markers]);
  useEffect(() => {
    if (applied.current.tiles === tiles && applied.current.attribution === attribution) return;
    applied.current = { tiles, attribution };
    handle.current?.setTiles(tiles, attribution);
  }, [tiles, attribution]);
  const lat = center?.lat;
  const lon = center?.lon;
  useEffect(() => {
    if (lat !== undefined && lon !== undefined) handle.current?.setView({ lat, lon });
  }, [lat, lon]);
  useEffect(() => {
    if (zoom !== undefined) handle.current?.setView({ zoom });
  }, [zoom]);
  useEffect(() => {
    if (bearing !== undefined) handle.current?.setView({ bearing });
  }, [bearing]);
  return <div ref={root} className={className} />;
}
