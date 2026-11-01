import { useEffect, useState } from 'react';
import { Badge, PropertyList } from '@mosaic-home/design-system/react';

export function PropertyListExample() {
  const [minutesLeft, setMinutesLeft] = useState(78);
  useEffect(() => {
    const timer = setInterval(() => setMinutesLeft((m) => Math.max(0, m - 1)), 60_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <PropertyList
      items={[
        { label: 'Status', value: <Badge label="Printing" tone="accent" /> },
        { label: 'Time left', value: `${minutesLeft} min` },
        { label: 'Nozzle', value: '215 °C' },
        { label: 'File', value: 'shelf_bracket_v2.gcode' },
      ]}
    />
  );
}
