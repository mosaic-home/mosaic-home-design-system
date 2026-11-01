import { describe, expect, it } from 'vitest';
import { agendaView, createAgenda, type AgendaDay } from './index.ts';

const DAYS: AgendaDay[] = [
  {
    label: 'Today',
    events: [
      { time: '09:00', end: '10:00', title: 'Standup', color: 2 },
      { time: null, title: 'Bin day', color: 4 },
      { time: '18:00', title: 'Piano', location: 'Music room' },
    ],
  },
  { label: 'Tomorrow', events: [] },
  { label: 'Fri', events: [{ time: '19:30', title: 'Quiz' }] },
];

describe('agendaView', () => {
  it('puts all-day events first, drops empty days and cuts to max', () => {
    const v = agendaView(DAYS);
    expect(v.days.map((d) => d.label)).toEqual(['Today', 'Fri']);
    expect(v.days[0]!.allDay.map((e) => e.title)).toEqual(['Bin day']);
    expect(v.days[0]!.timed.map((e) => e.title)).toEqual(['Standup', 'Piano']);
    expect(v.hidden).toBe(0);
    const cut = agendaView(DAYS, 2);
    expect(cut.days.map((d) => [d.allDay.length, d.timed.length])).toEqual([[1, 1]]);
    expect(cut.hidden).toBe(2);
  });
});

describe('createAgenda', () => {
  it('renders days with headings, chips and timed rows', () => {
    const { el } = createAgenda({ days: DAYS });
    expect(el.className).toBe('mh-agenda');
    expect([...el.querySelectorAll('h3.mh-agenda__day-label')].map((n) => n.textContent)).toEqual(['Today', 'Fri']);
    const chip = el.querySelector('.mh-agenda__chip')!;
    expect(chip.className).toBe('mh-agenda__chip mh-agenda__chip--c4');
    expect(chip.textContent).toBe('All day: Bin day');
    const rows = el.querySelectorAll('.mh-agenda__event');
    expect(rows[0]!.className).toBe('mh-agenda__event mh-agenda__event--c2');
    expect(rows[0]!.querySelector('.mh-agenda__time')!.textContent).toBe('09:00 to 10:00');
    expect(rows[0]!.querySelector('.mh-agenda__end')!.textContent).toBe('10:00');
    expect(rows[1]!.className).toBe('mh-agenda__event');
    expect(rows[1]!.querySelector('.mh-agenda__location')!.textContent).toBe('Music room');
    expect(rows[1]!.querySelector('.mh-agenda__end')).toBeNull();
    expect(el.querySelector('.mh-agenda__bar')!.getAttribute('aria-hidden')).toBe('true');
    for (const list of el.querySelectorAll('ul')) expect(list.getAttribute('role')).toBe('list');
  });

  it('shows the empty text, the "more" line and a chosen heading level', () => {
    const { el, update } = createAgenda({ days: [{ label: 'Today', events: [] }], empty: 'Free day' });
    expect(el.querySelector('.mh-agenda__empty')!.textContent).toBe('Free day');
    update({ days: [] });
    expect(el.querySelector('.mh-agenda__empty')!.textContent).toBe('Nothing planned');
    update({ days: DAYS, max: 1, headingLevel: 2, labels: { more: (n) => `+${n}` } });
    expect(el.querySelector('h2')!.textContent).toBe('Today');
    expect(el.querySelector('.mh-agenda__more')!.textContent).toBe('+3');
    expect(el.querySelector('.mh-agenda__empty')).toBeNull();
  });
});
