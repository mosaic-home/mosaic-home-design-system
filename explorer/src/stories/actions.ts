import { h } from '../../../src/web/dom.ts';
import { createButton, type ButtonVariant } from '../../../src/web/actions/button.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { mdiFormatAlignCenter, mdiFormatAlignLeft, mdiFormatAlignRight, mdiFormatBold, mdiFormatItalic, mdiFormatUnderline } from '@mdi/js';
import { createButtonGroup, type ButtonGroupHandle, type ButtonGroupItem, type ButtonGroupOptions } from '../../../src/web/actions/buttonGroup.ts';
import { createLink } from '../../../src/web/actions/link.ts';
import { createFavouriteToggle } from '../../../src/web/actions/favouriteToggle.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import type { Story } from './types.ts';

const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tonal', 'text', 'danger'];
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });

/** A group where exactly one item is pressed. */
function single(items: Omit<ButtonGroupItem, 'pressed'>[], value: string, options: Omit<ButtonGroupOptions, 'items' | 'onClick'> = {}): ButtonGroupHandle {
  let current = value;
  const group: ButtonGroupHandle = createButtonGroup({
    ...options,
    items: items.map((i) => ({ ...i, pressed: i.id === value })),
    onClick: (id) => {
      group.setPressed(current, false);
      current = id;
      group.setPressed(id, true);
    },
  });
  return group;
}

export const actionsStories: Story[] = [
  {
    id: 'button',
    render: () =>
      h(
        'div',
        { class: 'ex-stack' },
        row(...VARIANTS.map((variant) => createButton({ label: variant[0]!.toUpperCase() + variant.slice(1), variant }).el)),
        row(createButton({ label: 'Small', size: 'small' }).el, createButton({ label: 'Medium' }).el, createButton({ label: 'Large', size: 'large' }).el),
        row(createButton({ label: 'Turn on', icon: 'power' }).el, createButton({ label: 'Next', variant: 'secondary', trailingIcon: 'arrow-right' }).el),
        row(createButton({ label: 'Saving', loading: true }).el, createButton({ label: 'Disabled', disabled: true }).el),
        createButton({ label: 'Full width', fullWidth: true, variant: 'tonal' }).el,
      ),
  },
  {
    id: 'icon-button',
    render: () =>
      h(
        'div',
        { class: 'ex-stack' },
        row(createIconButton({ icon: 'previous', label: 'Previous' }).el, createIconButton({ icon: 'play', label: 'Play', filled: true, tone: 'accent', size: 'large' }).el, createIconButton({ icon: 'next', label: 'Next' }).el),
        row(createIconButton({ icon: 'settings', label: 'Settings', size: 'small' }).el, createIconButton({ icon: 'heart', label: 'Favourite', pressed: true }).el, createIconButton({ icon: 'delete', label: 'Delete', tone: 'danger' }).el, createIconButton({ icon: 'more', label: 'More', filled: true }).el),
      ),
  },
  {
    id: 'button-group',
    render: () => {
      const styles = new Set<string>(['bold']);
      const format: ButtonGroupHandle = createButtonGroup({
        label: 'Text style',
        toolbar: true,
        items: [
          { id: 'bold', label: 'Bold', icon: mdiFormatBold, iconOnly: true, pressed: true },
          { id: 'italic', label: 'Italic', icon: mdiFormatItalic, iconOnly: true, pressed: false },
          { id: 'underline', label: 'Underline', icon: mdiFormatUnderline, iconOnly: true, pressed: false },
        ],
        onClick: (id) => {
          if (styles.has(id)) styles.delete(id);
          else styles.add(id);
          format.setPressed(id, styles.has(id));
        },
      });
      const alignIcons = [mdiFormatAlignLeft, mdiFormatAlignCenter, mdiFormatAlignRight];
      const align = (['left', 'center', 'right'] as const).map((id, i) => ({ id, label: `Align ${id}`, icon: alignIcons[i]!, iconOnly: true }));
      return h(
        'div',
        { class: 'ex-stack' },
        caption('Actions; a toolbar is one tab stop and the arrow keys move inside it'),
        row(
          createButtonGroup({
            label: 'Playback',
            toolbar: true,
            items: [
              { id: 'prev', label: 'Previous', icon: 'previous', iconOnly: true },
              { id: 'play', label: 'Play', icon: 'play', iconOnly: true },
              { id: 'next', label: 'Next', icon: 'next', iconOnly: true },
            ],
          }).el,
          createButtonGroup({
            label: 'Scene',
            items: [
              { id: 'save', label: 'Save', icon: 'check' },
              { id: 'share', label: 'Share', icon: 'share' },
              { id: 'delete', label: 'Delete', icon: 'delete', disabled: true },
            ],
          }).el,
        ),
        caption('Toggles: several pressed, or exactly one'),
        row(format.el, single(align, 'left', { label: 'Alignment', toolbar: true }).el),
        row(
          single([{ id: 'day', label: 'Day' }, { id: 'week', label: 'Week' }, { id: 'month', label: 'Month' }], 'week', { label: 'Range', size: 'small' }).el,
          single([{ id: 'list', label: 'List' }, { id: 'grid', label: 'Grid' }], 'grid', { label: 'Layout', variant: 'tonal', size: 'small' }).el,
        ),
        caption('Full width and large, and vertical'),
        single([{ id: 'off', label: 'Off', icon: 'power' }, { id: 'eco', label: 'Eco' }, { id: 'comfort', label: 'Comfort', icon: 'thermometer' }], 'eco', { label: 'Heating', fullWidth: true, size: 'large' }).el,
        row(single([{ id: 'living', label: 'Living room' }, { id: 'kitchen', label: 'Kitchen' }, { id: 'bedroom', label: 'Bedroom' }], 'kitchen', { label: 'Room', orientation: 'vertical', toolbar: true }).el),
      );
    },
  },
  {
    id: 'link',
    render: () => {
      const p = (...children: (Node | string)[]): HTMLElement => h('p', { style: 'margin: 0; max-width: 60ch' }, ...children);
      const more = createLink({ text: 'Show three more devices', onClick: () => more.setText('All devices shown') });
      return h(
        'div',
        { class: 'ex-stack' },
        p('The hallway sensor reports every five minutes. ', createLink({ text: 'Change the interval', href: '#link' }).el, ' or ', createLink({ text: 'read how sensors report', href: 'https://example.com/sensors', external: true }).el, '.'),
        p(createText('Muted, for secondary links: ', { as: 'span', tone: 'muted' }), createLink({ text: 'Privacy', href: '#link', tone: 'muted' }).el, ' · ', createLink({ text: 'Licences', href: '#link', tone: 'muted' }).el),
        h('div', { class: 'mh-alert mh-alert--warning', role: 'note' }, h('div', { class: 'mh-alert__body' }, p('Inherit takes the colour around it: ', createLink({ text: 'update the firmware', href: '#link', tone: 'inherit' }).el, ' to fix this.'))),
        p('Underline on hover only: ', createLink({ text: 'Living room', href: '#link', underline: 'hover', icon: 'home' }).el),
        p('An action styled as a link (a button): ', more.el),
      );
    },
  },
  {
    id: 'favourite-toggle',
    render: () => {
      const note = createText('Kitchen light is a favourite', { variant: 'label', tone: 'muted' });
      return h(
        'div',
        { class: 'ex-stack' },
        row(
          createFavouriteToggle({ size: 'small' }).el,
          createFavouriteToggle({ pressed: true, label: 'Favourite: Kitchen light', onChange: (on) => (note.textContent = on ? 'Kitchen light is a favourite' : 'Kitchen light is not a favourite') }).el,
          createFavouriteToggle({ size: 'large', label: 'Favourite scene' }).el,
          createFavouriteToggle({ disabled: true }).el,
        ),
        note,
        row(createFavouriteToggle({ showLabel: true }).el, createFavouriteToggle({ showLabel: true, pressed: true, label: 'Pinned', size: 'small' }).el),
      );
    },
  },
];
