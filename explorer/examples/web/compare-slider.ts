import { createCompareSlider, createText } from '@mosaic-home/design-system/web';

const status = createText('Showing 45% of the evening scene', { variant: 'caption', tone: 'muted' });

const compare = createCompareSlider({
  label: 'Compare the lighting scene',
  before: { src: 'photos/living-room-off.jpg', alt: 'Living room with the lights off' },
  after: { src: 'photos/living-room-evening.jpg', alt: 'Living room with the evening scene on' },
  beforeLabel: 'Off',
  afterLabel: 'Evening',
  value: 45,
  onChange: (value) => (status.textContent = `Showing ${Math.round(value)}% of the evening scene`),
});

document.body.append(compare.el, status);
