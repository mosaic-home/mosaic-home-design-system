import { createFileDropZone, formatFileSize } from '@mosaic-home/design-system/web';

const status = document.createElement('p');

// Files that are too big, of the wrong type or too many are refused with a message in the zone.
const plans = createFileDropZone({
  title: 'Drop floor plans here',
  hint: 'PNG, JPG or WebP, up to 5 MB each, up to 4 files',
  accept: 'image/png,image/jpeg,image/webp',
  maxSize: 5_000_000,
  maxFiles: 4,
  onChange: (files) => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    status.textContent = files.length ? `${files.length} ready to upload, ${formatFileSize(total)}.` : '';
  },
});

document.body.append(plans.el, status);
