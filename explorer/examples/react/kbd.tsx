import { Kbd } from '@mosaic-home/design-system/react';

const shortcuts: { action: string; keys: string | string[]; sequence?: boolean }[] = [
  { action: 'Search', keys: 'Ctrl+K' },
  { action: 'Close a dialog', keys: 'Esc' },
  { action: 'Go home', keys: ['G', 'H'], sequence: true },
];

export function KbdExample() {
  return (
    <>
      <dl>
        {shortcuts.map(({ action, keys, sequence }) => (
          <div key={action}>
            <dt>{action}</dt>
            <dd>
              <Kbd keys={keys} sequence={sequence} />
            </dd>
          </div>
        ))}
      </dl>
      <p>
        Press <Kbd keys="/" size="small" /> to search.
      </p>
    </>
  );
}
