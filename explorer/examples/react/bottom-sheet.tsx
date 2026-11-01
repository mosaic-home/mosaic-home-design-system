import { useState } from 'react';
import { BottomSheet, Button } from '@mosaic-home/design-system/react';

export function BottomSheetExample() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const pick = (scene: string) => () => {
    setStatus(`${scene} is on`);
    setOpen(false);
  };
  return (
    <>
      <Button icon="lightbulb-on" onClick={() => setOpen(true)}>
        Scenes
      </Button>
      <p aria-live="polite">{status}</p>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Quick scenes"
        description="Living room"
        footer={
          <>
            <Button variant="secondary" onClick={pick('Reading')}>
              Reading
            </Button>
            <Button onClick={pick('Film night')}>Film night</Button>
          </>
        }
      >
        <p>Pick a scene for the whole room.</p>
      </BottomSheet>
    </>
  );
}
