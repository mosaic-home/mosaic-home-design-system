import { createStepper } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const guests = createStepper({
  label: 'Guests',
  value: 2,
  min: 1,
  max: 8,
  format: (v) => (v === 1 ? '1 guest' : `${v} guests`),
  onChange: (value) => (status.textContent = `Guest mode for ${value}`),
});

document.body.append(guests.el, status);
