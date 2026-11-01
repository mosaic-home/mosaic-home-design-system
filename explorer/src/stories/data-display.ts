import { h } from '../../../src/web/dom.ts';
import { createButton } from '../../../src/web/actions/button.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createAvatar, createAvatarGroup, type AvatarSize } from '../../../src/web/data-display/avatar.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { createCarousel } from '../../../src/web/data-display/carousel.ts';
import { createPropertyList } from '../../../src/web/data-display/propertyList.ts';
import { createMediaList } from '../../../src/web/data-display/mediaList.ts';
import { createTimeline } from '../../../src/web/data-display/timeline.ts';
import { createList, createListSection } from '../../../src/web/data-display/list.ts';
import { createStatTile, createTile, createTileGrid } from '../../../src/web/data-display/tiles.ts';
import { createBadge } from '../../../src/web/feedback/badge.ts';
import { createText, textClass } from '../../../src/web/foundations/text.ts';
import { createForecastStrip, type ForecastReading } from '../../../src/web/data-display/forecastStrip.ts';
import { createAccordion } from '../../../src/web/data-display/accordion.ts';
import { createDataTable, type DataTableColumn } from '../../../src/web/data-display/dataTable.ts';
import { createQrCode } from '../../../src/web/data-display/qrCode.ts';
import { createTree, type TreeNode } from '../../../src/web/data-display/tree.ts';
import { createTextField } from '../../../src/web/text-inputs/textField.ts';
import type { Story } from './types.ts';

const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });
const createTextClamp = (text: string): HTMLElement => h('p', { class: `${textClass('body', 'muted')} mh-clamp-2` }, text);
const grid = (...children: Node[]): HTMLElement => h('div', { class: 'mh-grid' }, ...children);

export const dataDisplayStories: Story[] = [
  {
    id: 'card',
    render: () =>
      grid(
        createCard({
          title: 'Living room',
          subtitle: '3 lights on',
          icon: 'home',
          headerAction: createIconButton({ icon: 'more', label: 'More options', size: 'small' }).el,
          body: createText('21.5° and 46% humidity. The blinds close at 20:00.', { tone: 'muted' }),
          footer: [createButton({ label: 'All off', variant: 'text', size: 'small' }).el, createButton({ label: 'Open', size: 'small' }).el],
        }).el,
        createCard({ title: 'Flat card', variant: 'flat', body: createText('No shadow; the outline and surface only.', { tone: 'muted' }) }).el,
        createCard({ title: 'Inset card', variant: 'inset', body: createText('Sits in a well, a step below the surface.', { tone: 'muted' }) }).el,
        createCard({
          title: 'Kitchen',
          subtitle: 'Pressable: the whole card opens the room',
          icon: 'lightbulb',
          headerAction: createBadge({ label: '2 on', tone: 'accent' }).el,
          onClick: () => undefined,
        }).el,
      ),
  },
  {
    id: 'list',
    render: () =>
      stack(
        caption('Rich rows'),
        createList({
          label: 'Devices',
          items: [
            { title: 'Kitchen light', subtitle: 'On, 80%', icon: 'lightbulb-on', trailing: createBadge({ label: 'On', tone: 'accent' }).el, onClick: () => undefined },
            { title: 'Hallway sensor', subtitle: 'Battery 82%', icon: 'thermometer', trailing: '19.5°', onClick: () => undefined },
            { title: 'Guest', subtitle: 'Away since 09:10', leading: createAvatar({ name: 'Guest', size: 'small', status: 'away' }).el, chevron: true, onClick: () => undefined },
            { title: 'Bedroom fan', subtitle: 'Unavailable', icon: 'fan', disabled: true, onClick: () => undefined },
          ],
        }).el,
        createListSection({
          title: 'Settings',
          footnote: 'Changes apply to every screen in the home.',
          content: createList({
            inset: true,
            items: [
              { title: 'Wi-Fi', icon: 'wifi', trailing: 'Connected', chevron: true, onClick: () => undefined },
              { title: 'Notifications', icon: 'bell', trailing: createBadge({ count: 2 }).el, chevron: true, onClick: () => undefined },
              { title: 'Appearance', icon: 'eye', trailing: 'Auto', chevron: true, onClick: () => undefined },
              { title: 'Remove this screen', icon: 'delete', tone: 'danger', onClick: () => undefined },
            ],
          }).el,
        }).el,
      ),
  },
  {
    id: 'avatar',
    render: () => {
      const sizes: AvatarSize[] = ['small', 'medium', 'large', 'xlarge'];
      return stack(
        row(...sizes.map((size) => createAvatar({ name: 'Living room', size }).el)),
        row(
          createAvatar({ name: 'Guest', status: 'online' }).el,
          createAvatar({ name: 'Home owner', status: 'busy' }).el,
          createAvatar({ name: 'Visitor', status: 'away' }).el,
          createAvatar({ name: 'Kitchen display', status: 'offline' }).el,
          createAvatar({ name: 'Broken image', src: 'data:image/png;base64,AAAA' }).el,
        ),
        caption('Group'),
        createAvatarGroup({
          label: 'People at home',
          max: 4,
          avatars: [{ name: 'Guest' }, { name: 'Home owner' }, { name: 'Visitor' }, { name: 'Child room' }, { name: 'Night shift' }, { name: 'Cleaner' }],
        }).el,
      );
    },
  },
  {
    id: 'tiles',
    render: () =>
      stack(
        caption('Toggle tiles'),
        createTileGrid(
          [
            createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Kitchen light', state: 'On', on: true }).el,
            createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Living room', state: 'Off', on: false }).el,
            createTile({ icon: 'fan', label: 'Bedroom fan', state: 'Speed 2', on: true }).el,
            createTile({ icon: 'lock', label: 'Front door', state: 'Locked', on: false }).el,
            createTile({ icon: 'music', label: 'Speaker', state: 'Unavailable', disabled: true, on: false }).el,
            createTile({ icon: 'camera', label: 'Garden camera', state: 'Open feed' }).el,
          ],
          { label: 'Living room devices' },
        ).el,
        caption('Stat tiles'),
        createTileGrid([
          createStatTile({ label: 'Temperature', icon: 'thermometer', value: '21.5', unit: '°C', trend: 'up', caption: 'Since 07:00' }).el,
          createStatTile({ label: 'Battery', value: 82, unit: '%', trend: 'down' }).el,
          createStatTile({ label: 'Energy today', value: '4.2', unit: 'kWh', trend: 'flat' }).el,
        ]).el,
      ),
  },
  {
    id: 'carousel',
    render: () => {
      // Stand-in artwork: a gradient from the theme's series colours, so the story needs no image files.
      const art = (a: number, b: number): HTMLElement =>
        h('div', { 'aria-hidden': 'true', style: `width: 100%; height: 100%; background: linear-gradient(135deg, var(--mh-series-${a}), var(--mh-series-${b}))` });
      // A link card: `href` makes the whole card one link; `media` sits on top at 16:9; `eyebrow` is the
      // source and time; `titleLines` and `.mh-clamp-2` on the snippet keep cards in the row even.
      const news = (source: string, time: string, title: string, snippet?: string, media?: HTMLElement): HTMLElement =>
        createCard({
          href: '#',
          media,
          eyebrow: `${source} · ${time}`,
          title,
          titleLines: 3,
          variant: 'flat',
          body: snippet ? createTextClamp(snippet) : undefined,
        }).el;
      return stack(
        caption('Answer cards: swipe, or focus the row and use Arrow Left / Right'),
        createCarousel({
          label: 'News results',
          items: [
            news('Riverside Courier', '2 h ago', 'Town council approves a new cycle path along the old canal towpath', 'Work starts in spring and the path should open before the summer holidays.', art(1, 2)),
            news('Morning Ledger', '5 h ago', 'Local bakery wins regional prize for its sourdough loaf', 'Judges praised the crust and the long, slow fermentation.', art(3, 4)),
            news('Valley Weekly', 'Yesterday', 'Library extends weekend opening hours after a successful trial', undefined, art(5, 6)),
            news('Harbour Post', '2 days ago', 'Volunteers plant four hundred trees in the north park in a single weekend', 'The new trees replace those lost in last winter’s storms.'),
          ],
        }).el,
      );
    },
  },
  {
    id: 'property-list',
    render: () =>
      grid(
        createCard({
          title: 'Printer',
          body: createPropertyList({
            items: [
              { label: 'Status', value: createBadge({ label: 'Printing', tone: 'accent' }).el },
              { label: 'Progress', value: '42 %' },
              { label: 'Time left', value: '1 h 18 min' },
              { label: 'Nozzle', value: '215 °C' },
              { label: 'Bed', value: '60 °C' },
              { label: 'File', value: 'replacement_hinge_for_the_garden_shed_door_v3_final.gcode' },
            ],
          }).el,
        }).el,
        createCard({
          title: 'Dense',
          body: createPropertyList({
            dense: true,
            items: [
              { label: 'Battery', value: '82 %' },
              { label: 'Signal', value: '-61 dBm' },
              { label: 'Firmware', value: '1.4.2' },
              { label: 'Last seen', value: '12:04' },
            ],
          }).el,
        }).el,
      ),
  },
  {
    id: 'timeline',
    render: () => {
      const selected = createText('Press a departure', { variant: 'label', tone: 'muted' });
      const departures = [
        { time: '07:42', title: 'Line 4 to Harbour Square', detail: 'Platform 2' },
        { time: '07:51', title: 'Line 11 to North Park', detail: 'Platform 1 · 3 min late', tone: 'warning' as const },
        { time: '08:05', title: 'Line 4 to Harbour Square', detail: 'Cancelled', tone: 'danger' as const },
        { time: '08:12', title: 'Express to Airport', detail: 'Platform 3 · on time', tone: 'success' as const },
      ];
      return grid(
        createCard({
          title: 'Departures',
          body: [
            createTimeline({
              label: 'Departures',
              items: departures,
              onSelect: (i) => (selected.textContent = `Selected: ${departures[i]!.time} ${departures[i]!.title}`),
            }).el,
            selected,
          ],
        }).el,
        createCard({
          title: 'Reminders',
          body: createTimeline({
            label: 'Reminders',
            items: [
              { time: 'Today', title: 'Put the recycling out', tone: 'accent' },
              { time: 'Tue', title: 'Replace the hallway smoke alarm battery' },
              { time: '14 Nov', title: 'Boiler service', detail: 'Between 09:00 and 12:00' },
            ],
          }).el,
        }).el,
        createCard({
          title: 'Activity',
          body: createTimeline({
            variant: 'feed',
            label: 'Recent activity',
            items: [
              { time: '2 min ago', title: 'Front door unlocked', detail: 'With the keypad', icon: 'lock', tone: 'accent' },
              { time: '18 min ago', title: 'Washing machine finished', icon: 'check', tone: 'success' },
              { time: '1 h ago', title: 'Kitchen light turned on', icon: 'lightbulb-on' },
              { time: '3 h ago', title: 'Garden sensor battery low', detail: '12% left', icon: 'warning', tone: 'warning' },
            ],
          }).el,
        }).el,
        createCard({
          title: 'Parcel',
          body: createTimeline({
            variant: 'feed',
            label: 'Parcel journey',
            items: [
              { time: 'Mon 09:14', title: 'Ordered', tone: 'success' },
              { time: 'Mon 17:30', title: 'Dispatched', detail: 'From the regional depot', tone: 'success' },
              { time: 'Today 07:05', title: 'Out for delivery', detail: 'Expected between 13:00 and 15:00', tone: 'accent' },
              { time: 'Expected', title: 'Delivered' },
            ],
          }).el,
        }).el,
      );
    },
  },
  {
    id: 'media-list',
    render: () => {
      // Stand-in artwork as inline SVG, so the story needs no image files or network.
      const art = (a: string, b: string): string =>
        `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/></svg>`)}`;
      const playing = createText('Nothing playing', { variant: 'label', tone: 'muted' });
      const songs = [
        { title: 'Lanterns on the Quay', subtitle: 'Mira Holloway', meta: '3:42', image: art('#d9774b', '#5b3a8c') },
        { title: 'Slow Tide Radio', subtitle: 'The Fenwick Lamps', meta: '4:15', image: art('#2f8f83', '#1d3557') },
        { title: 'A very long song title that does not fit on one line of a phone screen', subtitle: 'Orchard Static', meta: '6:03', image: null },
        { title: 'Paper Weather', subtitle: 'Juno Marsh', meta: '2:58', image: 'data:image/png;base64,AAAA' },
      ];
      return grid(
        createCard({
          title: 'Up next',
          body: [
            createMediaList({
              label: 'Up next',
              action: 'play',
              actionLabel: 'Play',
              items: songs,
              onSelect: (i) => (playing.textContent = `Playing ${songs[i]!.title}`),
            }).el,
            playing,
          ],
        }).el,
        createCard({
          title: 'Films',
          body: createMediaList({
            label: 'Films',
            placeholder: 'film',
            items: [
              { title: 'The Glass Orchard', subtitle: 'Drama', meta: '1 h 52 min', image: art('#e0b04a', '#8c3b2f') },
              { title: 'Night Ferry', subtitle: 'Thriller', meta: '2 h 4 min' },
              { title: 'Small Hours', meta: 'Episode 3' },
            ],
          }).el,
        }).el,
      );
    },
  },
  {
    id: 'forecast-strip',
    render: () => {
      const week: ForecastReading[] = [
        { label: 'Today', condition: 'partly-cloudy', value: 16, low: 9, sub: '10%' },
        { label: 'Thu', condition: 'rain', conditionText: 'Light rain showers', value: 14, low: 8, sub: '80%' },
        { label: 'Fri', condition: 'pouring', value: 12, low: 7, sub: '95%' },
        { label: 'Sat', condition: 'cloudy', value: 13, low: 6 },
        { label: 'Sun', condition: 'clear', value: 17, low: 7 },
        { label: 'Mon', condition: 'lightning-rain', value: 19, low: 11, sub: '60%' },
        { label: 'Tue', condition: 'snow', value: 2, low: -3, sub: '40%' },
        { label: 'Wed', condition: 'fog', value: 8, low: 4 },
      ];
      const hours: ForecastReading[] = Array.from({ length: 24 }, (_, i) => {
        const hour = (14 + i) % 24;
        const night = hour < 7 || hour >= 20;
        const wet = i >= 4 && i <= 8;
        return {
          label: i === 0 ? 'Now' : `${String(hour).padStart(2, '0')}:00`,
          condition: wet ? 'rain' : night ? 'clear-night' : 'partly-cloudy',
          value: Math.round(15 - Math.abs(i - 2) * 0.6),
          sub: wet ? `${40 + i * 5}%` : null,
        };
      });
      return stack(
        caption('Days: up to seven equal columns (the eighth reading is left out); high, low muted, chance of rain'),
        createForecastStrip({ label: 'Next 7 days', readings: week, subName: 'rain' }).el,
        caption('Hours: a fixed column width that scrolls sideways and snaps; focus it and use the arrow keys'),
        createForecastStrip({ label: 'Next 24 hours', readings: hours, variant: 'hours', subName: 'rain' }).el,
        caption('Readings outside the period of interest are muted'),
        createForecastStrip({
          label: 'This afternoon',
          readings: hours.slice(0, 8).map((r, i) => ({ ...r, state: i < 2 || i > 5 ? 'outside' : 'within' })),
          variant: 'hours',
        }).el,
      );
    },
  },
  {
    id: 'accordion',
    render: () =>
      stack(
        caption('Many open (default), one panel with dividers'),
        createAccordion({
          open: ['lights'],
          sections: [
            { id: 'lights', title: 'Lights', subtitle: '3 of 7 on', icon: 'lightbulb', meta: '3', content: createText('Turn lights off automatically when a room has been empty for 15 minutes.', { tone: 'muted' }) },
            { id: 'climate', title: 'Climate', subtitle: 'Heating to 21°', icon: 'thermometer', content: createText('The schedule lowers the target by 2° overnight.', { tone: 'muted' }) },
            { id: 'media', title: 'Media', icon: 'music', content: createText('Pause everything when someone rings the doorbell.', { tone: 'muted' }) },
            { id: 'locks', title: 'Locks', subtitle: 'Needs an admin', icon: 'lock', disabled: true },
          ],
        }).el,
        caption('One open at a time, always one open, separated cards'),
        createAccordion({
          mode: 'single',
          required: true,
          variant: 'separated',
          sections: [
            { id: 'q1', title: 'How do I add a device?', content: createText('Open Settings, choose Devices and press Add. The display finds devices on the same network.', { tone: 'muted' }) },
            { id: 'q2', title: 'Can the screen dim at night?', content: createText('Yes: under Display, set a quiet period and a night brightness.', { tone: 'muted' }) },
            { id: 'q3', title: 'What happens when the network drops?', content: createText('Controls show their last known state and reconnect on their own.', { tone: 'muted' }) },
          ],
        }).el,
      ),
  },
  {
    id: 'tree',
    render: () => {
      const nodes: TreeNode[] = [
        {
          id: 'ground',
          label: 'Ground floor',
          icon: 'home',
          meta: '9',
          children: [
            { id: 'living', label: 'Living room', meta: '4', children: [{ id: 'l1', label: 'Floor lamp', icon: 'lightbulb' }, { id: 'l2', label: 'Ceiling light', icon: 'lightbulb' }, { id: 'l3', label: 'Speaker', icon: 'music' }, { id: 'l4', label: 'Thermostat', icon: 'thermometer' }] },
            { id: 'kitchen', label: 'Kitchen', meta: '3', children: [{ id: 'k1', label: 'Counter strip', icon: 'lightbulb' }, { id: 'k2', label: 'Extractor fan', icon: 'fan' }, { id: 'k3', label: 'Window sensor', icon: 'wifi' }] },
            { id: 'hall', label: 'Hallway', meta: '2', children: [{ id: 'h1', label: 'Front door lock', icon: 'lock' }, { id: 'h2', label: 'Doorbell camera', icon: 'camera', disabled: true }] },
          ],
        },
        { id: 'upstairs', label: 'Upstairs', icon: 'home', children: [{ id: 'bed', label: 'Bedroom', children: [{ id: 'b1', label: 'Bedside lamp', icon: 'lightbulb' }] }, { id: 'bath', label: 'Bathroom' }] },
        { id: 'garden', label: 'Garden', icon: 'weather' },
      ];
      const picked = createText('Selected: Kitchen', { variant: 'caption', tone: 'muted' });
      const checked = createText('2 devices in the scene', { variant: 'caption', tone: 'muted' });
      return h(
        'div',
        { class: 'mh-grid' },
        stack(
          caption('Select a room; arrows, Home, End, * and typing move'),
          createTree({ nodes, label: 'Rooms', expanded: ['ground'], selected: 'kitchen', onSelect: (id) => (picked.textContent = `Selected: ${id}`) }).el,
          picked,
        ),
        stack(
          caption('Checkable and dense: parents check everything under them'),
          createTree({
            nodes,
            label: 'Scene devices',
            checkable: true,
            dense: true,
            expanded: ['ground', 'living', 'hall'],
            checked: ['l1', 'l2'],
            onCheckedChange: (ids) => (checked.textContent = `${ids.length} devices in the scene`),
          }).el,
          checked,
        ),
      );
    },
  },
  {
    id: 'data-table',
    render: () => {
      interface Device {
        id: string;
        name: string;
        room: string;
        kind: string;
        battery: number | null;
        seen: string;
      }
      const devices: Device[] = [
        { id: 'd1', name: 'Hall motion sensor', room: 'Hallway', kind: 'Sensor', battery: 82, seen: '1 min ago' },
        { id: 'd2', name: 'Front door lock', room: 'Hallway', kind: 'Lock', battery: 9, seen: 'Just now' },
        { id: 'd3', name: 'Desk lamp', room: 'Study', kind: 'Light', battery: null, seen: 'Just now' },
        { id: 'd4', name: 'Bathroom sensor 2', room: 'Bathroom', kind: 'Sensor', battery: 45, seen: '4 min ago' },
        { id: 'd5', name: 'Bathroom sensor 10', room: 'Bathroom', kind: 'Sensor', battery: 100, seen: '2 min ago' },
        { id: 'd6', name: 'Kitchen window', room: 'Kitchen', kind: 'Contact', battery: 67, seen: '12 min ago' },
        { id: 'd7', name: 'Bedroom radiator', room: 'Bedroom', kind: 'Valve', battery: 23, seen: '1 h ago' },
        { id: 'd8', name: 'Garden plug', room: 'Garden', kind: 'Plug', battery: null, seen: 'Yesterday' },
      ];
      const tone = (b: number | null): 'danger' | 'warning' | 'success' | 'neutral' => (b === null ? 'neutral' : b < 15 ? 'danger' : b < 40 ? 'warning' : 'success');
      const columns: DataTableColumn<Device>[] = [
        { id: 'name', label: 'Name', sortable: true, width: 200 },
        { id: 'room', label: 'Room', sortable: true },
        { id: 'kind', label: 'Type', sortable: true },
        { id: 'battery', label: 'Battery', align: 'end', sortable: true, render: (d) => createBadge({ label: d.battery === null ? 'Mains' : `${d.battery}%`, tone: tone(d.battery) }).el },
        { id: 'seen', label: 'Last seen', align: 'end' },
      ];
      const status = createText('Nothing selected', { variant: 'caption', tone: 'muted' });
      return stack(
        caption('Sortable, selectable, sticky header and first column, resizable (drag the header edges or use the arrow keys on them)'),
        createDataTable({
          columns,
          rows: devices,
          rowId: (d) => d.id,
          rowLabel: (d) => d.name,
          label: 'Devices',
          showCaption: true,
          selectable: true,
          resizable: true,
          stickyColumn: true,
          maxHeight: '18rem',
          sort: { column: 'name', direction: 'ascending' },
          onSelectionChange: (ids) => (status.textContent = ids.length ? `${ids.length} selected` : 'Nothing selected'),
        }).el,
        status,
        caption('Dense and striped'),
        createDataTable({ columns: columns.map((c) => ({ ...c, width: undefined })), rows: devices.slice(0, 5), rowId: (d) => d.id, label: 'Sensors', dense: true, striped: true }).el,
        caption('Empty'),
        createDataTable({ columns, rows: [], rowId: (d) => d.id, label: 'Offline devices', empty: 'Every device is online' }).el,
      );
    },
  },
  {
    id: 'qr-code',
    render: () => {
      const link = createQrCode({ value: 'https://homeassistant.local:8123/', label: 'Link to the dashboard', caption: 'Open on your phone', size: 'large' });
      const field = createTextField({ label: 'Text to encode', value: 'https://homeassistant.local:8123/' });
      const input = field.input;
      const meta = createText('', { variant: 'caption', tone: 'muted' });
      const sync = (): void => {
        link.setValue(input.value);
        const m = link.matrix();
        meta.textContent = `Version ${m.version}, level ${m.ecc}, mask ${m.mask}, ${m.size}×${m.size} modules`;
      };
      input.addEventListener('input', sync);
      sync();
      return stack(
        caption('Type to re-encode; always dark modules on a light plate with a four-module quiet zone'),
        field.el,
        meta,
        row(
          link.el,
          createQrCode({ value: 'WIFI:T:WPA;S:Guest network;P:lanterns-over-the-quay;;', label: 'Join the guest Wi-Fi', caption: 'Guest Wi-Fi', ecc: 'H' }).el,
          createQrCode({ value: 'mosaic-pair:7Q2X-91KD', label: 'Pairing code', caption: 'Pair a display', size: 'small' }).el,
        ),
      );
    },
  },
];
