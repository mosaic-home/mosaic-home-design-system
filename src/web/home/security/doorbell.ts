import { mdiBellRing, mdiClose, mdiDoorbellVideo, mdiMicrophone, mdiPhone, mdiPhoneHangup } from '@mdi/js';
import { buttonClass, createButton, type ButtonHandle, type ButtonVariant } from '../../actions/button.ts';
import { cx, h, uid } from '../../dom.ts';
import { createIcon } from '../../icons.ts';
import { watchCameraRefresh, type CameraRefresher } from '../cameraTile.ts';
import { syncChildren } from '../children.ts';

/** Every visible and spoken word, for translation. */
export interface DoorbellLabels {
  /** The heading when the app doesn't know who rang. */
  title: string;
  answer: string;
  talk: string;
  dismiss: string;
  /** The dismiss button once answered. */
  end: string;
  /** Alternative text of the picture: `{door}` is replaced by the door's name. */
  picture: string;
  /** Shown when there is no picture. */
  noPicture: string;
}

export const DOORBELL_LABELS: DoorbellLabels = {
  title: 'Someone is at the door',
  answer: 'Answer',
  talk: 'Talk',
  dismiss: 'Dismiss',
  end: 'End',
  picture: 'Live picture from {door}',
  noPicture: 'No picture',
};

export interface DoorbellOptions {
  /** The door or doorbell ("Front door"). */
  door: string;
  /** Who rang, when the app knows ("Parcel delivery"); else the default title. */
  visitor?: string | null;
  /** When it rang, as the app words it ("Just now", "10:42"). */
  when?: string | null;
  /** The live picture: any image URL, or null. */
  src?: string | null;
  /** Reloads the picture every this many seconds while it is visible (default 1). 0 for a still. */
  refreshEvery?: number | null;
  /** Width / height of the picture (default 4 / 3). */
  aspect?: number;
  /** Takes over the screen: fixed over everything, focus kept inside, Escape dismisses. */
  takeover?: boolean;
  /** The bell rings (animated) until answered or dismissed (default true). */
  ringing?: boolean;
  /** The call is answered: Answer goes away, Dismiss reads "End". */
  answered?: boolean;
  /** Talking now (the Talk toggle is pressed). */
  talking?: boolean;
  /** Offer Answer (default true when `onAnswer` is given). */
  canAnswer?: boolean;
  /** Offer Talk (default true when `onTalk` is given). */
  canTalk?: boolean;
  labels?: Partial<DoorbellLabels>;
  onAnswer?: () => void;
  /** Talk pressed: the wanted talking state. */
  onTalk?: (talking: boolean) => void;
  onDismiss?: () => void;
}

export interface DoorbellHandle {
  el: HTMLDivElement;
  /** Applies changed options; omitted ones keep their value. */
  update(changes: Partial<DoorbellOptions>): void;
  /** Moves focus to the first action (Answer when offered). */
  focus(): void;
  /** Stops refreshing the picture. */
  destroy(): void;
}

export const DOORBELL_ASPECT = 4 / 3;

export function doorbellLabels(labels: Partial<DoorbellLabels> | undefined): DoorbellLabels {
  return { ...DOORBELL_LABELS, ...labels };
}

export function doorbellClass(o: Pick<DoorbellOptions, 'takeover' | 'ringing' | 'answered' | 'talking'> & { picture?: boolean }): string {
  return cx('mh-doorbell', o.takeover && 'mh-doorbell--takeover', (o.ringing ?? true) && !o.answered && 'is-ringing', o.answered && 'is-answered', o.talking && 'is-talking', !o.picture && 'is-empty');
}

export interface DoorbellButton {
  action: 'answer' | 'talk' | 'dismiss';
  label: string;
  icon: string;
  variant: ButtonVariant;
  /** `aria-pressed` for the Talk toggle. */
  pressed?: boolean;
}

/** The buttons the options call for, in order. */
export function doorbellButtons(o: DoorbellOptions): DoorbellButton[] {
  const l = doorbellLabels(o.labels);
  const out: DoorbellButton[] = [];
  if (!o.answered && (o.canAnswer ?? !!o.onAnswer)) out.push({ action: 'answer', label: l.answer, icon: mdiPhone, variant: 'primary' });
  if (o.canTalk ?? !!o.onTalk) out.push({ action: 'talk', label: l.talk, icon: mdiMicrophone, variant: 'tonal', pressed: !!o.talking });
  out.push({ action: 'dismiss', label: o.answered ? l.end : l.dismiss, icon: o.answered ? mdiPhoneHangup : mdiClose, variant: o.answered ? 'danger' : 'secondary' });
  return out;
}

/** Classes of one action button. */
export function doorbellButtonClass(b: DoorbellButton): string {
  return cx(buttonClass(b.variant, 'large'), 'mh-doorbell__action', `mh-doorbell__action--${b.action}`);
}

/** The heading and the line under it. */
export function doorbellText(o: DoorbellOptions): { title: string; detail: string } {
  const l = doorbellLabels(o.labels);
  return { title: o.visitor?.trim() || l.title, detail: [o.door, o.when?.trim()].filter(Boolean).join(' · ') };
}

/** CSS `aspect-ratio` of the picture. */
export function doorbellAspect(aspect: number | undefined): string {
  const a = aspect && aspect > 0 && Number.isFinite(aspect) ? aspect : DOORBELL_ASPECT;
  return String(Math.round(a * 10000) / 10000);
}

const FOCUSABLE = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside `root` (a takeover): from the last focusable element to the first and back. Returns whether
 * it moved focus.
 */
export function doorbellTrapTab(root: HTMLElement, event: KeyboardEvent | { key: string; shiftKey: boolean; preventDefault(): void }): boolean {
  if (event.key !== 'Tab') return false;
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) return false;
  const first = items[0]!;
  const last = items[items.length - 1]!;
  const active = root.ownerDocument.activeElement;
  const inside = !!active && root.contains(active);
  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

/** The refresh period: default one second for a live picture. */
export const doorbellRefresh = (refreshEvery: number | null | undefined): number => (refreshEvery === undefined ? 1 : (refreshEvery ?? 0));

/**
 * `.mh-doorbell`: a ring that asks for attention. `role="alertdialog"` named by the `__title` (who rang) and
 * described by the `__detail` (door and when); a `__header` with the ringing `__bell`, then the `__picture`
 * (`__placeholder` under a live `__image` refreshed off-screen like the camera tile) and the `__actions`: Answer,
 * Talk (a toggle, `aria-pressed`) and Dismiss (End once answered). With `takeover` it covers the screen
 * (`--takeover`, `aria-modal`), keeps Tab inside and dismisses on Escape; call `focus()` once it is on screen.
 * States `.is-ringing` (until answered), `.is-answered`, `.is-talking`, `.is-empty` without a picture.
 */
export function createDoorbell(options: DoorbellOptions): DoorbellHandle {
  let o: DoorbellOptions = { ...options };
  let failed = false;
  let refresher: CameraRefresher | null = null;
  let watched: { src: string | null; every: number } | null = null;
  const titleId = uid('mh-doorbell-title');
  const detailId = uid('mh-doorbell-detail');

  const bell = h('span', { class: 'mh-doorbell__bell', 'aria-hidden': 'true' }, createIcon(mdiBellRing));
  const title = h('h2', { class: 'mh-doorbell__title', id: titleId });
  const detail = h('p', { class: 'mh-doorbell__detail', id: detailId });
  const header = h('div', { class: 'mh-doorbell__header' }, bell, h('div', { class: 'mh-doorbell__text' }, title, detail));
  const placeholderText = h('span', { class: 'mh-doorbell__placeholder-text' });
  const placeholder = h('span', { class: 'mh-doorbell__placeholder' }, createIcon(mdiDoorbellVideo), placeholderText);
  const image = h('img', { class: 'mh-doorbell__image', alt: '', decoding: 'async', referrerpolicy: 'no-referrer' });
  const picture = h('div', { class: 'mh-doorbell__picture' }, placeholder);
  const actions = h('div', { class: 'mh-doorbell__actions' });
  const panel = h('div', { class: 'mh-doorbell__panel' }, header, picture, actions);
  const el = h('div', { role: 'alertdialog', 'aria-labelledby': titleId, 'aria-describedby': detailId }, panel);
  const buttons = new Map<string, ButtonHandle>();
  let shown = '';

  image.addEventListener('error', () => {
    failed = true;
    render();
  });
  image.addEventListener('load', () => {
    if (failed) {
      failed = false;
      render();
    }
  });
  el.addEventListener('keydown', (event) => {
    if (!o.takeover) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      o.onDismiss?.();
      return;
    }
    doorbellTrapTab(el, event);
  });

  const pressed = (action: DoorbellButton['action']): void => {
    if (action === 'answer') o.onAnswer?.();
    else if (action === 'talk') o.onTalk?.(!o.talking);
    else o.onDismiss?.();
  };

  const render = (): void => {
    const l = doorbellLabels(o.labels);
    const text = doorbellText(o);
    const has = !!o.src && !failed;
    el.className = doorbellClass({ ...o, picture: has });
    if (o.takeover) el.setAttribute('aria-modal', 'true');
    else el.removeAttribute('aria-modal');
    title.textContent = text.title;
    detail.textContent = text.detail;
    placeholderText.textContent = l.noPicture;
    picture.style.aspectRatio = doorbellAspect(o.aspect);
    image.alt = l.picture.replace('{door}', o.door);
    if (has) {
      if (image.getAttribute('src') === null || watched?.src !== o.src) image.src = o.src!;
      if (image.parentNode !== picture) picture.append(image);
    } else image.remove();
    const every = doorbellRefresh(o.refreshEvery);
    if (!watched || watched.src !== (o.src ?? null) || watched.every !== every) {
      refresher?.stop();
      watched = { src: o.src ?? null, every };
      refresher = o.src ? watchCameraRefresh(el, o.src, every, (url) => (image.src = url)) : null;
    }

    const wanted = doorbellButtons(o);
    const key = wanted.map((b) => b.action).join();
    if (key !== shown) {
      shown = key;
      const keep = new Map(buttons);
      buttons.clear();
      for (const b of wanted) {
        const made = keep.get(b.action) ?? createButton({ label: b.label, icon: b.icon, variant: b.variant, size: 'large', onClick: () => pressed(b.action) });
        buttons.set(b.action, made);
      }
      syncChildren(
        actions,
        wanted.map((b) => buttons.get(b.action)!.el),
      );
    }
    for (const b of wanted) {
      const button = buttons.get(b.action)!;
      button.el.className = doorbellButtonClass(b);
      button.setLabel(b.label);
      const iconEl = button.el.querySelector('.mh-icon');
      const fresh = createIcon(b.icon);
      if (iconEl && iconEl.querySelector('path')?.getAttribute('d') !== fresh.querySelector('path')?.getAttribute('d')) iconEl.replaceWith(fresh);
      if (b.pressed !== undefined) button.el.setAttribute('aria-pressed', String(b.pressed));
      else button.el.removeAttribute('aria-pressed');
    }
  };
  render();

  return {
    el,
    update(changes) {
      if ('src' in changes && changes.src !== o.src) failed = false;
      o = { ...o, ...changes };
      render();
    },
    focus() {
      el.querySelector<HTMLButtonElement>('.mh-doorbell__action')?.focus();
    },
    destroy() {
      refresher?.stop();
      refresher = null;
    },
  };
}
