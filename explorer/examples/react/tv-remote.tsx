import { useState } from 'react';
import { mdiGamepadVariant, mdiHdmiPort, mdiTelevisionPlay } from '@mdi/js';
import { TvRemote } from '@mosaic-home/design-system/react';
import type { TvRemoteKey } from '@mosaic-home/design-system/web';

const sources = [
  { id: 'hdmi1', label: 'HDMI 1', icon: mdiHdmiPort },
  { id: 'console', label: 'Console', icon: mdiGamepadVariant },
  { id: 'films', label: 'Film Hall', icon: mdiTelevisionPlay },
];

const send = (command: string): void => void fetch('/tv/command', { method: 'POST', body: command });

export function TvRemoteExample() {
  const [source, setSource] = useState('films');
  const [muted, setMuted] = useState(false);
  const pressKey = (key: TvRemoteKey) => {
    send(key);
    if (key === 'mute') setMuted((m) => !m);
  };
  const pickSource = (id: string) => {
    send(`source:${id}`);
    setSource(id);
  };
  return (
    <TvRemote
      label="Living room TV"
      sources={sources.map((s) => ({ ...s, active: s.id === source }))}
      muted={muted}
      onKey={pressKey}
      onSource={pickSource}
    />
  );
}
