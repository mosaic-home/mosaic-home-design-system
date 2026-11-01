import { useState } from 'react';
import { SecretField } from '@mosaic-home/design-system/react';

export function SecretFieldExample() {
  const [password, setPassword] = useState('');
  return (
    <SecretField
      label="New password"
      kind="new-password"
      required
      helper="At least 12 characters."
      success={password.length >= 12 ? 'Long enough.' : undefined}
      value={password}
      onValueChange={setPassword}
    />
  );
}
