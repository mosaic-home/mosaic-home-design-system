import { createVoiceBar } from '@mosaic-home/design-system/web';

// Stands in for the microphone's input level (0–1).
const levels = setInterval(() => bar.setLevel(Math.random()), 90);

const bar = createVoiceBar({
  variant: 'dictation',
  onCancel: () => {
    clearInterval(levels);
    bar.setPhase('idle');
  },
  onDone: () => {
    clearInterval(levels);
    bar.setPhase('transcribing');
    bar.setBusy(true);
    setTimeout(() => {
      bar.setBusy(false);
      bar.setPhase('idle');
      bar.setLabel('Added: "Buy more coffee filters"');
    }, 1500);
  },
});

document.body.append(bar.el);
