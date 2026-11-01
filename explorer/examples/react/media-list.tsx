import { useState } from 'react';
import { MediaList, Text } from '@mosaic-home/design-system/react';
import type { MediaListItem } from '@mosaic-home/design-system/web';

const songs: MediaListItem[] = [
  { title: 'Lanterns on the Quay', subtitle: 'Mira Holloway', meta: '3:42' },
  { title: 'Slow Tide Radio', subtitle: 'The Fenwick Lamps', meta: '4:15' },
  { title: 'Paper Weather', subtitle: 'Juno Marsh', meta: '2:58' },
];

export function MediaListExample() {
  const [playing, setPlaying] = useState<MediaListItem | null>(null);
  return (
    <>
      <MediaList
        label="Up next"
        items={songs}
        action="play"
        actionLabel="Play"
        onSelect={(i) => setPlaying(songs[i] ?? null)}
      />
      <Text variant="caption" tone="muted">
        {playing ? `Playing ${playing.title}` : 'Nothing playing'}
      </Text>
    </>
  );
}
