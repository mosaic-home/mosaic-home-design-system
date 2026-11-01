import { createTextArea } from '@mosaic-home/design-system/web';

const announcement = createTextArea({
  label: 'Announcement',
  placeholder: 'What should the speakers say?',
  value: 'Dinner is ready in ten minutes.',
  maxLength: 140,
  showCount: true,
  maxRows: 6,
  onChange: (value) => announcement.setError(value.trim() ? undefined : 'Write a message before sending.'),
});

document.body.append(announcement.el);
