import { useState } from 'react';
import { SplitButton } from '@mosaic-home/design-system/react';
import type { MenuEntry } from '@mosaic-home/design-system/web';

const items: MenuEntry[] = [
  { value: 'in-10', label: 'Run in 10 minutes', icon: 'refresh' },
  { value: 'at-sunset', label: 'Run at sunset', icon: 'weather' },
  { separator: true },
  { value: 'edit', label: 'Edit scene', icon: 'edit' },
];

export function SplitButtonExample() {
  const [status, setStatus] = useState('');
  return (
    <>
      <SplitButton
        label="Run scene"
        icon="play"
        items={items}
        onClick={() => setStatus('Evening scene is running')}
        onSelect={(value) => setStatus(`Chosen: ${value}`)}
      />
      <p aria-live="polite">{status}</p>
    </>
  );
}
