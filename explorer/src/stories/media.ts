import { h } from '../../../src/web/dom.ts';
import { createGeoMap, type GeoMapPoint, type GeoMapShape, type GeoMapTiles } from '../../../src/web/media/geoMap.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import type { Story } from './types.ts';

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });

// An invented neighbourhood: round-number coordinates, made-up names.
const PARK: GeoMapShape = {
  name: 'Willow Green',
  tone: 'accent',
  rings: [
    [
      [7.0, 51.0],
      [7.008, 51.0005],
      [7.0095, 51.0035],
      [7.006, 51.0052],
      [7.0005, 51.0045],
      [7.0, 51.0],
    ],
    // The pond is a hole in the park.
    [
      [7.0035, 51.0018],
      [7.0058, 51.002],
      [7.0055, 51.0032],
      [7.0038, 51.003],
      [7.0035, 51.0018],
    ],
  ],
};
const HOME_ZONE: GeoMapShape = { name: 'Home', tone: 'muted', circle: { lat: 50.9965, lon: 6.9935, radius: 150 } };
const WALK: GeoMapShape = {
  name: 'Morning walk',
  tone: 'accent',
  open: true,
  rings: [
    [
      [6.9938, 50.9966],
      [6.9962, 50.9978],
      [6.9975, 50.9991],
      [6.9992, 50.9997],
      [7.0012, 51.0012],
      [7.0026, 51.0039],
    ],
  ],
};
const SAM: GeoMapPoint = { lat: 51.0039, lon: 7.0026, label: 'Sam', accuracy: 40 };
const KAI: GeoMapPoint = { lat: 50.9965, lon: 6.9935, label: 'Kai', tone: 'neutral' };
const FAR_ZONE: GeoMapShape = { name: 'Workshop', tone: 'muted', circle: { lat: 51.03, lon: 7.06, radius: 200 } };

// Placeholder tiles: each one is an inline SVG naming its own z/x/y, so the explorer makes no requests. An app
// passes its tile server's real XYZ template and the credit it requires instead, for example
// `tiles: { url: 'https://tiles.example.org/{z}/{x}/{y}.png', attribution: '© Example map contributors', maxZoom: 19 }`,
// and follows that server's usage policy.
const PLACEHOLDER_TILE = [
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>",
  "<rect width='256' height='256' fill='#efece6'/>",
  "<path d='M0 96H256M0 200H256M72 0V256M180 0V256' stroke='#ffffff' stroke-width='10'/>",
  "<path d='M0 0H256V256' fill='none' stroke='#d6d1c8' stroke-width='1'/>",
  "<text x='8' y='20' font-family='sans-serif' font-size='13' fill='#9a948a'>{z}/{x}/{y}</text>",
  '</svg>',
].join('');
const PLACEHOLDER_TILES: GeoMapTiles = {
  url: `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_TILE).replace(/%7B(z|x|y)%7D/g, '{$1}')}`,
  attribution: 'Placeholder tiles · an app passes its tile server and credit',
  maxZoom: 19,
};

export const mediaStories: Story[] = [
  {
    id: 'geo-map',
    render: () =>
      stack(
        caption('A park with a pond (accent area with a hole), a home zone (muted circle), a route and a person with accuracy'),
        createGeoMap({ label: 'Where Sam is', points: [SAM, KAI], shapes: [HOME_ZONE, PARK, WALK] }).el,
        caption('Fit to focus: the park and Sam; muted zones only as context, a far-away one left out'),
        createGeoMap({ label: 'Sam in the park', points: [SAM], shapes: [HOME_ZONE, FAR_ZONE, PARK], fit: 'focus', aspect: 4 / 3 }).el,
        caption('A single place: the view keeps a minimum span'),
        createGeoMap({ label: 'Phone location', points: [{ lat: 51.0, lon: 7.0, label: 'Phone', accuracy: 15 }], shapes: [], aspect: 2 }).el,
        caption('With a tile layer (placeholder tiles here, toned down in dark themes) and the required credit'),
        createGeoMap({ label: 'Where Sam is', points: [SAM, KAI], shapes: [HOME_ZONE, PARK, WALK], tiles: PLACEHOLDER_TILES }).el,
        caption('Nothing to show'),
        createGeoMap({ label: 'Map', points: [], shapes: [], aspect: 3 }).el,
      ),
  },
];

import { mediaEditorStories } from './media-editors.ts';

mediaStories.push(...mediaEditorStories);
