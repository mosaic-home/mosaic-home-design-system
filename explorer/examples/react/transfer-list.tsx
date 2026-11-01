import { useState } from 'react';
import { TransferList } from '@mosaic-home/design-system/react';
import type { TransferItem } from '@mosaic-home/design-system/web';

const cards: TransferItem[] = [
  { value: 'weather', label: 'Weather', icon: 'weather', description: 'Today and tomorrow' },
  { value: 'lights', label: 'Lights', icon: 'lightbulb', description: 'Every room' },
  { value: 'heating', label: 'Heating', icon: 'thermometer' },
  { value: 'music', label: 'Music', icon: 'music', description: 'Now playing' },
  { value: 'cameras', label: 'Cameras', icon: 'camera' },
];

export function TransferListExample() {
  const [shown, setShown] = useState<string[]>(['weather', 'lights']);
  return (
    <TransferList
      label="Dashboard cards"
      sourceLabel="Hidden"
      targetLabel="Shown"
      helper={`${shown.length} of ${cards.length} cards shown.`}
      items={cards}
      values={shown}
      onChange={setShown}
    />
  );
}
