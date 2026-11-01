import { useState } from 'react';
import { Button } from '@mosaic-home/design-system/react';

export function ButtonExample() {
  const [busy, setBusy] = useState(false);
  const turnOn = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 800);
  };
  return (
    <Button icon="power" variant="primary" loading={busy} onClick={turnOn}>
      Turn on
    </Button>
  );
}
