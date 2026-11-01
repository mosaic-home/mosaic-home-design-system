import { useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import {
  buttonGroupAria,
  buttonGroupClass,
  buttonGroupItemClass,
  buttonGroupKeyTarget,
  buttonGroupTabStop,
  type ButtonGroupItem,
  type ButtonGroupOrientation,
  type ButtonGroupVariant,
} from '../web/actions/buttonGroup.ts';
import { favouriteIcon, favouriteToggleClass, type FavouriteToggleSize } from '../web/actions/favouriteToggle.ts';
import { LINK_EXTERNAL_ICON, linkClass, type LinkTone, type LinkUnderline } from '../web/actions/link.ts';
import { buttonClass, type ButtonSize, type ButtonVariant } from '../web/actions/button.ts';
import { iconButtonClass, type IconButtonSize, type IconButtonTone } from '../web/actions/iconButton.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { Icon } from './foundations.tsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName | string;
  trailingIcon?: IconName | string;
  loading?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

/** Same DOM and classes as `createButton`. */
export function Button({ variant, size, icon, trailingIcon, loading = false, fullWidth, disabled, className, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx(buttonClass(variant, size, fullWidth), loading && 'is-loading', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {icon && <Icon icon={icon} />}
      <span className="mh-button__label">{children}</span>
      {trailingIcon && <Icon icon={trailingIcon} />}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconName | string;
  /** Required: the accessible name (also the tooltip). */
  label: string;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  filled?: boolean;
  pressed?: boolean;
}

/** Same DOM and classes as `createIconButton`. */
export function IconButton({ icon, label, tone, size, filled, pressed, className, ...rest }: IconButtonProps) {
  return (
    <button {...rest} type="button" className={cx(iconButtonClass(tone, size, filled), className)} aria-label={label} title={label} aria-pressed={pressed}>
      <Icon icon={icon} />
    </button>
  );
}

export interface ButtonGroupProps {
  items: readonly ButtonGroupItem[];
  /** Accessible name of the group. */
  label?: string;
  variant?: ButtonGroupVariant;
  size?: ButtonSize;
  orientation?: ButtonGroupOrientation;
  /** One tab stop; arrow keys, Home and End move between the buttons. */
  toolbar?: boolean;
  fullWidth?: boolean;
  onClick?: (id: string, event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

/** Same DOM and classes as `createButtonGroup`. Pressed and disabled states come from `items`. */
export function ButtonGroup({ items, label, variant, size, orientation = 'horizontal', toolbar = false, fullWidth, onClick, className }: ButtonGroupProps) {
  const [wanted, setWanted] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const stop = buttonGroupTabStop(items, wanted);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (!toolbar) return;
    const from = refs.current.indexOf(document.activeElement as HTMLButtonElement);
    if (from < 0) return;
    const to = buttonGroupKeyTarget(items, from, e.key, orientation);
    if (to === null) return;
    e.preventDefault();
    setWanted(to);
    refs.current[to]?.focus();
  };
  return (
    <div className={cx(buttonGroupClass(variant, orientation, fullWidth), className)} {...buttonGroupAria(toolbar, orientation)} aria-label={label} onKeyDown={onKeyDown}>
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(b) => {
            refs.current[i] = b;
          }}
          type="button"
          className={buttonGroupItemClass(variant, size, item.iconOnly)}
          aria-label={item.iconOnly ? item.label : undefined}
          title={item.iconOnly ? item.label : undefined}
          aria-pressed={item.pressed}
          disabled={item.disabled}
          tabIndex={toolbar ? (i === stop ? 0 : -1) : undefined}
          onFocus={toolbar ? () => setWanted(i) : undefined}
          onClick={(e) => onClick?.(item.id, e)}
        >
          {item.icon && <Icon icon={item.icon} />}
          {!item.iconOnly && <span className="mh-button__label">{item.label}</span>}
        </button>
      ))}
    </div>
  );
}

interface LinkOwnProps {
  tone?: LinkTone;
  underline?: LinkUnderline;
  icon?: IconName | string;
  /** Opens in a new tab, with an icon and a spoken hint. */
  external?: boolean;
  newTabLabel?: string;
  children?: ReactNode;
}

export type LinkProps = LinkOwnProps &
  (({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'>) | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>));

/** Same DOM and classes as `createLink`: an `<a>` with an `href`, else a `<button>`. */
export function Link(props: LinkProps) {
  const { tone, underline, icon, external, newTabLabel = 'opens in a new tab', children, className, ...rest } = props;
  const cls = cx(linkClass(tone, underline), className);
  const isExternal = props.href !== undefined && external;
  const content = (
    <>
      {icon && <Icon icon={icon} />}
      <span className="mh-link__text">{children}</span>
      {isExternal && <Icon icon={LINK_EXTERNAL_ICON} className="mh-link__external" />}
      {isExternal && <span className="mh-visually-hidden">{` (${newTabLabel})`}</span>}
    </>
  );
  if (props.href !== undefined) {
    const anchor = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a {...anchor} className={cls} target={isExternal ? '_blank' : anchor.target} rel={isExternal ? 'noopener noreferrer' : anchor.rel}>
        {content}
      </a>
    );
  }
  return (
    <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} type="button" className={cls}>
      {content}
    </button>
  );
}

export interface FavouriteToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  /** Controlled state. */
  pressed?: boolean;
  /** Uncontrolled starting state. */
  defaultPressed?: boolean;
  /** Accessible name, the same whether on or off. Default "Favourite". */
  label?: string;
  showLabel?: boolean;
  size?: FavouriteToggleSize;
  onPressedChange?: (pressed: boolean) => void;
}

/** Same DOM and classes as `createFavouriteToggle`. */
export function FavouriteToggle({ pressed, defaultPressed = false, label = 'Favourite', showLabel, size, onPressedChange, className, onClick, onAnimationEnd, ...rest }: FavouriteToggleProps) {
  const [own, setOwn] = useState(defaultPressed);
  const [popping, setPopping] = useState(false);
  const on = pressed ?? own;
  return (
    <button
      {...rest}
      type="button"
      className={cx(favouriteToggleClass(size, showLabel), popping && 'is-popping', className)}
      aria-pressed={on}
      aria-label={showLabel ? undefined : label}
      title={showLabel ? undefined : label}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        setOwn(!on);
        setPopping(true);
        onPressedChange?.(!on);
      }}
      onAnimationEnd={(e) => {
        onAnimationEnd?.(e);
        if (e.target !== e.currentTarget) setPopping(false);
      }}
    >
      <Icon icon={favouriteIcon(on)} />
      {showLabel && <span className="mh-favourite-toggle__label">{label}</span>}
    </button>
  );
}
