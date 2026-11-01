import { mdiAlertCircleOutline, mdiCheck, mdiChevronLeft, mdiChevronRight, mdiClose, mdiDotsHorizontal, mdiPlus } from '@mdi/js';
import { createElement, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { breadcrumbMoreLabel, breadcrumbSlots, type BreadcrumbItem } from '../web/navigation/breadcrumbs.ts';
import { DOCUMENT_TAB_DIRTY_TEXT, documentTabClass, documentTabsAfterClose, type DocumentTab } from '../web/navigation/documentTabs.ts';
import { createMenuBar, type MenuBarMenu } from '../web/navigation/menuBar.ts';
import { navRailBadgeClass, navRailBadgeLabel, navRailBadgeShown, navRailBadgeText, navRailClass, type NavRailItem } from '../web/navigation/navRail.ts';
import { pageHeaderBackClass } from '../web/navigation/pageHeader.ts';
import { paginationClass, paginationCompactText, paginationPageLabel, paginationSlots, type PaginationVariant } from '../web/navigation/pagination.ts';
import { STEP_STATE_TEXT, stepClass, stepState, stepsClass, type StepItem, type StepsOrientation } from '../web/navigation/steps.ts';
import { selectedTab, tabsClass, tabsKeyTarget, type TabItem, type TabsVariant } from '../web/navigation/tabs.ts';
import { cx } from '../web/dom.ts';
import { Icon } from './foundations.tsx';

export interface TabsItem extends Omit<TabItem, 'panel'> {
  panel?: ReactNode;
}

export interface TabsProps {
  tabs: readonly TabsItem[];
  /** Controlled: the selected tab id. */
  value: string;
  onChange: (id: string) => void;
  variant?: TabsVariant;
  label?: string;
  fill?: boolean;
  activation?: 'auto' | 'manual';
}

/** Same DOM and classes as `createTabs`; controlled through `value` / `onChange`. */
export function Tabs({ tabs, value, onChange, variant, label, fill, activation = 'auto' }: TabsProps) {
  const base = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = selectedTab(tabs, value);
  const hasPanels = tabs.some((t) => t.panel !== undefined);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const from = buttons.current.indexOf(e.target as HTMLButtonElement);
    if (from < 0) return;
    const to = tabsKeyTarget(tabs, from, e.key);
    if (to === null) return;
    e.preventDefault();
    buttons.current[to]?.focus();
    if (activation === 'auto') onChange(tabs[to]!.id);
    else buttons.current.forEach((b, i) => b && (b.tabIndex = i === to ? 0 : -1));
  };
  return (
    <div className={tabsClass(variant, fill)}>
      <div className="mh-tabs__list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              buttons.current[i] = el;
            }}
            type="button"
            className="mh-tabs__tab"
            role="tab"
            id={`${base}-tab-${i}`}
            aria-controls={hasPanels ? `${base}-panel-${i}` : undefined}
            aria-selected={tab.id === current}
            tabIndex={tab.id === current ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => tab.id !== current && onChange(tab.id)}
          >
            {tab.icon && <Icon icon={tab.icon} />}
            <span className="mh-tabs__label">{tab.label}</span>
            {tab.badge !== undefined && <span className="mh-tabs__badge">{String(tab.badge)}</span>}
          </button>
        ))}
      </div>
      {hasPanels &&
        tabs.map((tab, i) => (
          <div key={tab.id} className="mh-tabs__panel" role="tabpanel" id={`${base}-panel-${i}`} aria-labelledby={`${base}-tab-${i}`} tabIndex={0} hidden={tab.id !== current}>
            {tab.panel}
          </div>
        ))}
    </div>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { label?: string; href?: string; onClick?: (event: MouseEvent<HTMLElement>) => void };
  level?: 1 | 2 | 3;
}

/** Same DOM and classes as `createPageHeader`. */
export function PageHeader({ title, eyebrow, subtitle, actions, back, level = 1 }: PageHeaderProps) {
  const backLabel = back?.label ?? 'Back';
  const has = (n: ReactNode): boolean => n !== undefined && n !== null && n !== false && n !== '';
  return (
    <header className="mh-page-header">
      {back &&
        (back.href ? (
          <a className={pageHeaderBackClass} href={back.href} aria-label={backLabel} title={backLabel} onClick={back.onClick}>
            <Icon icon={mdiChevronLeft} />
          </a>
        ) : (
          <button type="button" className={pageHeaderBackClass} aria-label={backLabel} title={backLabel} onClick={back.onClick}>
            <Icon icon={mdiChevronLeft} />
          </button>
        ))}
      <hgroup className="mh-page-header__text">
        <p className="mh-page-header__eyebrow" hidden={!has(eyebrow)}>
          {eyebrow}
        </p>
        {createElement(`h${level}`, { className: 'mh-page-header__title' }, title)}
        <p className="mh-page-header__subtitle" hidden={!has(subtitle)}>
          {subtitle}
        </p>
      </hgroup>
      <div className="mh-page-header__actions" hidden={!has(actions)}>
        {actions}
      </div>
    </header>
  );
}

// Document tabs ------------------------------------------------------------------------------------------------

export interface DocumentTabsProps {
  tabs: readonly DocumentTab[];
  /** Controlled: the selected tab id. */
  value: string;
  onChange: (id: string) => void;
  /** The user closed a tab; `next` is the tab to select if it was the selected one. Remove it from `tabs` to close it. */
  onClose?: (id: string, next: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  closeLabel?: string;
  label?: string;
}

/** Same DOM and classes as `createDocumentTabs`; controlled through `tabs`, `value`, `onChange` and `onClose`. */
export function DocumentTabs({ tabs, value, onChange, onClose, onAdd, addLabel = 'New tab', closeLabel = 'Close', label }: DocumentTabsProps) {
  const list = useRef<HTMLDivElement>(null);
  const refocus = useRef(false);
  const current = tabs.some((t) => t.id === value) ? value : (tabs[0]?.id ?? '');
  const buttons = (): HTMLButtonElement[] => Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    buttons()
      .find((b) => b.getAttribute('aria-selected') === 'true')
      ?.focus();
  });
  const close = (id: string): void => {
    if (!onClose) return;
    refocus.current = list.current?.contains(document.activeElement) ?? false;
    onClose(id, documentTabsAfterClose(tabs, id, current));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const from = buttons().indexOf(e.target as HTMLButtonElement);
    if (from < 0) return;
    if (e.key === 'Delete' && (tabs[from]!.closable ?? true)) {
      e.preventDefault();
      close(tabs[from]!.id);
      return;
    }
    const to = tabsKeyTarget(
      tabs.map(() => ({})),
      from,
      e.key,
    );
    if (to === null) return;
    e.preventDefault();
    buttons()[to]?.focus();
    if (tabs[to]!.id !== current) onChange(tabs[to]!.id);
  };
  return (
    <div className="mh-document-tabs">
      <div ref={list} className="mh-document-tabs__list" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        {tabs.map((tab) => {
          const on = tab.id === current;
          const closable = tab.closable ?? true;
          return (
            <div
              key={tab.id}
              className={documentTabClass(on, tab.dirty)}
              role="presentation"
              data-id={tab.id}
              onAuxClick={
                closable
                  ? (e) => {
                      if (e.button !== 1) return;
                      e.preventDefault();
                      close(tab.id);
                    }
                  : undefined
              }
            >
              <button type="button" className="mh-document-tabs__select" role="tab" aria-selected={on} tabIndex={on ? 0 : -1} title={tab.title} onClick={() => !on && onChange(tab.id)}>
                {tab.icon && <Icon icon={tab.icon} />}
                <span className="mh-document-tabs__label">{tab.label}</span>
                {tab.dirty && <span className="mh-visually-hidden">{DOCUMENT_TAB_DIRTY_TEXT}</span>}
              </button>
              {closable ? (
                <button
                  type="button"
                  className="mh-document-tabs__close"
                  tabIndex={-1}
                  aria-label={`${closeLabel} ${tab.label}`}
                  title={closeLabel}
                  onClick={(e) => {
                    e.stopPropagation();
                    close(tab.id);
                  }}
                >
                  {tab.dirty && <span className="mh-document-tabs__dirty" aria-hidden="true" />}
                  <Icon icon={mdiClose} className="mh-document-tabs__close-icon" />
                </button>
              ) : (
                tab.dirty && <span className="mh-document-tabs__dirty" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
      {onAdd && (
        <button type="button" className="mh-document-tabs__add" aria-label={addLabel} title={addLabel} onClick={onAdd}>
          <Icon icon={mdiPlus} />
        </button>
      )}
    </div>
  );
}

// Menu bar -----------------------------------------------------------------------------------------------------

export interface MenuBarProps {
  /** Rebuilt when this changes identity: keep it in state or a memo. */
  menus: readonly MenuBarMenu[];
  label?: string;
  onSelect?: (value: string, checked?: boolean) => void;
  className?: string;
}

/** `createMenuBar` built into the rendered element: same DOM, classes and keyboard behaviour. */
export function MenuBar({ menus, label, onSelect, className }: MenuBarProps) {
  const root = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });
  useEffect(() => {
    const handle = createMenuBar({ menus, label, onSelect: (value, checked) => onSelectRef.current?.(value, checked) }, root.current!);
    return () => handle.destroy();
  }, [menus, label]);
  return <div ref={root} className={cx('mh-menu-bar', className)} role="menubar" aria-label={label} />;
}

// Breadcrumbs --------------------------------------------------------------------------------------------------

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  label?: string;
  maxItems?: number;
  moreLabel?: (hidden: number) => string;
}

/** Same DOM and classes as `createBreadcrumbs`. */
export function Breadcrumbs({ items, label = 'Breadcrumb', maxItems, moreLabel = breadcrumbMoreLabel }: BreadcrumbsProps) {
  const [expanded, setExpanded] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const focusAfter = useRef(false);
  useEffect(() => {
    if (!focusAfter.current) return;
    focusAfter.current = false;
    list.current?.querySelectorAll<HTMLElement>('.mh-breadcrumbs__link')[1]?.focus();
  }, [expanded]);
  const slots = breadcrumbSlots(items.length, maxItems, expanded);
  const hidden = items.length - (slots.length - (slots.includes('more') ? 1 : 0));
  return (
    <nav className="mh-breadcrumbs" aria-label={label}>
      <ol ref={list} className="mh-breadcrumbs__list">
        {slots.map((slot, i) => {
          const sep = i < slots.length - 1 && (
            <span className="mh-breadcrumbs__separator" aria-hidden="true">
              <Icon icon={mdiChevronRight} />
            </span>
          );
          if (slot === 'more') {
            const text = moreLabel(hidden);
            return (
              <li key="more" className="mh-breadcrumbs__item">
                <button
                  type="button"
                  className="mh-breadcrumbs__more"
                  aria-label={text}
                  title={text}
                  onClick={() => {
                    focusAfter.current = true;
                    setExpanded(true);
                  }}
                >
                  <Icon icon={mdiDotsHorizontal} />
                </button>
                {sep}
              </li>
            );
          }
          const item = items[slot]!;
          const content = (
            <>
              {item.icon && <Icon icon={item.icon} />}
              <span className="mh-breadcrumbs__label">{item.label}</span>
            </>
          );
          const onClick = item.onClick ? (e: MouseEvent<HTMLElement>) => item.onClick!(e.nativeEvent) : undefined;
          return (
            <li key={slot} className="mh-breadcrumbs__item">
              {slot === items.length - 1 ? (
                <span className="mh-breadcrumbs__current" aria-current="page">
                  {content}
                </span>
              ) : item.href !== undefined ? (
                <a className="mh-breadcrumbs__link" href={item.href} onClick={onClick}>
                  {content}
                </a>
              ) : (
                <button type="button" className="mh-breadcrumbs__link" onClick={onClick}>
                  {content}
                </button>
              )}
              {sep}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Pagination ---------------------------------------------------------------------------------------------------

export interface PaginationProps {
  count: number;
  /** Controlled: the current page, 1-based. */
  page: number;
  onChange: (page: number) => void;
  variant?: PaginationVariant;
  siblings?: number;
  boundaries?: number;
  label?: string;
  href?: (page: number) => string;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}

/** Same DOM and classes as `createPagination`; controlled through `page` / `onChange`. */
export function Pagination({
  count,
  page,
  onChange,
  variant = 'pages',
  siblings,
  boundaries,
  label = 'Pagination',
  href,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  pageLabel = paginationPageLabel,
}: PaginationProps) {
  const total = Math.max(1, Math.floor(count));
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const go = (target: number) => (e: MouseEvent<HTMLElement>) => {
    if (href && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
    if (href) e.preventDefault();
    const next = Math.min(Math.max(1, target), total);
    if (next !== current) onChange(next);
  };
  const control = (target: number, className: string, aria: string, disabled: boolean, content: ReactNode, currentPage = false) => {
    const ariaCurrent = currentPage ? ('page' as const) : undefined;
    if (href && !disabled) {
      return (
        <a className={className} aria-label={aria} href={href(target)} aria-current={ariaCurrent} onClick={go(target)}>
          {content}
        </a>
      );
    }
    if (href) {
      return (
        <a className={className} aria-label={aria} aria-disabled="true" role="link">
          {content}
        </a>
      );
    }
    return (
      <button type="button" className={className} aria-label={aria} disabled={disabled} aria-current={ariaCurrent} onClick={disabled ? undefined : go(target)}>
        {content}
      </button>
    );
  };
  return (
    <nav className={paginationClass(variant)} aria-label={label}>
      <ul className="mh-pagination__list">
        <li className="mh-pagination__item">{control(current - 1, 'mh-pagination__nav mh-pagination__nav--previous', previousLabel, current <= 1, <Icon icon={mdiChevronLeft} />)}</li>
        {variant === 'compact' ? (
          <li className="mh-pagination__item">
            <span className="mh-pagination__status" aria-live="polite">
              {paginationCompactText(current, total)}
            </span>
          </li>
        ) : (
          paginationSlots(current, total, siblings, boundaries).map((slot) => (
            <li key={slot} className="mh-pagination__item">
              {typeof slot === 'number' ? (
                control(slot, 'mh-pagination__page', pageLabel(slot), false, String(slot), slot === current)
              ) : (
                <span className="mh-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              )}
            </li>
          ))
        )}
        <li className="mh-pagination__item">{control(current + 1, 'mh-pagination__nav mh-pagination__nav--next', nextLabel, current >= total, <Icon icon={mdiChevronRight} />)}</li>
      </ul>
    </nav>
  );
}

// Steps --------------------------------------------------------------------------------------------------------

export interface StepsProps {
  steps: readonly StepItem[];
  current?: number;
  orientation?: StepsOrientation;
  label?: string;
  onSelect?: (index: number) => void;
  optionalText?: string;
}

/** Same DOM and classes as `createSteps`. */
export function Steps({ steps, current = 0, orientation, label = 'Progress', onSelect, optionalText = 'Optional' }: StepsProps) {
  return (
    <ol className={stepsClass(orientation)} aria-label={label}>
      {steps.map((step, i) => {
        const state = stepState(step, i, current);
        const content = (
          <>
            <span className="mh-steps__marker" aria-hidden="true">
              {state === 'complete' ? <Icon icon={mdiCheck} /> : state === 'error' ? <Icon icon={mdiAlertCircleOutline} /> : String(i + 1)}
            </span>
            <span className="mh-steps__text">
              <span className="mh-steps__label">{step.label}</span>
              {step.description && <span className="mh-steps__description">{step.description}</span>}
              {step.optional && <span className="mh-steps__optional">{optionalText}</span>}
              <span className="mh-visually-hidden">{`, ${STEP_STATE_TEXT[state]}`}</span>
            </span>
          </>
        );
        const interactive = Boolean(onSelect) && state === 'complete';
        return (
          <li key={i} className={stepClass(state)} aria-current={state === 'current' || (step.error && i === current) ? 'step' : undefined}>
            {interactive ? (
              <button type="button" className="mh-steps__button" onClick={() => onSelect!(i)}>
                {content}
              </button>
            ) : (
              <span className="mh-steps__body">{content}</span>
            )}
            {i < steps.length - 1 && <span className="mh-steps__connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

// Navigation rail ----------------------------------------------------------------------------------------------

export interface NavRailProps {
  items: readonly NavRailItem[];
  footerItems?: readonly NavRailItem[];
  /** Controlled: the selected id. */
  value?: string;
  onChange?: (id: string) => void;
  label?: string;
  expanded?: boolean;
  labels?: 'all' | 'selected' | 'none';
  header?: ReactNode;
  className?: string;
}

/** Same DOM and classes as `createNavRail`; controlled through `value` / `onChange`. */
export function NavRail({ items, footerItems, value = '', onChange, label = 'Main', expanded, labels = 'all', header, className }: NavRailProps) {
  const list = (entries: readonly NavRailItem[], footer: boolean) => (
    <ul className={cx('mh-nav-rail__list', footer && 'mh-nav-rail__list--footer')}>
      {entries.map((item) => {
        const on = item.id === value;
        const badge = item.badge;
        const shown = navRailBadgeShown(badge);
        const content = (
          <>
            <span className="mh-nav-rail__indicator" aria-hidden="true">
              <span className="mh-nav-rail__icon">
                <Icon icon={on && item.iconSelected ? item.iconSelected : item.icon} />
              </span>
              <span className="mh-nav-rail__badge-slot">{shown && <span className={navRailBadgeClass(badge)}>{navRailBadgeText(badge)}</span>}</span>
            </span>
            <span className="mh-nav-rail__label">{item.label}</span>
            {shown && <span className="mh-visually-hidden">{navRailBadgeLabel(badge, item.badgeLabel)}</span>}
          </>
        );
        const ariaCurrent = on ? ('page' as const) : undefined;
        const select = (e: MouseEvent<HTMLElement>): void => {
          if (item.href !== undefined && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return;
          if (!on) onChange?.(item.id);
        };
        return (
          <li key={item.id} className="mh-nav-rail__entry">
            {item.href !== undefined && !item.disabled ? (
              <a className="mh-nav-rail__item" href={item.href} aria-current={ariaCurrent} onClick={select}>
                {content}
              </a>
            ) : item.href !== undefined ? (
              <a className="mh-nav-rail__item" role="link" aria-disabled="true" aria-current={ariaCurrent}>
                {content}
              </a>
            ) : (
              <button type="button" className="mh-nav-rail__item" disabled={item.disabled} aria-current={ariaCurrent} onClick={item.disabled ? undefined : select}>
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
  return (
    <nav className={cx(navRailClass(expanded, labels), className)} aria-label={label}>
      {header !== undefined && header !== null && <div className="mh-nav-rail__header">{header}</div>}
      {list(items, false)}
      {footerItems && footerItems.length > 0 && list(footerItems, true)}
    </nav>
  );
}
