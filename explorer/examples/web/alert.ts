import { createAlert, createButton } from '@mosaic-home/design-system/web';

const retry = createButton({
  label: 'Retry',
  variant: 'secondary',
  size: 'small',
  onClick: () => {
    retry.setLoading(true);
    setTimeout(() => {
      retry.setLoading(false);
      alert.setMessage('Still no reading. Check that the sensor has power.');
    }, 800);
  },
});

const alert = createAlert({
  tone: 'danger',
  title: 'Hallway sensor offline',
  message: 'No reading for 2 hours.',
  action: retry.el,
  dismissible: true,
});

document.body.append(alert.el);
