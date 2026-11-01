import { useState } from 'react';
import { ScheduleEditor } from '@mosaic-home/design-system/react';
import type { ScheduleDay } from '@mosaic-home/design-system/web';

// Times are minutes after midnight.
const WORKDAY = [
  { start: 6 * 60 + 30, end: 8 * 60, value: 'comfort' },
  { start: 17 * 60, end: 22 * 60, value: 'comfort' },
];
const WEEKEND = [{ start: 8 * 60, end: 23 * 60, value: 'comfort' }];
const WEEK: ScheduleDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
  label,
  blocks: i < 5 ? WORKDAY : WEEKEND,
}));
const LEVELS = [
  { value: 'comfort', label: '21°' },
  { value: 'eco', label: '18°' },
];

export function ScheduleEditorExample() {
  const [days, setDays] = useState(WEEK);
  return (
    <ScheduleEditor label="Living room heating" days={days} levels={LEVELS} base="16°" onChange={setDays} />
  );
}
