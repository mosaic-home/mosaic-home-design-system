import { act, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  createAlert,
  createAvatar,
  createAvatarGroup,
  createBadge,
  createCard,
  createCarousel,
  createEmptyState,
  createGrid,
  createList,
  createListItem,
  createProgressBar,
  createPropertyList,
  createProgressRing,
  createRow,
  createScreen,
  createSkeleton,
  createGeoMap,
  createSparkline,
  createSpinner,
  createStack,
  createStatTile,
  createStatus,
  createTile,
  createTileGrid,
} from '../web/index.ts';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  Carousel,
  EmptyState,
  Grid,
  List,
  ListItem,
  ProgressBar,
  ProgressRing,
  PropertyList,
  Row,
  Screen,
  Skeleton,
  GeoMap,
  Sparkline,
  Spinner,
  Stack,
  StatTile,
  Status,
  Tile,
  TileGrid,
} from './index.ts';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Tag, classes, role, ARIA, `hidden` and own text of every element, in document order. */
function shape(root: Element): string[] {
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => a.name === 'class' || a.name === 'role' || a.name === 'hidden' || a.name === 'tabindex' || a.name.startsWith('aria-') || a.name === 'd' || a.name === 'stroke-dasharray')
      .map((a) => `${a.name}=${a.value}`)
      .sort();
    const text = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join('');
    out.push(`${el.tagName.toLowerCase()} ${attrs.join(' ')} ${text}`.trim());
    Array.from(el.children).forEach(walk);
  };
  walk(root);
  return out;
}

function react(node: ReactElement): Element {
  const div = document.createElement('div');
  div.innerHTML = renderToStaticMarkup(node);
  // React 19 hoists a preload <link> for images; skip it.
  return div.querySelector(':scope > :not(link)')!;
}

const button = (): HTMLButtonElement => {
  const b = document.createElement('button');
  b.textContent = 'Go';
  return b;
};

describe('feedback parity', () => {
  it('Alert', () => {
    expect(
      shape(
        react(
          <Alert tone="warning" title="Battery low" action={<button>Go</button>} dismissible>
            Front door sensor is at 12%.
          </Alert>,
        ),
      ),
    ).toEqual(shape(createAlert({ tone: 'warning', title: 'Battery low', message: 'Front door sensor is at 12%.', action: button(), dismissible: true }).el));
    expect(shape(react(<Alert icon={false}>Saved</Alert>))).toEqual(shape(createAlert({ icon: false, message: 'Saved' }).el));
  });

  it('ProgressBar and ProgressRing', () => {
    expect(shape(react(<ProgressBar label="Battery" value={82} showLabel showValue tone="success" size="large" />))).toEqual(
      shape(createProgressBar({ label: 'Battery', value: 82, showLabel: true, showValue: true, tone: 'success', size: 'large' }).el),
    );
    expect(shape(react(<ProgressBar label="Searching" />))).toEqual(shape(createProgressBar({ label: 'Searching' }).el));
    expect(shape(react(<ProgressRing label="Rooms" value={5} max={8} valueText="5/8" />))).toEqual(shape(createProgressRing({ label: 'Rooms', value: 5, max: 8, valueText: '5/8' }).el));
    expect(shape(react(<ProgressRing label="Connecting" size="small" />))).toEqual(shape(createProgressRing({ label: 'Connecting', size: 'small' }).el));
  });

  it('Spinner, Skeleton, Badge, Status, EmptyState', () => {
    expect(shape(react(<Spinner size="small" inherit />))).toEqual(shape(createSpinner({ size: 'small', inherit: true }).el));
    expect(shape(react(<Skeleton lines={2} />))).toEqual(shape(createSkeleton({ lines: 2 }).el));
    expect(shape(react(<Skeleton shape="circle" />))).toEqual(shape(createSkeleton({ shape: 'circle' }).el));
    expect(shape(react(<Badge count={120} />))).toEqual(shape(createBadge({ count: 120 }).el));
    expect(shape(react(<Badge count={0} />))).toEqual(shape(createBadge({ count: 0 }).el));
    expect(shape(react(<Badge label="Beta" tone="accent" />))).toEqual(shape(createBadge({ label: 'Beta', tone: 'accent' }).el));
    expect(shape(react(<Badge dot attached label="New firmware" />))).toEqual(shape(createBadge({ dot: true, attached: true, label: 'New firmware' }).el));
    expect(shape(react(<Status state="live" announce />))).toEqual(shape(createStatus({ state: 'live', announce: true }).el));
    expect(shape(react(<EmptyState icon="lightbulb" title="No lights yet" text="Add one." action={<button>Go</button>} compact />))).toEqual(
      shape(createEmptyState({ icon: 'lightbulb', title: 'No lights yet', text: 'Add one.', action: button(), compact: true }).el),
    );
  });
});

describe('data-display parity', () => {
  it('Card', () => {
    expect(
      shape(
        react(
          <Card title="Living room" subtitle="3 lights on" icon="home" headerAction={<button>Go</button>} footer={<button>Go</button>}>
            Body
          </Card>,
        ),
      ),
    ).toEqual(shape(createCard({ title: 'Living room', subtitle: '3 lights on', icon: 'home', headerAction: button(), body: 'Body', footer: button() }).el));
    expect(shape(react(<Card title="Kitchen" variant="flat" onClick={() => undefined} label="Open kitchen" />))).toEqual(
      shape(createCard({ title: 'Kitchen', variant: 'flat', onClick: () => undefined, label: 'Open kitchen' }).el),
    );
  });

  it('Card as a link with media', () => {
    const img = (): HTMLImageElement => Object.assign(document.createElement('img'), { src: 'x.png', alt: '' });
    const r = react(
      <Card href="https://example.com/a" target="_blank" media={<img src="x.png" alt="" />} eyebrow="Example Times · 2 h" title="A headline" titleLines={3}>
        Snippet
      </Card>,
    );
    const w = createCard({ href: 'https://example.com/a', target: '_blank', media: img(), eyebrow: 'Example Times · 2 h', title: 'A headline', titleLines: 3, body: 'Snippet' }).el;
    expect(shape(r)).toEqual(shape(w));
    expect(r.getAttribute('href')).toBe(w.getAttribute('href'));
    expect(r.getAttribute('rel')).toBe(w.getAttribute('rel'));
    expect(r.getAttribute('target')).toBe(w.getAttribute('target'));
  });

  it('Carousel', () => {
    const r = react(
      <Carousel label="Results">
        <Card title="One" />
        <Card title="Two" />
      </Carousel>,
    );
    expect(shape(r)).toEqual(shape(createCarousel({ label: 'Results', items: [createCard({ title: 'One' }).el, createCard({ title: 'Two' }).el] }).el));
  });

  it('PropertyList', () => {
    expect(
      shape(
        react(
          <PropertyList
            dense
            items={[
              { label: 'Status', value: <strong>Printing</strong> },
              { label: 'Progress', value: '42 %' },
            ]}
          />,
        ),
      ),
    ).toEqual(
      shape(
        createPropertyList({
          dense: true,
          items: [
            { label: 'Status', value: Object.assign(document.createElement('strong'), { textContent: 'Printing' }) },
            { label: 'Progress', value: '42 %' },
          ],
        }).el,
      ),
    );
  });

  it('List and ListItem', () => {
    const items = [
      { title: 'Kitchen light', subtitle: 'On', icon: 'lightbulb', trailing: '80%' },
      { title: 'Wi-Fi', chevron: true, onClick: () => undefined },
      { title: 'Help', href: '#help', current: true, tone: 'danger' as const },
    ];
    expect(
      shape(
        react(
          <List inset label="Devices">
            {items.map((i) => (
              <ListItem key={i.title} {...i} />
            ))}
          </List>,
        ),
      ),
    ).toEqual(shape(createList({ inset: true, label: 'Devices', items }).el));
    expect(shape(react(<ListItem title="Guest" leading={<span>G</span>} disabled />))).toEqual(
      shape(
        createListItem({
          title: 'Guest',
          leading: Object.assign(document.createElement('span'), { textContent: 'G' }),
          disabled: true,
        }),
      ),
    );
  });

  it('Avatar and AvatarGroup', () => {
    expect(shape(react(<Avatar name="Living room" size="xlarge" status="busy" src="x.png" />))).toEqual(shape(createAvatar({ name: 'Living room', size: 'xlarge', status: 'busy', src: 'x.png' }).el));
    const avatars = [{ name: 'Guest' }, { name: 'Visitor' }, { name: 'Home owner' }];
    expect(shape(react(<AvatarGroup avatars={avatars} max={2} size="small" label="At home" />))).toEqual(shape(createAvatarGroup({ avatars, max: 2, size: 'small', label: 'At home' }).el));
  });

  it('Tile, StatTile and TileGrid', () => {
    expect(shape(react(<Tile icon="lightbulb" iconOn="lightbulb-on" label="Kitchen light" state="On" on />))).toEqual(
      shape(createTile({ icon: 'lightbulb', iconOn: 'lightbulb-on', label: 'Kitchen light', state: 'On', on: true }).el),
    );
    expect(shape(react(<Tile icon="camera" label="Camera" />))).toEqual(shape(createTile({ icon: 'camera', label: 'Camera' }).el));
    expect(shape(react(<StatTile label="Battery" value={82} unit="%" icon="power" trend="up" caption="Today" />))).toEqual(
      shape(createStatTile({ label: 'Battery', value: 82, unit: '%', icon: 'power', trend: 'up', caption: 'Today' }).el),
    );
    expect(shape(react(<TileGrid size="large" label="Devices" />))).toEqual(shape(createTileGrid([], { size: 'large', label: 'Devices' }).el));
  });
});

describe('charts and layout parity', () => {
  it('Sparkline', () => {
    const values = [3, 5, null, 4, 8];
    expect(shape(react(<Sparkline values={values} label="Power" color={2} area size="large" />))).toEqual(shape(createSparkline({ values, label: 'Power', color: 2, area: true, size: 'large' }).el));
    expect(shape(react(<Sparkline values={[1, null]} label="Gap" dot />))).toEqual(shape(createSparkline({ values: [1, null], label: 'Gap' }).el));
  });

  it('GeoMap', () => {
    const options = {
      label: 'Map',
      points: [
        { lat: 0, lon: 0, label: 'Sam', accuracy: 30 },
        { lat: 0.002, lon: 0.004, label: 'Kai', tone: 'neutral' as const },
        { lat: 0.0005, lon: 0.003, label: 'Home', tone: 'home' as const },
      ],
      shapes: [
        { name: 'Park', rings: [[[0, 0], [0.004, 0], [0.004, 0.003], [0, 0.003]], [[0.001, 0.001], [0.002, 0.001], [0.002, 0.002]]] as [number, number][][] },
        { name: 'Home', tone: 'muted' as const, circle: { lat: 0.001, lon: 0.001, radius: 80 } },
        { open: true, rings: [[[0, 0], [0.003, 0.002]]] as [number, number][][] },
      ],
      fit: 'focus' as const,
      aspect: 4 / 3,
    };
    expect(shape(react(<GeoMap {...options} />))).toEqual(shape(createGeoMap(options).el));
    expect(shape(react(<GeoMap label="Empty" points={[]} shapes={[]} />))).toEqual(shape(createGeoMap({ label: 'Empty', points: [], shapes: [] }).el));
    const tiles = { url: 'https://tiles.example.org/{z}/{x}/{y}.png', attribution: 'Example <i>contributors</i>' };
    const tiled = shape(react(<GeoMap {...options} tiles={tiles} />));
    expect(tiled).toEqual(shape(createGeoMap({ ...options, tiles }).el));
    expect(tiled.filter((line) => line.startsWith('img '))).not.toHaveLength(0);
  });

  it('Screen, Stack, Row and Grid', () => {
    expect(shape(react(<Screen width="wide" header={<h1>Home</h1>} label="Home">Content</Screen>))).toEqual(
      shape(createScreen({ width: 'wide', header: Object.assign(document.createElement('h1'), { textContent: 'Home' }), label: 'Home' }, 'Content').el),
    );
    expect(shape(react(<Stack gap="xl" as="section" />))).toEqual(shape(createStack({ gap: 'xl', as: 'section' }).el));
    expect(shape(react(<Row justify="between" wrap />))).toEqual(shape(createRow({ justify: 'between', wrap: true }).el));
    expect(shape(react(<Grid min="small" gap="xs" />))).toEqual(shape(createGrid({ min: 'small', gap: 'xs' }).el));
  });
});

describe('behaviour', () => {
  it('Tile reports toggles and Alert dismisses itself', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    const seen: boolean[] = [];
    await act(async () => {
      root.render(
        <>
          <Tile icon="lightbulb" label="Kitchen light" on={false} onToggle={(on) => seen.push(on)} />
          <Alert dismissible>Saved</Alert>
        </>,
      );
    });
    await act(async () => host.querySelector<HTMLButtonElement>('.mh-tile')!.click());
    expect(seen).toEqual([true]);
    await act(async () => host.querySelector<HTMLButtonElement>('.mh-alert__dismiss')!.click());
    expect(host.querySelector('.mh-alert')).toBeNull();
    await act(async () => root.unmount());
  });
});
