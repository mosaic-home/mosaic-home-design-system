import { useState } from 'react';
import { Button, confirm } from '@mosaic-home/design-system/react';

export function ConfirmExample() {
  const [result, setResult] = useState('');
  const remove = async () => {
    const ok = await confirm({
      title: 'Delete "Evening"?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    setResult(ok ? 'Scene deleted' : 'Kept the scene');
  };
  return (
    <>
      <Button icon="delete" variant="danger" onClick={remove}>
        Delete scene
      </Button>
      <p aria-live="polite">{result}</p>
    </>
  );
}
