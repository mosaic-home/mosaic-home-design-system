import { createMultiSelect } from '@mosaic-home/design-system/web';

const rooms = createMultiSelect({
  label: 'Rooms',
  placeholder: 'Choose rooms',
  options: [
    { value: 'living', label: 'Living room', icon: 'home', description: '4 lights' },
    { value: 'kitchen', label: 'Kitchen', icon: 'lightbulb', description: '3 lights' },
    { value: 'bedroom', label: 'Bedroom', icon: 'lightbulb', description: '2 lights' },
    { value: 'study', label: 'Study', icon: 'lightbulb', description: '2 lights' },
  ],
  values: ['living', 'kitchen'],
  helper: 'The scene runs in every chosen room.',
  onChange: (values) => rooms.setError(values.length ? undefined : 'Choose at least one room.'),
});

document.body.append(rooms.el);
