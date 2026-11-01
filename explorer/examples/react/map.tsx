import { useState } from 'react';
import { Text, TileMap } from '@mosaic-home/design-system/react';
import type { MapMarker } from '@mosaic-home/design-system/web';

const PLACES: MapMarker[] = [
  { lat: 51.0004, lon: 7.0012, label: 'Home', icon: 'home' },
  { lat: 51.0042, lon: 7.0091, label: 'Workshop', tone: 'neutral' },
  { lat: 50.9968, lon: 7.0108, label: 'Pier' },
];

export function MapExample() {
  const [selected, setSelected] = useState<MapMarker | null>(null);
  return (
    <>
      <TileMap
        label="Around the house"
        // Your tile server's XYZ template and the credit it asks for.
        tiles="https://tiles.example.com/{z}/{x}/{y}.png"
        attribution="© Example Maps"
        markers={PLACES}
        center={selected}
        onMarkerSelect={setSelected}
      />
      <Text variant="caption" tone="muted">
        {selected ? `${selected.label ?? 'Place'} selected` : 'Select a place.'}
      </Text>
    </>
  );
}
