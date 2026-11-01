import { mdiEyedropperVariant } from '@mdi/js';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h } from '../dom.ts';
import { createIcon } from '../icons.ts';
import { inputAdornment, inputClass } from '../text-inputs/textField.ts';
import { cssRgba, defaultSwatches, hsvToRgb, parseHex, rgbToHsv, toHex, type Hsva } from './color.ts';

export interface ColorSwatch {
  color: string;
  /** Accessible name (default the hex value). */
  label?: string;
}

export interface ColorPickerOptions {
  /** `#rrggbb`, or `#rrggbbaa` with `alpha`. Default `#ffffff`. */
  value?: string;
  /** Adds the opacity slider; values carry an alpha byte when not opaque. */
  alpha?: boolean;
  /** Quick picks; `false` hides them. Default: a generated set of twelve hues and three greys. */
  swatches?: readonly (string | ColorSwatch)[] | false;
  /** Shows the hex entry (default true). */
  hexInput?: boolean;
  /** Shows the eyedropper where the platform has one (default true). */
  eyedropper?: boolean;
  /** Accessible name of the whole picker (default "Colour"). */
  label?: string;
  disabled?: boolean;
  /** While dragging or typing. */
  onInput?: (value: string) => void;
  /** When a change is committed (drag released, swatch picked, hex entered). */
  onChange?: (value: string) => void;
}

export interface ColorPickerHandle {
  el: HTMLDivElement;
  getValue(): string;
  /** Sets the colour without calling the callbacks; unparseable text is ignored. */
  setValue(value: string): void;
  setDisabled(disabled: boolean): void;
}

interface EyeDropperResult {
  sRGBHex: string;
}
type EyeDropperCtor = new () => { open(): Promise<EyeDropperResult> };

/** The platform's EyeDropper, where there is one. */
export function eyeDropper(): EyeDropperCtor | null {
  const ctor = (globalThis as { EyeDropper?: EyeDropperCtor }).EyeDropper;
  return typeof ctor === 'function' ? ctor : null;
}

const swatchOf = (s: string | ColorSwatch): ColorSwatch => (typeof s === 'string' ? { color: s } : s);
const pct = (n: number): string => `${Math.round(n * 100)}%`;

/**
 * `.mh-color-picker`: a saturation and brightness area (`role="slider"`, arrow keys move it, Shift by ten), a hue
 * slider, an optional opacity slider, a preview, hex entry, the platform eyedropper where available and a row of
 * swatches (`aria-pressed` on the current one). Keeps hue and saturation through greys, so dragging to black and
 * back doesn't lose the colour.
 */
export function createColorPicker(options: ColorPickerOptions = {}): ColorPickerHandle {
  const alpha = options.alpha ?? false;
  let hsva: Hsva = rgbToHsv(parseHex(options.value ?? '') ?? { r: 255, g: 255, b: 255, a: 1 });
  if (!alpha) hsva.a = 1;
  let disabled = false;

  const thumb = h('span', { class: 'mh-color-picker__thumb', 'aria-hidden': 'true' });
  const area = h('div', { class: 'mh-color-picker__area', role: 'slider', tabindex: 0, 'aria-label': 'Saturation and brightness', 'aria-valuemin': 0, 'aria-valuemax': 100 }, thumb);
  const hue = h('input', { type: 'range', class: 'mh-color-picker__range mh-color-picker__hue', min: 0, max: 360, step: 1, 'aria-label': 'Hue' });
  const opacity = alpha ? h('input', { type: 'range', class: 'mh-color-picker__range mh-color-picker__alpha', min: 0, max: 100, step: 1, 'aria-label': 'Opacity' }) : null;
  const preview = h('span', { class: 'mh-color-picker__preview', 'aria-hidden': 'true' });
  const Dropper = options.eyedropper === false ? null : eyeDropper();
  const dropper = Dropper ? h('button', { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-color-picker__eyedropper'), 'aria-label': 'Pick a colour from the screen', title: 'Pick a colour from the screen' }, createIcon(mdiEyedropperVariant)) : null;
  const hex = options.hexInput === false ? null : h('input', { class: 'mh-input__control mh-color-picker__hex', type: 'text', 'aria-label': 'Hex colour', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', maxlength: alpha ? 9 : 7 });
  const hexBox = hex ? h('div', { class: inputClass('small', 'mh-color-picker__hex-box') }, inputAdornment('#'), hex) : null;
  const swatchList = options.swatches === false ? [] : (options.swatches ?? defaultSwatches()).map(swatchOf);
  const swatchButtons = swatchList.map((s) => {
    const parsed = parseHex(s.color);
    const b = h('button', { type: 'button', class: 'mh-color-picker__swatch', 'aria-label': s.label ?? s.color, title: s.label ?? s.color, 'aria-pressed': 'false', 'data-color': parsed ? toHex(parsed, alpha) : s.color });
    if (parsed) b.style.setProperty('--_swatch', cssRgba(parsed));
    return b;
  });
  const swatches = swatchButtons.length ? h('div', { class: 'mh-color-picker__swatches', role: 'group', 'aria-label': 'Swatches' }, ...swatchButtons) : null;

  const el = h(
    'div',
    { class: 'mh-color-picker', role: 'group', 'aria-label': options.label ?? 'Colour' },
    area,
    h('div', { class: 'mh-color-picker__controls' }, preview, h('div', { class: 'mh-color-picker__sliders' }, hue, opacity), dropper),
    hexBox,
    swatches,
  );

  const current = (): string => toHex(hsvToRgb(hsva), alpha);
  const sync = (skipHex = false): void => {
    const rgb = hsvToRgb(hsva);
    const opaque = cssRgba({ ...rgb, a: 1 });
    el.style.setProperty('--_hue', String(Math.round(hsva.h)));
    el.style.setProperty('--_s', String(hsva.s));
    el.style.setProperty('--_v', String(hsva.v));
    el.style.setProperty('--_color', cssRgba(rgb));
    el.style.setProperty('--_opaque', opaque);
    area.setAttribute('aria-valuenow', String(Math.round(hsva.s * 100)));
    area.setAttribute('aria-valuetext', `Saturation ${pct(hsva.s)}, brightness ${pct(hsva.v)}`);
    hue.value = String(Math.round(hsva.h));
    hue.setAttribute('aria-valuetext', `${Math.round(hsva.h)}°`);
    if (opacity) {
      opacity.value = String(Math.round(hsva.a * 100));
      opacity.setAttribute('aria-valuetext', pct(hsva.a));
    }
    const value = current();
    if (hex && !skipHex) {
      hex.value = value.slice(1);
      hex.removeAttribute('aria-invalid');
    }
    for (const b of swatchButtons) b.setAttribute('aria-pressed', String(b.dataset.color === value));
  };
  const emitInput = (): void => options.onInput?.(current());
  const emitChange = (): void => options.onChange?.(current());

  const fromText = (text: string): boolean => {
    const rgba = parseHex(text);
    if (!rgba) return false;
    const next = rgbToHsv(rgba);
    if (!alpha) next.a = 1;
    // Greys and black carry no hue (and black no saturation): keep the ones the picker had.
    if (next.s === 0 || next.v === 0) next.h = hsva.h;
    if (next.v === 0) next.s = hsva.s;
    hsva = next;
    return true;
  };

  // Area: pointer and keyboard.
  const fromPointer = (e: PointerEvent): void => {
    const r = area.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    hsva = { ...hsva, s: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), v: Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height)) };
    sync();
    emitInput();
  };
  let dragging = false;
  area.addEventListener('pointerdown', (e) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    area.focus({ preventScroll: true });
    dragging = true;
    area.setPointerCapture?.(e.pointerId);
    area.classList.add('is-dragging');
    fromPointer(e);
  });
  area.addEventListener('pointermove', (e) => {
    if (dragging) fromPointer(e);
  });
  const endDrag = (): void => {
    if (!dragging) return;
    dragging = false;
    area.classList.remove('is-dragging');
    emitChange();
  };
  area.addEventListener('pointerup', endDrag);
  area.addEventListener('pointercancel', endDrag);
  area.addEventListener('keydown', (e) => {
    if (disabled) return;
    const step = e.shiftKey ? 0.1 : 0.01;
    const rtl = getComputedStyle(el).direction === 'rtl';
    let { s, v } = hsva;
    switch (e.key) {
      case 'ArrowLeft':
        s += rtl ? step : -step;
        break;
      case 'ArrowRight':
        s += rtl ? -step : step;
        break;
      case 'ArrowUp':
        v += step;
        break;
      case 'ArrowDown':
        v -= step;
        break;
      case 'PageUp':
        v += 0.1;
        break;
      case 'PageDown':
        v -= 0.1;
        break;
      case 'Home':
        s = 0;
        break;
      case 'End':
        s = 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    hsva = { ...hsva, s: Math.min(1, Math.max(0, Math.round(s * 100) / 100)), v: Math.min(1, Math.max(0, Math.round(v * 100) / 100)) };
    sync();
    emitInput();
    emitChange();
  });

  hue.addEventListener('input', () => {
    hsva = { ...hsva, h: Number(hue.value) };
    sync();
    emitInput();
  });
  hue.addEventListener('change', emitChange);
  opacity?.addEventListener('input', () => {
    hsva = { ...hsva, a: Number(opacity.value) / 100 };
    sync();
    emitInput();
  });
  opacity?.addEventListener('change', emitChange);

  hex?.addEventListener('input', () => {
    const text = hex.value.trim();
    // Live-apply only full forms, so typing "ff" on the way to "ff8800" doesn't flash a grey.
    if ((text.replace('#', '').length === 6 || (alpha && text.replace('#', '').length === 8)) && fromText(text)) {
      sync(true);
      hex.removeAttribute('aria-invalid');
      emitInput();
    }
  });
  hex?.addEventListener('change', () => {
    if (fromText(hex.value)) {
      sync();
      emitChange();
    } else hex.setAttribute('aria-invalid', 'true');
  });
  hex?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      sync();
    }
  });

  for (const b of swatchButtons) {
    b.addEventListener('click', () => {
      if (b.dataset.color && fromText(b.dataset.color)) {
        sync();
        emitInput();
        emitChange();
      }
    });
  }

  dropper?.addEventListener('click', () => {
    if (!Dropper) return;
    new Dropper()
      .open()
      .then((result) => {
        const keep = hsva.a;
        if (fromText(result.sRGBHex)) {
          hsva.a = keep;
          sync();
          emitInput();
          emitChange();
        }
      })
      .catch(() => {
        // Cancelled with Escape: nothing to do.
      });
  });

  sync();
  const handle: ColorPickerHandle = {
    el,
    getValue: current,
    setValue(value) {
      if (fromText(value)) sync();
    },
    setDisabled(value) {
      disabled = value;
      el.classList.toggle('is-disabled', value);
      area.tabIndex = value ? -1 : 0;
      if (value) area.setAttribute('aria-disabled', 'true');
      else area.removeAttribute('aria-disabled');
      for (const c of [hue, opacity, hex, dropper, ...swatchButtons]) if (c) c.disabled = value;
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
