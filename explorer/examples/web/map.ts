import { createMap, createText, type MapMarker } from '@mosaic-home/design-system/web';

const places: MapMarker[] = [
  { lat: 51.0004, lon: 7.0012, label: 'Home', icon: 'home' },
  { lat: 51.0042, lon: 7.0091, label: 'Workshop', tone: 'neutral' },
  { lat: 50.9968, lon: 7.0108, label: 'Pier' },
];

const status = createText('Select a place.', { variant: 'caption', tone: 'muted' });

const map = createMap({
  label: 'Around the house',
  // Your tile server's XYZ template and the credit it asks for.
  tiles: 'https://tiles.example.com/{z}/{x}/{y}.png',
  attribution: '© Example Maps',
  markers: places,
  onMarkerSelect: (place) => {
    status.textContent = `${place.label ?? 'Place'} selected`;
    map.setView({ lat: place.lat, lon: place.lon });
  },
});

document.body.append(map.el, status);
