import { createFanControl } from '@mosaic-home/design-system/web';

const fan = createFanControl({
  label: 'Bedroom fan',
  on: true,
  percentage: 67,
  // Three speeds become step buttons.
  speedCount: 3,
  oscillating: true,
  onToggle: (on) => fan.update({ on }),
  onPercentage: (percentage) => fan.update({ percentage, on: percentage > 0 }),
  onOscillate: (oscillating) => fan.update({ oscillating }),
});

document.body.append(fan.el);
