import { createBarChart, createButton, type BarChartOptions } from '@mosaic-home/design-system/web';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeks = {
  this: [6.2, 5.8, 7.4, 4.9, 6.6, 8.1, 7.2],
  last: [5.9, 6.4, 6.1, 5.2, 7.0, 7.7, 6.8],
};

const options = (week: keyof typeof weeks): BarChartOptions => ({
  bars: weeks[week].map((value, i) => ({ label: days[i]!, value })),
  label: week === 'this' ? 'Energy used per day this week' : 'Energy used per day last week',
  showValues: true,
  highlight: week === 'this' ? 6 : undefined,
  format: (v) => `${v.toFixed(1)} kWh`,
});

let week: keyof typeof weeks = 'this';
const chart = createBarChart(options(week));
const toggle = createButton({
  label: 'Show last week',
  variant: 'secondary',
  size: 'small',
  onClick: () => {
    week = week === 'this' ? 'last' : 'this';
    chart.update(options(week));
    toggle.setLabel(week === 'this' ? 'Show last week' : 'Show this week');
  },
});

document.body.append(chart.el, toggle.el);
