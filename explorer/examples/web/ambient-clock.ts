import { createAmbientClock } from '@mosaic-home/design-system/web';

const atNight = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

// Without a `time`, the clock keeps its own.
const clock = createAmbientClock({
  night: atNight(),
  nextEvent: { title: 'Bins out', when: '19:30' },
  weather: { condition: 'partly-cloudy', temperature: 14 },
});

setInterval(() => clock.update({ night: atNight() }), 60_000);

document.body.append(clock.el);
