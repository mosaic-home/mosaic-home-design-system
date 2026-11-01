import { useState } from 'react';
import { List, ListItem, SplitPane, Stack, Text } from '@mosaic-home/design-system/react';

const ROOMS = ['Living room', 'Kitchen', 'Bedroom', 'Office'];

export function SplitPaneExample() {
  const [size, setSize] = useState(35);
  const [collapsed, setCollapsed] = useState(false);
  const [room, setRoom] = useState('Living room');
  const list = (
    <List label="Rooms">
      {ROOMS.map((r) => (
        <ListItem key={r} title={r} icon="home" current={r === room} onClick={() => setRoom(r)} />
      ))}
    </List>
  );
  return (
    <div style={{ height: 320 }}>
      <SplitPane
        start={list}
        end={
          <Stack gap="sm">
            <Text variant="title">{room}</Text>
            <Text tone="muted">3 lights on, 21.5°.</Text>
          </Stack>
        }
        size={size}
        min={25}
        max={65}
        collapsible="start"
        collapsed={collapsed}
        label="Resize room list"
        startLabel="Rooms"
        onResize={setSize}
        onCollapse={setCollapsed}
      />
    </div>
  );
}
