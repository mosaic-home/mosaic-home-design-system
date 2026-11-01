import { beforeEach, describe, expect, it } from 'vitest';
import { createAlert, createBadge, createEmptyState, createProgressBar, createProgressRing, createSkeleton, createSpinner, createStatus, progressPercent } from './index.ts';

beforeEach(() => document.body.replaceChildren());

describe('alert', () => {
  it('uses status for info and alert for danger, with title and action', () => {
    expect(createAlert({ message: 'Saved' }).el.getAttribute('role')).toBe('status');
    const action = document.createElement('button');
    const a = createAlert({ tone: 'danger', title: 'Offline', message: 'No reading', action });
    expect(a.el.className).toBe('mh-alert mh-alert--danger');
    expect(a.el.getAttribute('role')).toBe('alert');
    expect(a.el.querySelector('.mh-alert__title')!.textContent).toBe('Offline');
    expect(a.el.querySelector('.mh-alert__action')!.firstElementChild).toBe(action);
    a.setTitle(null);
    expect(a.el.querySelector('.mh-alert__title')).toBeNull();
  });

  it('dismisses itself', () => {
    let dismissed = 0;
    const a = createAlert({ message: 'Hi', dismissible: true, onDismiss: () => dismissed++ });
    document.body.append(a.el);
    a.el.querySelector<HTMLButtonElement>('.mh-alert__dismiss')!.click();
    expect(dismissed).toBe(1);
    expect(a.el.isConnected).toBe(false);
  });
});

describe('progress', () => {
  it('clamps and reports values', () => {
    expect(progressPercent(150)).toBe(100);
    expect(progressPercent(null)).toBeNull();
    const p = createProgressBar({ label: 'Battery', value: 82, showValue: true });
    expect(p.el.getAttribute('role')).toBe('progressbar');
    expect(p.el.getAttribute('aria-valuenow')).toBe('82');
    expect(p.el.querySelector<HTMLElement>('.mh-progress__fill')!.style.width).toBe('82%');
    expect(p.el.querySelector('.mh-progress__value')!.textContent).toBe('82%');
  });

  it('switches to indeterminate and back', () => {
    const p = createProgressBar({ label: 'Update' });
    expect(p.el.classList.contains('mh-progress--indeterminate')).toBe(true);
    expect(p.el.hasAttribute('aria-valuenow')).toBe(false);
    expect(p.el.getAttribute('aria-busy')).toBe('true');
    p.setValue(100);
    expect(p.el.classList.contains('mh-progress--indeterminate')).toBe(false);
    expect(p.el.hasAttribute('aria-busy')).toBe(false);
  });

  it('draws the ring arc in percent', () => {
    const r = createProgressRing({ label: 'Rooms', value: 5, max: 8, valueText: '5/8' });
    expect(r.el.querySelector('.mh-progress-ring__arc')!.getAttribute('stroke-dasharray')).toBe('62.5 100');
    expect(r.el.getAttribute('aria-valuetext')).toBe('5/8');
    expect(r.el.querySelector('.mh-progress-ring__value')!.textContent).toBe('5/8');
  });
});

describe('spinner and skeleton', () => {
  it('announce loading', () => {
    const s = createSpinner({ size: 'large', label: 'Loading rooms' });
    expect(s.el.className).toBe('mh-spinner mh-spinner--lg');
    expect(s.el.getAttribute('role')).toBe('status');
    expect(s.el.textContent).toBe('Loading rooms');
    const k = createSkeleton({ lines: 3 });
    expect(k.el.getAttribute('aria-busy')).toBe('true');
    expect(k.el.querySelectorAll('.mh-skeleton__line[aria-hidden="true"]').length).toBe(3);
    expect(createSkeleton({ shape: 'circle', width: '40px' }).el.querySelector<HTMLElement>('.mh-skeleton__shape')!.style.width).toBe('40px');
  });
});

describe('badge', () => {
  it('caps counts and hides at zero', () => {
    const b = createBadge({ count: 120 });
    expect(b.el.textContent).toBe('99+');
    expect(b.el.className).toBe('mh-badge mh-badge--danger');
    b.setCount(0);
    expect(b.el.hidden).toBe(true);
    b.setCount(4);
    expect(b.el.hidden).toBe(false);
    expect(b.el.textContent).toBe('4');
  });

  it('names dots', () => {
    const d = createBadge({ dot: true, label: 'Update available', attached: true });
    expect(d.el.getAttribute('role')).toBe('img');
    expect(d.el.getAttribute('aria-label')).toBe('Update available');
    expect(d.el.textContent).toBe('');
    expect(d.el.className).toBe('mh-badge mh-badge--danger mh-badge--dot mh-badge--attached');
  });
});

describe('status and empty state', () => {
  it('updates the status label', () => {
    const s = createStatus({ state: 'online', announce: true });
    expect(s.el.getAttribute('role')).toBe('status');
    expect(s.el.textContent).toBe('Online');
    s.setState('error', 'Disconnected');
    expect(s.el.className).toBe('mh-status mh-status--error');
    expect(s.el.textContent).toBe('Disconnected');
  });

  it('renders the empty state parts', () => {
    const e = createEmptyState({ icon: 'lightbulb', title: 'No lights yet', text: 'Add one', action: document.createElement('button'), compact: true });
    expect(e.el.className).toBe('mh-empty-state mh-empty-state--compact');
    expect(e.el.querySelector('h3.mh-empty-state__title')!.textContent).toBe('No lights yet');
    expect(e.el.querySelector('.mh-empty-state__icon svg')).not.toBeNull();
    expect(e.el.querySelector('.mh-empty-state__action button')).not.toBeNull();
  });
});
