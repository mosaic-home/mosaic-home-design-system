import { createButton, createProgressBar } from '@mosaic-home/design-system/web';

const bar = createProgressBar({ label: 'Firmware update', showLabel: true, showValue: true, value: 0 });

const start = createButton({
  label: 'Update',
  icon: 'download',
  onClick: () => {
    start.setDisabled(true);
    let value = 0;
    const timer = setInterval(() => {
      value += 10;
      bar.setValue(value);
      if (value < 100) return;
      clearInterval(timer);
      start.setDisabled(false);
    }, 400);
  },
});

document.body.append(bar.el, start.el);
