import { useState } from 'react';
import { Button, CommandPalette } from '@mosaic-home/design-system/react';
import type { Command } from '@mosaic-home/design-system/web';

const commands: Command[] = [
  { value: 'lights-off', label: 'Turn off all lights', icon: 'lightbulb', group: 'Lights', keywords: ['dark', 'night'] },
  { value: 'lights-on', label: 'Turn on all lights', icon: 'lightbulb-on', group: 'Lights' },
  { value: 'evening', label: 'Evening scene', icon: 'play', group: 'Scenes', description: 'Living room at 40%' },
  { value: 'lock', label: 'Lock the front door', icon: 'lock', group: 'Security', shortcut: 'Ctrl+L' },
  { value: 'heating', label: 'Set heating to 20°', icon: 'thermometer', group: 'Climate', keywords: ['warm'] },
  { value: 'settings', label: 'Open settings', icon: 'settings', group: 'App' },
];

export function CommandPaletteExample() {
  const [open, setOpen] = useState(false);
  const [ran, setRan] = useState('');
  return (
    <>
      <Button icon="search" onClick={() => setOpen(true)}>
        Search commands
      </Button>
      <p aria-live="polite">{ran && `Ran: ${ran}`}</p>
      {/* `hotkey` also opens it with Ctrl+K (⌘K on Apple keyboards). */}
      <CommandPalette
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        commands={commands}
        hotkey
        onSelect={setRan}
      />
    </>
  );
}
