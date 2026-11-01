import { createAgenda, type AgendaDay } from '@mosaic-home/design-system/web';

const days: AgendaDay[] = [
  {
    label: 'Today',
    events: [
      { time: null, title: 'Bin day', color: 4 },
      { time: '08:30', end: '09:00', title: 'School run', color: 2 },
      { time: '12:15', end: '13:00', title: 'Lunch with Robin', location: 'Bramblewick Café', color: 1 },
    ],
  },
  {
    label: 'Thu 17 Oct',
    events: [{ time: '10:00', end: '11:30', title: 'Boiler service', location: 'Home' }],
  },
];

// Shows the first five events and sums up the rest.
const agenda = createAgenda({ days, max: 5 });

document.body.append(agenda.el);
