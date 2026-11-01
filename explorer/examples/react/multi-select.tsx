import { useState } from 'react';
import { MultiSelect } from '@mosaic-home/design-system/react';
import type { MultiSelectOption } from '@mosaic-home/design-system/web';

const rooms: MultiSelectOption[] = [
  { value: 'living', label: 'Living room', icon: 'home', description: '4 lights' },
  { value: 'kitchen', label: 'Kitchen', icon: 'lightbulb', description: '3 lights' },
  { value: 'bedroom', label: 'Bedroom', icon: 'lightbulb', description: '2 lights' },
  { value: 'study', label: 'Study', icon: 'lightbulb', description: '2 lights' },
];

export function MultiSelectExample() {
  const [chosen, setChosen] = useState<string[]>(['living', 'kitchen']);
  return (
    <MultiSelect
      label="Rooms"
      placeholder="Choose rooms"
      helper="The scene runs in every chosen room."
      error={chosen.length ? undefined : 'Choose at least one room.'}
      options={rooms}
      values={chosen}
      onChange={setChosen}
    />
  );
}
