import { createClickWheel } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const timer = createClickWheel({
  label: 'Timer',
  max: 120,
  step: 5,
  value: 25,
  detents: 36,
  format: (v) => `${v} min`,
  center: {
    label: 'Start timer',
    icon: 'play',
    onPress: () => (status.textContent = `Timer started: ${timer.getValue()} min`),
  },
});

document.body.append(timer.el, status);
