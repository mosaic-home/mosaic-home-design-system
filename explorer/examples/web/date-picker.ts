import { createDatePicker, pickerDates } from '@mosaic-home/design-system/web';

const today = pickerDates.todayIso();
const status = document.createElement('p');

const visit = createDatePicker({
  label: 'Visit date',
  min: today,
  max: pickerDates.addDays(today, 90),
  clearable: true,
  onChange: (date) => {
    status.textContent = date ? `Booked for ${pickerDates.formatDate(date, undefined, { dateStyle: 'full' })}.` : 'No date.';
  },
});

document.body.append(visit.el, status);
