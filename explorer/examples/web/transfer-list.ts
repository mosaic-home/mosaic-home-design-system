import { createTransferList } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const cards = createTransferList({
  label: 'Dashboard cards',
  sourceLabel: 'Hidden',
  targetLabel: 'Shown',
  items: [
    { value: 'weather', label: 'Weather', icon: 'weather', description: 'Today and tomorrow' },
    { value: 'lights', label: 'Lights', icon: 'lightbulb', description: 'Every room' },
    { value: 'heating', label: 'Heating', icon: 'thermometer' },
    { value: 'music', label: 'Music', icon: 'music', description: 'Now playing' },
    { value: 'cameras', label: 'Cameras', icon: 'camera' },
  ],
  values: ['weather', 'lights'],
  onChange: (values) => (status.textContent = `Shown: ${values.join(', ') || 'none'}`),
});

document.body.append(cards.el, status);
