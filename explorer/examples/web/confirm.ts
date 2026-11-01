import { confirm, createButton, h } from '@mosaic-home/design-system/web';

const result = h('p', { 'aria-live': 'polite' });

const remove = createButton({
  label: 'Delete scene',
  icon: 'delete',
  variant: 'danger',
  onClick: async () => {
    const ok = await confirm({
      title: 'Delete "Evening"?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    result.textContent = ok ? 'Scene deleted' : 'Kept the scene';
  },
});

document.body.append(remove.el, result);
