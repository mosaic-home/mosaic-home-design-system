import { beforeEach, describe, expect, it } from 'vitest';
import { createField, createSearchField, createSelect, createTextArea, createTextField } from '../index.ts';

beforeEach(() => document.body.replaceChildren());

describe('field', () => {
  it('labels the input and wires the message', () => {
    const input = document.createElement('input');
    const f = createField({ label: 'Name', control: input, helper: 'Shown on tiles.' });
    const label = f.el.querySelector('label')!;
    expect(label.htmlFor).toBe(input.id);
    const message = f.el.querySelector('.mh-field__message')!;
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
    expect(message.textContent).toBe('Shown on tiles.');
    expect(message.getAttribute('aria-live')).toBe('polite');
  });

  it('shows errors over helpers and marks the control invalid', () => {
    const input = document.createElement('input');
    const f = createField({ label: 'Name', control: input, helper: 'Hint' });
    f.setError('Required');
    expect(f.el.classList.contains('is-invalid')).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(f.el.querySelector('.mh-field__message')!.textContent).toBe('Required');
    f.setError(undefined);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(f.el.querySelector('.mh-field__message')!.textContent).toBe('Hint');
    f.setHelper(undefined);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect((f.el.querySelector('.mh-field__message') as HTMLElement).hidden).toBe(true);
  });

  it('labels a non-labelable control through aria-labelledby', () => {
    const box = document.createElement('div');
    box.setAttribute('role', 'spinbutton');
    const f = createField({ label: 'Guests', control: box, required: true });
    expect(f.label.tagName).toBe('SPAN');
    expect(box.getAttribute('aria-labelledby')).toBe(f.label.id);
    expect(box.getAttribute('aria-required')).toBe('true');
  });

  it('finds the input inside a box', () => {
    const t = createTextField({ ariaLabel: 'x' });
    const f = createField({ label: 'Name', control: t.el, required: true });
    expect(f.target).toBe(t.input);
    expect(t.input.required).toBe(true);
  });
});

describe('text field', () => {
  it('renders a box inside a field with adornments', () => {
    const t = createTextField({ label: 'Radius', suffix: 'km', icon: 'home', size: 'large', value: '5' });
    expect(t.el.className).toBe('mh-field');
    const box = t.el.querySelector('.mh-input')!;
    expect(box.className).toBe('mh-input mh-input--lg');
    expect(box.querySelectorAll('.mh-input__adornment').length).toBe(2);
    expect(t.input.value).toBe('5');
  });

  it('counts characters', () => {
    const t = createTextField({ label: 'Name', maxLength: 10, showCount: true, value: 'abc' });
    expect(t.el.querySelector('.mh-field__count')!.textContent).toBe('3 / 10');
    t.input.value = 'abcde';
    t.input.dispatchEvent(new Event('input'));
    expect(t.el.querySelector('.mh-field__count')!.textContent).toBe('5 / 10');
  });

  it('reports input and disables', () => {
    let seen = '';
    const t = createTextField({ label: 'Name', onInput: (v) => (seen = v) });
    t.input.value = 'Kitchen';
    t.input.dispatchEvent(new Event('input'));
    expect(seen).toBe('Kitchen');
    t.setDisabled(true);
    expect(t.input.disabled).toBe(true);
    expect(t.el.classList.contains('is-disabled')).toBe(true);
  });

  it('returns the bare box without a label', () => {
    const t = createTextField({ ariaLabel: 'Search' });
    expect(t.el.className).toBe('mh-input');
    expect(t.input.getAttribute('aria-label')).toBe('Search');
  });
});

describe('text area', () => {
  it('renders a multiline box with a counter', () => {
    const t = createTextArea({ label: 'Notes', maxLength: 140, showCount: true, value: 'Hi' });
    expect(t.el.querySelector('.mh-input')!.className).toBe('mh-input mh-input--multiline');
    expect(t.textarea.getAttribute('rows')).toBe('3');
    expect(t.el.querySelector('.mh-field__count')!.textContent).toBe('2 / 140');
  });

  it('sizes itself when connected', () => {
    const t = createTextArea({ label: 'Notes' });
    document.body.append(t.el);
    t.setValue('one\ntwo\nthree');
    expect(t.textarea.style.overflowY).toBe('hidden');
  });
});

describe('search field', () => {
  it('shows the clear button only with text, and clears with Escape', () => {
    let cleared = 0;
    const s = createSearchField({ onClear: () => cleared++ });
    document.body.append(s.el);
    expect(s.input.type).toBe('search');
    expect(s.input.getAttribute('aria-label')).toBe('Search');
    expect(s.clearButton.hidden).toBe(true);
    s.input.value = 'lamp';
    s.input.dispatchEvent(new Event('input'));
    expect(s.clearButton.hidden).toBe(false);
    s.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(s.getValue()).toBe('');
    expect(s.clearButton.hidden).toBe(true);
    expect(cleared).toBe(1);
    expect(document.activeElement).toBe(s.input);
  });

  it('lets Escape bubble when empty and searches on Enter', () => {
    let searched = '';
    let bubbled = 0;
    const s = createSearchField({ onSearch: (v) => (searched = v), value: 'fan' });
    const parent = document.createElement('div');
    parent.addEventListener('keydown', () => bubbled++);
    parent.append(s.el);
    s.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(searched).toBe('fan');
    s.clearButton.click();
    s.input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(bubbled).toBe(2);
  });
});

describe('select', () => {
  it('renders options, groups and a placeholder', () => {
    let picked = '';
    const s = createSelect({
      label: 'Room',
      placeholder: 'Choose',
      options: [{ value: 'a', label: 'A' }, { label: 'More', options: [{ value: 'b', label: 'B' }] }],
      onChange: (v) => (picked = v),
    });
    expect(s.getValue()).toBe('');
    expect(s.select.querySelectorAll('optgroup').length).toBe(1);
    expect(s.el.querySelector('.mh-select__chevron')).not.toBeNull();
    s.select.value = 'b';
    s.select.dispatchEvent(new Event('change'));
    expect(picked).toBe('b');
  });
});
