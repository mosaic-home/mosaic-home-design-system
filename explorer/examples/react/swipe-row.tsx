import { useState } from 'react';
import { Stack, SwipeRow, Text } from '@mosaic-home/design-system/react';

export function SwipeRowExample() {
  const [favourite, setFavourite] = useState(false);
  const [deleted, setDeleted] = useState(false);
  if (deleted) return <Text tone="muted">Kitchen light removed.</Text>;
  return (
    <SwipeRow
      label="Kitchen light"
      start={[
        {
          id: 'favourite',
          label: favourite ? 'Unfavourite' : 'Favourite',
          icon: favourite ? 'star-outline' : 'star',
          tone: 'accent',
          onAction: () => setFavourite(!favourite),
        },
      ]}
      end={[{ id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onAction: () => setDeleted(true) }]}
    >
      <Stack gap="none">
        <Text variant="label">Kitchen light{favourite ? ' ★' : ''}</Text>
        <Text variant="caption" tone="muted">
          On, 80%
        </Text>
      </Stack>
    </SwipeRow>
  );
}
