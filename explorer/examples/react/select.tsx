import { useState } from 'react';
import { Select } from '@mosaic-home/design-system/react';

export function SelectExample() {
  const [room, setRoom] = useState('');
  return (
    <Select
      label="Room"
      placeholder="Choose a room"
      helper={room ? undefined : 'The scene runs in this room.'}
      options={[
        { value: 'living', label: 'Living room' },
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'bedroom', label: 'Bedroom' },
        { value: 'garage', label: 'Garage', disabled: true },
      ]}
      value={room}
      onChange={(event) => setRoom(event.target.value)}
    />
  );
}
