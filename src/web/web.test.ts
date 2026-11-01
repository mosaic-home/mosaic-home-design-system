import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, createButton, createDivider, createIcon, createIconButton, createText } from './index.ts';

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  document.body.replaceChildren();
});

describe('applyTheme', () => {
  it('sets variables and data attributes', () => {
    const tokens = applyTheme('daylight', { deviceClass: 'tablet', character: { corners: 'soft' } });
    const root = document.documentElement;
    expect(root.dataset.mhTheme).toBe('daylight');
    expect(root.dataset.mhDevice).toBe('tablet');
    expect(root.dataset.mhMode).toBe('light');
    expect(root.dataset.mhCorners).toBe('soft');
    expect(root.style.getPropertyValue('--mh-accent')).toBe('#2f62f5');
    expect(root.style.getPropertyValue('--mh-text-body')).toBe(`${tokens.type.body}px`);
  });

  it('falls back to the default theme for an unknown id', () => {
    expect(applyTheme('nope').theme.id).toBe('midnight');
  });

  it('marks high contrast', () => {
    applyTheme('contrast');
    expect(document.documentElement.hasAttribute('data-mh-high-contrast')).toBe(true);
    expect(document.documentElement.dataset.mhDepth).toBe('flat');
  });
});

describe('button', () => {
  it('renders variant and size classes and calls onClick', () => {
    let clicks = 0;
    const b = createButton({ label: 'Save', variant: 'secondary', size: 'small', icon: 'check', onClick: () => clicks++ });
    expect(b.el.className).toBe('mh-button mh-button--secondary mh-button--sm');
    expect(b.el.querySelector('svg.mh-icon')).not.toBeNull();
    b.el.click();
    expect(clicks).toBe(1);
  });

  it('keeps disabled and loading independent', () => {
    const b = createButton({ label: 'Go' });
    b.setLoading(true);
    expect(b.el.disabled).toBe(true);
    expect(b.el.getAttribute('aria-busy')).toBe('');
    b.setLoading(false);
    expect(b.el.disabled).toBe(false);
    b.setDisabled(true);
    b.setLoading(false);
    expect(b.el.disabled).toBe(true);
  });
});

describe('icon button', () => {
  it('has an accessible name and toggles pressed', () => {
    const b = createIconButton({ icon: 'play', label: 'Play', pressed: false });
    expect(b.el.getAttribute('aria-label')).toBe('Play');
    b.setPressed(true);
    expect(b.el.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('foundations', () => {
  it('renders text with a default tag per variant', () => {
    expect(createText('Hi', { variant: 'headline' }).tagName).toBe('H2');
    expect(createText('Hi', { variant: 'caption', tone: 'muted' }).className).toBe('mh-text mh-text--caption mh-text--muted');
  });

  it('marks unlabelled icons decorative', () => {
    expect(createIcon('home').getAttribute('aria-hidden')).toBe('true');
    expect(createIcon('home', { label: 'Home' }).getAttribute('role')).toBe('img');
  });

  it('renders labelled dividers as separators', () => {
    expect(createDivider({ label: 'or' }).getAttribute('role')).toBe('separator');
  });
});
