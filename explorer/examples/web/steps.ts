import { createButton, createSteps } from '@mosaic-home/design-system/web';

const items = [
  { label: 'Connect', description: 'Plug in the hub' },
  { label: 'Network', description: 'Wi-Fi and password' },
  { label: 'Rooms', optional: true },
  { label: 'Done' },
];

const steps = createSteps({
  label: 'Hub setup',
  steps: items,
  current: 1,
  // Completed steps become buttons that go back to them.
  onSelect: (index) => steps.setCurrent(index),
});

const next = createButton({
  label: 'Next',
  variant: 'primary',
  onClick: () => steps.setCurrent(Math.min(steps.current() + 1, items.length)),
});

document.body.append(steps.el, next.el);
