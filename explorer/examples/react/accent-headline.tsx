import { useEffect, useState } from 'react';
import { AccentHeadline } from '@mosaic-home/design-system/react';

const partOfDay = (): string => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};

export function AccentHeadlineExample() {
  const [part, setPart] = useState(partOfDay);
  useEffect(() => {
    const timer = setInterval(() => setPart(partOfDay()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return <AccentHeadline text={`Good ${part}`} accent={part} size="display" level={1} />;
}
