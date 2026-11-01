import { createPagination } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const pagination = createPagination({
  label: 'Event log pages',
  count: 12,
  page: 1,
  onChange: (page) => (status.textContent = `Showing events ${(page - 1) * 20 + 1} to ${page * 20}`),
});

document.body.append(status, pagination.el);
