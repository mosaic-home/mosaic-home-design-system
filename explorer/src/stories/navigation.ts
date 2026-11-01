import { h } from '../../../src/web/dom.ts';
import { createButton } from '../../../src/web/actions/button.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createPageHeader } from '../../../src/web/navigation/pageHeader.ts';
import { createTabs } from '../../../src/web/navigation/tabs.ts';
import { createBreadcrumbs } from '../../../src/web/navigation/breadcrumbs.ts';
import { createDocumentTabs, type DocumentTabsHandle } from '../../../src/web/navigation/documentTabs.ts';
import { createMenuBar, type MenuBarMenu } from '../../../src/web/navigation/menuBar.ts';
import { createNavRail } from '../../../src/web/navigation/navRail.ts';
import { createPagination } from '../../../src/web/navigation/pagination.ts';
import { createSteps } from '../../../src/web/navigation/steps.ts';
import type { Story } from './types.ts';

const panel = (text: string): HTMLElement => h('p', { class: 'mh-text--muted', style: 'margin: 0' }, text);
const label = (text: string): HTMLElement => h('span', { class: 'ex-meta' }, text);

export const navigationStories: Story[] = [
  {
    id: 'tabs',
    render: () =>
      h(
        'div',
        { class: 'ex-stack' },
        label('underline'),
        createTabs({
          label: 'Sections',
          tabs: [
            { id: 'overview', label: 'Overview', panel: panel('Everything at a glance.') },
            { id: 'activity', label: 'Activity', badge: 3, panel: panel('What changed recently.') },
            { id: 'schedules', label: 'Schedules', panel: panel('When things happen on their own.') },
            { id: 'archived', label: 'Archived', disabled: true, panel: panel('Nothing here.') },
          ],
        }).el,
        label('pill, with icons'),
        createTabs({
          variant: 'pill',
          label: 'View',
          value: 'list',
          tabs: [
            { id: 'grid', label: 'Grid', icon: 'home' },
            { id: 'list', label: 'List', icon: 'menu' },
            { id: 'calendar', label: 'Calendar', icon: 'calendar' },
          ],
        }).el,
        label('pill, fill, manual activation'),
        createTabs({
          variant: 'pill',
          fill: true,
          activation: 'manual',
          label: 'Period',
          tabs: [
            { id: 'day', label: 'Day', panel: panel('Today, hour by hour.') },
            { id: 'week', label: 'Week', panel: panel('The last seven days.') },
            { id: 'month', label: 'Month', panel: panel('This month so far.') },
          ],
        }).el,
      ),
  },
  {
    id: 'page-header',
    render: () =>
      h(
        'div',
        { class: 'ex-stack', style: 'gap: var(--mh-space-xl)' },
        createPageHeader({
          eyebrow: 'Settings',
          title: 'Display',
          subtitle: 'Brightness, sleep and what shows while idle.',
          back: { onClick: () => undefined },
          actions: [createIconButton({ icon: 'search', label: 'Search settings' }).el, createButton({ label: 'Save', size: 'small' }).el],
        }).el,
        createPageHeader({ title: 'Good evening', subtitle: 'Three things need your attention.' }).el,
        createPageHeader({ eyebrow: 'Section', title: 'A second-level header', level: 2, actions: [createButton({ label: 'Add', icon: 'add', variant: 'tonal', size: 'small' }).el] }).el,
      ),
  },
  {
    id: 'document-tabs',
    render: () => {
      const status = panel('Editing Evening.yaml');
      let n = 0;
      const warned = new Set<string>();
      const tabs: DocumentTabsHandle = createDocumentTabs({
        label: 'Open files',
        value: 'evening',
        tabs: [
          { id: 'morning', label: 'Morning.yaml', icon: 'edit', title: 'Scenes / Morning.yaml' },
          { id: 'evening', label: 'Evening.yaml', icon: 'edit', dirty: true },
          { id: 'away', label: 'Away mode.yaml', icon: 'edit' },
          { id: 'readme', label: 'Read me', icon: 'info', closable: false },
        ],
        onChange: (id) => (status.textContent = `Editing ${id}`),
        onClose: (id) => {
          // A tab with unsaved changes asks once: the second press discards.
          if (tabs.el.querySelector(`[data-id="${id}"].is-dirty`) && !warned.has(id)) {
            warned.add(id);
            status.textContent = 'Unsaved changes: press close again to discard them';
            return false;
          }
          return true;
        },
        onAdd: () => {
          n += 1;
          status.textContent = `New file ${n} would open here`;
        },
      });
      return h(
        'div',
        { class: 'ex-stack' },
        label('the dot marks unsaved changes; hover or focus shows the close button; Delete closes the focused tab'),
        tabs.el,
        status,
        h('div', { class: 'ex-row' }, createButton({ label: 'Toggle unsaved on Morning', size: 'small', variant: 'secondary', onClick: () => tabs.setDirty('morning', !tabs.el.querySelector('[data-id="morning"].is-dirty')) }).el),
      );
    },
  },
  {
    id: 'menu-bar',
    render: () => {
      const status = panel('Choose a command: click a menu, or Tab to the bar and use the arrow keys.');
      const menus: MenuBarMenu[] = [
        {
          label: 'File',
          items: [
            { value: 'new', label: 'New dashboard', icon: 'add', shortcut: 'Ctrl+N' },
            { value: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
            {
              value: 'recent',
              label: 'Open recent',
              items: [
                { value: 'recent-1', label: 'Living room wall' },
                { value: 'recent-2', label: 'Kitchen tablet' },
                { value: 'recent-3', label: 'Bedside display' },
              ],
            },
            { separator: true },
            { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
            { value: 'export', label: 'Export', icon: 'download', shortcut: 'Ctrl+Shift+E' },
            { separator: true },
            { value: 'delete', label: 'Delete dashboard', icon: 'delete', danger: true },
          ],
        },
        {
          label: 'Edit',
          items: [
            { value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
            { value: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
            { separator: true },
            { value: 'copy', label: 'Copy', icon: 'copy', shortcut: 'Ctrl+C' },
            { value: 'paste', label: 'Paste', shortcut: 'Ctrl+V' },
          ],
        },
        {
          label: 'View',
          items: [
            { value: 'grid', label: 'Show grid', checked: true },
            { value: 'names', label: 'Show entity names', checked: false },
            { separator: true },
            { value: 'zoom', label: 'Zoom', items: [{ value: 'zoom-in', label: 'Zoom in', shortcut: 'Ctrl++' }, { value: 'zoom-out', label: 'Zoom out', shortcut: 'Ctrl+-' }, { value: 'zoom-reset', label: 'Actual size', shortcut: 'Ctrl+0' }] },
          ],
        },
        { label: 'Help', items: [{ value: 'shortcuts', label: 'Keyboard shortcuts', icon: 'keyboard' }, { value: 'about', label: 'About', icon: 'info' }] },
      ];
      const bar = createMenuBar({ menus, label: 'Dashboard editor', onSelect: (value, checked) => (status.textContent = checked === undefined ? `Chose ${value}` : `${value}: ${checked ? 'on' : 'off'}`) });
      return h('div', { class: 'ex-stack', style: 'min-height: 22rem; align-content: start' }, bar.el, status);
    },
  },
  {
    id: 'breadcrumbs',
    render: () =>
      h(
        'div',
        { class: 'ex-stack' },
        label('full trail'),
        createBreadcrumbs({
          items: [{ label: 'Home', href: '#', icon: 'home' }, { label: 'Ground floor', href: '#' }, { label: 'Kitchen', href: '#' }, { label: 'Ceiling light' }],
        }).el,
        label('collapsed: press … to show the rest'),
        createBreadcrumbs({
          maxItems: 3,
          items: [{ label: 'Settings', href: '#', icon: 'settings' }, { label: 'Devices', href: '#' }, { label: 'Hallway', href: '#' }, { label: 'Motion sensor', href: '#' }, { label: 'Sensitivity' }],
        }).el,
      ),
  },
  {
    id: 'pagination',
    render: () => {
      const status = panel('Page 4 of 24');
      return h(
        'div',
        { class: 'ex-stack' },
        label('pages with ellipses'),
        createPagination({ count: 24, page: 4, onChange: (p) => (status.textContent = `Page ${p} of 24`) }).el,
        status,
        label('few pages'),
        createPagination({ count: 5, page: 2 }).el,
        label('two siblings, two at each end'),
        createPagination({ count: 60, page: 30, siblings: 2, boundaries: 2 }).el,
        label('compact, for watches and narrow panels'),
        createPagination({ count: 12, page: 3, variant: 'compact' }).el,
      );
    },
  },
  {
    id: 'steps',
    render: () => {
      const setup = [
        { label: 'Connect', description: 'Power on the display' },
        { label: 'Network', description: 'Wi-Fi and password' },
        { label: 'Home', description: 'Find your home' },
        { label: 'Rooms', description: 'Pick what shows', optional: true },
        { label: 'Done' },
      ];
      let current = 2;
      const go = (i: number): void => {
        current = Math.max(0, Math.min(setup.length, i));
        steps.setCurrent(current);
      };
      const steps = createSteps({ steps: setup, current, label: 'Setup', onSelect: go });
      return h(
        'div',
        { class: 'ex-stack', style: 'gap: var(--mh-space-lg)' },
        label('horizontal; completed steps go back when pressed; narrow screens keep only the current label'),
        steps.el,
        h(
          'div',
          { class: 'ex-row' },
          createButton({ label: 'Back', size: 'small', variant: 'secondary', onClick: () => go(current - 1) }).el,
          createButton({ label: 'Next', size: 'small', onClick: () => go(current + 1) }).el,
        ),
        label('vertical, with an error'),
        createSteps({
          orientation: 'vertical',
          current: 1,
          steps: [
            { label: 'Download update', description: '24 MB' },
            { label: 'Verify', description: 'The checksum did not match. Try again.', error: true },
            { label: 'Install' },
            { label: 'Restart' },
          ],
        }).el,
      );
    },
  },
  {
    id: 'nav-rail',
    render: () => {
      const items = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'rooms', label: 'Rooms', icon: 'lightbulb' },
        { id: 'media', label: 'Media', icon: 'music', badge: 'dot' as const, badgeLabel: 'something new' },
        { id: 'cameras', label: 'Cameras', icon: 'camera' },
        { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 3, badgeLabel: '3 new' },
      ];
      const footerItems = [{ id: 'settings', label: 'Settings', icon: 'settings' }];
      const frame = (child: HTMLElement): HTMLElement =>
        h('div', { style: 'height: 32rem; display: flex; border: var(--mh-border-width) solid var(--mh-panel-outline); border-radius: var(--mh-radius-lg); background: var(--mh-surface)' }, child);
      let wide = false;
      const toggle = (): void => {
        wide = !wide;
        rail.setExpanded(wide);
      };
      const rail = createNavRail({ items, footerItems, value: 'home', label: 'Sections', header: createIconButton({ icon: 'menu', label: 'Expand navigation', onClick: toggle }).el });
      return h(
        'div',
        { class: 'ex-row', style: 'align-items: flex-start' },
        h('div', { class: 'ex-stack' }, label('labels; the menu button expands it'), frame(rail.el)),
        h('div', { class: 'ex-stack' }, label('selected label only'), frame(createNavRail({ items, footerItems, value: 'rooms', labels: 'selected', label: 'Sections, compact' }).el)),
        h('div', { class: 'ex-stack' }, label('expanded'), frame(createNavRail({ items, footerItems, value: 'alerts', expanded: true, label: 'Sections, expanded' }).el)),
      );
    },
  },
];
