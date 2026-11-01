import { useState } from 'react';
import { Button, Drawer } from '@mosaic-home/design-system/react';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Garden'];

export function DrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon="menu" variant="secondary" onClick={() => setOpen(true)}>
        Rooms
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" title="Rooms">
        <nav aria-label="Rooms">
          {rooms.map((room) => (
            <p key={room}>
              <a href={`#${room.toLowerCase().replace(' ', '-')}`} onClick={() => setOpen(false)}>
                {room}
              </a>
            </p>
          ))}
        </nav>
      </Drawer>
    </>
  );
}
