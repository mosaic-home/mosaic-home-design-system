import { useState } from 'react';
import { SearchField } from '@mosaic-home/design-system/react';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Study', 'Hallway'];

export function SearchFieldExample() {
  const [query, setQuery] = useState('');
  const matches = rooms.filter((room) => room.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <SearchField placeholder="Search rooms" value={query} onValueChange={setQuery} />
      <ul>
        {matches.map((room) => (
          <li key={room}>{room}</li>
        ))}
      </ul>
    </>
  );
}
