import { useState } from 'react';
import { IconButton, Popover } from '@mosaic-home/design-system/react';

export function PopoverExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Popover
        trigger={<IconButton icon="info" label="About this sensor" />}
        title="Air quality"
        open={open}
        onOpenChange={setOpen}
      >
        <p>Measured every five minutes in the hallway. Readings under 50 are good.</p>
      </Popover>
      <p aria-live="polite">{open ? 'Showing details' : ''}</p>
    </>
  );
}
