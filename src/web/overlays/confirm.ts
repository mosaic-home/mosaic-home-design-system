import { createButton } from '../actions/button.ts';
import { h, uid } from '../dom.ts';
import { createShell } from './modal.ts';

export interface ConfirmOptions {
  title: string;
  message?: string;
  /** Default "Confirm". */
  confirmLabel?: string;
  /** Default "Cancel". */
  cancelLabel?: string;
  /** A danger-toned confirm button; focus starts on Cancel. */
  destructive?: boolean;
  /** Type-to-confirm: the confirm button stays disabled until this exact text is typed. */
  requireText?: string;
  /** Label of the type-to-confirm field. Default `Type "<requireText>" to confirm`. */
  requireTextLabel?: string;
  container?: HTMLElement | null;
}

/**
 * Asks a yes/no question in a modal `alertdialog` (`.mh-overlay.mh-dialog.mh-confirm`) and resolves `true` for the
 * confirm button, `false` for Cancel, Escape or a scrim click.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const cancel = createButton({ label: options.cancelLabel ?? 'Cancel', variant: 'secondary', onClick: () => shell.dismiss('cancel') });
    const ok = createButton({ label: options.confirmLabel ?? 'Confirm', variant: options.destructive ? 'danger' : 'primary', onClick: () => shell.dismiss('confirm') });
    cancel.el.classList.add('mh-confirm__cancel');
    ok.el.classList.add('mh-confirm__confirm');
    let input: HTMLInputElement | null = null;
    let content: HTMLElement | null = null;
    if (options.requireText) {
      const needed = options.requireText;
      const id = uid('mh-confirm-input');
      input = h('input', { class: 'mh-confirm__input', id, type: 'text', autocomplete: 'off', spellcheck: 'false' });
      content = h('div', { class: 'mh-confirm__field' }, h('label', { class: 'mh-confirm__label', for: id }, options.requireTextLabel ?? `Type "${needed}" to confirm`), input);
      ok.setDisabled(true);
      input.addEventListener('input', () => ok.setDisabled(input!.value !== needed));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input!.value === needed) {
          e.preventDefault();
          shell.dismiss('confirm');
        }
      });
    }
    const shell = createShell({
      block: 'dialog',
      modifiers: ['mh-dialog--sm', 'mh-confirm', options.destructive && 'mh-confirm--destructive'],
      role: 'alertdialog',
      title: options.title,
      description: options.message,
      closeButton: false,
      container: options.container,
      content: content ?? undefined,
      footer: [cancel.el, ok.el],
      initialFocus: () => input ?? (options.destructive ? cancel.el : ok.el),
      onClose: (reason) => resolve(reason === 'confirm'),
    });
    shell.body.hidden = !content;
    shell.open();
  });
}
