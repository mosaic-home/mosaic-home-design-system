import { createMediaList, createText, type MediaListItem } from '@mosaic-home/design-system/web';

const songs: MediaListItem[] = [
  { title: 'Lanterns on the Quay', subtitle: 'Mira Holloway', meta: '3:42' },
  { title: 'Slow Tide Radio', subtitle: 'The Fenwick Lamps', meta: '4:15' },
  { title: 'Paper Weather', subtitle: 'Juno Marsh', meta: '2:58' },
];

const playing = createText('Nothing playing', { variant: 'caption', tone: 'muted' });

const queue = createMediaList({
  label: 'Up next',
  items: songs,
  action: 'play',
  actionLabel: 'Play',
  onSelect: (i) => (playing.textContent = `Playing ${songs[i]!.title}`),
});

document.body.append(queue.el, playing);
