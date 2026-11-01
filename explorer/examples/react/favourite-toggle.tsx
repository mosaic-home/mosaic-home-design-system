import { useState } from 'react';
import { FavouriteToggle, Text } from '@mosaic-home/design-system/react';

export function FavouriteToggleExample() {
  const [pinned, setPinned] = useState(false);
  return (
    <>
      <FavouriteToggle label="Favourite: Kitchen light" pressed={pinned} onPressedChange={setPinned} />
      <Text variant="caption" tone="muted">
        {pinned ? 'Pinned to the home screen' : 'Not on the home screen'}
      </Text>
    </>
  );
}
