import { useState } from 'react';
import { PeopleStrip } from '@mosaic-home/design-system/react';
import type { PersonEntry } from '@mosaic-home/design-system/web';

const PEOPLE: PersonEntry[] = [
  { id: 'robin', name: 'Robin Vale', where: 'home', since: '2 h' },
  { id: 'kit', name: 'Kit Harrow', where: 'zone', zone: 'Studio', since: '25 min' },
  { id: 'ash', name: 'Ash Merrow', where: 'away', since: '3 h' },
];

export function PeopleStripExample() {
  const [selected, setSelected] = useState<string | null>(null);
  const person = PEOPLE.find((p) => p.id === selected);
  return (
    <>
      <PeopleStrip people={PEOPLE} onSelect={setSelected} />
      {person && <p>Selected {person.name}</p>}
    </>
  );
}
