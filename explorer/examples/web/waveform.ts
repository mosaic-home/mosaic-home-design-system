import { createButton, createWaveform } from '@mosaic-home/design-system/web';

const duration = 24;
// Loudness per bucket, 0 to 1; `waveformPeaks` makes these from decoded samples.
const peaks = Array.from({ length: 64 }, (_, i) => 0.15 + 0.8 * Math.abs(Math.sin(i / 2.3)));

let position = 0;
let timer: number | undefined;

const voice = createWaveform({
  peaks,
  label: 'Voice message',
  duration,
  position,
  onSeek: (time) => (position = time),
});

const play = createButton({
  label: 'Play',
  icon: 'play',
  size: 'small',
  onClick: () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    } else {
      timer = window.setInterval(() => {
        position = position + 0.25 >= duration ? 0 : position + 0.25;
        voice.setPosition(position);
      }, 250);
    }
    play.setLabel(timer === undefined ? 'Play' : 'Pause');
  },
});

document.body.append(play.el, voice.el);
