import { createSpeakerSelector, type Speaker, type SpeakerSelectorEvents } from '@mosaic-home/design-system/web';

let speakers: Speaker[] = [
  { id: 'living', name: 'Living room', detail: 'Soundbar', selected: true, volume: 0.42, muted: false },
  { id: 'kitchen', name: 'Kitchen', detail: 'Shelf speaker', selected: true, volume: 0.25, muted: false },
  { id: 'study', name: 'Study', detail: 'Desk speaker', volume: 0.5, muted: false },
];

const change = (id: string, patch: Partial<Speaker>): void => {
  speakers = speakers.map((s) => (s.id === id ? { ...s, ...patch } : s));
  selector.update({ speakers, multiple: true, ...events });
};

const events: SpeakerSelectorEvents = {
  onSelect: (id, selected) => change(id, { selected }),
  onVolume: (id, volume) => change(id, { volume, muted: false }),
  onMute: (id, muted) => change(id, { muted }),
};

const selector = createSpeakerSelector({ speakers, multiple: true, ...events });

document.body.append(selector.el);
