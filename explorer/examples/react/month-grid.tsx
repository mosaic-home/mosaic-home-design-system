import { MonthGrid } from '@mosaic-home/design-system/react';

// Energy used per day in March; days after today have no data yet.
const energy = [
  6.1, 5.4, 7.2, 4.8, 5.9, 8.3, 8.8, 5.1, 6.0, 5.7, 4.9, 6.4, 9.1,
  8.6, 5.3, 5.8, 6.2, 4.6, 5.5, 8.7, 9.4, 6.0, 5.2, 4.7, 6.3,
];

export function MonthGridExample() {
  return (
    <MonthGrid
      year={2026}
      month={3}
      values={energy}
      label="Energy used per day"
      today={25}
      format={(v) => `${v.toFixed(1)} kWh`}
    />
  );
}
