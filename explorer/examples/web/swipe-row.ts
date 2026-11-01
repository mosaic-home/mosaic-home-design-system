import { createStack, createSwipeRow, createText } from '@mosaic-home/design-system/web';

const status = createText('Swipe the row, or use its actions button.', { variant: 'caption', tone: 'muted' });

const row = createSwipeRow({
  label: 'Kitchen light',
  content: createStack(
    { gap: 'none' },
    createText('Kitchen light', { variant: 'label' }),
    createText('On, 80%', { variant: 'caption', tone: 'muted' }),
  ).el,
  start: [{ id: 'favourite', label: 'Favourite', icon: 'star', tone: 'accent' }],
  end: [
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' },
  ],
  onAction: (id) => {
    status.textContent = `${id} on Kitchen light`;
    row.close();
  },
});

document.body.append(row.el, status);
