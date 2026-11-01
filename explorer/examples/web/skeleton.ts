import { createSkeleton, h } from '@mosaic-home/design-system/web';

const card = h('div', { 'aria-live': 'polite' }, createSkeleton({ lines: 3, label: 'Loading the forecast' }).el);

// Swap the placeholder for the content once it has loaded.
setTimeout(() => {
  card.replaceChildren(
    h('h3', {}, 'Tomorrow'),
    h('p', {}, 'Light rain in the morning, clearing by noon.'),
    h('p', {}, 'High of 17°, low of 9°.'),
  );
}, 1500);

document.body.append(card);
