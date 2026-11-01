import { createButton, createToaster } from '@mosaic-home/design-system/web';

const toaster = createToaster({ placement: 'bottom' });

const save = createButton({
  label: 'Save settings',
  icon: 'check',
  onClick: () => {
    toaster.show({
      tone: 'success',
      message: 'Settings saved',
      action: { label: 'Undo', onClick: () => toaster.show('Changes undone') },
    });
  },
});

document.body.append(save.el);
