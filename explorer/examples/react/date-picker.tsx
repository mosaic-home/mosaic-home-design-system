import { useState } from 'react';
import { DatePicker } from '@mosaic-home/design-system/react';
import { pickerDates, type IsoDate } from '@mosaic-home/design-system/web';

export function DatePickerExample() {
  const [today] = useState(() => pickerDates.todayIso());
  const [visit, setVisit] = useState<IsoDate | null>(null);
  return (
    <>
      <DatePicker label="Visit date" min={today} max={pickerDates.addDays(today, 90)} clearable value={visit} onChange={setVisit} />
      <p>{visit ? `Booked for ${pickerDates.formatDate(visit, undefined, { dateStyle: 'full' })}.` : 'No date yet.'}</p>
    </>
  );
}
