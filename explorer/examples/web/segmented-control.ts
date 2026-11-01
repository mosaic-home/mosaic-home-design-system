import { createSegmentedControl } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const range = createSegmentedControl({
  label: 'Energy range',
  value: 'week',
  options: [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ],
  onChange: (value) => (status.textContent = `Showing the last ${value}`),
});

document.body.append(range.el, status);
