import { useState } from 'react';
import { Stepper } from '@mosaic-home/design-system/react';

export function StepperExample() {
  const [guests, setGuests] = useState(2);
  return (
    <Stepper
      label="Guests"
      min={1}
      max={8}
      format={(v) => (v === 1 ? '1 guest' : `${v} guests`)}
      value={guests}
      onChange={setGuests}
    />
  );
}
