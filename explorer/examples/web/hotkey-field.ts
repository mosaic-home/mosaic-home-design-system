import { createHotkeyField, hotkeyFromEvent, hotkeyToString } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const shortcut = createHotkeyField({
  label: 'Open search',
  value: 'Ctrl+K',
  helper: 'Press the field, then a key combination.',
  onChange: (value) => (status.textContent = value ? `Search opens with ${value}.` : 'No shortcut.'),
});

document.addEventListener('keydown', (event) => {
  if (shortcut.isRecording()) return;
  const pressed = hotkeyFromEvent(event);
  if (pressed && hotkeyToString(pressed) === shortcut.getValue()) {
    event.preventDefault();
    status.textContent = 'Search opened.';
  }
});

document.body.append(shortcut.el, status);
