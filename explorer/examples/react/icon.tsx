import { mdiSofaOutline } from '@mdi/js';
import { Icon } from '@mosaic-home/design-system/react';

export function IconExample() {
  return (
    <p>
      {/* Any Material Design Icons path works where there is no short name. */}
      <Icon icon={mdiSofaOutline} size={24} /> Living room{' '}
      <Icon icon="lightbulb-on" size={20} label="Lights on" />
    </p>
  );
}
