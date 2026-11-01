import { createSecretField } from '@mosaic-home/design-system/web';

const password = createSecretField({
  label: 'New password',
  kind: 'new-password',
  required: true,
  helper: 'At least 12 characters.',
  onInput: (value) => password.setSuccess(value.length >= 12 ? 'Long enough.' : undefined),
});

document.body.append(password.el);
