import { createZoomControl } from '@mosaic-home/design-system/web';

const zoom = createZoomControl({
  value: 1,
  min: 0.25,
  max: 8,
  onChange: () => zoom.setFitted(false),
  onFit: () => {
    // The level that fits the picture in its frame, worked out by the app.
    zoom.setValue(0.63);
    zoom.setFitted(true);
  },
});

document.body.append(zoom.el);
