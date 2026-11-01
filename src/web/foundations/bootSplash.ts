import { cx, h } from '../dom.ts';
import { createProgressBar, type ProgressBarHandle } from '../feedback/progress.ts';

export interface BootSplashOptions {
  /** The product name under the mark. */
  name?: string;
  /** What is happening, e.g. "Connecting…"; announced politely when it changes. */
  message?: string;
  /** `undefined`: no bar. `null`: an indeterminate bar. A number: percent done. */
  progress?: number | null;
  /** Accessible name of the progress bar; default "Starting". */
  progressLabel?: string;
  /** Replaces the four-tile mark. */
  mark?: Node;
  /** Fill the parent (position: absolute) rather than the viewport. */
  inline?: boolean;
  /** Runs once `dismiss()` has removed the splash. */
  onDismissed?: () => void;
}

export interface BootSplashHandle {
  el: HTMLDivElement;
  setMessage(message: string): void;
  setProgress(progress: number | null | undefined): void;
  /** Fades the splash out and removes it; resolves when it is gone. */
  dismiss(): Promise<void>;
}

/** How long a dismissal may take before the splash is removed anyway (a missed `transitionend`). */
export const BOOT_SPLASH_EXIT_MS = 700;

export function bootSplashClass(inline = false, leaving = false): string {
  return cx('mh-boot-splash', inline && 'mh-boot-splash--inline', leaving && 'is-leaving');
}

const reducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The four tiles of the product mark, in the theme's first four series colours. */
export function createBootSplashMark(): HTMLSpanElement {
  return h('span', { class: 'mh-boot-splash__mark', 'aria-hidden': 'true' }, ...[0, 1, 2, 3].map(() => h('span', { class: 'mh-boot-splash__tile' })));
}

/**
 * `.mh-boot-splash`: the start screen shown while an app or device boots. The canvas backdrop, the mark (its tiles
 * fly in, then glint one after another), the name, a status message and an optional progress bar. Parts `__content`,
 * `__mark`, `__tile`, `__name`, `__message`, `__progress`; `.is-leaving` while it fades out.
 */
export function createBootSplash(options: BootSplashOptions = {}): BootSplashHandle {
  const mark = options.mark ? h('span', { class: 'mh-boot-splash__mark', 'aria-hidden': 'true' }, options.mark) : createBootSplashMark();
  const message = h('p', { class: 'mh-boot-splash__message', 'aria-live': 'polite' }, options.message ?? '');
  const content = h('div', { class: 'mh-boot-splash__content' }, mark, options.name ? h('p', { class: 'mh-boot-splash__name' }, options.name) : null, message);
  const el = h('div', { class: bootSplashClass(options.inline), 'aria-busy': 'true' }, content);

  let bar: ProgressBarHandle | null = null;
  let barWrap: HTMLElement | null = null;
  const setProgress = (progress: number | null | undefined): void => {
    if (progress === undefined) {
      barWrap?.remove();
      bar = barWrap = null;
      return;
    }
    if (!bar) {
      bar = createProgressBar({ label: options.progressLabel ?? 'Starting', value: progress, size: 'small' });
      barWrap = h('div', { class: 'mh-boot-splash__progress' }, bar.el);
      content.append(barWrap);
    } else bar.setValue(progress);
  };
  setProgress(options.progress);

  let leaving: Promise<void> | null = null;
  return {
    el,
    setMessage(text) {
      message.textContent = text;
    },
    setProgress,
    dismiss() {
      if (leaving) return leaving;
      leaving = new Promise<void>((resolve) => {
        let done = false;
        const finish = (): void => {
          if (done) return;
          done = true;
          el.remove();
          options.onDismissed?.();
          resolve();
        };
        if (!el.isConnected || reducedMotion()) return finish();
        el.classList.add('is-leaving');
        el.removeAttribute('aria-busy');
        el.addEventListener('transitionend', (e) => e.target === el && finish());
        setTimeout(finish, BOOT_SPLASH_EXIT_MS);
      });
      return leaving;
    },
  };
}
