import { PriceStrip } from '@mosaic-home/design-system/react';

const TODAY = [
  0.31, 0.29, 0.24, 0.18, 0.15, 0.14, 0.17, 0.26, 0.34, 0.33, 0.27, 0.22,
  0.19, 0.16, 0.13, 0.12, 0.18, 0.29, 0.41, 0.44, 0.38, 0.32, 0.28, 0.25,
];
const SLOTS = TODAY.map((value, hour) => ({ label: String(hour), name: `${hour}:00`, value }));

export function PriceStripExample() {
  return (
    <PriceStrip
      label="Electricity prices today"
      prices={SLOTS}
      // The slot running now; the cheapest three hours from here on are shaded.
      current={new Date().getHours()}
      unit="/kWh"
      end="24:00"
    />
  );
}
