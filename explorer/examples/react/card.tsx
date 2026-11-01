import { useState } from 'react';
import { Button, Card, Text } from '@mosaic-home/design-system/react';

export function CardExample() {
  const [lightsOn, setLightsOn] = useState(3);
  return (
    <Card
      title="Living room"
      subtitle={lightsOn ? `${lightsOn} lights on` : 'All lights off'}
      icon="home"
      footer={
        <>
          <Button variant="text" size="small" onClick={() => setLightsOn(0)}>
            All off
          </Button>
          <Button size="small">Open</Button>
        </>
      }
    >
      <Text tone="muted">21.5° and 46% humidity. The blinds close at 20:00.</Text>
    </Card>
  );
}
