import { useState } from 'react';
import { StatTile, Tile, TileGrid } from '@mosaic-home/design-system/react';

export function TilesExample() {
  const [lights, setLights] = useState<Record<string, boolean>>({ Kitchen: true, 'Living room': false });
  return (
    <TileGrid label="Living room">
      {Object.entries(lights).map(([name, on]) => (
        <Tile
          key={name}
          icon="lightbulb"
          iconOn="lightbulb-on"
          label={name}
          state={on ? 'On' : 'Off'}
          on={on}
          onToggle={(next) => setLights({ ...lights, [name]: next })}
        />
      ))}
      <StatTile
        label="Temperature"
        icon="thermometer"
        value="21.5"
        unit="°C"
        trend="up"
        caption="Since 07:00"
      />
    </TileGrid>
  );
}
