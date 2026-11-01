import { describe, expect, it, vi } from 'vitest';
import { createTimeline, timelineItemClass } from './index.ts';

describe('timeline', () => {
  it('renders a list with a time column', () => {
    const t = createTimeline({ label: 'Departures', items: [{ time: '07:42', title: 'Line 4', detail: 'Platform 2', tone: 'warning' }, { time: '07:51', title: 'Line 11' }] });
    expect(t.el.tagName).toBe('OL');
    expect(t.el.className).toBe('mh-timeline mh-timeline--list');
    expect(t.el.getAttribute('aria-label')).toBe('Departures');
    const items = t.el.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]!.className).toBe('mh-timeline__item mh-timeline__item--warning');
    expect(items[0]!.querySelector('.mh-timeline__time')!.textContent).toBe('07:42');
    expect(items[0]!.querySelector('.mh-timeline__detail')!.textContent).toBe('Platform 2');
    expect(items[1]!.querySelector('.mh-timeline__detail')).toBeNull();
    expect(t.el.querySelector('.mh-timeline__marker')).toBeNull();
    expect(t.el.querySelector('button')).toBeNull();
  });

  it('draws markers in the feed, with icons where given', () => {
    const t = createTimeline({ variant: 'feed', items: [{ time: 'now', title: 'Door opened', icon: 'lock', tone: 'accent' }, { time: '1 h ago', title: 'Light on' }] });
    expect(t.el.className).toBe('mh-timeline mh-timeline--feed');
    const [first, second] = Array.from(t.el.querySelectorAll('li'));
    expect(first!.className).toBe('mh-timeline__item mh-timeline__item--accent mh-timeline__item--icon');
    expect(first!.querySelector('.mh-timeline__marker')!.getAttribute('aria-hidden')).toBe('true');
    expect(first!.querySelector('.mh-timeline__marker .mh-icon')).not.toBeNull();
    expect(second!.className).toBe('mh-timeline__item');
    expect(second!.querySelector('.mh-timeline__marker')!.childElementCount).toBe(0);
    expect(timelineItemClass('neutral', true)).toBe('mh-timeline__item mh-timeline__item--icon');
  });

  it('makes rows buttons inside the list items with onSelect', () => {
    const onSelect = vi.fn();
    const t = createTimeline({ items: [{ time: '1', title: 'A' }, { time: '2', title: 'B' }], onSelect });
    const buttons = t.el.querySelectorAll<HTMLButtonElement>('li > button.mh-timeline__row.mh-timeline__row--interactive');
    expect(buttons).toHaveLength(2);
    expect(buttons[1]!.type).toBe('button');
    buttons[1]!.click();
    expect(onSelect).toHaveBeenCalledWith(1);
    t.setItems([{ time: '3', title: 'C' }]);
    expect(t.el.querySelectorAll('li')).toHaveLength(1);
  });
});
