import { createOpeningsSummary, type OpeningEntry } from '@mosaic-home/design-system/web';

let items: OpeningEntry[] = [
  // Should be shut now: takes the warning tone and goes first.
  { id: 'skylight', name: 'Skylight', kind: 'window', open: true, area: 'Landing', alert: true },
  { id: 'back', name: 'Back door', kind: 'door', open: true, area: 'Kitchen', since: '5 min' },
  { id: 'garage', name: 'Garage door', kind: 'garage', open: false },
];

const summary = createOpeningsSummary({
  items,
  reason: 'Rain expected within the hour',
  onSelect: (id) => {
    items = items.map((item) => (item.id === id ? { ...item, open: false, alert: false } : item));
    summary.update({ items });
  },
});

document.body.append(summary.el);
