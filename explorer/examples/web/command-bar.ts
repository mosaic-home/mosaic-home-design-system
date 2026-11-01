import { createCommandBar } from '@mosaic-home/design-system/web';

const log = document.createElement('pre');

const bar = createCommandBar({
  placeholder: 'Type a command',
  suggestions: [
    { value: 'lights on', description: 'Turn on the lights in a room' },
    { value: 'lights off', description: 'Turn off the lights in a room' },
    { value: 'scene evening', description: 'Dim everything to warm white' },
    { value: 'status', description: 'Summary of the home' },
  ],
  history: ['status'],
  onSubmit: (command) => (log.textContent += `> ${command}\nok\n`),
});

document.body.append(log, bar.el);
