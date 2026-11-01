import { mdiGamepadVariant, mdiHdmiPort, mdiTelevisionPlay } from '@mdi/js';
import { createTvRemote, type TvRemoteOptions, type TvRemoteSource } from '@mosaic-home/design-system/web';

let sources: TvRemoteSource[] = [
  { id: 'hdmi1', label: 'HDMI 1', icon: mdiHdmiPort },
  { id: 'console', label: 'Console', icon: mdiGamepadVariant },
  { id: 'films', label: 'Film Hall', icon: mdiTelevisionPlay, active: true },
];
let muted = false;

const send = (command: string): void => void fetch('/tv/command', { method: 'POST', body: command });

const options = (): TvRemoteOptions => ({
  label: 'Living room TV',
  sources,
  muted,
  onKey: (key) => {
    send(key);
    if (key === 'mute') {
      muted = !muted;
      remote.update(options());
    }
  },
  onSource: (id) => {
    send(`source:${id}`);
    sources = sources.map((s) => ({ ...s, active: s.id === id }));
    remote.update(options());
  },
});

const remote = createTvRemote(options());

document.body.append(remote.el);
