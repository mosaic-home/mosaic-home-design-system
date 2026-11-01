import { useState } from 'react';
import { CommandBar } from '@mosaic-home/design-system/react';
import type { CommandSuggestion } from '@mosaic-home/design-system/web';

const commands: CommandSuggestion[] = [
  { value: 'lights on', description: 'Turn on the lights in a room' },
  { value: 'lights off', description: 'Turn off the lights in a room' },
  { value: 'scene evening', description: 'Dim everything to warm white' },
  { value: 'status', description: 'Summary of the home' },
];

export function CommandBarExample() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <>
      <pre>{log.map((command) => `> ${command}\nok\n`).join('')}</pre>
      <CommandBar
        placeholder="Type a command"
        suggestions={commands}
        defaultHistory={['status']}
        onSubmit={(command) => setLog((lines) => [...lines, command])}
      />
    </>
  );
}
