import {
  createButton,
  createCurvesEditor,
  createText,
  curveLut,
  type CurvePoint,
} from '@mosaic-home/design-system/web';

const start: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 0.25, y: 0.2 },
  { x: 0.75, y: 0.82 },
  { x: 1, y: 1 },
];

const readout = createText('', { variant: 'caption', tone: 'muted' });
const show = (points: readonly CurvePoint[]): void => {
  const midtones = curveLut(points, 3)[1] ?? 0.5;
  readout.textContent = `${points.length} points · midtones ${Math.round(midtones * 255)}`;
};

const curves = createCurvesEditor({ points: start, label: 'Tone curve', onChange: show });
show(start);

const reset = createButton({
  label: 'Reset',
  variant: 'secondary',
  size: 'small',
  onClick: () => {
    curves.setPoints(start);
    show(start);
  },
});

document.body.append(curves.el, readout, reset.el);
