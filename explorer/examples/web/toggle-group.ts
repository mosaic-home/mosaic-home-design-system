import { createToggleGroup } from '@mosaic-home/design-system/web';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const status = document.createElement('p');

const repeat = createToggleGroup({
  label: 'Repeat on',
  type: 'multiple',
  values: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  options: days.map((day) => ({ value: day, label: day })),
  onChange: (values) => (status.textContent = values.length ? `Repeats on ${values.join(', ')}` : 'Runs once'),
});

document.body.append(repeat.el, status);
