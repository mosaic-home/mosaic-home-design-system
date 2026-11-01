import { mdiDoorOpen, mdiLightbulbOutline, mdiThermostat } from '@mdi/js';
import { createStateTimeline, type StateTimelineRow } from '@mosaic-home/design-system/web';

const today = (hours: number, minutes = 0): Date => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// A span with `to: null` is still going on.
const rows: StateTimelineRow[] = [
  {
    label: 'Hall light',
    icon: mdiLightbulbOutline,
    spans: [{ from: today(6, 40), to: today(7, 55) }, { from: today(17, 10), to: null }],
  },
  {
    label: 'Back door',
    icon: mdiDoorOpen,
    state: 'Open',
    color: 2,
    spans: [{ from: today(8, 5), to: today(8, 9) }, { from: today(12, 30), to: today(12, 52) }],
  },
  {
    label: 'Heating',
    icon: mdiThermostat,
    state: 'Heating',
    color: 5,
    spans: [{ from: today(5, 30), to: today(8, 30) }, { from: today(16, 30), to: null }],
  },
];

const timeline = createStateTimeline({
  label: 'Today at home',
  rows,
  start: today(0),
  end: today(24),
  now: Date.now(),
});

setInterval(() => timeline.update({ now: Date.now() }), 60_000);

document.body.append(timeline.el);
