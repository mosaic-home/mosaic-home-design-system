import { useState } from 'react';
import { BarChart, Button } from '@mosaic-home/design-system/react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeks = {
  this: [6.2, 5.8, 7.4, 4.9, 6.6, 8.1, 7.2],
  last: [5.9, 6.4, 6.1, 5.2, 7.0, 7.7, 6.8],
};

export function BarChartExample() {
  const [week, setWeek] = useState<keyof typeof weeks>('this');
  return (
    <>
      <BarChart
        bars={weeks[week].map((value, i) => ({ label: days[i]!, value }))}
        label={`Energy used per day ${week} week`}
        showValues
        highlight={week === 'this' ? 6 : undefined}
        format={(v) => `${v.toFixed(1)} kWh`}
      />
      <Button variant="secondary" size="small" onClick={() => setWeek(week === 'this' ? 'last' : 'this')}>
        {week === 'this' ? 'Show last week' : 'Show this week'}
      </Button>
    </>
  );
}
