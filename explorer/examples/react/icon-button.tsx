import { useState } from 'react';
import { IconButton } from '@mosaic-home/design-system/react';

export function IconButtonExample() {
  const [muted, setMuted] = useState(false);
  return (
    <IconButton
      icon={muted ? 'volume-off' : 'volume-high'}
      label="Mute"
      pressed={muted}
      onClick={() => setMuted(!muted)}
    />
  );
}
