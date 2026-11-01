import { createHazardBanner } from '@mosaic-home/design-system/web';

const banner = createHazardBanner({
  kind: 'leak',
  where: 'Utility room, under the sink',
  since: '10:42',
  advice: ['Turn off the water at the main valve', 'Move anything that could get wet'],
  actions: [{ id: 'valve', label: 'Shut off water', primary: true }],
  onSilence: () => banner.update({ severity: 'warning', onSilence: undefined }),
  onAction: () =>
    banner.update({
      severity: 'cleared',
      advice: undefined,
      actions: [],
      onSilence: undefined,
      onDismiss: () => banner.el.remove(),
    }),
});

document.body.append(banner.el);
