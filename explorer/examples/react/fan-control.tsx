import { useState } from 'react';
import { FanControl } from '@mosaic-home/design-system/react';

export function FanControlExample() {
  const [on, setOn] = useState(true);
  const [percentage, setPercentage] = useState(67);
  const [oscillating, setOscillating] = useState(true);
  return (
    <FanControl
      label="Bedroom fan"
      on={on}
      percentage={percentage}
      // Three speeds become step buttons.
      speedCount={3}
      oscillating={oscillating}
      onToggle={setOn}
      onPercentage={(value) => {
        setPercentage(value);
        setOn(value > 0);
      }}
      onOscillate={setOscillating}
    />
  );
}
