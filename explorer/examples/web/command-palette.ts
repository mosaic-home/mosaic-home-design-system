import { createButton, createCommandPalette, h, type Command } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });

const commands: Command[] = [
  { value: 'lights-off', label: 'Turn off all lights', icon: 'lightbulb', group: 'Lights', keywords: ['dark', 'night'] },
  { value: 'lights-on', label: 'Turn on all lights', icon: 'lightbulb-on', group: 'Lights' },
  { value: 'evening', label: 'Evening scene', icon: 'play', group: 'Scenes', description: 'Living room at 40%' },
  { value: 'lock', label: 'Lock the front door', icon: 'lock', group: 'Security', shortcut: 'Ctrl+L' },
  { value: 'heating', label: 'Set heating to 20°', icon: 'thermometer', group: 'Climate', keywords: ['warm'] },
  { value: 'settings', label: 'Open settings', icon: 'settings', group: 'App' },
];

// `hotkey` also opens it with Ctrl+K (⌘K on Apple keyboards).
const palette = createCommandPalette({
  commands,
  hotkey: true,
  onSelect: (value) => (status.textContent = `Ran: ${value}`),
});

const open = createButton({ label: 'Search commands', icon: 'search', onClick: () => palette.open() });

document.body.append(open.el, status);
