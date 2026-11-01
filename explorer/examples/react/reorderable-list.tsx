import { useState } from 'react';
import { ReorderableList, Stack, Text } from '@mosaic-home/design-system/react';

// Kept outside the component: the list follows `items` whenever a new array arrives.
const ROOMS = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office'].map((room) => ({ id: room, label: room, icon: 'home' }));

export function ReorderableListExample() {
  const [order, setOrder] = useState(ROOMS.map((room) => room.id));
  return (
    <Stack gap="md">
      <ReorderableList label="Room order on the dashboard" items={ROOMS} onChange={setOrder} />
      <Text variant="caption" tone="muted">
        Order: {order.join(', ')}
      </Text>
    </Stack>
  );
}
