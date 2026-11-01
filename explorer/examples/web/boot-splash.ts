import { createBootSplash } from '@mosaic-home/design-system/web';

const splash = createBootSplash({ name: 'Mosaic Home', message: 'Starting…', progress: null });
document.body.append(splash.el);

const steps = ['Connecting…', 'Loading rooms…', 'Almost ready…'];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function boot(): Promise<void> {
  for (const [i, step] of steps.entries()) {
    await wait(900);
    splash.setMessage(step);
    splash.setProgress(((i + 1) / steps.length) * 100);
  }
  await splash.dismiss();
  document.body.append('Welcome home');
}

void boot();
