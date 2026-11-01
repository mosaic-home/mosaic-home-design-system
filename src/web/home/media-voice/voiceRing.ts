import { mdiAlertCircleOutline, mdiMicrophone, mdiMicrophoneOff, mdiVolumeHigh } from '@mdi/js';
import { cx, h } from '../../dom.ts';
import { createIcon } from '../../icons.ts';
import { VOICE_PHASE_LABELS, voiceLevel, type VoicePhase } from '../../feedback/voiceBar.ts';

/** The voice bar's phases (`listening`, `transcribing`, `thinking`, `speaking`, `idle`), plus `muted` and `error`. */
export type VoiceRingPhase = VoicePhase | 'muted' | 'error';

export type VoiceRingSize = 'medium' | 'large';

/** Default status text per phase; `idle` reads "Tap to talk" only when the ring can be tapped. */
export const VOICE_RING_LABELS: Readonly<Record<VoiceRingPhase, string>> = {
  ...VOICE_PHASE_LABELS,
  idle: 'Ready',
  muted: 'Microphone off',
  error: 'Something went wrong',
};

export interface VoiceRingOptions {
  /** Default `idle`. */
  phase?: VoiceRingPhase;
  /** Input level, 0 to 1: the ring swells with it while listening. */
  level?: number;
  /** Status text; defaults to the phase's (`VOICE_RING_LABELS`). */
  label?: string;
  /** A second line: what has been heard so far, or what went wrong. */
  detail?: string;
  /** Default `large`. */
  size?: VoiceRingSize;
  /** Makes the ring a button (start listening, interrupt). Without it the ring is a picture. */
  onTap?: () => void;
}

export interface VoiceRingHandle {
  el: HTMLDivElement;
  setPhase(phase: VoiceRingPhase): void;
  setLevel(level: number): void;
  /** `undefined` goes back to the phase's text. */
  setLabel(label: string | undefined): void;
  setDetail(detail: string | undefined): void;
}

export function voiceRingClass(phase: VoiceRingPhase = 'idle', size: VoiceRingSize = 'large'): string {
  return cx('mh-voice-ring', size !== 'large' && `mh-voice-ring--${size}`, `is-${phase}`);
}

/** The status text shown and spoken. */
export function voiceRingText(phase: VoiceRingPhase, label: string | undefined, tappable: boolean): string {
  if (label !== undefined) return label;
  return phase === 'idle' && tappable ? VOICE_PHASE_LABELS.idle : VOICE_RING_LABELS[phase];
}

/** The icon in the middle of the ring. */
export function voiceRingIcon(phase: VoiceRingPhase): string {
  return phase === 'muted' ? mdiMicrophoneOff : phase === 'error' ? mdiAlertCircleOutline : phase === 'speaking' ? mdiVolumeHigh : mdiMicrophone;
}

/**
 * `.mh-voice-ring` (`--medium`; `.is-idle | is-listening | is-transcribing | is-thinking | is-speaking | is-muted |
 * is-error`): the big ring of a voice satellite or a listening screen. The `__ring` (a `<button>` with `onTap`,
 * else hidden from assistive technology) holds a `__halo` that swells with `--_level` while listening, the
 * coloured `__band` (the voice bar's series colours; it turns while transcribing or thinking and beats while
 * speaking) and the `__core` with the phase's icon. Below, the `__label` (a polite live region) and an optional
 * `__detail`. With reduced motion nothing turns or beats; listening shows the level by brightness alone.
 */
export function createVoiceRing(options: VoiceRingOptions = {}): VoiceRingHandle {
  let phase = options.phase ?? 'idle';
  let custom = options.label;
  const size = options.size ?? 'large';
  const tappable = !!options.onTap;
  const text = (): string => voiceRingText(phase, custom, tappable);

  const core = h('span', { class: 'mh-voice-ring__core' });
  const parts = [h('span', { class: 'mh-voice-ring__halo' }), h('span', { class: 'mh-voice-ring__band' }), core];
  const ring = tappable ? h('button', { type: 'button', class: 'mh-voice-ring__ring' }, ...parts) : h('span', { class: 'mh-voice-ring__ring', 'aria-hidden': 'true' }, ...parts);
  if (options.onTap) ring.addEventListener('click', () => options.onTap!());
  const label = h('p', { class: 'mh-voice-ring__label', 'aria-live': 'polite' });
  const detail = h('p', { class: 'mh-voice-ring__detail' });
  const el = h('div', { class: voiceRingClass(phase, size) }, ring, label);
  let icon = '';

  const handle: VoiceRingHandle = {
    el,
    setPhase(next) {
      phase = next;
      el.className = voiceRingClass(phase, size);
      const want = voiceRingIcon(phase);
      if (want !== icon) {
        icon = want;
        core.replaceChildren(createIcon(want));
      }
      handle.setLabel(custom);
    },
    setLevel(level) {
      ring.style.setProperty('--_level', String(voiceLevel(level)));
    },
    setLabel(value) {
      custom = value;
      label.textContent = text();
      if (tappable) ring.setAttribute('aria-label', text());
    },
    setDetail(value) {
      const t = value?.trim() ?? '';
      detail.textContent = t;
      if (t) el.append(detail);
      else detail.remove();
    },
  };
  handle.setPhase(phase);
  handle.setLevel(options.level ?? 0);
  handle.setDetail(options.detail);
  return handle;
}
