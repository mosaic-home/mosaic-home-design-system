import { useState } from 'react';
import { Button, IconButton, Panel, Switch } from '@mosaic-home/design-system/react';

export function PanelExample() {
  const [ceiling, setCeiling] = useState(true);
  const [floorLamp, setFloorLamp] = useState(false);
  const allOff = () => {
    setCeiling(false);
    setFloorLamp(false);
  };
  return (
    <Panel
      title="Lights"
      icon="lightbulb"
      description={`${Number(ceiling) + Number(floorLamp)} of 2 on`}
      actions={<IconButton icon="more" label="Light options" />}
      footer={
        <Button variant="secondary" size="small" onClick={allOff}>
          All off
        </Button>
      }
    >
      <Switch label="Ceiling" row checked={ceiling} onChange={(e) => setCeiling(e.target.checked)} />
      <Switch label="Floor lamp" row checked={floorLamp} onChange={(e) => setFloorLamp(e.target.checked)} />
    </Panel>
  );
}
