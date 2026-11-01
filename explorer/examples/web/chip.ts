import { createChipGroup } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const filter = createChipGroup({
  label: 'Show devices',
  values: ['lights'],
  chips: [
    { value: 'lights', label: 'Lights', icon: 'lightbulb' },
    { value: 'climate', label: 'Climate', icon: 'thermometer' },
    { value: 'media', label: 'Media', icon: 'music' },
    { value: 'fans', label: 'Fans', icon: 'fan' },
  ],
  onChange: (values) => (status.textContent = `Filters: ${values.join(', ') || 'none'}`),
});

document.body.append(filter.el, status);
