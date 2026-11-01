import { createGeoMap, type GeoMapPoint, type GeoMapShape } from '@mosaic-home/design-system/web';

const home: GeoMapShape = { name: 'Home', tone: 'muted', circle: { lat: 50.9965, lon: 6.9935, radius: 150 } };
const park: GeoMapShape = {
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
const sam: GeoMapPoint = { lat: 51.0021, lon: 7.004, label: 'Sam', accuracy: 40 };

const options = {
  label: 'Where Sam is',
  shapes: [home, park],
  // Your tile server's XYZ template and the credit it asks for; leave `tiles` out to load nothing.
  tiles: { url: 'https://tiles.example.com/{z}/{x}/{y}.png', attribution: '© Example Maps', maxZoom: 19 },
};
const map = createGeoMap({ ...options, points: [sam] });

document.body.append(map.el);

// A new position arrives: redraw with it.
setTimeout(() => map.update({ ...options, points: [{ ...sam, lat: 50.9972, lon: 6.9941, accuracy: 15 }] }), 3000);
