import { useState } from 'react';
import { Accordion, Text } from '@mosaic-home/design-system/react';

export function AccordionExample() {
  const [open, setOpen] = useState<string[]>(['lights']);
  return (
    <Accordion
      mode="single"
      open={open}
      onChange={setOpen}
      sections={[
        {
          id: 'lights',
          title: 'Lights',
          subtitle: '3 of 7 on',
          icon: 'lightbulb',
          content: <Text tone="muted">Lights turn off when a room has been empty for 15 minutes.</Text>,
        },
        {
          id: 'climate',
          title: 'Climate',
          subtitle: 'Heating to 21°',
          icon: 'thermometer',
          content: <Text tone="muted">The target drops by 2° overnight.</Text>,
        },
      ]}
    />
  );
}
