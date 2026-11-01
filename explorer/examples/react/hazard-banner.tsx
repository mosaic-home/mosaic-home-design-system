import { useState } from 'react';
import { HazardBanner } from '@mosaic-home/design-system/react';
import type { HazardSeverity } from '@mosaic-home/design-system/web';

export function HazardBannerExample() {
  const [severity, setSeverity] = useState<HazardSeverity>('alarm');
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  const cleared = severity === 'cleared';
  return (
    <HazardBanner
      kind="leak"
      severity={severity}
      where="Utility room, under the sink"
      since="10:42"
      advice={cleared ? undefined : ['Turn off the water at the main valve', 'Move anything that could get wet']}
      actions={cleared ? [] : [{ id: 'valve', label: 'Shut off water', primary: true }]}
      onSilence={severity === 'alarm' ? () => setSeverity('warning') : undefined}
      onAction={() => setSeverity('cleared')}
      onDismiss={cleared ? () => setShown(false) : undefined}
    />
  );
}
