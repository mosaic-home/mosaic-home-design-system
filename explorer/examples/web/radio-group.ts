import { createRadioGroup } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const mode = createRadioGroup({
  legend: 'Heating mode',
  value: 'auto',
  options: [
    { value: 'auto', label: 'Auto', description: 'Follow the weekly schedule.' },
    { value: 'comfort', label: 'Comfort' },
    { value: 'eco', label: 'Eco', description: 'Two degrees lower while nobody is home.' },
    { value: 'off', label: 'Off' },
  ],
  onChange: (value) => (status.textContent = `Heating mode: ${value}`),
});

document.body.append(mode.el, status);
