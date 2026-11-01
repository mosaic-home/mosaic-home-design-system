import { createText, createTimeline, type TimelineItem } from '@mosaic-home/design-system/web';

const departures: TimelineItem[] = [
  { time: '07:42', title: 'Line 4 to Harbour Square', detail: 'Platform 2' },
  { time: '07:51', title: 'Line 11 to North Park', detail: '3 min late', tone: 'warning' },
  { time: '08:05', title: 'Line 4 to Harbour Square', detail: 'Cancelled', tone: 'danger' },
  { time: '08:12', title: 'Express to the airport', detail: 'On time', tone: 'success' },
];

const selected = createText('Press a departure', { variant: 'caption', tone: 'muted' });

const timeline = createTimeline({
  label: 'Departures',
  items: departures,
  onSelect: (i) => (selected.textContent = `Selected: ${departures[i]!.time} ${departures[i]!.title}`),
});

document.body.append(timeline.el, selected);
