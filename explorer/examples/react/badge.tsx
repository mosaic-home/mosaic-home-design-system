import { useState } from 'react';
import { Badge, IconButton } from '@mosaic-home/design-system/react';

export function BadgeExample() {
  const [unread, setUnread] = useState(4);
  return (
    // The host pins the badge to the button's top end corner.
    <span className="mh-badge-host">
      {/* Opening them marks them read; a count of zero hides the badge. */}
      <IconButton icon="bell" label="Notifications" filled onClick={() => setUnread(0)} />
      <Badge count={unread} attached ariaLabel={`${unread} unread`} />
    </span>
  );
}
