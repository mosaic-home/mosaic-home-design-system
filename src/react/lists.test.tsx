import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createMediaList, createProgressList, createTimeline, createTrend } from '../web/index.ts';
import { MediaList, ProgressList, Timeline, Trend } from './index.ts';

/** Tag, classes, role, ARIA, `hidden`, the image attributes and own text of every element, in document order. */
function shape(root: Element): string[] {
  const keep = new Set(['class', 'role', 'hidden', 'tabindex', 'type', 'd', 'src', 'loading', 'referrerpolicy', 'alt']);
  const out: string[] = [];
  const walk = (el: Element): void => {
    const attrs = Array.from(el.attributes)
      .filter((a) => keep.has(a.name) || a.name.startsWith('aria-'))
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
  // React 19 may hoist a preload <link> for images; skip it.
  return div.querySelector(':scope > :not(link)')!;
}

const noop = (): void => undefined;

describe('list parity', () => {
  it('Timeline', () => {
    const items = [
      { time: '07:42', title: 'Line 4', detail: 'Platform 2', tone: 'warning' as const, icon: 'lock' },
      { time: '07:51', title: 'Line 11' },
    ];
    expect(shape(react(<Timeline items={items} label="Departures" />))).toEqual(shape(createTimeline({ items, label: 'Departures' }).el));
    expect(shape(react(<Timeline items={items} variant="feed" onSelect={noop} />))).toEqual(shape(createTimeline({ items, variant: 'feed', onSelect: noop }).el));
  });

  it('MediaList', () => {
    const items = [
      { title: 'Song', subtitle: 'Artist', meta: '3:42', image: 'cover.png' },
      { title: 'Film', image: null, placeholder: 'film' },
      { title: 'Episode', meta: 'S1 E2' },
    ];
    expect(shape(react(<MediaList items={items} label="Up next" />))).toEqual(shape(createMediaList({ items, label: 'Up next' }).el));
    expect(shape(react(<MediaList items={items} action="play" actionLabel="Play" onSelect={noop} />))).toEqual(
      shape(createMediaList({ items, action: 'play', actionLabel: 'Play', onSelect: noop }).el),
    );
  });

  it('ProgressList', () => {
    const items = [
      { name: 'Firmware', value: 42, status: 'Downloading', detail: '12 min left', tone: 'success' as const },
      { name: 'Map', value: null },
    ];
    expect(shape(react(<ProgressList items={items} label="Jobs" />))).toEqual(shape(createProgressList({ items, label: 'Jobs' }).el));
  });

  it('Trend', () => {
    const values = [19.5, null, 21.3];
    expect(shape(react(<Trend name="Living room" value={21.3} unit="°C" values={values} color={2} />))).toEqual(
      shape(createTrend({ name: 'Living room', value: 21.3, unit: '°C', values, color: 2 }).el),
    );
    expect(shape(react(<Trend name="Power" value={null} values={[]} range="No readings" />))).toEqual(shape(createTrend({ name: 'Power', value: null, values: [], range: 'No readings' }).el));
  });
});
