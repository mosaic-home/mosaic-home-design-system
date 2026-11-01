import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBottomSheet } from './bottomSheet.ts';
import { confirm } from './confirm.ts';
import { createDialog } from './dialog.ts';
import { createDrawer } from './drawer.ts';
import { createMenu } from './menu.ts';
import { createToaster } from './toast.ts';
import { createTooltip } from './tooltip.ts';

const key = (target: Element, k: string, init: KeyboardEventInit = {}): void => {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
};

beforeEach(() => {
  vi.useFakeTimers();
  document.body.replaceChildren();
  document.documentElement.style.overflow = '';
});
afterEach(() => {
  vi.useRealTimers();
});

describe('bottom sheet', () => {
  it('opens as a labelled modal dialog and closes on Escape, restoring focus', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const reasons: string[] = [];
    const sheet = createBottomSheet({ title: 'Display', content: 'Body', onClose: (r) => reasons.push(r) });
    sheet.open();
    expect(sheet.el.isConnected).toBe(true);
    expect(sheet.el.open).toBe(true);
    expect(sheet.el.className).toBe('mh-overlay mh-sheet');
    expect(sheet.el.getAttribute('aria-modal')).toBe('true');
    const titleId = sheet.el.getAttribute('aria-labelledby')!;
    expect(document.getElementById(titleId)!.textContent).toBe('Display');
    expect(sheet.el.querySelector('.mh-sheet__handle')).not.toBeNull();
    expect(document.activeElement).toBe(sheet.panel);
    expect(document.documentElement.style.overflow).toBe('hidden');

    key(sheet.panel, 'Escape');
    expect(sheet.isOpen()).toBe(false);
    expect(reasons).toEqual(['escape']);
    expect(sheet.el.classList.contains('is-closing')).toBe(true);
    vi.advanceTimersByTime(500);
    expect(sheet.el.isConnected).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('closes on a scrim click only when dismissible', () => {
    const a = createBottomSheet({ title: 'A' });
    a.open();
    a.el.querySelector<HTMLElement>('.mh-overlay__scrim')!.click();
    expect(a.isOpen()).toBe(false);
    const b = createBottomSheet({ title: 'B', dismissible: false });
    b.open();
    b.el.querySelector<HTMLElement>('.mh-overlay__scrim')!.click();
    key(b.panel, 'Escape');
    expect(b.isOpen()).toBe(true);
  });

  it('portals into the nearest themed ancestor of its container', () => {
    const themed = document.createElement('div');
    themed.dataset.mhTheme = 'daylight';
    const inner = document.createElement('div');
    themed.append(inner);
    document.body.append(themed);
    const sheet = createBottomSheet({ title: 'Local', container: inner });
    sheet.open();
    expect(sheet.el.parentElement).toBe(themed);
  });

  it('keeps Tab inside the panel', () => {
    const sheet = createBottomSheet({ title: 'Trap', content: [document.createElement('input')] });
    sheet.open();
    const close = sheet.el.querySelector<HTMLButtonElement>('.mh-sheet__close')!;
    const input = sheet.body.querySelector('input')!;
    input.focus();
    key(input, 'Tab');
    expect(document.activeElement).toBe(close);
    key(close, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(input);
  });

  it('closes from the close button and can reopen while closing', () => {
    const sheet = createBottomSheet({ title: 'Again' });
    sheet.open();
    sheet.el.querySelector<HTMLButtonElement>('.mh-sheet__close')!.click();
    expect(sheet.isOpen()).toBe(false);
    sheet.open();
    vi.advanceTimersByTime(500);
    expect(sheet.isOpen()).toBe(true);
    expect(sheet.el.isConnected).toBe(true);
    expect(sheet.el.classList.contains('is-closing')).toBe(false);
  });
});

describe('drawer and dialog', () => {
  it('drawer carries its side', () => {
    expect(createDrawer({ side: 'left', title: 'Nav' }).el.className).toBe('mh-overlay mh-drawer mh-drawer--left');
    expect(createDrawer({ title: 'Nav' }).el.className).toBe('mh-overlay mh-drawer mh-drawer--right');
  });

  it('dialog focuses its first control and hides an empty footer', () => {
    const input = document.createElement('input');
    const d = createDialog({ title: 'Rename', size: 'small', content: input });
    d.open();
    expect(d.el.className).toBe('mh-overlay mh-dialog mh-dialog--sm');
    expect(document.activeElement).toBe(input);
    expect(d.footer.hidden).toBe(true);
    d.setFooter(document.createElement('button'));
    expect(d.footer.hidden).toBe(false);
  });

  it('uses aria-label without a title', () => {
    const d = createDialog({ label: 'Quick actions', closeButton: false });
    expect(d.el.getAttribute('aria-label')).toBe('Quick actions');
    expect(d.el.querySelector<HTMLElement>('.mh-dialog__header')!.hidden).toBe(true);
  });
});

describe('confirm', () => {
  it('resolves true from the confirm button', async () => {
    const p = confirm({ title: 'Restart?', confirmLabel: 'Restart' });
    const dlg = document.querySelector<HTMLDialogElement>('.mh-confirm')!;
    expect(dlg.getAttribute('role')).toBe('alertdialog');
    expect(document.activeElement).toBe(dlg.querySelector('.mh-confirm__confirm'));
    dlg.querySelector<HTMLButtonElement>('.mh-confirm__confirm')!.click();
    await expect(p).resolves.toBe(true);
  });

  it('resolves false on Escape and focuses Cancel when destructive', async () => {
    const p = confirm({ title: 'Delete?', destructive: true });
    const dlg = document.querySelector<HTMLDialogElement>('.mh-confirm')!;
    expect(dlg.querySelector('.mh-confirm__confirm')!.className).toContain('mh-button--danger');
    expect(document.activeElement).toBe(dlg.querySelector('.mh-confirm__cancel'));
    key(dlg, 'Escape');
    await expect(p).resolves.toBe(false);
  });

  it('type-to-confirm keeps the button disabled until the text matches', async () => {
    const p = confirm({ title: 'Reset?', requireText: 'reset' });
    const dlg = document.querySelector<HTMLDialogElement>('.mh-confirm')!;
    const ok = dlg.querySelector<HTMLButtonElement>('.mh-confirm__confirm')!;
    const input = dlg.querySelector<HTMLInputElement>('.mh-confirm__input')!;
    expect(document.activeElement).toBe(input);
    expect(ok.disabled).toBe(true);
    input.value = 'reset';
    input.dispatchEvent(new Event('input'));
    expect(ok.disabled).toBe(false);
    key(input, 'Enter');
    await expect(p).resolves.toBe(true);
  });
});

describe('toast', () => {
  it('shows in a polite live region and dismisses itself', () => {
    const t = createToaster({ duration: 1000 });
    expect(t.el.getAttribute('aria-live')).toBe('polite');
    expect(t.el.className).toBe('mh-toaster mh-toaster--bottom');
    let gone = 0;
    const handle = t.show({ message: 'Saved', tone: 'success', onDismiss: () => gone++ });
    vi.advanceTimersByTime(150);
    expect(handle.el.isConnected).toBe(true);
    expect(handle.el.className).toBe('mh-toast mh-toast--success');
    vi.advanceTimersByTime(1000);
    expect(gone).toBe(1);
    expect(handle.el.classList.contains('is-leaving')).toBe(true);
    vi.advanceTimersByTime(500);
    expect(handle.el.isConnected).toBe(false);
  });

  it('queues beyond max and marks danger as an alert', () => {
    const t = createToaster({ max: 1, duration: 0 });
    const a = t.show('One');
    const b = t.show({ message: 'Two', tone: 'danger' });
    vi.advanceTimersByTime(150);
    expect(a.el.isConnected).toBe(true);
    expect(b.el.isConnected).toBe(false);
    a.dismiss();
    expect(b.el.isConnected).toBe(true);
    expect(b.el.getAttribute('role')).toBe('alert');
  });

  it('runs the action and pauses while hovered', () => {
    const t = createToaster({ duration: 1000 });
    let undone = false;
    const h = t.show({ message: 'Deleted', action: { label: 'Undo', onClick: () => (undone = true) } });
    vi.advanceTimersByTime(150);
    h.el.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(5000);
    expect(h.el.classList.contains('is-leaving')).toBe(false);
    h.el.querySelector<HTMLButtonElement>('.mh-toast__action')!.click();
    expect(undone).toBe(true);
    expect(h.el.classList.contains('is-leaving')).toBe(true);
  });
});

describe('menu', () => {
  const setup = () => {
    const anchor = document.createElement('button');
    document.body.append(anchor);
    const picked: string[] = [];
    const menu = createMenu({
      anchor,
      items: [{ value: 'edit', label: 'Edit' }, { value: 'archive', label: 'Archive', disabled: true }, { separator: true }, { value: 'delete', label: 'Delete', danger: true }],
      onSelect: (v) => picked.push(v),
    });
    return { anchor, menu, picked };
  };

  it('wires the button and moves a roving focus with the arrow keys', () => {
    const { anchor, menu } = setup();
    expect(anchor.getAttribute('aria-haspopup')).toBe('menu');
    anchor.click();
    expect(menu.isOpen()).toBe(true);
    expect(anchor.getAttribute('aria-expanded')).toBe('true');
    expect(anchor.getAttribute('aria-controls')).toBe(menu.el.id);
    const items = menu.el.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(document.activeElement).toBe(items[0]);
    key(items[0]!, 'ArrowDown');
    expect(document.activeElement).toBe(items[2]); // skips the disabled item
    expect(items[2]!.tabIndex).toBe(0);
    key(items[2]!, 'ArrowDown');
    expect(document.activeElement).toBe(items[0]);
    key(items[0]!, 'End');
    expect(document.activeElement).toBe(items[2]);
    key(items[2]!, 'e');
    expect(document.activeElement).toBe(items[0]);
    key(items[0]!, 'Escape');
    expect(menu.isOpen()).toBe(false);
    expect(document.activeElement).toBe(anchor);
    expect(anchor.getAttribute('aria-expanded')).toBe('false');
  });

  it('selects an item and ignores disabled ones', () => {
    const { anchor, menu, picked } = setup();
    key(anchor, 'ArrowUp');
    const items = menu.el.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(document.activeElement).toBe(items[2]);
    items[1]!.click();
    expect(picked).toEqual([]);
    items[2]!.click();
    expect(picked).toEqual(['delete']);
    expect(menu.isOpen()).toBe(false);
  });
});

describe('tooltip', () => {
  it('describes its target, shows on hover after a delay and hides on Escape', () => {
    const target = document.createElement('button');
    target.title = 'Native';
    document.body.append(target);
    const tip = createTooltip(target, { text: 'Refresh now', delay: 300 });
    expect(target.getAttribute('aria-describedby')).toBe(tip.el.id);
    expect(target.hasAttribute('title')).toBe(false);
    target.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    expect(tip.el.hidden).toBe(true);
    vi.advanceTimersByTime(299);
    expect(tip.el.hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(tip.el.hidden).toBe(false);
    expect(tip.el.getAttribute('role')).toBe('tooltip');
    key(document.body, 'Escape');
    expect(tip.el.hidden).toBe(true);
    tip.destroy();
    expect(tip.el.isConnected).toBe(false);
    expect(target.getAttribute('title')).toBe('Native');
    expect(target.hasAttribute('aria-describedby')).toBe(false);
  });

  it('does not repeat an accessible name that says the same', () => {
    const target = document.createElement('button');
    target.setAttribute('aria-label', 'Settings');
    createTooltip(target, { text: 'Settings' });
    expect(target.hasAttribute('aria-describedby')).toBe(false);
  });
});
