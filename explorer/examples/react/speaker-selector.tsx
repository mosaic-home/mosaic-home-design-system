import { useState } from 'react';
import { SpeakerSelector } from '@mosaic-home/design-system/react';
import type { Speaker } from '@mosaic-home/design-system/web';

export function SpeakerSelectorExample() {
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 'living', name: 'Living room', detail: 'Soundbar', selected: true, volume: 0.42, muted: false },
    { id: 'kitchen', name: 'Kitchen', detail: 'Shelf speaker', selected: true, volume: 0.25, muted: false },
    { id: 'study', name: 'Study', detail: 'Desk speaker', volume: 0.5, muted: false },
  ]);
  const change = (id: string, patch: Partial<Speaker>) =>
    setSpeakers((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  return (
    <SpeakerSelector
      speakers={speakers}
      multiple
      onSelect={(id, selected) => change(id, { selected })}
      onVolume={(id, volume) => change(id, { volume, muted: false })}
      onMute={(id, muted) => change(id, { muted })}
    />
  );
}
