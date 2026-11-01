import { CameraTile } from '@mosaic-home/design-system/react';

export function CameraTileExample() {
  return (
    <CameraTile
      src="/snapshots/front-door.jpg"
      name="Front door"
      status="Motion · 2 min ago"
      // Reloads the picture every 10 seconds while it is on screen.
      refreshEvery={10}
    />
  );
}
