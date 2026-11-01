import { ThemeProvider, useTokens } from '@mosaic-home/design-system/react';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Office'];

function RoomGrid() {
  // The numbers are there for layout done in code; the variables follow corners and density in CSS.
  const { space } = useTokens();
  const columns = Math.max(1, Math.floor((window.innerWidth + space.sm) / (160 + space.sm)));
  return (
    <div style={{ display: 'grid', gap: space.sm, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {rooms.map((room) => (
        <div
          key={room}
          style={{
            padding: 'var(--mh-space-md)',
            borderRadius: 'var(--mh-radius-lg)',
            minHeight: 'var(--mh-control-lg)',
            background: 'var(--mh-surface-raised)',
          }}
        >
          {room}
        </div>
      ))}
    </div>
  );
}

export function ShapeSpaceExample() {
  return (
    <ThemeProvider theme="daylight" deviceClass="phone" character={{ density: 'compact' }}>
      <RoomGrid />
    </ThemeProvider>
  );
}
