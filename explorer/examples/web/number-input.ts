import { createNumberInput } from '@mosaic-home/design-system/web';

const target = createNumberInput({
  label: 'Target temperature',
  value: 21.5,
  min: 7,
  max: 30,
  step: 0.5,
  unit: '°C',
  helper: 'Between 7 and 30 °C.',
  onChange: (value) => target.setHelper(`Heating to ${value} °C.`),
});

document.body.append(target.el);
