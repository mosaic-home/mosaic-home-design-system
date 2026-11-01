// foundations group: web components.
export { createDivider, createText, textClass, type DividerOptions, type TextOptions, type TextTone, type TextVariant } from './text.ts';
export {
  accentHeadlineClass,
  createAccentHeadline,
  splitAccent,
  type AccentHeadlineHandle,
  type AccentHeadlineLevel,
  type AccentHeadlineOptions,
  type AccentHeadlineSize,
  type AccentHeadlineTone,
} from './accentHeadline.ts';
export { createKbd, kbdClass, kbdSeparator, keyCap, parseKeys, type KbdHandle, type KbdOptions, type KbdSize, type KeyCap } from './kbd.ts';
export { backdropClass, createBackdrop, type BackdropHandle, type BackdropOptions } from './backdrop.ts';
export { BOOT_SPLASH_EXIT_MS, bootSplashClass, createBootSplash, createBootSplashMark, type BootSplashHandle, type BootSplashOptions } from './bootSplash.ts';
