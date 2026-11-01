import { useState } from 'react';
import { TextField } from '@mosaic-home/design-system/react';

export function TextFieldExample() {
  const [room, setRoom] = useState('');
  const [touched, setTouched] = useState(false);
  return (
    <TextField
      label="Room name"
      placeholder="e.g. Kitchen"
      helper="Shown on tiles and in voice replies."
      error={touched && !room.trim() ? 'Give the room a name.' : undefined}
      maxLength={24}
      showCount
      value={room}
      onChange={(event) => setRoom(event.target.value)}
      onBlur={() => setTouched(true)}
    />
  );
}
