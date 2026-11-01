import { createHistogram, histogramFromPixels } from '@mosaic-home/design-system/web';

const image = new Image();
image.src = 'snapshot.jpg';

const histogram = createHistogram({ data: {}, label: 'Snapshot histogram', mode: 'rgb' });

// Count the image's pixels once it has loaded.
image.addEventListener('load', () => {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  histogram.update({ data: histogramFromPixels(pixels, 64), label: 'Snapshot histogram', mode: 'rgb' });
});

document.body.append(histogram.el);
