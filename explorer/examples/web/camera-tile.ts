import { createCameraTile, createIconButton } from '@mosaic-home/design-system/web';

const refresh = createIconButton({
  icon: 'refresh',
  label: 'Refresh Front door',
  size: 'small',
  onClick: () => camera.refresh(),
});

const camera = createCameraTile({
  src: '/snapshots/front-door.jpg',
  name: 'Front door',
  status: 'Motion · 2 min ago',
  // Reloads the picture every 10 seconds while it is on screen.
  refreshEvery: 10,
  action: refresh.el,
});

document.body.append(camera.el);
