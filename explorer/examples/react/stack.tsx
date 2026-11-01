import { useState } from 'react';
import { Button, Card, Grid, Row, Stack, Text } from '@mosaic-home/design-system/react';

export function StackExample() {
  const [rooms, setRooms] = useState(['Living room', 'Kitchen', 'Bedroom', 'Office']);
  const addRoom = () => setRooms((list) => [...list, `Room ${list.length + 1}`]);
  return (
    <Stack gap="lg">
      <Row justify="between">
        <Text variant="title">Rooms</Text>
        <Button icon="add" variant="secondary" size="small" onClick={addRoom}>
          Add room
        </Button>
      </Row>
      <Grid min="small" gap="sm">
        {rooms.map((room) => (
          <Card key={room} title={room} />
        ))}
      </Grid>
    </Stack>
  );
}
