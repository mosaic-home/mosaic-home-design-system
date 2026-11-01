import { createColorPicker } from '@mosaic-home/design-system/web';

const sample = document.createElement('div');
sample.style.cssText = 'width: 48px; height: 48px; border-radius: var(--mh-radius-control)';

const lamp = createColorPicker({
  label: 'Lamp colour',
  value: '#ff9a3c',
  // onInput follows every drag; onChange fires once the user lets go.
  onInput: (color) => (sample.style.background = color),
});
sample.style.background = lamp.getValue();

document.body.append(lamp.el, sample);
