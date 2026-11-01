import { createDocumentTabs, type DocumentTab } from '@mosaic-home/design-system/web';

let files: DocumentTab[] = [
  { id: 'evening', label: 'Evening.yaml', dirty: true },
  { id: 'morning', label: 'Morning.yaml' },
  { id: 'away', label: 'Away.yaml' },
];
let created = 0;

const editor = createDocumentTabs({
  label: 'Open scenes',
  tabs: files,
  value: 'evening',
  onClose: (id) => {
    const file = files.find((f) => f.id === id);
    // Returning false keeps the tab open.
    if (file?.dirty && !confirm(`Close ${file.label} without saving?`)) return false;
    files = files.filter((f) => f.id !== id);
    return true;
  },
  onAdd: () => {
    created += 1;
    const id = `new-${created}`;
    files = [...files, { id, label: `Untitled ${created}.yaml` }];
    editor.setTabs(files);
    editor.setValue(id);
  },
});

document.body.append(editor.el);
