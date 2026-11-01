import { useEffect, useState } from 'react';
import { HotkeyField } from '@mosaic-home/design-system/react';
import { hotkeyFromEvent, hotkeyToString } from '@mosaic-home/design-system/web';

export function HotkeyFieldExample() {
  const [shortcut, setShortcut] = useState('Ctrl+K');
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const pressed = hotkeyFromEvent(event);
      if (shortcut && pressed && hotkeyToString(pressed) === shortcut) {
        event.preventDefault();
        setOpened((n) => n + 1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  return (
    <HotkeyField
      label="Open search"
      helper={opened ? `Search opened ${opened} times.` : 'Press the field, then a key combination.'}
      value={shortcut}
      onChange={setShortcut}
    />
  );
}
