import { createDateRangePicker, pickerDates } from '@mosaic-home/design-system/web';

const today = pickerDates.todayIso();
const status = document.createElement('p');

const away = createDateRangePicker({
  label: 'Away from home',
  min: today,
  clearable: true,
  presets: [
    { label: 'Next 7 days', range: { start: today, end: pickerDates.addDays(today, 6) } },
    { label: 'Next 14 days', range: { start: today, end: pickerDates.addDays(today, 13) } },
  ],
  helper: 'The house runs in away mode on these days.',
  onChange: (range) => {
    status.textContent = range ? pickerDates.formatDateRange(range.start, range.end) : 'Not away.';
  },
});

document.body.append(away.el, status);
