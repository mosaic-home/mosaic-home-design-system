import { createKbd } from '@mosaic-home/design-system/web';

const shortcuts: { action: string; keys: string | string[]; sequence?: boolean }[] = [
  { action: 'Search', keys: 'Ctrl+K' },
  { action: 'Close a dialog', keys: 'Esc' },
  { action: 'Go home', keys: ['G', 'H'], sequence: true },
];

const list = document.createElement('dl');
for (const { action, keys, sequence } of shortcuts) {
  const term = document.createElement('dt');
  const detail = document.createElement('dd');
  term.textContent = action;
  detail.append(createKbd({ keys, sequence }).el);
  list.append(term, detail);
}

const hint = document.createElement('p');
hint.append('Press ', createKbd({ keys: '/', size: 'small' }).el, ' to search.');

document.body.append(list, hint);
