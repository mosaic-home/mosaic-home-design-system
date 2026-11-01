import { useState } from 'react';
import { IconButton, PageHeader } from '@mosaic-home/design-system/react';

export function PageHeaderExample() {
  const [lightsOn, setLightsOn] = useState(3);
  return (
    <PageHeader
      eyebrow="Ground floor"
      title="Living room"
      subtitle={lightsOn ? `${lightsOn} lights on` : 'All lights off'}
      back={{ label: 'Back to rooms', onClick: () => history.back() }}
      actions={<IconButton icon="power" label="Turn off all lights" onClick={() => setLightsOn(0)} />}
    />
  );
}
