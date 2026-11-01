import { createMediaPlayer, type MediaPlayerData } from '@mosaic-home/design-system/web';

let data: MediaPlayerData = {
  title: 'Lanterns Over the Quay',
  subtitle: 'Marlow and the Tidelines',
  art: '/covers/lanterns-over-the-quay.jpg',
  state: 'playing',
  position: 83,
  duration: 227,
  volume: 0.45,
  can: { play: true, pause: true, next: true, previous: true, volume: true, seek: true },
};

const set = (changes: Partial<MediaPlayerData>) => {
  data = { ...data, ...changes };
  player.update({ ...data, ...events });
};

const events = {
  onPlay: () => set({ state: 'playing' }),
  onPause: () => set({ state: 'paused' }),
  onNext: () => set({ position: 0 }),
  onPrevious: () => set({ position: 0 }),
  onSeek: (position: number) => set({ position }),
  onVolume: (volume: number) => set({ volume }),
};

const player = createMediaPlayer({ ...data, ...events });

document.body.append(player.el);
