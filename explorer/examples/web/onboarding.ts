import { createOnboarding, createSwitch, createText } from '@mosaic-home/design-system/web';

const status = createText('', { variant: 'caption', tone: 'muted' });
const notifications = createSwitch({ label: 'Allow notifications', row: true, checked: true });

const intro = createOnboarding({
  steps: [
    { title: 'Welcome home', text: 'Every room, light and sensor on one screen.', icon: 'home' },
    { title: 'Group by room', text: 'Rooms keep the dashboard short. Reorder them any time.', icon: 'lightbulb' },
    { title: 'Stay in the loop', text: 'Get a gentle chime when a door is left open.', icon: 'bell', content: notifications.el },
  ],
  onStepChange: (index) => (status.textContent = `Step ${index + 1}`),
  onDone: () => (status.textContent = `Done, notifications ${notifications.isChecked() ? 'on' : 'off'}`),
  onSkip: () => (status.textContent = 'Skipped'),
});

document.body.append(intro.el, status);
