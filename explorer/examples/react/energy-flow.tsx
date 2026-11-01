import { EnergyFlow } from '@mosaic-home/design-system/react';

export function EnergyFlowExample() {
  // Watts. Grid is negative while exporting, battery negative while charging.
  return (
    <EnergyFlow label="Energy now" solar={3200} grid={-1100} battery={-800} home={1300} batteryLevel={64} />
  );
}
