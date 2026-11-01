import { createUsageComparison } from '@mosaic-home/design-system/web';

const comparison = createUsageComparison({
  label: 'Heating gas',
  slots: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  slotNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  // Days still to come are null; the totals compare the same days.
  current: [8.2, 9.1, 7.4, 10.3, null, null, null],
  previous: [7.1, 7.9, 7.6, 8.8, 9.4, 11.2, 10.6],
  periods: { current: 'This week', previous: 'Last week' },
  unit: 'm³',
});

document.body.append(comparison.el);
