import { createTransport } from '@mosaic-home/design-system/web';

const duration = 222;
let position = 41;
let timer: ReturnType<typeof setInterval> | undefined;

const transport = createTransport({
  label: 'Playback',
  duration,
  position,
  loop: false,
  onPlayingChange: (playing) => {
    clearInterval(timer);
    if (!playing) return;
    timer = setInterval(() => {
      position = position >= duration ? 0 : position + 1;
      transport.setPosition(position);
    }, 1000);
  },
  onSeek: (t) => (position = t),
});

document.body.append(transport.el);
