import { useState } from 'react';
import { MediaTimeline } from '@mosaic-home/design-system/react';
import type { TimelineClipChange, TimelineTrack } from '@mosaic-home/design-system/web';

const TRACKS: TimelineTrack[] = [
  {
    id: 'video',
    name: 'Video',
    icon: 'film',
    clips: [
      { id: 'garden', start: 0, end: 7.5, label: 'Morning garden' },
      { id: 'kitchen', start: 7.5, end: 15, label: 'Kitchen', tone: 2 },
    ],
  },
  { id: 'titles', name: 'Titles', clips: [{ id: 'title', start: 1, end: 5, label: 'Our week', tone: 5 }] },
  { id: 'music', name: 'Music', icon: 'music', locked: true, clips: [{ id: 'song', start: 0, end: 20, label: 'Quiet Harbour', tone: 4 }] },
];

const applyChange = (tracks: TimelineTrack[], { clipId, start, end }: TimelineClipChange) =>
  tracks.map((track) => ({ ...track, clips: track.clips.map((c) => (c.id === clipId ? { ...c, start, end } : c)) }));

export function MediaTimelineExample() {
  const [tracks, setTracks] = useState(TRACKS);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <MediaTimeline
      label="Edit timeline"
      duration={20}
      tracks={tracks}
      position={position}
      selected={selected}
      zoom={40}
      onSeek={setPosition}
      onSelect={setSelected}
      onClipChange={(change, committed) => committed && setTracks((list) => applyChange(list, change))}
    />
  );
}
