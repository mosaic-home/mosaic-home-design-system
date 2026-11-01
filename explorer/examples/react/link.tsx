import { useState } from 'react';
import { Link } from '@mosaic-home/design-system/react';

export function LinkExample() {
  const [showAll, setShowAll] = useState(false);
  return (
    <p>
      The hallway sensor reports every five minutes. Read{' '}
      <Link href="https://example.com/sensors" external>
        how sensors report
      </Link>
      .{' '}
      {/* Without an href the link renders a button: an action that looks like a link. */}
      <Link onClick={() => setShowAll(true)}>
        {showAll ? 'All devices shown' : 'Show three more devices'}
      </Link>
    </p>
  );
}
