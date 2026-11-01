import { createLightControl } from '@mosaic-home/design-system/web';

const warmToCool = { min: 2000, max: 6500 };

const light = createLightControl({
  label: 'Bedside lamp',
  on: true,
  brightness: 65,
  colorTemp: { value: 2700, ...warmToCool },
  onToggle: (on) => light.update({ on }),
  onBrightness: (brightness) => light.update({ brightness }),
  onColorTemp: (value) => light.update({ colorTemp: { value, ...warmToCool } }),
});

document.body.append(light.el);
