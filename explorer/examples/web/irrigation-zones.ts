import { createIrrigationZones, type IrrigationRun, type IrrigationZone } from '@mosaic-home/design-system/web';

// Durations are in minutes.
const zones: IrrigationZone[] = [
  { id: 'lawn', name: 'Front lawn', duration: 20 },
  { id: 'beds', name: 'Flower beds', duration: 10 },
  { id: 'veg', name: 'Vegetable patch', duration: 15 },
];

let running: IrrigationRun | null = null;

const garden = createIrrigationZones({
  name: 'Garden watering',
  zones,
  nextRun: 'Tomorrow 06:00',
  rainNote: '6 mm of rain expected tonight',
  onRun: (id) => {
    running = { zone: id, remaining: zones.find((z) => z.id === id)!.duration * 60 };
    garden.update({ running });
  },
  onStop: () => garden.update({ running: (running = null) }),
  onRainSkip: (rainSkip) => garden.update({ rainSkip }),
});

setInterval(() => {
  if (!running) return;
  running = running.remaining > 1 ? { ...running, remaining: running.remaining - 1 } : null;
  garden.update({ running });
}, 1000);

document.body.append(garden.el);
