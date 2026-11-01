import { createButton } from '@mosaic-home/design-system/web';

const button = createButton({
  label: 'Turn on',
  icon: 'power',
  variant: 'primary',
  onClick: () => {
    button.setLoading(true);
    setTimeout(() => button.setLoading(false), 800);
  },
});

document.body.append(button.el);
