import { createChargeCard, type ChargeCardOptions } from '@mosaic-home/design-system/web';

const car: ChargeCardOptions = {
  name: 'Car',
  level: 46,
  limit: 80,
  state: 'charging',
  rate: 7400,
  minutesLeft: 95,
  detail: 'Range 180 km',
};

const card = createChargeCard(car);

// A new reading replaces everything shown; the ring moves to the new level.
setTimeout(() => card.update({ ...car, level: 52, minutesLeft: 78, detail: 'Range 203 km' }), 3000);

document.body.append(card.el);
