import { createSlider } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const brightness = createSlider({
  label: 'Brightness',
  value: 60,
  step: 5,
  showValue: true,
  format: (v) => `${v}%`,
  // onInput fires while dragging; onChange once the thumb is let go.
  onChange: (value) => (status.textContent = `Kitchen lights set to ${value}%`),
});

document.body.append(brightness.el, status);
