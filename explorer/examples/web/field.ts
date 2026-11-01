import { createField, createTextField } from '@mosaic-home/design-system/web';

const name = createTextField({ value: 'Living room' });
const field = createField({
  label: 'Display name',
  control: name.el,
  helper: 'Shown on the dashboard.',
  required: true,
});

// Validate when the user leaves the input; the message is a live region, so the error is announced.
name.input.addEventListener('change', () => {
  field.setError(name.getValue().trim() ? undefined : 'Enter a name.');
});

document.body.append(field.el);
