import { createAccordion, createText } from '@mosaic-home/design-system/web';

const status = createText('Open: lights', { variant: 'caption', tone: 'muted' });

const accordion = createAccordion({
  mode: 'single',
  open: ['lights'],
  sections: [
    {
      id: 'lights',
      title: 'Lights',
      subtitle: '3 of 7 on',
      icon: 'lightbulb',
      content: createText('Lights turn off when a room has been empty for 15 minutes.', { tone: 'muted' }),
    },
    {
      id: 'climate',
      title: 'Climate',
      subtitle: 'Heating to 21°',
      icon: 'thermometer',
      content: createText('The target drops by 2° overnight.', { tone: 'muted' }),
    },
  ],
  onChange: (open) => (status.textContent = open.length ? `Open: ${open.join(', ')}` : 'All closed'),
});

document.body.append(accordion.el, status);
