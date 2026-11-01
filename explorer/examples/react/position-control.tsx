import { useState } from 'react';
import { PositionControl } from '@mosaic-home/design-system/react';

export function PositionControlExample() {
  const [position, setPosition] = useState(50);
  return (
    <PositionControl
      label="Studio blind"
      state={position === 100 ? 'open' : position === 0 ? 'closed' : 'stopped'}
      position={position}
      can={{ open: true, close: true, stop: true, position: true }}
      labels={{ open: 'Raise', close: 'Lower' }}
      onOpen={() => setPosition(100)}
      onClose={() => setPosition(0)}
      onPosition={setPosition}
    />
  );
}
