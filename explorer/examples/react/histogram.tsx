import { useState, type SyntheticEvent } from 'react';
import { Histogram } from '@mosaic-home/design-system/react';
import { histogramFromPixels, type HistogramData } from '@mosaic-home/design-system/web';

export function HistogramExample() {
  const [data, setData] = useState<HistogramData>({});
  // Count the image's pixels once it has loaded.
  const measure = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, 0, 0);
    setData(histogramFromPixels(context.getImageData(0, 0, canvas.width, canvas.height).data, 64));
  };
  return (
    <>
      <img src="snapshot.jpg" alt="Garden snapshot" width={320} onLoad={measure} />
      <Histogram data={data} label="Snapshot histogram" mode="rgb" />
    </>
  );
}
