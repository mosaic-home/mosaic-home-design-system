import { createTextField } from '@mosaic-home/design-system/web';

const room = createTextField({
  label: 'Room name',
  placeholder: 'e.g. Kitchen',
  helper: 'Shown on tiles and in voice replies.',
  maxLength: 24,
  showCount: true,
  onChange: (value) => room.setError(value.trim() ? undefined : 'Give the room a name.'),
});

document.body.append(room.el);
