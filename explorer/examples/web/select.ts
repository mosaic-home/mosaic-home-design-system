import { createSelect } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const room = createSelect({
  label: 'Room',
  placeholder: 'Choose a room',
  options: [
    { value: 'living', label: 'Living room' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'garage', label: 'Garage', disabled: true },
  ],
  onChange: (value) => (status.textContent = `The scene runs in: ${value}`),
});

document.body.append(room.el, status);
