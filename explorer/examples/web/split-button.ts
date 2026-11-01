import { createSplitButton, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });

const runScene = createSplitButton({
  label: 'Run scene',
  icon: 'play',
  items: [
    { value: 'in-10', label: 'Run in 10 minutes', icon: 'refresh' },
    { value: 'at-sunset', label: 'Run at sunset', icon: 'weather' },
    { separator: true },
    { value: 'edit', label: 'Edit scene', icon: 'edit' },
  ],
  onClick: () => (status.textContent = 'Evening scene is running'),
  onSelect: (value) => (status.textContent = `Chosen: ${value}`),
});

document.body.append(runScene.el, status);
