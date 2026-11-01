import { Button, useToaster } from '@mosaic-home/design-system/react';

export function ToastExample() {
  const toaster = useToaster({ placement: 'bottom' });
  const save = () => {
    toaster.show({
      tone: 'success',
      message: 'Settings saved',
      action: { label: 'Undo', onClick: () => toaster.show('Changes undone') },
    });
  };
  return (
    <Button icon="check" onClick={save}>
      Save settings
    </Button>
  );
}
