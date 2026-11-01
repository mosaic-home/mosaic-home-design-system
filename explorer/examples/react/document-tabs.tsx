import { useState } from 'react';
import { DocumentTabs } from '@mosaic-home/design-system/react';
import type { DocumentTab } from '@mosaic-home/design-system/web';

export function DocumentTabsExample() {
  const [files, setFiles] = useState<DocumentTab[]>([
    { id: 'evening', label: 'Evening.yaml', dirty: true },
    { id: 'morning', label: 'Morning.yaml' },
    { id: 'away', label: 'Away.yaml' },
  ]);
  const [open, setOpen] = useState('evening');

  const close = (id: string, next: string) => {
    setFiles((all) => all.filter((f) => f.id !== id));
    if (id === open) setOpen(next);
  };
  const add = () => {
    const id = `new-${Date.now()}`;
    setFiles((all) => [...all, { id, label: 'Untitled.yaml' }]);
    setOpen(id);
  };

  return <DocumentTabs label="Open scenes" tabs={files} value={open} onChange={setOpen} onClose={close} onAdd={add} />;
}
