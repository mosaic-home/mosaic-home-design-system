import { createBadge, createIconButton, h } from '@mosaic-home/design-system/web';

const badge = createBadge({ count: 4, attached: true, ariaLabel: '4 unread' });

const bell = createIconButton({
  icon: 'bell',
  label: 'Notifications',
  filled: true,
  // Opening them marks them read; a count of zero hides the badge.
  onClick: () => badge.setCount(0),
});

// The host pins the badge to the button's top end corner.
document.body.append(h('span', { class: 'mh-badge-host' }, bell.el, badge.el));
