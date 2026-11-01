import { createStatus } from '@mosaic-home/design-system/web';

// `announce` reads changes out to screen readers.
const status = createStatus({ state: navigator.onLine ? 'online' : 'offline', announce: true });

window.addEventListener('online', () => status.setState('online'));
window.addEventListener('offline', () => status.setState('offline'));

document.body.append(status.el);
