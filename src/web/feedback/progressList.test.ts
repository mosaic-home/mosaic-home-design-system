import { describe, expect, it } from 'vitest';
import { createProgressList, progressListMeta } from './index.ts';

describe('progress list', () => {
  it('joins status and detail', () => {
    expect(progressListMeta({ status: 'Downloading', detail: '1.2 of 3.4 GB' })).toBe('Downloading · 1.2 of 3.4 GB');
    expect(progressListMeta({ status: null, detail: 'Queued' })).toBe('Queued');
    expect(progressListMeta({})).toBe('');
  });

  it('renders a name, percentage, bar and meta line per item', () => {
    const p = createProgressList({
      label: 'Downloads',
      items: [
        { name: 'Firmware', value: 42.4, status: 'Downloading', detail: '12 min left', tone: 'success' },
        { name: 'Map', value: null },
      ],
    });
    expect(p.el.tagName).toBe('UL');
    expect(p.el.getAttribute('aria-label')).toBe('Downloads');
    const [first, second] = Array.from(p.el.querySelectorAll('li.mh-progress-list__item'));
    expect(first!.querySelector('.mh-progress-list__name')!.textContent).toBe('Firmware');
    expect(first!.querySelector('.mh-progress-list__value')!.textContent).toBe('42%');
    const bar = first!.querySelector('.mh-progress')!;
    expect(bar.className).toBe('mh-progress mh-progress--success');
    expect(bar.getAttribute('aria-label')).toBe('Firmware');
    expect(bar.getAttribute('aria-valuenow')).toBe('42.4');
    expect(first!.querySelector('.mh-progress-list__meta')!.textContent).toBe('Downloading · 12 min left');
    expect(second!.querySelector('.mh-progress-list__value')!.textContent).toBe('');
    expect(second!.querySelector('.mh-progress')!.className).toContain('mh-progress--indeterminate');
    expect(second!.querySelector('.mh-progress-list__meta')).toBeNull();
  });

  it('updates rows in place and adds or removes rows', () => {
    const p = createProgressList({ items: [{ name: 'A', value: 10 }] });
    const fill = p.el.querySelector('.mh-progress__fill')!;
    p.setItems([
      { name: 'A', value: 60, status: 'Halfway' },
      { name: 'B', value: 5, tone: 'danger' },
    ]);
    expect(p.el.querySelector('.mh-progress__fill')).toBe(fill);
    expect((fill as HTMLElement).style.width).toBe('60%');
    expect(p.el.querySelectorAll('li')).toHaveLength(2);
    expect(p.el.querySelector('.mh-progress-list__meta')!.textContent).toBe('Halfway');
    p.setItems([{ name: 'A', value: 60, tone: 'warning' }]);
    expect(p.el.querySelectorAll('li')).toHaveLength(1);
    expect(p.el.querySelector('.mh-progress')!.className).toBe('mh-progress mh-progress--warning');
    expect(p.el.querySelector('.mh-progress-list__meta')).toBeNull();
  });
});
