import { createMediaTimeline, createText, formatTimecode, type TimelineTrack } from '@mosaic-home/design-system/web';

const tracks: TimelineTrack[] = [
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

const status = createText('Drag clips to move them, their edges to trim.', { variant: 'caption', tone: 'muted' });

const timeline = createMediaTimeline({
  label: 'Edit timeline',
  duration: 20,
  tracks,
  zoom: 40,
  onSeek: (t) => (status.textContent = `Playhead at ${formatTimecode(t, { decimals: 1 })}`),
  onClipChange: (change, committed) => {
    if (committed) status.textContent = `${change.clipId}: ${formatTimecode(change.start)} to ${formatTimecode(change.end)}`;
  },
});

document.body.append(timeline.el, status);
