import { useState } from 'react';
import { Pagination } from '@mosaic-home/design-system/react';

export function PaginationExample() {
  const [page, setPage] = useState(1);
  return (
    <div>
      <p>
        Showing events {(page - 1) * 20 + 1} to {page * 20}
      </p>
      <Pagination label="Event log pages" count={12} page={page} onChange={setPage} />
    </div>
  );
}
