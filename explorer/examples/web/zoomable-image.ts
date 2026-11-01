import { createText, createZoomableImage } from '@mosaic-home/design-system/web';

const status = createText('100%', { variant: 'caption', tone: 'muted' });

const image = createZoomableImage({
  src: 'plans/ground-floor.png',
  alt: 'Floor plan of the ground floor',
  controls: true,
  aspect: 16 / 10,
  onChange: (view) => (status.textContent = `${Math.round(view.scale * 100)}%`),
});

document.body.append(image.el, status);
