import { useState } from 'react';
import { DateRangePicker } from '@mosaic-home/design-system/react';
import { pickerDates, type CompleteDateRange } from '@mosaic-home/design-system/web';

export function DateRangePickerExample() {
  const [today] = useState(() => pickerDates.todayIso());
  const [away, setAway] = useState<CompleteDateRange | null>(null);
  return (
    <DateRangePicker
      label="Away from home"
      min={today}
      clearable
      presets={[
        { label: 'Next 7 days', range: { start: today, end: pickerDates.addDays(today, 6) } },
        { label: 'Next 14 days', range: { start: today, end: pickerDates.addDays(today, 13) } },
      ]}
      helper="The house runs in away mode on these days."
      value={away}
      onChange={setAway}
    />
  );
}
