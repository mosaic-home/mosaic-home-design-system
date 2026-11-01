import { useState } from 'react';
import { Button, Dialog } from '@mosaic-home/design-system/react';

export function DialogExample() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button icon="add" onClick={() => setOpen(true)}>
        Save as scene
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Save as scene"
        description="Keeps the current brightness of every light in this room."
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </>
        }
      >
        <p>Living room: three lights at 40%, floor lamp off.</p>
      </Dialog>
    </>
  );
}
