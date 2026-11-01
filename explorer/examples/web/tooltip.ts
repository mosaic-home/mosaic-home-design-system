import { createIconButton, createTooltip } from '@mosaic-home/design-system/web';

let refreshed = 0;

const refresh = createIconButton({
  icon: 'refresh',
  label: 'Refresh',
  onClick: () => {
    refreshed += 1;
    tooltip.setText(`Refreshed ${refreshed} ${refreshed === 1 ? 'time' : 'times'}`);
  },
});

const tooltip = createTooltip(refresh.el, { text: 'Refresh the device list', placement: 'bottom' });

document.body.append(refresh.el);
