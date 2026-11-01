import { createEnergyFlow } from '@mosaic-home/design-system/web';

// Watts. Grid is negative while exporting, battery negative while charging.
const flow = createEnergyFlow({
  label: 'Energy now',
  solar: 3200,
  grid: -1100,
  battery: -800,
  home: 1300,
  batteryLevel: 64,
});

// Evening: the sun is down and the battery feeds the home.
setTimeout(() => {
  flow.update({ label: 'Energy now', solar: 0, grid: 300, battery: 900, batteryLevel: 52 });
}, 3000);

document.body.append(flow.el);
