import { mdiAlertCircleOutline, mdiCheck, mdiMicrophone, mdiUndo } from '@mdi/js';
import { buttonClass } from '../../actions/button.ts';
import { cx, h } from '../../dom.ts';
import { createIcon, type IconName } from '../../icons.ts';
import { syncChildren } from '../children.ts';

/** The lit look of a changed thing's badge, as on the control card. */
export type AssistReplyTone = 'accent' | 'warm' | 'heat' | 'cool';

/** One thing the assistant changed. */
export interface AssistReplyChange {
  /** Kept stable across updates (default the name). */
  id?: string;
  name: string;
  /** Short name or raw MDI path. */
  icon: IconName | string;
  /** Its state now ("Off", "21 °C", "Locked"). */
  state?: string | null;
  /** On, open, playing: the badge takes the lit look. */
  active?: boolean;
  tone?: AssistReplyTone;
  /** The change didn't happen: shown in the danger colour, with `state` or "Didn't respond". */
  failed?: boolean;
}

/** Every word the reply shows or speaks. */
export interface AssistReplyLabels {
  group: string;
  heard: string;
  changes: string;
  failed: string;
  undo: string;
  undone: string;
}

export const ASSIST_REPLY_LABELS: AssistReplyLabels = {
  group: 'Assistant',
  heard: 'You said',
  changes: 'Changed',
  failed: 'Didn’t respond',
  undo: 'Undo',
  undone: 'Undone',
};

export interface AssistReplyData {
  /** The words that were recognised. */
  heard?: string | null;
  /** What the assistant answered. */
  reply?: string | null;
  changes?: readonly AssistReplyChange[];
  /** The assistant couldn't do it: the reply takes the danger colour. */
  error?: boolean;
  /** The undo is running: the button shows a spinner. */
  undoing?: boolean;
  /** The changes were undone: the button gives way to a note. */
  undone?: boolean;
  /** Accessible name (default "Assistant"). */
  label?: string;
  labels?: Partial<AssistReplyLabels>;
}

export interface AssistReplyOptions extends AssistReplyData {
  /** Puts the changes back; without it there is no undo button. */
  onUndo?: () => void;
}

export interface AssistReplyHandle {
  el: HTMLDivElement;
  update(options: AssistReplyOptions): void;
}

export interface AssistReplyChangeView {
  key: string;
  name: string;
  icon: string;
  state: string;
  className: string;
}

export interface AssistReplyView {
  labels: AssistReplyLabels;
  label: string;
  className: string;
  heard: string;
  reply: string;
  changes: AssistReplyChangeView[];
  /** `button`: offer the undo; `done`: say it was undone; `null`: nothing. */
  undo: 'button' | 'done' | null;
  undoing: boolean;
}

/** Everything the reply draws: the same for the web renderer and React. */
export function assistReplyView(data: AssistReplyData & { canUndo?: boolean }): AssistReplyView {
  const labels = { ...ASSIST_REPLY_LABELS, ...data.labels };
  const changes = (data.changes ?? []).map((c, i): AssistReplyChangeView => ({
    key: c.id ?? `${c.name}\u0000${i}`,
    name: c.name,
    icon: c.failed ? mdiAlertCircleOutline : c.icon,
    state: c.state?.trim() || (c.failed ? labels.failed : ''),
    className: cx('mh-assist-reply__change', c.tone && c.tone !== 'accent' && `mh-assist-reply__change--${c.tone}`, c.active && !c.failed && 'is-active', c.failed && 'is-failed'),
  }));
  return {
    labels,
    label: data.label ?? labels.group,
    className: cx('mh-assist-reply', data.error && 'is-error'),
    heard: data.heard?.trim() || '',
    reply: data.reply?.trim() || '',
    changes,
    undo: data.undone ? 'done' : data.canUndo ? 'button' : null,
    undoing: !!data.undoing && !data.undone,
  };
}

/** Classes of the undo button. */
export function assistReplyUndoClass(undoing: boolean): string {
  return cx(buttonClass('text', 'small'), 'mh-assist-reply__undo', undoing && 'is-loading');
}

export const ASSIST_REPLY_UNDO_ICON = mdiUndo;

/**
 * `.mh-assist-reply` (`.is-error`): what a voice assistant understood and did, as a labelled group. `__heard` (the
 * recognised words, with a hidden "You said"), `__reply` (a polite live region, so an updated answer is read
 * out), a `__changes` list of `__change` rows (a `__badge` icon lit like a control card's, `__name`, `__state`;
 * `.is-active`, `.is-failed`, tones `--warm | --heat | --cool`) and a `__footer` with the `__undo` button
 * (`aria-busy` while undoing) or, once undone, the `__undone` note.
 */
export function createAssistReply(options: AssistReplyOptions): AssistReplyHandle {
  let current = options;
  const heardText = h('span', { class: 'mh-assist-reply__heard-text' });
  const heardHidden = h('span', { class: 'mh-visually-hidden' });
  const heard = h('p', { class: 'mh-assist-reply__heard' }, createIcon(mdiMicrophone), heardHidden, heardText);
  const reply = h('p', { class: 'mh-assist-reply__reply', 'aria-live': 'polite' });
  const list = h('ul', { class: 'mh-assist-reply__changes' });
  const undoLabel = h('span', { class: 'mh-button__label' });
  const undo = h('button', { type: 'button', class: assistReplyUndoClass(false) }, createIcon(ASSIST_REPLY_UNDO_ICON), undoLabel);
  undo.addEventListener('click', () => current.onUndo?.());
  const undoneText = h('span', {});
  const undone = h('p', { class: 'mh-assist-reply__undone' }, createIcon(mdiCheck), undoneText);
  const footer = h('div', { class: 'mh-assist-reply__footer' });
  const el = h('div', { role: 'group' });
  const rows = new Map<string, { el: HTMLLIElement; badge: HTMLSpanElement; icon: string; name: HTMLSpanElement; state: HTMLSpanElement; text: HTMLSpanElement }>();

  const render = (): void => {
    const v = assistReplyView({ ...current, canUndo: !!current.onUndo });
    el.className = v.className;
    el.setAttribute('aria-label', v.label);
    heardHidden.textContent = `${v.labels.heard}: `;
    heardText.textContent = v.heard;
    reply.textContent = v.reply;
    list.setAttribute('aria-label', v.labels.changes);

    const seen = new Set<string>();
    const items = v.changes.map((c) => {
      seen.add(c.key);
      let r = rows.get(c.key);
      if (!r) {
        const name = h('span', { class: 'mh-assist-reply__name' });
        r = { el: h('li', {}), badge: h('span', { class: 'mh-assist-reply__badge' }), icon: '', name, state: h('span', { class: 'mh-assist-reply__state' }), text: h('span', { class: 'mh-assist-reply__text' }, name) };
        r.el.append(r.badge, r.text);
        rows.set(c.key, r);
      }
      r.el.className = c.className;
      if (r.icon !== c.icon) {
        r.icon = c.icon;
        r.badge.replaceChildren(createIcon(c.icon));
      }
      r.name.textContent = c.name;
      r.state.textContent = c.state;
      syncChildren(r.text, c.state ? [r.name, r.state] : [r.name]);
      return r.el;
    });
    for (const key of [...rows.keys()]) if (!seen.has(key)) rows.delete(key);
    syncChildren(list, items);

    undoLabel.textContent = v.labels.undo;
    undo.className = assistReplyUndoClass(v.undoing);
    undo.disabled = v.undoing;
    if (v.undoing) undo.setAttribute('aria-busy', 'true');
    else undo.removeAttribute('aria-busy');
    undoneText.textContent = v.labels.undone;
    const moveFocus = v.undo === 'done' && document.activeElement === undo;
    syncChildren(footer, v.undo === 'button' ? [undo] : v.undo === 'done' ? [undone] : []);

    syncChildren(el, [...(v.heard ? [heard] : []), reply, ...(v.changes.length ? [list] : []), ...(v.undo ? [footer] : [])]);
    // The undo button is gone: keep the focus in the reply rather than dropping it to the page.
    if (moveFocus) el.focus();
  };
  el.tabIndex = -1;
  render();

  return {
    el,
    update(next) {
      current = next;
      render();
    },
  };
}
