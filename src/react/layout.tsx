// layout group: React bindings. Same DOM and classes as the web renderer.
import { mdiChevronDown, mdiDotsHorizontal, mdiDragVertical } from '@mdi/js';
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { buttonClass } from '../web/actions/button.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { appShellClass, type AppShellNav } from '../web/layout/appShell.ts';
import {
  clampOnboardingStep,
  defaultOnboardingLabels,
  onboardingMediaClass,
  onboardingSwipe,
  type OnboardingLabels,
  type OnboardingStep as WebOnboardingStep,
} from '../web/layout/onboarding.ts';
import { panelClass, type PanelVariant } from '../web/layout/panel.ts';
import { panelGroupClass, panelGroupKeyTarget, panelGroupSelected } from '../web/layout/panelGroup.ts';
import { bindReorderableList, defaultReorderMessages, moveItem, type ReorderMessages } from '../web/layout/reorderableList.ts';
import { screenClass, type ScreenWidth } from '../web/layout/screen.ts';
import { bindScrollPanel, scrollPanelClass, type ScrollPanelSize } from '../web/layout/scrollPanel.ts';
import { bindSplitPane, clampSplit, splitHandleOrientation, splitPaneClass, splitRange, splitValue, type SplitPaneBehaviour, type SplitPaneController } from '../web/layout/splitPane.ts';
import { gridClass, stackClass, type GridOptions, type StackOptions } from '../web/layout/stack.ts';
import { statusBarClass, statusBarItemClass, type StatusBarTone } from '../web/layout/statusBar.ts';
import { bindSwipeRow, swipeActionClass, swipeControls, type SwipeActionTone, type SwipeRowController, type SwipeSide } from '../web/layout/swipeRow.ts';
import { bindToolbar, toolbarClass, toolbarSeparatorOrientation, type ToolbarOrientation, type ToolbarVariant } from '../web/layout/toolbar.ts';
import { Icon } from './foundations.tsx';

/** The latest value of a prop, for listeners bound once. */
function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

export interface ScreenProps {
  width?: ScreenWidth;
  canvas?: boolean;
  header?: ReactNode;
  label?: string;
  className?: string;
  children?: ReactNode;
}

/** Same DOM and classes as `createScreen`. */
export function Screen({ width, canvas = true, header, label, className, children }: ScreenProps) {
  return (
    <div className={cx(screenClass(width, canvas), className)}>
      <div className="mh-screen__column">
        {header && <header className="mh-screen__header">{header}</header>}
        <main className="mh-screen__main" aria-label={label}>
          {children}
        </main>
      </div>
    </div>
  );
}

export interface StackProps extends StackOptions, Omit<HTMLAttributes<HTMLElement>, 'dir'> {
  children?: ReactNode;
}

/** Same DOM and classes as `createStack`. */
export function Stack({ direction, gap, align, justify, wrap, as = 'div', className, children, ...rest }: StackProps) {
  return createElement(as, { ...rest, className: cx(stackClass({ direction, gap, align, justify, wrap }), className) }, children);
}

/** Same DOM and classes as `createRow`. */
export function Row({ align = 'center', ...props }: Omit<StackProps, 'direction'>) {
  return <Stack {...props} align={align} direction="row" />;
}

export interface GridProps extends GridOptions, HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/** Same DOM and classes as `createGrid`. */
export function Grid({ min, gap, as = 'div', className, children, ...rest }: GridProps) {
  return createElement(as, { ...rest, className: cx(gridClass({ min, gap }), className) }, children);
}

// Split pane ---------------------------------------------------------------------------------------------------

export interface SplitPaneProps extends SplitPaneBehaviour {
  start?: ReactNode;
  end?: ReactNode;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

/** Same DOM and classes as `createSplitPane`; dragging and keys come from the web renderer's `bindSplitPane`. */
export function SplitPane({ orientation, size = 50, min, max, step, collapsible, collapsed = false, onResize, onCollapse, start, end, label, startLabel, endLabel, className }: SplitPaneProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const controller = useRef<SplitPaneController | null>(null);
  const callbacks = useLatest({ onResize, onCollapse });
  const value = clampSplit(size, min, max);
  const folded = Boolean(collapsible && collapsed);
  useEffect(() => {
    const c = bindSplitPane(ref.current!, {
      orientation,
      size: value,
      min,
      max,
      step,
      collapsible,
      collapsed: folded,
      onResize: (s) => callbacks.current.onResize?.(s),
      onCollapse: (f) => callbacks.current.onCollapse?.(f),
    });
    controller.current = c;
    return () => c.destroy();
  }, [orientation, min, max, step, collapsible]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => controller.current?.setSize(value), [value]);
  useEffect(() => controller.current?.setCollapsed(folded), [folded]);
  const [lo, hi] = splitRange({ min, max, collapsible });
  return (
    <div ref={ref} className={cx(splitPaneClass(orientation, collapsible), folded && 'is-collapsed', className)} style={{ '--_size': `${value}%` } as CSSProperties}>
      <div className="mh-split__pane mh-split__pane--start" id={`${id}-start`} role={startLabel ? 'region' : undefined} aria-label={startLabel} hidden={folded && collapsible === 'start'}>
        {start}
      </div>
      <div
        className="mh-split__handle"
        role="separator"
        tabIndex={0}
        aria-orientation={splitHandleOrientation(orientation)}
        aria-label={label ?? 'Resize panes'}
        aria-controls={`${id}-${collapsible === 'end' ? 'end' : 'start'}`}
        aria-valuemin={lo}
        aria-valuemax={hi}
        aria-valuenow={splitValue(value, folded, collapsible)}
      >
        <span className="mh-split__grip" aria-hidden="true" />
      </div>
      <div className="mh-split__pane mh-split__pane--end" id={`${id}-end`} role={endLabel ? 'region' : undefined} aria-label={endLabel} hidden={folded && collapsible === 'end'}>
        {end}
      </div>
    </div>
  );
}

// Panel --------------------------------------------------------------------------------------------------------

export interface PanelProps {
  title: string;
  description?: string;
  icon?: IconName | string;
  actions?: ReactNode;
  footer?: ReactNode;
  variant?: PanelVariant;
  collapsible?: boolean;
  /** Collapsible panels: open or closed; follows the prop when it changes (default true). */
  open?: boolean;
  headingLevel?: 2 | 3 | 4;
  flush?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
  children?: ReactNode;
}

/** Same DOM and classes as `createPanel`. */
export function Panel({ title, description, icon, actions, footer, variant, collapsible = false, open = true, headingLevel = 3, flush, onToggle, className, children }: PanelProps) {
  const id = useId();
  const [isOpen, setOpen] = useState(open);
  useEffect(() => setOpen(open), [open]);
  const shown = !collapsible || isOpen;
  const Heading = `h${headingLevel}` as 'h3';
  const titleContent = (
    <>
      {icon && <Icon icon={icon} className="mh-panel__icon" />}
      <span className="mh-panel__title" id={`${id}-title`}>
        {title}
      </span>
    </>
  );
  return (
    <section className={cx(panelClass(variant, collapsible, flush), !shown && 'is-collapsed', className)} aria-labelledby={`${id}-title`}>
      <div className="mh-panel__header">
        <div className="mh-panel__titles">
          <Heading className="mh-panel__heading">
            {collapsible ? (
              <button
                type="button"
                className="mh-panel__toggle"
                aria-controls={`${id}-body`}
                aria-expanded={shown}
                onClick={() => {
                  setOpen(!shown);
                  onToggle?.(!shown);
                }}
              >
                {titleContent}
                <Icon icon={mdiChevronDown} className="mh-panel__chevron" />
              </button>
            ) : (
              titleContent
            )}
          </Heading>
          {description && <p className="mh-panel__description">{description}</p>}
        </div>
        {actions && <div className="mh-panel__actions">{actions}</div>}
      </div>
      <div className="mh-panel__body" id={`${id}-body`} hidden={!shown}>
        {children}
      </div>
      {footer !== undefined && (
        <div className="mh-panel__footer" hidden={!shown}>
          {footer}
        </div>
      )}
    </section>
  );
}

// Panel group --------------------------------------------------------------------------------------------------

export interface PanelGroupPanel {
  id: string;
  label: string;
  icon?: IconName | string;
  badge?: string | number;
  disabled?: boolean;
  content?: ReactNode;
}

export interface PanelGroupProps {
  panels: readonly PanelGroupPanel[];
  value?: string;
  label?: string;
  actions?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  collapseLabel?: string;
  expandLabel?: string;
  flush?: boolean;
  onChange?: (id: string) => void;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
}

/** Same DOM and classes as `createPanelGroup`. `value` and `collapsed` are followed when they change. */
export function PanelGroup({ panels, value, label, actions, collapsible = false, collapsed = false, collapseLabel, expandLabel, flush, onChange, onCollapse, className }: PanelGroupProps) {
  const base = useId();
  const [current, setCurrent] = useState(() => panelGroupSelected(panels, value));
  const [folded, setFolded] = useState(collapsible && collapsed);
  useEffect(() => setCurrent(panelGroupSelected(panels, value)), [value]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setFolded(collapsible && collapsed), [collapsible, collapsed]);
  const selected = panelGroupSelected(panels, current);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (id: string): void => {
    const next = panelGroupSelected(panels, id);
    if (next !== selected) {
      setCurrent(next);
      onChange?.(next);
    }
  };
  const fold = (next: boolean): void => {
    if (!collapsible || next === folded) return;
    setFolded(next);
    onCollapse?.(next);
  };
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    const from = tabs.current.indexOf(e.target as HTMLButtonElement);
    if (from < 0) return;
    const to = panelGroupKeyTarget(panels, from, e.key);
    if (to === null) return;
    e.preventDefault();
    tabs.current[to]?.focus();
    select(panels[to]!.id);
  };
  const foldLabel = folded ? (expandLabel ?? 'Expand panels') : (collapseLabel ?? 'Collapse panels');
  return (
    <div className={cx(panelGroupClass(flush), folded && 'is-collapsed', className)}>
      <div className="mh-panel-group__bar">
        <div className="mh-panel-group__tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
          {panels.map((panel, i) => (
            <button
              key={panel.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              className="mh-panel-group__tab"
              role="tab"
              id={`${base}-tab-${i}`}
              aria-controls={`${base}-panel-${i}`}
              aria-selected={panel.id === selected}
              tabIndex={panel.id === selected ? 0 : -1}
              disabled={panel.disabled}
              onClick={() => {
                select(panel.id);
                fold(false);
              }}
            >
              {panel.icon && <Icon icon={panel.icon} />}
              <span className="mh-panel-group__label">{panel.label}</span>
              {panel.badge !== undefined && <span className="mh-panel-group__badge">{String(panel.badge)}</span>}
            </button>
          ))}
        </div>
        {(actions || collapsible) && (
          <div className="mh-panel-group__actions">
            {actions}
            {collapsible && (
              <button
                type="button"
                className="mh-panel-group__fold"
                aria-controls={panels.map((_, i) => `${base}-panel-${i}`).join(' ')}
                aria-expanded={!folded}
                aria-label={foldLabel}
                title={foldLabel}
                onClick={() => fold(!folded)}
              >
                <Icon icon={mdiChevronDown} />
              </button>
            )}
          </div>
        )}
      </div>
      {panels.map((panel, i) => (
        <div
          key={panel.id}
          className="mh-panel-group__panel"
          role="tabpanel"
          id={`${base}-panel-${i}`}
          aria-labelledby={`${base}-tab-${i}`}
          tabIndex={0}
          hidden={panel.id !== selected || folded}
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}

// Scroll panel -------------------------------------------------------------------------------------------------

export interface ScrollPanelProps {
  size?: ScrollPanelSize;
  axis?: 'x' | 'y';
  label: string;
  shadows?: boolean;
  inset?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Same DOM and classes as `createScrollPanel`; the edge fades come from `bindScrollPanel`. */
export function ScrollPanel({ size, axis, label, shadows, inset, className, children }: ScrollPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => bindScrollPanel(ref.current!).destroy, [axis]);
  return (
    <div ref={ref} className={cx(scrollPanelClass({ size, axis, shadows, inset }), className)}>
      <div className="mh-scroll-panel__viewport" role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
    </div>
  );
}

// Toolbar ------------------------------------------------------------------------------------------------------

const ToolbarContext = createContext<ToolbarOrientation>('horizontal');

export interface ToolbarProps {
  label: string;
  orientation?: ToolbarOrientation;
  variant?: ToolbarVariant;
  className?: string;
  children?: ReactNode;
}

/** Same DOM and classes as `createToolbar`; the roving tab stop comes from `bindToolbar`. */
export function Toolbar({ label, orientation = 'horizontal', variant, className, children }: ToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => bindToolbar(ref.current!).destroy, []);
  return (
    <ToolbarContext.Provider value={orientation}>
      <div ref={ref} className={cx(toolbarClass(orientation, variant), className)} role="toolbar" aria-label={label} aria-orientation={orientation}>
        {children}
      </div>
    </ToolbarContext.Provider>
  );
}

/** A rule between groups of toolbar controls. */
export function ToolbarSeparator() {
  const orientation = useContext(ToolbarContext);
  return <div className="mh-toolbar__separator" role="separator" aria-orientation={toolbarSeparatorOrientation(orientation)} />;
}

/** Pushes the following toolbar controls to the far end. */
export function ToolbarSpacer() {
  return <div className="mh-toolbar__spacer" aria-hidden="true" />;
}

// Status bar ---------------------------------------------------------------------------------------------------

export interface StatusBarEntry {
  id: string;
  label: string;
  value?: string;
  icon?: IconName | string;
  tone?: StatusBarTone;
  title?: string;
  end?: boolean;
  announce?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface StatusBarProps {
  label?: string;
  items: readonly StatusBarEntry[];
  sticky?: boolean;
  className?: string;
}

function StatusBarItemView({ item }: { item: StatusBarEntry }) {
  const parts = (
    <>
      {item.icon && <Icon icon={item.icon} className="mh-status-bar__icon" />}
      <span className="mh-status-bar__label">{item.label}</span>
      {item.value !== undefined && <span className="mh-status-bar__value">{item.value}</span>}
    </>
  );
  const live = item.announce ? 'polite' : undefined;
  return item.onClick ? (
    <button type="button" className={statusBarItemClass(item.tone, true)} title={item.title} aria-live={live} onClick={item.onClick}>
      {parts}
    </button>
  ) : (
    <span className={statusBarItemClass(item.tone)} title={item.title} aria-live={live}>
      {parts}
    </span>
  );
}

/** Same DOM and classes as `createStatusBar`. */
export function StatusBar({ label = 'Status', items, sticky, className }: StatusBarProps) {
  return (
    <footer className={cx(statusBarClass(sticky), className)} aria-label={label}>
      <div className="mh-status-bar__start">
        {items
          .filter((i) => !i.end)
          .map((item) => (
            <StatusBarItemView key={item.id} item={item} />
          ))}
      </div>
      <div className="mh-status-bar__end">
        {items
          .filter((i) => i.end)
          .map((item) => (
            <StatusBarItemView key={item.id} item={item} />
          ))}
      </div>
    </footer>
  );
}

// App shell ----------------------------------------------------------------------------------------------------

export interface AppShellProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  nav?: ReactNode;
  navPosition?: AppShellNav;
  status?: ReactNode;
  width?: ScreenWidth;
  label?: string;
  canvas?: boolean;
  fixed?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Same DOM and classes as `createAppShell`. */
export function AppShell({ title, subtitle, leading, actions, nav, navPosition, status, width = 'wide', label, canvas = true, fixed = true, className, children }: AppShellProps) {
  return (
    <div className={cx(appShellClass(navPosition, canvas, fixed), className)}>
      <header className="mh-app-shell__bar">
        {leading && <div className="mh-app-shell__leading">{leading}</div>}
        <div className="mh-app-shell__titles">
          <h1 className="mh-app-shell__title">{title}</h1>
          <p className="mh-app-shell__subtitle" hidden={!subtitle}>
            {subtitle ?? ''}
          </p>
        </div>
        {actions && <div className="mh-app-shell__actions">{actions}</div>}
      </header>
      <div className="mh-app-shell__body">
        {nav && <div className="mh-app-shell__nav">{nav}</div>}
        <div className="mh-app-shell__content">
          <Screen canvas={false} width={width} label={label}>
            {children}
          </Screen>
        </div>
      </div>
      {status && <div className="mh-app-shell__status">{status}</div>}
    </div>
  );
}

// Reorderable list ---------------------------------------------------------------------------------------------

export interface ReorderableListItem {
  id: string;
  label: string;
  description?: string;
  icon?: IconName | string;
  trailing?: ReactNode;
}

export interface ReorderableListProps {
  items: readonly ReorderableListItem[];
  label: string;
  messages?: Partial<ReorderMessages>;
  /** The new order of ids after every move. The list keeps its own order and follows `items` when they change. */
  onChange?: (ids: string[]) => void;
  className?: string;
}

/** Same DOM and classes as `createReorderableList`; dragging, keys and announcements come from `bindReorderableList`. */
export function ReorderableList({ items, label, messages, onChange, className }: ReorderableListProps) {
  const instructions = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(items);
  useEffect(() => setOrder(items), [items]);
  const latest = useLatest({ order, onChange, messages });
  useEffect(() => {
    const c = bindReorderableList(ref.current!, {
      get messages() {
        return latest.current.messages;
      },
      onMove: (from, to) => {
        const next = moveItem(latest.current.order, from, to);
        latest.current.onChange?.(next.map((i) => i.id));
        setOrder(next);
      },
    });
    return () => c.destroy();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const m = { ...defaultReorderMessages, ...messages };
  return (
    <div ref={ref} className={cx('mh-reorder', className)}>
      <p className="mh-visually-hidden" id={instructions}>
        {m.instructions}
      </p>
      <ul className="mh-reorder__list" aria-label={label}>
        {order.map((item) => (
          <li key={item.id} className="mh-reorder__item" data-id={item.id}>
            <button type="button" className="mh-reorder__handle" aria-label={m.handle(item.label)} aria-describedby={instructions} aria-pressed="false">
              <Icon icon={mdiDragVertical} />
            </button>
            {item.icon && <Icon icon={item.icon} className="mh-reorder__icon" />}
            <div className="mh-reorder__text">
              <span className="mh-reorder__label">{item.label}</span>
              {item.description && <span className="mh-reorder__description">{item.description}</span>}
            </div>
            {item.trailing && <div className="mh-reorder__trailing">{item.trailing}</div>}
          </li>
        ))}
      </ul>
      <div className="mh-reorder__live mh-visually-hidden" aria-live="assertive" aria-atomic="true" />
    </div>
  );
}

// Swipe row ----------------------------------------------------------------------------------------------------

export interface SwipeRowAction {
  id: string;
  label: string;
  icon: IconName | string;
  tone?: SwipeActionTone;
  onAction?: () => void;
}

export interface SwipeRowProps {
  label: string;
  moreLabel?: string;
  start?: readonly SwipeRowAction[];
  end?: readonly SwipeRowAction[];
  fullSwipe?: boolean;
  /** Called with the action's id after its own `onAction`. */
  onAction?: (id: string) => void;
  onOpenChange?: (side: SwipeSide | null) => void;
  className?: string;
  children?: ReactNode;
}

function SwipeGroup({ side, actions, id, label }: { side: SwipeSide; actions?: readonly SwipeRowAction[]; id: string; label: string }) {
  if (!actions?.length) return null;
  return (
    <div className={`mh-swipe-row__actions mh-swipe-row__actions--${side}`} id={`${id}-${side}`} role="group" aria-label={label}>
      {actions.map((a) => (
        <button key={a.id} type="button" className={swipeActionClass(a.tone)} data-action={a.id}>
          <Icon icon={a.icon} />
          <span className="mh-swipe-row__action-label">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Same DOM and classes as `createSwipeRow`; swiping and keys come from `bindSwipeRow`. */
export function SwipeRow({ label, moreLabel, start, end, fullSwipe, onAction, onOpenChange, className, children }: SwipeRowProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const controller = useRef<SwipeRowController | null>(null);
  const latest = useLatest({ start, end, onAction, onOpenChange });
  const hasStart = Boolean(start?.length);
  const hasEnd = Boolean(end?.length);
  useEffect(() => {
    const c = bindSwipeRow(ref.current!, {
      fullSwipe,
      onAction: (actionId) => {
        const { start: s, end: e, onAction: run } = latest.current;
        [...(s ?? []), ...(e ?? [])].find((a) => a.id === actionId)?.onAction?.();
        run?.(actionId);
      },
      onOpenChange: (side) => latest.current.onOpenChange?.(side),
    });
    controller.current = c;
    return () => c.destroy();
  }, [fullSwipe, hasStart, hasEnd]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = moreLabel ?? `Actions for ${label}`;
  return (
    <div ref={ref} className={cx('mh-swipe-row', className)}>
      <div className="mh-swipe-row__content">
        <div className="mh-swipe-row__main">{children}</div>
        <button type="button" className="mh-swipe-row__more" aria-label={name} title={name} aria-expanded="false" aria-controls={swipeControls(id, hasStart, hasEnd)}>
          <Icon icon={mdiDotsHorizontal} />
        </button>
      </div>
      <SwipeGroup side="start" actions={start} id={id} label={name} />
      <SwipeGroup side="end" actions={end} id={id} label={name} />
    </div>
  );
}

// Onboarding ---------------------------------------------------------------------------------------------------

export interface OnboardingStepProps extends Omit<WebOnboardingStep, 'media' | 'content'> {
  media?: ReactNode;
  content?: ReactNode;
}

export interface OnboardingProps {
  steps: readonly OnboardingStepProps[];
  /** The current step; followed when it changes (default 0). */
  step?: number;
  labels?: Partial<OnboardingLabels>;
  skippable?: boolean;
  headingLevel?: 1 | 2 | 3;
  onStepChange?: (index: number) => void;
  onDone?: () => void;
  onSkip?: () => void;
  className?: string;
}

/** Same DOM and classes as `createOnboarding`. */
export function Onboarding({ steps, step = 0, labels: custom, skippable = true, headingLevel = 2, onStepChange, onDone, onSkip, className }: OnboardingProps) {
  const base = useId();
  const labels = { ...defaultOnboardingLabels, ...custom };
  const count = steps.length;
  const [current, setCurrent] = useState(() => clampOnboardingStep(step, count));
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => setCurrent(clampOnboardingStep(step, count)), [step, count]);
  const backRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const press = useRef<{ x: number; y: number; type: string } | null>(null);
  const root = useRef<HTMLElement>(null);
  const Heading = `h${headingLevel}` as 'h2';

  const go = (index: number): void => {
    const to = clampOnboardingStep(index, count);
    if (to === current) return;
    if (to === 0 && document.activeElement === backRef.current) nextRef.current?.focus();
    setCurrent(to);
    setAnnouncement(`${labels.step(to + 1, count)}: ${steps[to]!.title}`);
    onStepChange?.(to);
  };
  const forward = (): void => {
    if (current === count - 1) onDone?.();
    else go(current + 1);
  };
  const rtl = (): boolean => (root.current ? getComputedStyle(root.current).direction === 'rtl' : false);
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>): void => {
    if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
    if (e.key === (rtl() ? 'ArrowLeft' : 'ArrowRight') && current < count - 1) go(current + 1);
    else if (e.key === (rtl() ? 'ArrowRight' : 'ArrowLeft') && current > 0) go(current - 1);
    else return;
    e.preventDefault();
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (!press.current) return;
    const turn = onboardingSwipe(e.clientX - press.current.x, e.clientY - press.current.y, press.current.type, rtl());
    press.current = null;
    if (turn) go(current + turn);
  };

  return (
    <section ref={root} className={cx('mh-onboarding', className)} aria-label={labels.label} onKeyDown={onKeyDown}>
      {skippable && (
        <div className="mh-onboarding__top">
          <button type="button" className={cx(buttonClass('text', 'small'), 'mh-onboarding__skip')} onClick={() => onSkip?.()}>
            <span className="mh-button__label">{labels.skip}</span>
          </button>
        </div>
      )}
      <div
        className="mh-onboarding__steps"
        onPointerDown={(e) => (press.current = { x: e.clientX, y: e.clientY, type: e.pointerType })}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (press.current = null)}
      >
        {steps.map((s, i) => {
          const media = s.media ?? (s.icon ? <Icon icon={s.icon} /> : null);
          return (
            <div key={i} className="mh-onboarding__step" role="group" aria-label={labels.step(i + 1, count)} id={`${base}-step-${i}`} hidden={i !== current}>
              {media && <div className={onboardingMediaClass(!s.media)}>{media}</div>}
              <Heading className="mh-onboarding__title">{s.title}</Heading>
              {s.text && <p className="mh-onboarding__text">{s.text}</p>}
              {s.content !== undefined && <div className="mh-onboarding__content">{s.content}</div>}
            </div>
          );
        })}
      </div>
      <div className="mh-onboarding__live mh-visually-hidden" aria-live="polite">
        {announcement}
      </div>
      <div className="mh-onboarding__footer">
        <button ref={backRef} type="button" className={cx(buttonClass('text'), 'mh-onboarding__back')} hidden={current === 0} onClick={() => go(current - 1)}>
          <span className="mh-button__label">{labels.back}</span>
        </button>
        <ol className="mh-onboarding__dots" aria-hidden="true">
          {steps.map((_, i) => (
            <li key={i} className={cx('mh-onboarding__dot', i === current && 'is-current', i < current && 'is-done')} />
          ))}
        </ol>
        <button ref={nextRef} type="button" className={cx(buttonClass('primary'), 'mh-onboarding__next')} onClick={forward}>
          <span className="mh-button__label">{current === count - 1 ? labels.done : labels.next}</span>
        </button>
      </div>
    </section>
  );
}
