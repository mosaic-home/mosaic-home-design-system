import { useState } from 'react';
import { Button, IconButton, Toolbar, ToolbarSeparator, ToolbarSpacer } from '@mosaic-home/design-system/react';

export function ToolbarExample() {
  const [editing, setEditing] = useState(false);
  return (
    <Toolbar label="Floor plan">
      <IconButton icon="arrow-left" label="Undo" />
      <IconButton icon="arrow-right" label="Redo" />
      <ToolbarSeparator />
      <IconButton icon="add" label="Add device" />
      <IconButton icon="edit" label="Edit room" pressed={editing} onClick={() => setEditing(!editing)} />
      <ToolbarSpacer />
      <Button size="small">Done</Button>
    </Toolbar>
  );
}
