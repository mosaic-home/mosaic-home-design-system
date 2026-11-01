import { mdiChevronDown } from '@mdi/js';
import { useEffect, useId, useMemo, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { ButtonSize } from '../web/actions/button.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { createBottomSheet } from '../web/overlays/bottomSheet.ts';
import { createCommandPalette, type Command, type CommandPaletteHandle, type CommandPaletteLabels } from '../web/overlays/commandPalette.ts';
import type { FloatingPlacement } from '../web/overlays/layer.ts';
import { createPopover, type PopoverCloseReason, type PopoverHandle } from '../web/overlays/popover.ts';
import { SPLIT_BUTTON_MENU_LABEL, splitButtonClass, splitButtonPartClass, type SplitButtonVariant } from '../web/overlays/splitButton.ts';
import { Icon } from './foundations.tsx';
import { createDialog, type DialogSize } from '../web/overlays/dialog.ts';
import { createDrawer, type DrawerSide } from '../web/overlays/drawer.ts';
import { createMenu, type MenuEntry, type MenuHandle, type MenuPlacement } from '../web/overlays/menu.ts';
import type { OverlayBaseOptions, OverlayCloseReason, OverlayHandle } from '../web/overlays/modal.ts';
import { createToaster, type Toaster, type ToasterOptions, type ToastHandle, type ToastOptions } from '../web/overlays/toast.ts';
import { createTooltip, type TooltipHandle, type TooltipPlacement } from '../web/overlays/tooltip.ts';

export { confirm, type ConfirmOptions } from '../web/overlays/confirm.ts';
export { toast } from '../web/overlays/toast.ts';

export interface OverlayProps {
  open: boolean;
  /** The user closed it (Escape, scrim, close button, swipe); set `open` to false. Not called when `open` turns false. */
  onClose: (reason: OverlayCloseReason) => void;
  title?: string;
  /** Accessible name when there's no title. */
  label?: string;
  description?: string;
  closeButton?: boolean;
  closeLabel?: string;
  dismissible?: boolean;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default `document.body`). */
  container?: HTMLElement | null;
  footer?: ReactNode;
  children?: ReactNode;
}

type Factory = (options: OverlayBaseOptions & { description?: string }) => OverlayHandle;

/**
 * Builds the vanilla overlay in an effect (so the DOM, classes and behaviour are the web renderer's own) and
 * renders `children` and `footer` into its body and footer through portals.
 */
function useOverlay(create: Factory, props: OverlayProps, structure: string): ReactNode {
  const { open, onClose, title, label, description, closeButton, closeLabel, dismissible, container, footer, children } = props;
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const [handle, setHandle] = useState<OverlayHandle | null>(null);
  useEffect(() => {
    const h = create({
      label,
      description,
      closeButton,
      closeLabel,
      dismissible,
      container,
      onClose: (reason) => {
        if (reason !== 'api') onCloseRef.current(reason);
      },
    });
    setHandle(h);
    return () => h.destroy();
    // `structure` stands for the options that need a fresh overlay; the title is updated in place.
  }, [structure, label, description, closeButton, closeLabel, dismissible, container]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    handle?.setTitle(title ?? '');
  }, [handle, title]);
  const hasFooter = footer !== undefined && footer !== null && footer !== false;
  useEffect(() => {
    if (handle) handle.footer.hidden = !hasFooter;
  }, [handle, hasFooter]);
  useEffect(() => {
    if (!handle) return;
    if (open) handle.open();
    else handle.close();
  }, [handle, open]);
  if (!handle) return null;
  return (
    <>
      {createPortal(children, handle.body)}
      {hasFooter && createPortal(footer, handle.footer)}
    </>
  );
}

export interface BottomSheetProps extends OverlayProps {
  swipeToClose?: boolean;
}

/** `createBottomSheet` as a component: a sheet from the bottom on phones, a centred panel on wide screens. */
export function BottomSheet({ swipeToClose = true, ...props }: BottomSheetProps) {
  return useOverlay((o) => createBottomSheet({ ...o, swipeToClose }), props, String(swipeToClose));
}

export interface DrawerProps extends OverlayProps {
  side?: DrawerSide;
}

/** `createDrawer` as a component. */
export function Drawer({ side = 'right', ...props }: DrawerProps) {
  return useOverlay((o) => createDrawer({ ...o, side }), props, side);
}

export interface DialogProps extends OverlayProps {
  size?: DialogSize;
  role?: 'dialog' | 'alertdialog';
}

/** `createDialog` as a component (a native `<dialog>` opened with `showModal()`). */
export function Dialog({ size = 'medium', role = 'dialog', ...props }: DialogProps) {
  return useOverlay((o) => createDialog({ ...o, size, role }), props, `${size}/${role}`);
}

export interface ToasterApi {
  show(options: ToastOptions | string): ToastHandle;
  dismissAll(): void;
}

/**
 * A toaster owned by this component: created on the first `show`, removed on unmount. The returned object is
 * stable. (For one app-wide toaster, `toast()` needs no hook.)
 */
export function useToaster(options: ToasterOptions = {}): ToasterApi {
  const optionsRef = useRef(options);
  const toaster = useRef<Toaster | null>(null);
  useEffect(
    () => () => {
      toaster.current?.destroy();
      toaster.current = null;
    },
    [],
  );
  return useMemo(
    () => ({
      show: (o: ToastOptions | string) => (toaster.current ??= createToaster(optionsRef.current)).show(o),
      dismissAll: () => toaster.current?.dismissAll(),
    }),
    [],
  );
}

export interface MenuProps {
  items: readonly MenuEntry[];
  onSelect?: (value: string) => void;
  placement?: MenuPlacement;
  /** The trigger: one button element (it gets the menu-button ARIA). */
  children: ReactElement;
}

/** `createMenu` on its child button. The wrapper is `display: contents`. */
export function Menu({ items, onSelect, placement, children }: MenuProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const menu = useRef<MenuHandle | null>(null);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
    itemsRef.current = items;
  });
  useEffect(() => {
    const anchor = wrap.current?.firstElementChild;
    if (!(anchor instanceof HTMLElement)) return;
    const m = createMenu({ anchor, items: itemsRef.current, placement, onSelect: (v) => onSelectRef.current?.(v) });
    menu.current = m;
    return () => {
      m.destroy();
      menu.current = null;
    };
  }, [placement]);
  useEffect(() => {
    menu.current?.setItems(items);
  }, [items]);
  return (
    <span className="mh-menu-trigger" ref={wrap}>
      {children}
    </span>
  );
}

export interface TooltipProps {
  text: string;
  placement?: TooltipPlacement;
  delay?: number;
  /** The element the hint describes: one focusable element. */
  children: ReactElement;
}

/** `createTooltip` on its child. The wrapper is `display: contents`. */
export function Tooltip({ text, placement, delay, children }: TooltipProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const tip = useRef<TooltipHandle | null>(null);
  const textRef = useRef(text);
  useEffect(() => {
    textRef.current = text;
  });
  useEffect(() => {
    const target = wrap.current?.firstElementChild;
    if (!(target instanceof HTMLElement)) return;
    const t = createTooltip(target, { text: textRef.current, placement, delay });
    tip.current = t;
    return () => {
      t.destroy();
      tip.current = null;
    };
  }, [placement, delay]);
  useEffect(() => {
    tip.current?.setText(text);
  }, [text]);
  return (
    <span className="mh-tooltip-trigger" ref={wrap}>
      {children}
    </span>
  );
}

export interface SplitButtonProps {
  /** The main action's label. */
  label: string;
  icon?: IconName | string;
  variant?: SplitButtonVariant;
  size?: ButtonSize;
  items: readonly MenuEntry[];
  menuLabel?: string;
  placement?: MenuPlacement;
  disabled?: boolean;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelect?: (value: string) => void;
}

/** Same DOM and classes as `createSplitButton`; the menu is the web renderer's, built in an effect. */
export function SplitButton({ label, icon, variant, size, items, menuLabel = SPLIT_BUTTON_MENU_LABEL, placement = 'bottom-end', disabled, className, onClick, onSelect }: SplitButtonProps) {
  const toggleId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<MenuHandle | null>(null);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
    itemsRef.current = items;
  });
  useEffect(() => {
    if (!toggle.current) return;
    const m = createMenu({ anchor: toggle.current, items: itemsRef.current, placement, onSelect: (v) => onSelectRef.current?.(v) });
    menu.current = m;
    return () => {
      m.destroy();
      menu.current = null;
    };
  }, [placement]);
  useEffect(() => {
    menu.current?.setItems(items);
  }, [items]);
  useEffect(() => {
    if (disabled) menu.current?.close();
  }, [disabled]);
  return (
    <div className={cx(splitButtonClass(variant, size), className)} role="group" aria-label={label}>
      <button type="button" className={splitButtonPartClass('main', variant, size)} disabled={disabled} onClick={onClick}>
        {icon && <Icon icon={icon} />}
        <span className="mh-button__label">{label}</span>
      </button>
      <button ref={toggle} id={toggleId} type="button" className={splitButtonPartClass('toggle', variant, size)} aria-label={menuLabel} title={menuLabel} aria-haspopup="menu" aria-expanded={false} disabled={disabled}>
        <Icon icon={mdiChevronDown} />
      </button>
    </div>
  );
}

export interface PopoverProps {
  /** The control that opens it: one element (it gets `aria-haspopup`, `aria-expanded`, `aria-controls`). */
  trigger: ReactElement;
  title?: string;
  label?: string;
  placement?: FloatingPlacement;
  closeButton?: boolean;
  closeLabel?: string;
  size?: 'auto' | 'wide';
  /** Follows this when it changes; leave it out to let the trigger open and close it. */
  open?: boolean;
  /** It opened or closed (from the trigger, Escape, a press outside, Tab leaving it, or the close button). */
  onOpenChange?: (open: boolean, reason?: PopoverCloseReason) => void;
  /** The panel's content. */
  children?: ReactNode;
}

/** `createPopover` on `trigger`, with `children` portalled into its body. The trigger's wrapper is `display: contents`. */
export function Popover({ trigger, title, label, placement, closeButton, closeLabel, size, open, onOpenChange, children }: PopoverProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const [handle, setHandle] = useState<PopoverHandle | null>(null);
  const onChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onChangeRef.current = onOpenChange;
  });
  useEffect(() => {
    const anchor = wrap.current?.firstElementChild;
    if (!(anchor instanceof HTMLElement)) return;
    const p = createPopover({
      anchor,
      label,
      placement,
      closeButton,
      closeLabel,
      size,
      onOpen: () => onChangeRef.current?.(true),
      onClose: (reason) => {
        if (reason !== 'api') onChangeRef.current?.(false, reason);
      },
    });
    setHandle(p);
    return () => p.destroy();
  }, [label, placement, closeButton, closeLabel, size]);
  useEffect(() => {
    handle?.setTitle(title ?? '');
  }, [handle, title]);
  useEffect(() => {
    if (!handle || open === undefined) return;
    if (open) handle.open();
    else handle.close();
  }, [handle, open]);
  useEffect(() => {
    if (handle?.isOpen()) handle.reposition();
  });
  return (
    <>
      <span className="mh-popover-trigger" ref={wrap}>
        {trigger}
      </span>
      {handle && createPortal(children, handle.body)}
    </>
  );
}

export interface CommandPaletteProps {
  open: boolean;
  /** The user closed it (Escape, a press outside, or running a command); set `open` to false. */
  onClose: (reason: OverlayCloseReason) => void;
  /** It opened from the hotkey; set `open` to true. */
  onOpen?: () => void;
  commands: readonly Command[];
  onSelect?: (value: string) => void;
  hotkey?: boolean;
  labels?: Partial<CommandPaletteLabels>;
  /** Portals into the nearest `[data-mh-theme]` ancestor of this element (default `document.body`). */
  container?: HTMLElement | null;
}

/** `createCommandPalette` as a component: the web renderer's palette, built in an effect. */
export function CommandPalette({ open, onClose, onOpen, commands, onSelect, hotkey, labels, container }: CommandPaletteProps) {
  const refs = useRef({ onClose, onOpen, onSelect, commands, labels });
  useEffect(() => {
    refs.current = { onClose, onOpen, onSelect, commands, labels };
  });
  const [handle, setHandle] = useState<CommandPaletteHandle | null>(null);
  // Set while opening or closing for the prop, which is not the user's doing and isn't reported back.
  const programmatic = useRef(false);
  useEffect(() => {
    const p = createCommandPalette({
      commands: refs.current.commands,
      labels: refs.current.labels,
      hotkey,
      container,
      onOpen: () => {
        if (!programmatic.current) refs.current.onOpen?.();
      },
      onSelect: (v) => refs.current.onSelect?.(v),
      // Running a command closes it through the API: report that as `confirm`.
      onClose: (reason) => {
        if (!programmatic.current) refs.current.onClose(reason === 'api' ? 'confirm' : reason);
      },
    });
    setHandle(p);
    return () => p.destroy();
  }, [hotkey, container]);
  useEffect(() => {
    handle?.setCommands(commands);
  }, [handle, commands]);
  useEffect(() => {
    if (!handle || open === handle.isOpen()) return;
    programmatic.current = true;
    if (open) handle.open();
    else handle.close();
    programmatic.current = false;
  }, [handle, open]);
  return null;
}
