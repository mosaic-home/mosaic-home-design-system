// navigation group: web components.
export { createPageHeader, pageHeaderBackClass, type PageHeaderBack, type PageHeaderHandle, type PageHeaderOptions } from './pageHeader.ts';
export { createTabs, selectedTab, tabsClass, tabsKeyTarget, type TabItem, type TabsHandle, type TabsOptions, type TabsVariant } from './tabs.ts';
export {
  DOCUMENT_TAB_DIRTY_TEXT,
  createDocumentTabs,
  documentTabClass,
  documentTabsAfterClose,
  type DocumentTab,
  type DocumentTabsHandle,
  type DocumentTabsOptions,
} from './documentTabs.ts';
export {
  createMenuBar,
  isMenuBarItem,
  menuBarItemClass,
  menuBarKeyShortcuts,
  menuBarMoveTarget,
  type MenuBarEntry,
  type MenuBarHandle,
  type MenuBarItem,
  type MenuBarMenu,
  type MenuBarOptions,
  type MenuBarSeparator,
} from './menuBar.ts';
export { breadcrumbMoreLabel, breadcrumbSlots, createBreadcrumbs, type BreadcrumbItem, type BreadcrumbSlot, type BreadcrumbsHandle, type BreadcrumbsOptions } from './breadcrumbs.ts';
export {
  createPagination,
  paginationClass,
  paginationCompactText,
  paginationPageLabel,
  paginationSlots,
  type PaginationHandle,
  type PaginationOptions,
  type PaginationSlot,
  type PaginationVariant,
} from './pagination.ts';
export { STEP_STATE_TEXT, createSteps, stepClass, stepState, stepsClass, type StepItem, type StepState, type StepsHandle, type StepsOptions, type StepsOrientation } from './steps.ts';
export {
  createNavRail,
  navRailBadgeClass,
  navRailBadgeLabel,
  navRailBadgeShown,
  navRailBadgeText,
  navRailClass,
  type NavRailBadge,
  type NavRailHandle,
  type NavRailItem,
  type NavRailOptions,
} from './navRail.ts';
