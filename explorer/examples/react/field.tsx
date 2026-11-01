import { useState } from 'react';
import { Field, TextField } from '@mosaic-home/design-system/react';

export function FieldExample() {
  const [name, setName] = useState('Living room');
  return (
    <Field label="Display name" helper="Shown on the dashboard." error={name.trim() ? undefined : 'Enter a name.'} required>
      {(control) => <TextField {...control} value={name} onChange={(event) => setName(event.target.value)} />}
    </Field>
  );
}
