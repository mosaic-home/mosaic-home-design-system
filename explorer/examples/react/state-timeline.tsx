import { useEffect, useState } from 'react';
import { mdiDoorOpen, mdiLightbulbOutline, mdiThermostat } from '@mdi/js';
import { StateTimeline } from '@mosaic-home/design-system/react';
import type { StateTimelineRow } from '@mosaic-home/design-system/web';

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
  { label: 'Back door', icon: mdiDoorOpen, color: 2, spans: [{ from: today(8, 5), to: today(8, 9) }] },
  { label: 'Heating', icon: mdiThermostat, color: 5, spans: [{ from: today(16, 30), to: null }] },
];

export function StateTimelineExample() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);

  return <StateTimeline label="Today at home" rows={rows} start={today(0)} end={today(24)} now={now} />;
}
