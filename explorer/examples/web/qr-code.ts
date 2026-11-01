import { createQrCode, createTextField } from '@mosaic-home/design-system/web';

const start = 'https://homeassistant.local:8123/';

const code = createQrCode({
  value: start,
  label: 'Link to the dashboard',
  caption: 'Open on your phone',
});

const field = createTextField({
  label: 'Link',
  value: start,
  onInput: (value) => code.setValue(value),
});

document.body.append(field.el, code.el);
