import { mdiClose, mdiFileOutline, mdiTrayArrowUp } from '@mdi/js';
import { buttonClass } from '../actions/button.ts';
import { iconButtonClass } from '../actions/iconButton.ts';
import { cx, h, uid } from '../dom.ts';
import { createIcon, type IconName } from '../icons.ts';

export type FileRejectionReason = 'type' | 'size' | 'count';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

export interface FileDropZoneOptions {
  /** Main line (default "Drop files here"; on touch screens only the button shows). */
  title?: string;
  /** What's accepted, e.g. "PNG or JPG, up to 5 MB". */
  hint?: string;
  /** The browse button (default "Browse files", or "Choose a file" with `multiple: false`). */
  buttonLabel?: string;
  icon?: IconName | string;
  /** Like the input's `accept`: MIME types (`image/*`, `application/pdf`) and extensions (`.json`). */
  accept?: string;
  /** Allows several files (default true). */
  multiple?: boolean;
  /** Largest file in bytes. */
  maxSize?: number;
  /** Most files kept in the list (with `multiple`). */
  maxFiles?: number;
  /** Lists the kept files with remove buttons (default true). */
  showList?: boolean;
  name?: string;
  disabled?: boolean;
  locale?: string;
  /** Files were added (accepted ones) and refused (with why). */
  onFiles?: (accepted: File[], rejected: FileRejection[]) => void;
  /** The kept list changed (added or removed). */
  onChange?: (files: File[]) => void;
}

export interface FileDropZoneHandle {
  el: HTMLDivElement;
  input: HTMLInputElement;
  button: HTMLButtonElement;
  getFiles(): File[];
  /** Adds files as if dropped (validated the same way). */
  addFiles(files: Iterable<File>): void;
  removeFile(index: number): void;
  clear(): void;
  setError(text: string | undefined): void;
  setDisabled(disabled: boolean): void;
}

/** Whether a file matches an `accept` list (MIME types, `type/*` wildcards and `.ext` extensions). */
export function fileAccepted(file: Pick<File, 'name' | 'type'>, accept?: string): boolean {
  if (!accept?.trim()) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return accept
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => (rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule));
}

/** "4.2 MB": a byte count in the largest unit that keeps it at or above one. */
export function formatFileSize(bytes: number, locale?: string): string {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;
  let n = Math.max(0, bytes);
  let u = 0;
  while (n >= 1000 && u < units.length - 1) {
    n /= 1000;
    u += 1;
  }
  return new Intl.NumberFormat(locale, { style: 'unit', unit: units[u], unitDisplay: u === 0 ? 'long' : 'short', maximumFractionDigits: n < 10 && u > 0 ? 1 : 0 }).format(n);
}

/** The sentence shown for refused files. */
export function rejectionMessage(rejected: readonly FileRejection[], options: { maxSize?: number; maxFiles?: number; locale?: string } = {}): string {
  if (rejected.length === 0) return '';
  const first = rejected[0]!;
  const more = rejected.length > 1 ? ` (and ${rejected.length - 1} more)` : '';
  switch (first.reason) {
    case 'type':
      return `${first.file.name} isn't a file type this accepts${more}.`;
    case 'size':
      return `${first.file.name} is larger than ${formatFileSize(options.maxSize ?? 0, options.locale)}${more}.`;
    default:
      return options.maxFiles === 1 ? 'Only one file can be added.' : `Up to ${options.maxFiles ?? 0} files can be added.`;
  }
}

/** Whether a drag carries files (not text or a link). */
const hasFiles = (e: DragEvent): boolean => !!e.dataTransfer && [...(e.dataTransfer.types ?? [])].includes('Files');

/**
 * `.mh-drop-zone`: a dashed area that takes dropped files (`.is-dragover` while files hover) and a Browse button
 * for the native file chooser, so it works the same without a mouse, on touch screens and from the keyboard.
 * Checks type, size and count; refusals are announced in a live message (`.is-invalid`). Kept files are listed with
 * their sizes and remove buttons.
 */
export function createFileDropZone(options: FileDropZoneOptions = {}): FileDropZoneHandle {
  const multiple = options.multiple ?? true;
  let files: File[] = [];
  let disabled = false;
  let dragDepth = 0;

  const input = h('input', { type: 'file', class: 'mh-drop-zone__input', tabindex: -1, 'aria-hidden': 'true', accept: options.accept, multiple, name: options.name, id: uid('mh-drop-input') });
  const titleId = uid('mh-drop-title');
  const hintId = uid('mh-drop-hint');
  const messageId = uid('mh-drop-message');
  const button = h(
    'button',
    { type: 'button', class: cx(buttonClass('secondary', 'small'), 'mh-drop-zone__button'), 'aria-describedby': cx(options.hint ? hintId : null, messageId) },
    h('span', { class: 'mh-button__label' }, options.buttonLabel ?? (multiple ? 'Browse files' : 'Choose a file')),
  );
  const area = h(
    'div',
    { class: 'mh-drop-zone__area' },
    createIcon(options.icon ?? mdiTrayArrowUp, { class: 'mh-drop-zone__icon' }),
    h('p', { class: 'mh-drop-zone__title', id: titleId }, options.title ?? (multiple ? 'Drop files here' : 'Drop a file here')),
    options.hint ? h('p', { class: 'mh-drop-zone__hint', id: hintId }, options.hint) : null,
    button,
  );
  const message = h('p', { class: 'mh-drop-zone__message', id: messageId, 'aria-live': 'polite', hidden: true });
  const list = h('ul', { class: 'mh-drop-zone__list', hidden: true, 'aria-label': 'Added files' });
  const el = h('div', { class: 'mh-drop-zone' }, input, area, message, options.showList === false ? null : list);

  const setMessage = (text: string | undefined): void => {
    message.textContent = text ?? '';
    message.hidden = !text;
    el.classList.toggle('is-invalid', !!text);
  };

  const renderList = (): void => {
    if (options.showList === false) return;
    list.hidden = files.length === 0;
    list.replaceChildren(
      ...files.map((f, i) => {
        const remove = h('button', { type: 'button', class: cx(iconButtonClass('default', 'small'), 'mh-drop-zone__remove'), 'aria-label': `Remove ${f.name}`, title: 'Remove' }, createIcon(mdiClose));
        remove.disabled = disabled;
        remove.addEventListener('click', () => {
          handle.removeFile(i);
          // Keep focus in the list: the next row's button, else the previous one, else Browse.
          const buttons = list.querySelectorAll<HTMLButtonElement>('.mh-drop-zone__remove');
          (buttons[Math.min(i, buttons.length - 1)] ?? button).focus();
        });
        return h(
          'li',
          { class: 'mh-drop-zone__file' },
          createIcon(mdiFileOutline, { class: 'mh-drop-zone__file-icon' }),
          h('span', { class: 'mh-drop-zone__file-name', title: f.name }, f.name),
          h('span', { class: 'mh-drop-zone__file-size' }, formatFileSize(f.size, options.locale)),
          remove,
        );
      }),
    );
  };

  const add = (incoming: Iterable<File>): void => {
    if (disabled) return;
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const room = !multiple ? 1 : (options.maxFiles ?? Infinity);
    for (const file of incoming) {
      if (!fileAccepted(file, options.accept)) rejected.push({ file, reason: 'type' });
      else if (options.maxSize !== undefined && file.size > options.maxSize) rejected.push({ file, reason: 'size' });
      else accepted.push(file);
    }
    let kept: File[];
    if (multiple) {
      const free = Math.max(0, room - files.length);
      kept = accepted.slice(0, free);
      for (const file of accepted.slice(free)) rejected.push({ file, reason: 'count' });
      files = [...files, ...kept];
    } else {
      // One file: a new one replaces the old; extra ones in the same drop are refused.
      kept = accepted.slice(0, 1);
      for (const file of accepted.slice(1)) rejected.push({ file, reason: 'count' });
      if (kept.length) files = kept;
    }
    setMessage(rejectionMessage(rejected, { maxSize: options.maxSize, maxFiles: multiple ? options.maxFiles : 1, locale: options.locale }) || undefined);
    renderList();
    options.onFiles?.(kept, rejected);
    if (kept.length) options.onChange?.([...files]);
  };

  button.addEventListener('click', () => {
    if (!disabled) input.click();
  });
  // A press anywhere on the area opens the chooser too (touch screens have no drag and drop).
  area.addEventListener('click', (e) => {
    if (!disabled && e.target !== button && !button.contains(e.target as Node)) input.click();
  });
  input.addEventListener('change', () => {
    if (input.files) add([...input.files]);
    // Reset so choosing the same file again still fires `change`.
    input.value = '';
  });

  el.addEventListener('dragenter', (e) => {
    if (disabled || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth += 1;
    el.classList.add('is-dragover');
  });
  el.addEventListener('dragover', (e) => {
    if (disabled || !hasFiles(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  });
  el.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) el.classList.remove('is-dragover');
  });
  el.addEventListener('drop', (e) => {
    if (disabled || !hasFiles(e)) return;
    e.preventDefault();
    dragDepth = 0;
    el.classList.remove('is-dragover');
    add([...(e.dataTransfer?.files ?? [])]);
  });

  const handle: FileDropZoneHandle = {
    el,
    input,
    button,
    getFiles: () => [...files],
    addFiles: (incoming) => add(incoming),
    removeFile(index) {
      if (index < 0 || index >= files.length) return;
      files = files.filter((_, i) => i !== index);
      setMessage(undefined);
      renderList();
      options.onChange?.([...files]);
    },
    clear() {
      files = [];
      setMessage(undefined);
      renderList();
    },
    setError: setMessage,
    setDisabled(value) {
      disabled = value;
      el.classList.toggle('is-disabled', value);
      button.disabled = value;
      input.disabled = value;
      renderList();
    },
  };
  if (options.disabled) handle.setDisabled(true);
  return handle;
}
