import { List, ListItem, ScrollPanel } from '@mosaic-home/design-system/react';

const ROOMS = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office', 'Bathroom', 'Garden', 'Garage', 'Attic'];

export function ScrollPanelExample() {
  return (
    <ScrollPanel label="Rooms" size="medium">
      <List>
        {ROOMS.map((room, i) => (
          <ListItem key={room} title={room} subtitle={`${i + 1} devices`} icon="home" />
        ))}
      </List>
    </ScrollPanel>
  );
}
