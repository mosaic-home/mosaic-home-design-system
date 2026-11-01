import { useEffect, useState } from 'react';
import { GeoMap } from '@mosaic-home/design-system/react';
import type { GeoMapPoint, GeoMapShape, GeoMapTiles } from '@mosaic-home/design-system/web';

const HOME: GeoMapShape = { name: 'Home', tone: 'muted', circle: { lat: 50.9965, lon: 6.9935, radius: 150 } };
const PARK: GeoMapShape = {
  name: 'Willow Green',
  tone: 'accent',
  rings: [
    [
      [7.0, 51.0],
      [7.008, 51.0005],
      [7.006, 51.0052],
      [7.0, 51.0],
    ],
  ],
};
// Your tile server's XYZ template and the credit it asks for; leave `tiles` out to load nothing.
const TILES: GeoMapTiles = { url: 'https://tiles.example.com/{z}/{x}/{y}.png', attribution: '© Example Maps', maxZoom: 19 };

export function GeoMapExample() {
  const [sam, setSam] = useState<GeoMapPoint>({ lat: 51.0021, lon: 7.004, label: 'Sam', accuracy: 40 });
  useEffect(() => {
    // A new position arrives.
    const timer = setTimeout(() => setSam((p) => ({ ...p, lat: 50.9972, lon: 6.9941, accuracy: 15 })), 3000);
    return () => clearTimeout(timer);
  }, []);
  return <GeoMap label="Where Sam is" points={[sam]} shapes={[HOME, PARK]} tiles={TILES} />;
}
