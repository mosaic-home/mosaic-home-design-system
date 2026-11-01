import { mdiCheck, mdiSpeaker, mdiVolumeHigh, mdiVolumeOff } from '@mdi/js';
import { iconButtonClass } from '../../actions/iconButton.ts';
import { sliderPosition } from '../../choice-inputs/slider.ts';
import { cx, h, uid } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';

/** A speaker, or a room's speakers, that playback can be sent to. */
export interface Speaker {
  id: string;
  name: string;
  /** Second line: the room, the model ("Kitchen", "Soundbar"). */
  detail?: string | null;
  /** Short name or raw MDI path (default a speaker). */
  icon?: IconName | string;
  selected?: boolean;
  /** 0 to 1. `null`: unknown (the slider is shown disabled); left out: no volume control. */
  volume?: number | null;
  /** Left out: no mute button. */
  muted?: boolean | null;
  /** Something is playing on it now. */
  playing?: boolean;
  /** Can't be reached: shown muted and can't be picked. */
  unavailable?: boolean;
}

/** Every word the selector shows or speaks. `{name}` is the speaker's name. */
export interface SpeakerSelectorLabels {
  group: string;
  playing: string;
  unavailable: string;
  volume: string;
  mute: string;
  empty: string;
}

export const SPEAKER_SELECTOR_LABELS: SpeakerSelectorLabels = {
  group: 'Play on',
  playing: 'Playing',
  unavailable: 'Unavailable',
  volume: '{name} volume',
  mute: 'Mute {name}',
  empty: 'No speakers',
};

export interface SpeakerSelectorEvents {
  /** A speaker was picked or left out. With `multiple: false`, only picks are reported. */
  onSelect?: (id: string, selected: boolean) => void;
  /** 0 to 1, when a volume slider is released (or a key changes it). */
  onVolume?: (id: string, volume: number) => void;
  onMute?: (id: string, muted: boolean) => void;
}

export interface SpeakerSelectorData {
  speakers: readonly Speaker[];
  /** Group them: several can be picked (checkboxes, default). `false`: one at a time (radios). */
  multiple?: boolean;
  /** Accessible name of the set (default "Play on"). */
  label?: string;
  labels?: Partial<SpeakerSelectorLabels>;
}

export interface SpeakerSelectorOptions extends SpeakerSelectorData, SpeakerSelectorEvents {}

export interface SpeakerSelectorHandle {
  el: HTMLFieldSetElement;
  update(options: SpeakerSelectorOptions): void;
}

const fill = (template: string, name: string): string => template.replace(/\{name\}/g, name);

export interface SpeakerView {
  id: string;
  name: string;
  /** The second line: detail, playing, unavailable, joined with " · ". */
  detail: string;
  icon: string;
  selected: boolean;
  unavailable: boolean;
  playing: boolean;
  className: string;
  /** Shown while picked: the mute button and the level. */
  mute: boolean;
  muted: boolean;
  muteLabel: string;
  volume: boolean;
  /** 0 to 100, null unknown. */
  level: number | null;
  volumeLabel: string;
}

export interface SpeakerSelectorView {
  labels: SpeakerSelectorLabels;
  label: string;
  multiple: boolean;
  speakers: SpeakerView[];
}

/** Everything the selector draws: the same for the web renderer and React. */
export function speakerSelectorView(data: SpeakerSelectorData): SpeakerSelectorView {
  const labels = { ...SPEAKER_SELECTOR_LABELS, ...data.labels };
  const multiple = data.multiple ?? true;
  let picked = false;
  const speakers = data.speakers.map((s): SpeakerView => {
    const unavailable = !!s.unavailable;
    // One at a time: only the first picked speaker counts.
    const selected = !!s.selected && (multiple || !picked);
    if (selected) picked = true;
    const playing = !!s.playing && !unavailable;
    const detail = [s.detail?.trim(), playing && labels.playing, unavailable && labels.unavailable].filter(Boolean).join(' · ');
    const level = s.volume === null || s.volume === undefined || !Number.isFinite(s.volume) ? null : Math.round(Math.min(1, Math.max(0, s.volume)) * 100);
    const shown = selected && !unavailable;
    return {
      id: s.id,
      name: s.name,
      detail,
      icon: s.icon ?? mdiSpeaker,
      selected,
      unavailable,
      playing,
      className: cx('mh-speaker-selector__item', selected && 'is-selected', playing && 'is-playing', unavailable && 'is-unavailable'),
      mute: shown && s.muted !== undefined,
      muted: !!s.muted,
      muteLabel: fill(labels.mute, s.name),
      volume: shown && s.volume !== undefined,
      level,
      volumeLabel: fill(labels.volume, s.name),
    };
  });
  return { labels, label: data.label ?? labels.group, multiple, speakers };
}

export function speakerSelectorMuteClass(): string {
  return cx(iconButtonClass('default', 'small'), 'mh-speaker-selector__mute');
}

export function speakerSelectorLevelClass(muted: boolean): string {
  return cx('mh-slider', 'mh-speaker-selector__level', muted && 'is-muted');
}

interface SpeakerRow {
  el: HTMLLIElement;
  pick: HTMLLabelElement;
  badge: HTMLSpanElement;
  icon: string | null;
  name: HTMLSpanElement;
  detail: HTMLSpanElement;
  text: HTMLSpanElement;
  bars: HTMLSpanElement;
  control: HTMLSpanElement;
  input: HTMLInputElement;
  volume: HTMLDivElement;
  mute: HTMLButtonElement;
  level: HTMLDivElement;
  range: HTMLInputElement;
  dragging: boolean;
}

/**
 * `.mh-speaker-selector`: a `<fieldset>` (hidden legend) with a `__list` of `__item`s (`.is-selected`,
 * `.is-playing`, `.is-unavailable`). Each item is a `<label>` `__pick` (the `__badge` icon, `__text` with `__name`
 * and `__detail`, three `__bars` while playing, and a native checkbox, or a radio with `multiple: false`, drawn like
 * `.mh-checkbox` / `.mh-radio`), and while picked its own `__volume` row: a `__mute` toggle and a `__level` range
 * that commits on release.
 */
export function createSpeakerSelector(options: SpeakerSelectorOptions): SpeakerSelectorHandle {
  let current = options;
  let view = speakerSelectorView(options);
  const group = uid('mh-speakers');
  const rows = new Map<string, SpeakerRow>();
  const legend = h('legend', { class: 'mh-visually-hidden' });
  const list = h('ul', { class: 'mh-speaker-selector__list' });
  const empty = h('p', { class: 'mh-speaker-selector__empty' });
  const el = h('fieldset', { class: 'mh-speaker-selector' }, legend);
  let mode: boolean | null = null;

  const find = (id: string): SpeakerView | undefined => view.speakers.find((s) => s.id === id);

  const makeControl = (r: Pick<SpeakerRow, 'input'>, multiple: boolean): HTMLSpanElement => {
    r.input.className = multiple ? 'mh-checkbox__input mh-speaker-selector__input' : 'mh-radio__input mh-speaker-selector__input';
    r.input.type = multiple ? 'checkbox' : 'radio';
    if (multiple) r.input.removeAttribute('name');
    else r.input.name = group;
    return multiple
      ? h('span', { class: 'mh-checkbox__control' }, r.input, createIcon(mdiCheck, { class: 'mh-checkbox__check' }))
      : h('span', { class: 'mh-radio__control' }, r.input, h('span', { class: 'mh-radio__dot' }));
  };

  const row = (id: string): SpeakerRow => {
    const existing = rows.get(id);
    if (existing) return existing;
    const input = h('input', { type: 'checkbox' });
    const name = h('span', { class: 'mh-speaker-selector__name' });
    const detail = h('span', { class: 'mh-speaker-selector__detail' });
    const range = h('input', { type: 'range', class: 'mh-slider__input', min: 0, max: 100, step: 1 });
    const r: SpeakerRow = {
      el: h('li', {}),
      pick: h('label', { class: 'mh-speaker-selector__pick' }),
      badge: h('span', { class: 'mh-speaker-selector__badge' }),
      icon: null,
      name,
      detail,
      text: h('span', { class: 'mh-speaker-selector__text' }, name),
      bars: h('span', { class: 'mh-speaker-selector__bars', 'aria-hidden': 'true' }, h('span', {}), h('span', {}), h('span', {})),
      control: h('span', {}),
      input,
      volume: h('div', { class: 'mh-speaker-selector__volume' }),
      mute: h('button', { type: 'button', class: speakerSelectorMuteClass() }),
      level: h('div', { class: speakerSelectorLevelClass(false) }, range),
      range,
      dragging: false,
    };
    input.addEventListener('change', () => {
      if (view.multiple || input.checked) current.onSelect?.(id, input.checked);
    });
    r.mute.addEventListener('click', () => current.onMute?.(id, !find(id)?.muted));
    range.addEventListener('input', () => {
      r.dragging = true;
      range.style.setProperty('--_at', String(sliderPosition(Number(range.value))));
      range.setAttribute('aria-valuetext', `${range.value}%`);
    });
    range.addEventListener('change', () => {
      r.dragging = false;
      current.onVolume?.(id, Number(range.value) / 100);
    });
    rows.set(id, r);
    return r;
  };

  const render = (): void => {
    const v = view;
    legend.textContent = v.label;
    if (mode !== null && mode !== v.multiple) for (const r of rows.values()) r.control = makeControl(r, v.multiple);
    mode = v.multiple;
    const seen = new Set<string>();
    const items = v.speakers.map((s) => {
      seen.add(s.id);
      const fresh = !rows.has(s.id);
      const r = row(s.id);
      if (fresh) r.control = makeControl(r, v.multiple);
      r.el.className = s.className;
      if (r.icon !== s.icon) {
        r.icon = s.icon;
        r.badge.replaceChildren(createIcon(s.icon));
      }
      r.name.textContent = s.name;
      r.detail.textContent = s.detail;
      syncChildren(r.text, s.detail ? [r.name, r.detail] : [r.name]);
      syncChildren(r.pick, [r.badge, r.text, ...(s.playing ? [r.bars] : []), r.control]);
      r.input.checked = s.selected;
      r.input.disabled = s.unavailable;
      r.mute.setAttribute('aria-label', s.muteLabel);
      r.mute.title = s.muteLabel;
      r.mute.setAttribute('aria-pressed', String(s.muted));
      const icon = s.muted ? mdiVolumeOff : mdiVolumeHigh;
      if (r.mute.dataset.icon !== icon) {
        r.mute.dataset.icon = icon;
        r.mute.replaceChildren(createIcon(icon));
      }
      r.level.className = speakerSelectorLevelClass(s.muted);
      r.range.setAttribute('aria-label', s.volumeLabel);
      r.range.disabled = s.level === null;
      if (!r.dragging) {
        r.range.value = String(s.level ?? 0);
        r.range.setAttribute('aria-valuetext', `${s.level ?? 0}%`);
        r.range.style.setProperty('--_at', String(sliderPosition(s.level ?? 0)));
      }
      syncChildren(r.volume, [...(s.mute ? [r.mute] : []), ...(s.volume ? [r.level] : [])]);
      syncChildren(r.el, s.mute || s.volume ? [r.pick, r.volume] : [r.pick]);
      return r.el;
    });
    for (const id of [...rows.keys()]) if (!seen.has(id)) rows.delete(id);
    syncChildren(list, items);
    empty.textContent = v.labels.empty;
    syncChildren(el, [legend, v.speakers.length ? list : empty]);
  };
  render();

  return {
    el,
    update(next) {
      current = next;
      view = speakerSelectorView(next);
      render();
    },
  };
}
