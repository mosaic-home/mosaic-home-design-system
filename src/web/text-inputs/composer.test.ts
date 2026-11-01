import { beforeEach, describe, expect, it, vi } from 'vitest';
import { composerShouldSubmit, createComposer, createComposerAction } from '../index.ts';

beforeEach(() => document.body.replaceChildren());

const press = (target: HTMLElement, init: KeyboardEventInit): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

describe('composer', () => {
  it('renders a labelled one-line text area in a field with slots', () => {
    const c = createComposer({ placeholder: 'Message', leading: createComposerAction('attach').el, trailing: createComposerAction('send').el });
    expect(c.el.className).toBe('mh-composer');
    expect(c.textarea.getAttribute('rows')).toBe('1');
    expect(c.textarea.getAttribute('aria-label')).toBe('Message');
    const row = c.el.querySelector('.mh-composer__field > .mh-composer__row')!;
    expect([...row.children].map((e) => e.className)).toEqual(['mh-composer__leading', 'mh-composer__input', 'mh-composer__trailing']);
    expect(row.querySelector('.mh-composer__trailing button')!.className).toBe('mh-icon-button mh-icon-button--accent mh-icon-button--filled');
    expect(row.querySelector('.mh-composer__leading button')!.getAttribute('aria-label')).toBe('Attach');
    expect((c.el.querySelector('.mh-composer__notice') as HTMLElement).hidden).toBe(true);
  });

  it('leaves out empty slots', () => {
    const c = createComposer({});
    expect(c.el.querySelector('.mh-composer__leading, .mh-composer__trailing')).toBeNull();
  });

  it('reports input and sends non-blank text on Enter when Enter always sends', () => {
    const onInput = vi.fn();
    const onSubmit = vi.fn();
    const c = createComposer({ enterSends: 'always', onInput, onSubmit });
    document.body.append(c.el);
    c.textarea.value = 'Hello';
    c.textarea.dispatchEvent(new Event('input'));
    expect(onInput).toHaveBeenCalledWith('Hello', expect.any(Event));
    expect(press(c.textarea, { key: 'Enter' }).defaultPrevented).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith('Hello');
    expect(press(c.textarea, { key: 'Enter', shiftKey: true }).defaultPrevented).toBe(false);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    c.setValue('   ');
    press(c.textarea, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(c.textarea.getAttribute('enterkeyhint')).toBe('send');
  });

  it('never sends on Enter with enterSends never, and not while disabled', () => {
    const onSubmit = vi.fn();
    const c = createComposer({ enterSends: 'never', value: 'Hi', onSubmit });
    expect(press(c.textarea, { key: 'Enter' }).defaultPrevented).toBe(false);
    expect(press(c.textarea, { key: 'Enter', ctrlKey: true }).defaultPrevented).toBe(false);
    c.submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    c.setDisabled(true);
    c.submit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('decides Enter by the pointer in auto mode', () => {
    expect(composerShouldSubmit('auto', { key: 'Enter' }, true)).toBe(true);
    expect(composerShouldSubmit('auto', { key: 'Enter' }, false)).toBe(false);
    expect(composerShouldSubmit('auto', { key: 'Enter', ctrlKey: true }, false)).toBe(true);
    expect(composerShouldSubmit('auto', { key: 'Enter', shiftKey: true }, true)).toBe(false);
    expect(composerShouldSubmit('always', { key: 'Enter', isComposing: true }, true)).toBe(false);
    expect(composerShouldSubmit('always', { key: 'a' }, true)).toBe(false);
  });

  it('shows the disabled reason with a retry and describes the text area with it', () => {
    const onRetry = vi.fn();
    const c = createComposer({ disabled: true, disabledReason: 'Not connected.', onRetry });
    expect(c.el.className).toBe('mh-composer is-disabled');
    expect(c.textarea.disabled).toBe(true);
    const notice = c.el.querySelector('.mh-composer__notice') as HTMLElement;
    expect(notice.hidden).toBe(false);
    const reason = notice.querySelector('.mh-composer__reason')!;
    expect(reason.textContent).toBe('Not connected.');
    expect(c.textarea.getAttribute('aria-describedby')).toBe(reason.id);
    (notice.querySelector('button') as HTMLButtonElement).click();
    expect(onRetry).toHaveBeenCalled();
    c.setDisabled(false);
    expect(notice.hidden).toBe(true);
    expect(c.textarea.hasAttribute('aria-describedby')).toBe(false);
  });

  it('shows a mode chip that can be cleared', () => {
    const onClear = vi.fn();
    const c = createComposer({ mode: { label: 'Automation', hint: 'Describe it', icon: 'lightbulb', onClear } });
    expect(c.el.classList.contains('mh-composer--mode')).toBe(true);
    const chip = c.el.querySelector('.mh-composer__field > .mh-composer__mode')!;
    expect(chip.querySelector('.mh-composer__mode-label')!.textContent).toBe('Automation');
    expect(chip.querySelector('.mh-composer__mode-hint')!.textContent).toBe('Describe it');
    expect(c.textarea.getAttribute('aria-describedby')).toBe(chip.querySelector('.mh-composer__mode-text')!.id);
    const clear = chip.querySelector('button')!;
    expect(clear.getAttribute('aria-label')).toBe('Clear Automation');
    clear.click();
    expect(onClear).toHaveBeenCalled();
    c.setMode(null);
    expect(c.el.querySelector('.mh-composer__mode')).toBeNull();
    expect(c.el.className).toBe('mh-composer');
  });

  it('lists suggestions as buttons above the field', () => {
    const onSuggestion = vi.fn();
    const c = createComposer({ suggestions: ['Lights off', 'Lock up'], onSuggestion });
    const row = c.el.firstElementChild!;
    expect(row.className).toBe('mh-composer__suggestions');
    expect(row.getAttribute('role')).toBe('group');
    const buttons = row.querySelectorAll('button');
    expect([...buttons].map((b) => b.textContent)).toEqual(['Lights off', 'Lock up']);
    buttons[1]!.click();
    expect(onSuggestion).toHaveBeenCalledWith('Lock up');
    c.setDisabled(true);
    expect(buttons[0]!.disabled).toBe(true);
    c.setSuggestions([]);
    expect(c.el.querySelector('.mh-composer__suggestions')).toBeNull();
  });
});
