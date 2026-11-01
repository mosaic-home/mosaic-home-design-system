import { createInspector, createText } from '@mosaic-home/design-system/web';

const status = createText('', { variant: 'caption', tone: 'muted' });

const inspector = createInspector({
  label: 'Clip properties',
  sections: [
    {
      id: 'transform',
      title: 'Transform',
      params: [
        { id: 'scale', kind: 'slider', label: 'Scale', value: 100, max: 400, unit: '%', keyframe: 'off' },
        { id: 'opacity', kind: 'slider', label: 'Opacity', value: 85, unit: '%', keyframe: 'on' },
      ],
    },
    {
      id: 'look',
      title: 'Look',
      params: [
        {
          id: 'blend',
          kind: 'choice',
          label: 'Blend',
          value: 'normal',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'screen', label: 'Screen' },
          ],
        },
        { id: 'shadow', kind: 'toggle', label: 'Drop shadow', value: true },
      ],
    },
  ],
  // `committed` is false while a slider is being dragged.
  onChange: (id, value, committed) => committed && (status.textContent = `${id}: ${String(value)}`),
  onKeyframe: (id, on) => (status.textContent = `${id}: keyframe ${on ? 'added' : 'removed'}`),
});

document.body.append(inspector.el, status);
