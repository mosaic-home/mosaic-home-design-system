import { h } from '../../../src/web/dom.ts';
import { createButton } from '../../../src/web/actions/button.ts';
import { createBarChart, type BarDatum } from '../../../src/web/charts/barChart.ts';
import { createCurvesEditor, curveLut, type CurvePoint } from '../../../src/web/charts/curvesEditor.ts';
import { createHistogram, type HistogramData } from '../../../src/web/charts/histogram.ts';
import { createLevelMeter } from '../../../src/web/charts/levelMeter.ts';
import { createMeter } from '../../../src/web/charts/meter.ts';
import { createMonthGrid } from '../../../src/web/charts/monthGrid.ts';
import { createSparkline, type SparklineColor } from '../../../src/web/charts/sparkline.ts';
import { createTrend } from '../../../src/web/charts/trend.ts';
import { createWaveform, waveformTime, type WaveformStyle } from '../../../src/web/charts/waveform.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import type { Story } from './types.ts';

const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });

const TEMPERATURE = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 22.3, 22.1, 21.7, 21.5];
const POWER = [120, 340, 280, 90, 60, null, null, 75, 410, 520, 380, 210, 260];
const COLORS: SparklineColor[] = [1, 2, 3, 4, 5, 6];

/** A repeatable pseudo-random sequence, so the demo data looks the same on every visit. */
function random(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296;
    return x / 4294967296;
  };
}
const kwh = (v: number): string => `${v.toFixed(1)} kWh`;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const week = (values: (number | null)[]): BarDatum[] => values.map((value, i) => ({ label: DAYS[i]!.slice(0, 3), name: DAYS[i]!, value }));
/** Loudness of an invented voice clip: syllables with pauses. */
function speech(n: number, seed: number): number[] {
  const rnd = random(seed);
  return Array.from({ length: n }, (_, i) => {
    const syllable = Math.abs(Math.sin(i / 2.3)) * (0.55 + 0.45 * rnd());
    const pause = i % 23 > 19 ? 0.1 : 1;
    return Math.round(Math.max(0.03, syllable * pause) * 100) / 100;
  });
}
/** A smooth invented histogram: a mix of bumps over 64 bins, with optional extra counts in the end bins. */
function bumps(parts: [centre: number, width: number, height: number][], ends: [number, number] = [0, 0]): number[] {
  return Array.from({ length: 64 }, (_, i) => {
    const x = i / 63;
    const v = parts.reduce((a, [c, w, ht]) => a + ht * Math.exp(-((x - c) ** 2) / (2 * w * w)), 0);
    return Math.round(v * 1000 + (i === 0 ? ends[0] : i === 63 ? ends[1] : 0));
  });
}
const wave = (phase: number): number[] => Array.from({ length: 24 }, (_, i) => Math.round(50 + 30 * Math.sin(i / 3 + phase) + 10 * Math.sin(i + phase * 2)));

export const chartsStories: Story[] = [
  {
    id: 'sparkline',
    render: () =>
      stack(
        caption('Living room temperature, last 15 hours (area)'),
        createSparkline({ values: TEMPERATURE, label: 'Living room temperature', area: true, size: 'large', format: (v) => `${v}°` }).el,
        caption('Kitchen power with a gap in the data'),
        createSparkline({ values: POWER, label: 'Kitchen power', color: 2, format: (v) => `${v} W` }).el,
        caption('Fixed scale 0 to 100: battery 82%'),
        createSparkline({ values: [100, 97, 95, 92, 90, 88, 85, 82], label: 'Battery', color: 3, min: 0, max: 100, size: 'small' }).el,
        caption('Series colours'),
        h('div', { class: 'mh-grid mh-grid--sm' }, ...COLORS.map((color, i) => createSparkline({ values: wave(i), label: `Series ${color}`, color, area: i % 2 === 0, size: 'small' }).el)),
      ),
  },
  {
    id: 'trend',
    render: () => {
      const one = (v: number): string => v.toFixed(1);
      const humidity = [52, 51, 50, 49, 49, 48, 47, 47, 46, 46, 47, 46];
      return h(
        'div',
        { class: 'mh-grid' },
        createCard({
          title: 'Living room',
          body: [
            createTrend({ name: 'Temperature', value: 21.5, unit: '°C', values: TEMPERATURE, range: '18.8–22.3 °C over 15 h', format: one }).el,
            createTrend({ name: 'Humidity', value: 46, unit: '%', values: humidity, color: 3 }).el,
            createTrend({ name: 'Power', value: 260, unit: 'W', values: POWER, color: 2 }).el,
          ],
        }).el,
        createCard({
          title: 'No data',
          body: [createTrend({ name: 'Outdoor temperature', value: null, unit: '°C', values: [], color: 4 }).el, createTrend({ name: 'Water used', value: 0, unit: 'L', values: [0, 0, 0, 0], color: 5 }).el],
        }).el,
      );
    },
  },
  {
    id: 'bar-chart',
    render: () => {
      const rnd = random(7);
      const hours: BarDatum[] = Array.from({ length: 24 }, (_, i) => ({
        label: String(i).padStart(2, '0'),
        name: `${i}:00`,
        value: Math.round((0.2 + (i > 6 && i < 9 ? 1.4 : 0) + (i > 17 && i < 22 ? 1.8 : 0) + rnd() * 0.4) * 10) / 10,
      }));
      const one = (v: number): string => v.toFixed(1);
      const live = createBarChart({ bars: week([6.2, 5.8, 7.4, 4.9, 6.6, 8.1, 7.2]), label: 'Energy used per day', showValues: true, highlight: 6, format: one });
      const shuffle = createButton({
        label: 'New week',
        variant: 'secondary',
        size: 'small',
        onClick: () => live.update({ bars: week(DAYS.map(() => Math.round((3 + rnd() * 6) * 10) / 10)), label: 'Energy used per day', showValues: true, highlight: Math.floor(rnd() * 7), format: one }),
      });
      return h(
        'div',
        { class: 'mh-grid' },
        createCard({ title: 'Energy this week', subtitle: 'Today stands out, values above the columns', body: [live.el, h('div', { class: 'ex-row' }, shuffle.el)] }).el,
        createCard({ title: 'Power by hour', subtitle: 'Every third label is shown', body: [createBarChart({ bars: hours, label: 'Energy by hour today', color: 2, format: kwh }).el] }).el,
        createCard({
          title: 'Net grid use',
          subtitle: 'Negative values hang below zero, colours per column',
          body: [
            createBarChart({
              bars: [4.1, 2.2, -1.8, -3.4, -0.6, 1.9, 3.3].map((v, i) => ({ label: DAYS[i]!.slice(0, 1), name: DAYS[i]!, value: v, color: v < 0 ? 3 : 1 })),
              label: 'Net grid use per day',
              showValues: true,
              format: one,
            }).el,
          ],
        }).el,
        createCard({
          title: 'Sizes and gaps',
          body: [
            caption('Small, no axis, a missing day'),
            createBarChart({ bars: week([3, 4, null, 5, 2, 6, 4]), label: 'Water used', size: 'small', axis: false, color: 4 }).el,
            caption('Large, fixed 0–100 scale'),
            createBarChart({
              bars: ['Hall', 'Kitchen', 'Office', 'Bedroom'].map((label, i) => ({ label, value: [82, 45, 67, 23][i]! })),
              label: 'Battery level of sensors',
              size: 'large',
              min: 0,
              max: 100,
              color: 5,
              showValues: true,
              format: (v) => `${v}%`,
            }).el,
          ],
        }).el,
      );
    },
  },
  {
    id: 'month-grid',
    render: () => {
      const rnd = random(11);
      const energy = Array.from({ length: 31 }, (_, i) => (i > 24 ? null : Math.round((4 + rnd() * 5 + (i % 7 > 4 ? 2 : 0)) * 10) / 10));
      const rain = Array.from({ length: 30 }, () => (rnd() > 0.55 ? Math.round(rnd() * 120) / 10 : 0));
      return h(
        'div',
        { class: 'mh-grid' },
        createCard({
          title: 'Energy per day',
          subtitle: 'Week starts Monday, today outlined, no data after today',
          body: [createMonthGrid({ year: 2026, month: 3, values: energy, label: 'Energy used per day', today: 25, format: kwh }).el],
        }).el,
        createCard({
          title: 'Rainfall',
          subtitle: 'Six steps, fixed 0–12 mm scale, week starts Sunday',
          body: [createMonthGrid({ year: 2026, month: 4, values: rain, label: 'Rainfall per day', color: 3, steps: 6, min: 0, max: 12, weekStart: 0, format: (v) => `${v} mm` }).el],
        }).el,
        createCard({
          title: 'Compact',
          body: [createMonthGrid({ year: 2026, month: 2, values: Array.from({ length: 28 }, (_, i) => (i * 7) % 11), label: 'Hours of heating', color: 6, size: 'small', caption: 'February', format: (v) => `${v} h` }).el],
        }).el,
      );
    },
  },
  {
    id: 'meter',
    render: () => {
      let level = 64;
      const noise = createMeter({ value: level, label: 'Noise level', zones: { warning: 70, danger: 90 }, segments: 12, valueText: `${level} dB`, size: 'large' });
      const nudge = (d: number) => (): void => {
        level = Math.max(0, Math.min(100, level + d));
        noise.setValue(level, `${level} dB`);
      };
      return stack(
        caption('Level with zones by LED: noise'),
        noise.el,
        h(
          'div',
          { class: 'ex-row' },
          createButton({ label: 'Quieter', variant: 'secondary', size: 'small', onClick: nudge(-8) }).el,
          createButton({ label: 'Louder', variant: 'secondary', size: 'small', onClick: nudge(8) }).el,
        ),
        caption('Coloured by value, low is bad: batteries at 82%, 24% and 8%'),
        ...[82, 24, 8].map((v) => createMeter({ value: v, label: 'Battery', segments: 5, zones: { warning: 30, danger: 10 }, colorBy: 'value', valueText: `${v}%` }).el),
        caption('Bars: signal strength 0 to 4'),
        h('div', { class: 'ex-row' }, ...[0, 1, 2, 3, 4].map((v) => createMeter({ value: v, max: 4, mode: 'bars', label: 'Wi-Fi signal', valueText: `${v} of 4 bars` }).el)),
        caption('Sizes, vertical and series colours'),
        h(
          'div',
          { class: 'ex-row' },
          createMeter({ value: 3, max: 4, mode: 'bars', label: 'Signal', size: 'small', color: 2 }).el,
          createMeter({ value: 2, max: 5, segments: 5, mode: 'bars', label: 'Signal', color: 3 }).el,
          createMeter({ value: 4, max: 4, mode: 'bars', label: 'Signal', size: 'large', color: 4 }).el,
          createMeter({ value: 60, label: 'Fan speed', vertical: true, color: 5 }).el,
          createMeter({ value: 30, label: 'Tank level', vertical: true, segments: 6, color: 6 }).el,
        ),
        createMeter({ value: 40, label: 'Volume', size: 'small', segments: 20, color: 1 }).el,
      );
    },
  },
  {
    id: 'level-meter',
    render: () => {
      const stereo = createLevelMeter({ levels: [-60, -60], channels: ['L', 'R'], label: 'Speaker output', scale: true });
      const tall = createLevelMeter({ levels: [-60, -60], channels: ['L', 'R'], label: 'Speaker output', orientation: 'vertical', segmented: true, scale: true });
      const mic = createLevelMeter({ levels: [-60], label: 'Microphone level', segmented: true, size: 'large' });
      const rnd = random(5);
      let t = 0;
      const timer = window.setInterval(() => {
        if (!stereo.el.isConnected && t > 0) return window.clearInterval(timer);
        t += 1;
        const base = -18 + 10 * Math.sin(t / 9) + (t % 40 === 0 ? 17 : 0);
        const l = Math.min(0, base + rnd() * 8);
        const r = Math.min(0, base - 3 + rnd() * 8);
        stereo.setLevels([l, r]);
        tall.setLevels([l, r]);
        mic.setLevels([t % 60 > 40 ? -Infinity : -30 + rnd() * 20]);
      }, 60);
      return stack(
        caption('Stereo with peak hold and a dB scale'),
        stereo.el,
        caption('Segmented, large, one channel'),
        mic.el,
        caption('Vertical'),
        h('div', { class: 'ex-row' }, tall.el, createLevelMeter({ levels: [-9], peaks: [0], label: 'Clipped input', orientation: 'vertical', size: 'small' }).el),
        caption('Still: −12 dB with a peak at −3 dB'),
        createLevelMeter({ levels: [-12], peaks: [-3], label: 'Line input', size: 'small' }).el,
      );
    },
  },
  {
    id: 'waveform',
    render: () => {
      const duration = 47;
      const clip = speech(72, 3);
      let playing = false;
      let pos = 0;
      const time = createText(`0:00 / ${waveformTime(duration)}`, { variant: 'label', tone: 'muted' });
      const showTime = (): void => {
        time.textContent = `${waveformTime(pos)} / ${waveformTime(duration)}`;
      };
      const voice = createWaveform({
        peaks: clip,
        label: 'Voice message',
        duration,
        position: 0,
        onSeek: (s) => {
          pos = s;
          showTime();
        },
      });
      const play = createButton({
        label: 'Play',
        icon: 'play',
        size: 'small',
        onClick: () => {
          playing = !playing;
          play.setLabel(playing ? 'Pause' : 'Play');
        },
      });
      const timer = window.setInterval(() => {
        if (!voice.el.isConnected && pos > 0) return window.clearInterval(timer);
        if (!playing) return;
        pos = pos + 0.25 >= duration ? 0 : pos + 0.25;
        voice.setPosition(pos);
        showTime();
      }, 250);
      const hint = 'Drag across it to select a part';
      const selected = createText(hint, { variant: 'label', tone: 'muted' });
      const editor = createWaveform({
        peaks: speech(160, 9),
        label: 'Doorbell recording',
        style: 'envelope',
        duration: 12,
        position: 3,
        selection: { start: 5, end: 8.5 },
        color: 2,
        size: 'large',
        onSeek: () => {},
        onSelect: (s) => {
          selected.textContent = s ? `Selected ${s.start.toFixed(1)} s to ${s.end.toFixed(1)} s` : hint;
        },
      });
      const styles: WaveformStyle[] = ['bars', 'half', 'envelope', 'line', 'dots'];
      return stack(
        caption('Voice message: click, drag or use the arrow keys to seek'),
        h('div', { class: 'ex-row' }, play.el, time),
        voice.el,
        caption('Selectable: drag, or Shift + arrow keys; Escape clears'),
        editor.el,
        selected,
        caption('Five styles, played up to 40%'),
        ...styles.flatMap((style, i) => [
          caption(style),
          createWaveform({ peaks: speech(style === 'line' ? 120 : 56, 20 + i), label: `Chime, ${style}`, style, duration: 10, position: 4, color: COLORS[i % COLORS.length] }).el,
        ]),
        caption('Static, small'),
        createWaveform({ peaks: speech(40, 2), label: 'Chime', size: 'small' }).el,
      );
    },
  },
  {
    id: 'histogram',
    render: () => {
      const evening: HistogramData = { luminance: bumps([[0.18, 0.08, 1], [0.55, 0.12, 0.45], [0.9, 0.03, 0.2]], [900, 0]) };
      const rgb: HistogramData = {
        red: bumps([[0.62, 0.14, 0.8], [0.2, 0.06, 0.3]]),
        green: bumps([[0.48, 0.12, 0.9]]),
        blue: bumps([[0.32, 0.1, 0.7], [0.85, 0.05, 0.25]], [0, 400]),
      };
      return h(
        'div',
        { class: 'mh-grid' },
        createCard({ title: 'Luminance', subtitle: 'A dark scene with clipped shadows', body: [createHistogram({ data: evening, label: 'Camera snapshot histogram' }).el] }).el,
        createCard({ title: 'RGB', subtitle: 'Colour channels overlap, clipped highlights in blue', body: [createHistogram({ data: rgb, label: 'Camera snapshot histogram' }).el] }).el,
        createCard({
          title: 'All channels and scales',
          subtitle: 'Linear, square root and log height',
          body: [
            createHistogram({ data: { luminance: bumps([[0.5, 0.15, 1]]), ...rgb }, label: 'All channels', size: 'small' }).el,
            createHistogram({ data: evening, label: 'Square root scale', scale: 'sqrt', size: 'small' }).el,
            createHistogram({ data: evening, label: 'Log scale', scale: 'log', size: 'small' }).el,
          ],
        }).el,
      );
    },
  },
  {
    id: 'curves-editor',
    render: () => {
      const start: CurvePoint[] = [
        { x: 0, y: 0 },
        { x: 0.25, y: 0.2 },
        { x: 0.75, y: 0.82 },
        { x: 1, y: 1 },
      ];
      const readout = createText('', { variant: 'label', tone: 'muted' });
      const show = (points: readonly CurvePoint[]): void => {
        const lut = curveLut(points, 5);
        readout.textContent = `${points.length} points · shadows ${Math.round(lut[1]! * 255)}, midtones ${Math.round(lut[2]! * 255)}, highlights ${Math.round(lut[3]! * 255)}`;
      };
      const editor = createCurvesEditor({ points: start, label: 'Tone curve', histogram: bumps([[0.3, 0.12, 1], [0.7, 0.1, 0.6]]), onChange: show });
      show(start);
      const reset = createButton({
        label: 'Reset',
        variant: 'secondary',
        size: 'small',
        onClick: () => {
          editor.setPoints(start);
          show(start);
        },
      });
      return h(
        'div',
        { class: 'mh-grid' },
        createCard({
          title: 'Tone curve',
          subtitle: 'Drag points, press an empty spot to add one, double-click or Delete removes, arrows nudge',
          body: [editor.el, readout, h('div', { class: 'ex-row' }, reset.el)],
        }).el,
        createCard({
          title: 'Channels',
          body: [
            h(
              'div',
              { class: 'mh-grid mh-grid--sm' },
              createCurvesEditor({ points: [{ x: 0, y: 0.08 }, { x: 0.5, y: 0.56 }, { x: 1, y: 1 }], label: 'Red curve', channel: 'red', size: 'small' }).el,
              createCurvesEditor({ points: [{ x: 0, y: 0 }, { x: 1, y: 0.92 }], label: 'Green curve', channel: 'green', size: 'small' }).el,
              createCurvesEditor({ points: [{ x: 0, y: 0 }, { x: 0.4, y: 0.32 }, { x: 1, y: 1 }], label: 'Blue curve', channel: 'blue', size: 'small' }).el,
              createCurvesEditor({ points: start, label: 'Locked curve', disabled: true, size: 'small' }).el,
            ),
          ],
        }).el,
      );
    },
  },
];
