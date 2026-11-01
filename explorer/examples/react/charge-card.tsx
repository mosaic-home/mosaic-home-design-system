import { ChargeCard } from '@mosaic-home/design-system/react';

export function ChargeCardExample() {
  return (
    <ChargeCard
      name="Car"
      level={46}
      // Charging stops at the limit, so the time counts down to it.
      limit={80}
      state="charging"
      rate={7400}
      minutesLeft={95}
      detail="Range 180 km"
    />
  );
}
