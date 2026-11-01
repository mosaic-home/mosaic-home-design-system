import { createTransformFields, h, type TransformValue } from '@mosaic-home/design-system/web';

const box = h('div', { style: 'position: absolute; border: 2px solid var(--mh-accent)' });
const canvas = h('div', { style: 'position: relative; width: 280px; height: 200px; background: var(--mh-input)' }, box);

const draw = ({ x, y, width, height, angle }: TransformValue): void => {
  Object.assign(box.style, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${angle}deg)`,
  });
};

const value: TransformValue = { x: 40, y: 30, width: 120, height: 80, angle: 12 };
const fields = createTransformFields({ label: 'Picture frame', value, onChange: draw });

draw(value);
document.body.append(fields.el, canvas);
