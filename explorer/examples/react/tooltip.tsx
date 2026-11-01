import { useState } from 'react';
import { IconButton, Tooltip } from '@mosaic-home/design-system/react';

export function TooltipExample() {
  const [refreshed, setRefreshed] = useState(0);
  const text = refreshed === 0 ? 'Refresh the device list' : `Refreshed ${refreshed} ${refreshed === 1 ? 'time' : 'times'}`;
  return (
    <Tooltip text={text} placement="bottom">
      <IconButton icon="refresh" label="Refresh" onClick={() => setRefreshed((n) => n + 1)} />
    </Tooltip>
  );
}
