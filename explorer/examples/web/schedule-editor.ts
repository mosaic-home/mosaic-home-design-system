import { createScheduleEditor, type ScheduleDay } from '@mosaic-home/design-system/web';

// Times are minutes after midnight.
const workday = [
  { start: 6 * 60 + 30, end: 8 * 60, value: 'comfort' },
  { start: 17 * 60, end: 22 * 60, value: 'comfort' },
];
const weekend = [{ start: 8 * 60, end: 23 * 60, value: 'comfort' }];

const days: ScheduleDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
  label,
  blocks: i < 5 ? workday : weekend,
}));

const schedule = createScheduleEditor({
  label: 'Living room heating',
  days,
  levels: [
    { value: 'comfort', label: '21°' },
    { value: 'eco', label: '18°' },
  ],
  base: '16°',
  onChange: (next) => console.log('Save the schedule', next),
});

document.body.append(schedule.el);
