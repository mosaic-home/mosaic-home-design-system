import { Fragment, createElement, useEffect, useRef, type HTMLAttributes, type ReactNode, type TransitionEvent } from 'react';
import { iconPath, type IconName } from '../web/icons.ts';
import { textClass, type TextTone, type TextVariant } from '../web/foundations/text.ts';
import { accentHeadlineClass, splitAccent, type AccentHeadlineLevel, type AccentHeadlineSize, type AccentHeadlineTone } from '../web/foundations/accentHeadline.ts';
import { kbdClass, kbdSeparator, keyCap, parseKeys, type KbdSize } from '../web/foundations/kbd.ts';
import { backdropClass } from '../web/foundations/backdrop.ts';
import { BOOT_SPLASH_EXIT_MS, bootSplashClass } from '../web/foundations/bootSplash.ts';
import { progressAria, progressBarClass, progressPercent } from '../web/feedback/progress.ts';
import { cx } from '../web/dom.ts';

export interface IconProps {
  icon: IconName | string;
  size?: number;
  /** Accessible label; without one the icon is decorative. */
  label?: string;
  className?: string;
}

export function Icon({ icon, size, label, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx('mh-icon', className)}
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={iconPath(icon)} fill="currentColor" />
    </svg>
  );
}

const DEFAULT_TAG: Partial<Record<TextVariant, string>> = { display: 'h1', headline: 'h2', title: 'h3', eyebrow: 'span', mono: 'code' };

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  tone?: TextTone;
  as?: string;
  children?: ReactNode;
}

export function Text({ variant = 'body', tone, as, className, children, ...rest }: TextProps) {
  return createElement(as ?? DEFAULT_TAG[variant] ?? 'p', { ...rest, className: cx(textClass(variant, tone), className) }, children);
}

export interface DividerProps {
  vertical?: boolean;
  label?: ReactNode;
}

export function Divider({ vertical, label }: DividerProps) {
  if (label) {
    return (
      <div className="mh-divider mh-divider--labelled" role="separator">
        {label}
      </div>
    );
  }
  return <hr className={cx('mh-divider', vertical && 'mh-divider--vertical')} aria-orientation={vertical ? 'vertical' : undefined} />;
}

export interface AccentHeadlineProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
  /** The whole headline. */
  text: string;
  /** A phrase inside `text` set in serif italic (appended when absent). */
  accent?: string;
  size?: AccentHeadlineSize;
  level?: AccentHeadlineLevel;
  tone?: AccentHeadlineTone;
}

/** Same DOM and classes as `createAccentHeadline`. */
export function AccentHeadline({ text, accent, size, level = 2, tone, className, ...rest }: AccentHeadlineProps) {
  const [before, phrase, after] = splitAccent(text, accent);
  return createElement(
    `h${level}`,
    { ...rest, className: cx(accentHeadlineClass(size, tone), className) },
    before || null,
    phrase ? <em key="accent" className="mh-accent-headline__accent">{phrase}</em> : null,
    after || null,
  );
}

export interface KbdProps {
  /** One key, a chord string (`'Ctrl+K'`) or a list of keys. */
  keys: string | readonly string[];
  sequence?: boolean;
  thenLabel?: string;
  size?: KbdSize;
  className?: string;
}

/** Same DOM and classes as `createKbd`. */
export function Kbd({ keys, sequence, thenLabel, size, className }: KbdProps) {
  return (
    <kbd className={cx(kbdClass(size, sequence), className)}>
      {parseKeys(keys).map((key, i) => {
        const cap = keyCap(key);
        return (
          <Fragment key={i}>
            {i > 0 && <span className="mh-kbd__sep">{kbdSeparator(sequence, thenLabel)}</span>}
            {cap.spoken ? (
              <kbd className="mh-kbd__key" title={cap.spoken}>
                <span aria-hidden="true">{cap.text}</span>
                <span className="mh-visually-hidden">{cap.spoken}</span>
              </kbd>
            ) : (
              <kbd className="mh-kbd__key">{cap.text}</kbd>
            )}
          </Fragment>
        );
      })}
    </kbd>
  );
}

export interface BackdropProps {
  fixed?: boolean;
  drift?: boolean;
  dim?: boolean;
  className?: string;
}

/** Same DOM and classes as `createBackdrop`. Put it first inside a `.mh-backdrop-host`, or make it `fixed`. */
export function Backdrop({ fixed, drift, dim, className }: BackdropProps) {
  return <div className={cx(backdropClass({ fixed, drift, dim }), className)} aria-hidden="true" />;
}

export interface BootSplashProps {
  name?: ReactNode;
  message?: ReactNode;
  /** `undefined`: no bar. `null`: indeterminate. A number: percent done. */
  progress?: number | null;
  progressLabel?: string;
  /** Replaces the four-tile mark. */
  mark?: ReactNode;
  inline?: boolean;
  /** Fade out; `onLeft` runs when the fade has finished, and the parent then unmounts the splash. */
  leaving?: boolean;
  onLeft?: () => void;
  className?: string;
}

/** Same DOM and classes as `createBootSplash`. */
export function BootSplash({ name, message, progress, progressLabel = 'Starting', mark, inline, leaving = false, onLeft, className }: BootSplashProps) {
  const pct = progress === undefined ? null : progressPercent(progress);
  const left = useRef(false);
  const onLeftRef = useRef(onLeft);
  onLeftRef.current = onLeft;
  const finish = (): void => {
    if (left.current) return;
    left.current = true;
    onLeftRef.current?.();
  };
  useEffect(() => {
    if (!leaving) {
      left.current = false;
      return;
    }
    // Fallback for a missed transitionend (reduced motion, hidden tab).
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(finish, reduced ? 0 : BOOT_SPLASH_EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);
  return (
    <div
      className={cx(bootSplashClass(inline, leaving), className)}
      aria-busy={leaving ? undefined : 'true'}
      onTransitionEnd={(e: TransitionEvent<HTMLDivElement>) => {
        if (leaving && e.target === e.currentTarget) finish();
      }}
    >
      <div className="mh-boot-splash__content">
        <span className="mh-boot-splash__mark" aria-hidden="true">
          {mark ?? [0, 1, 2, 3].map((i) => <span key={i} className="mh-boot-splash__tile" />)}
        </span>
        {name && <p className="mh-boot-splash__name">{name}</p>}
        <p className="mh-boot-splash__message" aria-live="polite">
          {message}
        </p>
        {progress !== undefined && (
          <div className="mh-boot-splash__progress">
            <div className={progressBarClass('accent', 'small', pct === null)} {...progressAria(progress, 100, progressLabel)}>
              <div className="mh-progress__track">
                <div className="mh-progress__fill" style={pct === null ? undefined : { width: `${pct}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
