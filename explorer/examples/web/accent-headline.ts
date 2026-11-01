import { createAccentHeadline } from '@mosaic-home/design-system/web';

const partOfDay = (): string => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};

const part = partOfDay();
const headline = createAccentHeadline({ text: `Good ${part}`, accent: part, size: 'display', level: 1 });

setInterval(() => {
  const now = partOfDay();
  headline.setText(`Good ${now}`, now);
}, 60_000);

document.body.append(headline.el);
