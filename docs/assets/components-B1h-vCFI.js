import{$i as e,$n as t,$r as n,$t as r,A as i,Ai as a,An as o,Ar as s,At as c,B as l,Bi as u,Bn as d,Br as f,Bt as p,C as m,Ci as h,Cr as g,Ct as _,D as v,Di as y,Dn as b,Dr as x,Dt as S,E as C,En as w,Er as T,Et as E,F as D,Fi as O,Fn as k,Fr as A,Ft as j,G as M,Gn as N,Gr as ee,Gt as te,H as P,Hi as ne,Hn as re,Hr as ie,Ht as F,I as ae,Ii as oe,In as se,Ir as ce,It as le,Ji as ue,Jn as de,Jr as fe,K as I,Ki as pe,Kn as me,Kr as he,Kt as ge,L as _e,Li as ve,Ln as ye,Lr as be,Lt as xe,M as L,Mi as Se,Mn as Ce,Mr as we,Mt as Te,N as Ee,Ni as De,Nn as Oe,Nr as ke,Nt as Ae,O as je,Oi as Me,On as Ne,Ot as Pe,P as Fe,Pi as Ie,Pn as Le,Pr as Re,Pt as ze,Q as Be,Qi as Ve,Qn as He,Qr as Ue,Qt as We,R as Ge,Ri as Ke,Rn as qe,Rr as Je,Rt as Ye,S as R,Si as Xe,Sn as Ze,Sr as Qe,St as $e,T as et,Ti as tt,Tn as nt,Tt as rt,U as it,Ui as at,Un as ot,Ur as st,Ut as ct,V as z,Vi as lt,Vn as ut,Vt as dt,W as B,Wi as ft,Wn as pt,Wr as mt,X as ht,Xi as gt,Xn as _t,Xr as vt,Xt as yt,Y as bt,Yi as xt,Yn as St,Yr as Ct,Yt as wt,Zn as Tt,Zr as Et,Zt as Dt,_ as Ot,_a as kt,_i as At,_n as jt,_r as Mt,_t as Nt,ai as Pt,ar as Ft,b as It,ba as Lt,bi as Rt,bn as zt,br as Bt,bt as Vt,c as Ht,ci as Ut,cn as Wt,cr as Gt,ct as Kt,d as qt,di as Jt,dn as Yt,dr as Xt,dt as Zt,ea as Qt,ei as $t,en,er as tn,f as nn,fi as rn,fn as an,fr as on,ft as sn,g as cn,gi as ln,gn as un,gr as dn,gt as fn,h as pn,hi as mn,hn,hr as gn,ht as _n,ii as vn,ir as yn,j as V,ji as bn,jn as xn,jr as Sn,jt as Cn,k as wn,ki as Tn,kn as En,kr as Dn,kt as On,l as kn,li as An,ln as jn,lr as Mn,lt as Nn,m as Pn,mi as Fn,mn as In,mr as Ln,mt as Rn,na as zn,ni as Bn,nn as Vn,nr as Hn,oi as Un,on as Wn,or as Gn,ot as H,p as Kn,pa as qn,pi as Jn,pn as Yn,pr as Xn,pt as Zn,q as Qn,qi as $n,qn as er,qr as tr,qt as nr,ra as rr,ri as ir,rn as ar,rr as or,rt as sr,si as cr,sn as lr,sr as ur,st as dr,t as fr,ta as pr,ti as mr,tn as hr,tr as gr,tt as _r,u as vr,ua as yr,ui as br,un as xr,ur as Sr,ut as Cr,v as wr,vi as Tr,vn as Er,vr as Dr,vt as Or,w as kr,wi as Ar,wn as jr,wt as Mr,x as Nr,xa as Pr,xi as Fr,xn as Ir,xr as Lr,xt as Rr,y as zr,ya as Br,yi as Vr,yn as Hr,yr as Ur,yt as Wr,z as U,zi as Gr,zn as Kr,zr as qr,zt as Jr}from"./theme-DxEjAthA.js";import{a as Yr,c as Xr,d as Zr,f as Qr,i as $r,l as ei,m as ti,n as ni,o as ri,p as ii,r as ai,s as oi,t as si,u as ci}from"./weatherNow-Bc3gj08B.js";import{a as li,c as ui,i as di,l as fi,n as pi,o as mi,r as hi,s as gi,t as _i}from"./list-B5h-ILH_.js";var vi=`import { createAccentHeadline } from '@mosaic-home/design-system/web';

const partOfDay = (): string => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};

const part = partOfDay();
const headline = createAccentHeadline({ text: \`Good \${part}\`, accent: part, size: 'display', level: 1 });

setInterval(() => {
  const now = partOfDay();
  headline.setText(\`Good \${now}\`, now);
}, 60_000);

document.body.append(headline.el);
`,yi=`import { createAccordion, createText } from '@mosaic-home/design-system/web';

const status = createText('Open: lights', { variant: 'caption', tone: 'muted' });

const accordion = createAccordion({
  mode: 'single',
  open: ['lights'],
  sections: [
    {
      id: 'lights',
      title: 'Lights',
      subtitle: '3 of 7 on',
      icon: 'lightbulb',
      content: createText('Lights turn off when a room has been empty for 15 minutes.', { tone: 'muted' }),
    },
    {
      id: 'climate',
      title: 'Climate',
      subtitle: 'Heating to 21°',
      icon: 'thermometer',
      content: createText('The target drops by 2° overnight.', { tone: 'muted' }),
    },
  ],
  onChange: (open) => (status.textContent = open.length ? \`Open: \${open.join(', ')}\` : 'All closed'),
});

document.body.append(accordion.el, status);
`,bi=`import { mdiDoorOpen, mdiLightbulbOutline, mdiLockOutline, mdiThermostat } from '@mdi/js';
import { createActivityFeed, type ActivityItem } from '@mosaic-home/design-system/web';

const ago = (minutes: number): number => Date.now() - minutes * 60_000;

let items: ActivityItem[] = [
  { id: '1', title: 'Back door opened', by: 'Robin', time: ago(1), icon: mdiDoorOpen, tone: 'accent' },
  { id: '2', title: 'Heating set to 21 °C', by: 'Evening routine', time: ago(14), icon: mdiThermostat },
  { id: '3', title: 'Hall light turned on', by: 'Motion', time: ago(52), icon: mdiLightbulbOutline },
];

const older: ActivityItem = { id: '4', title: 'Front door locked', time: ago(60 * 26), icon: mdiLockOutline };

const feed = createActivityFeed({
  items,
  onSelect: (id) => location.assign(\`#/activity/\${id}\`),
  onMore: () => {
    items = [...items, older];
    feed.update({ items, onMore: undefined });
  },
});

document.body.append(feed.el);
`,xi=`import { createAgenda, type AgendaDay } from '@mosaic-home/design-system/web';

const days: AgendaDay[] = [
  {
    label: 'Today',
    events: [
      { time: null, title: 'Bin day', color: 4 },
      { time: '08:30', end: '09:00', title: 'School run', color: 2 },
      { time: '12:15', end: '13:00', title: 'Lunch with Robin', location: 'Bramblewick Café', color: 1 },
    ],
  },
  {
    label: 'Thu 17 Oct',
    events: [{ time: '10:00', end: '11:30', title: 'Boiler service', location: 'Home' }],
  },
];

// Shows the first five events and sums up the rest.
const agenda = createAgenda({ days, max: 5 });

document.body.append(agenda.el);
`,Si=`import { createAirQuality } from '@mosaic-home/design-system/web';

const air = createAirQuality({
  kind: 'co2',
  value: 640,
  // Oldest first, ending with the reading now.
  trend: [520, 560, 600, 610, 640],
  trendLabel: 'Last 2 hours',
});

document.body.append(air.el);
`,Ci=`import { createAlarmPanel } from '@mosaic-home/design-system/web';

const EXIT_DELAY = 30;
let exit: ReturnType<typeof setTimeout> | undefined;

const panel = createAlarmPanel({
  label: 'House alarm',
  state: 'disarmed',
  onArm: (mode) => {
    panel.update({ state: 'arming', mode, deadline: Date.now() + EXIT_DELAY * 1000, delay: EXIT_DELAY });
    exit = setTimeout(() => panel.update({ state: 'armed', deadline: null, delay: null }), EXIT_DELAY * 1000);
  },
  // The app checks the code; the panel only hands it over and clears it.
  onDisarm: (code) => {
    if (code !== '1234') {
      panel.update({ error: 'Wrong code' });
      return;
    }
    clearTimeout(exit);
    panel.update({ state: 'disarmed', deadline: null, delay: null, error: null });
  },
});

document.body.append(panel.el);
`,wi=`import { createAlert, createButton } from '@mosaic-home/design-system/web';

const retry = createButton({
  label: 'Retry',
  variant: 'secondary',
  size: 'small',
  onClick: () => {
    retry.setLoading(true);
    setTimeout(() => {
      retry.setLoading(false);
      alert.setMessage('Still no reading. Check that the sensor has power.');
    }, 800);
  },
});

const alert = createAlert({
  tone: 'danger',
  title: 'Hallway sensor offline',
  message: 'No reading for 2 hours.',
  action: retry.el,
  dismissible: true,
});

document.body.append(alert.el);
`,Ti=`import { createAmbientClock } from '@mosaic-home/design-system/web';

const atNight = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

// Without a \`time\`, the clock keeps its own.
const clock = createAmbientClock({
  night: atNight(),
  nextEvent: { title: 'Bins out', when: '19:30' },
  weather: { condition: 'partly-cloudy', temperature: 14 },
});

setInterval(() => clock.update({ night: atNight() }), 60_000);

document.body.append(clock.el);
`,Ei=`import { createAppShell, createCard, createIconButton, createStatusBar, h } from '@mosaic-home/design-system/web';

const sections = [
  { label: 'Home', icon: 'home' },
  { label: 'Lights', icon: 'lightbulb' },
  { label: 'Climate', icon: 'thermometer' },
];
const nav = h('nav', { 'aria-label': 'Sections' });

const shell = createAppShell(
  {
    title: 'Home',
    subtitle: 'Living room',
    actions: [createIconButton({ icon: 'search', label: 'Search' }).el],
    nav,
    navPosition: 'auto',
    status: createStatusBar({ items: [{ id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' }] }).el,
  },
  createCard({ title: 'Climate', body: '21.5° and 46% humidity.' }).el,
  createCard({ title: 'Lights', body: 'Kitchen light and 2 others are on.' }).el,
);

const tabs = sections.map(({ label, icon }, i) =>
  createIconButton({
    icon,
    label,
    pressed: i === 0,
    onClick: () => {
      tabs.forEach((tab, j) => tab.setPressed(j === i));
      shell.setTitle(label);
    },
  }),
);
nav.append(...tabs.map((tab) => tab.el));

document.body.append(shell.el);
`,Di=`import { createApplianceCycle, type ApplianceState } from '@mosaic-home/design-system/web';

const duration = 5400;
let remaining = 4320;
let state: ApplianceState = 'running';

const set = (next: ApplianceState): void => {
  state = next;
  cycle.update({ state });
};

const cycle = createApplianceCycle({
  name: 'Washing machine',
  state,
  programme: 'Cotton 40°',
  stages: ['Wash', 'Rinse', 'Spin'],
  stage: 0,
  remaining,
  duration,
  endsAt: 'Ends 14:20',
  onPause: () => set('paused'),
  onResume: () => set('running'),
  onDismiss: () => cycle.el.remove(),
});

setInterval(() => {
  if (state !== 'running') return;
  remaining = Math.max(0, remaining - 60);
  if (remaining === 0) set('finished');
  else cycle.update({ remaining, stage: Math.floor(((duration - remaining) / duration) * 3) });
}, 60_000);

document.body.append(cycle.el);
`,Oi=`import { mdiBlindsHorizontal, mdiCeilingLight } from '@mdi/js';
import { createAssistReply, type AssistReplyOptions } from '@mosaic-home/design-system/web';

const answer: AssistReplyOptions = {
  heard: 'Turn off the living room lights and close the blinds',
  reply: 'Done. I turned off 2 lights and closed the blinds.',
  changes: [
    { id: 'ceiling', name: 'Ceiling light', icon: mdiCeilingLight, state: 'Off' },
    { id: 'lamp', name: 'Reading lamp', icon: 'lightbulb', state: 'Off' },
    { id: 'blinds', name: 'Living room blinds', icon: mdiBlindsHorizontal, state: 'Closing', active: true },
  ],
};

const undo = (): void => {
  reply.update({ ...answer, undoing: true });
  setTimeout(
    () =>
      reply.update({
        ...answer,
        undone: true,
        changes: [
          { id: 'ceiling', name: 'Ceiling light', icon: mdiCeilingLight, state: 'On', active: true, tone: 'warm' },
          { id: 'lamp', name: 'Reading lamp', icon: 'lightbulb', state: 'On', active: true, tone: 'warm' },
          { id: 'blinds', name: 'Living room blinds', icon: mdiBlindsHorizontal, state: 'Open' },
        ],
      }),
    900,
  );
};

const reply = createAssistReply({ ...answer, onUndo: undo });

document.body.append(reply.el);
`,ki=`import { createAvatar, createAvatarGroup } from '@mosaic-home/design-system/web';

const owner = createAvatar({ name: 'Ada Brook', size: 'large', status: 'online' });

const people = createAvatarGroup({
  label: 'People at home',
  max: 3,
  avatars: [{ name: 'Ada Brook' }, { name: 'Tomas Reed' }, { name: 'Lena Ortiz' }, { name: 'Sam Hale' }],
});

// Status follows presence, for example when the person leaves home.
setTimeout(() => owner.setStatus('away'), 3000);

document.body.append(owner.el, people.el);
`,Ai=`import { createBackdrop, createText } from '@mosaic-home/design-system/web';

// Content inside a .mh-backdrop-host stays above the backdrop.
const screen = document.createElement('main');
screen.className = 'mh-backdrop-host';

const backdrop = createBackdrop({ drift: true });
screen.append(backdrop.el, createText('22:40', { variant: 'display' }));

// Dim the canvas while the screen is idle; a touch brightens it again.
const IDLE_MS = 30_000;
let idle = setTimeout(() => backdrop.setDim(true), IDLE_MS);
screen.addEventListener('pointerdown', () => {
  backdrop.setDim(false);
  clearTimeout(idle);
  idle = setTimeout(() => backdrop.setDim(true), IDLE_MS);
});

document.body.append(screen);
`,ji=`import { createBadge, createIconButton, h } from '@mosaic-home/design-system/web';

const badge = createBadge({ count: 4, attached: true, ariaLabel: '4 unread' });

const bell = createIconButton({
  icon: 'bell',
  label: 'Notifications',
  filled: true,
  // Opening them marks them read; a count of zero hides the badge.
  onClick: () => badge.setCount(0),
});

// The host pins the badge to the button's top end corner.
document.body.append(h('span', { class: 'mh-badge-host' }, bell.el, badge.el));
`,Mi=`import { createBarChart, createButton, type BarChartOptions } from '@mosaic-home/design-system/web';

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
  format: (v) => \`\${v.toFixed(1)} kWh\`,
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
`,Ni=`import { createBootSplash } from '@mosaic-home/design-system/web';

const splash = createBootSplash({ name: 'Mosaic Home', message: 'Starting…', progress: null });
document.body.append(splash.el);

const steps = ['Connecting…', 'Loading rooms…', 'Almost ready…'];
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function boot(): Promise<void> {
  for (const [i, step] of steps.entries()) {
    await wait(900);
    splash.setMessage(step);
    splash.setProgress(((i + 1) / steps.length) * 100);
  }
  await splash.dismiss();
  document.body.append('Welcome home');
}

void boot();
`,Pi=`import { createBottomSheet, createButton, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });

const pick = (scene: string) => () => {
  status.textContent = \`\${scene} is on\`;
  sheet.close();
};

const sheet = createBottomSheet({
  title: 'Quick scenes',
  description: 'Living room',
  content: h('p', {}, 'Pick a scene for the whole room.'),
  footer: [
    createButton({ label: 'Reading', variant: 'secondary', onClick: pick('Reading') }).el,
    createButton({ label: 'Film night', onClick: pick('Film night') }).el,
  ],
});

const open = createButton({ label: 'Scenes', icon: 'lightbulb-on', onClick: () => sheet.open() });

document.body.append(open.el, status);
`,Fi=`import { createBreadcrumbs } from '@mosaic-home/design-system/web';

const breadcrumbs = createBreadcrumbs({
  // The last item is the current page.
  items: [
    { label: 'Home', icon: 'home', href: '#/' },
    { label: 'Ground floor', href: '#/floors/ground' },
    { label: 'Living room', href: '#/rooms/living-room' },
    { label: 'Ceiling light' },
  ],
  maxItems: 3,
});

document.body.append(breadcrumbs.el);
`,Ii=`import { createButtonGroup } from '@mosaic-home/design-system/web';

let range = 'week';

const group = createButtonGroup({
  label: 'Range',
  items: [
    { id: 'day', label: 'Day', pressed: false },
    { id: 'week', label: 'Week', pressed: true },
    { id: 'month', label: 'Month', pressed: false },
  ],
  onClick: (id) => {
    group.setPressed(range, false);
    group.setPressed(id, true);
    range = id;
  },
});

document.body.append(group.el);
`,Li=`import { createButton } from '@mosaic-home/design-system/web';

const button = createButton({
  label: 'Turn on',
  icon: 'power',
  variant: 'primary',
  onClick: () => {
    button.setLoading(true);
    setTimeout(() => button.setLoading(false), 800);
  },
});

document.body.append(button.el);
`,Ri=`import { createCameraTile, createIconButton } from '@mosaic-home/design-system/web';

const refresh = createIconButton({
  icon: 'refresh',
  label: 'Refresh Front door',
  size: 'small',
  onClick: () => camera.refresh(),
});

const camera = createCameraTile({
  src: '/snapshots/front-door.jpg',
  name: 'Front door',
  status: 'Motion · 2 min ago',
  // Reloads the picture every 10 seconds while it is on screen.
  refreshEvery: 10,
  action: refresh.el,
});

document.body.append(camera.el);
`,zi=`import { createButton, createCard, createText } from '@mosaic-home/design-system/web';

const summary = createText('21.5° and 46% humidity. The blinds close at 20:00.', { tone: 'muted' });
const allOff = createButton({
  label: 'All off',
  variant: 'text',
  size: 'small',
  onClick: () => card.setSubtitle('All lights off'),
});
const open = createButton({ label: 'Open', size: 'small' });

const card = createCard({
  title: 'Living room',
  subtitle: '3 lights on',
  icon: 'home',
  body: summary,
  footer: [allOff.el, open.el],
});

document.body.append(card.el);
`,Bi=`import { createCard, createCarousel } from '@mosaic-home/design-system/web';

const stories = [
  { source: 'Riverside Courier', time: '2 h ago', title: 'Council approves a cycle path along the canal' },
  { source: 'Morning Ledger', time: '5 h ago', title: 'Local bakery wins a prize for its sourdough' },
  { source: 'Valley Weekly', time: 'Yesterday', title: 'Library extends its weekend opening hours' },
];

const carousel = createCarousel({
  label: 'News',
  items: stories.map(
    (story) =>
      createCard({
        eyebrow: \`\${story.source} · \${story.time}\`,
        title: story.title,
        titleLines: 3,
        variant: 'flat',
        onClick: () => console.log(\`Open: \${story.title}\`),
      }).el,
  ),
});

document.body.append(carousel.el);
`,Vi=`import { createChargeCard, type ChargeCardOptions } from '@mosaic-home/design-system/web';

const car: ChargeCardOptions = {
  name: 'Car',
  level: 46,
  limit: 80,
  state: 'charging',
  rate: 7400,
  minutesLeft: 95,
  detail: 'Range 180 km',
};

const card = createChargeCard(car);

// A new reading replaces everything shown; the ring moves to the new level.
setTimeout(() => card.update({ ...car, level: 52, minutesLeft: 78, detail: 'Range 203 km' }), 3000);

document.body.append(card.el);
`,Hi=`import { createCheckbox } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom'];

const all = createCheckbox({
  label: 'All rooms',
  onChange: (checked) => {
    for (const box of boxes) box.setChecked(checked);
  },
});

const boxes = rooms.map((room, i) => createCheckbox({ label: room, checked: i === 1, onChange: syncAll }));

// "All rooms" is checked when every room is, and indeterminate when only some are.
function syncAll(): void {
  const count = boxes.filter((box) => box.input.checked).length;
  all.setChecked(count === boxes.length);
  all.setIndeterminate(count > 0 && count < boxes.length);
}

syncAll();
document.body.append(all.el, ...boxes.map((box) => box.el));
`,Ui=`import { createChipGroup } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const filter = createChipGroup({
  label: 'Show devices',
  values: ['lights'],
  chips: [
    { value: 'lights', label: 'Lights', icon: 'lightbulb' },
    { value: 'climate', label: 'Climate', icon: 'thermometer' },
    { value: 'media', label: 'Media', icon: 'music' },
    { value: 'fans', label: 'Fans', icon: 'fan' },
  ],
  onChange: (values) => (status.textContent = \`Filters: \${values.join(', ') || 'none'}\`),
});

document.body.append(filter.el, status);
`,Wi=`import { createClickWheel } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const timer = createClickWheel({
  label: 'Timer',
  max: 120,
  step: 5,
  value: 25,
  detents: 36,
  format: (v) => \`\${v} min\`,
  center: {
    label: 'Start timer',
    icon: 'play',
    onPress: () => (status.textContent = \`Timer started: \${timer.getValue()} min\`),
  },
});

document.body.append(timer.el, status);
`,Gi=`import { createColorPicker } from '@mosaic-home/design-system/web';

const sample = document.createElement('div');
sample.style.cssText = 'width: 48px; height: 48px; border-radius: var(--mh-radius-control)';

const lamp = createColorPicker({
  label: 'Lamp colour',
  value: '#ff9a3c',
  // onInput follows every drag; onChange fires once the user lets go.
  onInput: (color) => (sample.style.background = color),
});
sample.style.background = lamp.getValue();

document.body.append(lamp.el, sample);
`,Ki=`import { createCommandBar } from '@mosaic-home/design-system/web';

const log = document.createElement('pre');

const bar = createCommandBar({
  placeholder: 'Type a command',
  suggestions: [
    { value: 'lights on', description: 'Turn on the lights in a room' },
    { value: 'lights off', description: 'Turn off the lights in a room' },
    { value: 'scene evening', description: 'Dim everything to warm white' },
    { value: 'status', description: 'Summary of the home' },
  ],
  history: ['status'],
  onSubmit: (command) => (log.textContent += \`> \${command}\\nok\\n\`),
});

document.body.append(log, bar.el);
`,qi=`import { createButton, createCommandPalette, h, type Command } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });

const commands: Command[] = [
  { value: 'lights-off', label: 'Turn off all lights', icon: 'lightbulb', group: 'Lights', keywords: ['dark', 'night'] },
  { value: 'lights-on', label: 'Turn on all lights', icon: 'lightbulb-on', group: 'Lights' },
  { value: 'evening', label: 'Evening scene', icon: 'play', group: 'Scenes', description: 'Living room at 40%' },
  { value: 'lock', label: 'Lock the front door', icon: 'lock', group: 'Security', shortcut: 'Ctrl+L' },
  { value: 'heating', label: 'Set heating to 20°', icon: 'thermometer', group: 'Climate', keywords: ['warm'] },
  { value: 'settings', label: 'Open settings', icon: 'settings', group: 'App' },
];

// \`hotkey\` also opens it with Ctrl+K (⌘K on Apple keyboards).
const palette = createCommandPalette({
  commands,
  hotkey: true,
  onSelect: (value) => (status.textContent = \`Ran: \${value}\`),
});

const open = createButton({ label: 'Search commands', icon: 'search', onClick: () => palette.open() });

document.body.append(open.el, status);
`,Ji=`import { createCompareSlider, createText } from '@mosaic-home/design-system/web';

const status = createText('Showing 45% of the evening scene', { variant: 'caption', tone: 'muted' });

const compare = createCompareSlider({
  label: 'Compare the lighting scene',
  before: { src: 'photos/living-room-off.jpg', alt: 'Living room with the lights off' },
  after: { src: 'photos/living-room-evening.jpg', alt: 'Living room with the evening scene on' },
  beforeLabel: 'Off',
  afterLabel: 'Evening',
  value: 45,
  onChange: (value) => (status.textContent = \`Showing \${Math.round(value)}% of the evening scene\`),
});

document.body.append(compare.el, status);
`,Yi=`import { createComposer, createComposerAction } from '@mosaic-home/design-system/web';

const sent = document.createElement('ol');

const composer = createComposer({
  placeholder: 'Ask about your home',
  leading: createComposerAction('attach').el,
  trailing: createComposerAction('send', { onClick: () => composer.submit() }).el,
  suggestions: ['Turn off all lights', 'Is the back door locked?', 'Warmer in the kitchen'],
  onSuggestion: (text) => {
    composer.setValue(text);
    composer.focus();
  },
  onSubmit: (text) => {
    sent.append(Object.assign(document.createElement('li'), { textContent: text }));
    composer.setValue('');
    composer.focus();
  },
});

document.body.append(sent, composer.el);
`,Xi=`import { confirm, createButton, h } from '@mosaic-home/design-system/web';

const result = h('p', { 'aria-live': 'polite' });

const remove = createButton({
  label: 'Delete scene',
  icon: 'delete',
  variant: 'danger',
  onClick: async () => {
    const ok = await confirm({
      title: 'Delete "Evening"?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    result.textContent = ok ? 'Scene deleted' : 'Kept the scene';
  },
});

document.body.append(remove.el, result);
`,Zi=`import { createConnectionStatus } from '@mosaic-home/design-system/web';

const status = createConnectionStatus({
  state: 'connecting',
  server: 'homeassistant.local',
  variant: 'banner',
  onRetry: () => connect(),
});

let retry: ReturnType<typeof setTimeout> | undefined;

function connect(): void {
  clearTimeout(retry);
  status.update({ state: 'connecting', retryAt: null });
  const socket = new WebSocket('ws://homeassistant.local:8123/socket');
  socket.onopen = () => status.update({ state: 'connected' });
  socket.onclose = () => {
    status.update({ state: 'reconnecting', retryAt: Date.now() + 10_000 });
    retry = setTimeout(connect, 10_000);
  };
}

connect();
document.body.append(status.el);
`,Qi=`import { createControlCard, createSwitch } from '@mosaic-home/design-system/web';

let on = true;
const stateText = () => (on ? 'On · 70%' : 'Off');

const power = createSwitch({
  ariaLabel: 'Desk lamp power',
  checked: on,
  onChange: (checked) => {
    on = checked;
    card.update({ active: on, state: stateText() });
  },
});

const card = createControlCard({
  title: 'Desk lamp',
  icon: 'lightbulb',
  tone: 'warm',
  active: on,
  state: stateText(),
  control: power.el,
});

document.body.append(card.el);
`,$i=`import {
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
  readout.textContent = \`\${points.length} points · midtones \${Math.round(midtones * 255)}\`;
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
`,ea=`import { createDataTable, createText, type DataTableColumn } from '@mosaic-home/design-system/web';

interface Device {
  id: string;
  name: string;
  room: string;
  battery: number;
}

const devices: Device[] = [
  { id: 'd1', name: 'Hall motion sensor', room: 'Hallway', battery: 82 },
  { id: 'd2', name: 'Front door lock', room: 'Hallway', battery: 9 },
  { id: 'd3', name: 'Kitchen window', room: 'Kitchen', battery: 67 },
  { id: 'd4', name: 'Bedroom radiator', room: 'Bedroom', battery: 23 },
];

const columns: DataTableColumn<Device>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'room', label: 'Room', sortable: true },
  { id: 'battery', label: 'Battery', align: 'end', sortable: true, render: (d) => \`\${d.battery}%\` },
];

const status = createText('Nothing selected', { variant: 'caption', tone: 'muted' });

const table = createDataTable({
  columns,
  rows: devices,
  rowId: (d) => d.id,
  rowLabel: (d) => d.name,
  label: 'Devices',
  selectable: true,
  sort: { column: 'name', direction: 'ascending' },
  onSelectionChange: (ids) => {
    status.textContent = ids.length ? \`\${ids.length} selected\` : 'Nothing selected';
  },
});

document.body.append(table.el, status);
`,ta=`import { createDatePicker, pickerDates } from '@mosaic-home/design-system/web';

const today = pickerDates.todayIso();
const status = document.createElement('p');

const visit = createDatePicker({
  label: 'Visit date',
  min: today,
  max: pickerDates.addDays(today, 90),
  clearable: true,
  onChange: (date) => {
    status.textContent = date ? \`Booked for \${pickerDates.formatDate(date, undefined, { dateStyle: 'full' })}.\` : 'No date.';
  },
});

document.body.append(visit.el, status);
`,na=`import { createDateRangePicker, pickerDates } from '@mosaic-home/design-system/web';

const today = pickerDates.todayIso();
const status = document.createElement('p');

const away = createDateRangePicker({
  label: 'Away from home',
  min: today,
  clearable: true,
  presets: [
    { label: 'Next 7 days', range: { start: today, end: pickerDates.addDays(today, 6) } },
    { label: 'Next 14 days', range: { start: today, end: pickerDates.addDays(today, 13) } },
  ],
  helper: 'The house runs in away mode on these days.',
  onChange: (range) => {
    status.textContent = range ? pickerDates.formatDateRange(range.start, range.end) : 'Not away.';
  },
});

document.body.append(away.el, status);
`,ra=`import { createDateTimeField } from '@mosaic-home/design-system/web';

const wakeUp = createDateTimeField({
  label: 'Wake-up light',
  type: 'time',
  value: '06:45',
  step: 60,
  helper: 'The bedroom lamp starts to brighten at this time.',
  onChange: (value) => wakeUp.setError(value ? undefined : 'Choose a time.'),
});

document.body.append(wakeUp.el);
`,ia=`import { createDeparturesBoard, type Departure } from '@mosaic-home/design-system/web';

let departures: Departure[] = [
  { id: 'a', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 2, live: true },
  { id: 'b', line: 'T3', mode: 'tram', color: 3, destination: 'Mill Lane', minutes: 6, time: '08:46' },
  { id: 'c', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 13, delay: 3 },
  { id: 'd', line: 'R2', mode: 'train', color: 5, destination: 'Brackenmoor', minutes: 21, cancelled: true },
];

const board = createDeparturesBoard({ stop: 'Elm Street', departures, max: 5, updated: 'Updated just now' });

// Departed ones (below 0 minutes) drop off the board by themselves.
setInterval(() => {
  departures = departures.map((d) => ({ ...d, minutes: d.minutes === null ? null : d.minutes - 1 }));
  board.update({ departures, updated: 'Updated a minute ago' });
}, 60_000);

document.body.append(board.el);
`,aa=`import { createDeviceSetup, type DeviceSetupResult, type DeviceSetupValues } from '@mosaic-home/design-system/web';

async function testServer({ address, token }: DeviceSetupValues): Promise<DeviceSetupResult> {
  try {
    const response = await fetch(address, { headers: { Authorization: \`Bearer \${token}\` } });
    if (response.status === 401 || response.status === 403) {
      return { ok: false, field: 'token', message: 'The server refused that token' };
    }
    return response.ok ? { ok: true } : { ok: false, message: \`The server answered \${response.status}\` };
  } catch {
    return { ok: false, field: 'address', message: 'No server answered at that address' };
  }
}

const setup = createDeviceSetup({
  placeholder: 'http://homeassistant.local:8123',
  intro: 'This screen talks to your home server directly.',
  onTest: testServer,
  onFinish: ({ address }) => setup.el.replaceWith(\`Connected to \${address}\`),
  onCancel: () => setup.el.remove(),
});

document.body.append(setup.el);
`,oa=`import { createButton, createDialog, h } from '@mosaic-home/design-system/web';

const dialog = createDialog({
  title: 'Save as scene',
  description: 'Keeps the current brightness of every light in this room.',
  content: h('p', {}, 'Living room: three lights at 40%, floor lamp off.'),
  footer: [
    createButton({ label: 'Cancel', variant: 'secondary', onClick: () => dialog.close() }).el,
    createButton({ label: 'Save', onClick: () => dialog.close() }).el,
  ],
});

const open = createButton({ label: 'Save as scene', icon: 'add', onClick: () => dialog.open() });

document.body.append(open.el);
`,sa=`import { createButton, createDivider, createText } from '@mosaic-home/design-system/web';

const pairing = document.createElement('div');
pairing.append(
  createButton({ label: 'Scan the QR code', icon: 'camera', variant: 'primary', fullWidth: true }).el,
  createDivider({ label: 'or' }),
  createText('Enter the pairing code shown on the device.', { tone: 'muted' }),
  createDivider(),
  createButton({ label: 'Cancel', variant: 'text' }).el,
);

document.body.append(pairing);
`,ca=`import { createDocumentTabs, type DocumentTab } from '@mosaic-home/design-system/web';

let files: DocumentTab[] = [
  { id: 'evening', label: 'Evening.yaml', dirty: true },
  { id: 'morning', label: 'Morning.yaml' },
  { id: 'away', label: 'Away.yaml' },
];
let created = 0;

const editor = createDocumentTabs({
  label: 'Open scenes',
  tabs: files,
  value: 'evening',
  onClose: (id) => {
    const file = files.find((f) => f.id === id);
    // Returning false keeps the tab open.
    if (file?.dirty && !confirm(\`Close \${file.label} without saving?\`)) return false;
    files = files.filter((f) => f.id !== id);
    return true;
  },
  onAdd: () => {
    created += 1;
    const id = \`new-\${created}\`;
    files = [...files, { id, label: \`Untitled \${created}.yaml\` }];
    editor.setTabs(files);
    editor.setValue(id);
  },
});

document.body.append(editor.el);
`,la=`import { createButton, createDoorbell, type DoorbellHandle } from '@mosaic-home/design-system/web';

let bell: DoorbellHandle | null = null;

const close = () => {
  bell?.destroy();
  bell?.el.remove();
  bell = null;
  ring.el.focus();
};

// In an app this runs when the doorbell rings.
const ring = createButton({
  label: 'Ring the doorbell',
  icon: 'bell',
  onClick: () => {
    const handle = createDoorbell({
      door: 'Front door',
      visitor: 'Parcel delivery',
      when: 'Just now',
      src: '/snapshots/front-door.jpg',
      // Covers the screen, keeps focus inside and closes with Escape.
      takeover: true,
      onAnswer: () => handle.update({ answered: true }),
      onTalk: (talking) => handle.update({ talking }),
      onDismiss: close,
    });
    bell = handle;
    document.body.append(handle.el);
    handle.focus();
  },
});

document.body.append(ring.el);
`,ua=`import { createButton, createDrawer, h } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Garden'];

const drawer = createDrawer({
  side: 'left',
  title: 'Rooms',
  content: h(
    'nav',
    { 'aria-label': 'Rooms' },
    ...rooms.map((room) => h('p', {}, h('a', { href: \`#\${room.toLowerCase().replace(' ', '-')}\` }, room))),
  ),
});
// Following a link closes the drawer.
drawer.body.addEventListener('click', (event) => {
  if ((event.target as Element).closest('a')) drawer.close();
});

const open = createButton({ label: 'Rooms', icon: 'menu', variant: 'secondary', onClick: () => drawer.open() });

document.body.append(open.el);
`,da=`import { createDurationField, formatDuration } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const timer = createDurationField({
  label: 'Timer',
  value: 1500,
  presets: [300, 600, 900, 1800, 3600],
  max: 4 * 3600,
  helper: 'Try 90, 1h 30 or 0:45. A number alone is minutes.',
  onChange: (seconds) => (status.textContent = seconds === null ? 'No timer.' : \`Timer: \${formatDuration(seconds, 'long')}\`),
});

document.body.append(timer.el, status);
`,fa=`import { resolveTokens, themeById } from '@mosaic-home/design-system/tokens';

// Levels 1–3 are the --mh-shadow-* variables; the theme decides between a shadow, a glow or none.
const card = document.createElement('article');
card.textContent = 'Front door locked';
Object.assign(card.style, {
  padding: 'var(--mh-space-lg)',
  borderRadius: 'var(--mh-radius-lg)',
  background: 'var(--mh-surface-solid)',
  boxShadow: 'var(--mh-shadow-1)',
});

// Lift the card while it is pressed.
card.addEventListener('pointerdown', () => (card.style.boxShadow = 'var(--mh-shadow-3)'));
card.addEventListener('pointerup', () => (card.style.boxShadow = 'var(--mh-shadow-1)'));

// The raw values, for renderers that draw their own shadows (a canvas, a native view).
const { blur, offsetY, alpha } = resolveTokens(themeById('midnight')!).elevation[2];
console.info(\`Level 2: \${offsetY}px down, \${blur}px blur, opacity \${alpha}\`);

document.body.append(card);
`,pa=`import { createButton, createEmptyState, h } from '@mosaic-home/design-system/web';

const lights: string[] = [];
const list = h('ul');

const addLight = createButton({
  label: 'Add light',
  icon: 'add',
  onClick: () => {
    lights.push(\`Desk lamp \${lights.length + 1}\`);
    list.replaceChildren(...lights.map((name) => h('li', {}, name)));
    empty.el.replaceWith(list);
  },
});

const empty = createEmptyState({
  icon: 'lightbulb',
  title: 'No lights yet',
  text: 'Add a light to control it from here.',
  action: addLight.el,
});

document.body.append(empty.el);
`,ma=`import { createEnergyFlow } from '@mosaic-home/design-system/web';

// Watts. Grid is negative while exporting, battery negative while charging.
const flow = createEnergyFlow({
  label: 'Energy now',
  solar: 3200,
  grid: -1100,
  battery: -800,
  home: 1300,
  batteryLevel: 64,
});

// Evening: the sun is down and the battery feeds the home.
setTimeout(() => {
  flow.update({ label: 'Energy now', solar: 0, grid: 300, battery: 900, batteryLevel: 52 });
}, 3000);

document.body.append(flow.el);
`,ha=`import { createFanControl } from '@mosaic-home/design-system/web';

const fan = createFanControl({
  label: 'Bedroom fan',
  on: true,
  percentage: 67,
  // Three speeds become step buttons.
  speedCount: 3,
  oscillating: true,
  onToggle: (on) => fan.update({ on }),
  onPercentage: (percentage) => fan.update({ percentage, on: percentage > 0 }),
  onOscillate: (oscillating) => fan.update({ oscillating }),
});

document.body.append(fan.el);
`,ga=`import { createFavouriteToggle, createText } from '@mosaic-home/design-system/web';

const status = createText('Not on the home screen', { variant: 'caption', tone: 'muted' });

const favourite = createFavouriteToggle({
  label: 'Favourite: Kitchen light',
  onChange: (pressed) => {
    status.textContent = pressed ? 'Pinned to the home screen' : 'Not on the home screen';
  },
});

document.body.append(favourite.el, status);
`,_a=`import { createField, createTextField } from '@mosaic-home/design-system/web';

const name = createTextField({ value: 'Living room' });
const field = createField({
  label: 'Display name',
  control: name.el,
  helper: 'Shown on the dashboard.',
  required: true,
});

// Validate when the user leaves the input; the message is a live region, so the error is announced.
name.input.addEventListener('change', () => {
  field.setError(name.getValue().trim() ? undefined : 'Enter a name.');
});

document.body.append(field.el);
`,va=`import { createFileDropZone, formatFileSize } from '@mosaic-home/design-system/web';

const status = document.createElement('p');

// Files that are too big, of the wrong type or too many are refused with a message in the zone.
const plans = createFileDropZone({
  title: 'Drop floor plans here',
  hint: 'PNG, JPG or WebP, up to 5 MB each, up to 4 files',
  accept: 'image/png,image/jpeg,image/webp',
  maxSize: 5_000_000,
  maxFiles: 4,
  onChange: (files) => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    status.textContent = files.length ? \`\${files.length} ready to upload, \${formatFileSize(total)}.\` : '';
  },
});

document.body.append(plans.el, status);
`,ya=`import { mdiDoor, mdiFloorLamp } from '@mdi/js';
import { createFloorPlan, type FloorPlanMarker, type FloorPlanRoom } from '@mosaic-home/design-system/web';

// Shapes are in centimetres; the plan scales them to fit.
const rooms: FloorPlanRoom[] = [
  { id: 'living', name: 'Living room', shape: { x: 0, y: 0, width: 500, height: 400 }, light: 70 },
  { id: 'kitchen', name: 'Kitchen', shape: { x: 500, y: 0, width: 300, height: 250 }, summary: '22 °C' },
  { id: 'hall', name: 'Hall', shape: { x: 500, y: 250, width: 300, height: 150 } },
  { id: 'bedroom', name: 'Bedroom', shape: { x: 0, y: 400, width: 450, height: 300 }, climate: 'heat' },
  { id: 'bath', name: 'Bathroom', shape: { x: 450, y: 400, width: 350, height: 300 }, alert: true },
];

let markers: FloorPlanMarker[] = [
  { id: 'lamp', x: 90, y: 90, icon: mdiFloorLamp, label: 'Floor lamp', state: 'On', active: true, tone: 'warm' },
  { id: 'door', x: 790, y: 325, icon: mdiDoor, label: 'Front door', state: 'Locked' },
];

const plan = createFloorPlan({
  label: 'Ground floor',
  rooms,
  markers,
  onRoom: (id) => plan.update({ selected: id }),
  onMarker: (id) => {
    if (id !== 'lamp') return;
    markers = markers.map((m) => (m.id === id ? { ...m, active: !m.active, state: m.active ? 'Off' : 'On' } : m));
    plan.update({ markers });
  },
});

document.body.append(plan.el);
`,ba=`import { createForecastStrip, type ForecastReading } from '@mosaic-home/design-system/web';

const week: ForecastReading[] = [
  { label: 'Today', condition: 'partly-cloudy', value: 16, low: 9, sub: '10%' },
  { label: 'Thu', condition: 'rain', value: 14, low: 8, sub: '80%' },
  { label: 'Fri', condition: 'pouring', value: 12, low: 7, sub: '95%' },
  { label: 'Sat', condition: 'cloudy', value: 13, low: 6 },
  { label: 'Sun', condition: 'clear', value: 17, low: 7 },
];

const forecast = createForecastStrip({ label: 'Next 5 days', readings: week, subName: 'rain' });

// A newer forecast replaces the readings in place.
setTimeout(() => {
  const today: ForecastReading = { ...week[0]!, condition: 'rain', sub: '60%' };
  forecast.update({ label: 'Next 5 days', readings: [today, ...week.slice(1)], subName: 'rain' });
}, 5000);

document.body.append(forecast.el);
`,xa=`import { createGeoMap, type GeoMapPoint, type GeoMapShape } from '@mosaic-home/design-system/web';

const home: GeoMapShape = { name: 'Home', tone: 'muted', circle: { lat: 50.9965, lon: 6.9935, radius: 150 } };
const park: GeoMapShape = {
  name: 'Willow Green',
  tone: 'accent',
  rings: [
    [
      [7.0, 51.0],
      [7.008, 51.0005],
      [7.006, 51.0052],
      [7.0, 51.0],
    ],
  ],
};
const sam: GeoMapPoint = { lat: 51.0021, lon: 7.004, label: 'Sam', accuracy: 40 };

const options = {
  label: 'Where Sam is',
  shapes: [home, park],
  // Your tile server's XYZ template and the credit it asks for; leave \`tiles\` out to load nothing.
  tiles: { url: 'https://tiles.example.com/{z}/{x}/{y}.png', attribution: '© Example Maps', maxZoom: 19 },
};
const map = createGeoMap({ ...options, points: [sam] });

document.body.append(map.el);

// A new position arrives: redraw with it.
setTimeout(() => map.update({ ...options, points: [{ ...sam, lat: 50.9972, lon: 6.9941, accuracy: 15 }] }), 3000);
`,Sa=`import { createGradientEditor } from '@mosaic-home/design-system/web';

const preview = document.createElement('div');
preview.style.cssText = 'height: 96px; border-radius: var(--mh-radius-lg)';

const sunrise = createGradientEditor({
  label: 'Sunrise light',
  showAngle: true,
  angle: 90,
  stops: [
    { offset: 0, color: '#1a1446' },
    { offset: 40, color: '#c2457a' },
    { offset: 100, color: '#ffb35c' },
  ],
  onInput: () => (preview.style.background = sunrise.css()),
});
preview.style.background = sunrise.css();

document.body.append(preview, sunrise.el);
`,Ca=`import { createHazardBanner } from '@mosaic-home/design-system/web';

const banner = createHazardBanner({
  kind: 'leak',
  where: 'Utility room, under the sink',
  since: '10:42',
  advice: ['Turn off the water at the main valve', 'Move anything that could get wet'],
  actions: [{ id: 'valve', label: 'Shut off water', primary: true }],
  onSilence: () => banner.update({ severity: 'warning', onSilence: undefined }),
  onAction: () =>
    banner.update({
      severity: 'cleared',
      advice: undefined,
      actions: [],
      onSilence: undefined,
      onDismiss: () => banner.el.remove(),
    }),
});

document.body.append(banner.el);
`,wa=`import { createHistogram, histogramFromPixels } from '@mosaic-home/design-system/web';

const image = new Image();
image.src = 'snapshot.jpg';

const histogram = createHistogram({ data: {}, label: 'Snapshot histogram', mode: 'rgb' });

// Count the image's pixels once it has loaded.
image.addEventListener('load', () => {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  histogram.update({ data: histogramFromPixels(pixels, 64), label: 'Snapshot histogram', mode: 'rgb' });
});

document.body.append(histogram.el);
`,Ta=`import { createHotkeyField, hotkeyFromEvent, hotkeyToString } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const shortcut = createHotkeyField({
  label: 'Open search',
  value: 'Ctrl+K',
  helper: 'Press the field, then a key combination.',
  onChange: (value) => (status.textContent = value ? \`Search opens with \${value}.\` : 'No shortcut.'),
});

document.addEventListener('keydown', (event) => {
  if (shortcut.isRecording()) return;
  const pressed = hotkeyFromEvent(event);
  if (pressed && hotkeyToString(pressed) === shortcut.getValue()) {
    event.preventDefault();
    status.textContent = 'Search opened.';
  }
});

document.body.append(shortcut.el, status);
`,Ea=`import { createHumidityControl } from '@mosaic-home/design-system/web';

const humidifier = createHumidityControl({
  label: 'Nursery humidity',
  current: 36,
  target: 45,
  on: true,
  action: 'humidifying',
  mode: 'normal',
  modes: [
    { value: 'normal', label: 'Normal' },
    { value: 'sleep', label: 'Sleep' },
  ],
  // Called once the taps settle, so one change is sent rather than one per tap.
  onTarget: (target) => humidifier.update({ target }),
  onMode: (mode) => humidifier.update({ mode }),
  onToggle: (on) => humidifier.update({ on, action: on ? 'humidifying' : 'off' }),
});

document.body.append(humidifier.el);
`,Da=`import { createIconButton } from '@mosaic-home/design-system/web';

let muted = false;

const mute = createIconButton({
  icon: 'volume-high',
  label: 'Mute',
  pressed: muted,
  onClick: () => {
    muted = !muted;
    mute.setPressed(muted);
    mute.setIcon(muted ? 'volume-off' : 'volume-high');
  },
});

document.body.append(mute.el);
`,Oa=`import { mdiBed, mdiGarage, mdiSofaOutline, mdiStove } from '@mdi/js';
import { createIconPicker, iconLabel } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const picker = createIconPicker({
  label: 'Room icon',
  value: 'sofa',
  allowNone: true,
  icons: [
    { name: 'sofa', path: mdiSofaOutline, label: 'Living room', keywords: ['lounge'] },
    { name: 'bed', path: mdiBed, label: 'Bedroom', keywords: ['sleep'] },
    { name: 'kitchen', path: mdiStove, label: 'Kitchen', keywords: ['cook'] },
    { name: 'garage', path: mdiGarage, label: 'Garage', keywords: ['car'] },
    'lightbulb',
    'fan',
  ],
  onChange: (name) => (status.textContent = name ? \`Picked \${iconLabel(name)}.\` : 'No icon.'),
});

document.body.append(picker.el, status);
`,ka=`import { mdiSofaOutline } from '@mdi/js';
import { createIcon } from '@mosaic-home/design-system/web';

const room = document.createElement('p');
room.append(
  // Any Material Design Icons path works where there is no short name.
  createIcon(mdiSofaOutline, { size: 24 }),
  ' Living room ',
  createIcon('lightbulb-on', { size: 20, label: 'Lights on' }),
);

document.body.append(room);
`,Aa=`import { createInspector, createText } from '@mosaic-home/design-system/web';

const status = createText('', { variant: 'caption', tone: 'muted' });

const inspector = createInspector({
  label: 'Clip properties',
  sections: [
    {
      id: 'transform',
      title: 'Transform',
      params: [
        { id: 'scale', kind: 'slider', label: 'Scale', value: 100, max: 400, unit: '%', keyframe: 'off' },
        { id: 'opacity', kind: 'slider', label: 'Opacity', value: 85, unit: '%', keyframe: 'on' },
      ],
    },
    {
      id: 'look',
      title: 'Look',
      params: [
        {
          id: 'blend',
          kind: 'choice',
          label: 'Blend',
          value: 'normal',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'screen', label: 'Screen' },
          ],
        },
        { id: 'shadow', kind: 'toggle', label: 'Drop shadow', value: true },
      ],
    },
  ],
  // \`committed\` is false while a slider is being dragged.
  onChange: (id, value, committed) => committed && (status.textContent = \`\${id}: \${String(value)}\`),
  onKeyframe: (id, on) => (status.textContent = \`\${id}: keyframe \${on ? 'added' : 'removed'}\`),
});

document.body.append(inspector.el, status);
`,ja=`import { createIrrigationZones, type IrrigationRun, type IrrigationZone } from '@mosaic-home/design-system/web';

// Durations are in minutes.
const zones: IrrigationZone[] = [
  { id: 'lawn', name: 'Front lawn', duration: 20 },
  { id: 'beds', name: 'Flower beds', duration: 10 },
  { id: 'veg', name: 'Vegetable patch', duration: 15 },
];

let running: IrrigationRun | null = null;

const garden = createIrrigationZones({
  name: 'Garden watering',
  zones,
  nextRun: 'Tomorrow 06:00',
  rainNote: '6 mm of rain expected tonight',
  onRun: (id) => {
    running = { zone: id, remaining: zones.find((z) => z.id === id)!.duration * 60 };
    garden.update({ running });
  },
  onStop: () => garden.update({ running: (running = null) }),
  onRainSkip: (rainSkip) => garden.update({ rainSkip }),
});

setInterval(() => {
  if (!running) return;
  running = running.remaining > 1 ? { ...running, remaining: running.remaining - 1 } : null;
  garden.update({ running });
}, 1000);

document.body.append(garden.el);
`,Ma=`import { createKbd } from '@mosaic-home/design-system/web';

const shortcuts: { action: string; keys: string | string[]; sequence?: boolean }[] = [
  { action: 'Search', keys: 'Ctrl+K' },
  { action: 'Close a dialog', keys: 'Esc' },
  { action: 'Go home', keys: ['G', 'H'], sequence: true },
];

const list = document.createElement('dl');
for (const { action, keys, sequence } of shortcuts) {
  const term = document.createElement('dt');
  const detail = document.createElement('dd');
  term.textContent = action;
  detail.append(createKbd({ keys, sequence }).el);
  list.append(term, detail);
}

const hint = document.createElement('p');
hint.append('Press ', createKbd({ keys: '/', size: 'small' }).el, ' to search.');

document.body.append(list, hint);
`,Na=`import { mdiFormatText, mdiImageOutline } from '@mdi/js';
import { createLayersPanel, createText, type LayerItem } from '@mosaic-home/design-system/web';

const layers: LayerItem[] = [
  { id: 'title', name: 'Title', icon: mdiFormatText },
  {
    id: 'scenery',
    name: 'Scenery',
    children: [
      { id: 'tree', name: 'Tree', icon: mdiImageOutline },
      { id: 'sun', name: 'Sun', icon: mdiImageOutline, visible: false },
    ],
  },
  { id: 'sky', name: 'Sky', icon: mdiImageOutline, locked: true },
];

const status = createText('Drag a grip, or press Up and Down on it, to reorder.', { variant: 'caption', tone: 'muted' });

const panel = createLayersPanel({
  label: 'Layers',
  layers,
  selected: 'tree',
  onSelect: (id) => (status.textContent = \`Selected \${id}\`),
  onVisibleChange: (id, visible) => (status.textContent = \`\${id} \${visible ? 'shown' : 'hidden'}\`),
  onReorder: (id, parent, index) => (status.textContent = \`\${id} moved to \${index + 1}\${parent ? \` in \${parent}\` : ''}\`),
});

document.body.append(panel.el, status);
`,Pa=`import { createLevelMeter } from '@mosaic-home/design-system/web';

const meter = createLevelMeter({
  levels: [-Infinity, -Infinity],
  channels: ['L', 'R'],
  label: 'Speaker output',
  scale: true,
});

// Feed it levels in dBFS, for example from an audio analyser; peaks are held and fall back on their own.
const tick = (now: number): void => {
  const base = -18 + 8 * Math.sin(now / 900);
  meter.setLevels([Math.min(0, base + Math.random() * 8), Math.min(0, base - 3 + Math.random() * 8)], now);
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);

document.body.append(meter.el);
`,Fa=`import { createLightControl } from '@mosaic-home/design-system/web';

const warmToCool = { min: 2000, max: 6500 };

const light = createLightControl({
  label: 'Bedside lamp',
  on: true,
  brightness: 65,
  colorTemp: { value: 2700, ...warmToCool },
  onToggle: (on) => light.update({ on }),
  onBrightness: (brightness) => light.update({ brightness }),
  onColorTemp: (value) => light.update({ colorTemp: { value, ...warmToCool } }),
});

document.body.append(light.el);
`,Ia=`import { createLightGroup, type LightGroupMember } from '@mosaic-home/design-system/web';

let members: LightGroupMember[] = [
  { id: 'pendants', name: 'Pendants', on: true, brightness: 80 },
  { id: 'counter', name: 'Counter strip', on: true, brightness: 40 },
  { id: 'spots', name: 'Spots', on: false, brightness: 0 },
];

// A null id changes every light in the group.
const change = (id: string | null, patch: Partial<LightGroupMember>): void => {
  members = members.map((m) => (id === null || m.id === id ? { ...m, ...patch } : m));
  group.update({ members });
};

const group = createLightGroup({
  name: 'Kitchen',
  members,
  onToggle: (on) => change(null, { on }),
  onBrightness: (brightness) => change(null, { brightness, on: brightness > 0 }),
  onMemberToggle: (id, on) => change(id, { on }),
  onMemberBrightness: (id, brightness) => change(id, { brightness, on: brightness > 0 }),
});

document.body.append(group.el);
`,La=`import { createLink } from '@mosaic-home/design-system/web';

const help = createLink({ text: 'how sensors report', href: 'https://example.com/sensors', external: true });

// Without an href the link renders a button: an action that looks like a link.
const more = createLink({
  text: 'Show three more devices',
  onClick: () => more.setText('All devices shown'),
});

const note = document.createElement('p');
note.append('The hallway sensor reports every five minutes. Read ', help.el, '. ', more.el);

document.body.append(note);
`,Ra=`import { createList, type ListItemOptions } from '@mosaic-home/design-system/web';

const lights = [
  { name: 'Kitchen light', on: true },
  { name: 'Hallway', on: false },
  { name: 'Desk lamp', on: true },
];

const rows = (): ListItemOptions[] =>
  lights.map((light) => ({
    title: light.name,
    icon: light.on ? 'lightbulb-on' : 'lightbulb',
    trailing: light.on ? 'On' : 'Off',
    onClick: () => {
      light.on = !light.on;
      list.setItems(rows());
    },
  }));

const list = createList({ label: 'Lights', inset: true, items: rows() });

document.body.append(list.el);
`,za=`import { createLockControl, type LockState } from '@mosaic-home/design-system/web';

// Shows the busy state until the lock reports back.
const move = (busy: LockState, done: LockState) => {
  lock.update({ state: busy });
  setTimeout(() => lock.update({ state: done }), 1000);
};

const lock = createLockControl({
  label: 'Front door',
  state: 'locked',
  // Unlocking asks for a second tap.
  confirm: true,
  onLock: () => move('locking', 'locked'),
  onUnlock: () => move('unlocking', 'unlocked'),
});

document.body.append(lock.el);
`,Ba=`import { createMap, createText, type MapMarker } from '@mosaic-home/design-system/web';

const places: MapMarker[] = [
  { lat: 51.0004, lon: 7.0012, label: 'Home', icon: 'home' },
  { lat: 51.0042, lon: 7.0091, label: 'Workshop', tone: 'neutral' },
  { lat: 50.9968, lon: 7.0108, label: 'Pier' },
];

const status = createText('Select a place.', { variant: 'caption', tone: 'muted' });

const map = createMap({
  label: 'Around the house',
  // Your tile server's XYZ template and the credit it asks for.
  tiles: 'https://tiles.example.com/{z}/{x}/{y}.png',
  attribution: '© Example Maps',
  markers: places,
  onMarkerSelect: (place) => {
    status.textContent = \`\${place.label ?? 'Place'} selected\`;
    map.setView({ lat: place.lat, lon: place.lon });
  },
});

document.body.append(map.el, status);
`,Va=`import { createMediaList, createText, type MediaListItem } from '@mosaic-home/design-system/web';

const songs: MediaListItem[] = [
  { title: 'Lanterns on the Quay', subtitle: 'Mira Holloway', meta: '3:42' },
  { title: 'Slow Tide Radio', subtitle: 'The Fenwick Lamps', meta: '4:15' },
  { title: 'Paper Weather', subtitle: 'Juno Marsh', meta: '2:58' },
];

const playing = createText('Nothing playing', { variant: 'caption', tone: 'muted' });

const queue = createMediaList({
  label: 'Up next',
  items: songs,
  action: 'play',
  actionLabel: 'Play',
  onSelect: (i) => (playing.textContent = \`Playing \${songs[i]!.title}\`),
});

document.body.append(queue.el, playing);
`,Ha=`import { createMediaPlayer, type MediaPlayerData } from '@mosaic-home/design-system/web';

let data: MediaPlayerData = {
  title: 'Lanterns Over the Quay',
  subtitle: 'Marlow and the Tidelines',
  art: '/covers/lanterns-over-the-quay.jpg',
  state: 'playing',
  position: 83,
  duration: 227,
  volume: 0.45,
  can: { play: true, pause: true, next: true, previous: true, volume: true, seek: true },
};

const set = (changes: Partial<MediaPlayerData>) => {
  data = { ...data, ...changes };
  player.update({ ...data, ...events });
};

const events = {
  onPlay: () => set({ state: 'playing' }),
  onPause: () => set({ state: 'paused' }),
  onNext: () => set({ position: 0 }),
  onPrevious: () => set({ position: 0 }),
  onSeek: (position: number) => set({ position }),
  onVolume: (volume: number) => set({ volume }),
};

const player = createMediaPlayer({ ...data, ...events });

document.body.append(player.el);
`,Ua=`import { createMediaTimeline, createText, formatTimecode, type TimelineTrack } from '@mosaic-home/design-system/web';

const tracks: TimelineTrack[] = [
  {
    id: 'video',
    name: 'Video',
    icon: 'film',
    clips: [
      { id: 'garden', start: 0, end: 7.5, label: 'Morning garden' },
      { id: 'kitchen', start: 7.5, end: 15, label: 'Kitchen', tone: 2 },
    ],
  },
  { id: 'titles', name: 'Titles', clips: [{ id: 'title', start: 1, end: 5, label: 'Our week', tone: 5 }] },
  { id: 'music', name: 'Music', icon: 'music', locked: true, clips: [{ id: 'song', start: 0, end: 20, label: 'Quiet Harbour', tone: 4 }] },
];

const status = createText('Drag clips to move them, their edges to trim.', { variant: 'caption', tone: 'muted' });

const timeline = createMediaTimeline({
  label: 'Edit timeline',
  duration: 20,
  tracks,
  zoom: 40,
  onSeek: (t) => (status.textContent = \`Playhead at \${formatTimecode(t, { decimals: 1 })}\`),
  onClipChange: (change, committed) => {
    if (committed) status.textContent = \`\${change.clipId}: \${formatTimecode(change.start)} to \${formatTimecode(change.end)}\`;
  },
});

document.body.append(timeline.el, status);
`,Wa=`import { createMenuBar } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const menuBar = createMenuBar({
  label: 'Floor plan editor',
  menus: [
    {
      label: 'File',
      items: [
        { value: 'new', label: 'New plan', shortcut: 'Ctrl+N' },
        { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
        { separator: true },
        { value: 'delete', label: 'Delete plan', danger: true },
      ],
    },
    { label: 'Edit', items: [{ value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' }, { value: 'redo', label: 'Redo' }] },
    { label: 'View', items: [{ value: 'grid', label: 'Show grid', checked: true }] },
  ],
  // For a checkable item, \`checked\` is its new state.
  onSelect: (value, checked) => (status.textContent = checked === undefined ? value : \`\${value}: \${checked}\`),
});

document.body.append(menuBar.el, status);
`,Ga=`import { createIconButton, createMenu, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });
const more = createIconButton({ icon: 'more', label: 'Scene actions' });

createMenu({
  anchor: more.el,
  items: [
    { value: 'edit', label: 'Edit', icon: 'edit', shortcut: 'E' },
    { value: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
    { value: 'share', label: 'Share', icon: 'share' },
    { separator: true },
    { value: 'delete', label: 'Delete', icon: 'delete', danger: true },
  ],
  onSelect: (value) => (status.textContent = \`Chosen: \${value}\`),
});

document.body.append(more.el, status);
`,Ka=`import { createMeter } from '@mosaic-home/design-system/web';

let level = 64;

const noise = createMeter({
  value: level,
  label: 'Noise level',
  zones: { warning: 70, danger: 90 },
  segments: 12,
  valueText: \`\${level} dB\`,
});

const signal = createMeter({ value: 3, max: 4, mode: 'bars', label: 'Wi-Fi signal', valueText: '3 of 4' });

setInterval(() => {
  level = Math.max(30, Math.min(100, level + Math.round((Math.random() - 0.5) * 16)));
  noise.setValue(level, \`\${level} dB\`);
}, 500);

document.body.append(noise.el, signal.el);
`,qa=`import { createMonthGrid } from '@mosaic-home/design-system/web';

// Energy used per day in March; days after today have no data yet.
const energy = [
  6.1, 5.4, 7.2, 4.8, 5.9, 8.3, 8.8, 5.1, 6.0, 5.7, 4.9, 6.4, 9.1,
  8.6, 5.3, 5.8, 6.2, 4.6, 5.5, 8.7, 9.4, 6.0, 5.2, 4.7, 6.3,
];

const grid = createMonthGrid({
  year: 2026,
  month: 3,
  values: energy,
  label: 'Energy used per day',
  today: 25,
  format: (v) => \`\${v.toFixed(1)} kWh\`,
});

document.body.append(grid.el);
`,Ja=`import { createMultiSelect } from '@mosaic-home/design-system/web';

const rooms = createMultiSelect({
  label: 'Rooms',
  placeholder: 'Choose rooms',
  options: [
    { value: 'living', label: 'Living room', icon: 'home', description: '4 lights' },
    { value: 'kitchen', label: 'Kitchen', icon: 'lightbulb', description: '3 lights' },
    { value: 'bedroom', label: 'Bedroom', icon: 'lightbulb', description: '2 lights' },
    { value: 'study', label: 'Study', icon: 'lightbulb', description: '2 lights' },
  ],
  values: ['living', 'kitchen'],
  helper: 'The scene runs in every chosen room.',
  onChange: (values) => rooms.setError(values.length ? undefined : 'Choose at least one room.'),
});

document.body.append(rooms.el);
`,Ya=`import { createNavRail } from '@mosaic-home/design-system/web';

const rail = createNavRail({
  label: 'Main',
  value: 'home',
  items: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'lights', label: 'Lights', icon: 'lightbulb', iconSelected: 'lightbulb-on' },
    { id: 'media', label: 'Media', icon: 'music' },
    { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 3, badgeLabel: '3 unread' },
  ],
  footerItems: [{ id: 'settings', label: 'Settings', icon: 'settings' }],
  onChange: (id) => {
    // Opening the alerts marks them read.
    if (id === 'alerts') rail.setBadge('alerts', null);
  },
});

document.body.append(rail.el);
`,Xa=`import { createNotice, h } from '@mosaic-home/design-system/web';

const answer = h('p', { 'aria-live': 'polite' });

const permission = createNotice({
  kind: 'permission',
  icon: 'microphone',
  title: 'Talk to your home',
  message: 'Allow microphone access to control lights and climate by voice.',
  points: ['Listens only while you hold the button', 'Turn it off any time in Settings'],
  actions: [
    { label: 'Allow microphone', primary: true, onClick: () => (answer.textContent = 'Allowed') },
    { label: 'Not now', dismisses: true, onClick: () => (answer.textContent = 'Asked again later') },
  ],
});

const tip = createNotice({
  kind: 'tip',
  message: 'Long-press a tile to change its size or move it to another room.',
  actions: [{ label: 'Got it', primary: true, dismisses: true }],
});

document.body.append(permission.el, answer, tip.el);
`,Za=`import { mdiDoorOpen, mdiWashingMachine, mdiWaterAlert } from '@mdi/js';
import { createNotificationCentre, type NotificationItem } from '@mosaic-home/design-system/web';

let notifications: NotificationItem[] = [
  {
    id: 'leak',
    title: 'Water under the kitchen sink',
    message: 'The leak sensor has been wet for 2 minutes.',
    priority: 'critical',
    icon: mdiWaterAlert,
    time: 'Now',
    actions: [{ id: 'valve', label: 'Close main valve', tone: 'primary' }],
  },
  { id: 'door', title: 'Back door left open', group: 'Security', icon: mdiDoorOpen, time: '10 min' },
  { id: 'washer', title: 'Washing finished', group: 'Appliances', icon: mdiWashingMachine, time: '12 min' },
];

const without = (ids: string[]): void => {
  notifications = notifications.filter((n) => !ids.includes(n.id));
  centre.update({ notifications });
};

const centre = createNotificationCentre({
  notifications,
  onAction: (id) => without([id]),
  onDismiss: (id) => without([id]),
  onClearAll: without,
});

document.body.append(centre.el);
`,Qa=`import { createNumberInput } from '@mosaic-home/design-system/web';

const target = createNumberInput({
  label: 'Target temperature',
  value: 21.5,
  min: 7,
  max: 30,
  step: 0.5,
  unit: '°C',
  helper: 'Between 7 and 30 °C.',
  onChange: (value) => target.setHelper(\`Heating to \${value} °C.\`),
});

document.body.append(target.el);
`,$a=`import { createOnboarding, createSwitch, createText } from '@mosaic-home/design-system/web';

const status = createText('', { variant: 'caption', tone: 'muted' });
const notifications = createSwitch({ label: 'Allow notifications', row: true, checked: true });

const intro = createOnboarding({
  steps: [
    { title: 'Welcome home', text: 'Every room, light and sensor on one screen.', icon: 'home' },
    { title: 'Group by room', text: 'Rooms keep the dashboard short. Reorder them any time.', icon: 'lightbulb' },
    { title: 'Stay in the loop', text: 'Get a gentle chime when a door is left open.', icon: 'bell', content: notifications.el },
  ],
  onStepChange: (index) => (status.textContent = \`Step \${index + 1}\`),
  onDone: () => (status.textContent = \`Done, notifications \${notifications.isChecked() ? 'on' : 'off'}\`),
  onSkip: () => (status.textContent = 'Skipped'),
});

document.body.append(intro.el, status);
`,eo=`import { createOpeningsSummary, type OpeningEntry } from '@mosaic-home/design-system/web';

let items: OpeningEntry[] = [
  // Should be shut now: takes the warning tone and goes first.
  { id: 'skylight', name: 'Skylight', kind: 'window', open: true, area: 'Landing', alert: true },
  { id: 'back', name: 'Back door', kind: 'door', open: true, area: 'Kitchen', since: '5 min' },
  { id: 'garage', name: 'Garage door', kind: 'garage', open: false },
];

const summary = createOpeningsSummary({
  items,
  reason: 'Rain expected within the hour',
  onSelect: (id) => {
    items = items.map((item) => (item.id === id ? { ...item, open: false, alert: false } : item));
    summary.update({ items });
  },
});

document.body.append(summary.el);
`,to=`import { createIconButton, createPageHeader } from '@mosaic-home/design-system/web';

const allOff = createIconButton({
  icon: 'power',
  label: 'Turn off all lights',
  onClick: () => header.setSubtitle('All lights off'),
});

const header = createPageHeader({
  eyebrow: 'Ground floor',
  title: 'Living room',
  subtitle: '3 lights on',
  back: { label: 'Back to rooms', onClick: () => history.back() },
  actions: [allOff.el],
});

document.body.append(header.el);
`,no=`import { createPagination } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const pagination = createPagination({
  label: 'Event log pages',
  count: 12,
  page: 1,
  onChange: (page) => (status.textContent = \`Showing events \${(page - 1) * 20 + 1} to \${page * 20}\`),
});

document.body.append(status, pagination.el);
`,ro=`import { applyTheme } from '@mosaic-home/design-system/web';

// Sets the --mh-* variables on <html> and returns the resolved tokens.
const tokens = applyTheme('midnight');

// In CSS, colour roles are variables that follow the theme.
const badge = document.createElement('span');
badge.textContent = 'Heating';
badge.style.background = 'var(--mh-accent-soft)';
badge.style.color = 'var(--mh-accent-light)';

// Where CSS can't reach (a canvas), read the palette.
const chart = document.createElement('canvas');
chart.width = 240;
chart.height = 80;
const ctx = chart.getContext('2d')!;
tokens.theme.palette.series.slice(0, 3).forEach((colour, i) => {
  ctx.fillStyle = colour;
  ctx.fillRect(i * 80 + 8, 80 - (i + 1) * 24, 64, (i + 1) * 24);
});

document.body.append(badge, chart);
`,io=`import { createIconButton, createPanelGroup, createText } from '@mosaic-home/design-system/web';

const refresh = createIconButton({ icon: 'refresh', label: 'Refresh' });

const dock = createPanelGroup({
  label: 'Diagnostics',
  panels: [
    { id: 'events', label: 'Events', icon: 'bell', badge: 2, content: createText('Motion in the hall at 14:02.') },
    { id: 'devices', label: 'Devices', icon: 'wifi', content: createText('12 devices online, 1 asleep.') },
    { id: 'logs', label: 'Logs', icon: 'info', content: createText('Heartbeat at 14:05.', { variant: 'mono' }) },
  ],
  value: 'events',
  actions: [refresh.el],
  collapsible: true,
  onChange: (id) => refresh.setDisabled(id === 'logs'),
});

document.body.append(dock.el);
`,ao=`import { createButton, createIconButton, createPanel, createSwitch } from '@mosaic-home/design-system/web';

const lights = [
  createSwitch({ label: 'Ceiling', row: true, checked: true }),
  createSwitch({ label: 'Floor lamp', row: true }),
];

const allOff = createButton({
  label: 'All off',
  variant: 'secondary',
  size: 'small',
  onClick: () => lights.forEach((light) => light.setChecked(false)),
});

const panel = createPanel({
  title: 'Lights',
  icon: 'lightbulb',
  description: 'Living room',
  actions: [createIconButton({ icon: 'more', label: 'Light options' }).el],
  body: lights.map((light) => light.el),
  footer: [allOff.el],
});

document.body.append(panel.el);
`,oo=`import { createPeopleStrip, type PersonEntry } from '@mosaic-home/design-system/web';

const people: PersonEntry[] = [
  { id: 'robin', name: 'Robin Vale', where: 'home', since: '2 h' },
  { id: 'kit', name: 'Kit Harrow', where: 'zone', zone: 'Studio', since: '25 min' },
  { id: 'ash', name: 'Ash Merrow', where: 'away', since: '3 h' },
];

const strip = createPeopleStrip({
  people,
  onSelect: (id) => console.log('Show details for', id),
});

// Later someone arrives home: hand over the new list.
setTimeout(() => {
  const kit: PersonEntry = { id: 'kit', name: 'Kit Harrow', where: 'home', since: 'Just now' };
  strip.update({ people: people.map((p) => (p.id === kit.id ? kit : p)) });
}, 3000);

document.body.append(strip.el);
`,so=`import { createIconButton, createPopover, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });
const info = createIconButton({ icon: 'info', label: 'About this sensor' });

// Pressing the anchor opens and closes it.
createPopover({
  anchor: info.el,
  title: 'Air quality',
  content: h('p', {}, 'Measured every five minutes in the hallway. Readings under 50 are good.'),
  onOpen: () => (status.textContent = 'Showing details'),
  onClose: () => (status.textContent = ''),
});

document.body.append(info.el, status);
`,co=`import { createPositionControl } from '@mosaic-home/design-system/web';

const blind = createPositionControl({
  label: 'Studio blind',
  state: 'stopped',
  position: 50,
  can: { open: true, close: true, stop: true, position: true },
  labels: { open: 'Raise', close: 'Lower' },
  onOpen: () => blind.update({ state: 'open', position: 100 }),
  onClose: () => blind.update({ state: 'closed', position: 0 }),
  onStop: () => blind.update({ state: 'stopped' }),
  onPosition: (position) => blind.update({ state: 'stopped', position }),
});

document.body.append(blind.el);
`,lo=`import { createPriceStrip } from '@mosaic-home/design-system/web';

const today = [
  0.31, 0.29, 0.24, 0.18, 0.15, 0.14, 0.17, 0.26, 0.34, 0.33, 0.27, 0.22,
  0.19, 0.16, 0.13, 0.12, 0.18, 0.29, 0.41, 0.44, 0.38, 0.32, 0.28, 0.25,
];

const strip = createPriceStrip({
  label: 'Electricity prices today',
  prices: today.map((value, hour) => ({ label: String(hour), name: \`\${hour}:00\`, value })),
  // The slot running now; the cheapest three hours from here on are shaded.
  current: new Date().getHours(),
  unit: '/kWh',
  end: '24:00',
});

document.body.append(strip.el);
`,uo=`import { createButton, createProgressBar } from '@mosaic-home/design-system/web';

const bar = createProgressBar({ label: 'Firmware update', showLabel: true, showValue: true, value: 0 });

const start = createButton({
  label: 'Update',
  icon: 'download',
  onClick: () => {
    start.setDisabled(true);
    let value = 0;
    const timer = setInterval(() => {
      value += 10;
      bar.setValue(value);
      if (value < 100) return;
      clearInterval(timer);
      start.setDisabled(false);
    }, 400);
  },
});

document.body.append(bar.el, start.el);
`,fo=`import { createProgressList, type ProgressListItem } from '@mosaic-home/design-system/web';

const jobs = (step: number): ProgressListItem[] => {
  const firmware = Math.min(100, step * 10);
  return [
    {
      name: 'Hallway sensor firmware',
      value: firmware,
      status: firmware === 100 ? 'Installed' : 'Updating',
      detail: 'Version 2.3.1',
      tone: firmware === 100 ? 'success' : 'accent',
    },
    { name: 'Weekly backup', value: Math.min(100, 40 + step * 4), status: 'Uploading', detail: 'of 3.4 GB' },
    { name: 'Garden map', value: null, status: 'Preparing' },
  ];
};

const list = createProgressList({ label: 'Updates and backups', items: jobs(0) });

let step = 0;
const timer = setInterval(() => {
  step += 1;
  list.setItems(jobs(step));
  if (step === 15) clearInterval(timer);
}, 800);

document.body.append(list.el);
`,po=`import { createButton, createProgressRing } from '@mosaic-home/design-system/web';

const total = 8;
let done = 3;

const ring = createProgressRing({ label: 'Rooms set up', value: done, max: total, valueText: \`\${done}/\${total}\`, size: 'large' });

const next = createButton({
  label: 'Set up next room',
  variant: 'secondary',
  onClick: () => {
    done = Math.min(total, done + 1);
    ring.setValue(done, \`\${done}/\${total}\`);
    if (done === total) next.setDisabled(true);
  },
});

document.body.append(ring.el, next.el);
`,mo=`import { createBadge, createPropertyList, type PropertyListItem } from '@mosaic-home/design-system/web';

const details = (minutesLeft: number): PropertyListItem[] => [
  { label: 'Status', value: createBadge({ label: 'Printing', tone: 'accent' }).el },
  { label: 'Time left', value: \`\${minutesLeft} min\` },
  { label: 'Nozzle', value: '215 °C' },
  { label: 'File', value: 'shelf_bracket_v2.gcode' },
];

let minutesLeft = 78;
const printer = createPropertyList({ items: details(minutesLeft) });

setInterval(() => {
  minutesLeft = Math.max(0, minutesLeft - 1);
  printer.setItems(details(minutesLeft));
}, 60_000);

document.body.append(printer.el);
`,ho=`import { createQrCode, createTextField } from '@mosaic-home/design-system/web';

const start = 'https://homeassistant.local:8123/';

const code = createQrCode({
  value: start,
  label: 'Link to the dashboard',
  caption: 'Open on your phone',
});

const field = createTextField({
  label: 'Link',
  value: start,
  onInput: (value) => code.setValue(value),
});

document.body.append(field.el, code.el);
`,go=`import { createRadialDial } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const volume = createRadialDial({
  label: 'Volume',
  value: 35,
  ticks: 11,
  format: (v) => \`\${v}%\`,
  onChange: (value) => (status.textContent = \`Kitchen speaker at \${value}%\`),
});

document.body.append(volume.el, status);
`,_o=`import { createRadioGroup } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const mode = createRadioGroup({
  legend: 'Heating mode',
  value: 'auto',
  options: [
    { value: 'auto', label: 'Auto', description: 'Follow the weekly schedule.' },
    { value: 'comfort', label: 'Comfort' },
    { value: 'eco', label: 'Eco', description: 'Two degrees lower while nobody is home.' },
    { value: 'off', label: 'Off' },
  ],
  onChange: (value) => (status.textContent = \`Heating mode: \${value}\`),
});

document.body.append(mode.el, status);
`,vo=`import { createRangeSlider } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const comfort = createRangeSlider({
  label: 'Comfort range',
  min: 14,
  max: 28,
  step: 0.5,
  minGap: 1,
  value: [19, 23],
  showValue: true,
  format: (v) => \`\${v.toFixed(1)}°\`,
  labels: { low: 'Heat below', high: 'Cool above' },
  onChange: ([low, high]) => (status.textContent = \`Heating below \${low}°, cooling above \${high}°\`),
});

document.body.append(comfort.el, status);
`,yo=`import { createRating } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const rating = createRating({
  label: 'How was the film?',
  value: 4,
  // Choosing the current star again clears the rating to 0.
  onChange: (value) => (status.textContent = value ? \`You gave it \${value} of 5\` : 'Not rated'),
});

document.body.append(rating.el, status);
`,bo=`import { createRecordingPill, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' }, 'Recording');

// Stands in for the microphone's input level (0–1).
const levels = setInterval(() => pill.setLevel(Math.random()), 120);

const pill = createRecordingPill({
  onPauseToggle: (paused) => (status.textContent = paused ? 'Paused' : 'Recording'),
  onStop: () => {
    clearInterval(levels);
    status.textContent = \`Saved a \${pill.elapsed} second note\`;
    pill.destroy();
    pill.el.remove();
  },
});

document.body.append(pill.el, status);
`,xo=`import { createReorderableList, createStack, createText } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office'];
const order = createText(\`Order: \${rooms.join(', ')}\`, { variant: 'caption', tone: 'muted' });

const list = createReorderableList({
  label: 'Room order on the dashboard',
  items: rooms.map((room) => ({ id: room, label: room, icon: 'home' })),
  // Ids are the room names here, so the new order reads directly.
  onChange: (ids) => (order.textContent = \`Order: \${ids.join(', ')}\`),
});

document.body.append(createStack({ gap: 'md' }, list.el, order).el);
`,So=`import { mdiFan } from '@mdi/js';
import { createRoomCard, type RoomToggle } from '@mosaic-home/design-system/web';

let toggles: RoomToggle[] = [
  { id: 'lights', label: 'Lights', icon: 'lightbulb', on: true },
  { id: 'fan', label: 'Fan', icon: mdiFan, on: false, tone: 'cool' },
];

const card = createRoomCard({
  name: 'Living room',
  temperature: 21.5,
  humidity: 46,
  lightsOn: 3,
  lightsTotal: 4,
  toggles,
  onOpen: () => location.assign('#/rooms/living-room'),
  onToggle: (id, on) => {
    toggles = toggles.map((t) => (t.id === id ? { ...t, on } : t));
    card.update({ toggles });
    if (id === 'lights') card.update({ lightsOn: on ? 4 : 0 });
  },
});

document.body.append(card.el);
`,Co=`import { mdiCoffeeOutline, mdiMovieOpenOutline, mdiWeatherNight, mdiWeatherSunset } from '@mdi/js';
import { createSceneGrid, type Scene } from '@mosaic-home/design-system/web';

const scenes: Scene[] = [
  { id: 'morning', label: 'Morning', icon: mdiCoffeeOutline, description: 'Bright, cool white' },
  { id: 'evening', label: 'Evening', icon: mdiWeatherSunset, description: 'Dim, warm' },
  { id: 'film', label: 'Film night', icon: mdiMovieOpenOutline, description: 'Lamps low, blinds down' },
  { id: 'night', label: 'Goodnight', icon: mdiWeatherNight, description: 'Everything off' },
];

const grid = createSceneGrid({
  label: 'Scenes',
  scenes,
  active: 'evening',
  onActivate: (id) => grid.update({ active: id }),
});

document.body.append(grid.el);
`,wo=`import { createScheduleEditor, type ScheduleDay } from '@mosaic-home/design-system/web';

// Times are minutes after midnight.
const workday = [
  { start: 6 * 60 + 30, end: 8 * 60, value: 'comfort' },
  { start: 17 * 60, end: 22 * 60, value: 'comfort' },
];
const weekend = [{ start: 8 * 60, end: 23 * 60, value: 'comfort' }];

const days: ScheduleDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
  label,
  blocks: i < 5 ? workday : weekend,
}));

const schedule = createScheduleEditor({
  label: 'Living room heating',
  days,
  levels: [
    { value: 'comfort', label: '21°' },
    { value: 'eco', label: '18°' },
  ],
  base: '16°',
  onChange: (next) => console.log('Save the schedule', next),
});

document.body.append(schedule.el);
`,To=`import { createCard, createScreen, createStack, createText } from '@mosaic-home/design-system/web';

const header = createStack(
  { gap: 'xxs' },
  createText('Living room', { variant: 'eyebrow', tone: 'muted' }),
  createText('Good evening', { variant: 'headline' }),
);

const screen = createScreen(
  { width: 'medium', label: 'Home', header: header.el },
  createCard({ title: 'Climate', body: createText('21.5° and 46% humidity.', { tone: 'muted' }) }).el,
  createCard({ title: 'Lights', body: createText('Kitchen light and 2 others are on.', { tone: 'muted' }) }).el,
);

document.body.append(screen.el);
`,Eo=`import { createList, createScrollPanel } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office', 'Bathroom', 'Garden', 'Garage', 'Attic'];

const list = createList({
  items: rooms.map((title, i) => ({ title, subtitle: \`\${i + 1} devices\`, icon: 'home' })),
});

const panel = createScrollPanel({ label: 'Rooms', size: 'medium' }, list.el);

document.body.append(panel.el);
`,Do=`import { createSearchField } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Study', 'Hallway'];
const results = document.createElement('ul');

function show(query: string) {
  const q = query.trim().toLowerCase();
  const matches = rooms.filter((room) => room.toLowerCase().includes(q));
  results.replaceChildren(...matches.map((room) => Object.assign(document.createElement('li'), { textContent: room })));
}

const search = createSearchField({
  placeholder: 'Search rooms',
  onInput: (value) => show(value),
  onClear: () => show(''),
});
show('');

document.body.append(search.el, results);
`,Oo=`import { createSecretField } from '@mosaic-home/design-system/web';

const password = createSecretField({
  label: 'New password',
  kind: 'new-password',
  required: true,
  helper: 'At least 12 characters.',
  onInput: (value) => password.setSuccess(value.length >= 12 ? 'Long enough.' : undefined),
});

document.body.append(password.el);
`,ko=`import { createSegmentedControl } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const range = createSegmentedControl({
  label: 'Energy range',
  value: 'week',
  options: [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ],
  onChange: (value) => (status.textContent = \`Showing the last \${value}\`),
});

document.body.append(range.el, status);
`,Ao=`import { createSelect } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const room = createSelect({
  label: 'Room',
  placeholder: 'Choose a room',
  options: [
    { value: 'living', label: 'Living room' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'garage', label: 'Garage', disabled: true },
  ],
  onChange: (value) => (status.textContent = \`The scene runs in: \${value}\`),
});

document.body.append(room.el, status);
`,jo=`import { applyTheme } from '@mosaic-home/design-system/web';

const tokens = applyTheme('daylight', { deviceClass: 'phone', character: { density: 'compact' } });

// Prefer the variables: they follow the theme's corners and density.
const tile = document.createElement('div');
tile.textContent = 'Bedroom';
Object.assign(tile.style, {
  padding: 'var(--mh-space-md)',
  borderRadius: 'var(--mh-radius-lg)',
  minHeight: 'var(--mh-control-lg)',
  background: 'var(--mh-surface-raised)',
});

// The numbers are there for layout done in code.
const gap = tokens.space.sm;
const columns = Math.max(1, Math.floor((window.innerWidth + gap) / (160 + gap)));
const grid = document.createElement('div');
Object.assign(grid.style, {
  display: 'grid',
  gap: \`\${gap}px\`,
  gridTemplateColumns: \`repeat(\${columns}, 1fr)\`,
});
grid.append(tile);

document.body.append(grid);
`,Mo=`import { createSkeleton, h } from '@mosaic-home/design-system/web';

const card = h('div', { 'aria-live': 'polite' }, createSkeleton({ lines: 3, label: 'Loading the forecast' }).el);

// Swap the placeholder for the content once it has loaded.
setTimeout(() => {
  card.replaceChildren(
    h('h3', {}, 'Tomorrow'),
    h('p', {}, 'Light rain in the morning, clearing by noon.'),
    h('p', {}, 'High of 17°, low of 9°.'),
  );
}, 1500);

document.body.append(card);
`,No=`import { createSlider } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const brightness = createSlider({
  label: 'Brightness',
  value: 60,
  step: 5,
  showValue: true,
  format: (v) => \`\${v}%\`,
  // onInput fires while dragging; onChange once the thumb is let go.
  onChange: (value) => (status.textContent = \`Kitchen lights set to \${value}%\`),
});

document.body.append(brightness.el, status);
`,Po=`import { createSparkline } from '@mosaic-home/design-system/web';

const readings = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 22.3];

const sparkline = createSparkline({
  values: readings,
  label: 'Living room temperature, last 12 hours',
  area: true,
  format: (v) => \`\${v.toFixed(1)}°\`,
});

// A new reading arrives: drop the oldest and redraw.
setInterval(() => {
  const last = readings[readings.length - 1] ?? 21;
  readings.push(Math.round((last + (Math.random() - 0.5)) * 10) / 10);
  readings.shift();
  sparkline.setValues(readings);
}, 2000);

document.body.append(sparkline.el);
`,Fo=`import { createSpeakerSelector, type Speaker, type SpeakerSelectorEvents } from '@mosaic-home/design-system/web';

let speakers: Speaker[] = [
  { id: 'living', name: 'Living room', detail: 'Soundbar', selected: true, volume: 0.42, muted: false },
  { id: 'kitchen', name: 'Kitchen', detail: 'Shelf speaker', selected: true, volume: 0.25, muted: false },
  { id: 'study', name: 'Study', detail: 'Desk speaker', volume: 0.5, muted: false },
];

const change = (id: string, patch: Partial<Speaker>): void => {
  speakers = speakers.map((s) => (s.id === id ? { ...s, ...patch } : s));
  selector.update({ speakers, multiple: true, ...events });
};

const events: SpeakerSelectorEvents = {
  onSelect: (id, selected) => change(id, { selected }),
  onVolume: (id, volume) => change(id, { volume, muted: false }),
  onMute: (id, muted) => change(id, { muted }),
};

const selector = createSpeakerSelector({ speakers, multiple: true, ...events });

document.body.append(selector.el);
`,Io=`import { createSpinner, h } from '@mosaic-home/design-system/web';

const panel = h('div', { 'aria-live': 'polite' }, createSpinner({ size: 'large', label: 'Loading rooms' }).el);

// Swap the spinner for the content once it has loaded.
setTimeout(() => {
  panel.replaceChildren(h('p', {}, 'Living room, Kitchen, Bedroom and Garden are ready.'));
}, 1500);

document.body.append(panel);
`,Lo=`import { createSplitButton, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });

const runScene = createSplitButton({
  label: 'Run scene',
  icon: 'play',
  items: [
    { value: 'in-10', label: 'Run in 10 minutes', icon: 'refresh' },
    { value: 'at-sunset', label: 'Run at sunset', icon: 'weather' },
    { separator: true },
    { value: 'edit', label: 'Edit scene', icon: 'edit' },
  ],
  onClick: () => (status.textContent = 'Evening scene is running'),
  onSelect: (value) => (status.textContent = \`Chosen: \${value}\`),
});

document.body.append(runScene.el, status);
`,Ro=`import { createList, createSplitPane, createStack, createText } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Office'];
const title = createText('Living room', { variant: 'title' });
const status = createText('Room list at 35%', { variant: 'caption', tone: 'muted' });

const list = createList({
  label: 'Rooms',
  items: rooms.map((room) => ({ title: room, icon: 'home', onClick: () => (title.textContent = room) })),
});

const split = createSplitPane({
  start: list.el,
  end: createStack({ gap: 'sm' }, title, createText('3 lights on, 21.5°.', { tone: 'muted' })).el,
  size: 35,
  min: 25,
  max: 65,
  collapsible: 'start',
  label: 'Resize room list',
  startLabel: 'Rooms',
  onResize: (size) => (status.textContent = \`Room list at \${size}%\`),
  onCollapse: (collapsed) => (status.textContent = collapsed ? 'Room list folded away' : 'Room list shown'),
});
// The panes fill the split's height, so it needs one.
split.el.style.height = '320px';

document.body.append(split.el, status);
`,zo=`import { createButton, createCard, createGrid, createRow, createStack, createText } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Office'];
const grid = createGrid({ min: 'small', gap: 'sm' }, ...rooms.map((title) => createCard({ title }).el));

const addRoom = createButton({
  label: 'Add room',
  icon: 'add',
  variant: 'secondary',
  size: 'small',
  onClick: () => grid.el.append(createCard({ title: \`Room \${grid.el.children.length + 1}\` }).el),
});

const page = createStack(
  { gap: 'lg' },
  createRow({ justify: 'between' }, createText('Rooms', { variant: 'title' }), addRoom.el).el,
  grid.el,
);

document.body.append(page.el);
`,Bo=`import { mdiDoorOpen, mdiLightbulbOutline, mdiThermostat } from '@mdi/js';
import { createStateTimeline, type StateTimelineRow } from '@mosaic-home/design-system/web';

const today = (hours: number, minutes = 0): Date => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// A span with \`to: null\` is still going on.
const rows: StateTimelineRow[] = [
  {
    label: 'Hall light',
    icon: mdiLightbulbOutline,
    spans: [{ from: today(6, 40), to: today(7, 55) }, { from: today(17, 10), to: null }],
  },
  {
    label: 'Back door',
    icon: mdiDoorOpen,
    state: 'Open',
    color: 2,
    spans: [{ from: today(8, 5), to: today(8, 9) }, { from: today(12, 30), to: today(12, 52) }],
  },
  {
    label: 'Heating',
    icon: mdiThermostat,
    state: 'Heating',
    color: 5,
    spans: [{ from: today(5, 30), to: today(8, 30) }, { from: today(16, 30), to: null }],
  },
];

const timeline = createStateTimeline({
  label: 'Today at home',
  rows,
  start: today(0),
  end: today(24),
  now: Date.now(),
});

setInterval(() => timeline.update({ now: Date.now() }), 60_000);

document.body.append(timeline.el);
`,Vo=`import { createStatusBar } from '@mosaic-home/design-system/web';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const bar = createStatusBar({
  label: 'Hub status',
  items: [
    { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' },
    { id: 'devices', label: 'Devices', value: '24' },
    { id: 'time', label: 'Synced', value: now(), end: true, announce: true },
    {
      id: 'sync',
      label: 'Sync now',
      icon: 'refresh',
      end: true,
      onClick: () => bar.setItem('time', { value: now() }),
    },
  ],
});

document.body.append(bar.el);
`,Ho=`import { createStatus } from '@mosaic-home/design-system/web';

// \`announce\` reads changes out to screen readers.
const status = createStatus({ state: navigator.onLine ? 'online' : 'offline', announce: true });

window.addEventListener('online', () => status.setState('online'));
window.addEventListener('offline', () => status.setState('offline'));

document.body.append(status.el);
`,Uo=`import { createStepper } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const guests = createStepper({
  label: 'Guests',
  value: 2,
  min: 1,
  max: 8,
  format: (v) => (v === 1 ? '1 guest' : \`\${v} guests\`),
  onChange: (value) => (status.textContent = \`Guest mode for \${value}\`),
});

document.body.append(guests.el, status);
`,Wo=`import { createButton, createSteps } from '@mosaic-home/design-system/web';

const items = [
  { label: 'Connect', description: 'Plug in the hub' },
  { label: 'Network', description: 'Wi-Fi and password' },
  { label: 'Rooms', optional: true },
  { label: 'Done' },
];

const steps = createSteps({
  label: 'Hub setup',
  steps: items,
  current: 1,
  // Completed steps become buttons that go back to them.
  onSelect: (index) => steps.setCurrent(index),
});

const next = createButton({
  label: 'Next',
  variant: 'primary',
  onClick: () => steps.setCurrent(Math.min(steps.current() + 1, items.length)),
});

document.body.append(steps.el, next.el);
`,Go=`import { createStack, createSwipeRow, createText } from '@mosaic-home/design-system/web';

const status = createText('Swipe the row, or use its actions button.', { variant: 'caption', tone: 'muted' });

const row = createSwipeRow({
  label: 'Kitchen light',
  content: createStack(
    { gap: 'none' },
    createText('Kitchen light', { variant: 'label' }),
    createText('On, 80%', { variant: 'caption', tone: 'muted' }),
  ).el,
  start: [{ id: 'favourite', label: 'Favourite', icon: 'star', tone: 'accent' }],
  end: [
    { id: 'edit', label: 'Edit', icon: 'edit' },
    { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' },
  ],
  onAction: (id) => {
    status.textContent = \`\${id} on Kitchen light\`;
    row.close();
  },
});

document.body.append(row.el, status);
`,Ko=`import { createSwitch } from '@mosaic-home/design-system/web';

const motion = createSwitch({
  row: true,
  icon: 'lightbulb',
  label: 'Motion lighting',
  description: 'Turn the lights on when someone walks in.',
  checked: true,
  onChange: (on) => afterSunset.setDisabled(!on),
});

const afterSunset = createSwitch({ row: true, icon: 'weather', label: 'Only after sunset' });

document.body.append(motion.el, afterSunset.el);
`,qo=`import { createTabs } from '@mosaic-home/design-system/web';

const tabs = createTabs({
  label: 'Thermostat',
  value: location.hash.slice(1) || 'overview',
  tabs: [
    { id: 'overview', label: 'Overview', panel: 'Currently 20.5°, heating to 21°.' },
    { id: 'schedule', label: 'Schedule', panel: 'Weekdays 06:30 to 22:00 at 21°.' },
    { id: 'history', label: 'History', badge: 3, panel: 'Three changes today.' },
  ],
  // Keeps the chosen tab in the address, so a reload opens the same one.
  onChange: (id) => history.replaceState(null, '', \`#\${id}\`),
});

document.body.append(tabs.el);
`,Jo=`import { createTextArea } from '@mosaic-home/design-system/web';

const announcement = createTextArea({
  label: 'Announcement',
  placeholder: 'What should the speakers say?',
  value: 'Dinner is ready in ten minutes.',
  maxLength: 140,
  showCount: true,
  maxRows: 6,
  onChange: (value) => announcement.setError(value.trim() ? undefined : 'Write a message before sending.'),
});

document.body.append(announcement.el);
`,Yo=`import { createTextField } from '@mosaic-home/design-system/web';

const room = createTextField({
  label: 'Room name',
  placeholder: 'e.g. Kitchen',
  helper: 'Shown on tiles and in voice replies.',
  maxLength: 24,
  showCount: true,
  onChange: (value) => room.setError(value.trim() ? undefined : 'Give the room a name.'),
});

document.body.append(room.el);
`,Xo=`import { createText } from '@mosaic-home/design-system/web';

const header = document.createElement('header');
header.append(
  createText('Living room', { variant: 'eyebrow', tone: 'muted' }),
  createText('21.5°', { variant: 'display' }),
  createText('Heating to 22° until 23:00.'),
  createText('Window open', { variant: 'label', tone: 'warning' }),
);

document.body.append(header);
`,Zo=`import { createThermostat } from '@mosaic-home/design-system/web';

const thermostat = createThermostat({
  label: 'Living room thermostat',
  current: 19.5,
  target: 21,
  mode: 'heat',
  modes: [
    { value: 'off', label: 'Off' },
    { value: 'heat', label: 'Heat' },
    { value: 'cool', label: 'Cool' },
  ],
  action: 'heating',
  // Called once the taps settle, so one change is sent rather than one per tap.
  onTarget: (target) => {
    if (typeof target === 'number') thermostat.update({ target });
  },
  onMode: (mode) => thermostat.update({ mode, action: mode === 'off' ? 'off' : 'idle' }),
});

document.body.append(thermostat.el);
`,Qo=`import { createStatTile, createTile, createTileGrid } from '@mosaic-home/design-system/web';

const light = (label: string, on: boolean): HTMLElement => {
  const tile = createTile({
    icon: 'lightbulb',
    iconOn: 'lightbulb-on',
    label,
    state: on ? 'On' : 'Off',
    on,
    onToggle: (next) => tile.setState(next ? 'On' : 'Off'),
  });
  return tile.el;
};

const temperature = createStatTile({
  label: 'Temperature',
  icon: 'thermometer',
  value: '21.5',
  unit: '°C',
  trend: 'up',
  caption: 'Since 07:00',
});

const grid = createTileGrid([light('Kitchen', true), light('Living room', false), temperature.el], {
  label: 'Living room',
});

document.body.append(grid.el);
`,$o=`import { createText, createTimeline, type TimelineItem } from '@mosaic-home/design-system/web';

const departures: TimelineItem[] = [
  { time: '07:42', title: 'Line 4 to Harbour Square', detail: 'Platform 2' },
  { time: '07:51', title: 'Line 11 to North Park', detail: '3 min late', tone: 'warning' },
  { time: '08:05', title: 'Line 4 to Harbour Square', detail: 'Cancelled', tone: 'danger' },
  { time: '08:12', title: 'Express to the airport', detail: 'On time', tone: 'success' },
];

const selected = createText('Press a departure', { variant: 'caption', tone: 'muted' });

const timeline = createTimeline({
  label: 'Departures',
  items: departures,
  onSelect: (i) => (selected.textContent = \`Selected: \${departures[i]!.time} \${departures[i]!.title}\`),
});

document.body.append(timeline.el, selected);
`,es=`import { createTimer, type TimerEvents, type TimerItem } from '@mosaic-home/design-system/web';

let timers: TimerItem[] = [
  { id: 'pasta', name: 'Pasta', duration: 600, state: 'running', endsAt: Date.now() + 431_000 },
  { id: 'bread', name: 'Bread proving', duration: 5400, state: 'paused', remaining: 3725 },
];

/** Seconds left on a timer. */
const left = (t: TimerItem): number =>
  t.state === 'running' && t.endsAt ? Math.max(0, (t.endsAt - Date.now()) / 1000) : (t.remaining ?? 0);

// Returning null removes the timer.
const change = (id: string, next: (t: TimerItem) => TimerItem | null): void => {
  timers = timers.flatMap((t) => (t.id === id ? (next(t) ?? []) : [t]));
  timer.update({ timers, ...events });
};

const events: TimerEvents = {
  onPause: (id) => change(id, (t) => ({ ...t, state: 'paused', remaining: left(t), endsAt: null })),
  onResume: (id) =>
    change(id, (t) => ({ ...t, state: 'running', endsAt: Date.now() + left(t) * 1000, remaining: null })),
  onAdd: (id, seconds) =>
    change(id, (t) => {
      const rest = left(t) + seconds;
      const duration = Math.max(t.duration, rest);
      return t.state === 'paused'
        ? { ...t, remaining: rest, duration }
        : { ...t, state: 'running', endsAt: Date.now() + rest * 1000, remaining: null, duration };
    }),
  onFinish: (id) => change(id, (t) => ({ ...t, state: 'finished', endsAt: null })),
  onCancel: (id) => change(id, () => null),
  onStop: (id) => change(id, () => null),
};

const timer = createTimer({ timers, ...events });

document.body.append(timer.el);
`,ts=`import { createButton, createToaster } from '@mosaic-home/design-system/web';

const toaster = createToaster({ placement: 'bottom' });

const save = createButton({
  label: 'Save settings',
  icon: 'check',
  onClick: () => {
    toaster.show({
      tone: 'success',
      message: 'Settings saved',
      action: { label: 'Undo', onClick: () => toaster.show('Changes undone') },
    });
  },
});

document.body.append(save.el);
`,ns=`import { createTodoList, type TodoItem } from '@mosaic-home/design-system/web';

let items: TodoItem[] = [
  { id: 'milk', text: 'Oat milk', done: false, note: '2 cartons' },
  { id: 'bread', text: 'Sourdough loaf', done: false },
  { id: 'apples', text: 'Apples', done: false },
  { id: 'eggs', text: 'Eggs', done: true },
];

const set = (next: TodoItem[]): void => {
  items = next;
  list.update({ items });
};

const list = createTodoList({
  label: 'Shopping',
  items,
  onAdd: (text) => set([...items, { id: crypto.randomUUID(), text, done: false }]),
  onToggle: (id, done) => set(items.map((i) => (i.id === id ? { ...i, done } : i))),
  // The ids are the open items in their new order.
  onReorder: (ids) => set([...ids.map((id) => items.find((i) => i.id === id)!), ...items.filter((i) => i.done)]),
  onRemove: (id) => set(items.filter((i) => i.id !== id)),
  onClearCompleted: (ids) => set(items.filter((i) => !ids.includes(i.id))),
});

document.body.append(list.el);
`,rs=`import { createToggleGroup } from '@mosaic-home/design-system/web';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const status = document.createElement('p');

const repeat = createToggleGroup({
  label: 'Repeat on',
  type: 'multiple',
  values: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  options: days.map((day) => ({ value: day, label: day })),
  onChange: (values) => (status.textContent = values.length ? \`Repeats on \${values.join(', ')}\` : 'Runs once'),
});

document.body.append(repeat.el, status);
`,is=`import { createButton, createIconButton, createToolbar } from '@mosaic-home/design-system/web';

let editing = false;
const edit = createIconButton({
  icon: 'edit',
  label: 'Edit room',
  pressed: editing,
  onClick: () => {
    editing = !editing;
    edit.setPressed(editing);
  },
});

const toolbar = createToolbar({
  label: 'Floor plan',
  items: [
    createIconButton({ icon: 'arrow-left', label: 'Undo' }).el,
    createIconButton({ icon: 'arrow-right', label: 'Redo' }).el,
    'separator',
    createIconButton({ icon: 'add', label: 'Add device' }).el,
    edit.el,
    'spacer',
    createButton({ label: 'Done', size: 'small' }).el,
  ],
});

document.body.append(toolbar.el);
`,as=`import { createIconButton, createTooltip } from '@mosaic-home/design-system/web';

let refreshed = 0;

const refresh = createIconButton({
  icon: 'refresh',
  label: 'Refresh',
  onClick: () => {
    refreshed += 1;
    tooltip.setText(\`Refreshed \${refreshed} \${refreshed === 1 ? 'time' : 'times'}\`);
  },
});

const tooltip = createTooltip(refresh.el, { text: 'Refresh the device list', placement: 'bottom' });

document.body.append(refresh.el);
`,os=`import { createTransferList } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const cards = createTransferList({
  label: 'Dashboard cards',
  sourceLabel: 'Hidden',
  targetLabel: 'Shown',
  items: [
    { value: 'weather', label: 'Weather', icon: 'weather', description: 'Today and tomorrow' },
    { value: 'lights', label: 'Lights', icon: 'lightbulb', description: 'Every room' },
    { value: 'heating', label: 'Heating', icon: 'thermometer' },
    { value: 'music', label: 'Music', icon: 'music', description: 'Now playing' },
    { value: 'cameras', label: 'Cameras', icon: 'camera' },
  ],
  values: ['weather', 'lights'],
  onChange: (values) => (status.textContent = \`Shown: \${values.join(', ') || 'none'}\`),
});

document.body.append(cards.el, status);
`,ss=`import { createTransformFields, h, type TransformValue } from '@mosaic-home/design-system/web';

const box = h('div', { style: 'position: absolute; border: 2px solid var(--mh-accent)' });
const canvas = h('div', { style: 'position: relative; width: 280px; height: 200px; background: var(--mh-input)' }, box);

const draw = ({ x, y, width, height, angle }: TransformValue): void => {
  Object.assign(box.style, {
    left: \`\${x}px\`,
    top: \`\${y}px\`,
    width: \`\${width}px\`,
    height: \`\${height}px\`,
    transform: \`rotate(\${angle}deg)\`,
  });
};

const value: TransformValue = { x: 40, y: 30, width: 120, height: 80, angle: 12 };
const fields = createTransformFields({ label: 'Picture frame', value, onChange: draw });

draw(value);
document.body.append(fields.el, canvas);
`,cs=`import { createTransport } from '@mosaic-home/design-system/web';

const duration = 222;
let position = 41;
let timer: ReturnType<typeof setInterval> | undefined;

const transport = createTransport({
  label: 'Playback',
  duration,
  position,
  loop: false,
  onPlayingChange: (playing) => {
    clearInterval(timer);
    if (!playing) return;
    timer = setInterval(() => {
      position = position >= duration ? 0 : position + 1;
      transport.setPosition(position);
    }, 1000);
  },
  onSeek: (t) => (position = t),
});

document.body.append(transport.el);
`,ls=`import { createText, createTree, type TreeNode } from '@mosaic-home/design-system/web';

const nodes: TreeNode[] = [
  {
    id: 'ground',
    label: 'Ground floor',
    icon: 'home',
    children: [
      { id: 'living', label: 'Living room', meta: '4 devices' },
      { id: 'kitchen', label: 'Kitchen', meta: '3 devices' },
    ],
  },
  { id: 'upstairs', label: 'Upstairs', icon: 'home', children: [{ id: 'bedroom', label: 'Bedroom' }] },
];

const picked = createText('Selected: kitchen', { variant: 'caption', tone: 'muted' });

const tree = createTree({
  nodes,
  label: 'Rooms',
  expanded: ['ground'],
  selected: 'kitchen',
  onSelect: (id) => (picked.textContent = \`Selected: \${id}\`),
});

document.body.append(tree.el, picked);
`,us=`import { createTrend, type TrendOptions } from '@mosaic-home/design-system/web';

const values = [19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.4, 21.9, 21.5];

const options = (latest: number): TrendOptions => ({
  name: 'Living room',
  value: latest,
  unit: '°C',
  values,
  format: (v) => v.toFixed(1),
});

const trend = createTrend(options(21.5));

// Each new reading joins the chart and becomes the value shown.
setInterval(() => {
  const latest = Math.round((20 + Math.random() * 2) * 10) / 10;
  values.push(latest);
  values.shift();
  trend.update(options(latest));
}, 5000);

document.body.append(trend.el);
`,ds=`import { mdiGamepadVariant, mdiHdmiPort, mdiTelevisionPlay } from '@mdi/js';
import { createTvRemote, type TvRemoteOptions, type TvRemoteSource } from '@mosaic-home/design-system/web';

let sources: TvRemoteSource[] = [
  { id: 'hdmi1', label: 'HDMI 1', icon: mdiHdmiPort },
  { id: 'console', label: 'Console', icon: mdiGamepadVariant },
  { id: 'films', label: 'Film Hall', icon: mdiTelevisionPlay, active: true },
];
let muted = false;

const send = (command: string): void => void fetch('/tv/command', { method: 'POST', body: command });

const options = (): TvRemoteOptions => ({
  label: 'Living room TV',
  sources,
  muted,
  onKey: (key) => {
    send(key);
    if (key === 'mute') {
      muted = !muted;
      remote.update(options());
    }
  },
  onSource: (id) => {
    send(\`source:\${id}\`);
    sources = sources.map((s) => ({ ...s, active: s.id === id }));
    remote.update(options());
  },
});

const remote = createTvRemote(options());

document.body.append(remote.el);
`,fs=`import { resolveTokens, themeById } from '@mosaic-home/design-system/tokens';

// In CSS the sizes are the --mh-text-* variables, which follow the device class.
const title = document.createElement('h2');
title.textContent = 'Kitchen';
title.style.fontSize = 'var(--mh-text-headline)';

// In code, resolve the theme for a device class and read its type scale.
const tokens = resolveTokens(themeById('midnight')!, 'tablet');
const size = tokens.type.display;

const reading = document.createElement('canvas');
reading.width = 200;
reading.height = size * 1.4;
const ctx = reading.getContext('2d')!;
ctx.font = \`\${size}px \${tokens.typeface.sans}\`;
ctx.fillStyle = tokens.theme.palette.heading;
ctx.fillText('19.5°', 0, size);

document.body.append(title, reading);
`,ps=`import { createUpNext, type UpNextEvents, type UpNextItem } from '@mosaic-home/design-system/web';

let items: UpNextItem[] = [
  { id: 'q1', title: 'Harbour Lights', subtitle: 'The Low Hills', art: '/art/up-next-1.jpg', duration: 214 },
  { id: 'q2', title: 'Slow Rivers', subtitle: 'Ines Okafor-Lund', art: '/art/up-next-2.jpg', duration: 187 },
  { id: 'q3', title: 'A Map of Quiet Places', subtitle: 'Cinder Vale Quartet', duration: 301 },
];

const drop = (id: string): void => {
  items = items.filter((i) => i.id !== id);
  queue.update({ items, ...events });
};

const events: UpNextEvents = {
  onPlay: (id) => {
    void fetch('/player/play', { method: 'POST', body: id });
    drop(id);
  },
  onRemove: drop,
};

const queue = createUpNext({ items, ...events });

document.body.append(queue.el);
`,ms=`import { createUsageComparison } from '@mosaic-home/design-system/web';

const comparison = createUsageComparison({
  label: 'Heating gas',
  slots: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  slotNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  // Days still to come are null; the totals compare the same days.
  current: [8.2, 9.1, 7.4, 10.3, null, null, null],
  previous: [7.1, 7.9, 7.6, 8.8, 9.4, 11.2, 10.6],
  periods: { current: 'This week', previous: 'Last week' },
  unit: 'm³',
});

document.body.append(comparison.el);
`,hs=`import { createVacuumControl } from '@mosaic-home/design-system/web';

const vacuum = createVacuumControl({
  name: 'Floor cleaner',
  state: 'docked',
  battery: 96,
  charging: true,
  rooms: [
    { id: 'living', name: 'Living room' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'hall', name: 'Hall' },
  ],
  // An empty list means everywhere.
  onStart: (rooms) => {
    const detail = rooms.length ? \`\${rooms.length} rooms\` : 'Everywhere';
    vacuum.update({ state: 'cleaning', charging: false, detail });
  },
  onPause: () => vacuum.update({ state: 'paused' }),
  onDock: () => vacuum.update({ state: 'returning', detail: undefined }),
});

document.body.append(vacuum.el);
`,gs=`import { createVoiceBar } from '@mosaic-home/design-system/web';

// Stands in for the microphone's input level (0–1).
const levels = setInterval(() => bar.setLevel(Math.random()), 90);

const bar = createVoiceBar({
  variant: 'dictation',
  onCancel: () => {
    clearInterval(levels);
    bar.setPhase('idle');
  },
  onDone: () => {
    clearInterval(levels);
    bar.setPhase('transcribing');
    bar.setBusy(true);
    setTimeout(() => {
      bar.setBusy(false);
      bar.setPhase('idle');
      bar.setLabel('Added: "Buy more coffee filters"');
    }, 1500);
  },
});

document.body.append(bar.el);
`,_s=`import { createVoiceRing } from '@mosaic-home/design-system/web';

const ring = createVoiceRing({ phase: 'idle', onTap: () => void listen() });

/** Listens for four seconds, driving the ring from the microphone level. */
async function listen(): Promise<void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
  if (!stream) {
    ring.setPhase('error');
    ring.setDetail('The microphone isn’t available.');
    return;
  }
  ring.setPhase('listening');
  ring.setDetail(undefined);
  const audio = new AudioContext();
  const analyser = audio.createAnalyser();
  audio.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);
  const stopAt = Date.now() + 4000;
  const frame = (): void => {
    analyser.getByteTimeDomainData(samples);
    ring.setLevel(samples.reduce((peak, s) => Math.max(peak, Math.abs(s - 128)), 0) / 128);
    if (Date.now() < stopAt) {
      requestAnimationFrame(frame);
      return;
    }
    stream.getTracks().forEach((track) => track.stop());
    void audio.close();
    ring.setPhase('thinking');
    setTimeout(() => ring.setPhase('idle'), 1500);
  };
  frame();
}

document.body.append(ring.el);
`,vs=`import { createButton, createWaveform } from '@mosaic-home/design-system/web';

const duration = 24;
// Loudness per bucket, 0 to 1; \`waveformPeaks\` makes these from decoded samples.
const peaks = Array.from({ length: 64 }, (_, i) => 0.15 + 0.8 * Math.abs(Math.sin(i / 2.3)));

let position = 0;
let timer: number | undefined;

const voice = createWaveform({
  peaks,
  label: 'Voice message',
  duration,
  position,
  onSeek: (time) => (position = time),
});

const play = createButton({
  label: 'Play',
  icon: 'play',
  size: 'small',
  onClick: () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    } else {
      timer = window.setInterval(() => {
        position = position + 0.25 >= duration ? 0 : position + 0.25;
        voice.setPosition(position);
      }, 250);
    }
    play.setLabel(timer === undefined ? 'Play' : 'Pause');
  },
});

document.body.append(play.el, voice.el);
`,ys=`import { createWeatherNow, weatherConditionFromText } from '@mosaic-home/design-system/web';

// A forecast source's own words, mapped to a condition for the icon and tint.
const text = 'Light rain showers';

const weather = createWeatherNow({
  condition: weatherConditionFromText(text),
  text,
  temperature: 9,
  place: 'Hillside',
  detail: 'Feels 6° · 80% rain',
});

document.body.append(weather.el);
`,bs=`import { createZoomControl } from '@mosaic-home/design-system/web';

const zoom = createZoomControl({
  value: 1,
  min: 0.25,
  max: 8,
  onChange: () => zoom.setFitted(false),
  onFit: () => {
    // The level that fits the picture in its frame, worked out by the app.
    zoom.setValue(0.63);
    zoom.setFitted(true);
  },
});

document.body.append(zoom.el);
`,xs=`import { createText, createZoomableImage } from '@mosaic-home/design-system/web';

const status = createText('100%', { variant: 'caption', tone: 'muted' });

const image = createZoomableImage({
  src: 'plans/ground-floor.png',
  alt: 'Floor plan of the ground floor',
  controls: true,
  aspect: 16 / 10,
  onChange: (view) => (status.textContent = \`\${Math.round(view.scale * 100)}%\`),
});

document.body.append(image.el, status);
`,Ss=`import { useEffect, useState } from 'react';
import { AccentHeadline } from '@mosaic-home/design-system/react';

const partOfDay = (): string => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
};

export function AccentHeadlineExample() {
  const [part, setPart] = useState(partOfDay);
  useEffect(() => {
    const timer = setInterval(() => setPart(partOfDay()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return <AccentHeadline text={\`Good \${part}\`} accent={part} size="display" level={1} />;
}
`,Cs=`import { useState } from 'react';
import { Accordion, Text } from '@mosaic-home/design-system/react';

export function AccordionExample() {
  const [open, setOpen] = useState<string[]>(['lights']);
  return (
    <Accordion
      mode="single"
      open={open}
      onChange={setOpen}
      sections={[
        {
          id: 'lights',
          title: 'Lights',
          subtitle: '3 of 7 on',
          icon: 'lightbulb',
          content: <Text tone="muted">Lights turn off when a room has been empty for 15 minutes.</Text>,
        },
        {
          id: 'climate',
          title: 'Climate',
          subtitle: 'Heating to 21°',
          icon: 'thermometer',
          content: <Text tone="muted">The target drops by 2° overnight.</Text>,
        },
      ]}
    />
  );
}
`,ws=`import { useState } from 'react';
import { mdiDoorOpen, mdiLightbulbOutline, mdiLockOutline, mdiThermostat } from '@mdi/js';
import { ActivityFeed } from '@mosaic-home/design-system/react';
import type { ActivityItem } from '@mosaic-home/design-system/web';

const ago = (minutes: number): number => Date.now() - minutes * 60_000;

export function ActivityFeedExample() {
  const [items, setItems] = useState<ActivityItem[]>(() => [
    { id: '1', title: 'Back door opened', by: 'Robin', time: ago(1), icon: mdiDoorOpen, tone: 'accent' },
    { id: '2', title: 'Heating set to 21 °C', by: 'Evening routine', time: ago(14), icon: mdiThermostat },
    { id: '3', title: 'Hall light turned on', by: 'Motion', time: ago(52), icon: mdiLightbulbOutline },
  ]);
  const [hasOlder, setHasOlder] = useState(true);
  const loadOlder = () => {
    const older: ActivityItem = { id: '4', title: 'Front door locked', time: ago(60 * 26), icon: mdiLockOutline };
    setItems((list) => [...list, older]);
    setHasOlder(false);
  };
  return (
    <ActivityFeed
      items={items}
      onSelect={(id) => location.assign(\`#/activity/\${id}\`)}
      onMore={hasOlder ? loadOlder : undefined}
    />
  );
}
`,Ts=`import { Agenda } from '@mosaic-home/design-system/react';
import type { AgendaDay } from '@mosaic-home/design-system/web';

const DAYS: AgendaDay[] = [
  {
    label: 'Today',
    events: [
      { time: null, title: 'Bin day', color: 4 },
      { time: '08:30', end: '09:00', title: 'School run', color: 2 },
      { time: '12:15', end: '13:00', title: 'Lunch with Robin', location: 'Bramblewick Café', color: 1 },
    ],
  },
  {
    label: 'Thu 17 Oct',
    events: [{ time: '10:00', end: '11:30', title: 'Boiler service', location: 'Home' }],
  },
];

export function AgendaExample() {
  // Shows the first five events and sums up the rest.
  return <Agenda days={DAYS} max={5} />;
}
`,Es=`import { AirQuality } from '@mosaic-home/design-system/react';

export function AirQualityExample() {
  return (
    <AirQuality
      kind="co2"
      value={640}
      // Oldest first, ending with the reading now.
      trend={[520, 560, 600, 610, 640]}
      trendLabel="Last 2 hours"
    />
  );
}
`,Ds=`import { useEffect, useState } from 'react';
import { AlarmPanel } from '@mosaic-home/design-system/react';
import type { AlarmState } from '@mosaic-home/design-system/web';

const EXIT_DELAY = 30;

export function AlarmPanelExample() {
  const [state, setState] = useState<AlarmState>('disarmed');
  const [mode, setMode] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (state !== 'arming') return;
    const exit = setTimeout(() => setState('armed'), EXIT_DELAY * 1000);
    return () => clearTimeout(exit);
  }, [state]);
  const arm = (next: string) => {
    setMode(next);
    setDeadline(Date.now() + EXIT_DELAY * 1000);
    setState('arming');
  };
  // The app checks the code; the panel only hands it over and clears it.
  const disarm = (code: string | undefined) => {
    if (code !== '1234') {
      setError('Wrong code');
      return;
    }
    setError(null);
    setState('disarmed');
  };
  return (
    <AlarmPanel
      label="House alarm"
      state={state}
      mode={mode}
      deadline={state === 'arming' ? deadline : null}
      delay={EXIT_DELAY}
      error={error}
      onArm={arm}
      onDisarm={disarm}
    />
  );
}
`,Os=`import { useState } from 'react';
import { Alert, Button } from '@mosaic-home/design-system/react';

export function AlertExample() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('No reading for 2 hours.');
  const retry = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setMessage('Still no reading. Check that the sensor has power.');
    }, 800);
  };
  return (
    <Alert
      tone="danger"
      title="Hallway sensor offline"
      dismissible
      action={
        <Button variant="secondary" size="small" loading={checking} onClick={retry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
`,ks=`import { useEffect, useState } from 'react';
import { AmbientClock } from '@mosaic-home/design-system/react';

const atNight = (): boolean => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

export function AmbientClockExample() {
  const [night, setNight] = useState(atNight);

  useEffect(() => {
    const check = setInterval(() => setNight(atNight()), 60_000);
    return () => clearInterval(check);
  }, []);

  // Without a \`time\`, the clock keeps its own.
  return (
    <AmbientClock
      night={night}
      nextEvent={{ title: 'Bins out', when: '19:30' }}
      weather={{ condition: 'partly-cloudy', temperature: 14 }}
    />
  );
}
`,As=`import { useState } from 'react';
import { AppShell, Card, IconButton, StatusBar } from '@mosaic-home/design-system/react';

const SECTIONS = [
  { label: 'Home', icon: 'home' },
  { label: 'Lights', icon: 'lightbulb' },
  { label: 'Climate', icon: 'thermometer' },
];

export function AppShellExample() {
  const [section, setSection] = useState('Home');
  const nav = (
    <nav aria-label="Sections">
      {SECTIONS.map(({ label, icon }) => (
        <IconButton key={label} icon={icon} label={label} pressed={label === section} onClick={() => setSection(label)} />
      ))}
    </nav>
  );
  return (
    <AppShell
      title={section}
      subtitle="Living room"
      actions={<IconButton icon="search" label="Search" />}
      nav={nav}
      navPosition="auto"
      status={<StatusBar items={[{ id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' }]} />}
    >
      <Card title="Climate">21.5° and 46% humidity.</Card>
      <Card title="Lights">Kitchen light and 2 others are on.</Card>
    </AppShell>
  );
}
`,js=`import { useEffect, useState } from 'react';
import { ApplianceCycle } from '@mosaic-home/design-system/react';
import type { ApplianceState } from '@mosaic-home/design-system/web';

const duration = 5400;

export function ApplianceCycleExample() {
  const [state, setState] = useState<ApplianceState>('running');
  const [remaining, setRemaining] = useState(4320);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (state !== 'running') return;
    const tick = setInterval(() => setRemaining((left) => Math.max(0, left - 60)), 60_000);
    return () => clearInterval(tick);
  }, [state]);

  if (!shown) return null;
  return (
    <ApplianceCycle
      name="Washing machine"
      state={remaining === 0 ? 'finished' : state}
      programme="Cotton 40°"
      stages={['Wash', 'Rinse', 'Spin']}
      stage={Math.floor(((duration - remaining) / duration) * 3)}
      remaining={remaining}
      duration={duration}
      endsAt="Ends 14:20"
      onPause={() => setState('paused')}
      onResume={() => setState('running')}
      onDismiss={() => setShown(false)}
    />
  );
}
`,Ms=`import { useState } from 'react';
import { mdiBlindsHorizontal, mdiCeilingLight } from '@mdi/js';
import { AssistReply } from '@mosaic-home/design-system/react';

type Stage = 'done' | 'undoing' | 'undone';

export function AssistReplyExample() {
  const [stage, setStage] = useState<Stage>('done');
  const undone = stage === 'undone';
  const light = undone ? { state: 'On', active: true, tone: 'warm' as const } : { state: 'Off' };
  const undo = () => {
    setStage('undoing');
    setTimeout(() => setStage('undone'), 900);
  };
  return (
    <AssistReply
      heard="Turn off the living room lights and close the blinds"
      reply="Done. I turned off 2 lights and closed the blinds."
      changes={[
        { id: 'ceiling', name: 'Ceiling light', icon: mdiCeilingLight, ...light },
        { id: 'lamp', name: 'Reading lamp', icon: 'lightbulb', ...light },
        { id: 'blinds', name: 'Blinds', icon: mdiBlindsHorizontal, state: undone ? 'Open' : 'Closing' },
      ]}
      undoing={stage === 'undoing'}
      undone={undone}
      onUndo={undo}
    />
  );
}
`,Ns=`import { Avatar, AvatarGroup } from '@mosaic-home/design-system/react';

export function AvatarExample() {
  return (
    <>
      <Avatar name="Ada Brook" size="large" status="online" />
      <AvatarGroup
        label="People at home"
        max={3}
        avatars={[
          { name: 'Ada Brook' },
          { name: 'Tomas Reed' },
          { name: 'Lena Ortiz' },
          { name: 'Sam Hale' },
        ]}
      />
    </>
  );
}
`,Ps=`import { useEffect, useState } from 'react';
import { Backdrop, Text } from '@mosaic-home/design-system/react';

const IDLE_MS = 30_000;

export function BackdropExample() {
  const [idle, setIdle] = useState(false);
  const [touches, setTouches] = useState(0);
  // Dim the canvas once the screen has been left alone; each touch restarts the wait.
  useEffect(() => {
    const timer = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(timer);
  }, [touches]);
  const wake = () => {
    setIdle(false);
    setTouches((n) => n + 1);
  };
  return (
    // Content inside a .mh-backdrop-host stays above the backdrop.
    <main className="mh-backdrop-host" onPointerDown={wake}>
      <Backdrop drift dim={idle} />
      <Text variant="display">22:40</Text>
    </main>
  );
}
`,Fs=`import { useState } from 'react';
import { Badge, IconButton } from '@mosaic-home/design-system/react';

export function BadgeExample() {
  const [unread, setUnread] = useState(4);
  return (
    // The host pins the badge to the button's top end corner.
    <span className="mh-badge-host">
      {/* Opening them marks them read; a count of zero hides the badge. */}
      <IconButton icon="bell" label="Notifications" filled onClick={() => setUnread(0)} />
      <Badge count={unread} attached ariaLabel={\`\${unread} unread\`} />
    </span>
  );
}
`,Is=`import { useState } from 'react';
import { BarChart, Button } from '@mosaic-home/design-system/react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeks = {
  this: [6.2, 5.8, 7.4, 4.9, 6.6, 8.1, 7.2],
  last: [5.9, 6.4, 6.1, 5.2, 7.0, 7.7, 6.8],
};

export function BarChartExample() {
  const [week, setWeek] = useState<keyof typeof weeks>('this');
  return (
    <>
      <BarChart
        bars={weeks[week].map((value, i) => ({ label: days[i]!, value }))}
        label={\`Energy used per day \${week} week\`}
        showValues
        highlight={week === 'this' ? 6 : undefined}
        format={(v) => \`\${v.toFixed(1)} kWh\`}
      />
      <Button variant="secondary" size="small" onClick={() => setWeek(week === 'this' ? 'last' : 'this')}>
        {week === 'this' ? 'Show last week' : 'Show this week'}
      </Button>
    </>
  );
}
`,Ls=`import { useEffect, useState } from 'react';
import { BootSplash } from '@mosaic-home/design-system/react';

const steps = ['Starting…', 'Connecting…', 'Loading rooms…', 'Almost ready…'];

export function BootSplashExample() {
  const [step, setStep] = useState(0);
  const [booted, setBooted] = useState(false);
  const ready = step >= steps.length - 1;

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(timer);
  }, [step, ready]);

  if (booted) return <p>Welcome home</p>;
  return (
    <BootSplash
      name="Mosaic Home"
      message={steps[step]}
      progress={step === 0 ? null : (step / (steps.length - 1)) * 100}
      leaving={ready}
      onLeft={() => setBooted(true)}
    />
  );
}
`,Rs=`import { useState } from 'react';
import { BottomSheet, Button } from '@mosaic-home/design-system/react';

export function BottomSheetExample() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const pick = (scene: string) => () => {
    setStatus(\`\${scene} is on\`);
    setOpen(false);
  };
  return (
    <>
      <Button icon="lightbulb-on" onClick={() => setOpen(true)}>
        Scenes
      </Button>
      <p aria-live="polite">{status}</p>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Quick scenes"
        description="Living room"
        footer={
          <>
            <Button variant="secondary" onClick={pick('Reading')}>
              Reading
            </Button>
            <Button onClick={pick('Film night')}>Film night</Button>
          </>
        }
      >
        <p>Pick a scene for the whole room.</p>
      </BottomSheet>
    </>
  );
}
`,zs=`import { Breadcrumbs } from '@mosaic-home/design-system/react';

export function BreadcrumbsExample() {
  return (
    <Breadcrumbs
      maxItems={3}
      items={[
        { label: 'Home', icon: 'home', href: '#/' },
        { label: 'Ground floor', href: '#/floors/ground' },
        { label: 'Living room', href: '#/rooms/living-room' },
        { label: 'Ceiling light' },
      ]}
    />
  );
}
`,Bs=`import { useState } from 'react';
import { ButtonGroup } from '@mosaic-home/design-system/react';

const ranges = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export function ButtonGroupExample() {
  const [range, setRange] = useState('week');
  return (
    <ButtonGroup
      label="Range"
      items={ranges.map((item) => ({ ...item, pressed: item.id === range }))}
      onClick={setRange}
    />
  );
}
`,Vs=`import { useState } from 'react';
import { Button } from '@mosaic-home/design-system/react';

export function ButtonExample() {
  const [busy, setBusy] = useState(false);
  const turnOn = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 800);
  };
  return (
    <Button icon="power" variant="primary" loading={busy} onClick={turnOn}>
      Turn on
    </Button>
  );
}
`,Hs=`import { CameraTile } from '@mosaic-home/design-system/react';

export function CameraTileExample() {
  return (
    <CameraTile
      src="/snapshots/front-door.jpg"
      name="Front door"
      status="Motion · 2 min ago"
      // Reloads the picture every 10 seconds while it is on screen.
      refreshEvery={10}
    />
  );
}
`,Us=`import { useState } from 'react';
import { Button, Card, Text } from '@mosaic-home/design-system/react';

export function CardExample() {
  const [lightsOn, setLightsOn] = useState(3);
  return (
    <Card
      title="Living room"
      subtitle={lightsOn ? \`\${lightsOn} lights on\` : 'All lights off'}
      icon="home"
      footer={
        <>
          <Button variant="text" size="small" onClick={() => setLightsOn(0)}>
            All off
          </Button>
          <Button size="small">Open</Button>
        </>
      }
    >
      <Text tone="muted">21.5° and 46% humidity. The blinds close at 20:00.</Text>
    </Card>
  );
}
`,Ws=`import { Card, Carousel } from '@mosaic-home/design-system/react';

const stories = [
  { source: 'Riverside Courier', time: '2 h ago', title: 'Council approves a cycle path along the canal' },
  { source: 'Morning Ledger', time: '5 h ago', title: 'Local bakery wins a prize for its sourdough' },
  { source: 'Valley Weekly', time: 'Yesterday', title: 'Library extends its weekend opening hours' },
];

export function CarouselExample() {
  return (
    <Carousel label="News">
      {stories.map((story) => (
        <Card
          key={story.title}
          eyebrow={\`\${story.source} · \${story.time}\`}
          title={story.title}
          titleLines={3}
          variant="flat"
          onClick={() => console.log(\`Open: \${story.title}\`)}
        />
      ))}
    </Carousel>
  );
}
`,Gs=`import { ChargeCard } from '@mosaic-home/design-system/react';

export function ChargeCardExample() {
  return (
    <ChargeCard
      name="Car"
      level={46}
      // Charging stops at the limit, so the time counts down to it.
      limit={80}
      state="charging"
      rate={7400}
      minutesLeft={95}
      detail="Range 180 km"
    />
  );
}
`,Ks=`import { useState } from 'react';
import { Checkbox } from '@mosaic-home/design-system/react';

const ROOMS = ['Living room', 'Kitchen', 'Bedroom'];

export function CheckboxExample() {
  const [chosen, setChosen] = useState<string[]>(['Kitchen']);
  const toggle = (room: string, on: boolean) =>
    setChosen((rooms) => (on ? [...rooms, room] : rooms.filter((r) => r !== room)));
  return (
    <div>
      <Checkbox
        label="All rooms"
        checked={chosen.length === ROOMS.length}
        indeterminate={chosen.length > 0 && chosen.length < ROOMS.length}
        onChange={(e) => setChosen(e.target.checked ? [...ROOMS] : [])}
      />
      {ROOMS.map((room) => (
        <Checkbox
          key={room}
          label={room}
          checked={chosen.includes(room)}
          onChange={(e) => toggle(room, e.target.checked)}
        />
      ))}
    </div>
  );
}
`,qs=`import { useState } from 'react';
import { ChipGroup } from '@mosaic-home/design-system/react';

const KINDS = [
  { value: 'lights', label: 'Lights', icon: 'lightbulb' },
  { value: 'climate', label: 'Climate', icon: 'thermometer' },
  { value: 'media', label: 'Media', icon: 'music' },
  { value: 'fans', label: 'Fans', icon: 'fan' },
];

export function ChipExample() {
  const [kinds, setKinds] = useState(['lights']);
  return <ChipGroup label="Show devices" chips={KINDS} values={kinds} onChange={setKinds} />;
}
`,Js=`import { useState } from 'react';
import { ClickWheel } from '@mosaic-home/design-system/react';

export function ClickWheelExample() {
  const [minutes, setMinutes] = useState(25);
  const [started, setStarted] = useState<number | null>(null);
  return (
    <div>
      <ClickWheel
        label="Timer"
        max={120}
        step={5}
        detents={36}
        format={(v) => \`\${v} min\`}
        value={minutes}
        onValueChange={setMinutes}
        center={{ label: 'Start timer', icon: 'play', onPress: () => setStarted(minutes) }}
      />
      {started !== null && <p>Timer started: {started} min</p>}
    </div>
  );
}
`,Ys=`import { useState } from 'react';
import { ColorPicker } from '@mosaic-home/design-system/react';

export function ColorPickerExample() {
  const [color, setColor] = useState('#ff9a3c');
  return (
    <>
      {/* onInput follows every drag; onChange fires once the user lets go. */}
      <ColorPicker label="Lamp colour" value={color} onInput={setColor} />
      <div style={{ width: 48, height: 48, borderRadius: 'var(--mh-radius-control)', background: color }} />
    </>
  );
}
`,Xs=`import { useState } from 'react';
import { CommandBar } from '@mosaic-home/design-system/react';
import type { CommandSuggestion } from '@mosaic-home/design-system/web';

const commands: CommandSuggestion[] = [
  { value: 'lights on', description: 'Turn on the lights in a room' },
  { value: 'lights off', description: 'Turn off the lights in a room' },
  { value: 'scene evening', description: 'Dim everything to warm white' },
  { value: 'status', description: 'Summary of the home' },
];

export function CommandBarExample() {
  const [log, setLog] = useState<string[]>([]);
  return (
    <>
      <pre>{log.map((command) => \`> \${command}\\nok\\n\`).join('')}</pre>
      <CommandBar
        placeholder="Type a command"
        suggestions={commands}
        defaultHistory={['status']}
        onSubmit={(command) => setLog((lines) => [...lines, command])}
      />
    </>
  );
}
`,Zs=`import { useState } from 'react';
import { Button, CommandPalette } from '@mosaic-home/design-system/react';
import type { Command } from '@mosaic-home/design-system/web';

const commands: Command[] = [
  { value: 'lights-off', label: 'Turn off all lights', icon: 'lightbulb', group: 'Lights', keywords: ['dark', 'night'] },
  { value: 'lights-on', label: 'Turn on all lights', icon: 'lightbulb-on', group: 'Lights' },
  { value: 'evening', label: 'Evening scene', icon: 'play', group: 'Scenes', description: 'Living room at 40%' },
  { value: 'lock', label: 'Lock the front door', icon: 'lock', group: 'Security', shortcut: 'Ctrl+L' },
  { value: 'heating', label: 'Set heating to 20°', icon: 'thermometer', group: 'Climate', keywords: ['warm'] },
  { value: 'settings', label: 'Open settings', icon: 'settings', group: 'App' },
];

export function CommandPaletteExample() {
  const [open, setOpen] = useState(false);
  const [ran, setRan] = useState('');
  return (
    <>
      <Button icon="search" onClick={() => setOpen(true)}>
        Search commands
      </Button>
      <p aria-live="polite">{ran && \`Ran: \${ran}\`}</p>
      {/* \`hotkey\` also opens it with Ctrl+K (⌘K on Apple keyboards). */}
      <CommandPalette
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        commands={commands}
        hotkey
        onSelect={setRan}
      />
    </>
  );
}
`,Qs=`import { useState } from 'react';
import { CompareSlider, Text } from '@mosaic-home/design-system/react';

export function CompareSliderExample() {
  const [split, setSplit] = useState(45);
  return (
    <>
      <CompareSlider
        label="Compare the lighting scene"
        before={{ src: 'photos/living-room-off.jpg', alt: 'Living room with the lights off' }}
        after={{ src: 'photos/living-room-evening.jpg', alt: 'Living room with the evening scene on' }}
        beforeLabel="Off"
        afterLabel="Evening"
        value={split}
        onChange={setSplit}
      />
      <Text variant="caption" tone="muted">
        Showing {Math.round(split)}% of the evening scene
      </Text>
    </>
  );
}
`,$s=`import { useState } from 'react';
import { Composer, ComposerAction } from '@mosaic-home/design-system/react';

export function ComposerExample() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const send = (value: string) => {
    if (!value.trim()) return;
    setSent((messages) => [...messages, value]);
    setText('');
  };
  return (
    <>
      <ol>
        {sent.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ol>
      <Composer
        placeholder="Ask about your home"
        value={text}
        onInput={(value) => setText(value)}
        onSubmit={send}
        suggestions={['Turn off all lights', 'Is the back door locked?', 'Warmer in the kitchen']}
        onSuggestion={setText}
        leading={<ComposerAction kind="attach" />}
        trailing={<ComposerAction kind="send" onClick={() => send(text)} />}
      />
    </>
  );
}
`,ec=`import { useState } from 'react';
import { Button, confirm } from '@mosaic-home/design-system/react';

export function ConfirmExample() {
  const [result, setResult] = useState('');
  const remove = async () => {
    const ok = await confirm({
      title: 'Delete "Evening"?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    setResult(ok ? 'Scene deleted' : 'Kept the scene');
  };
  return (
    <>
      <Button icon="delete" variant="danger" onClick={remove}>
        Delete scene
      </Button>
      <p aria-live="polite">{result}</p>
    </>
  );
}
`,tc=`import { useEffect, useState } from 'react';
import { ConnectionStatus } from '@mosaic-home/design-system/react';
import type { ConnectionState } from '@mosaic-home/design-system/web';

export function ConnectionStatusExample() {
  const [state, setState] = useState<ConnectionState>('connecting');
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let retry: ReturnType<typeof setTimeout> | undefined;
    const socket = new WebSocket('ws://homeassistant.local:8123/socket');
    socket.onopen = () => setState('connected');
    socket.onclose = () => {
      setState('reconnecting');
      setRetryAt(Date.now() + 10_000);
      retry = setTimeout(() => setAttempt((n) => n + 1), 10_000);
    };
    return () => {
      clearTimeout(retry);
      socket.onclose = null;
      socket.close();
    };
  }, [attempt]);

  const retryNow = () => {
    setState('connecting');
    setRetryAt(null);
    setAttempt((n) => n + 1);
  };
  return (
    <ConnectionStatus
      state={state}
      server="homeassistant.local"
      variant="banner"
      retryAt={retryAt}
      onRetry={retryNow}
    />
  );
}
`,nc=`import { useState } from 'react';
import { ControlCard, Switch } from '@mosaic-home/design-system/react';

export function ControlCardExample() {
  const [on, setOn] = useState(true);
  return (
    <ControlCard
      title="Desk lamp"
      icon="lightbulb"
      tone="warm"
      active={on}
      state={on ? 'On · 70%' : 'Off'}
      control={
        <Switch aria-label="Desk lamp power" checked={on} onChange={(event) => setOn(event.target.checked)} />
      }
    />
  );
}
`,rc=`import { useState } from 'react';
import { Button, CurvesEditor, Text } from '@mosaic-home/design-system/react';
import { curveLut, type CurvePoint } from '@mosaic-home/design-system/web';

const start: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 0.25, y: 0.2 },
  { x: 0.75, y: 0.82 },
  { x: 1, y: 1 },
];

export function CurvesEditorExample() {
  const [points, setPoints] = useState(start);
  const midtones = curveLut(points, 3)[1] ?? 0.5;
  return (
    <>
      <CurvesEditor points={points} label="Tone curve" onChange={setPoints} />
      <Text variant="caption" tone="muted">
        {points.length} points · midtones {Math.round(midtones * 255)}
      </Text>
      <Button variant="secondary" size="small" onClick={() => setPoints(start)}>
        Reset
      </Button>
    </>
  );
}
`,ic=`import { useState } from 'react';
import { DataTable, type DataTableColumnProps } from '@mosaic-home/design-system/react';
import type { DataTableSort } from '@mosaic-home/design-system/web';

interface Device {
  id: string;
  name: string;
  room: string;
  battery: number;
}

const devices: Device[] = [
  { id: 'd1', name: 'Hall motion sensor', room: 'Hallway', battery: 82 },
  { id: 'd2', name: 'Front door lock', room: 'Hallway', battery: 9 },
  { id: 'd3', name: 'Kitchen window', room: 'Kitchen', battery: 67 },
  { id: 'd4', name: 'Bedroom radiator', room: 'Bedroom', battery: 23 },
];

const columns: DataTableColumnProps<Device>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'room', label: 'Room', sortable: true },
  { id: 'battery', label: 'Battery', align: 'end', sortable: true, render: (d) => \`\${d.battery}%\` },
];

export function DataTableExample() {
  const [sort, setSort] = useState<DataTableSort>({ column: 'name', direction: 'ascending' });
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <DataTable
      columns={columns}
      rows={devices}
      rowId={(d) => d.id}
      rowLabel={(d) => d.name}
      label="Devices"
      sort={sort}
      onSortChange={setSort}
      selectable
      selected={selected}
      onSelectionChange={setSelected}
    />
  );
}
`,ac=`import { useState } from 'react';
import { DatePicker } from '@mosaic-home/design-system/react';
import { pickerDates, type IsoDate } from '@mosaic-home/design-system/web';

export function DatePickerExample() {
  const [today] = useState(() => pickerDates.todayIso());
  const [visit, setVisit] = useState<IsoDate | null>(null);
  return (
    <>
      <DatePicker label="Visit date" min={today} max={pickerDates.addDays(today, 90)} clearable value={visit} onChange={setVisit} />
      <p>{visit ? \`Booked for \${pickerDates.formatDate(visit, undefined, { dateStyle: 'full' })}.\` : 'No date yet.'}</p>
    </>
  );
}
`,oc=`import { useState } from 'react';
import { DateRangePicker } from '@mosaic-home/design-system/react';
import { pickerDates, type CompleteDateRange } from '@mosaic-home/design-system/web';

export function DateRangePickerExample() {
  const [today] = useState(() => pickerDates.todayIso());
  const [away, setAway] = useState<CompleteDateRange | null>(null);
  return (
    <DateRangePicker
      label="Away from home"
      min={today}
      clearable
      presets={[
        { label: 'Next 7 days', range: { start: today, end: pickerDates.addDays(today, 6) } },
        { label: 'Next 14 days', range: { start: today, end: pickerDates.addDays(today, 13) } },
      ]}
      helper="The house runs in away mode on these days."
      value={away}
      onChange={setAway}
    />
  );
}
`,sc=`import { useState } from 'react';
import { DateTimeField } from '@mosaic-home/design-system/react';

export function DateTimeFieldExample() {
  const [time, setTime] = useState('06:45');
  return (
    <DateTimeField
      label="Wake-up light"
      type="time"
      step={60}
      helper="The bedroom lamp starts to brighten at this time."
      error={time ? undefined : 'Choose a time.'}
      value={time}
      onChange={(event) => setTime(event.target.value)}
    />
  );
}
`,cc=`import { useEffect, useState } from 'react';
import { DeparturesBoard } from '@mosaic-home/design-system/react';
import type { Departure } from '@mosaic-home/design-system/web';

const minuteLater = (d: Departure): Departure => ({ ...d, minutes: d.minutes === null ? null : d.minutes - 1 });

export function DeparturesBoardExample() {
  const [departures, setDepartures] = useState<Departure[]>([
    { id: 'a', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 2, live: true },
    { id: 'b', line: 'T3', mode: 'tram', color: 3, destination: 'Mill Lane', minutes: 6, time: '08:46' },
    { id: 'c', line: '14', mode: 'bus', color: 1, destination: 'Harbour Gate', minutes: 13, delay: 3 },
    { id: 'd', line: 'R2', mode: 'train', color: 5, destination: 'Brackenmoor', minutes: 21, cancelled: true },
  ]);

  // Departed ones (below 0 minutes) drop off the board by themselves.
  useEffect(() => {
    const tick = setInterval(() => setDepartures((list) => list.map(minuteLater)), 60_000);
    return () => clearInterval(tick);
  }, []);

  return <DeparturesBoard stop="Elm Street" departures={departures} max={5} updated="Updated just now" />;
}
`,lc=`import { useState } from 'react';
import { DeviceSetup } from '@mosaic-home/design-system/react';
import type { DeviceSetupResult, DeviceSetupValues } from '@mosaic-home/design-system/web';

async function testServer({ address, token }: DeviceSetupValues): Promise<DeviceSetupResult> {
  try {
    const response = await fetch(address, { headers: { Authorization: \`Bearer \${token}\` } });
    if (response.status === 401 || response.status === 403) {
      return { ok: false, field: 'token', message: 'The server refused that token' };
    }
    return response.ok ? { ok: true } : { ok: false, message: \`The server answered \${response.status}\` };
  } catch {
    return { ok: false, field: 'address', message: 'No server answered at that address' };
  }
}

export function DeviceSetupExample() {
  const [server, setServer] = useState<string | null>(null);
  if (server) return <p>Connected to {server}</p>;
  return (
    <DeviceSetup
      placeholder="http://homeassistant.local:8123"
      intro="This screen talks to your home server directly."
      onTest={testServer}
      onFinish={({ address }) => setServer(address)}
    />
  );
}
`,uc=`import { useState } from 'react';
import { Button, Dialog } from '@mosaic-home/design-system/react';

export function DialogExample() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button icon="add" onClick={() => setOpen(true)}>
        Save as scene
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Save as scene"
        description="Keeps the current brightness of every light in this room."
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button onClick={close}>Save</Button>
          </>
        }
      >
        <p>Living room: three lights at 40%, floor lamp off.</p>
      </Dialog>
    </>
  );
}
`,dc=`import { Button, Divider, Text } from '@mosaic-home/design-system/react';

export function DividerExample() {
  return (
    <div>
      <Button icon="camera" variant="primary" fullWidth>
        Scan the QR code
      </Button>
      <Divider label="or" />
      <Text tone="muted">Enter the pairing code shown on the device.</Text>
      <Divider />
      <Button variant="text">Cancel</Button>
    </div>
  );
}
`,fc=`import { useState } from 'react';
import { DocumentTabs } from '@mosaic-home/design-system/react';
import type { DocumentTab } from '@mosaic-home/design-system/web';

export function DocumentTabsExample() {
  const [files, setFiles] = useState<DocumentTab[]>([
    { id: 'evening', label: 'Evening.yaml', dirty: true },
    { id: 'morning', label: 'Morning.yaml' },
    { id: 'away', label: 'Away.yaml' },
  ]);
  const [open, setOpen] = useState('evening');

  const close = (id: string, next: string) => {
    setFiles((all) => all.filter((f) => f.id !== id));
    if (id === open) setOpen(next);
  };
  const add = () => {
    const id = \`new-\${Date.now()}\`;
    setFiles((all) => [...all, { id, label: 'Untitled.yaml' }]);
    setOpen(id);
  };

  return <DocumentTabs label="Open scenes" tabs={files} value={open} onChange={setOpen} onClose={close} onAdd={add} />;
}
`,pc=`import { useState } from 'react';
import { Button, Doorbell } from '@mosaic-home/design-system/react';

export function DoorbellExample() {
  const [ringing, setRinging] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [talking, setTalking] = useState(false);
  const close = () => {
    setRinging(false);
    setAnswered(false);
    setTalking(false);
  };
  return (
    <>
      {/* In an app this happens when the doorbell rings. */}
      <Button icon="bell" onClick={() => setRinging(true)}>
        Ring the doorbell
      </Button>
      {ringing && (
        <Doorbell
          door="Front door"
          visitor="Parcel delivery"
          when="Just now"
          src="/snapshots/front-door.jpg"
          takeover
          answered={answered}
          talking={talking}
          onAnswer={() => setAnswered(true)}
          onTalk={setTalking}
          onDismiss={close}
        />
      )}
    </>
  );
}
`,mc=`import { useState } from 'react';
import { Button, Drawer } from '@mosaic-home/design-system/react';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Garden'];

export function DrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button icon="menu" variant="secondary" onClick={() => setOpen(true)}>
        Rooms
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" title="Rooms">
        <nav aria-label="Rooms">
          {rooms.map((room) => (
            <p key={room}>
              <a href={\`#\${room.toLowerCase().replace(' ', '-')}\`} onClick={() => setOpen(false)}>
                {room}
              </a>
            </p>
          ))}
        </nav>
      </Drawer>
    </>
  );
}
`,hc=`import { useState } from 'react';
import { DurationField } from '@mosaic-home/design-system/react';
import { formatDuration } from '@mosaic-home/design-system/web';

export function DurationFieldExample() {
  const [seconds, setSeconds] = useState<number | null>(1500);
  return (
    <DurationField
      label="Timer"
      value={seconds}
      presets={[300, 600, 900, 1800, 3600]}
      max={4 * 3600}
      helper={seconds === null ? 'Try 90, 1h 30 or 0:45.' : \`Rings in \${formatDuration(seconds, 'long')}.\`}
      onChange={setSeconds}
    />
  );
}
`,gc=`import { useState } from 'react';
import { useTokens } from '@mosaic-home/design-system/react';

export function ElevationExample() {
  const [pressed, setPressed] = useState(false);
  // The raw values, for renderers that draw their own shadows (a canvas, a native view).
  const { blur, offsetY } = useTokens().elevation[2];
  return (
    <article
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      title={\`Level 2: \${offsetY}px down, \${blur}px blur\`}
      style={{
        padding: 'var(--mh-space-lg)',
        borderRadius: 'var(--mh-radius-lg)',
        background: 'var(--mh-surface-solid)',
        // Levels 1–3 are the --mh-shadow-* variables; the theme decides between a shadow, a glow or none.
        boxShadow: pressed ? 'var(--mh-shadow-3)' : 'var(--mh-shadow-1)',
      }}
    >
      Front door locked
    </article>
  );
}
`,_c=`import { useState } from 'react';
import { Button, EmptyState } from '@mosaic-home/design-system/react';

export function EmptyStateExample() {
  const [lights, setLights] = useState<string[]>([]);
  const addLight = () => setLights((list) => [...list, \`Desk lamp \${list.length + 1}\`]);
  if (lights.length === 0) {
    return (
      <EmptyState
        icon="lightbulb"
        title="No lights yet"
        text="Add a light to control it from here."
        action={
          <Button icon="add" onClick={addLight}>
            Add light
          </Button>
        }
      />
    );
  }
  return (
    <ul>
      {lights.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}
`,vc=`import { EnergyFlow } from '@mosaic-home/design-system/react';

export function EnergyFlowExample() {
  // Watts. Grid is negative while exporting, battery negative while charging.
  return (
    <EnergyFlow label="Energy now" solar={3200} grid={-1100} battery={-800} home={1300} batteryLevel={64} />
  );
}
`,yc=`import { useState } from 'react';
import { FanControl } from '@mosaic-home/design-system/react';

export function FanControlExample() {
  const [on, setOn] = useState(true);
  const [percentage, setPercentage] = useState(67);
  const [oscillating, setOscillating] = useState(true);
  return (
    <FanControl
      label="Bedroom fan"
      on={on}
      percentage={percentage}
      // Three speeds become step buttons.
      speedCount={3}
      oscillating={oscillating}
      onToggle={setOn}
      onPercentage={(value) => {
        setPercentage(value);
        setOn(value > 0);
      }}
      onOscillate={setOscillating}
    />
  );
}
`,bc=`import { useState } from 'react';
import { FavouriteToggle, Text } from '@mosaic-home/design-system/react';

export function FavouriteToggleExample() {
  const [pinned, setPinned] = useState(false);
  return (
    <>
      <FavouriteToggle label="Favourite: Kitchen light" pressed={pinned} onPressedChange={setPinned} />
      <Text variant="caption" tone="muted">
        {pinned ? 'Pinned to the home screen' : 'Not on the home screen'}
      </Text>
    </>
  );
}
`,xc=`import { useState } from 'react';
import { Field, TextField } from '@mosaic-home/design-system/react';

export function FieldExample() {
  const [name, setName] = useState('Living room');
  return (
    <Field label="Display name" helper="Shown on the dashboard." error={name.trim() ? undefined : 'Enter a name.'} required>
      {(control) => <TextField {...control} value={name} onChange={(event) => setName(event.target.value)} />}
    </Field>
  );
}
`,Sc=`import { useState } from 'react';
import { FileDropZone } from '@mosaic-home/design-system/react';
import { formatFileSize } from '@mosaic-home/design-system/web';

export function FileDropZoneExample() {
  const [files, setFiles] = useState<File[]>([]);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  return (
    <>
      {/* Files that are too big, of the wrong type or too many are refused with a message in the zone. */}
      <FileDropZone
        title="Drop floor plans here"
        hint="PNG, JPG or WebP, up to 5 MB each, up to 4 files"
        accept="image/png,image/jpeg,image/webp"
        maxSize={5_000_000}
        maxFiles={4}
        onChange={setFiles}
      />
      {files.length > 0 && <p>{\`\${files.length} ready to upload, \${formatFileSize(total)}.\`}</p>}
    </>
  );
}
`,Cc=`import { useState } from 'react';
import { mdiDoor, mdiFloorLamp } from '@mdi/js';
import { FloorPlan } from '@mosaic-home/design-system/react';
import type { FloorPlanRoom } from '@mosaic-home/design-system/web';

// Shapes are in centimetres; the plan scales them to fit.
const rooms: FloorPlanRoom[] = [
  { id: 'living', name: 'Living room', shape: { x: 0, y: 0, width: 500, height: 400 }, light: 70 },
  { id: 'kitchen', name: 'Kitchen', shape: { x: 500, y: 0, width: 300, height: 250 }, summary: '22 °C' },
  { id: 'hall', name: 'Hall', shape: { x: 500, y: 250, width: 300, height: 150 } },
  { id: 'bedroom', name: 'Bedroom', shape: { x: 0, y: 400, width: 450, height: 300 }, climate: 'heat' },
  { id: 'bath', name: 'Bathroom', shape: { x: 450, y: 400, width: 350, height: 300 }, alert: true },
];

export function FloorPlanExample() {
  const [selected, setSelected] = useState<string | null>(null);
  const [lampOn, setLampOn] = useState(true);
  const lamp = { id: 'lamp', x: 90, y: 90, icon: mdiFloorLamp, label: 'Floor lamp', tone: 'warm' as const };
  return (
    <FloorPlan
      label="Ground floor"
      rooms={rooms}
      markers={[
        { ...lamp, state: lampOn ? 'On' : 'Off', active: lampOn },
        { id: 'door', x: 790, y: 325, icon: mdiDoor, label: 'Front door', state: 'Locked' },
      ]}
      selected={selected}
      onRoom={setSelected}
      onMarker={(id) => {
        if (id === 'lamp') setLampOn((on) => !on);
      }}
    />
  );
}
`,wc=`import { ForecastStrip } from '@mosaic-home/design-system/react';
import type { ForecastReading } from '@mosaic-home/design-system/web';

const week: ForecastReading[] = [
  { label: 'Today', condition: 'partly-cloudy', value: 16, low: 9, sub: '10%' },
  { label: 'Thu', condition: 'rain', value: 14, low: 8, sub: '80%' },
  { label: 'Fri', condition: 'pouring', value: 12, low: 7, sub: '95%' },
  { label: 'Sat', condition: 'cloudy', value: 13, low: 6 },
  { label: 'Sun', condition: 'clear', value: 17, low: 7 },
];

export function ForecastStripExample() {
  return <ForecastStrip label="Next 5 days" readings={week} subName="rain" />;
}
`,Tc=`import { useEffect, useState } from 'react';
import { GeoMap } from '@mosaic-home/design-system/react';
import type { GeoMapPoint, GeoMapShape, GeoMapTiles } from '@mosaic-home/design-system/web';

const HOME: GeoMapShape = { name: 'Home', tone: 'muted', circle: { lat: 50.9965, lon: 6.9935, radius: 150 } };
const PARK: GeoMapShape = {
  name: 'Willow Green',
  tone: 'accent',
  rings: [
    [
      [7.0, 51.0],
      [7.008, 51.0005],
      [7.006, 51.0052],
      [7.0, 51.0],
    ],
  ],
};
// Your tile server's XYZ template and the credit it asks for; leave \`tiles\` out to load nothing.
const TILES: GeoMapTiles = { url: 'https://tiles.example.com/{z}/{x}/{y}.png', attribution: '© Example Maps', maxZoom: 19 };

export function GeoMapExample() {
  const [sam, setSam] = useState<GeoMapPoint>({ lat: 51.0021, lon: 7.004, label: 'Sam', accuracy: 40 });
  useEffect(() => {
    // A new position arrives.
    const timer = setTimeout(() => setSam((p) => ({ ...p, lat: 50.9972, lon: 6.9941, accuracy: 15 })), 3000);
    return () => clearTimeout(timer);
  }, []);
  return <GeoMap label="Where Sam is" points={[sam]} shapes={[HOME, PARK]} tiles={TILES} />;
}
`,Ec=`import { useState } from 'react';
import { GradientEditor } from '@mosaic-home/design-system/react';
import { gradientCss, type GradientStop } from '@mosaic-home/design-system/web';

export function GradientEditorExample() {
  const [stops, setStops] = useState<GradientStop[]>([
    { offset: 0, color: '#1a1446' },
    { offset: 40, color: '#c2457a' },
    { offset: 100, color: '#ffb35c' },
  ]);
  const [angle, setAngle] = useState(90);
  return (
    <>
      <div style={{ height: 96, borderRadius: 'var(--mh-radius-lg)', background: gradientCss(stops, angle) }} />
      <GradientEditor
        label="Sunrise light"
        showAngle
        stops={stops}
        angle={angle}
        onInput={(next, nextAngle) => {
          setStops(next);
          setAngle(nextAngle);
        }}
      />
    </>
  );
}
`,Dc=`import { useState } from 'react';
import { HazardBanner } from '@mosaic-home/design-system/react';
import type { HazardSeverity } from '@mosaic-home/design-system/web';

export function HazardBannerExample() {
  const [severity, setSeverity] = useState<HazardSeverity>('alarm');
  const [shown, setShown] = useState(true);
  if (!shown) return null;
  const cleared = severity === 'cleared';
  return (
    <HazardBanner
      kind="leak"
      severity={severity}
      where="Utility room, under the sink"
      since="10:42"
      advice={cleared ? undefined : ['Turn off the water at the main valve', 'Move anything that could get wet']}
      actions={cleared ? [] : [{ id: 'valve', label: 'Shut off water', primary: true }]}
      onSilence={severity === 'alarm' ? () => setSeverity('warning') : undefined}
      onAction={() => setSeverity('cleared')}
      onDismiss={cleared ? () => setShown(false) : undefined}
    />
  );
}
`,Oc=`import { useState, type SyntheticEvent } from 'react';
import { Histogram } from '@mosaic-home/design-system/react';
import { histogramFromPixels, type HistogramData } from '@mosaic-home/design-system/web';

export function HistogramExample() {
  const [data, setData] = useState<HistogramData>({});
  // Count the image's pixels once it has loaded.
  const measure = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, 0, 0);
    setData(histogramFromPixels(context.getImageData(0, 0, canvas.width, canvas.height).data, 64));
  };
  return (
    <>
      <img src="snapshot.jpg" alt="Garden snapshot" width={320} onLoad={measure} />
      <Histogram data={data} label="Snapshot histogram" mode="rgb" />
    </>
  );
}
`,kc=`import { useEffect, useState } from 'react';
import { HotkeyField } from '@mosaic-home/design-system/react';
import { hotkeyFromEvent, hotkeyToString } from '@mosaic-home/design-system/web';

export function HotkeyFieldExample() {
  const [shortcut, setShortcut] = useState('Ctrl+K');
  const [opened, setOpened] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const pressed = hotkeyFromEvent(event);
      if (shortcut && pressed && hotkeyToString(pressed) === shortcut) {
        event.preventDefault();
        setOpened((n) => n + 1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  return (
    <HotkeyField
      label="Open search"
      helper={opened ? \`Search opened \${opened} times.\` : 'Press the field, then a key combination.'}
      value={shortcut}
      onChange={setShortcut}
    />
  );
}
`,Ac=`import { useState } from 'react';
import { HumidityControl } from '@mosaic-home/design-system/react';

const MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'sleep', label: 'Sleep' },
];

export function HumidityControlExample() {
  const [on, setOn] = useState(true);
  const [target, setTarget] = useState(45);
  const [mode, setMode] = useState('normal');
  return (
    <HumidityControl
      label="Nursery humidity"
      current={36}
      target={target}
      on={on}
      action={on ? 'humidifying' : 'off'}
      mode={mode}
      modes={MODES}
      // Called once the taps settle, so one change is sent rather than one per tap.
      onTarget={setTarget}
      onMode={setMode}
      onToggle={setOn}
    />
  );
}
`,jc=`import { useState } from 'react';
import { IconButton } from '@mosaic-home/design-system/react';

export function IconButtonExample() {
  const [muted, setMuted] = useState(false);
  return (
    <IconButton
      icon={muted ? 'volume-off' : 'volume-high'}
      label="Mute"
      pressed={muted}
      onClick={() => setMuted(!muted)}
    />
  );
}
`,Mc=`import { useState } from 'react';
import { mdiBed, mdiGarage, mdiSofaOutline, mdiStove } from '@mdi/js';
import { IconPicker } from '@mosaic-home/design-system/react';
import { iconLabel, type IconPickerItem } from '@mosaic-home/design-system/web';

const roomIcons: (string | IconPickerItem)[] = [
  { name: 'sofa', path: mdiSofaOutline, label: 'Living room', keywords: ['lounge'] },
  { name: 'bed', path: mdiBed, label: 'Bedroom', keywords: ['sleep'] },
  { name: 'kitchen', path: mdiStove, label: 'Kitchen', keywords: ['cook'] },
  { name: 'garage', path: mdiGarage, label: 'Garage', keywords: ['car'] },
  'lightbulb',
  'fan',
];

export function IconPickerExample() {
  const [icon, setIcon] = useState<string | null>('sofa');
  return (
    <>
      <IconPicker label="Room icon" allowNone icons={roomIcons} value={icon} onChange={setIcon} />
      <p>{icon ? \`Picked \${iconLabel(icon)}.\` : 'No icon.'}</p>
    </>
  );
}
`,Nc=`import { mdiSofaOutline } from '@mdi/js';
import { Icon } from '@mosaic-home/design-system/react';

export function IconExample() {
  return (
    <p>
      {/* Any Material Design Icons path works where there is no short name. */}
      <Icon icon={mdiSofaOutline} size={24} /> Living room{' '}
      <Icon icon="lightbulb-on" size={20} label="Lights on" />
    </p>
  );
}
`,Pc=`import { useState } from 'react';
import { Inspector } from '@mosaic-home/design-system/react';
import type { InspectorSection } from '@mosaic-home/design-system/web';

export function InspectorExample() {
  const [scale, setScale] = useState(100);
  const [opacity, setOpacity] = useState(85);
  const [shadow, setShadow] = useState(true);
  const sections: InspectorSection[] = [
    {
      id: 'transform',
      title: 'Transform',
      params: [
        { id: 'scale', kind: 'slider', label: 'Scale', value: scale, max: 400, unit: '%', keyframe: 'off' },
        { id: 'opacity', kind: 'slider', label: 'Opacity', value: opacity, unit: '%', keyframe: 'on' },
      ],
    },
    { id: 'look', title: 'Look', params: [{ id: 'shadow', kind: 'toggle', label: 'Drop shadow', value: shadow }] },
  ];
  return (
    <Inspector
      label="Clip properties"
      sections={sections}
      onChange={(id, value) => {
        if (id === 'scale') setScale(Number(value));
        if (id === 'opacity') setOpacity(Number(value));
        if (id === 'shadow') setShadow(Boolean(value));
      }}
    />
  );
}
`,Fc=`import { useEffect, useState } from 'react';
import { IrrigationZones } from '@mosaic-home/design-system/react';
import type { IrrigationRun, IrrigationZone } from '@mosaic-home/design-system/web';

// Durations are in minutes.
const zones: IrrigationZone[] = [
  { id: 'lawn', name: 'Front lawn', duration: 20 },
  { id: 'beds', name: 'Flower beds', duration: 10 },
  { id: 'veg', name: 'Vegetable patch', duration: 15 },
];

export function IrrigationZonesExample() {
  const [running, setRunning] = useState<IrrigationRun | null>(null);
  const [rainSkip, setRainSkip] = useState(false);
  const watering = running !== null;

  useEffect(() => {
    if (!watering) return;
    const tick = setInterval(
      () => setRunning((r) => (r && r.remaining > 1 ? { ...r, remaining: r.remaining - 1 } : null)),
      1000,
    );
    return () => clearInterval(tick);
  }, [watering]);

  return (
    <IrrigationZones
      name="Garden watering"
      zones={zones}
      running={running}
      nextRun="Tomorrow 06:00"
      rainSkip={rainSkip}
      rainNote="6 mm of rain expected tonight"
      onRun={(id) => setRunning({ zone: id, remaining: zones.find((z) => z.id === id)!.duration * 60 })}
      onStop={() => setRunning(null)}
      onRainSkip={setRainSkip}
    />
  );
}
`,Ic=`import { Kbd } from '@mosaic-home/design-system/react';

const shortcuts: { action: string; keys: string | string[]; sequence?: boolean }[] = [
  { action: 'Search', keys: 'Ctrl+K' },
  { action: 'Close a dialog', keys: 'Esc' },
  { action: 'Go home', keys: ['G', 'H'], sequence: true },
];

export function KbdExample() {
  return (
    <>
      <dl>
        {shortcuts.map(({ action, keys, sequence }) => (
          <div key={action}>
            <dt>{action}</dt>
            <dd>
              <Kbd keys={keys} sequence={sequence} />
            </dd>
          </div>
        ))}
      </dl>
      <p>
        Press <Kbd keys="/" size="small" /> to search.
      </p>
    </>
  );
}
`,Lc=`import { useState } from 'react';
import { mdiFormatText, mdiImageOutline } from '@mdi/js';
import { LayersPanel } from '@mosaic-home/design-system/react';
import { updateLayer, type LayerItem } from '@mosaic-home/design-system/web';

const LAYERS: LayerItem[] = [
  { id: 'title', name: 'Title', icon: mdiFormatText },
  {
    id: 'scenery',
    name: 'Scenery',
    children: [
      { id: 'tree', name: 'Tree', icon: mdiImageOutline },
      { id: 'sun', name: 'Sun', icon: mdiImageOutline, visible: false },
    ],
  },
  { id: 'sky', name: 'Sky', icon: mdiImageOutline, locked: true },
];

export function LayersPanelExample() {
  const [layers, setLayers] = useState(LAYERS);
  const [selected, setSelected] = useState<string | null>('tree');
  return (
    <LayersPanel
      label="Layers"
      layers={layers}
      selected={selected}
      onSelect={setSelected}
      onVisibleChange={(id, visible) => setLayers((list) => updateLayer(list, id, { visible }))}
      onLockedChange={(id, locked) => setLayers((list) => updateLayer(list, id, { locked }))}
      onExpandedChange={(id, expanded) => setLayers((list) => updateLayer(list, id, { expanded }))}
      onReorder={(_id, _parent, _index, next) => setLayers(next)}
    />
  );
}
`,Rc=`import { useEffect, useState } from 'react';
import { LevelMeter } from '@mosaic-home/design-system/react';

export function LevelMeterExample() {
  const [levels, setLevels] = useState([-Infinity, -Infinity]);
  useEffect(() => {
    // Levels in dBFS, for example from an audio analyser; the meter holds the peaks itself.
    let frame = 0;
    const tick = (now: number) => {
      const base = -18 + 8 * Math.sin(now / 900);
      setLevels([Math.min(0, base + Math.random() * 8), Math.min(0, base - 3 + Math.random() * 8)]);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <LevelMeter levels={levels} channels={['L', 'R']} label="Speaker output" scale />;
}
`,zc=`import { useState } from 'react';
import { LightControl } from '@mosaic-home/design-system/react';

export function LightControlExample() {
  const [on, setOn] = useState(true);
  const [brightness, setBrightness] = useState(65);
  const [kelvin, setKelvin] = useState(2700);
  return (
    <LightControl
      label="Bedside lamp"
      on={on}
      brightness={brightness}
      colorTemp={{ value: kelvin, min: 2000, max: 6500 }}
      onToggle={setOn}
      onBrightness={setBrightness}
      onColorTemp={setKelvin}
    />
  );
}
`,Bc=`import { useState } from 'react';
import { LightGroup } from '@mosaic-home/design-system/react';
import type { LightGroupMember } from '@mosaic-home/design-system/web';

export function LightGroupExample() {
  const [members, setMembers] = useState<LightGroupMember[]>([
    { id: 'pendants', name: 'Pendants', on: true, brightness: 80 },
    { id: 'counter', name: 'Counter strip', on: true, brightness: 40 },
    { id: 'spots', name: 'Spots', on: false, brightness: 0 },
  ]);
  // A null id changes every light in the group.
  const change = (id: string | null, patch: Partial<LightGroupMember>) =>
    setMembers((list) => list.map((m) => (id === null || m.id === id ? { ...m, ...patch } : m)));
  return (
    <LightGroup
      name="Kitchen"
      members={members}
      onToggle={(on) => change(null, { on })}
      onBrightness={(brightness) => change(null, { brightness, on: brightness > 0 })}
      onMemberToggle={(id, on) => change(id, { on })}
      onMemberBrightness={(id, brightness) => change(id, { brightness, on: brightness > 0 })}
    />
  );
}
`,Vc=`import { useState } from 'react';
import { Link } from '@mosaic-home/design-system/react';

export function LinkExample() {
  const [showAll, setShowAll] = useState(false);
  return (
    <p>
      The hallway sensor reports every five minutes. Read{' '}
      <Link href="https://example.com/sensors" external>
        how sensors report
      </Link>
      .{' '}
      {/* Without an href the link renders a button: an action that looks like a link. */}
      <Link onClick={() => setShowAll(true)}>
        {showAll ? 'All devices shown' : 'Show three more devices'}
      </Link>
    </p>
  );
}
`,Hc=`import { useState } from 'react';
import { List, ListItem } from '@mosaic-home/design-system/react';

export function ListExample() {
  const [lights, setLights] = useState([
    { name: 'Kitchen light', on: true },
    { name: 'Hallway', on: false },
    { name: 'Desk lamp', on: true },
  ]);
  const toggle = (name: string) => setLights(lights.map((l) => (l.name === name ? { ...l, on: !l.on } : l)));
  return (
    <List label="Lights" inset>
      {lights.map((light) => (
        <ListItem
          key={light.name}
          title={light.name}
          icon={light.on ? 'lightbulb-on' : 'lightbulb'}
          trailing={light.on ? 'On' : 'Off'}
          onClick={() => toggle(light.name)}
        />
      ))}
    </List>
  );
}
`,Uc=`import { useState } from 'react';
import { LockControl } from '@mosaic-home/design-system/react';
import type { LockState } from '@mosaic-home/design-system/web';

export function LockControlExample() {
  const [state, setState] = useState<LockState>('locked');
  // Shows the busy state until the lock reports back.
  const move = (busy: LockState, done: LockState) => {
    setState(busy);
    setTimeout(() => setState(done), 1000);
  };
  return (
    <LockControl
      label="Front door"
      state={state}
      confirm
      onLock={() => move('locking', 'locked')}
      onUnlock={() => move('unlocking', 'unlocked')}
    />
  );
}
`,Wc=`import { useState } from 'react';
import { Text, TileMap } from '@mosaic-home/design-system/react';
import type { MapMarker } from '@mosaic-home/design-system/web';

const PLACES: MapMarker[] = [
  { lat: 51.0004, lon: 7.0012, label: 'Home', icon: 'home' },
  { lat: 51.0042, lon: 7.0091, label: 'Workshop', tone: 'neutral' },
  { lat: 50.9968, lon: 7.0108, label: 'Pier' },
];

export function MapExample() {
  const [selected, setSelected] = useState<MapMarker | null>(null);
  return (
    <>
      <TileMap
        label="Around the house"
        // Your tile server's XYZ template and the credit it asks for.
        tiles="https://tiles.example.com/{z}/{x}/{y}.png"
        attribution="© Example Maps"
        markers={PLACES}
        center={selected}
        onMarkerSelect={setSelected}
      />
      <Text variant="caption" tone="muted">
        {selected ? \`\${selected.label ?? 'Place'} selected\` : 'Select a place.'}
      </Text>
    </>
  );
}
`,Gc=`import { useState } from 'react';
import { MediaList, Text } from '@mosaic-home/design-system/react';
import type { MediaListItem } from '@mosaic-home/design-system/web';

const songs: MediaListItem[] = [
  { title: 'Lanterns on the Quay', subtitle: 'Mira Holloway', meta: '3:42' },
  { title: 'Slow Tide Radio', subtitle: 'The Fenwick Lamps', meta: '4:15' },
  { title: 'Paper Weather', subtitle: 'Juno Marsh', meta: '2:58' },
];

export function MediaListExample() {
  const [playing, setPlaying] = useState<MediaListItem | null>(null);
  return (
    <>
      <MediaList
        label="Up next"
        items={songs}
        action="play"
        actionLabel="Play"
        onSelect={(i) => setPlaying(songs[i] ?? null)}
      />
      <Text variant="caption" tone="muted">
        {playing ? \`Playing \${playing.title}\` : 'Nothing playing'}
      </Text>
    </>
  );
}
`,Kc=`import { useState } from 'react';
import { MediaPlayer } from '@mosaic-home/design-system/react';

export function MediaPlayerExample() {
  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(83);
  const [volume, setVolume] = useState(0.45);
  return (
    <MediaPlayer
      title="Lanterns Over the Quay"
      subtitle="Marlow and the Tidelines"
      art="/covers/lanterns-over-the-quay.jpg"
      state={playing ? 'playing' : 'paused'}
      position={position}
      duration={227}
      volume={volume}
      can={{ play: true, pause: true, next: true, previous: true, volume: true, seek: true }}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onNext={() => setPosition(0)}
      onPrevious={() => setPosition(0)}
      onSeek={setPosition}
      onVolume={setVolume}
    />
  );
}
`,qc=`import { useState } from 'react';
import { MediaTimeline } from '@mosaic-home/design-system/react';
import type { TimelineClipChange, TimelineTrack } from '@mosaic-home/design-system/web';

const TRACKS: TimelineTrack[] = [
  {
    id: 'video',
    name: 'Video',
    icon: 'film',
    clips: [
      { id: 'garden', start: 0, end: 7.5, label: 'Morning garden' },
      { id: 'kitchen', start: 7.5, end: 15, label: 'Kitchen', tone: 2 },
    ],
  },
  { id: 'titles', name: 'Titles', clips: [{ id: 'title', start: 1, end: 5, label: 'Our week', tone: 5 }] },
  { id: 'music', name: 'Music', icon: 'music', locked: true, clips: [{ id: 'song', start: 0, end: 20, label: 'Quiet Harbour', tone: 4 }] },
];

const applyChange = (tracks: TimelineTrack[], { clipId, start, end }: TimelineClipChange) =>
  tracks.map((track) => ({ ...track, clips: track.clips.map((c) => (c.id === clipId ? { ...c, start, end } : c)) }));

export function MediaTimelineExample() {
  const [tracks, setTracks] = useState(TRACKS);
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <MediaTimeline
      label="Edit timeline"
      duration={20}
      tracks={tracks}
      position={position}
      selected={selected}
      zoom={40}
      onSeek={setPosition}
      onSelect={setSelected}
      onClipChange={(change, committed) => committed && setTracks((list) => applyChange(list, change))}
    />
  );
}
`,Jc=`import { useState } from 'react';
import { MenuBar } from '@mosaic-home/design-system/react';
import type { MenuBarMenu } from '@mosaic-home/design-system/web';

// Defined once: the menu bar rebuilds whenever \`menus\` changes.
const MENUS: MenuBarMenu[] = [
  {
    label: 'File',
    items: [
      { value: 'new', label: 'New plan', shortcut: 'Ctrl+N' },
      { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      { separator: true },
      { value: 'delete', label: 'Delete plan', danger: true },
    ],
  },
  { label: 'Edit', items: [{ value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' }, { value: 'redo', label: 'Redo' }] },
  { label: 'View', items: [{ value: 'grid', label: 'Show grid', checked: true }] },
];

export function MenuBarExample() {
  const [grid, setGrid] = useState(true);
  const select = (value: string, checked?: boolean) => {
    if (value === 'grid') setGrid(Boolean(checked));
  };
  return (
    <div>
      <MenuBar label="Floor plan editor" menus={MENUS} onSelect={select} />
      <p>Grid {grid ? 'shown' : 'hidden'}</p>
    </div>
  );
}
`,Yc=`import { useState } from 'react';
import { IconButton, Menu } from '@mosaic-home/design-system/react';
import type { MenuEntry } from '@mosaic-home/design-system/web';

const items: MenuEntry[] = [
  { value: 'edit', label: 'Edit', icon: 'edit', shortcut: 'E' },
  { value: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
  { value: 'share', label: 'Share', icon: 'share' },
  { separator: true },
  { value: 'delete', label: 'Delete', icon: 'delete', danger: true },
];

export function MenuExample() {
  const [chosen, setChosen] = useState('');
  return (
    <>
      <Menu items={items} onSelect={setChosen}>
        <IconButton icon="more" label="Scene actions" />
      </Menu>
      <p aria-live="polite">{chosen && \`Chosen: \${chosen}\`}</p>
    </>
  );
}
`,Xc=`import { useEffect, useState } from 'react';
import { Meter } from '@mosaic-home/design-system/react';

export function MeterExample() {
  const [level, setLevel] = useState(64);
  useEffect(() => {
    const timer = setInterval(() => {
      setLevel((l) => Math.max(30, Math.min(100, l + Math.round((Math.random() - 0.5) * 16))));
    }, 500);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <Meter
        value={level}
        label="Noise level"
        zones={{ warning: 70, danger: 90 }}
        segments={12}
        valueText={\`\${level} dB\`}
      />
      <Meter value={3} max={4} mode="bars" label="Wi-Fi signal" valueText="3 of 4" />
    </>
  );
}
`,Zc=`import { MonthGrid } from '@mosaic-home/design-system/react';

// Energy used per day in March; days after today have no data yet.
const energy = [
  6.1, 5.4, 7.2, 4.8, 5.9, 8.3, 8.8, 5.1, 6.0, 5.7, 4.9, 6.4, 9.1,
  8.6, 5.3, 5.8, 6.2, 4.6, 5.5, 8.7, 9.4, 6.0, 5.2, 4.7, 6.3,
];

export function MonthGridExample() {
  return (
    <MonthGrid
      year={2026}
      month={3}
      values={energy}
      label="Energy used per day"
      today={25}
      format={(v) => \`\${v.toFixed(1)} kWh\`}
    />
  );
}
`,Qc=`import { useState } from 'react';
import { MultiSelect } from '@mosaic-home/design-system/react';
import type { MultiSelectOption } from '@mosaic-home/design-system/web';

const rooms: MultiSelectOption[] = [
  { value: 'living', label: 'Living room', icon: 'home', description: '4 lights' },
  { value: 'kitchen', label: 'Kitchen', icon: 'lightbulb', description: '3 lights' },
  { value: 'bedroom', label: 'Bedroom', icon: 'lightbulb', description: '2 lights' },
  { value: 'study', label: 'Study', icon: 'lightbulb', description: '2 lights' },
];

export function MultiSelectExample() {
  const [chosen, setChosen] = useState<string[]>(['living', 'kitchen']);
  return (
    <MultiSelect
      label="Rooms"
      placeholder="Choose rooms"
      helper="The scene runs in every chosen room."
      error={chosen.length ? undefined : 'Choose at least one room.'}
      options={rooms}
      values={chosen}
      onChange={setChosen}
    />
  );
}
`,$c=`import { useState } from 'react';
import { NavRail } from '@mosaic-home/design-system/react';

const SETTINGS = [{ id: 'settings', label: 'Settings', icon: 'settings' }];

export function NavRailExample() {
  const [page, setPage] = useState('home');
  const [unread, setUnread] = useState(3);
  const open = (id: string) => {
    setPage(id);
    if (id === 'alerts') setUnread(0);
  };
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'lights', label: 'Lights', icon: 'lightbulb', iconSelected: 'lightbulb-on' },
    { id: 'media', label: 'Media', icon: 'music' },
    { id: 'alerts', label: 'Alerts', icon: 'bell', badge: unread || null, badgeLabel: \`\${unread} unread\` },
  ];
  return <NavRail label="Main" items={items} footerItems={SETTINGS} value={page} onChange={open} />;
}
`,el=`import { useState } from 'react';
import { Notice } from '@mosaic-home/design-system/react';

export function NoticesExample() {
  const [answer, setAnswer] = useState('');
  return (
    <>
      <Notice
        kind="permission"
        icon="microphone"
        title="Talk to your home"
        points={['Listens only while you hold the button', 'Turn it off any time in Settings']}
        actions={[
          { label: 'Allow microphone', primary: true, onClick: () => setAnswer('Allowed') },
          { label: 'Not now', dismisses: true, onClick: () => setAnswer('Asked again later') },
        ]}
      >
        Allow microphone access to control lights and climate by voice.
      </Notice>
      <p aria-live="polite">{answer}</p>
      <Notice kind="tip" actions={[{ label: 'Got it', primary: true, dismisses: true }]}>
        Long-press a tile to change its size or move it to another room.
      </Notice>
    </>
  );
}
`,tl=`import { useState } from 'react';
import { mdiDoorOpen, mdiWashingMachine, mdiWaterAlert } from '@mdi/js';
import { NotificationCentre } from '@mosaic-home/design-system/react';
import type { NotificationItem } from '@mosaic-home/design-system/web';

export function NotificationCentreExample() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'leak',
      title: 'Water under the kitchen sink',
      message: 'The leak sensor has been wet for 2 minutes.',
      priority: 'critical',
      icon: mdiWaterAlert,
      time: 'Now',
      actions: [{ id: 'valve', label: 'Close main valve', tone: 'primary' }],
    },
    { id: 'door', title: 'Back door left open', group: 'Security', icon: mdiDoorOpen, time: '10 min' },
    { id: 'washer', title: 'Washing finished', group: 'Appliances', icon: mdiWashingMachine, time: '12 min' },
  ]);
  const without = (ids: string[]) => setNotifications((list) => list.filter((n) => !ids.includes(n.id)));
  return (
    <NotificationCentre
      notifications={notifications}
      onAction={(id) => without([id])}
      onDismiss={(id) => without([id])}
      onClearAll={without}
    />
  );
}
`,nl=`import { useState } from 'react';
import { NumberInput } from '@mosaic-home/design-system/react';

export function NumberInputExample() {
  const [target, setTarget] = useState(21.5);
  return (
    <NumberInput
      label="Target temperature"
      value={target}
      min={7}
      max={30}
      step={0.5}
      unit="°C"
      helper={\`Heating to \${target} °C.\`}
      onChange={setTarget}
    />
  );
}
`,rl=`import { useState } from 'react';
import { Onboarding, Switch, Text } from '@mosaic-home/design-system/react';

export function OnboardingExample() {
  const [step, setStep] = useState(0);
  const [notify, setNotify] = useState(true);
  const [finished, setFinished] = useState(false);
  if (finished) return <Text>All set. Notifications are {notify ? 'on' : 'off'}.</Text>;
  return (
    <Onboarding
      step={step}
      onStepChange={setStep}
      onDone={() => setFinished(true)}
      onSkip={() => setFinished(true)}
      steps={[
        { title: 'Welcome home', text: 'Every room, light and sensor on one screen.', icon: 'home' },
        { title: 'Group by room', text: 'Rooms keep the dashboard short. Reorder them any time.', icon: 'lightbulb' },
        {
          title: 'Stay in the loop',
          text: 'Get a gentle chime when a door is left open.',
          icon: 'bell',
          content: <Switch label="Allow notifications" row checked={notify} onChange={(e) => setNotify(e.target.checked)} />,
        },
      ]}
    />
  );
}
`,il=`import { useState } from 'react';
import { OpeningsSummary } from '@mosaic-home/design-system/react';
import type { OpeningEntry } from '@mosaic-home/design-system/web';

const START: OpeningEntry[] = [
  // Should be shut now: takes the warning tone and goes first.
  { id: 'skylight', name: 'Skylight', kind: 'window', open: true, area: 'Landing', alert: true },
  { id: 'back', name: 'Back door', kind: 'door', open: true, area: 'Kitchen', since: '5 min' },
  { id: 'garage', name: 'Garage door', kind: 'garage', open: false },
];

export function OpeningsSummaryExample() {
  const [items, setItems] = useState(START);
  const shut = (id: string) =>
    setItems((all) => all.map((i) => (i.id === id ? { ...i, open: false, alert: false } : i)));
  return <OpeningsSummary items={items} reason="Rain expected within the hour" onSelect={shut} />;
}
`,al=`import { useState } from 'react';
import { IconButton, PageHeader } from '@mosaic-home/design-system/react';

export function PageHeaderExample() {
  const [lightsOn, setLightsOn] = useState(3);
  return (
    <PageHeader
      eyebrow="Ground floor"
      title="Living room"
      subtitle={lightsOn ? \`\${lightsOn} lights on\` : 'All lights off'}
      back={{ label: 'Back to rooms', onClick: () => history.back() }}
      actions={<IconButton icon="power" label="Turn off all lights" onClick={() => setLightsOn(0)} />}
    />
  );
}
`,ol=`import { useState } from 'react';
import { Pagination } from '@mosaic-home/design-system/react';

export function PaginationExample() {
  const [page, setPage] = useState(1);
  return (
    <div>
      <p>
        Showing events {(page - 1) * 20 + 1} to {page * 20}
      </p>
      <Pagination label="Event log pages" count={12} page={page} onChange={setPage} />
    </div>
  );
}
`,sl=`import { ThemeProvider, useTokens } from '@mosaic-home/design-system/react';

function EnergyBars() {
  // Where CSS can't reach (SVG fills here), read the palette of the nearest ThemeProvider.
  const { series } = useTokens().theme.palette;
  const usage = [24, 48, 36];
  return (
    <svg width={240} height={80} role="img" aria-label="Energy use by room">
      {usage.map((value, i) => (
        <rect key={i} x={i * 80 + 8} y={80 - value} width={64} height={value} fill={series[i]} />
      ))}
    </svg>
  );
}

export function PaletteExample() {
  return (
    <ThemeProvider theme="midnight">
      {/* In CSS, colour roles are --mh-* variables that follow the theme. */}
      <span style={{ background: 'var(--mh-accent-soft)', color: 'var(--mh-accent-light)' }}>Heating</span>
      <EnergyBars />
    </ThemeProvider>
  );
}
`,cl=`import { useState } from 'react';
import { IconButton, PanelGroup, Text } from '@mosaic-home/design-system/react';

export function PanelGroupExample() {
  const [tab, setTab] = useState('events');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <PanelGroup
      label="Diagnostics"
      panels={[
        { id: 'events', label: 'Events', icon: 'bell', badge: 2, content: <Text>Motion in the hall at 14:02.</Text> },
        { id: 'devices', label: 'Devices', icon: 'wifi', content: <Text>12 devices online, 1 asleep.</Text> },
        { id: 'logs', label: 'Logs', icon: 'info', content: <Text variant="mono">Heartbeat at 14:05.</Text> },
      ]}
      value={tab}
      onChange={setTab}
      actions={<IconButton icon="refresh" label="Refresh" disabled={tab === 'logs'} />}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
    />
  );
}
`,ll=`import { useState } from 'react';
import { Button, IconButton, Panel, Switch } from '@mosaic-home/design-system/react';

export function PanelExample() {
  const [ceiling, setCeiling] = useState(true);
  const [floorLamp, setFloorLamp] = useState(false);
  const allOff = () => {
    setCeiling(false);
    setFloorLamp(false);
  };
  return (
    <Panel
      title="Lights"
      icon="lightbulb"
      description={\`\${Number(ceiling) + Number(floorLamp)} of 2 on\`}
      actions={<IconButton icon="more" label="Light options" />}
      footer={
        <Button variant="secondary" size="small" onClick={allOff}>
          All off
        </Button>
      }
    >
      <Switch label="Ceiling" row checked={ceiling} onChange={(e) => setCeiling(e.target.checked)} />
      <Switch label="Floor lamp" row checked={floorLamp} onChange={(e) => setFloorLamp(e.target.checked)} />
    </Panel>
  );
}
`,ul=`import { useState } from 'react';
import { PeopleStrip } from '@mosaic-home/design-system/react';
import type { PersonEntry } from '@mosaic-home/design-system/web';

const PEOPLE: PersonEntry[] = [
  { id: 'robin', name: 'Robin Vale', where: 'home', since: '2 h' },
  { id: 'kit', name: 'Kit Harrow', where: 'zone', zone: 'Studio', since: '25 min' },
  { id: 'ash', name: 'Ash Merrow', where: 'away', since: '3 h' },
];

export function PeopleStripExample() {
  const [selected, setSelected] = useState<string | null>(null);
  const person = PEOPLE.find((p) => p.id === selected);
  return (
    <>
      <PeopleStrip people={PEOPLE} onSelect={setSelected} />
      {person && <p>Selected {person.name}</p>}
    </>
  );
}
`,dl=`import { useState } from 'react';
import { IconButton, Popover } from '@mosaic-home/design-system/react';

export function PopoverExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Popover
        trigger={<IconButton icon="info" label="About this sensor" />}
        title="Air quality"
        open={open}
        onOpenChange={setOpen}
      >
        <p>Measured every five minutes in the hallway. Readings under 50 are good.</p>
      </Popover>
      <p aria-live="polite">{open ? 'Showing details' : ''}</p>
    </>
  );
}
`,fl=`import { useState } from 'react';
import { PositionControl } from '@mosaic-home/design-system/react';

export function PositionControlExample() {
  const [position, setPosition] = useState(50);
  return (
    <PositionControl
      label="Studio blind"
      state={position === 100 ? 'open' : position === 0 ? 'closed' : 'stopped'}
      position={position}
      can={{ open: true, close: true, stop: true, position: true }}
      labels={{ open: 'Raise', close: 'Lower' }}
      onOpen={() => setPosition(100)}
      onClose={() => setPosition(0)}
      onPosition={setPosition}
    />
  );
}
`,pl=`import { PriceStrip } from '@mosaic-home/design-system/react';

const TODAY = [
  0.31, 0.29, 0.24, 0.18, 0.15, 0.14, 0.17, 0.26, 0.34, 0.33, 0.27, 0.22,
  0.19, 0.16, 0.13, 0.12, 0.18, 0.29, 0.41, 0.44, 0.38, 0.32, 0.28, 0.25,
];
const SLOTS = TODAY.map((value, hour) => ({ label: String(hour), name: \`\${hour}:00\`, value }));

export function PriceStripExample() {
  return (
    <PriceStrip
      label="Electricity prices today"
      prices={SLOTS}
      // The slot running now; the cheapest three hours from here on are shaded.
      current={new Date().getHours()}
      unit="/kWh"
      end="24:00"
    />
  );
}
`,ml=`import { useEffect, useState } from 'react';
import { Button, ProgressBar } from '@mosaic-home/design-system/react';

export function ProgressBarExample() {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const running = started && value < 100;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setValue((v) => Math.min(100, v + 10)), 400);
    return () => clearInterval(timer);
  }, [running]);
  const start = () => {
    setValue(0);
    setStarted(true);
  };
  return (
    <>
      <ProgressBar label="Firmware update" showLabel showValue value={value} />
      <Button icon="download" disabled={running} onClick={start}>
        Update
      </Button>
    </>
  );
}
`,hl=`import { useEffect, useState } from 'react';
import { ProgressList } from '@mosaic-home/design-system/react';
import type { ProgressListItem } from '@mosaic-home/design-system/web';

const jobs = (step: number): ProgressListItem[] => {
  const firmware = Math.min(100, step * 10);
  return [
    {
      name: 'Hallway sensor firmware',
      value: firmware,
      status: firmware === 100 ? 'Installed' : 'Updating',
      detail: 'Version 2.3.1',
      tone: firmware === 100 ? 'success' : 'accent',
    },
    { name: 'Weekly backup', value: Math.min(100, 40 + step * 4), status: 'Uploading', detail: 'of 3.4 GB' },
    { name: 'Garden map', value: null, status: 'Preparing' },
  ];
};

export function ProgressListExample() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 15) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(timer);
  }, [step]);
  return <ProgressList label="Updates and backups" items={jobs(step)} />;
}
`,gl=`import { useState } from 'react';
import { Button, ProgressRing } from '@mosaic-home/design-system/react';

const total = 8;

export function ProgressRingExample() {
  const [done, setDone] = useState(3);
  return (
    <>
      <ProgressRing label="Rooms set up" value={done} max={total} valueText={\`\${done}/\${total}\`} size="large" />
      <Button variant="secondary" disabled={done === total} onClick={() => setDone((n) => Math.min(total, n + 1))}>
        Set up next room
      </Button>
    </>
  );
}
`,_l=`import { useEffect, useState } from 'react';
import { Badge, PropertyList } from '@mosaic-home/design-system/react';

export function PropertyListExample() {
  const [minutesLeft, setMinutesLeft] = useState(78);
  useEffect(() => {
    const timer = setInterval(() => setMinutesLeft((m) => Math.max(0, m - 1)), 60_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <PropertyList
      items={[
        { label: 'Status', value: <Badge label="Printing" tone="accent" /> },
        { label: 'Time left', value: \`\${minutesLeft} min\` },
        { label: 'Nozzle', value: '215 °C' },
        { label: 'File', value: 'shelf_bracket_v2.gcode' },
      ]}
    />
  );
}
`,vl=`import { useState } from 'react';
import { QrCode, TextField } from '@mosaic-home/design-system/react';

export function QrCodeExample() {
  const [link, setLink] = useState('https://homeassistant.local:8123/');
  return (
    <>
      <TextField label="Link" value={link} onChange={(event) => setLink(event.target.value)} />
      <QrCode value={link} label="Link to the dashboard" caption="Open on your phone" />
    </>
  );
}
`,yl=`import { useState } from 'react';
import { RadialDial } from '@mosaic-home/design-system/react';

export function RadialDialExample() {
  const [volume, setVolume] = useState(35);
  return <RadialDial label="Volume" ticks={11} format={(v) => \`\${v}%\`} value={volume} onValueChange={setVolume} />;
}
`,bl=`import { useState } from 'react';
import { RadioGroup } from '@mosaic-home/design-system/react';

const MODES = [
  { value: 'auto', label: 'Auto', description: 'Follow the weekly schedule.' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'eco', label: 'Eco', description: 'Two degrees lower while nobody is home.' },
  { value: 'off', label: 'Off' },
];

export function RadioGroupExample() {
  const [mode, setMode] = useState('auto');
  return <RadioGroup legend="Heating mode" options={MODES} value={mode} onChange={(value) => setMode(value)} />;
}
`,xl=`import { useState } from 'react';
import { RangeSlider } from '@mosaic-home/design-system/react';

export function RangeSliderExample() {
  const [range, setRange] = useState<[number, number]>([19, 23]);
  return (
    <RangeSlider
      label="Comfort range"
      min={14}
      max={28}
      step={0.5}
      minGap={1}
      showValue
      format={(v) => \`\${v.toFixed(1)}°\`}
      labels={{ low: 'Heat below', high: 'Cool above' }}
      value={range}
      onValueChange={setRange}
    />
  );
}
`,Sl=`import { useState } from 'react';
import { Rating } from '@mosaic-home/design-system/react';

export function RatingExample() {
  const [stars, setStars] = useState(4);
  return <Rating label="How was the film?" value={stars} onChange={setStars} />;
}
`,Cl=`import { useEffect, useState } from 'react';
import { RecordingPill } from '@mosaic-home/design-system/react';

export function RecordingPillExample() {
  const [recording, setRecording] = useState(true);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!recording || paused) return;
    // Stands in for the microphone's input level (0–1).
    const timer = setInterval(() => setLevel(Math.random()), 120);
    return () => clearInterval(timer);
  }, [recording, paused]);
  if (!recording) return <p aria-live="polite">Note saved</p>;
  return (
    <>
      <RecordingPill level={level} paused={paused} onPauseToggle={setPaused} onStop={() => setRecording(false)} />
      <p aria-live="polite">{paused ? 'Paused' : 'Recording'}</p>
    </>
  );
}
`,wl=`import { useState } from 'react';
import { ReorderableList, Stack, Text } from '@mosaic-home/design-system/react';

// Kept outside the component: the list follows \`items\` whenever a new array arrives.
const ROOMS = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office'].map((room) => ({ id: room, label: room, icon: 'home' }));

export function ReorderableListExample() {
  const [order, setOrder] = useState(ROOMS.map((room) => room.id));
  return (
    <Stack gap="md">
      <ReorderableList label="Room order on the dashboard" items={ROOMS} onChange={setOrder} />
      <Text variant="caption" tone="muted">
        Order: {order.join(', ')}
      </Text>
    </Stack>
  );
}
`,Tl=`import { useState } from 'react';
import { mdiFan } from '@mdi/js';
import { RoomCard } from '@mosaic-home/design-system/react';
import type { RoomToggle } from '@mosaic-home/design-system/web';

export function RoomCardExample() {
  const [toggles, setToggles] = useState<RoomToggle[]>([
    { id: 'lights', label: 'Lights', icon: 'lightbulb', on: true },
    { id: 'fan', label: 'Fan', icon: mdiFan, on: false, tone: 'cool' },
  ]);
  const lightsOn = toggles.find((t) => t.id === 'lights')?.on ? 4 : 0;
  return (
    <RoomCard
      name="Living room"
      temperature={21.5}
      humidity={46}
      lightsOn={lightsOn}
      lightsTotal={4}
      toggles={toggles}
      onOpen={() => location.assign('#/rooms/living-room')}
      onToggle={(id, on) => setToggles((list) => list.map((t) => (t.id === id ? { ...t, on } : t)))}
    />
  );
}
`,El=`import { useState } from 'react';
import { mdiCoffeeOutline, mdiMovieOpenOutline, mdiWeatherNight, mdiWeatherSunset } from '@mdi/js';
import { SceneGrid } from '@mosaic-home/design-system/react';
import type { Scene } from '@mosaic-home/design-system/web';

const scenes: Scene[] = [
  { id: 'morning', label: 'Morning', icon: mdiCoffeeOutline, description: 'Bright, cool white' },
  { id: 'evening', label: 'Evening', icon: mdiWeatherSunset, description: 'Dim, warm' },
  { id: 'film', label: 'Film night', icon: mdiMovieOpenOutline, description: 'Lamps low, blinds down' },
  { id: 'night', label: 'Goodnight', icon: mdiWeatherNight, description: 'Everything off' },
];

export function SceneGridExample() {
  const [active, setActive] = useState('evening');
  return <SceneGrid label="Scenes" scenes={scenes} active={active} onActivate={setActive} />;
}
`,Dl=`import { useState } from 'react';
import { ScheduleEditor } from '@mosaic-home/design-system/react';
import type { ScheduleDay } from '@mosaic-home/design-system/web';

// Times are minutes after midnight.
const WORKDAY = [
  { start: 6 * 60 + 30, end: 8 * 60, value: 'comfort' },
  { start: 17 * 60, end: 22 * 60, value: 'comfort' },
];
const WEEKEND = [{ start: 8 * 60, end: 23 * 60, value: 'comfort' }];
const WEEK: ScheduleDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({
  label,
  blocks: i < 5 ? WORKDAY : WEEKEND,
}));
const LEVELS = [
  { value: 'comfort', label: '21°' },
  { value: 'eco', label: '18°' },
];

export function ScheduleEditorExample() {
  const [days, setDays] = useState(WEEK);
  return (
    <ScheduleEditor label="Living room heating" days={days} levels={LEVELS} base="16°" onChange={setDays} />
  );
}
`,Ol=`import { Card, Screen, Stack, Text } from '@mosaic-home/design-system/react';

export function ScreenExample() {
  const header = (
    <Stack gap="xxs">
      <Text variant="eyebrow" tone="muted">
        Living room
      </Text>
      <Text variant="headline">Good evening</Text>
    </Stack>
  );
  return (
    <Screen width="medium" label="Home" header={header}>
      <Card title="Climate">
        <Text tone="muted">21.5° and 46% humidity.</Text>
      </Card>
      <Card title="Lights">
        <Text tone="muted">Kitchen light and 2 others are on.</Text>
      </Card>
    </Screen>
  );
}
`,kl=`import { List, ListItem, ScrollPanel } from '@mosaic-home/design-system/react';

const ROOMS = ['Living room', 'Kitchen', 'Hall', 'Bedroom', 'Office', 'Bathroom', 'Garden', 'Garage', 'Attic'];

export function ScrollPanelExample() {
  return (
    <ScrollPanel label="Rooms" size="medium">
      <List>
        {ROOMS.map((room, i) => (
          <ListItem key={room} title={room} subtitle={\`\${i + 1} devices\`} icon="home" />
        ))}
      </List>
    </ScrollPanel>
  );
}
`,Al=`import { useState } from 'react';
import { SearchField } from '@mosaic-home/design-system/react';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Study', 'Hallway'];

export function SearchFieldExample() {
  const [query, setQuery] = useState('');
  const matches = rooms.filter((room) => room.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <SearchField placeholder="Search rooms" value={query} onValueChange={setQuery} />
      <ul>
        {matches.map((room) => (
          <li key={room}>{room}</li>
        ))}
      </ul>
    </>
  );
}
`,jl=`import { useState } from 'react';
import { SecretField } from '@mosaic-home/design-system/react';

export function SecretFieldExample() {
  const [password, setPassword] = useState('');
  return (
    <SecretField
      label="New password"
      kind="new-password"
      required
      helper="At least 12 characters."
      success={password.length >= 12 ? 'Long enough.' : undefined}
      value={password}
      onValueChange={setPassword}
    />
  );
}
`,Ml=`import { useState } from 'react';
import { SegmentedControl } from '@mosaic-home/design-system/react';

const RANGES = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export function SegmentedControlExample() {
  const [range, setRange] = useState('week');
  return (
    <SegmentedControl label="Energy range" options={RANGES} value={range} onChange={(value) => setRange(value)} />
  );
}
`,Nl=`import { useState } from 'react';
import { Select } from '@mosaic-home/design-system/react';

export function SelectExample() {
  const [room, setRoom] = useState('');
  return (
    <Select
      label="Room"
      placeholder="Choose a room"
      helper={room ? undefined : 'The scene runs in this room.'}
      options={[
        { value: 'living', label: 'Living room' },
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'bedroom', label: 'Bedroom' },
        { value: 'garage', label: 'Garage', disabled: true },
      ]}
      value={room}
      onChange={(event) => setRoom(event.target.value)}
    />
  );
}
`,Pl=`import { ThemeProvider, useTokens } from '@mosaic-home/design-system/react';

const rooms = ['Living room', 'Kitchen', 'Bedroom', 'Office'];

function RoomGrid() {
  // The numbers are there for layout done in code; the variables follow corners and density in CSS.
  const { space } = useTokens();
  const columns = Math.max(1, Math.floor((window.innerWidth + space.sm) / (160 + space.sm)));
  return (
    <div style={{ display: 'grid', gap: space.sm, gridTemplateColumns: \`repeat(\${columns}, 1fr)\` }}>
      {rooms.map((room) => (
        <div
          key={room}
          style={{
            padding: 'var(--mh-space-md)',
            borderRadius: 'var(--mh-radius-lg)',
            minHeight: 'var(--mh-control-lg)',
            background: 'var(--mh-surface-raised)',
          }}
        >
          {room}
        </div>
      ))}
    </div>
  );
}

export function ShapeSpaceExample() {
  return (
    <ThemeProvider theme="daylight" deviceClass="phone" character={{ density: 'compact' }}>
      <RoomGrid />
    </ThemeProvider>
  );
}
`,Fl=`import { useEffect, useState } from 'react';
import { Skeleton } from '@mosaic-home/design-system/react';

export function SkeletonExample() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  if (!loaded) return <Skeleton lines={3} label="Loading the forecast" />;
  return (
    <div>
      <h3>Tomorrow</h3>
      <p>Light rain in the morning, clearing by noon.</p>
      <p>High of 17°, low of 9°.</p>
    </div>
  );
}
`,Il=`import { useState } from 'react';
import { Slider } from '@mosaic-home/design-system/react';

export function SliderExample() {
  const [brightness, setBrightness] = useState(60);
  return (
    <Slider
      label="Brightness"
      step={5}
      showValue
      format={(v) => \`\${v}%\`}
      value={brightness}
      onValueChange={setBrightness}
    />
  );
}
`,Ll=`import { useEffect, useState } from 'react';
import { Sparkline } from '@mosaic-home/design-system/react';

export function SparklineExample() {
  const [readings, setReadings] = useState([19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.9, 22.3]);
  useEffect(() => {
    // A new reading arrives: drop the oldest.
    const timer = setInterval(() => {
      setReadings((prev) => {
        const last = prev[prev.length - 1] ?? 21;
        return [...prev.slice(1), Math.round((last + (Math.random() - 0.5)) * 10) / 10];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Sparkline
      values={readings}
      label="Living room temperature, last 10 hours"
      area
      format={(v) => \`\${v.toFixed(1)}°\`}
    />
  );
}
`,Rl=`import { useState } from 'react';
import { SpeakerSelector } from '@mosaic-home/design-system/react';
import type { Speaker } from '@mosaic-home/design-system/web';

export function SpeakerSelectorExample() {
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 'living', name: 'Living room', detail: 'Soundbar', selected: true, volume: 0.42, muted: false },
    { id: 'kitchen', name: 'Kitchen', detail: 'Shelf speaker', selected: true, volume: 0.25, muted: false },
    { id: 'study', name: 'Study', detail: 'Desk speaker', volume: 0.5, muted: false },
  ]);
  const change = (id: string, patch: Partial<Speaker>) =>
    setSpeakers((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  return (
    <SpeakerSelector
      speakers={speakers}
      multiple
      onSelect={(id, selected) => change(id, { selected })}
      onVolume={(id, volume) => change(id, { volume, muted: false })}
      onMute={(id, muted) => change(id, { muted })}
    />
  );
}
`,zl=`import { useEffect, useState } from 'react';
import { Spinner } from '@mosaic-home/design-system/react';

export function SpinnerExample() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div aria-live="polite">
      {loaded ? <p>Living room, Kitchen, Bedroom and Garden are ready.</p> : <Spinner size="large" label="Loading rooms" />}
    </div>
  );
}
`,Bl=`import { useState } from 'react';
import { SplitButton } from '@mosaic-home/design-system/react';
import type { MenuEntry } from '@mosaic-home/design-system/web';

const items: MenuEntry[] = [
  { value: 'in-10', label: 'Run in 10 minutes', icon: 'refresh' },
  { value: 'at-sunset', label: 'Run at sunset', icon: 'weather' },
  { separator: true },
  { value: 'edit', label: 'Edit scene', icon: 'edit' },
];

export function SplitButtonExample() {
  const [status, setStatus] = useState('');
  return (
    <>
      <SplitButton
        label="Run scene"
        icon="play"
        items={items}
        onClick={() => setStatus('Evening scene is running')}
        onSelect={(value) => setStatus(\`Chosen: \${value}\`)}
      />
      <p aria-live="polite">{status}</p>
    </>
  );
}
`,Vl=`import { useState } from 'react';
import { List, ListItem, SplitPane, Stack, Text } from '@mosaic-home/design-system/react';

const ROOMS = ['Living room', 'Kitchen', 'Bedroom', 'Office'];

export function SplitPaneExample() {
  const [size, setSize] = useState(35);
  const [collapsed, setCollapsed] = useState(false);
  const [room, setRoom] = useState('Living room');
  const list = (
    <List label="Rooms">
      {ROOMS.map((r) => (
        <ListItem key={r} title={r} icon="home" current={r === room} onClick={() => setRoom(r)} />
      ))}
    </List>
  );
  return (
    <div style={{ height: 320 }}>
      <SplitPane
        start={list}
        end={
          <Stack gap="sm">
            <Text variant="title">{room}</Text>
            <Text tone="muted">3 lights on, 21.5°.</Text>
          </Stack>
        }
        size={size}
        min={25}
        max={65}
        collapsible="start"
        collapsed={collapsed}
        label="Resize room list"
        startLabel="Rooms"
        onResize={setSize}
        onCollapse={setCollapsed}
      />
    </div>
  );
}
`,Hl=`import { useState } from 'react';
import { Button, Card, Grid, Row, Stack, Text } from '@mosaic-home/design-system/react';

export function StackExample() {
  const [rooms, setRooms] = useState(['Living room', 'Kitchen', 'Bedroom', 'Office']);
  const addRoom = () => setRooms((list) => [...list, \`Room \${list.length + 1}\`]);
  return (
    <Stack gap="lg">
      <Row justify="between">
        <Text variant="title">Rooms</Text>
        <Button icon="add" variant="secondary" size="small" onClick={addRoom}>
          Add room
        </Button>
      </Row>
      <Grid min="small" gap="sm">
        {rooms.map((room) => (
          <Card key={room} title={room} />
        ))}
      </Grid>
    </Stack>
  );
}
`,Ul=`import { useEffect, useState } from 'react';
import { mdiDoorOpen, mdiLightbulbOutline, mdiThermostat } from '@mdi/js';
import { StateTimeline } from '@mosaic-home/design-system/react';
import type { StateTimelineRow } from '@mosaic-home/design-system/web';

const today = (hours: number, minutes = 0): Date => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// A span with \`to: null\` is still going on.
const rows: StateTimelineRow[] = [
  {
    label: 'Hall light',
    icon: mdiLightbulbOutline,
    spans: [{ from: today(6, 40), to: today(7, 55) }, { from: today(17, 10), to: null }],
  },
  { label: 'Back door', icon: mdiDoorOpen, color: 2, spans: [{ from: today(8, 5), to: today(8, 9) }] },
  { label: 'Heating', icon: mdiThermostat, color: 5, spans: [{ from: today(16, 30), to: null }] },
];

export function StateTimelineExample() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);

  return <StateTimeline label="Today at home" rows={rows} start={today(0)} end={today(24)} now={now} />;
}
`,Wl=`import { useState } from 'react';
import { StatusBar } from '@mosaic-home/design-system/react';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function StatusBarExample() {
  const [synced, setSynced] = useState(now);
  return (
    <StatusBar
      label="Hub status"
      items={[
        { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' },
        { id: 'devices', label: 'Devices', value: '24' },
        { id: 'time', label: 'Synced', value: synced, end: true, announce: true },
        { id: 'sync', label: 'Sync now', icon: 'refresh', end: true, onClick: () => setSynced(now()) },
      ]}
    />
  );
}
`,Gl=`import { useEffect, useState } from 'react';
import { Status } from '@mosaic-home/design-system/react';

export function StatusExample() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  // \`announce\` reads changes out to screen readers.
  return <Status state={online ? 'online' : 'offline'} announce />;
}
`,Kl=`import { useState } from 'react';
import { Stepper } from '@mosaic-home/design-system/react';

export function StepperExample() {
  const [guests, setGuests] = useState(2);
  return (
    <Stepper
      label="Guests"
      min={1}
      max={8}
      format={(v) => (v === 1 ? '1 guest' : \`\${v} guests\`)}
      value={guests}
      onChange={setGuests}
    />
  );
}
`,ql=`import { useState } from 'react';
import { Button, Steps } from '@mosaic-home/design-system/react';

const STEPS = [
  { label: 'Connect', description: 'Plug in the hub' },
  { label: 'Network', description: 'Wi-Fi and password' },
  { label: 'Rooms', optional: true },
  { label: 'Done' },
];

export function StepsExample() {
  const [current, setCurrent] = useState(1);
  return (
    <div>
      <Steps label="Hub setup" steps={STEPS} current={current} onSelect={setCurrent} />
      <Button variant="primary" onClick={() => setCurrent((n) => Math.min(n + 1, STEPS.length))}>
        Next
      </Button>
    </div>
  );
}
`,Jl=`import { useState } from 'react';
import { Stack, SwipeRow, Text } from '@mosaic-home/design-system/react';

export function SwipeRowExample() {
  const [favourite, setFavourite] = useState(false);
  const [deleted, setDeleted] = useState(false);
  if (deleted) return <Text tone="muted">Kitchen light removed.</Text>;
  return (
    <SwipeRow
      label="Kitchen light"
      start={[
        {
          id: 'favourite',
          label: favourite ? 'Unfavourite' : 'Favourite',
          icon: favourite ? 'star-outline' : 'star',
          tone: 'accent',
          onAction: () => setFavourite(!favourite),
        },
      ]}
      end={[{ id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger', onAction: () => setDeleted(true) }]}
    >
      <Stack gap="none">
        <Text variant="label">Kitchen light{favourite ? ' ★' : ''}</Text>
        <Text variant="caption" tone="muted">
          On, 80%
        </Text>
      </Stack>
    </SwipeRow>
  );
}
`,Yl=`import { useState } from 'react';
import { Switch } from '@mosaic-home/design-system/react';

export function SwitchExample() {
  const [motion, setMotion] = useState(true);
  const [afterSunset, setAfterSunset] = useState(false);
  return (
    <div>
      <Switch
        row
        icon="lightbulb"
        label="Motion lighting"
        description="Turn the lights on when someone walks in."
        checked={motion}
        onChange={(e) => setMotion(e.target.checked)}
      />
      <Switch
        row
        icon="weather"
        label="Only after sunset"
        checked={afterSunset}
        disabled={!motion}
        onChange={(e) => setAfterSunset(e.target.checked)}
      />
    </div>
  );
}
`,Xl=`import { useState } from 'react';
import { Tabs } from '@mosaic-home/design-system/react';

const TABS = [
  { id: 'overview', label: 'Overview', panel: <p>Currently 20.5°, heating to 21°.</p> },
  { id: 'schedule', label: 'Schedule', panel: <p>Weekdays 06:30 to 22:00 at 21°.</p> },
  { id: 'history', label: 'History', badge: 3, panel: <p>Three changes today.</p> },
];

export function TabsExample() {
  const [tab, setTab] = useState('overview');
  return <Tabs label="Thermostat" tabs={TABS} value={tab} onChange={setTab} />;
}
`,Zl=`import { useState } from 'react';
import { TextArea } from '@mosaic-home/design-system/react';

export function TextAreaExample() {
  const [text, setText] = useState('Dinner is ready in ten minutes.');
  return (
    <TextArea
      label="Announcement"
      placeholder="What should the speakers say?"
      error={text.trim() ? undefined : 'Write a message before sending.'}
      maxLength={140}
      showCount
      maxRows={6}
      value={text}
      onChange={(event) => setText(event.target.value)}
    />
  );
}
`,Ql=`import { useState } from 'react';
import { TextField } from '@mosaic-home/design-system/react';

export function TextFieldExample() {
  const [room, setRoom] = useState('');
  const [touched, setTouched] = useState(false);
  return (
    <TextField
      label="Room name"
      placeholder="e.g. Kitchen"
      helper="Shown on tiles and in voice replies."
      error={touched && !room.trim() ? 'Give the room a name.' : undefined}
      maxLength={24}
      showCount
      value={room}
      onChange={(event) => setRoom(event.target.value)}
      onBlur={() => setTouched(true)}
    />
  );
}
`,$l=`import { Text } from '@mosaic-home/design-system/react';

export function TextExample() {
  return (
    <header>
      <Text variant="eyebrow" tone="muted">
        Living room
      </Text>
      <Text variant="display">21.5°</Text>
      <Text>Heating to 22° until 23:00.</Text>
      <Text variant="label" tone="warning">
        Window open
      </Text>
    </header>
  );
}
`,eu=`import { useState } from 'react';
import { Thermostat } from '@mosaic-home/design-system/react';

const MODES = [
  { value: 'off', label: 'Off' },
  { value: 'heat', label: 'Heat' },
  { value: 'cool', label: 'Cool' },
];

export function ThermostatExample() {
  const [target, setTarget] = useState(21);
  const [mode, setMode] = useState('heat');
  return (
    <Thermostat
      label="Living room thermostat"
      current={19.5}
      target={target}
      mode={mode}
      modes={MODES}
      action={mode === 'off' ? 'off' : 'heating'}
      // Called once the taps settle, so one change is sent rather than one per tap.
      onTarget={(value) => {
        if (typeof value === 'number') setTarget(value);
      }}
      onMode={setMode}
    />
  );
}
`,tu=`import { useState } from 'react';
import { StatTile, Tile, TileGrid } from '@mosaic-home/design-system/react';

export function TilesExample() {
  const [lights, setLights] = useState<Record<string, boolean>>({ Kitchen: true, 'Living room': false });
  return (
    <TileGrid label="Living room">
      {Object.entries(lights).map(([name, on]) => (
        <Tile
          key={name}
          icon="lightbulb"
          iconOn="lightbulb-on"
          label={name}
          state={on ? 'On' : 'Off'}
          on={on}
          onToggle={(next) => setLights({ ...lights, [name]: next })}
        />
      ))}
      <StatTile
        label="Temperature"
        icon="thermometer"
        value="21.5"
        unit="°C"
        trend="up"
        caption="Since 07:00"
      />
    </TileGrid>
  );
}
`,nu=`import { useState } from 'react';
import { Text, Timeline } from '@mosaic-home/design-system/react';
import type { TimelineItem } from '@mosaic-home/design-system/web';

const departures: TimelineItem[] = [
  { time: '07:42', title: 'Line 4 to Harbour Square', detail: 'Platform 2' },
  { time: '07:51', title: 'Line 11 to North Park', detail: '3 min late', tone: 'warning' },
  { time: '08:05', title: 'Line 4 to Harbour Square', detail: 'Cancelled', tone: 'danger' },
  { time: '08:12', title: 'Express to the airport', detail: 'On time', tone: 'success' },
];

export function TimelineExample() {
  const [picked, setPicked] = useState<number | null>(null);
  const departure = picked === null ? null : departures[picked];
  return (
    <>
      <Timeline label="Departures" items={departures} onSelect={setPicked} />
      <Text variant="caption" tone="muted">
        {departure ? \`Selected: \${departure.time} \${departure.title}\` : 'Press a departure'}
      </Text>
    </>
  );
}
`,ru=`import { useState } from 'react';
import { Timer } from '@mosaic-home/design-system/react';
import type { TimerItem } from '@mosaic-home/design-system/web';

/** Seconds left on a timer. */
const left = (t: TimerItem): number =>
  t.state === 'running' && t.endsAt ? Math.max(0, (t.endsAt - Date.now()) / 1000) : (t.remaining ?? 0);

export function TimerExample() {
  const [timers, setTimers] = useState<TimerItem[]>(() => [
    { id: 'pasta', name: 'Pasta', duration: 600, state: 'running', endsAt: Date.now() + 431_000 },
    { id: 'bread', name: 'Bread proving', duration: 5400, state: 'paused', remaining: 3725 },
  ]);
  // Returning null removes the timer.
  const change = (id: string, next: (t: TimerItem) => TimerItem | null) =>
    setTimers((list) => list.flatMap((t) => (t.id === id ? (next(t) ?? []) : [t])));
  const remove = (id: string) => change(id, () => null);
  const resume = (id: string) =>
    change(id, (t) => ({ ...t, state: 'running', endsAt: Date.now() + left(t) * 1000, remaining: null }));
  const add = (id: string, seconds: number) =>
    change(id, (t) => {
      const rest = left(t) + seconds;
      const duration = Math.max(t.duration, rest);
      return t.state === 'paused'
        ? { ...t, remaining: rest, duration }
        : { ...t, state: 'running', endsAt: Date.now() + rest * 1000, remaining: null, duration };
    });
  return (
    <Timer
      timers={timers}
      onPause={(id) => change(id, (t) => ({ ...t, state: 'paused', remaining: left(t), endsAt: null }))}
      onResume={resume}
      onAdd={add}
      onFinish={(id) => change(id, (t) => ({ ...t, state: 'finished', endsAt: null }))}
      onCancel={remove}
      onStop={remove}
    />
  );
}
`,iu=`import { Button, useToaster } from '@mosaic-home/design-system/react';

export function ToastExample() {
  const toaster = useToaster({ placement: 'bottom' });
  const save = () => {
    toaster.show({
      tone: 'success',
      message: 'Settings saved',
      action: { label: 'Undo', onClick: () => toaster.show('Changes undone') },
    });
  };
  return (
    <Button icon="check" onClick={save}>
      Save settings
    </Button>
  );
}
`,au=`import { useState } from 'react';
import { TodoList } from '@mosaic-home/design-system/react';
import type { TodoItem } from '@mosaic-home/design-system/web';

export function TodoListExample() {
  const [items, setItems] = useState<TodoItem[]>([
    { id: 'milk', text: 'Oat milk', done: false, note: '2 cartons' },
    { id: 'bread', text: 'Sourdough loaf', done: false },
    { id: 'apples', text: 'Apples', done: false },
    { id: 'eggs', text: 'Eggs', done: true },
  ]);
  return (
    <TodoList
      label="Shopping"
      items={items}
      onAdd={(text) => setItems((list) => [...list, { id: crypto.randomUUID(), text, done: false }])}
      onToggle={(id, done) => setItems((list) => list.map((i) => (i.id === id ? { ...i, done } : i)))}
      // The ids are the open items in their new order.
      onReorder={(ids) =>
        setItems((list) => [...ids.map((id) => list.find((i) => i.id === id)!), ...list.filter((i) => i.done)])
      }
      onRemove={(id) => setItems((list) => list.filter((i) => i.id !== id))}
      onClearCompleted={(ids) => setItems((list) => list.filter((i) => !ids.includes(i.id)))}
    />
  );
}
`,ou=`import { useState } from 'react';
import { ToggleGroup } from '@mosaic-home/design-system/react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ value: day, label: day }));

export function ToggleGroupExample() {
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  return <ToggleGroup label="Repeat on" type="multiple" options={DAYS} values={days} onChange={setDays} />;
}
`,su=`import { useState } from 'react';
import { Button, IconButton, Toolbar, ToolbarSeparator, ToolbarSpacer } from '@mosaic-home/design-system/react';

export function ToolbarExample() {
  const [editing, setEditing] = useState(false);
  return (
    <Toolbar label="Floor plan">
      <IconButton icon="arrow-left" label="Undo" />
      <IconButton icon="arrow-right" label="Redo" />
      <ToolbarSeparator />
      <IconButton icon="add" label="Add device" />
      <IconButton icon="edit" label="Edit room" pressed={editing} onClick={() => setEditing(!editing)} />
      <ToolbarSpacer />
      <Button size="small">Done</Button>
    </Toolbar>
  );
}
`,cu=`import { useState } from 'react';
import { IconButton, Tooltip } from '@mosaic-home/design-system/react';

export function TooltipExample() {
  const [refreshed, setRefreshed] = useState(0);
  const text = refreshed === 0 ? 'Refresh the device list' : \`Refreshed \${refreshed} \${refreshed === 1 ? 'time' : 'times'}\`;
  return (
    <Tooltip text={text} placement="bottom">
      <IconButton icon="refresh" label="Refresh" onClick={() => setRefreshed((n) => n + 1)} />
    </Tooltip>
  );
}
`,lu=`import { useState } from 'react';
import { TransferList } from '@mosaic-home/design-system/react';
import type { TransferItem } from '@mosaic-home/design-system/web';

const cards: TransferItem[] = [
  { value: 'weather', label: 'Weather', icon: 'weather', description: 'Today and tomorrow' },
  { value: 'lights', label: 'Lights', icon: 'lightbulb', description: 'Every room' },
  { value: 'heating', label: 'Heating', icon: 'thermometer' },
  { value: 'music', label: 'Music', icon: 'music', description: 'Now playing' },
  { value: 'cameras', label: 'Cameras', icon: 'camera' },
];

export function TransferListExample() {
  const [shown, setShown] = useState<string[]>(['weather', 'lights']);
  return (
    <TransferList
      label="Dashboard cards"
      sourceLabel="Hidden"
      targetLabel="Shown"
      helper={\`\${shown.length} of \${cards.length} cards shown.\`}
      items={cards}
      values={shown}
      onChange={setShown}
    />
  );
}
`,uu=`import { useState } from 'react';
import { TransformFields } from '@mosaic-home/design-system/react';
import type { ReferencePoint, TransformValue } from '@mosaic-home/design-system/web';

export function TransformFieldsExample() {
  const [value, setValue] = useState<TransformValue>({ x: 40, y: 30, width: 120, height: 80, angle: 12 });
  const [reference, setReference] = useState<ReferencePoint>('top-left');
  const [lockAspect, setLockAspect] = useState(false);
  const { x, y, width, height, angle } = value;
  return (
    <>
      <TransformFields
        label="Picture frame"
        value={value}
        reference={reference}
        lockAspect={lockAspect}
        onChange={setValue}
        onReferenceChange={setReference}
        onLockAspectChange={setLockAspect}
      />
      <div style={{ position: 'relative', width: 280, height: 200, background: 'var(--mh-input)' }}>
        <div
          style={{ position: 'absolute', left: x, top: y, width, height, transform: \`rotate(\${angle}deg)\`, border: '2px solid var(--mh-accent)' }}
        />
      </div>
    </>
  );
}
`,du=`import { useEffect, useState } from 'react';
import { Transport } from '@mosaic-home/design-system/react';

const DURATION = 222;

export function TransportExample() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(41);
  const [loop, setLoop] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPosition((p) => (p >= DURATION ? 0 : p + 1)), 1000);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <Transport
      label="Playback"
      duration={DURATION}
      position={position}
      playing={playing}
      loop={loop}
      onPlayingChange={setPlaying}
      onSeek={setPosition}
      onLoopChange={setLoop}
    />
  );
}
`,fu=`import { useState } from 'react';
import { Tree } from '@mosaic-home/design-system/react';
import type { TreeNode } from '@mosaic-home/design-system/web';

const nodes: TreeNode[] = [
  {
    id: 'ground',
    label: 'Ground floor',
    icon: 'home',
    children: [
      { id: 'living', label: 'Living room', meta: '4 devices' },
      { id: 'kitchen', label: 'Kitchen', meta: '3 devices' },
    ],
  },
  { id: 'upstairs', label: 'Upstairs', icon: 'home', children: [{ id: 'bedroom', label: 'Bedroom' }] },
];

export function TreeExample() {
  const [expanded, setExpanded] = useState<string[]>(['ground']);
  const [selected, setSelected] = useState<string | null>('kitchen');
  return (
    <Tree
      nodes={nodes}
      label="Rooms"
      expanded={expanded}
      onExpandedChange={setExpanded}
      selected={selected}
      onSelect={setSelected}
    />
  );
}
`,pu=`import { useEffect, useState } from 'react';
import { Trend } from '@mosaic-home/design-system/react';

export function TrendExample() {
  const [values, setValues] = useState([19.2, 19.0, 18.8, 18.9, 19.4, 20.1, 20.8, 21.3, 21.6, 21.5]);
  useEffect(() => {
    const timer = setInterval(() => {
      const latest = Math.round((20 + Math.random() * 2) * 10) / 10;
      setValues((prev) => [...prev.slice(1), latest]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Trend
      name="Living room"
      value={values[values.length - 1] ?? null}
      unit="°C"
      values={values}
      format={(v) => v.toFixed(1)}
    />
  );
}
`,mu=`import { useState } from 'react';
import { mdiGamepadVariant, mdiHdmiPort, mdiTelevisionPlay } from '@mdi/js';
import { TvRemote } from '@mosaic-home/design-system/react';
import type { TvRemoteKey } from '@mosaic-home/design-system/web';

const sources = [
  { id: 'hdmi1', label: 'HDMI 1', icon: mdiHdmiPort },
  { id: 'console', label: 'Console', icon: mdiGamepadVariant },
  { id: 'films', label: 'Film Hall', icon: mdiTelevisionPlay },
];

const send = (command: string): void => void fetch('/tv/command', { method: 'POST', body: command });

export function TvRemoteExample() {
  const [source, setSource] = useState('films');
  const [muted, setMuted] = useState(false);
  const pressKey = (key: TvRemoteKey) => {
    send(key);
    if (key === 'mute') setMuted((m) => !m);
  };
  const pickSource = (id: string) => {
    send(\`source:\${id}\`);
    setSource(id);
  };
  return (
    <TvRemote
      label="Living room TV"
      sources={sources.map((s) => ({ ...s, active: s.id === source }))}
      muted={muted}
      onKey={pressKey}
      onSource={pickSource}
    />
  );
}
`,hu=`import { ThemeProvider, useTokens } from '@mosaic-home/design-system/react';

function Reading() {
  // For SVG text, read the size from the type scale of the current device class.
  const { type, typeface, theme } = useTokens();
  return (
    <svg width={200} height={type.display * 1.4} role="img" aria-label="19.5 degrees">
      <text y={type.display} fontSize={type.display} fontFamily={typeface.sans} fill={theme.palette.heading}>
        19.5°
      </text>
    </svg>
  );
}

export function TypeScaleExample() {
  return (
    <ThemeProvider theme="midnight" deviceClass="tablet">
      {/* In CSS the sizes are the --mh-text-* variables. */}
      <h2 style={{ fontSize: 'var(--mh-text-headline)' }}>Kitchen</h2>
      <Reading />
    </ThemeProvider>
  );
}
`,gu=`import { useState } from 'react';
import { UpNext } from '@mosaic-home/design-system/react';
import type { UpNextItem } from '@mosaic-home/design-system/web';

export function UpNextExample() {
  const [items, setItems] = useState<UpNextItem[]>([
    { id: 'q1', title: 'Harbour Lights', subtitle: 'The Low Hills', art: '/art/up-next-1.jpg', duration: 214 },
    { id: 'q2', title: 'Slow Rivers', subtitle: 'Ines Okafor-Lund', art: '/art/up-next-2.jpg', duration: 187 },
    { id: 'q3', title: 'A Map of Quiet Places', subtitle: 'Cinder Vale Quartet', duration: 301 },
  ]);
  const [playing, setPlaying] = useState('Lanterns Over the Quay');
  const drop = (id: string) => setItems((list) => list.filter((i) => i.id !== id));
  const play = (id: string) => {
    setPlaying(items.find((i) => i.id === id)?.title ?? playing);
    drop(id);
  };
  return (
    <>
      <p>Now playing: {playing}</p>
      <UpNext items={items} onPlay={play} onRemove={drop} />
    </>
  );
}
`,_u=`import { UsageComparison } from '@mosaic-home/design-system/react';

export function UsageComparisonExample() {
  return (
    <UsageComparison
      label="Heating gas"
      slots={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
      slotNames={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
      // Days still to come are null; the totals compare the same days.
      current={[8.2, 9.1, 7.4, 10.3, null, null, null]}
      previous={[7.1, 7.9, 7.6, 8.8, 9.4, 11.2, 10.6]}
      periods={{ current: 'This week', previous: 'Last week' }}
      unit="m³"
    />
  );
}
`,vu=`import { useState } from 'react';
import { VacuumControl } from '@mosaic-home/design-system/react';
import type { VacuumState } from '@mosaic-home/design-system/web';

const rooms = [
  { id: 'living', name: 'Living room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'hall', name: 'Hall' },
];

export function VacuumControlExample() {
  const [state, setState] = useState<VacuumState>('docked');
  const [chosen, setChosen] = useState<string[]>([]);
  return (
    <VacuumControl
      name="Floor cleaner"
      state={state}
      battery={96}
      charging={state === 'docked'}
      rooms={rooms}
      selectedRooms={chosen}
      onRoomsChange={setChosen}
      onStart={() => setState('cleaning')}
      onPause={() => setState('paused')}
      onDock={() => setState('returning')}
    />
  );
}
`,yu=`import { useEffect, useState } from 'react';
import { VoiceBar } from '@mosaic-home/design-system/react';
import type { VoicePhase } from '@mosaic-home/design-system/web';

export function VoiceBarExample() {
  const [phase, setPhase] = useState<VoicePhase>('listening');
  const [level, setLevel] = useState(0);
  const [label, setLabel] = useState<string>();
  useEffect(() => {
    if (phase !== 'listening') return;
    // Stands in for the microphone's input level (0–1).
    const timer = setInterval(() => setLevel(Math.random()), 90);
    return () => clearInterval(timer);
  }, [phase]);
  const done = () => {
    setPhase('transcribing');
    setTimeout(() => {
      setPhase('idle');
      setLabel('Added: "Buy more coffee filters"');
    }, 1500);
  };
  return (
    <VoiceBar
      variant="dictation"
      phase={phase}
      level={level}
      label={label}
      busy={phase === 'transcribing'}
      onCancel={() => setPhase('idle')}
      onDone={done}
    />
  );
}
`,bu=`import { useEffect, useState } from 'react';
import { VoiceRing } from '@mosaic-home/design-system/react';
import type { VoiceRingPhase } from '@mosaic-home/design-system/web';

/** Where each phase goes next, and after how long. */
const NEXT: Partial<Record<VoiceRingPhase, [VoiceRingPhase, number]>> = {
  listening: ['thinking', 3000],
  thinking: ['speaking', 1500],
  speaking: ['idle', 2500],
};

const DETAIL: Partial<Record<VoiceRingPhase, string>> = {
  listening: 'Turn on the lights in the study',
  speaking: 'Done. The study lights are on.',
};

export function VoiceRingExample() {
  const [phase, setPhase] = useState<VoiceRingPhase>('idle');

  useEffect(() => {
    const next = NEXT[phase];
    if (!next) return;
    const timer = setTimeout(() => setPhase(next[0]), next[1]);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <VoiceRing
      phase={phase}
      detail={DETAIL[phase]}
      level={phase === 'listening' ? 0.6 : 0}
      onTap={() => setPhase(phase === 'idle' ? 'listening' : 'idle')}
    />
  );
}
`,xu=`import { useEffect, useState } from 'react';
import { Button, Waveform } from '@mosaic-home/design-system/react';

const duration = 24;
// Loudness per bucket, 0 to 1; \`waveformPeaks\` makes these from decoded samples.
const peaks = Array.from({ length: 64 }, (_, i) => 0.15 + 0.8 * Math.abs(Math.sin(i / 2.3)));

export function WaveformExample() {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPosition((p) => (p + 0.25 >= duration ? 0 : p + 0.25)), 250);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <>
      <Button icon={playing ? 'pause' : 'play'} size="small" onClick={() => setPlaying(!playing)}>
        {playing ? 'Pause' : 'Play'}
      </Button>
      <Waveform
        peaks={peaks}
        label="Voice message"
        duration={duration}
        position={position}
        onSeek={setPosition}
      />
    </>
  );
}
`,Su=`import { WeatherNow } from '@mosaic-home/design-system/react';
import { weatherConditionFromText } from '@mosaic-home/design-system/web';

// A forecast source's own words, mapped to a condition for the icon and tint.
const TEXT = 'Light rain showers';

export function WeatherNowExample() {
  return (
    <WeatherNow
      condition={weatherConditionFromText(TEXT)}
      text={TEXT}
      temperature={9}
      place="Hillside"
      detail="Feels 6° · 80% rain"
    />
  );
}
`,Cu=`import { useState } from 'react';
import { ZoomControl } from '@mosaic-home/design-system/react';

// The level that fits the picture in its frame, worked out by the app.
const FIT_LEVEL = 0.63;

export function ZoomControlExample() {
  const [zoom, setZoom] = useState(1);
  const [fitted, setFitted] = useState(false);
  const change = (value: number) => {
    setZoom(value);
    setFitted(false);
  };
  const fit = () => {
    setZoom(FIT_LEVEL);
    setFitted(true);
  };
  return <ZoomControl value={zoom} min={0.25} max={8} fitted={fitted} onChange={change} onFit={fit} />;
}
`,wu=`import { useState } from 'react';
import { Text, ZoomableImage } from '@mosaic-home/design-system/react';

export function ZoomableImageExample() {
  const [scale, setScale] = useState(1);
  return (
    <>
      <ZoomableImage
        src="plans/ground-floor.png"
        alt="Floor plan of the ground floor"
        controls
        aspect={16 / 10}
        onChange={(view) => setScale(view.scale)}
      />
      <Text variant="caption" tone="muted">
        {Math.round(scale * 100)}%
      </Text>
    </>
  );
}
`,Tu=[`text`,`icon`,`divider`,`palette`,`type-scale`,`shape-space`,`elevation`,`accent-headline`,`kbd`,`backdrop`,`boot-splash`],Eu=[`button`,`icon-button`,`button-group`,`link`,`favourite-toggle`],Du=[`field`,`text-field`,`text-area`,`search-field`,`select`,`composer`,`number-input`,`secret-field`,`hotkey-field`,`command-bar`,`duration-field`,`multi-select`,`transfer-list`],Ou=[`checkbox`,`radio-group`,`switch`,`segmented-control`,`chip`,`slider`,`stepper`,`toggle-group`,`range-slider`,`radial-dial`,`click-wheel`,`rating`],ku=[`date-time-field`,`date-picker`,`date-range-picker`,`color-picker`,`gradient-editor`,`icon-picker`,`file-drop-zone`],Au=[`tabs`,`document-tabs`,`menu-bar`,`breadcrumbs`,`pagination`,`steps`,`nav-rail`,`page-header`],ju=[`bottom-sheet`,`drawer`,`dialog`,`confirm`,`toast`,`menu`,`tooltip`,`split-button`,`popover`,`command-palette`],Mu=[`alert`,`progress-bar`,`progress-ring`,`spinner`,`skeleton`,`badge`,`status`,`empty-state`,`progress-list`,`voice-bar`,`notices`,`recording-pill`],Nu=[`card`,`list`,`tiles`,`avatar`,`accordion`,`tree`,`data-table`,`property-list`,`carousel`,`timeline`,`qr-code`,`media-list`,`forecast-strip`],Pu=[`sparkline`,`trend`,`bar-chart`,`month-grid`,`meter`,`level-meter`,`waveform`,`histogram`,`curves-editor`],Fu=[`geo-map`,`media-timeline`,`transport`,`layers-panel`,`zoom-control`,`transform-fields`,`inspector`,`compare-slider`,`zoomable-image`,`map`],Iu=[`screen`,`stack`,`split-pane`,`panel`,`panel-group`,`scroll-panel`,`toolbar`,`status-bar`,`app-shell`,`reorderable-list`,`swipe-row`,`onboarding`],Lu=[`fan-control`,`humidity-control`,`air-quality`,`schedule-editor`,`energy-flow`,`price-strip`,`charge-card`,`usage-comparison`],Ru=[`alarm-panel`,`doorbell`,`people-strip`,`openings-summary`,`hazard-banner`,`connection-status`,`device-setup`],zu=[`room-card`,`scene-grid`,`light-group`,`floor-plan`,`vacuum-control`,`appliance-cycle`,`irrigation-zones`],Bu=[`timer`,`speaker-selector`,`tv-remote`,`up-next`,`voice-ring`,`assist-reply`],Vu=[`notification-centre`,`ambient-clock`,`state-timeline`,`activity-feed`,`departures-board`,`todo-list`],Hu=[`media-player`,`camera-tile`,`weather-now`,`agenda`,`control-card`,`thermostat`,`light-control`,`position-control`,`lock-control`,...Lu,...Ru,...zu,...Bu,...Vu],Uu=[...Tu,...Eu,...Du,...Ou,...ku,...Au,...ju,...Mu,...Nu,...Pu,...Fu,...Iu,...Hu],Wu=[{id:`foundations`,name:`Foundations`},{id:`actions`,name:`Actions`},{id:`text-inputs`,name:`Text inputs`},{id:`choice-inputs`,name:`Choice & range`},{id:`pickers`,name:`Pickers`},{id:`navigation`,name:`Navigation`},{id:`overlays`,name:`Overlays`},{id:`feedback`,name:`Feedback`},{id:`data-display`,name:`Data display`},{id:`charts`,name:`Charts & instruments`},{id:`media`,name:`Media & editors`},{id:`layout`,name:`Layout & shells`},{id:`home`,name:`Home controls`}],Gu=[{id:`text`,name:`Text`,group:`foundations`,summary:`Type scale: jumbo to caption, mono eyebrows and section titles, tones.`},{id:`accent-headline`,name:`Accent headline`,group:`foundations`,summary:`Headline with one serif-italic accent phrase.`},{id:`icon`,name:`Icon`,group:`foundations`,summary:`One SVG icon set for both renderers (Material Design Icons).`},{id:`kbd`,name:`Keyboard key`,group:`foundations`,summary:`Key caps and shortcut chords (Ctrl + K).`},{id:`divider`,name:`Divider`,group:`foundations`,summary:`Horizontal or vertical rule, optionally labelled.`},{id:`backdrop`,name:`Backdrop`,group:`foundations`,summary:`The canvas gradient and ambient glow behind screens; off in calm themes.`},{id:`boot-splash`,name:`Boot splash`,group:`foundations`,summary:`An animated start screen with the product mark.`},{id:`palette`,name:`Palette`,group:`foundations`,summary:`Every colour role of the theme.`},{id:`type-scale`,name:`Type scale`,group:`foundations`,summary:`The text styles, jumbo to caption, at this device class.`},{id:`shape-space`,name:`Shape and space`,group:`foundations`,summary:`Radii, spacing and touch targets from the theme character.`},{id:`elevation`,name:`Elevation`,group:`foundations`,summary:`Flat, raised and overlay surfaces: shadow, glow or none.`},{id:`button`,name:`Button`,group:`actions`,summary:`Primary, secondary, text and danger buttons in three sizes, with icon and loading states.`},{id:`icon-button`,name:`Icon button`,group:`actions`,summary:`Icon-only button with tones, sizes and a filled variant.`},{id:`button-group`,name:`Button group`,group:`actions`,summary:`Joined buttons, a toolbar segment.`},{id:`link`,name:`Link`,group:`actions`,summary:`Inline text link: accent, muted or inherit.`},{id:`favourite-toggle`,name:`Favourite toggle`,group:`actions`,summary:`Star toggle for favourites.`},{id:`field`,name:`Field`,group:`text-inputs`,summary:`Label, helper, error and success around any control.`},{id:`text-field`,name:`Text field`,group:`text-inputs`,summary:`Text input: eyebrow or floating label, adornments, validation, counter.`},{id:`text-area`,name:`Text area`,group:`text-inputs`,summary:`Multi-line input that grows with its text, with a character count.`},{id:`search-field`,name:`Search field`,group:`text-inputs`,summary:`Search box with clear button and keyboard-driven suggestions.`},{id:`composer`,name:`Composer`,group:`text-inputs`,summary:`Message input for chat and assistants: grows to six lines, action slots, mode chip, suggestions.`},{id:`number-input`,name:`Number input`,group:`text-inputs`,summary:`Number entry with − / + buttons, units and drag-to-scrub.`},{id:`secret-field`,name:`Secret field`,group:`text-inputs`,summary:`Password / API key entry with reveal and copy.`},{id:`hotkey-field`,name:`Hotkey field`,group:`text-inputs`,summary:`Records a keyboard shortcut.`},{id:`command-bar`,name:`Command bar`,group:`text-inputs`,summary:`Mono prompt with suggestions and history.`},{id:`duration-field`,name:`Duration field`,group:`text-inputs`,summary:`Free-text duration entry ("1h 30m").`},{id:`select`,name:`Select`,group:`text-inputs`,summary:`Custom dropdown with search, groups and icons.`},{id:`multi-select`,name:`Multi-select`,group:`text-inputs`,summary:`Pick several options, shown as removable chips.`},{id:`transfer-list`,name:`Transfer list`,group:`text-inputs`,summary:`Move items between two lists.`},{id:`checkbox`,name:`Checkbox`,group:`choice-inputs`,summary:`Checkbox with indeterminate state, and checkbox groups.`},{id:`radio-group`,name:`Radio group`,group:`choice-inputs`,summary:`One of several, vertical or inline.`},{id:`switch`,name:`Switch`,group:`choice-inputs`,summary:`On/off switch and the settings toggle row.`},{id:`segmented-control`,name:`Segmented control`,group:`choice-inputs`,summary:`Pill radio group for a few options.`},{id:`toggle-group`,name:`Toggle group`,group:`choice-inputs`,summary:`Icon or text toggles, single or multiple.`},{id:`chip`,name:`Chip`,group:`choice-inputs`,summary:`Selectable or removable pill; chip groups and weekday picker.`},{id:`slider`,name:`Slider`,group:`choice-inputs`,summary:`Single value slider, horizontal or vertical, with marks.`},{id:`range-slider`,name:`Range slider`,group:`choice-inputs`,summary:`Two-thumb range.`},{id:`radial-dial`,name:`Radial dial`,group:`choice-inputs`,summary:`Knob for angles and amounts.`},{id:`click-wheel`,name:`Click wheel`,group:`choice-inputs`,summary:`Large rotary wheel with ticks.`},{id:`stepper`,name:`Stepper`,group:`choice-inputs`,summary:`− value + for small counts.`},{id:`rating`,name:`Rating`,group:`choice-inputs`,summary:`Star rating, read-only or editable.`},{id:`date-time-field`,name:`Date & time field`,group:`pickers`,summary:`Platform date/time input.`},{id:`date-picker`,name:`Date picker`,group:`pickers`,summary:`Calendar popover for one date.`},{id:`date-range-picker`,name:`Date range picker`,group:`pickers`,summary:`Calendar for a start and end date.`},{id:`color-picker`,name:`Colour picker`,group:`pickers`,summary:`Swatches, HSV field, hue and alpha, hex entry, eyedropper.`},{id:`gradient-editor`,name:`Gradient editor`,group:`pickers`,summary:`Multi-stop gradient with colour and opacity stops.`},{id:`icon-picker`,name:`Icon picker`,group:`pickers`,summary:`Pick an icon from a grid.`},{id:`file-drop-zone`,name:`File drop zone`,group:`pickers`,summary:`Drop files or browse.`},{id:`tabs`,name:`Tabs`,group:`navigation`,summary:`Tabs with panels: underline, pill or boxed.`},{id:`document-tabs`,name:`Document tabs`,group:`navigation`,summary:`Closable editor tabs with unsaved dot.`},{id:`menu-bar`,name:`Menu bar`,group:`navigation`,summary:`Desktop menu bar with submenus and shortcuts.`},{id:`breadcrumbs`,name:`Breadcrumbs`,group:`navigation`,summary:`Where you are, one step at a time.`},{id:`pagination`,name:`Pagination`,group:`navigation`,summary:`Page buttons with ellipses.`},{id:`steps`,name:`Steps`,group:`navigation`,summary:`Wizard progress: horizontal or vertical, with complete and error states.`},{id:`nav-rail`,name:`Navigation rail`,group:`navigation`,summary:`Side navigation with icons, labels and badges.`},{id:`page-header`,name:`Page header`,group:`navigation`,summary:`Eyebrow, title, subtitle and actions.`},{id:`split-button`,name:`Split button`,group:`overlays`,summary:`A main action with a menu of alternatives.`},{id:`dialog`,name:`Dialog`,group:`overlays`,summary:`Modal dialog, optionally draggable.`},{id:`confirm`,name:`Confirm`,group:`overlays`,summary:`Promise-based confirm with destructive and type-to-confirm modes.`},{id:`bottom-sheet`,name:`Bottom sheet`,group:`overlays`,summary:`Sheet on phones, centred panel on wide screens.`},{id:`drawer`,name:`Drawer`,group:`overlays`,summary:`Side panel from the left or right.`},{id:`popover`,name:`Popover`,group:`overlays`,summary:`Floating panel anchored to a control.`},{id:`tooltip`,name:`Tooltip`,group:`overlays`,summary:`Short hint on hover or focus.`},{id:`menu`,name:`Menu`,group:`overlays`,summary:`Dropdown and context menus with icons, shortcuts and submenus.`},{id:`toast`,name:`Toast`,group:`overlays`,summary:`Transient message with variants, an action and a queue.`},{id:`command-palette`,name:`Command palette`,group:`overlays`,summary:`Search every command from the keyboard.`},{id:`alert`,name:`Alert`,group:`feedback`,summary:`Inline message: info, success, warning, error; dismissible.`},{id:`progress-bar`,name:`Progress bar`,group:`feedback`,summary:`Determinate or indeterminate, with tones.`},{id:`progress-ring`,name:`Progress ring`,group:`feedback`,summary:`Circular progress with a value in the middle.`},{id:`progress-list`,name:`Progress list`,group:`feedback`,summary:`Several jobs at once: name, percentage, bar and a status line each.`},{id:`spinner`,name:`Spinner`,group:`feedback`,summary:`Busy indicator in three sizes.`},{id:`skeleton`,name:`Skeleton`,group:`feedback`,summary:`Shimmering placeholders while loading.`},{id:`badge`,name:`Badge`,group:`feedback`,summary:`Small label or count: default, beta, success, warning, error.`},{id:`status`,name:`Status`,group:`feedback`,summary:`Status dot with label (connected, untested, error) and the LIVE badge.`},{id:`empty-state`,name:`Empty state`,group:`feedback`,summary:`Nothing here yet, with one action; and not-found.`},{id:`notices`,name:`Notices`,group:`feedback`,summary:`Permission explainer, capability notice, dismissible tip.`},{id:`recording-pill`,name:`Recording pill`,group:`feedback`,summary:`Floating recording status with timer and live waveform.`},{id:`voice-bar`,name:`Voice bar`,group:`feedback`,summary:`Stands in for the composer during a voice conversation (animated mosaic) or dictation (live waveform).`},{id:`card`,name:`Card`,group:`data-display`,summary:`Outlined panel: flat, raised or glow; header, body, footer; pressable.`},{id:`list`,name:`List`,group:`data-display`,summary:`Settings sections and rows, rich list items.`},{id:`tiles`,name:`Tiles`,group:`data-display`,summary:`Stat tiles, action tiles, list cards, hero card, icon badge.`},{id:`avatar`,name:`Avatar`,group:`data-display`,summary:`Photo or initials in sizes, supporter ring, stacked groups.`},{id:`accordion`,name:`Accordion`,group:`data-display`,summary:`Collapsible sections, one or many open.`},{id:`tree`,name:`Tree`,group:`data-display`,summary:`Expandable hierarchy with optional checkboxes.`},{id:`data-table`,name:`Data table`,group:`data-display`,summary:`Sortable, selectable, sticky, dense, resizable columns.`},{id:`property-list`,name:`Property list`,group:`data-display`,summary:`Label / value rows for inspectors and details.`},{id:`carousel`,name:`Carousel`,group:`data-display`,summary:`Horizontal row of cards that scrolls and snaps; one card and a peek of the next on phones.`},{id:`timeline`,name:`Timeline`,group:`data-display`,summary:`Activity feed and journey milestones.`},{id:`qr-code`,name:`QR code`,group:`data-display`,summary:`QR code for links and pairing.`},{id:`forecast-strip`,name:`Forecast strip`,group:`data-display`,summary:`Horizontal strip of readings with within/outside states.`},{id:`media-list`,name:`Media list`,group:`data-display`,summary:`Songs, episodes and films: thumbnail, title, subtitle and meta, pressable rows.`},{id:`sparkline`,name:`Sparkline`,group:`charts`,summary:`Trend line with gaps and a last-value dot.`},{id:`trend`,name:`Trend`,group:`charts`,summary:`A reading over time: big latest value, sparkline and range.`},{id:`bar-chart`,name:`Bar chart`,group:`charts`,summary:`Small column chart with labels.`},{id:`month-grid`,name:`Month heat grid`,group:`charts`,summary:`Calendar heat map with legend.`},{id:`meter`,name:`Meter`,group:`charts`,summary:`Segmented LED meter: level or bars.`},{id:`level-meter`,name:`Level meter`,group:`charts`,summary:`Audio level with peak hold, horizontal or vertical.`},{id:`waveform`,name:`Waveform`,group:`charts`,summary:`Audio waveform in five styles with playhead and selection.`},{id:`histogram`,name:`Histogram`,group:`charts`,summary:`Luminance / RGB histogram.`},{id:`curves-editor`,name:`Curves editor`,group:`charts`,summary:`Tone curve with draggable points over a histogram.`},{id:`media-timeline`,name:`Media timeline`,group:`media`,summary:`Tracks, clips, ruler, playhead, snapping and zoom.`},{id:`transport`,name:`Transport`,group:`media`,summary:`Play, step, loop and timecode.`},{id:`layers-panel`,name:`Layers panel`,group:`media`,summary:`Layers with visibility, lock, thumbnails, groups and reorder.`},{id:`zoom-control`,name:`Zoom control`,group:`media`,summary:`− / preset / + zoom with fit.`},{id:`transform-fields`,name:`Transform fields`,group:`media`,summary:`X, Y, W, H, angle with a reference-point grid.`},{id:`inspector`,name:`Inspector`,group:`media`,summary:`Collapsible parameter sections with sliders and keyframe toggles.`},{id:`compare-slider`,name:`Compare slider`,group:`media`,summary:`Before / after split with a draggable divider.`},{id:`zoomable-image`,name:`Zoomable image`,group:`media`,summary:`Pinch, wheel, pan and double-tap zoom.`},{id:`map`,name:`Map`,group:`media`,summary:`Map controls and compass.`},{id:`geo-map`,name:`Geo map`,group:`media`,summary:`Drawn map of places, areas and routes from coordinates; tile background optional.`},{id:`screen`,name:`Screen`,group:`layout`,summary:`Page shell with background glow, safe areas and a centred column.`},{id:`stack`,name:`Stack & grid`,group:`layout`,summary:`Stack, row and responsive card grid.`},{id:`split-pane`,name:`Split pane`,group:`layout`,summary:`Resizable, collapsible panes.`},{id:`panel`,name:`Panel`,group:`layout`,summary:`Titled tool panel and settings section, collapsible.`},{id:`panel-group`,name:`Panel group`,group:`layout`,summary:`Tabbed dock of panels.`},{id:`scroll-panel`,name:`Scroll panel`,group:`layout`,summary:`Fixed-height scrolling region with themed scrollbar.`},{id:`toolbar`,name:`Toolbar`,group:`layout`,summary:`Horizontal toolbar and vertical tool rail.`},{id:`status-bar`,name:`Status bar`,group:`layout`,summary:`Bottom bar with status items.`},{id:`app-shell`,name:`App shell`,group:`layout`,summary:`Title bar with actions and the app frame.`},{id:`reorderable-list`,name:`Reorderable list`,group:`layout`,summary:`Drag to reorder.`},{id:`swipe-row`,name:`Swipe row`,group:`layout`,summary:`Swipe to reveal actions (accessibility actions on the web).`},{id:`onboarding`,name:`Onboarding`,group:`layout`,summary:`Step-by-step intro.`},{id:`control-card`,name:`Control card`,group:`home`,summary:`Frame for one controllable thing: icon badge, title, state, a trailing control, media and body slots.`},{id:`thermostat`,name:`Thermostat`,group:`home`,summary:`Target temperature or range with − / +, current reading, mode and what it is doing.`},{id:`light-control`,name:`Light control`,group:`home`,summary:`On/off, brightness, colour temperature and hue sliders that commit on release.`},{id:`position-control`,name:`Position control`,group:`home`,summary:`Open, stop, close and a position slider for blinds, gates, doors and valves.`},{id:`lock-control`,name:`Lock control`,group:`home`,summary:`Lock, unlock and unlatch with an inline confirm step and a jammed alert.`},{id:`media-player`,name:`Media player`,group:`home`,summary:`Art (a thumbnail, or a full-width banner while playing), title and artist, the transport buttons a player allows, a progress line and volume.`},{id:`camera-tile`,name:`Camera tile`,group:`home`,summary:`A still picture that refreshes on a timer, with a name, status line and placeholder.`},{id:`weather-now`,name:`Weather now`,group:`home`,summary:`Current condition icon, temperature, words and a detail line; a generic condition vocabulary.`},{id:`agenda`,name:`Agenda`,group:`home`,summary:`Upcoming calendar events grouped by day: all-day chips, timed rows with a colour bar.`},{id:`fan-control`,name:`Fan control`,group:`home`,summary:`Speed steps or a percentage, oscillation, direction and preset modes for a fan.`},{id:`humidity-control`,name:`Humidity control`,group:`home`,summary:`Target humidity with − / +, the current reading, a mode and whether it is running, for humidifiers and dehumidifiers.`},{id:`air-quality`,name:`Air quality`,group:`home`,summary:`A reading (CO₂, particles, VOC) on a good-to-poor band with its level word and a short trend.`},{id:`schedule-editor`,name:`Schedule editor`,group:`home`,summary:`A week of time blocks, each with a value (a temperature, on or off), drawn as rows you drag to shape.`},{id:`energy-flow`,name:`Energy flow`,group:`home`,summary:`Solar, grid, battery and home as nodes with animated flows sized by power, and import or export direction.`},{id:`price-strip`,name:`Price strip`,group:`home`,summary:`Hourly energy prices as columns with the current hour marked and the cheapest window highlighted.`},{id:`charge-card`,name:`Charge card`,group:`home`,summary:`A battery or vehicle charge: level ring, charging rate, time to full, limit and plug state.`},{id:`usage-comparison`,name:`Usage comparison`,group:`home`,summary:`This period against the last (today and yesterday, this week and last) by hour or day, with the difference.`},{id:`alarm-panel`,name:`Alarm panel`,group:`home`,summary:`Arm modes, a keypad with masked code entry, arming and entry countdowns, and a triggered state.`},{id:`doorbell`,name:`Doorbell`,group:`home`,summary:`A ring that takes over the screen: live picture, who rang and when, and Answer, Talk and Dismiss.`},{id:`people-strip`,name:`People strip`,group:`home`,summary:`People and their whereabouts (home, away, a zone) as avatars with how long they have been there.`},{id:`openings-summary`,name:`Openings summary`,group:`home`,summary:`Open doors and windows counted and listed, with a warning tone when something should be shut.`},{id:`hazard-banner`,name:`Hazard banner`,group:`home`,summary:`An unmissable alert for smoke, carbon monoxide, leaks or heat: where, since when, and what to do.`},{id:`connection-status`,name:`Connection status`,group:`home`,summary:`Connected, reconnecting with a retry countdown, and offline states for a screen that talks to a home server.`},{id:`device-setup`,name:`Device setup`,group:`home`,summary:`Pairing a screen with a home server: server address, access token entry or a QR code to scan, and a test step.`},{id:`room-card`,name:`Room card`,group:`home`,summary:`One room at a glance: temperature and humidity, lights on, open windows, and quick toggles.`},{id:`scene-grid`,name:`Scene grid`,group:`home`,summary:`Large tiles that set a scene, with the active scene marked and a brief applied state.`},{id:`light-group`,name:`Light group`,group:`home`,summary:`A master switch and brightness for a group of lights that expands to each member.`},{id:`floor-plan`,name:`Floor plan`,group:`home`,summary:`A plan of rooms as shapes you can tap, coloured or lit by their state, with markers for devices.`},{id:`vacuum-control`,name:`Vacuum control`,group:`home`,summary:`A robot cleaner: status, battery, start, pause, return to dock, and the rooms to clean.`},{id:`appliance-cycle`,name:`Appliance cycle`,group:`home`,summary:`A washing machine or dishwasher programme: stage, time left, progress, and a finished state.`},{id:`irrigation-zones`,name:`Irrigation zones`,group:`home`,summary:`Watering zones with durations, the zone running now, the next run, and a skip for rain.`},{id:`timer`,name:`Timer`,group:`home`,summary:`Named countdowns, several at once: time left, pause, add a minute, cancel, and a finished alert.`},{id:`speaker-selector`,name:`Speaker selector`,group:`home`,summary:`Rooms and speakers to send playback to and group together, each with its own volume.`},{id:`tv-remote`,name:`TV remote`,group:`home`,summary:`A direction pad with OK, back and home, volume and channel rockers, and input or app buttons.`},{id:`up-next`,name:`Up next`,group:`home`,summary:`The queue after the current track or episode: art, titles, play now and remove.`},{id:`voice-ring`,name:`Voice ring`,group:`home`,summary:`A large ring for a voice satellite: idle, listening (follows the level), thinking, speaking, muted and error.`},{id:`assist-reply`,name:`Assist reply`,group:`home`,summary:`What the voice assistant understood and did, with the things it changed and an undo.`},{id:`notification-centre`,name:`Notification centre`,group:`home`,summary:`Notifications with actions, grouped and dismissible, critical ones pinned on top.`},{id:`ambient-clock`,name:`Ambient clock`,group:`home`,summary:`A screensaver for wall and bedside screens: large clock, date, next event and weather, dimmed at night.`},{id:`state-timeline`,name:`State timeline`,group:`home`,summary:`When things were on, open or present over a day, as bars on a shared time axis.`},{id:`activity-feed`,name:`Activity feed`,group:`home`,summary:`What happened in the home, newest first: icon, what changed, by what, and how long ago.`},{id:`departures-board`,name:`Departures board`,group:`home`,summary:`Next departures from a stop: line, destination, minutes to go, and delays or cancellations.`},{id:`todo-list`,name:`To-do list`,group:`home`,summary:`A shared list (to-do or shopping): add, check off, reorder, and clear the completed items.`}],Ku=new Set(Uu);function qu(e,t){if(!t)return[e,``,``];let n=e.indexOf(t);return n<0?[e?`${e} `:``,t,``]:[e.slice(0,n),t,e.slice(n+t.length)]}function Ju(e=`headline`,t=`accent`){return B(`mh-accent-headline`,`mh-accent-headline--${e}`,t===`inherit`&&`mh-accent-headline--inherit`)}function Yu(e){let t=M(`h${e.level??2}`,{class:Ju(e.size,e.tone)}),n=(e,n)=>{let[r,i,a]=qu(e,n);t.replaceChildren(),r&&t.append(r),i&&t.append(M(`em`,{class:`mh-accent-headline__accent`},i)),a&&t.append(a)};return n(e.text,e.accent),{el:t,setText:n}}var Xu={text:`↑`,spoken:`Up arrow`},Zu={text:`↓`,spoken:`Down arrow`},Qu={text:`←`,spoken:`Left arrow`},$u={text:`→`,spoken:`Right arrow`},ed={control:{text:`Ctrl`},ctrl:{text:`Ctrl`},escape:{text:`Esc`},esc:{text:`Esc`}," ":{text:`Space`},space:{text:`Space`},spacebar:{text:`Space`},arrowup:Xu,up:Xu,arrowdown:Zu,down:Zu,arrowleft:Qu,left:Qu,arrowright:$u,right:$u,return:{text:`Enter`},delete:{text:`Del`},pageup:{text:`PgUp`},pagedown:{text:`PgDn`}};function td(e){return ed[e.toLowerCase()]||(e.length===1?{text:e.toUpperCase()}:{text:e})}function nd(e){if(typeof e!=`string`)return[...e];let t=[],n=``;for(let r of e)r===`+`&&n.trim()!==``?(t.push(n.trim()),n=``):n+=r;let r=n.trim();return r&&t.push(r),t}function rd(e=`medium`,t=!1){return B(`mh-kbd`,e===`small`&&`mh-kbd--sm`,t&&`mh-kbd--sequence`)}function id(e=!1,t=`then`){return e?t:`+`}function ad(e){let t=M(`kbd`,{class:rd(e.size,e.sequence)}),n=n=>{t.replaceChildren(),nd(n).forEach((n,r)=>{r>0&&t.append(M(`span`,{class:`mh-kbd__sep`},id(e.sequence,e.thenLabel)));let i=td(n);t.append(i.spoken?M(`kbd`,{class:`mh-kbd__key`,title:i.spoken},M(`span`,{"aria-hidden":`true`},i.text),M(`span`,{class:`mh-visually-hidden`},i.spoken)):M(`kbd`,{class:`mh-kbd__key`},i.text))})};return n(e.keys),{el:t,setKeys:n}}function od(e={}){return B(`mh-backdrop`,e.fixed&&`mh-backdrop--fixed`,e.drift&&`mh-backdrop--drift`,e.dim&&`mh-backdrop--dim`)}function sd(e={}){let t=M(`div`,{class:od(e),"aria-hidden":`true`});return{el:t,setDrift(e){t.classList.toggle(`mh-backdrop--drift`,e)},setDim(e){t.classList.toggle(`mh-backdrop--dim`,e)}}}function cd(e=!1,t=!1){return B(`mh-boot-splash`,e&&`mh-boot-splash--inline`,t&&`is-leaving`)}var ld=()=>typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function ud(){return M(`span`,{class:`mh-boot-splash__mark`,"aria-hidden":`true`},...[0,1,2,3].map(()=>M(`span`,{class:`mh-boot-splash__tile`})))}function dd(e={}){let t=e.mark?M(`span`,{class:`mh-boot-splash__mark`,"aria-hidden":`true`},e.mark):ud(),n=M(`p`,{class:`mh-boot-splash__message`,"aria-live":`polite`},e.message??``),r=M(`div`,{class:`mh-boot-splash__content`},t,e.name?M(`p`,{class:`mh-boot-splash__name`},e.name):null,n),i=M(`div`,{class:cd(e.inline),"aria-busy":`true`},r),a=null,o=null,s=t=>{t===void 0?(o?.remove(),a=o=null):a?a.setValue(t):(a=gi({label:e.progressLabel??`Starting`,value:t,size:`small`}),o=M(`div`,{class:`mh-boot-splash__progress`},a.el),r.append(o))};s(e.progress);let c=null;return{el:i,setMessage(e){n.textContent=e},setProgress:s,dismiss(){return c||(c=new Promise(t=>{let n=!1,r=()=>{n||(n=!0,i.remove(),e.onDismissed?.(),t())};if(!i.isConnected||ld())return r();i.classList.add(`is-leaving`),i.removeAttribute(`aria-busy`),i.addEventListener(`transitionend`,e=>e.target===i&&r()),setTimeout(r,700)}),c)}}}var fd=(...e)=>M(`div`,{class:`ex-row`},...e),pd=(e,t)=>M(`div`,{class:`ex-swatch`},M(`span`,{class:`ex-swatch__chip`,style:`background: var(${t})`}),M(`span`,{class:`mh-text--caption`},e)),md=[{id:`text`,render:()=>M(`div`,{class:`ex-stack`},C(`Living room`,{variant:`eyebrow`,tone:`muted`}),C(`21.5°`,{variant:`display`}),C(`Good evening`,{variant:`headline`}),C(`Lights and climate`,{variant:`title`}),C(`Body text reads comfortably at every device class.`),C(`Label`,{variant:`label`}),C(`Caption, muted`,{variant:`caption`,tone:`muted`}),fd(C(`Success`,{variant:`label`,tone:`success`}),C(`Warning`,{variant:`label`,tone:`warning`}),C(`Danger`,{variant:`label`,tone:`danger`})))},{id:`icon`,render:()=>M(`div`,{class:`ex-icons`},...Object.keys(Kt).map(e=>M(`div`,{class:`ex-icon`,title:e},H(e,{size:24}),M(`span`,{class:`mh-text--caption mh-text--faint`},e))))},{id:`divider`,render:()=>M(`div`,{class:`ex-stack`},C(`Above`),et(),C(`Below`),et({label:`or`}),fd(`Left`,et({vertical:!0}),`Right`))},{id:`palette`,render:()=>M(`div`,{class:`ex-stack`},...[[`Canvas & surfaces`,[`canvas-top`,`canvas-bottom`,`surface`,`surface-raised`,`surface-pressed`,`input`,`divider`]],[`Text`,[`heading`,`text`,`text-muted`,`text-faint`]],[`Accent`,[`accent`,`accent-light`,`accent-dark`,`on-accent`,`focus`,`accent-soft`]],[`Status`,[`success`,`info`,`warning`,`danger`,`on-status`]],[`Series`,[`series-1`,`series-2`,`series-3`,`series-4`,`series-5`,`series-6`]]].flatMap(([e,t])=>[C(e,{variant:`label`,tone:`muted`}),M(`div`,{class:`ex-swatches`},...t.map(e=>pd(e,`--mh-${e}`)))]))},{id:`type-scale`,render:e=>M(`div`,{class:`ex-stack`},...Object.entries(e.type).map(([e,t])=>fd(M(`span`,{class:`ex-meta`},`${e} ${t}`),C(`Aa Living room`,{variant:e,as:`span`}))))},{id:`shape-space`,render:e=>M(`div`,{class:`ex-stack`},C(`Radii`,{variant:`label`,tone:`muted`}),fd(...[`sm`,`md`,`lg`,`xl`].map(t=>M(`div`,{class:`ex-shape`,style:`border-radius: var(--mh-radius-${t})`},`${t} ${e.radius[t]}`))),C(`Spacing`,{variant:`label`,tone:`muted`}),...Object.entries(e.space).map(([e,t])=>fd(M(`span`,{class:`ex-meta`},`${e} ${t}`),M(`span`,{class:`ex-space`,style:`width: ${t}px`}))),C(`Control heights`,{variant:`label`,tone:`muted`}),fd(...Object.entries(e.control).map(([e,t])=>M(`div`,{class:`ex-control`,style:`height: ${t}px`},`${e} ${t}`))))},{id:`elevation`,render:()=>fd(...[0,1,2,3].map(e=>M(`div`,{class:`ex-card`,style:e?`box-shadow: var(--mh-shadow-${e})`:``},`Level ${e}`)))},{id:`accent-headline`,render:()=>M(`div`,{class:`ex-stack`},Yu({text:`Good evening`,accent:`evening`,size:`display`,level:1}).el,Yu({text:`Welcome home, the lights are ready`,accent:`home`}).el,Yu({text:`Your quiet hour starts at ten`,accent:`quiet hour`,size:`title`,level:3}).el,C(`Tone inherit: serif italic only`,{variant:`label`,tone:`muted`}),Yu({text:`Lanterns over the quay`,accent:`over the quay`,tone:`inherit`}).el)},{id:`kbd`,render:()=>{let e=(e,t,n=!1)=>fd(M(`span`,{class:`ex-meta`},t),ad({keys:e,sequence:n}).el);return M(`div`,{class:`ex-stack`},e(`Ctrl+K`,`Search`),e(`Esc`,`Close a dialog`),e([`Ctrl`,`Shift`,`P`],`All commands`),e(`Ctrl++`,`Zoom in`),e([`ArrowUp`,`ArrowDown`],`Move between rooms`,!0),e([`G`,`H`],`Go home`,!0),M(`p`,{class:`mh-text--body`,style:`margin: 0`},`Press `,ad({keys:`/`,size:`small`}).el,` to search, or `,ad({keys:`Space`,size:`small`}).el,` to toggle the selected light.`))}},{id:`backdrop`,render:()=>{let e=(e,t)=>M(`div`,{class:`mh-backdrop-host`,style:`display: grid; place-items: center; min-height: 160px; overflow: hidden; border: 1px solid var(--mh-outline); border-radius: var(--mh-radius-lg)`},sd(t).el,C(e,{variant:`title`}));return M(`div`,{class:`ex-stack`},C(`Calm themes (contrast, or the backdrop turned off in Tune) show the flat canvas.`,{variant:`label`,tone:`muted`}),e(`Canvas and glow`,{}),e(`Drifting glow`,{drift:!0}),e(`Dimmed, behind a clock`,{dim:!0,drift:!0}))}},{id:`boot-splash`,render:()=>{let e=`position: relative; overflow: hidden; border: 1px solid var(--mh-outline); border-radius: var(--mh-radius-lg)`,t=M(`div`,{style:`${e}; height: 360px`}),n=[`Starting…`,`Connecting to Home Assistant…`,`Loading rooms…`,`Almost ready…`],r=()=>{t.replaceChildren();let e=dd({name:`Mosaic Home`,message:n[0],progress:null,inline:!0});t.append(e.el);let i=0,a=window.setInterval(()=>{if(!e.el.isConnected)return window.clearInterval(a);if(i+=1,i<n.length){e.setMessage(n[i]),e.setProgress(i/(n.length-1)*100);return}window.clearInterval(a);let o=P({label:`Boot again`,icon:`refresh`,variant:`secondary`,onClick:r});e.dismiss().then(()=>t.append(M(`div`,{style:`display: grid; place-items: center; height: 100%`},o.el)))},1400)};r();let i=M(`div`,{style:`${e}; height: 240px`},dd({name:`Mosaic Home`,message:`Waiting for the network`,inline:!0}).el);return M(`div`,{class:`ex-stack`},C(`Boots, shows progress, then fades out`,{variant:`label`,tone:`muted`}),t,C(`Without progress`,{variant:`label`,tone:`muted`}),i)}}];function hd(e=`secondary`,t=`horizontal`,n=!1){return B(`mh-button-group`,e===`tonal`&&`mh-button-group--tonal`,t===`vertical`&&`mh-button-group--vertical`,n&&`mh-button-group--block`)}function gd(e=`secondary`,t=`medium`,n=!1){return B(z(e,t),`mh-button-group__item`,n&&`mh-button-group__item--icon`)}function _d(e=!1,t=`horizontal`){return e?{role:`toolbar`,...t===`vertical`?{"aria-orientation":`vertical`}:{}}:{role:`group`}}function vd(e,t=0){return e[t]&&!e[t].disabled?t:e.findIndex(e=>!e.disabled)}function yd(e,t,n,r=`horizontal`){let i=e.map((e,t)=>t).filter(t=>!e[t].disabled);if(!i.length)return null;let a=r===`vertical`?`ArrowDown`:`ArrowRight`,o=r===`vertical`?`ArrowUp`:`ArrowLeft`;if(n===`Home`)return i[0];if(n===`End`)return i[i.length-1];if(n!==a&&n!==o)return null;let s=n===a?1:-1;for(let n=1;n<=e.length;n++){let r=((t+s*n)%e.length+e.length)%e.length;if(!e[r].disabled)return r}return null}function bd(e){let t=e.items.map(e=>({...e})),n=e.orientation??`horizontal`,r=M(`div`,{class:hd(e.variant,n,e.fullWidth),..._d(e.toolbar,n),"aria-label":e.label??null}),i=t.map(t=>{let n=M(`button`,{type:`button`,class:gd(e.variant,e.size,t.iconOnly),"aria-label":t.iconOnly?t.label:null,title:t.iconOnly?t.label:null,"aria-pressed":t.pressed===void 0?null:String(t.pressed),disabled:t.disabled??!1},t.icon?H(t.icon):null,t.iconOnly?null:M(`span`,{class:`mh-button__label`},t.label));return n.addEventListener(`click`,n=>e.onClick?.(t.id,n)),r.append(n),n}),a=vd(t),o=()=>{e.toolbar&&(a=vd(t,a),i.forEach((e,t)=>e.tabIndex=t===a?0:-1))};o(),e.toolbar&&(r.addEventListener(`keydown`,e=>{let r=i.indexOf(document.activeElement);if(r<0)return;let s=yd(t,r,e.key,n);s!==null&&(e.preventDefault(),a=s,o(),i[s].focus())}),r.addEventListener(`focusin`,e=>{let t=i.indexOf(e.target);t>=0&&t!==a&&(a=t,o())}));let s=e=>t.findIndex(t=>t.id===e);return{el:r,setPressed(e,n){let r=s(e);r<0||(t[r].pressed=n,n===void 0?i[r].removeAttribute(`aria-pressed`):i[r].setAttribute(`aria-pressed`,String(n)))},setDisabled(e,n){let r=s(e);r<0||(t[r].disabled=n,i[r].disabled=n,o())}}}var xd=ie;function Sd(e=`accent`,t=`always`){return B(`mh-link`,`mh-link--${e}`,t===`hover`&&`mh-link--subtle`)}function Cd(e){let t=M(`span`,{class:`mh-link__text`},e.text),n=e.href!==void 0&&e.external,r=[e.icon?H(e.icon):null,t,n?H(xd,{class:`mh-link__external`}):null,n?M(`span`,{class:`mh-visually-hidden`},` (${e.newTabLabel??`opens in a new tab`})`):null],i=Sd(e.tone,e.underline),a=e.href===void 0?M(`button`,{type:`button`,class:i},...r):M(`a`,{class:i,href:e.href,target:n?`_blank`:null,rel:n?`noopener noreferrer`:null},...r);return e.onClick&&a.addEventListener(`click`,e.onClick),{el:a,setText(e){t.textContent=e}}}var wd=e=>e?a:bn;function Td(e=`medium`,t=!1){return B(`mh-favourite-toggle`,e!==`medium`&&`mh-favourite-toggle--${e===`small`?`sm`:`lg`}`,t&&`mh-favourite-toggle--labelled`)}function Ed(e={}){let t=e.label??`Favourite`,n=e.pressed??!1,r=M(`button`,{type:`button`,class:Td(e.size,e.showLabel),"aria-pressed":String(n),"aria-label":e.showLabel?null:t,title:e.showLabel?null:t,disabled:e.disabled??!1}),i=e.showLabel?M(`span`,{class:`mh-favourite-toggle__label`},t):null,a=()=>{r.setAttribute(`aria-pressed`,String(n)),r.replaceChildren(H(wd(n))),i&&r.append(i)};return a(),r.addEventListener(`click`,()=>{n=!n,a(),r.classList.remove(`is-popping`),r.offsetWidth,r.classList.add(`is-popping`),e.onChange?.(n)}),r.addEventListener(`animationend`,e=>{e.target===r.firstElementChild&&r.classList.remove(`is-popping`)}),{el:r,get pressed(){return n},setPressed(e){n=e,a()},setDisabled(e){r.disabled=e}}}var Dd=(...e)=>M(`div`,{class:`ex-row`},...e),Od=[`primary`,`secondary`,`tonal`,`text`,`danger`],kd=e=>C(e,{variant:`label`,tone:`muted`});function Ad(e,t,n={}){let r=t,i=bd({...n,items:e.map(e=>({...e,pressed:e.id===t})),onClick:e=>{i.setPressed(r,!1),r=e,i.setPressed(e,!0)}});return i}var jd=[{id:`button`,render:()=>M(`div`,{class:`ex-stack`},Dd(...Od.map(e=>P({label:e[0].toUpperCase()+e.slice(1),variant:e}).el)),Dd(P({label:`Small`,size:`small`}).el,P({label:`Medium`}).el,P({label:`Large`,size:`large`}).el),Dd(P({label:`Turn on`,icon:`power`}).el,P({label:`Next`,variant:`secondary`,trailingIcon:`arrow-right`}).el),Dd(P({label:`Saving`,loading:!0}).el,P({label:`Disabled`,disabled:!0}).el),P({label:`Full width`,fullWidth:!0,variant:`tonal`}).el)},{id:`icon-button`,render:()=>M(`div`,{class:`ex-stack`},Dd(U({icon:`previous`,label:`Previous`}).el,U({icon:`play`,label:`Play`,filled:!0,tone:`accent`,size:`large`}).el,U({icon:`next`,label:`Next`}).el),Dd(U({icon:`settings`,label:`Settings`,size:`small`}).el,U({icon:`heart`,label:`Favourite`,pressed:!0}).el,U({icon:`delete`,label:`Delete`,tone:`danger`}).el,U({icon:`more`,label:`More`,filled:!0}).el))},{id:`button-group`,render:()=>{let e=new Set([`bold`]),n=bd({label:`Text style`,toolbar:!0,items:[{id:`bold`,label:`Bold`,icon:gr,iconOnly:!0,pressed:!0},{id:`italic`,label:`Italic`,icon:Hn,iconOnly:!0,pressed:!1},{id:`underline`,label:`Underline`,icon:or,iconOnly:!0,pressed:!1}],onClick:t=>{e.has(t)?e.delete(t):e.add(t),n.setPressed(t,e.has(t))}}),r=[t,He,tn],i=[`left`,`center`,`right`].map((e,t)=>({id:e,label:`Align ${e}`,icon:r[t],iconOnly:!0}));return M(`div`,{class:`ex-stack`},kd(`Actions; a toolbar is one tab stop and the arrow keys move inside it`),Dd(bd({label:`Playback`,toolbar:!0,items:[{id:`prev`,label:`Previous`,icon:`previous`,iconOnly:!0},{id:`play`,label:`Play`,icon:`play`,iconOnly:!0},{id:`next`,label:`Next`,icon:`next`,iconOnly:!0}]}).el,bd({label:`Scene`,items:[{id:`save`,label:`Save`,icon:`check`},{id:`share`,label:`Share`,icon:`share`},{id:`delete`,label:`Delete`,icon:`delete`,disabled:!0}]}).el),kd(`Toggles: several pressed, or exactly one`),Dd(n.el,Ad(i,`left`,{label:`Alignment`,toolbar:!0}).el),Dd(Ad([{id:`day`,label:`Day`},{id:`week`,label:`Week`},{id:`month`,label:`Month`}],`week`,{label:`Range`,size:`small`}).el,Ad([{id:`list`,label:`List`},{id:`grid`,label:`Grid`}],`grid`,{label:`Layout`,variant:`tonal`,size:`small`}).el),kd(`Full width and large, and vertical`),Ad([{id:`off`,label:`Off`,icon:`power`},{id:`eco`,label:`Eco`},{id:`comfort`,label:`Comfort`,icon:`thermometer`}],`eco`,{label:`Heating`,fullWidth:!0,size:`large`}).el,Dd(Ad([{id:`living`,label:`Living room`},{id:`kitchen`,label:`Kitchen`},{id:`bedroom`,label:`Bedroom`}],`kitchen`,{label:`Room`,orientation:`vertical`,toolbar:!0}).el))}},{id:`link`,render:()=>{let e=(...e)=>M(`p`,{style:`margin: 0; max-width: 60ch`},...e),t=Cd({text:`Show three more devices`,onClick:()=>t.setText(`All devices shown`)});return M(`div`,{class:`ex-stack`},e(`The hallway sensor reports every five minutes. `,Cd({text:`Change the interval`,href:`#link`}).el,` or `,Cd({text:`read how sensors report`,href:`https://example.com/sensors`,external:!0}).el,`.`),e(C(`Muted, for secondary links: `,{as:`span`,tone:`muted`}),Cd({text:`Privacy`,href:`#link`,tone:`muted`}).el,` · `,Cd({text:`Licences`,href:`#link`,tone:`muted`}).el),M(`div`,{class:`mh-alert mh-alert--warning`,role:`note`},M(`div`,{class:`mh-alert__body`},e(`Inherit takes the colour around it: `,Cd({text:`update the firmware`,href:`#link`,tone:`inherit`}).el,` to fix this.`))),e(`Underline on hover only: `,Cd({text:`Living room`,href:`#link`,underline:`hover`,icon:`home`}).el),e(`An action styled as a link (a button): `,t.el))}},{id:`favourite-toggle`,render:()=>{let e=C(`Kitchen light is a favourite`,{variant:`label`,tone:`muted`});return M(`div`,{class:`ex-stack`},Dd(Ed({size:`small`}).el,Ed({pressed:!0,label:`Favourite: Kitchen light`,onChange:t=>e.textContent=t?`Kitchen light is a favourite`:`Kitchen light is not a favourite`}).el,Ed({size:`large`,label:`Favourite scene`}).el,Ed({disabled:!0}).el),e,Dd(Ed({showLabel:!0}).el,Ed({showLabel:!0,pressed:!0,label:`Pinned`,size:`small`}).el))}}];function Md(e=`medium`){return B(`mh-stepper`,e===`small`&&`mh-stepper--sm`)}function Nd(e,t=-1/0,n=1/0,r=1){let i=Number.isFinite(t)?t+Math.round((e-t)/r)*r:Math.round(e/r)*r;return Math.min(n,Math.max(t,Number(i.toFixed(10))))}function Pd(e,t,n,r,i){switch(e){case`ArrowUp`:case`ArrowRight`:return Nd(t+i,n,r,i);case`ArrowDown`:case`ArrowLeft`:return Nd(t-i,n,r,i);case`PageUp`:return Nd(t+i*10,n,r,i);case`PageDown`:return Nd(t-i*10,n,r,i);case`Home`:return Number.isFinite(n)?n:null;case`End`:return Number.isFinite(r)?r:null;default:return null}}function Fd(e){let t=e.min??0,n=e.max??1/0,r=e.step??1,i=Nd(e.value??t,t,n,r),a=e.disabled??!1,o=M(`button`,{type:`button`,class:`mh-stepper__button`,tabindex:`-1`,"aria-label":e.decreaseLabel??`Decrease`},H(ce)),s=M(`button`,{type:`button`,class:`mh-stepper__button`,tabindex:`-1`,"aria-label":e.increaseLabel??`Increase`},H(vt)),c=M(`span`,{class:`mh-stepper__value`,role:`spinbutton`,tabindex:`0`,"aria-label":e.label});Number.isFinite(t)&&c.setAttribute(`aria-valuemin`,String(t)),Number.isFinite(n)&&c.setAttribute(`aria-valuemax`,String(n));let l=M(`div`,{class:Md(e.size)},o,c,s),u=()=>{let r=e.format?e.format(i):String(i);c.textContent=r,c.setAttribute(`aria-valuenow`,String(i)),e.format&&c.setAttribute(`aria-valuetext`,r),o.disabled=a||i<=t,s.disabled=a||i>=n,c.tabIndex=a?-1:0,a?c.setAttribute(`aria-disabled`,`true`):c.removeAttribute(`aria-disabled`)},d=t=>{t!==i&&(i=t,u(),e.onChange?.(i))};return o.addEventListener(`click`,()=>d(Nd(i-r,t,n,r))),s.addEventListener(`click`,()=>d(Nd(i+r,t,n,r))),c.addEventListener(`keydown`,e=>{if(a)return;let o=Pd(e.key,i,t,n,r);o!==null&&(e.preventDefault(),d(o))}),u(),{el:l,spinbutton:c,getValue:()=>i,setValue(e){i=Nd(e,t,n,r),u()},setDisabled(e){a=e,u()}}}function Id(e=`medium`){return Pn(e,`mh-search`)}var Ld=B(l(`default`,`small`),`mh-search__clear`);function Rd(e={}){let t=M(`input`,{class:`mh-input__control`,type:`search`,name:e.name,placeholder:e.placeholder,autocomplete:`off`,enterkeyhint:`search`,"aria-label":e.label??`Search`});t.value=e.value??``;let n=M(`button`,{type:`button`,class:Ld,"aria-label":e.clearLabel??`Clear search`,title:e.clearLabel??`Clear search`},H(Hr)),r=M(`div`,{class:Id(e.size),role:e.landmark?`search`:void 0},Kn(H(Dn)),t,n);nn(r,t);let i=()=>{n.hidden=t.value===``||t.disabled},a=()=>{t.value=``,i(),t.focus(),e.onInput?.(``,new Event(`input`)),e.onClear?.()};t.addEventListener(`input`,n=>{i(),e.onInput?.(t.value,n)}),t.addEventListener(`keydown`,n=>{n.key===`Escape`&&t.value!==``?(n.preventDefault(),n.stopPropagation(),a()):n.key===`Enter`&&e.onSearch?.(t.value)}),n.addEventListener(`click`,a),i();let o={el:r,input:t,clearButton:n,getValue:()=>t.value,setValue(e){t.value=e,i()},setDisabled(e){t.disabled=e,r.classList.toggle(`is-disabled`,e),i()}};return e.disabled&&o.setDisabled(!0),o}function zd(e,t=10){let n=getComputedStyle(e),r=parseFloat(n.lineHeight)||(parseFloat(n.fontSize)||16)*1.45,i=Math.ceil(r*t);e.style.height=`auto`;let a=e.scrollHeight;a>0&&(e.style.height=`${Math.min(a,i)}px`),e.style.overflowY=a>i?`auto`:`hidden`}function Bd(e){let t=M(`textarea`,{class:`mh-input__control`,name:e.name,rows:e.rows??3,placeholder:e.placeholder,maxlength:e.maxLength,readonly:e.readOnly,"aria-label":e.label?void 0:e.ariaLabel});t.value=e.value??``;let n=M(`div`,{class:Pn(`medium`,`mh-input--multiline`)},t);nn(n,t);let r=e.label?pn({label:e.label,control:n,target:t,helper:e.helper,error:e.error,success:e.success,required:e.required,labelStyle:e.labelStyle,counter:e.showCount}):null,i=e.autoGrow??!0,a=()=>{r?.setCount(t.value.length,e.maxLength),i&&t.isConnected&&zd(t,e.maxRows)};a(),t.addEventListener(`input`,n=>{a(),e.onInput?.(t.value,n)}),e.onChange&&t.addEventListener(`change`,n=>e.onChange(t.value,n)),i&&typeof requestAnimationFrame==`function`&&requestAnimationFrame(a);let o={el:r?.el??n,textarea:t,field:r,getValue:()=>t.value,setValue(e){t.value=e,a()},setError:e=>r?.setError(e),setHelper:e=>r?.setHelper(e),setDisabled(e){t.disabled=e,n.classList.toggle(`is-disabled`,e),r?.setDisabled(e)},resize:a};return e.disabled&&o.setDisabled(!0),o}var Vd={send:{icon:Ut,label:`Send`,tone:`accent`,size:`medium`,filled:!0},stop:{icon:Ie,label:`Stop`,tone:`default`,size:`medium`,filled:!0},mic:{icon:Re,label:`Dictate`,tone:`default`,size:`medium`,filled:!1},voice:{icon:rr,label:`Start a voice conversation`,tone:`default`,size:`medium`,filled:!1},attach:{icon:st,label:`Attach`,tone:`default`,size:`medium`,filled:!1}};function Hd(e,t={}){let n=Vd[e];return U({...n,label:t.label??n.label,disabled:t.disabled,onClick:t.onClick})}function Ud(){return typeof matchMedia==`function`&&matchMedia(`(pointer: fine)`).matches}function Wd(e,t,n=Ud()){return t.key!==`Enter`||t.isComposing||e===`never`||t.shiftKey||t.altKey?!1:t.ctrlKey||t.metaKey?!0:e===`always`||n}function Gd(e){return e===`always`?`send`:e===`never`?`enter`:void 0}var Kd=e=>e.clearLabel??`Clear ${e.label}`;function qd(e=!1,t=!1){return B(`mh-composer`,t&&`mh-composer--mode`,e&&`is-disabled`)}var Jd=(e,t)=>{let n=Array.isArray(t)?t:[t];if(!n.some(e=>e!=null&&e!==!1))return null;let r=M(`div`,{class:`mh-composer__${e}`});return it(r,...n),r};function Yd(e){let t=e.maxRows??6,n=e.enterSends??`auto`,r=I(`mh-composer-mode`),i=I(`mh-composer-reason`),a=M(`textarea`,{class:`mh-composer__input`,rows:1,name:e.name,placeholder:e.placeholder,"aria-label":e.ariaLabel??`Message`,enterkeyhint:Gd(n)});a.value=e.value??``;let o=M(`div`,{class:`mh-composer__row`},Jd(`leading`,e.leading),a,Jd(`trailing`,e.trailing)),s=M(`div`,{class:`mh-composer__field`},o),c=M(`p`,{class:`mh-composer__reason`,id:i,"aria-live":`polite`}),l=M(`div`,{class:`mh-composer__notice`,hidden:!0},c);if(e.onRetry){let t=M(`button`,{type:`button`,class:z(`text`,`small`)},M(`span`,{class:`mh-button__label`},e.retryLabel??`Retry`));t.addEventListener(`click`,()=>e.onRetry()),l.append(t)}let u=M(`div`,{class:qd()},l,s),d=!1,f=null,p=null,m=null,h=[],g=()=>{let e=[f&&r,!l.hidden&&i].filter(Boolean).join(` `);e?a.setAttribute(`aria-describedby`,e):a.removeAttribute(`aria-describedby`)},_=()=>{u.className=qd(d,f!==null)},v=()=>{a.isConnected&&zd(a,t)};s.addEventListener(`mousedown`,e=>{e.target!==a&&!e.target.closest(`button`)&&(e.preventDefault(),a.focus())}),a.addEventListener(`input`,t=>{v(),e.onInput?.(a.value,t)});let y=()=>{d||a.value.trim()===``||e.onSubmit?.(a.value)};a.addEventListener(`keydown`,e=>{Wd(n,e)&&(e.preventDefault(),y())}),typeof requestAnimationFrame==`function`&&requestAnimationFrame(v);let b={el:u,textarea:a,getValue:()=>a.value,setValue(e){a.value=e,v()},setPlaceholder(e){e?a.placeholder=e:a.removeAttribute(`placeholder`)},setDisabled(e,t){d=e,a.disabled=e;for(let t of h)t.disabled=e;let n=e&&!!t;c.textContent=n?t:``,l.hidden=!n,_(),g()},setMode(e){f=e??null;let t=p;p=f?Xd(f,r):null,t&&p?t.replaceWith(p):t?t.remove():p&&s.prepend(p),_(),g()},setSuggestions(t){let n=m;h=[],m=null,t&&t.length>0&&(h=t.map(t=>{let n=M(`button`,{type:`button`,class:`mh-composer__suggestion`,disabled:d},t);return n.addEventListener(`click`,()=>e.onSuggestion?.(t)),n}),m=M(`div`,{class:`mh-composer__suggestions`,role:`group`,"aria-label":e.suggestionsLabel??`Suggestions`},...h)),n&&m?n.replaceWith(m):n?n.remove():m&&u.prepend(m)},submit:y,focus:()=>a.focus(),resize:v};return b.setSuggestions(e.suggestions),b.setMode(e.mode),b.setDisabled(e.disabled??!1,e.disabledReason),b}function Xd(e,t){let n=M(`button`,{type:`button`,class:`mh-composer__mode-clear`,"aria-label":Kd(e),title:Kd(e)},H(Hr));return n.addEventListener(`click`,()=>e.onClear()),M(`div`,{class:`mh-composer__mode`},e.icon?H(e.icon,{class:`mh-composer__mode-icon`}):null,M(`span`,{class:`mh-composer__mode-text`,id:t},M(`span`,{class:`mh-composer__mode-label`},e.label),e.hint?M(`span`,{class:`mh-composer__mode-hint`},e.hint):null),n)}function Zd(e){return e.normalize(`NFD`).replace(/\p{M}/gu,``).toLowerCase().trim()}function Qd(e,t){let n=Zd(t);if(n===``)return!0;let r=Zd(e);return n.split(/\s+/).every(e=>r.includes(e))}function $d(e,t,n,r=!1){let i=e.length;if(i===0)return-1;let a=t;for(let o=0;o<i;o++){if(a+=n,a<0||a>=i){if(!r)return t;a=a<0?i-1:0}if(!e[a].disabled)return a}return t}function ef(e){e?.scrollIntoView?.({block:`nearest`})}var tf=400,nf=70;function rf(e,t){let n,r=!1,i=()=>{clearTimeout(n),n=void 0},a=r=>{n=setTimeout(()=>{if(e.disabled)return i();t(),a(nf)},r)},o=n=>{n.button!==0||e.disabled||(r=!0,t(),i(),a(tf))},s=e=>{let n=r;r=!1,!(n&&e.detail>0)&&t()},c=e=>e.preventDefault();return e.addEventListener(`pointerdown`,o),e.addEventListener(`pointerup`,i),e.addEventListener(`pointercancel`,i),e.addEventListener(`pointerleave`,i),e.addEventListener(`mousedown`,c),e.addEventListener(`click`,s),()=>{i(),e.removeEventListener(`pointerdown`,o),e.removeEventListener(`pointerup`,i),e.removeEventListener(`pointercancel`,i),e.removeEventListener(`pointerleave`,i),e.removeEventListener(`mousedown`,c),e.removeEventListener(`click`,s)}}function af(e){let t=String(e),n=/e-(\d+)$/.exec(t);if(n)return Number(n[1]);let r=t.indexOf(`.`);return r===-1?0:t.length-r-1}function of(e){let t=e.step&&e.step>0?e.step:1;return{min:e.min??-1/0,max:e.max??1/0,step:t,largeStep:e.largeStep??t*10,precision:e.precision??af(t)}}function sf(e){let t=e.replace(/\s/g,``).replace(`−`,`-`).replace(`,`,`.`);if(t===``||!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t))return null;let n=Number(t);return Number.isFinite(n)?n:null}function cf(e,t){return Nd(e,t.min,t.max,t.step)}function lf(e,t){return e.toFixed(t).replace(`-`,`−`).replace(/^−(0\.?0*)$/,`$1`)}function uf(e,t,n,r){return r?r(e):n?`${lf(e,t.precision)} ${n}`:void 0}function df(e){return e.min<0?`text`:e.precision>0?`decimal`:`numeric`}function ff(e,t,n){switch(e){case`ArrowUp`:return cf(t+n.step,n);case`ArrowDown`:return cf(t-n.step,n);case`PageUp`:return cf(t+n.largeStep,n);case`PageDown`:return cf(t-n.largeStep,n);default:return null}}function pf(e=`medium`,t=!1){return Pn(e,B(`mh-number-input`,t&&`is-disabled`))}var mf={decrease:`Decrease`,increase:`Increase`,scrub:`Drag sideways to change`},hf=se;function gf(e,t){let n=0,r=0,i=null,a=a=>{a.button===0&&t.enabled?.()!==!1&&(a.preventDefault(),i=a.pointerId,n=a.clientX,r=0,e.setPointerCapture?.(a.pointerId),e.classList.add(`is-scrubbing`))},o=e=>{if(i!==e.pointerId)return;r+=e.clientX-n,n=e.clientX;let a=Math.trunc(r/t.distance);a!==0&&(r-=a*t.distance,t.onStep(a,e.shiftKey))},s=t=>{i===t.pointerId&&(i=null,e.releasePointerCapture?.(t.pointerId),e.classList.remove(`is-scrubbing`))};return e.addEventListener(`pointerdown`,a),e.addEventListener(`pointermove`,o),e.addEventListener(`pointerup`,s),e.addEventListener(`pointercancel`,s),()=>{e.removeEventListener(`pointerdown`,a),e.removeEventListener(`pointermove`,o),e.removeEventListener(`pointerup`,s),e.removeEventListener(`pointercancel`,s)}}function _f(e){let t=of(e),n=e.scrub??!0,r=cf(e.value??(Number.isFinite(t.min)?Math.max(t.min,0):0),t),i=!1,a=M(`input`,{class:`mh-input__control mh-number-input__control`,type:`text`,role:`spinbutton`,name:e.name,inputmode:df(t),autocomplete:`off`,spellcheck:`false`,"aria-valuemin":Number.isFinite(t.min)?t.min:void 0,"aria-valuemax":Number.isFinite(t.max)?t.max:void 0,"aria-label":e.label?void 0:e.ariaLabel}),o=e.decreaseLabel??mf.decrease,s=e.increaseLabel??mf.increase,c=M(`button`,{type:`button`,class:`mh-number-input__step`,tabindex:`-1`,"aria-label":o,title:o},H(ce)),l=M(`button`,{type:`button`,class:`mh-number-input__step`,tabindex:`-1`,"aria-label":s,title:s},H(vt)),u=e.unit||n?M(`span`,{class:B(`mh-input__adornment`,`mh-input__adornment--end`,`mh-number-input__unit`,n&&`mh-number-input__scrub`),"aria-hidden":`true`,title:n?mf.scrub:void 0},e.unit?e.unit:H(hf)):null,d=M(`div`,{class:pf(e.size)},c,e.prefix?Kn(e.prefix):null,a,u,l);nn(d,a);let f=()=>{a.value=lf(r,t.precision),a.setAttribute(`aria-valuenow`,String(r));let n=uf(r,t,e.unit,e.valueText);n?a.setAttribute(`aria-valuetext`,n):a.removeAttribute(`aria-valuetext`),c.disabled=i||r<=t.min,l.disabled=i||r>=t.max},p=n=>{let i=cf(n,t);if(i===r)return f();r=i,f(),e.onChange?.(r)},m=()=>sf(a.value)??r,h=()=>{let e=sf(a.value);p(e??r)};rf(c,()=>p(m()-t.step)),rf(l,()=>p(m()+t.step)),n&&u&&gf(u,{distance:e.scrubDistance??8,enabled:()=>!i,onStep:(e,n)=>p(m()+e*(n?t.largeStep:t.step))}),a.addEventListener(`change`,h),a.addEventListener(`keydown`,e=>{if(e.key===`Enter`)return h();if(e.key===`Escape`){a.value!==lf(r,t.precision)&&(e.preventDefault(),e.stopPropagation(),f());return}let n=ff(e.key,m(),t);n!==null&&(e.preventDefault(),p(n))});let g=e.label?pn({label:e.label,control:d,target:a,helper:e.helper,error:e.error,required:e.required,labelStyle:e.labelStyle}):null,_={el:g?.el??d,input:a,field:g,getValue:()=>r,setValue(e){r=cf(e,t),f()},setError:e=>g?.setError(e),setHelper:e=>g?.setHelper(e),setDisabled(e){i=e,a.disabled=e,d.classList.toggle(`is-disabled`,e),g?.setDisabled(e),f()}};return f(),e.disabled&&_.setDisabled(!0),_}function vf(e=`medium`,t=`password`,n=!1){return Pn(e,B(`mh-secret`,t===`key`&&`mh-secret--key`,n&&`is-disabled`))}var yf=B(l(`default`,`small`),`mh-input__action`);function bf(e){return{autocomplete:e===`key`?`off`:e===`new-password`?`new-password`:`current-password`,spellcheck:`false`,autocapitalize:`off`}}function xf(e){return{reveal:e===`key`?`Show key`:`Show password`,copy:`Copy`,copied:`Copied`,failed:`Couldn't copy`}}var Sf=1600;async function Cf(e){try{return typeof navigator>`u`||!navigator.clipboard?!1:(await navigator.clipboard.writeText(e),!0)}catch{return!1}}function wf(e){let t=e.kind??`password`,n=xf(t),r=e.revealLabel??n.reveal,i=e.copyLabel??n.copy,a=e.revealed??!1,o=!1,s=M(`input`,{class:`mh-input__control`,type:a?`text`:`password`,name:e.name,placeholder:e.placeholder,readonly:e.readOnly,...bf(t),"aria-label":e.label?void 0:e.ariaLabel});s.value=e.value??``;let c=M(`button`,{type:`button`,class:B(yf,`mh-secret__reveal`),"aria-label":r,title:r,"aria-pressed":String(a)},H(a?d:ut)),l=e.copyable??t===`key`?M(`button`,{type:`button`,class:B(yf,`mh-secret__copy`),"aria-label":i,title:i},H(w)):null,u=M(`span`,{class:`mh-visually-hidden`,role:`status`}),f=M(`div`,{class:vf(e.size,t)},e.icon?Kn(H(e.icon)):null,s,c,l,u);nn(f,s);let p,m=()=>{s.type=a?`text`:`password`,c.setAttribute(`aria-pressed`,String(a)),c.replaceChildren(H(a?d:ut)),c.disabled=o,l&&(l.disabled=o||s.value===``)},h=async()=>{if(!l||l.disabled)return!1;let t=await Cf(s.value);return u.textContent=t?e.copiedText??n.copied:e.copyFailedText??n.failed,t&&(l.classList.add(`is-copied`),l.replaceChildren(H(Wt)),clearTimeout(p),p=setTimeout(()=>{l.classList.remove(`is-copied`),l.replaceChildren(H(w)),u.textContent=``},Sf)),e.onCopy?.(t),t};c.addEventListener(`click`,()=>{a=!a,m(),e.onReveal?.(a)}),l?.addEventListener(`click`,()=>void h()),s.addEventListener(`input`,t=>{m(),e.onInput?.(s.value,t)}),e.onChange&&s.addEventListener(`change`,t=>e.onChange(s.value,t));let g=e.label?pn({label:e.label,control:f,target:s,helper:e.helper,error:e.error,success:e.success,required:e.required,labelStyle:e.labelStyle}):null,_={el:g?.el??f,input:s,field:g,revealButton:c,copyButton:l,getValue:()=>s.value,setValue(e){s.value=e,m()},isRevealed:()=>a,setRevealed(e){a=e,m()},copy:h,setError:e=>g?.setError(e),setHelper:e=>g?.setHelper(e),setSuccess:e=>g?.setSuccess(e),setDisabled(e){o=e,s.disabled=e,f.classList.toggle(`is-disabled`,e),g?.setDisabled(e),m()}};return m(),e.disabled&&_.setDisabled(!0),_}var Tf=new Set([`Control`,`Alt`,`AltGraph`,`Shift`,`Meta`,`OS`,`Super`,`Hyper`,`Fn`,`FnLock`,`CapsLock`,`NumLock`,`ScrollLock`]),Ef={" ":`Space`,Spacebar:`Space`,Esc:`Escape`,Del:`Delete`,Left:`ArrowLeft`,Right:`ArrowRight`,Up:`ArrowUp`,Down:`ArrowDown`},Df={ArrowUp:`↑`,ArrowDown:`↓`,ArrowLeft:`←`,ArrowRight:`→`,Enter:`↵`,Backspace:`⌫`,Escape:`Esc`,Delete:`Del`,PageUp:`PgUp`,PageDown:`PgDn`},Of=e=>Tf.has(e);function kf(e){let t=e.code??``;if(/^Key[A-Z]$/.test(t))return t.slice(3);if(/^Digit\d$/.test(t))return t.slice(5);let n=Ef[e.key]??e.key;return n.length===1?n.toUpperCase():n}function Af(e){return Of(e.key)||e.key===`Dead`||e.key===`Unidentified`||e.key===``?null:{key:kf(e),ctrl:!!e.ctrlKey,alt:!!e.altKey,shift:!!e.shiftKey,meta:!!e.metaKey}}var jf=e=>e.ctrl||e.alt||e.meta||e.shift&&e.key.length>1;function Mf(e){return[e.ctrl&&`Ctrl`,e.alt&&`Alt`,e.shift&&`Shift`,e.meta&&`Meta`,e.key].filter(Boolean).join(`+`)}function Nf(e){if(!e)return null;let t=e.split(`+`);t.at(-1)===``&&t.length>1&&t.splice(-2,2,`+`);let n={key:``,ctrl:!1,alt:!1,shift:!1,meta:!1};for(let[e,r]of t.entries()){let i=r.trim(),a=i.toLowerCase();if(e<t.length-1){if(a===`ctrl`||a===`control`)n.ctrl=!0;else if(a===`alt`||a===`option`)n.alt=!0;else if(a===`shift`)n.shift=!0;else if([`meta`,`cmd`,`command`,`super`,`win`].includes(a))n.meta=!0;else return null}else{if(!i)return null;n.key=i.length===1?i.toUpperCase():Ef[i]??i}}return n}function Pf(){if(typeof navigator>`u`)return!1;let e=navigator.userAgentData?.platform??navigator.platform??``;return/mac|iphone|ipad|ipod/i.test(e)}function Ff(e,t=!1){return[...(t?[e.ctrl&&`⌃`,e.alt&&`⌥`,e.shift&&`⇧`,e.meta&&`⌘`]:[e.ctrl&&`Ctrl`,e.alt&&`Alt`,e.shift&&`Shift`,e.meta&&`Meta`]).filter(e=>!!e),Df[e.key]??e.key]}function If(e,t=!1){return[...(t?[e.ctrl&&`Control`,e.alt&&`Option`,e.shift&&`Shift`,e.meta&&`Command`]:[e.ctrl&&`Control`,e.alt&&`Alt`,e.shift&&`Shift`,e.meta&&`Meta`]).filter(Boolean),e.key===`+`?`Plus`:e.key.replace(/^Arrow/,`Arrow `)].join(` `)}function Lf(e,t,n=!1){let r=!e.ctrlKey&&!e.altKey&&!e.shiftKey&&!e.metaKey;if(!t)return r&&(e.key===`Backspace`||e.key===`Delete`)?{type:`clear`}:{type:`ignore`};if(r&&e.key===`Escape`)return{type:`cancel`,leave:!1};if(e.key===`Tab`&&!e.ctrlKey&&!e.altKey&&!e.metaKey)return{type:`cancel`,leave:!0};if(r&&(e.key===`Backspace`||e.key===`Delete`))return{type:`clear`};let i=Af(e);return i?n&&!jf(i)&&!/^F\d{1,2}$/.test(i.key)?{type:`needs-modifier`}:{type:`set`,hotkey:i}:{type:`pending`,held:{key:``,ctrl:!!e.ctrlKey,alt:!!e.altKey,shift:!!e.shiftKey,meta:!!e.metaKey}}}var Rf={placeholder:`Not set`,recording:`Press a shortcut`,clear:`Clear shortcut`,hint:`Press Escape to cancel, Backspace to remove.`,needsModifier:`Hold Ctrl, Alt or Meta with the key.`};function zf(e=`medium`,t=!1,n=!1){return Pn(e,B(`mh-hotkey`,t&&`is-recording`,n&&`is-disabled`))}function Bf(e,t,n,r,i=Rf.placeholder,a=Rf.recording){if(t){let e=n?Ff(n,r).filter(Boolean):[];return{caps:e,text:e.length?``:a,spoken:a,empty:!1}}let o=Nf(e);return o?{caps:Ff(o,r),text:``,spoken:If(o,r),empty:!1}:{caps:[],text:i,spoken:i,empty:!0}}function Vf(e,t){let n=t.caps.length?M(`span`,{class:`mh-hotkey__caps`,"aria-hidden":`true`},...t.caps.map(e=>M(`kbd`,{class:`mh-hotkey__cap`},e))):M(`span`,{class:B(`mh-hotkey__text`,t.empty&&`mh-hotkey__text--empty`),"aria-hidden":`true`},t.text);e.replaceChildren(M(`span`,{class:`mh-visually-hidden`},t.spoken),n)}function Hf(e){let t=e.appleSymbols??Pf(),n=I(`mh-hotkey-keys`),r=I(`mh-hotkey-hint`),i=Nf(e.value??``)?Mf(Nf(e.value??``)):``,a=!1,o=null,s=!1,c=!1,l=M(`span`,{class:`mh-hotkey__keys`,id:n}),u=e.label?null:M(`span`,{class:`mh-visually-hidden`,id:I(`mh-hotkey-name`)},e.ariaLabel??`Shortcut`),d=M(`button`,{type:`button`,class:`mh-input__control mh-hotkey__control`},u,l),f=e.name?M(`input`,{type:`hidden`,name:e.name}):null,p=M(`span`,{class:`mh-visually-hidden`,id:r},Rf.hint),m=e.clearLabel??Rf.clear,h=e.clearable===!1?null:M(`button`,{type:`button`,class:B(yf,`mh-hotkey__clear`),"aria-label":m,title:m},H(Hr)),g=M(`span`,{class:`mh-visually-hidden`,role:`status`}),_=M(`div`,{class:zf(e.size)},d,h,p,g,f),v=e.label?pn({label:e.label,control:_,target:d,helper:e.helper,error:e.error,required:e.required,labelStyle:e.labelStyle}):null;d.setAttribute(`aria-labelledby`,`${v?v.label.id:u.id} ${n}`);let y=()=>{let e=d.getAttribute(`aria-describedby`)?.split(` `).filter(e=>e&&e!==r)??[];d.setAttribute(`aria-describedby`,[...e,r].join(` `))},b=()=>{_.className=zf(e.size,a,s),Vf(l,Bf(i,a,o,t,e.placeholder,e.recordingText)),f&&(f.value=i),d.disabled=s,h&&(h.hidden=i===``||a||s),y()},x=e=>{g.textContent=e},S=()=>{a=!1,o=null,b()},C=()=>{s||a||(a=!0,o=null,b(),x(`${e.recordingText??Rf.recording}. ${Rf.hint}`))},w=t=>{let n=t!==i;i=t,S(),n&&e.onChange?.(i)};d.addEventListener(`click`,()=>{a||C()}),d.addEventListener(`blur`,()=>{a&&S()}),d.addEventListener(`keydown`,n=>{let r=Lf(n,a,e.requireModifier);switch(r.type){case`ignore`:return;case`cancel`:r.leave||n.preventDefault(),n.stopPropagation(),S(),x(``);return;case`clear`:n.preventDefault(),n.stopPropagation(),c=!0,w(``),x(a?``:m);return;case`pending`:n.preventDefault(),n.stopPropagation(),o=r.held,Vf(l,Bf(i,!0,o,t,e.placeholder,e.recordingText));return;case`needs-modifier`:n.preventDefault(),n.stopPropagation(),x(Rf.needsModifier);return;case`set`:n.preventDefault(),n.stopPropagation(),c=!0,w(Mf(r.hotkey)),x(If(r.hotkey,t));return}}),d.addEventListener(`keyup`,n=>{c?(n.preventDefault(),c=!1):a&&Of(n.key)&&(o={key:``,ctrl:n.ctrlKey,alt:n.altKey,shift:n.shiftKey,meta:n.metaKey},Vf(l,Bf(i,!0,o,t,e.placeholder,e.recordingText)))}),h?.addEventListener(`click`,()=>{w(``),x(m),d.focus()});let T={el:v?.el??_,control:d,field:v,getValue:()=>i,setValue(e){let t=Nf(e);i=t?Mf(t):``,S()},isRecording:()=>a,startRecording:C,cancelRecording:S,setError(e){v?.setError(e),y()},setDisabled(e){s=e,e&&(a=!1),v?.setDisabled(e),b()}};return b(),e.disabled&&T.setDisabled(!0),T}function Uf(e,t,n=8){let r=Zd(t);if(r===``)return[];let i=[],a=[];for(let t of e){let e=Zd(t.value);e!==r&&(e.startsWith(r)?i.push(t):(e.includes(r)||t.description&&Zd(t.description).includes(r))&&a.push(t))}return[...i,...a].slice(0,n)}function Wf(e,t,n=8){return e?typeof e==`function`?e(t).slice(0,n):Uf(e,t,n):[]}function Gf(e,t,n=50){return t.trim()===``||e.at(-1)===t?[...e]:[...e,t].slice(-n)}function Kf(e,t,n){return n===`ArrowUp`?Math.min(t+1,e-1):Math.max(t-1,-1)}function qf(e=!1,t=!1,n=!1){return B(`mh-command-bar`,n&&`mh-command-bar--up`,e&&`is-open`,t&&`is-disabled`)}var Jf=(e=`medium`)=>Pn(e,`mh-command-bar__box`);function Yf(e={}){let t=I(`mh-command-list`),n=e.maxSuggestions??8,r=e.historySize??50,i=e.suggestions,a=[...e.history??[]].slice(-r),o=-1,s=``,c=[],l=-1,u=!1,d=M(`input`,{class:`mh-input__control mh-command-bar__input`,type:`text`,name:e.name,placeholder:e.placeholder,role:`combobox`,"aria-label":e.ariaLabel??`Command`,"aria-autocomplete":`list`,"aria-expanded":`false`,"aria-controls":t,autocomplete:`off`,autocapitalize:`off`,spellcheck:`false`,enterkeyhint:`go`});d.value=e.value??``;let f=M(`div`,{class:Jf(e.size)},M(`span`,{class:`mh-input__adornment mh-command-bar__prompt`,"aria-hidden":`true`},e.prompt??`>`),d),p=M(`ul`,{class:`mh-command-bar__list`,id:t,role:`listbox`,"aria-label":e.listLabel??`Suggestions`,hidden:!0}),m=M(`div`,{class:qf(!1,!1,e.openUp)},f,p);nn(f,d);let h=e=>`${t}-${e}`,g=()=>{let t=c.length>0&&!u;p.hidden=!t,d.setAttribute(`aria-expanded`,String(t)),m.className=qf(t,u,e.openUp),p.replaceChildren(...c.map((e,t)=>{let n=M(`li`,{class:B(`mh-command-bar__option`,t===l&&`is-active`),id:h(t),role:`option`,"aria-selected":String(t===l)},M(`span`,{class:`mh-command-bar__value`},e.value),e.description?M(`span`,{class:`mh-command-bar__description`},e.description):null);return n.addEventListener(`mousedown`,e=>e.preventDefault()),n.addEventListener(`click`,()=>b(e)),n})),t&&l>=0?(d.setAttribute(`aria-activedescendant`,h(l)),ef(p.children[l])):d.removeAttribute(`aria-activedescendant`)},_=()=>{c=Wf(i,d.value,n),l=-1,g()},v=()=>{c=[],l=-1,g()},y=t=>{d.value=t,d.setSelectionRange?.(t.length,t.length),e.onInput?.(t)},b=e=>{y(e.value),v(),d.focus()},x=()=>{let t=d.value;u||t.trim()===``||(a=Gf(a,t,r),o=-1,s=``,v(),e.onSubmit?.(t),(e.clearOnSubmit??!0)&&y(``))};d.addEventListener(`input`,()=>{o=-1,_(),e.onInput?.(d.value)}),d.addEventListener(`blur`,v),d.addEventListener(`keydown`,e=>{if(e.isComposing)return;let t=c.length>0;switch(e.key){case`ArrowDown`:case`ArrowUp`:{if(e.altKey)return;if(e.preventDefault(),t){let t=c.length;l=e.key===`ArrowDown`?(l+1)%t:l<=0?t-1:l-1,g();return}if(a.length===0)return;let n=Kf(a.length,o,e.key);if(n===o)return;o===-1&&(s=d.value),o=n,y(n===-1?s:a[a.length-1-n]);return}case`Tab`:if(!t||e.shiftKey)return;e.preventDefault(),b(c[Math.max(l,0)]);return;case`Enter`:e.preventDefault(),t&&l>=0?b(c[l]):x();return;case`Escape`:t?(e.preventDefault(),e.stopPropagation(),v()):d.value!==``&&(e.preventDefault(),e.stopPropagation(),o=-1,y(``));return}});let S={el:m,input:d,list:p,getValue:()=>d.value,setValue(e){d.value=e,o=-1,v()},setSuggestions(e){i=e,document.activeElement===d&&_()},getHistory:()=>[...a],setHistory(e){a=[...e].slice(-r),o=-1},submit:x,focus:()=>d.focus(),setDisabled(e){u=e,d.disabled=e,f.classList.toggle(`is-disabled`,e),e?v():g()}};return e.disabled&&S.setDisabled(!0),S}var Xf={d:86400,h:3600,m:60,s:1},Zf=[`d`,`h`,`m`,`s`],Qf={d:`d`,day:`d`,days:`d`,h:`h`,hr:`h`,hrs:`h`,hour:`h`,hours:`h`,m:`m`,min:`m`,mins:`m`,minute:`m`,minutes:`m`,s:`s`,sec:`s`,secs:`s`,second:`s`,seconds:`s`},$f={d:[`day`,`days`],h:[`hour`,`hours`],m:[`minute`,`minutes`],s:[`second`,`seconds`]};function ep(e,t=`m`){let n=e.trim().toLowerCase();if(n===``)return null;let r=/^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/.exec(n);if(r)return Number(r[1])*3600+Number(r[2])*60+Number(r[3]??0);let i=n.replace(/\band\b/g,` `).replace(/,(?=\s|$)/g,` `),a=/^\s*(\d+(?:[.,]\d+)?|[.,]\d+)\s*([a-z]*)\s*/,o=i,s=0,c=-1;for(;o.trim()!==``;){let e=a.exec(o);if(!e)return null;o=o.slice(e[0].length);let n=Number(e[1].replace(`,`,`.`)),r;if(r=e[2]?Qf[e[2]]:c===-1?t:Zf[c+1],!r)return null;let i=Zf.indexOf(r);if(i<=c)return null;c=i,s+=n*Xf[r]}return Math.round(s)}function tp(e){let t=Math.max(0,Math.round(e)),n=[];for(let e of Zf){let r=Math.floor(t/Xf[e]);t-=r*Xf[e],r>0&&n.push([r,e])}return n}function np(e,t=`short`){let n=tp(e);return n.length===0?t===`short`?`0m`:`0 minutes`:n.map(([e,n])=>t===`short`?`${e}${n}`:`${e} ${$f[n][e===1?0:1]}`).join(` `)}function rp(e,t,n,r=ip){if(t.trim()===``)return n.required?r.required:void 0;if(e===null)return r.invalid;if(n.min!==void 0&&e<n.min)return`${r.min} ${np(n.min,`long`)}.`;if(n.max!==void 0&&e>n.max)return`${r.max} ${np(n.max,`long`)}.`}var ip={invalid:`Enter a duration like 1h 30m.`,required:`Enter a duration.`,min:`At least`,max:`At most`,placeholder:`e.g. 1h 30m`,presets:`Quick picks`};function ap(e,t=`m`){let n=ep(e,t);return n===null||e.trim()===np(n)?``:np(n,`long`)}function op(e=`medium`,t=!1){return Pn(e,B(`mh-duration__box`,t&&`is-disabled`))}var sp=lt;function cp(e){let t=e.defaultUnit??`m`,n={...ip,...e.messages},r=e.value??null,i,a=!1,o=M(`input`,{class:`mh-input__control`,type:`text`,name:e.name,placeholder:e.placeholder??ip.placeholder,autocomplete:`off`,spellcheck:`false`,autocapitalize:`off`,enterkeyhint:`done`,"aria-label":e.label?void 0:e.ariaLabel});o.value=r===null?``:np(r);let s=M(`span`,{class:`mh-input__adornment mh-input__adornment--end mh-duration__preview`,"aria-hidden":`true`}),c=e.icon===!1?null:Kn(H(e.icon??sp)),l=M(`div`,{class:op(e.size)},c,o,s);nn(l,o);let u=(e.presets??[]).map(e=>{let t=M(`button`,{type:`button`,class:`mh-duration__preset`,"aria-pressed":`false`,title:np(e,`long`)},np(e));return t.addEventListener(`click`,()=>{o.value=np(e),h()}),{seconds:e,b:t}}),d=u.length?M(`div`,{class:`mh-duration__presets`,role:`group`,"aria-label":e.presetsLabel??ip.presets},...u.map(e=>e.b)):null,f=M(`div`,{class:`mh-duration`},l,d),p=e.label?pn({label:e.label,control:f,target:o,helper:e.helper,error:e.error,required:e.required,labelStyle:e.labelStyle}):null,m=()=>{s.textContent=ap(o.value,t);for(let e of u)e.b.setAttribute(`aria-pressed`,String(e.seconds===r)),e.b.disabled=a;p?.setError(i??e.error)};function h(){let a=ep(o.value,t);if(i=rp(a,o.value,e,n),!i){let t=o.value.trim()===``?null:a;t!==null&&(o.value=np(t)),t!==r&&(r=t,e.onChange?.(r))}m()}o.addEventListener(`input`,()=>{s.textContent=ap(o.value,t)}),o.addEventListener(`change`,h),o.addEventListener(`keydown`,e=>{e.key===`Enter`&&!e.isComposing&&h()});let g={el:p?.el??f,input:o,field:p,getValue:()=>r,setValue(e){r=e,i=void 0,o.value=e===null?``:np(e),m()},setError(e){i=e,m()},setDisabled(e){a=e,o.disabled=e,l.classList.toggle(`is-disabled`,e),p?.setDisabled(e),m()}};return m(),e.disabled&&g.setDisabled(!0),g}var lp=e=>`options`in e;function up(e){return e.flatMap(e=>lp(e)?[...e.options]:[e])}function dp(e,t){let n=e=>Qd(`${e.label} ${e.description??``}`,t),r=[];for(let t of e)if(lp(t)){let e=t.options.filter(n);e.length&&r.push({label:t.label,options:e})}else n(t)&&r.push(t);return r}function fp(e,t){return e.includes(t)?e.filter(e=>e!==t):[...e,t]}function pp(e,t,n){return`${e}-${up(t).findIndex(e=>e.value===n)}`}function mp(e=!1,t=!1){return B(`mh-multi-select`,e&&`is-open`,t&&`is-disabled`)}var hp=(e=`medium`,t=!1)=>Pn(e,B(`mh-multi-select__box`,t&&`is-disabled`)),gp={empty:`No matches`,added:`added`,removed:`removed`},_p=(e,t)=>`${e} ${t?gp.added:gp.removed}`;function vp(e){let t=I(`mh-multi-list`),n=e.options,r=[...e.values??[]],i=``,a=!1,o=null,s=!1,c=M(`input`,{class:`mh-input__control mh-multi-select__input`,type:`text`,role:`combobox`,"aria-autocomplete":`list`,"aria-expanded":`false`,"aria-controls":t,"aria-haspopup":`listbox`,autocomplete:`off`,spellcheck:`false`,"aria-label":e.label?void 0:e.ariaLabel}),l=M(`span`,{class:`mh-multi-select__chips`}),u=M(`div`,{class:hp(e.size)},l,c,M(`span`,{class:`mh-multi-select__chevron`},H(Yn))),d=M(`div`,{class:`mh-multi-select__list`,id:t,role:`listbox`,"aria-multiselectable":`true`,"aria-label":e.label??e.ariaLabel}),f=M(`p`,{class:`mh-multi-select__empty`},e.emptyText??gp.empty),p=M(`div`,{class:`mh-multi-select__popup`,hidden:!0},d,f),m=M(`span`,{class:`mh-visually-hidden`,role:`status`}),h=M(`span`,{hidden:!0}),g=M(`div`,{class:mp()},u,p,m,e.name?h:null),_=e.label?pn({label:e.label,control:g,target:c,helper:e.helper,error:e.error,required:e.required,labelStyle:e.labelStyle}):null;e.required&&(c.required=!1,c.setAttribute(`aria-required`,`true`));let v=()=>up(n),y=()=>up(dp(n,i)),b=e=>v().find(t=>t.value===e),x=e=>{let i=r.includes(e.value),a=M(`div`,{class:B(`mh-multi-select__option`,e.value===o&&`is-active`),id:pp(t,n,e.value),role:`option`,"aria-selected":String(i),"aria-disabled":e.disabled?`true`:void 0},M(`span`,{class:`mh-multi-select__check`},H(Wt)),e.icon?H(e.icon,{class:`mh-multi-select__icon`}):null,M(`span`,{class:`mh-multi-select__text`},M(`span`,{class:`mh-multi-select__label`},e.label),e.description?M(`span`,{class:`mh-multi-select__description`},e.description):null));return a.addEventListener(`click`,()=>{e.disabled||(o=e.value,C(e.value))}),a},S=()=>{l.replaceChildren(...r.map(e=>{let t=b(e),n=li({label:t?.label??e,icon:t?.icon,removable:!0,disabled:s});return n.button?.addEventListener(`click`,t=>{t.stopPropagation(),C(e),c.focus()}),n.el}));let m=dp(n,i);d.replaceChildren(...m.map((e,n)=>{if(!lp(e))return x(e);let r=`${t}-g${n}`;return M(`div`,{class:`mh-multi-select__group`,role:`group`,"aria-labelledby":r},M(`div`,{class:`mh-multi-select__group-label`,id:r,role:`presentation`},e.label),...e.options.map(x))})),f.hidden=m.length>0;let _=a&&!s;if(p.hidden=!_,g.className=mp(_,s),u.className=hp(e.size,s),c.setAttribute(`aria-expanded`,String(_)),c.placeholder=r.length===0&&e.placeholder?e.placeholder:``,c.placeholder||c.removeAttribute(`placeholder`),_&&o!==null&&y().some(e=>e.value===o)){let e=pp(t,n,o);c.setAttribute(`aria-activedescendant`,e),ef(d.querySelector(`[id="${e}"]`))}else c.removeAttribute(`aria-activedescendant`);e.name&&h.replaceChildren(...r.map(t=>M(`input`,{type:`hidden`,name:e.name,value:t})))},C=t=>{let n=b(t);if(!n||s)return;let a=!r.includes(t);r=fp(r,t),i&&(i=``,c.value=``),m.textContent=_p(n.label,a),S(),e.onChange?.([...r])},w=e=>{g.contains(e.target)||T(!1)},T=(e,t=`keep`)=>{if(s&&(e=!1),e&&!a&&document.addEventListener(`pointerdown`,w,!0),!e&&a&&document.removeEventListener(`pointerdown`,w,!0),a=e,e){let e=y();(t!==`keep`||!e.some(e=>e.value===o))&&(o=e[t===`last`?$d(e,e.length,-1):$d(e,-1,1)]?.value??null)}S()},E=e=>{let t=y();o=t[$d(t,t.findIndex(e=>e.value===o),e,!0)]?.value??o,S()};u.addEventListener(`mousedown`,e=>{e.target.closest(`button`)||s||(e.target!==c&&e.preventDefault(),c.focus(),T(!a))}),p.addEventListener(`mousedown`,e=>e.preventDefault()),c.addEventListener(`input`,()=>{i=c.value;let e=y();o=e[$d(e,-1,1)]?.value??null,T(!0,`keep`)}),c.addEventListener(`keydown`,e=>{if(!(e.isComposing||s))switch(e.key){case`ArrowDown`:e.preventDefault(),a?E(1):T(!0,`first`);return;case`ArrowUp`:e.preventDefault(),e.altKey?T(!1):a?E(-1):T(!0,`last`);return;case`Enter`:if(!a)return;e.preventDefault(),o!==null&&!b(o)?.disabled&&C(o);return;case`Escape`:a?(e.preventDefault(),e.stopPropagation(),T(!1)):i&&(e.preventDefault(),e.stopPropagation(),i=``,c.value=``,S());return;case`Backspace`:c.value===``&&r.length>0&&(e.preventDefault(),C(r.at(-1)));return;case`Tab`:T(!1);return}}),g.addEventListener(`focusout`,e=>{g.contains(e.relatedTarget)||(i&&(i=``,c.value=``),T(!1))});let D={el:_?.el??g,input:c,list:d,field:_,getValues:()=>[...r],setValues(e){r=[...e],S()},setOptions(e){n=e,S()},open:()=>T(!0),close:()=>T(!1),setError:e=>_?.setError(e),setDisabled(e){s=e,c.disabled=e,_?.setDisabled(e),e?T(!1):S()}};return S(),e.disabled&&D.setDisabled(!0),D}var yp={source:`Available`,target:`Selected`,empty:`Nothing here`,filter:`Filter`,moveSelected:e=>`Move selected to ${e}`,moveAll:e=>`Move all to ${e}`,moved:(e,t)=>`${e} moved to ${t}`};function bp(e,t,n,r=``){let i=new Set(t);return e.filter(e=>i.has(e.value)===(n===`target`)&&Qd(`${e.label} ${e.description??``}`,r))}function xp(e,t,n,r){let i=new Set(t),a=new Set(e.filter(e=>!e.disabled).map(e=>e.value));for(let e of n)a.has(e)&&(r===`target`?i.add(e):i.delete(e));return e.filter(e=>i.has(e.value)).map(e=>e.value)}function Sp(e,t){let n=new Set(t);return e.filter(e=>n.has(e.value)).map(e=>e.value)}var Cp=(e,t)=>e>0?`${e}/${t}`:String(t);function wp(e,t,n){let r=!!e.shiftKey;switch(e.key){case`ArrowDown`:return{type:`move-active`,index:$d(t,n,1),extend:r};case`ArrowUp`:return{type:`move-active`,index:$d(t,n<0?t.length:n,-1),extend:r};case`Home`:return{type:`move-active`,index:$d(t,-1,1),extend:!1};case`End`:return{type:`move-active`,index:$d(t,t.length,-1),extend:!1};case` `:return{type:`toggle`};case`Enter`:return{type:`transfer`};case`a`:case`A`:return e.ctrlKey||e.metaKey?{type:`select-all`}:{type:`none`};default:return{type:`none`}}}var Tp=(e=!1)=>B(`mh-transfer`,e&&`is-disabled`),Ep={one:{target:hn,source:In},all:{target:an,source:Yt}},Dp=B(l(`default`,`medium`,!0),`mh-transfer__move`);function Op(e){let t=I(`mh-transfer`),n=e.items,r=Sp(n,e.values??[]),i=!1,a=M(`span`,{class:`mh-visually-hidden`,role:`status`}),o=n=>{let r=n===`source`?e.sourceLabel??yp.source:e.targetLabel??yp.target,i=`${t}-${n}-title`,a=M(`div`,{class:`mh-transfer__list`,id:`${t}-${n}`,role:`listbox`,"aria-multiselectable":`true`,"aria-labelledby":i,tabindex:`0`}),o=M(`span`,{class:`mh-transfer__count`}),s=M(`p`,{class:`mh-transfer__empty`,id:`${t}-${n}-empty`},e.emptyText??yp.empty),c={side:n,title:r,list:a,count:o,empty:s,query:``,selected:new Set,active:null,anchor:-1},l=e.searchable?Rd({size:`small`,label:`${yp.filter} ${r}`,placeholder:yp.filter,onInput:e=>{c.query=e,C()}}):null,u=M(`div`,{class:B(`mh-transfer__panel`,`mh-transfer__panel--${n}`)},M(`div`,{class:`mh-transfer__head`},M(`span`,{class:`mh-transfer__title`,id:i},r),o),l?M(`div`,{class:`mh-transfer__filter`},l.el):null,a,s);return a.addEventListener(`keydown`,e=>D(c,e)),a.addEventListener(`focus`,()=>{let e=d(c);(c.active===null||!e.some(e=>e.value===c.active))&&(c.active=e[$d(e,-1,1)]?.value??null,C())}),{panel:c,el:u}},s=o(`source`),c=o(`target`),l=[s.panel,c.panel],u=e=>e===s.panel?c.panel:s.panel,d=e=>bp(n,r,e.side,e.query),f=(e,t,n)=>{let r=M(`button`,{type:`button`,class:Dp,"aria-label":e,title:e},H(t));return r.addEventListener(`click`,n),r},p=s.panel.title,m=c.panel.title,h=f(yp.moveSelected(m),Ep.one.target,()=>E(s.panel,!1)),g=f(yp.moveAll(m),Ep.all.target,()=>E(s.panel,!0)),_=f(yp.moveSelected(p),Ep.one.source,()=>E(c.panel,!1)),v=f(yp.moveAll(p),Ep.all.source,()=>E(c.panel,!0)),y=M(`div`,{class:`mh-transfer__actions`},h,g,_,v),b=M(`div`,{class:Tp(),role:`group`,"aria-label":e.label?void 0:e.ariaLabel},M(`div`,{class:`mh-transfer__layout`},s.el,y,c.el),a),x=e.label?pn({label:e.label,control:b,target:b,helper:e.helper,error:e.error,labelStyle:e.labelStyle}):null,S=e=>{let t=d(e);for(let n of[...e.selected])t.some(e=>e.value===n)||e.selected.delete(n);if(e.active!==null&&!t.some(t=>t.value===e.active)&&(e.active=null),e.list.replaceChildren(...t.map((r,a)=>{let o=M(`div`,{class:B(`mh-transfer__option`,r.value===e.active&&`is-active`),id:`${e.list.id}-${n.indexOf(r)}`,role:`option`,"aria-selected":String(e.selected.has(r.value)),"aria-disabled":r.disabled?`true`:void 0},M(`span`,{class:`mh-transfer__check`},H(Wt)),r.icon?H(r.icon,{class:`mh-transfer__icon`}):null,M(`span`,{class:`mh-transfer__text`},M(`span`,{class:`mh-transfer__label`},r.label),r.description?M(`span`,{class:`mh-transfer__description`},r.description):null));return o.addEventListener(`mousedown`,t=>{t.preventDefault(),e.list.focus()}),o.addEventListener(`click`,n=>{i||r.disabled||(e.active=r.value,n.shiftKey&&e.anchor>=0?T(e,t,e.anchor,a):(w(e,r.value),e.anchor=a),C())}),o.addEventListener(`dblclick`,()=>{i||r.disabled||(e.selected=new Set([r.value]),E(e,!1))}),o})),e.empty.hidden=t.length>0,t.length===0?e.list.setAttribute(`aria-describedby`,e.empty.id):e.list.removeAttribute(`aria-describedby`),e.count.textContent=Cp(e.selected.size,t.length),e.list.tabIndex=i?-1:0,i?e.list.setAttribute(`aria-disabled`,`true`):e.list.removeAttribute(`aria-disabled`),e.active!==null){let t=`${e.list.id}-${n.findIndex(t=>t.value===e.active)}`;e.list.setAttribute(`aria-activedescendant`,t),ef(e.list.querySelector(`[id="${t}"]`))}else e.list.removeAttribute(`aria-activedescendant`)},C=()=>{for(let e of l)S(e);b.className=Tp(i);let e=(e,t)=>d(e).some(n=>!n.disabled&&(!t||e.selected.has(n.value)));h.disabled=i||!e(s.panel,!0),g.disabled=i||!e(s.panel,!1),_.disabled=i||!e(c.panel,!0),v.disabled=i||!e(c.panel,!1)},w=(e,t)=>{e.selected.has(t)?e.selected.delete(t):e.selected.add(t)},T=(e,t,n,r)=>{let[i,a]=n<r?[n,r]:[r,n];for(let n=i;n<=a;n++)t[n].disabled||e.selected.add(t[n].value)};function E(t,o){if(i)return;let s=d(t),c=s.filter(e=>!e.disabled&&(o||t.selected.has(e.value))).map(e=>e.value);if(c.length===0)return;let l=u(t),f=s.findIndex(e=>e.value===t.active);r=xp(n,r,c,l.side),t.selected.clear(),t.anchor=-1;let p=d(t);t.active=p.length?p[Math.min(Math.max(f,0),p.length-1)].value:null,a.textContent=yp.moved(c.length,l.title),C(),e.onChange?.([...r])}function D(e,t){if(i)return;let n=d(e),r=n.findIndex(t=>t.value===e.active),a=wp(t,n,r);if(a.type!==`none`){switch(t.preventDefault(),a.type){case`move-active`:{let t=n[a.index];if(!t)return;e.active=t.value,a.extend&&(r>=0&&!n[r].disabled&&e.selected.add(n[r].value),t.disabled||e.selected.add(t.value));break}case`toggle`:r>=0&&!n[r].disabled&&(w(e,n[r].value),e.anchor=r);break;case`select-all`:{let t=n.filter(e=>!e.disabled);e.selected=t.every(t=>e.selected.has(t.value))?new Set:new Set(t.map(e=>e.value));break}case`transfer`:e.selected.size===0&&r>=0&&e.selected.add(n[r].value),E(e,!1);return}C()}}let O={el:x?.el??b,field:x,lists:{source:s.panel.list,target:c.panel.list},getValues:()=>[...r],setValues(e){r=Sp(n,e),C()},setItems(e){n=e,r=Sp(n,r),C()},setDisabled(e){i=e,x?.setDisabled(e),C()}};return C(),e.disabled&&O.setDisabled(!0),O}var kp=e=>M(`p`,{class:`mh-text--caption mh-text--muted`,"aria-live":`polite`},e),Ap=(...e)=>M(`div`,{class:`ex-stack`,style:`max-width: 420px`},...e),jp=(...e)=>M(`div`,{class:`ex-row`},...e),Mp=[{id:`field`,render:()=>{let e=(e,t=``)=>qt({ariaLabel:e,placeholder:e,value:t}).el,t=pn({label:`Display name`,control:e(`Living room`,`Living room`),helper:`Shown on the dashboard.`}),n=pn({label:`Address`,control:e(`192.0.2.10`,`not an address`),error:`Enter an address like 192.0.2.10.`,required:!0}),r=pn({label:`Update interval`,control:e(`Seconds`,`30`),success:`Saved.`}),i=Fd({label:`Guests`,value:2,max:12}),a=pn({label:`Guests`,control:i.el,target:i.spinbutton,helper:`Any control can sit in a field.`,labelStyle:`eyebrow`}),o=qt({label:`Room`,placeholder:`Type at least three letters`,helper:`Validated as you leave the field.`});return o.input.addEventListener(`change`,()=>o.setError(o.getValue().length<3?`At least three letters.`:void 0)),Ap(t.el,n.el,r.el,o.el,a.el)}},{id:`text-field`,render:()=>Ap(qt({label:`Room name`,placeholder:`e.g. Kitchen`,helper:`Shown on tiles and in voice replies.`}).el,qt({label:`Search radius`,type:`number`,value:`25`,suffix:`km`,icon:`home`,labelStyle:`eyebrow`}).el,qt({label:`Price`,prefix:`€`,value:`12.50`,inputMode:`decimal`}).el,qt({label:`Scene name`,value:`Evening`,maxLength:24,showCount:!0}).el,qt({label:`Email`,type:`email`,value:`someone@`,error:`Enter a full email address.`,required:!0}).el,qt({label:`Location`,value:`Hallway`,success:`Name is available.`}).el,jp(qt({ariaLabel:`Small`,placeholder:`Small`,size:`small`}).el,qt({ariaLabel:`Large`,placeholder:`Large`,size:`large`}).el),qt({label:`Device id`,value:`sensor-04`,disabled:!0}).el)},{id:`text-area`,render:()=>Ap(Bd({label:`Notes`,placeholder:`Anything to remember about this room`,helper:`Grows as you type, up to six lines.`,maxRows:6}).el,Bd({label:`Announcement`,value:`Dinner is ready in ten minutes.`,maxLength:140,showCount:!0,rows:2}).el,Bd({label:`Message`,value:``,error:`Write a message before sending.`,required:!0}).el,Bd({label:`Read only`,value:`This text cannot be changed.`,readOnly:!0,rows:1}).el)},{id:`search-field`,render:()=>{let e=M(`p`,{class:`mh-text--caption mh-text--muted`,"aria-live":`polite`},`Type and press Enter; Escape clears.`);return Ap(Rd({placeholder:`Search rooms and devices`,onSearch:t=>e.textContent=`Searching for “${t}”`,onClear:()=>e.textContent=`Cleared.`}).el,e,Rd({placeholder:`Filter`,value:`Lamp`,size:`small`}).el,Rd({placeholder:`Search`,size:`large`}).el,Rd({placeholder:`Unavailable`,disabled:!0}).el)}},{id:`select`,render:()=>Ap(vr({label:`Room`,placeholder:`Choose a room`,options:[{value:`living`,label:`Living room`},{value:`kitchen`,label:`Kitchen`},{value:`bedroom`,label:`Bedroom`},{value:`garage`,label:`Garage`,disabled:!0}],helper:`A styled native select: the platform draws the list.`}).el,vr({label:`Scene`,value:`relax`,options:[{label:`Daytime`,options:[{value:`bright`,label:`Bright`},{value:`focus`,label:`Focus`}]},{label:`Evening`,options:[{value:`relax`,label:`Relax`},{value:`night`,label:`Night light`}]}],labelStyle:`eyebrow`}).el,vr({label:`Mode`,options:[{value:`auto`,label:`Auto`}],error:`This mode is not supported.`,value:`auto`}).el,jp(vr({ariaLabel:`Size`,size:`small`,options:[{value:`s`,label:`Small`}]}).el,vr({ariaLabel:`Size`,disabled:!0,options:[{value:`d`,label:`Disabled`}]}).el))},{id:`composer`,render:()=>{let e=e=>C(e,{variant:`label`,tone:`muted`}),t=M(`ol`,{class:`ex-stack`,style:`margin: 0; padding-left: var(--mh-space-lg)`,"aria-live":`polite`}),n=Yd({placeholder:`Ask about your home`,leading:Hd(`attach`).el,trailing:[Hd(`mic`).el,Hd(`send`,{onClick:()=>n.submit()}).el],suggestions:[`Turn off all lights`,`Is the back door locked?`,`Warmer in the kitchen`],onSuggestion:e=>{n.setValue(e),n.focus()},onSubmit:e=>{t.append(M(`li`,{},e)),n.setValue(``),n.focus()}}),r=Yd({placeholder:`When the sun sets, dim the living room`,mode:{label:`Automation`,hint:`Describe when and what should happen`,icon:`lightbulb`,onClear:()=>{r.setMode(null),r.setPlaceholder(`Message`)}},trailing:Hd(`send`).el,enterSends:`always`}),i=Yd({placeholder:`Message`,disabled:!0,disabledReason:`Not connected to Home Assistant.`,onRetry:()=>i.setDisabled(!1),trailing:Hd(`send`,{disabled:!0}).el}),a=Yd({placeholder:`Message`,leading:Hd(`attach`).el,trailing:Hd(`voice`).el,enterSends:`never`});return Ap(e(`Enter sends on a mouse or trackpad and is a new line on touch screens; Shift+Enter is always a new line.`),t,n.el,e(`Mode chip; Enter always sends`),r.el,e(`Disabled with a reason and retry`),i.el,e(`Voice instead of send; Enter never sends`),a.el)}},{id:`number-input`,render:()=>{let e=kp(`Arrow keys step, Page Up/Down take big steps, hold a button to repeat, drag the unit sideways to scrub.`);return Ap(_f({label:`Target temperature`,value:21.5,min:7,max:30,step:.5,unit:`°C`,helper:`Between 7 and 30 °C.`,onChange:t=>e.textContent=`Set to ${t} °C`}).el,e,_f({label:`Brightness`,value:60,min:0,max:100,step:5,unit:`%`,labelStyle:`eyebrow`}).el,_f({label:`Offset`,value:-2,min:-10,max:10,scrub:!0,helper:`No unit: a grip scrubs instead.`}).el,_f({label:`Budget`,value:40,min:0,step:10,prefix:`€`,scrub:!1,valueText:e=>`${e} euros`}).el,_f({label:`Guests`,value:12,max:12,error:`The table seats 12 at most.`}).el,jp(_f({ariaLabel:`Small`,value:3,size:`small`,min:0,max:9}).el,_f({ariaLabel:`Large`,value:3,size:`large`,min:0,max:9}).el),_f({label:`Locked`,value:5,disabled:!0,unit:`min`}).el)}},{id:`secret-field`,render:()=>Ap(wf({label:`Password`,placeholder:`Your password`,helper:`The eye shows what you typed.`}).el,wf({label:`New password`,kind:`new-password`,value:`correct-lantern-quay`,required:!0,success:`Strong password.`}).el,wf({label:`Access token`,kind:`key`,value:`tkn_8f2c41d9b7e05a63c1f4`,readOnly:!0,helper:`Copy it now: it is shown only once.`}).el,wf({label:`API key`,kind:`key`,placeholder:`Paste the key`,icon:`lock`,error:`That key was not accepted.`,value:`abc`}).el,wf({label:`Wi-Fi password`,value:`hidden-meadow-42`,disabled:!0}).el)},{id:`hotkey-field`,render:()=>{let e=kp(`Press a field, then a key combination. Escape cancels, Backspace removes.`);return Ap(Hf({label:`Open search`,value:`Ctrl+K`,onChange:t=>e.textContent=t?`Open search: ${t}`:`Open search: none`,helper:`Pressed anywhere on the dashboard.`}).el,e,Hf({label:`Toggle all lights`,value:`Ctrl+Shift+L`,appleSymbols:!0,helper:`Shown with Apple symbols.`}).el,Hf({label:`Next page`,requireModifier:!1,value:`ArrowRight`,labelStyle:`eyebrow`}).el,Hf({label:`Mute`,placeholder:`Press to set`,requireModifier:!0,helper:`Needs Ctrl, Alt or Meta.`}).el,Hf({label:`Locked shortcut`,value:`Alt+F4`,disabled:!0}).el)}},{id:`command-bar`,render:()=>{let e=[{value:`lights on`,description:`Turn on the lights in a room`},{value:`lights off`,description:`Turn off the lights in a room`},{value:`scene evening`,description:`Dim everything to warm white`},{value:`scene away`,description:`Lights off, heating down`},{value:`heating set`,description:`Set a room temperature`},{value:`status`,description:`Summary of the home`},{value:`help`,description:`List the commands`}],t=M(`pre`,{class:`mh-text--caption`,style:`margin: 0; min-height: 4lh; font-family: var(--mh-font-mono); white-space: pre-wrap`,"aria-live":`polite`},``),n=Yf({placeholder:`Type a command`,suggestions:e,history:[`status`,`lights on kitchen`],onSubmit:e=>t.textContent=`${t.textContent}> ${e}\nok\n`.split(`
`).slice(-8).join(`
`)}),r=Yf({placeholder:`Opens upward`,suggestions:e,openUp:!0,prompt:`$`,size:`small`});return Ap(kp(`Suggestions as you type: arrows pick, Tab completes, Enter runs. Arrow Up recalls earlier commands.`),t,n.el,M(`div`,{style:`height: 220px`}),r.el,Yf({placeholder:`Offline`,disabled:!0}).el)}},{id:`duration-field`,render:()=>{let e=kp(`Try 90, 1h 30, 1.5h, 2 hours 5 minutes or 0:45.`);return Ap(cp({label:`Timer`,value:1500,presets:[300,600,900,1800,3600],helper:`A number alone is minutes.`,onChange:t=>e.textContent=t===null?`No timer`:`Timer: ${np(t,`long`)}`}).el,e,cp({label:`Keep lights on for`,min:60,max:14400,placeholder:`Between 1m and 4h`,labelStyle:`eyebrow`}).el,cp({label:`Delay`,defaultUnit:`s`,value:45,helper:`A number alone is seconds.`,icon:!1}).el,cp({label:`Interval`,value:3600,error:`Too often for this device.`}).el,cp({label:`Cycle`,value:5400,disabled:!0}).el)}},{id:`multi-select`,render:()=>{let e=[{label:`Ground floor`,options:[{value:`living`,label:`Living room`,icon:`home`,description:`4 lights`},{value:`kitchen`,label:`Kitchen`,icon:`lightbulb`,description:`3 lights`},{value:`hall`,label:`Hallway`,icon:`lightbulb`,description:`1 light`}]},{label:`Upstairs`,options:[{value:`bedroom`,label:`Bedroom`,icon:`lightbulb`,description:`2 lights`},{value:`study`,label:`Study`,icon:`lightbulb`,description:`2 lights`},{value:`attic`,label:`Attic`,icon:`lightbulb`,description:`Unavailable`,disabled:!0}]}],t=kp(`Type to filter, arrows move, Enter toggles, Backspace removes the last room.`);return Ap(vp({label:`Rooms`,options:e,values:[`living`,`kitchen`],placeholder:`Choose rooms`,helper:`The scene runs in every chosen room.`,onChange:e=>t.textContent=`${e.length} chosen`}).el,t,vp({label:`Notify`,labelStyle:`eyebrow`,placeholder:`Choose people`,options:[{value:`a`,label:`Phone A`},{value:`b`,label:`Phone B`},{value:`t`,label:`Wall tablet`},{value:`w`,label:`Watch`}]}).el,vp({label:`Days`,size:`small`,options:[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`].map(e=>({value:e,label:e})),values:[`Sat`,`Sun`]}).el,vp({label:`Sensors`,options:[{value:`s1`,label:`Door`}],error:`Choose at least one more sensor.`,values:[`s1`]}).el,vp({label:`Locked`,options:[{value:`x`,label:`Garage`}],values:[`x`],disabled:!0}).el)}},{id:`transfer-list`,render:()=>{let e=[{value:`weather`,label:`Weather`,icon:`weather`,description:`Today and tomorrow`},{value:`lights`,label:`Lights`,icon:`lightbulb`,description:`Every room`},{value:`heating`,label:`Heating`,icon:`thermometer`},{value:`music`,label:`Music`,icon:`music`,description:`Now playing`},{value:`cameras`,label:`Cameras`,icon:`camera`},{value:`network`,label:`Network`,icon:`wifi`,description:`Admin only`,disabled:!0},{value:`calendar`,label:`Calendar`,icon:`calendar`},{value:`energy`,label:`Energy`,icon:`power`}],t=kp(`Press items to pick them, then a move button. Keyboard: arrows, Space, Shift+arrows, Ctrl+A, Enter.`);return M(`div`,{class:`ex-stack`,style:`max-width: 720px`},Op({label:`Dashboard cards`,items:e,values:[`weather`,`lights`],sourceLabel:`Hidden`,targetLabel:`Shown`,helper:`Shown cards appear on the wall tablet.`,onChange:e=>t.textContent=`Shown: ${e.join(`, `)||`none`}`}).el,t,M(`div`,{style:`max-width: 420px`},Op({label:`Searchable, narrow`,items:e,values:[`music`],searchable:!0}).el),Op({label:`Locked`,items:e.slice(0,4),values:[`heating`],disabled:!0}).el)}}];function Np(e=!1){return B(`mh-choice-group`,e&&`mh-choice-group--inline`)}function Pp(e=!1){return B(`mh-choice-group__legend`,e&&`mh-visually-hidden`)}function Fp(e,t,n,r){return M(`fieldset`,{class:Np(n)},M(`legend`,{class:Pp(t)},e),M(`div`,{class:`mh-choice-group__items`},...r))}function Ip(e,t,n){let r=M(`input`,{type:`radio`,class:`mh-radio__input`,name:t,value:e.value});return r.checked=n,r.disabled=e.disabled??!1,{el:M(`label`,{class:`mh-radio`},M(`span`,{class:`mh-radio__control`},r,M(`span`,{class:`mh-radio__dot`,"aria-hidden":`true`})),Ee(`mh-radio`,r,e.label,e.description)),input:r}}function Lp(e){let t=e.name??I(`mh-radio`),n=e.options.map(n=>Ip(n,t,n.value===e.value)),r=Fp(e.legend,e.hideLegend,e.inline,n.map(e=>e.el));r.disabled=e.disabled??!1;let i=n.map(e=>e.input);return e.onChange&&r.addEventListener(`change`,t=>e.onChange(t.target.value,t)),{el:r,inputs:i,getValue:()=>i.find(e=>e.checked)?.value,setValue(e){for(let t of i)t.checked=t.value===e},setDisabled(e){r.disabled=e}}}function Rp(e){let t=new Set(e.values??[]),n=e.options.map(n=>Fe({label:n.label,description:n.description,value:n.value,name:e.name,checked:t.has(n.value),disabled:n.disabled})),r=Fp(e.legend,e.hideLegend,e.inline,n.map(e=>e.el));r.disabled=e.disabled??!1;let i=()=>n.filter(e=>e.isChecked()).map(e=>e.input.value);return e.onChange&&r.addEventListener(`change`,t=>e.onChange(i(),t)),{el:r,checkboxes:n,getValues:i,setValues(e){for(let t of n)t.setChecked(e.includes(t.input.value))},setDisabled(e){r.disabled=e}}}var zp=e=>{let t=String(e),n=t.indexOf(`.`);return n<0?0:t.length-n-1},Bp=e=>(Math.round(e*100)/100).toString();function Vp(e,t){let n=e*Math.PI/180;return{x:50+t*Math.sin(n),y:50-t*Math.cos(n)}}function Hp(e,t,n){let r=Vp(e,n),i=`M ${Bp(r.x)} ${Bp(r.y)}`,a=t-e;if(Math.abs(a)<.01)return i;let o=Vp(t,n);return`${i} A ${n} ${n} 0 ${+(Math.abs(a)>180)} ${+(a>0)} ${Bp(o.x)} ${Bp(o.y)}`}function Up(e,t,n){let r=e-(n.left+n.width/2),i=t-(n.top+n.height/2);return(Math.atan2(r,-i)*180/Math.PI+360)%360}function Wp(e,t){return((t-e)%360+540)%360-180}function Gp(e,t,n){let r=n>0?t+Math.round((e-t)/n)*n:e;return Number(r.toFixed(Math.max(zp(n),zp(t))))}function Kp(e,t){let{min:n,max:r,step:i}=t;if(t.wrap){let t=r-n;if(t<=0)return n;let a=Gp(((e-n)%t+t)%t+n,n,i);return a>=r?n:a}return Gp(Math.min(r,Math.max(n,e)),n,i)}function qp(e,t,n){let{min:r,max:i,step:a}=n,o=n.bigStep??a*10;switch(e){case`ArrowUp`:case`ArrowRight`:return Kp(t+a,n);case`ArrowDown`:case`ArrowLeft`:return Kp(t-a,n);case`PageUp`:return Kp(t+o,n);case`PageDown`:return Kp(t-o,n);case`Home`:return r;case`End`:return n.wrap?Kp(i-a,n):i;default:return null}}function Jp(e,t,n,r,i,a){e.setAttribute(`aria-valuemin`,String(n)),e.setAttribute(`aria-valuemax`,String(r)),e.setAttribute(`aria-valuenow`,String(t)),i===void 0?e.removeAttribute(`aria-valuetext`):e.setAttribute(`aria-valuetext`,i),a?e.setAttribute(`aria-disabled`,`true`):e.removeAttribute(`aria-disabled`),e.tabIndex=a?-1:0}var Yp=`http://www.w3.org/2000/svg`;function Xp(e,t={},...n){let r=document.createElementNS(Yp,e);for(let[e,n]of Object.entries(t))r.setAttribute(e,String(n));for(let e of n)e&&r.append(e);return r}function Zp(e,t,n,r=0,i=360){if(e<=0)return[];let a=Math.abs(i-r)>=360?(i-r)/e:e>1?(i-r)/(e-1):0;return Array.from({length:e},(e,i)=>{let o=r+i*a,s=Vp(o,t),c=Vp(o,n);return{x1:Bp(s.x),y1:Bp(s.y),x2:Bp(c.x),y2:Bp(c.y)}})}var Qp=`M 46.5 1.5 L 53.5 1.5 L 50 7 Z`,$p=40;function em(e){return{min:e.min??0,max:e.max??100,step:e.step??1,bigStep:e.bigStep,wrap:e.wrap??!1}}function tm(e,t,n=24){let r=t.step>0?Math.round((e-t.min)/t.step):0;return Math.round(r*360/Math.max(1,n)*100)/100}function nm(e,t){if(t.wrap)return``;let n=t.max-t.min,r=n>0?Math.min(1,Math.max(0,(e-t.min)/n)):0;return Hp(0,Math.min(359.99,r*360),46)}function rm(e=24){return Zp(e,30,38)}function im(e){return B(`mh-click-wheel`,e.size===`small`&&`mh-click-wheel--sm`,e.size===`large`&&`mh-click-wheel--lg`,e.disabled&&`is-disabled`)}function am(e){let t=em(e),n=Math.max(1,Math.round(e.detents??24)),r=360/n,i=I(`mh-click-wheel-label`),a=e.disabled??!1,o=Kp(e.value??t.min,t),s=t.wrap?null:Xp(`path`,{class:`mh-click-wheel__progress`}),c=Xp(`g`,{class:`mh-click-wheel__ticks`},...rm(n).map((e,t)=>Xp(`line`,{class:B(`mh-click-wheel__tick`,t===0&&`mh-click-wheel__tick--zero`),...e}))),l=Xp(`svg`,{class:`mh-click-wheel__svg`,viewBox:`0 0 100 100`,"aria-hidden":`true`},Xp(`circle`,{class:`mh-click-wheel__disc`,cx:50,cy:50,r:44}),t.wrap?null:Xp(`circle`,{class:`mh-click-wheel__rim`,cx:50,cy:50,r:46}),s,c,Xp(`path`,{class:`mh-click-wheel__indicator`,d:Qp})),u=e.center||e.showValue===!1?null:M(`span`,{class:`mh-click-wheel__value`,"aria-hidden":`true`}),d=M(`div`,{class:`mh-click-wheel__wheel`,role:`slider`,"aria-labelledby":e.label?i:void 0,"aria-label":e.label?void 0:e.ariaLabel},l,u),f=e.center?M(`button`,{type:`button`,class:`mh-click-wheel__center`,"aria-label":e.center.label,title:e.center.label},H(e.center.icon)):null;f&&e.center?.onPress&&f.addEventListener(`click`,e.center.onPress);let p=e.label?M(`span`,{class:`mh-click-wheel__label`,id:i},e.label):null,m=M(`div`,{class:im({...e,disabled:a})},M(`div`,{class:`mh-click-wheel__body`},d,f),p),h=0,g=()=>{m.style.setProperty(`--_turn`,`${tm(o,t,n)+h}deg`),s?.setAttribute(`d`,nm(o,t));let r=e.format?e.format(o):String(o);u&&(u.textContent=r),Jp(d,o,t.min,t.max,e.format?r:void 0,a),f&&(f.disabled=a),m.className=im({...e,disabled:a})},_=(n,r)=>{let i=0,a=Math.sign(n);for(let s=0;s<Math.abs(n);s+=1){let n=Kp(o+a*t.step,t);if(n===o)break;o=n,i+=a,e.haptics&&navigator.vibrate?.(4),e.onInput?.(o,r)}return i};g(),d.addEventListener(`keydown`,n=>{if(a)return;let r=qp(n.key,o,t);r!==null&&(n.preventDefault(),r!==o&&(o=r,g(),e.onInput?.(o,n),e.onChange?.(o,n)))});let v=0;d.addEventListener(`wheel`,n=>{if(a)return;let r=n.deltaMode===1?n.deltaY*$p:n.deltaMode===2?n.deltaY*$p*3:n.deltaY;if(Kp(o+(r<0?1:-1)*t.step,t)===o)return;n.preventDefault(),v+=r;let i=Math.trunc(-v/$p);i!==0&&(v+=i*$p,_(i,n)!==0&&(g(),e.onChange?.(o,n)))},{passive:!1});let y=!1,b=0,x=o;d.addEventListener(`pointerdown`,e=>{if(a||e.button!==0)return;let t=d.getBoundingClientRect();t.width<=0||(e.preventDefault(),y=!0,x=o,h=0,b=Up(e.clientX,e.clientY,t),d.focus(),d.setPointerCapture?.(e.pointerId))}),d.addEventListener(`pointermove`,e=>{if(!y)return;let t=d.getBoundingClientRect(),n=e.clientX-(t.left+t.width/2),i=e.clientY-(t.top+t.height/2);if(Math.hypot(n,i)<t.width*.12)return;let a=Up(e.clientX,e.clientY,t);h+=Wp(b,a),b=a;let o=Math.trunc(h/r);o!==0&&(h=_(o,e)===o?h-o*r:0),g()});let S=t=>{y&&(y=!1,h=0,g(),o!==x&&e.onChange?.(o,t))};return d.addEventListener(`pointerup`,S),d.addEventListener(`pointercancel`,S),{el:m,wheel:d,center:f,getValue:()=>o,setValue(e){o=Kp(e,t),g()},setDisabled(e){a=e,g()}}}var om=-135;function sm(e){let t=e.mode===`angle`;return{min:e.min??0,max:e.max??(t?360:100),step:e.step??1,bigStep:e.bigStep,wrap:t}}function cm(e,t){let n=t.max-t.min,r=n>0?Math.min(1,Math.max(0,(e-t.min)/n)):0;return t.wrap?r*360:om+r*270}function lm(e,t,n){let{min:r,max:i}=t;if(t.wrap)return Kp(r+e/360*(i-r),t);let a=e>180?e-360:e,o;return o=a<-135?r:a>135?i:r+(a-om)/270*(i-r),o=Kp(o,t),n!==void 0&&Math.abs(o-n)>(i-r)/2?n-r>(i-r)/2?i:r:o}function um(e,t){let n=cm(e,t),r=Vp(n,38),i=e=>(Math.round(e*100)/100).toString();return{track:t.wrap?``:Hp(om,135,38),fill:t.wrap?``:Hp(om,n,38),thumb:{cx:i(r.x),cy:i(r.y)}}}function dm(e,t){return t.wrap?Zp(e,46,49.5):Zp(e,46,49.5,om,135)}function fm(e){return B(`mh-dial`,e.mode===`angle`&&`mh-dial--angle`,e.size===`small`&&`mh-dial--sm`,e.size===`large`&&`mh-dial--lg`,e.disabled&&`is-disabled`)}function pm(e){let t=sm(e),n=I(`mh-dial-label`),r=e.disabled??!1,i=Kp(e.value??t.min,t),a=e.ticks?Xp(`g`,{class:`mh-dial__ticks`},...dm(e.ticks,t).map(e=>Xp(`line`,{class:`mh-dial__tick`,...e}))):null,o=t.wrap?Xp(`circle`,{class:`mh-dial__track`,cx:50,cy:50,r:38}):Xp(`path`,{class:`mh-dial__track`}),s=t.wrap?null:Xp(`path`,{class:`mh-dial__fill`}),c=t.wrap?Xp(`line`,{class:`mh-dial__needle`,x1:50,y1:50}):null,l=Xp(`circle`,{class:`mh-dial__thumb`,r:7}),u=Xp(`svg`,{class:`mh-dial__svg`,viewBox:`0 0 100 100`,"aria-hidden":`true`},a,o,s,c,l),d=e.showValue===!1?null:M(`span`,{class:`mh-dial__value`,"aria-hidden":`true`}),f=M(`div`,{class:`mh-dial__control`,role:`slider`,"aria-labelledby":e.label?n:void 0,"aria-label":e.label?void 0:e.ariaLabel},u,d),p=e.label?M(`span`,{class:`mh-dial__label`,id:n},e.label):null,m=M(`div`,{class:fm({...e,disabled:r})},f,p),h=()=>{let n=um(i,t);t.wrap||o.setAttribute(`d`,n.track),s?.setAttribute(`d`,n.fill),l.setAttribute(`cx`,n.thumb.cx),l.setAttribute(`cy`,n.thumb.cy),c?.setAttribute(`x2`,n.thumb.cx),c?.setAttribute(`y2`,n.thumb.cy);let a=e.format?e.format(i):String(i);d&&(d.textContent=a),Jp(f,i,t.min,t.max,e.format?a:void 0,r),m.className=fm({...e,disabled:r})},g=(t,n)=>t!==i&&(i=t,h(),e.onInput?.(i,n),!0);h(),f.addEventListener(`keydown`,n=>{if(r)return;let a=qp(n.key,i,t);a!==null&&(n.preventDefault(),g(a,n)&&e.onChange?.(i,n))});let _=!1,v=i,y=(e,n)=>{let r=f.getBoundingClientRect();r.width<=0||g(lm(Up(e.clientX,e.clientY,r),t,n?i:void 0),e)};f.addEventListener(`pointerdown`,e=>{r||e.button!==0||(e.preventDefault(),_=!0,v=i,f.focus(),f.setPointerCapture?.(e.pointerId),y(e,!1))}),f.addEventListener(`pointermove`,e=>{_&&y(e,!0)});let b=t=>{_&&(_=!1,i!==v&&e.onChange?.(i,t))};return f.addEventListener(`pointerup`,b),f.addEventListener(`pointercancel`,b),{el:m,control:f,getValue:()=>i,setValue(e){i=Kp(e,t),h()},setDisabled(e){r=e,h()}}}var mm={low:`Minimum`,high:`Maximum`},hm=e=>{let t=String(e),n=t.indexOf(`.`);return n<0?0:t.length-n-1};function gm(e,t,n,r){let i=r>0?t+Math.round((e-t)/r)*r:e;return Number(Math.min(n,Math.max(t,i)).toFixed(Math.max(hm(r),hm(t))))}function _m(e,t,n,r=0,i=`high`){let a=Math.max(0,Math.min(r,n-t)),[o,s]=e;return o=Math.min(n,Math.max(t,o)),s=Math.min(n,Math.max(t,s)),i===`low`?(s=Math.max(s,t+a),o=Math.min(o,s-a)):(o=Math.min(o,n-a),s=Math.max(s,o+a)),[o,s]}function vm(e,t){let[n,r]=t;return n===r?e<n?`low`:`high`:Math.abs(e-n)<=Math.abs(e-r)?`low`:`high`}function ym(e,t){let n=t??String;return`${n(e[0])} – ${n(e[1])}`}function bm(e=!1,t=!1){return B(`mh-range-slider`,e&&`is-low-on-top`,t&&`is-disabled`)}function xm(e,t,n,r,i){let a=t.getBoundingClientRect();if(a.width<=0)return null;let o=getComputedStyle(t).direction===`rtl`,s=Math.min(1,Math.max(0,(e-a.left)/a.width));return gm(n+(o?1-s:s)*(r-n),n,r,i)}function Sm(e,t,n){return e[0]>=e[1]&&e[0]>t+(n-t)/2}function Cm(e){let t=e.min??0,n=e.max??100,r=e.step??1,i=e.minGap??0,a={...mm,...e.labels},o=I(`mh-range-label`),s=(i,o)=>M(`input`,{type:`range`,class:`mh-range-slider__input mh-range-slider__input--${i}`,name:e.names?.[o],min:t,max:n,step:r,"aria-label":a[i]}),c=s(`low`,0),l=s(`high`,1),u=M(`div`,{class:`mh-range-slider__fill`}),d=M(`div`,{class:`mh-range-slider__control`},M(`div`,{class:`mh-range-slider__track`},u),c,l),f=e.showValue?M(`output`,{class:`mh-range-slider__value`,"aria-hidden":`true`}):null,p=e.label||f?M(`div`,{class:`mh-range-slider__head`},e.label?M(`span`,{class:`mh-range-slider__label`,id:o},e.label):null,f):null,m=e.marks?.length?M(`div`,{class:`mh-range-slider__marks`,"aria-hidden":`true`},...e.marks.map(e=>{let r=M(`span`,{class:`mh-range-slider__mark`},e.label??``);return r.style.setProperty(`--_at`,String(Nr(e.value,t,n))),r})):null,h=M(`div`,{class:bm(),role:`group`,"aria-labelledby":e.label?o:void 0,"aria-label":e.label?void 0:e.ariaLabel},p,d,m),g=_m(e.value??[t,n],t,n,i),_=()=>{c.value=String(g[0]),l.value=String(g[1]),h.style.setProperty(`--_lo`,String(Nr(g[0],t,n))),h.style.setProperty(`--_hi`,String(Nr(g[1],t,n))),h.className=bm(Sm(g,t,n),c.disabled),e.format&&(c.setAttribute(`aria-valuetext`,e.format(g[0])),l.setAttribute(`aria-valuetext`,e.format(g[1]))),f&&(f.textContent=ym(g,e.format))},v=(e,r)=>{let a=_m(e,t,n,i,r),o=a[0]!==g[0]||a[1]!==g[1];return g=a,_(),o};_();let y=t=>n=>{let r=Number((t===`low`?c:l).value);v(t===`low`?[r,g[1]]:[g[0],r],t),e.onInput?.([...g],n)};c.addEventListener(`input`,y(`low`)),l.addEventListener(`input`,y(`high`));let b=t=>e.onChange?.([...g],t);c.addEventListener(`change`,b),l.addEventListener(`change`,b);let x=null,S=e=>xm(e,d,t,n,r),C=(t,n,r)=>{let i=S(n);i!==null&&v(t===`low`?[i,g[1]]:[g[0],i],t)&&e.onInput?.([...g],r)};d.addEventListener(`pointerdown`,e=>{if(c.disabled||e.button!==0||e.target===c||e.target===l)return;let t=S(e.clientX);t!==null&&(e.preventDefault(),x=vm(t,g),(x===`low`?c:l).focus(),d.setPointerCapture?.(e.pointerId),C(x,e.clientX,e))}),d.addEventListener(`pointermove`,e=>{x&&C(x,e.clientX,e)});let w=t=>{x&&(x=null,e.onChange?.([...g],t))};d.addEventListener(`pointerup`,w),d.addEventListener(`pointercancel`,w);let T=e=>{c.disabled=e,l.disabled=e,_()};return e.disabled&&T(!0),{el:h,inputs:[c,l],getValue:()=>[...g],setValue(e){g=_m(e,t,n,i),_()},setDisabled:T}}var wm=e=>e===1?`1 star`:`${e} stars`,Tm=(e,t)=>`${Math.round(e*10)/10} out of ${t} stars`;function Em(e,t){return Math.round(Math.min(1,Math.max(0,e-(t-1)))*100)/100}function Dm(e){return B(`mh-rating`,e.readOnly?`mh-rating--readonly`:`mh-rating--editable`,e.size===`small`&&`mh-rating--sm`,e.size===`large`&&`mh-rating--lg`,e.tone===`warning`&&`mh-rating--warning`,e.disabled&&`is-disabled`)}var Om=(e,t)=>M(`span`,{class:`mh-rating__star`},H(t,{class:`mh-rating__empty`}),H(e,{class:`mh-rating__full`}));function km(e){let t=Math.max(1,Math.round(e.max??5)),n=e.icon??`M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z`,r=e.emptyIcon??`M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z`,i=e.readOnly??!1,a=e=>Math.min(t,Math.max(0,i?e:Math.round(e))),o=a(e.value??0),s=e.disabled??!1,c=e.name??I(`mh-rating`),l=[],u=Array.from({length:t},(a,o)=>{let s=o+1;if(i)return M(`span`,{class:`mh-rating__item`},Om(n,r));let u=M(`input`,{type:`radio`,class:`mh-rating__input`,name:c,value:s});return l.push(u),M(`label`,{class:`mh-rating__item`},u,Om(n,r),M(`span`,{class:`mh-visually-hidden`},(e.itemLabel??wm)(s,t)))}),d=M(`div`,{class:Dm({...e,readOnly:i,disabled:s}),role:i?`img`:`radiogroup`,"aria-label":i?void 0:e.label},...u),f=()=>{u.forEach((e,t)=>e.style.setProperty(`--_fill`,String(Em(o,t+1)))),l.forEach((e,t)=>{e.checked=o===t+1,e.disabled=s}),i&&d.setAttribute(`aria-label`,`${e.label}: ${(e.valueText??Tm)(o,t)}`),d.className=Dm({...e,readOnly:i,disabled:s})};return f(),l.forEach((t,n)=>{t.addEventListener(`click`,t=>{let r=n+1,i=o===r&&(e.allowClear??!0)?0:r;i!==o&&(o=i,f(),e.onChange?.(o,t))}),t.addEventListener(`change`,r=>{t.checked&&o!==n+1&&(o=n+1,f(),e.onChange?.(o,r))})}),{el:d,inputs:l,getValue:()=>o,setValue(e){o=a(e),f()},setDisabled(e){s=e,f()}}}function Am(e=`medium`,t=!1){return B(`mh-toggle-group`,e===`small`&&`mh-toggle-group--sm`,t&&`mh-toggle-group--block`)}function jm(e,t,n=`multiple`,r=!1){let i=e.includes(t);return n===`single`?i?r?[...e]:[]:[t]:i?e.filter(e=>e!==t):[...e,t]}function Mm(e,t,n=!1){if(n)return-1;let r=e.findIndex(e=>!e.disabled&&t.includes(e.value));return r>=0?r:e.findIndex(e=>!e.disabled)}function Nm(e,t,n){let r=n.map((e,t)=>e.disabled?-1:t).filter(e=>e>=0);if(r.length===0)return null;let i=r.indexOf(t);switch(e){case`ArrowRight`:case`ArrowDown`:return r[(i+1)%r.length];case`ArrowLeft`:case`ArrowUp`:return r[(i-1+r.length)%r.length];case`Home`:return r[0];case`End`:return r[r.length-1];default:return null}}function Pm(e){let t=e.type??`multiple`,n=[...e.values??[]];t===`single`&&(n=n.slice(0,1));let r=e.disabled??!1,i=e.options.map(e=>M(`button`,{type:`button`,class:`mh-toggle-group__item`,"aria-label":e.iconOnly?e.label:void 0,title:e.iconOnly?e.label:void 0,"data-value":e.value},e.icon?H(e.icon):null,e.iconOnly?null:M(`span`,{class:`mh-toggle-group__label`},e.label))),a=M(`div`,{class:Am(e.size,e.fullWidth),role:`group`,"aria-label":e.label},...i),o=()=>{let t=Mm(e.options,n,r);i.forEach((i,a)=>{i.setAttribute(`aria-pressed`,String(n.includes(e.options[a].value))),i.disabled=r||(e.options[a].disabled??!1),i.tabIndex=a===t?0:-1})};return i.forEach((r,a)=>{r.addEventListener(`click`,s=>{let c=jm(n,e.options[a].value,t,e.required),l=c.length!==n.length||c.some(e=>!n.includes(e));n=c,o();for(let e of i)e.tabIndex=e===r?0:-1;l&&e.onChange?.([...n],s)}),r.addEventListener(`keydown`,t=>{let n=Nm(t.key,a,e.options);if(n!==null){t.preventDefault();for(let e of i)e.tabIndex=-1;i[n].tabIndex=0,i[n].focus()}})}),o(),{el:a,buttons:i,getValues:()=>[...n],setValues(e){n=t===`single`?e.slice(0,1):[...e],o()},setDisabled(e){r=e,o()}}}var Fm=(...e)=>M(`div`,{class:`ex-stack`,style:`max-width: 420px`},...e),Im=(...e)=>M(`div`,{class:`ex-row`},...e),Lm=[`Living room`,`Kitchen`,`Bedroom`],Rm=e=>M(`span`,{class:`ex-meta`,"aria-live":`polite`},e),zm=e=>M(`p`,{class:`ex-meta`},e),Bm=e=>`${String(Math.floor(e/60)%24).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`,Vm=[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`],Hm=e=>`${e}° ${Vm[Math.round(e/45)%8]}`,Um=[`Harbour Radio`,`Night Owl`,`Copper Hill`,`Lantern 101`,`Quiet Fields`,`Velvet Static`],Wm=[{id:`checkbox`,render:()=>{let e=Lm.map((e,t)=>Fe({label:e,checked:t===0})),t=Fe({label:`All rooms`,indeterminate:!0}),n=()=>{let n=e.filter(e=>e.isChecked()).length;t.setChecked(n===e.length),t.setIndeterminate(n>0&&n<e.length)};return t.input.addEventListener(`change`,()=>e.forEach(e=>e.setChecked(t.isChecked()))),e.forEach(e=>e.input.addEventListener(`change`,n)),Fm(M(`div`,{},t.el,M(`div`,{style:`display: grid; padding-left: var(--mh-space-xl)`},...e.map(e=>e.el))),Fe({label:`Notify me`,description:`Send a notification when the door opens.`,checked:!0}).el,Rp({legend:`Days`,inline:!0,values:[`sat`,`sun`],options:[{value:`sat`,label:`Saturday`},{value:`sun`,label:`Sunday`},{value:`hol`,label:`Holidays`,disabled:!0}]}).el,Im(Fe({ariaLabel:`Unlabelled`}).el,Fe({label:`Disabled`,disabled:!0}).el,Fe({label:`Disabled on`,checked:!0,disabled:!0}).el))}},{id:`radio-group`,render:()=>Fm(Lp({legend:`Heating mode`,value:`auto`,options:[{value:`auto`,label:`Auto`,description:`Follows the schedule.`},{value:`manual`,label:`Manual`,description:`Holds the set temperature.`},{value:`off`,label:`Off`}]}).el,Lp({legend:`Units`,inline:!0,value:`c`,options:[{value:`c`,label:`Celsius`},{value:`f`,label:`Fahrenheit`},{value:`k`,label:`Kelvin`,disabled:!0}]}).el)},{id:`switch`,render:()=>Fm(Im(L({label:`Lights`,checked:!0}).el,L({label:`Fan`}).el,L({ariaLabel:`Unlabelled`}).el),M(`div`,{},L({row:!0,icon:`lightbulb`,label:`Motion lighting`,description:`Turn lights on when someone walks in.`,checked:!0}).el,L({row:!0,icon:`bell`,label:`Door chime`}).el,L({row:!0,icon:`lock`,label:`Auto-lock`,description:`Needs a connected lock.`,disabled:!0}).el),Im(L({label:`Disabled on`,checked:!0,disabled:!0}).el))},{id:`segmented-control`,render:()=>Fm(D({label:`Range`,value:`day`,options:[{value:`day`,label:`Day`},{value:`week`,label:`Week`},{value:`month`,label:`Month`}]}).el,D({label:`Fan speed`,value:`mid`,fullWidth:!0,options:[{value:`low`,label:`Low`,icon:`fan`},{value:`mid`,label:`Medium`},{value:`high`,label:`High`},{value:`boost`,label:`Boost`,disabled:!0}]}).el,Im(D({label:`View`,value:`list`,size:`small`,options:[{value:`list`,label:`List view`,icon:`menu`,iconOnly:!0},{value:`grid`,label:`Grid view`,icon:`home`,iconOnly:!0}]}).el,D({label:`Disabled`,value:`a`,disabled:!0,size:`small`,options:[{value:`a`,label:`On`},{value:`b`,label:`Off`}]}).el))},{id:`chip`,render:()=>{let e=mi({label:`Chosen rooms`,selection:`none`,removable:!0,chips:Lm.map(e=>({value:e,label:e,icon:`home`}))});return Fm(mi({label:`Filter`,values:[`lights`],chips:[{value:`lights`,label:`Lights`,icon:`lightbulb`},{value:`climate`,label:`Climate`,icon:`thermometer`},{value:`media`,label:`Media`,icon:`music`},{value:`offline`,label:`Offline`,disabled:!0}]}).el,mi({label:`Repeat on`,values:[`mon`,`wed`,`fri`],chips:[[`mon`,`M`,`Monday`],[`tue`,`T`,`Tuesday`],[`wed`,`W`,`Wednesday`],[`thu`,`T`,`Thursday`],[`fri`,`F`,`Friday`],[`sat`,`S`,`Saturday`],[`sun`,`S`,`Sunday`]].map(([e,t,n])=>({value:e,label:t,ariaLabel:n}))}).el,mi({label:`Scene`,selection:`single`,values:[`relax`],chips:[{value:`bright`,label:`Bright`},{value:`relax`,label:`Relax`},{value:`night`,label:`Night`}]}).el,e.el,Im(li({label:`Static`}).el,li({label:`With icon`,icon:`wifi`}).el,li({label:`Disabled`,removable:!0,disabled:!0}).el))}},{id:`slider`,render:()=>Fm(It({label:`Brightness`,value:60,showValue:!0,format:e=>`${e}%`}).el,It({label:`Colour temperature`,min:2e3,max:6500,step:100,value:3e3,showValue:!0,format:e=>`${e} K`,marks:[{value:2e3,label:`Warm`},{value:4250,label:`Neutral`},{value:6500,label:`Cool`}]}).el,It({ariaLabel:`Volume`,value:30}).el,It({label:`Disabled`,value:40,disabled:!0}).el)},{id:`stepper`,render:()=>Fm(Im(Fd({label:`Guests`,value:2,min:1,max:8}).el,Fd({label:`Target temperature`,value:21,min:16,max:28,step:.5,format:e=>`${e.toFixed(1)}°`}).el),Im(Fd({label:`Delay`,value:5,step:5,max:60,size:`small`,format:e=>`${e} min`}).el,Fd({label:`Disabled`,value:3,disabled:!0}).el))},{id:`toggle-group`,render:()=>{let e=Rm(`zones: kitchen`);return Fm(Im(Pm({label:`Zones`,values:[`kitchen`],options:[{value:`kitchen`,label:`Kitchen`,icon:`lightbulb`},{value:`hall`,label:`Hall`,icon:`lightbulb`},{value:`garden`,label:`Garden`,icon:`lightbulb`}],onChange:t=>e.textContent=`zones: ${t.join(`, `)||`none`}`}).el,e),Pm({label:`Alignment`,type:`single`,required:!0,values:[`left`],options:[{value:`left`,label:`Align left`,icon:t,iconOnly:!0},{value:`center`,label:`Align centre`,icon:He,iconOnly:!0},{value:`right`,label:`Align right`,icon:tn,iconOnly:!0}]}).el,Pm({label:`Theme`,type:`single`,fullWidth:!0,values:[`night`],options:[{value:`day`,label:`Day`,icon:Br},{value:`night`,label:`Night`,icon:yr},{value:`auto`,label:`Auto`}]}).el,Im(Pm({label:`Weekdays`,size:`small`,values:[`mon`,`fri`],options:[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`].map(e=>({value:e.toLowerCase(),label:e,disabled:e===`Wed`}))}).el,Pm({label:`Disabled`,size:`small`,disabled:!0,values:[`a`],options:[{value:`a`,label:`On`},{value:`b`,label:`Off`}]}).el),zm(`Arrow keys move between toggles; Space or Enter presses. Single mode keeps at most one pressed.`))}},{id:`range-slider`,render:()=>Fm(Cm({label:`Comfort band`,min:16,max:28,step:.5,minGap:1,value:[19.5,23],showValue:!0,format:e=>`${e.toFixed(1)}°`,labels:{low:`Heat to`,high:`Cool to`},marks:[{value:16,label:`16°`},{value:22,label:`22°`},{value:28,label:`28°`}]}).el,Cm({label:`Quiet hours`,min:0,max:1440,step:15,value:[1320,1440],showValue:!0,format:Bm,labels:{low:`Starts`,high:`Ends`}}).el,Cm({ariaLabel:`Brightness limits`,value:[10,80]}).el,Cm({label:`Disabled`,value:[30,70],showValue:!0,disabled:!0}).el,zm(`Each thumb is its own native range: Tab to it, then use the arrow keys. Press the track to move the nearer thumb.`))},{id:`radial-dial`,render:()=>{let e=Rm(`volume: 35%`);return Fm(Im(pm({label:`Volume`,value:35,format:e=>`${e}%`,ticks:11,onInput:t=>e.textContent=`volume: ${t}%`}).el,pm({label:`Wind direction`,mode:`angle`,step:5,value:225,ticks:8,format:Hm}).el,e),Im(pm({label:`Fan`,size:`small`,min:0,max:5,value:3}).el,pm({label:`Slat tilt`,size:`small`,min:-90,max:90,step:5,value:30,format:e=>`${e}°`}).el,pm({label:`Disabled`,size:`small`,value:60,disabled:!0}).el),M(`div`,{},pm({label:`Oven`,size:`large`,min:50,max:250,step:5,value:180,ticks:21,format:e=>`${e}°`}).el),zm(`Drag around the dial, or focus it and use the arrow keys, Page Up/Down, Home and End.`))}},{id:`click-wheel`,render:()=>{let e=0,t=Rm(`tuned: ${Um[0]}`);return Fm(Im(am({label:`Volume`,value:12,max:40}).el,am({label:`Station`,wrap:!0,max:Um.length,detents:12,haptics:!0,center:{label:`Play`,icon:`play`,onPress:()=>t.textContent=`playing: ${Um[e]}`},onInput:n=>{e=n,t.textContent=`tuned: ${Um[n]}`}}).el,t),Im(am({label:`Timer`,size:`small`,max:120,step:5,value:25,detents:36,format:e=>`${e} min`}).el,am({label:`Disabled`,size:`small`,value:40,disabled:!0}).el),zm(`Turn it like a knob: it moves one step per tick from where you start and never jumps to the finger. Scroll and keys work too.`))}},{id:`rating`,render:()=>{let e=Rm(`rating: 4`);return Fm(Im(km({label:`How was the film?`,value:4,onChange:t=>e.textContent=`rating: ${t}`}).el,e),Im(km({label:`Average rating`,value:3.6,readOnly:!0}).el,M(`span`,{class:`ex-meta`},`3.6 from 128 ratings`)),Im(km({label:`Warm tone`,value:3,tone:`warning`,size:`large`}).el,km({label:`Small, read-only`,value:4.5,readOnly:!0,size:`small`,tone:`warning`}).el),Im(km({label:`Favourite`,max:3,value:2,icon:`heart`,emptyIcon:`heart-outline`,itemLabel:e=>`${e} of 3 hearts`}).el,km({label:`Disabled`,value:2,disabled:!0}).el),zm(`Arrow keys change the rating; choose the current star again to clear it.`))}}],Gm=/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;function Km(e){let t=Gm.exec(e.trim());if(!t)return null;let n=t[1];n.length<=4&&(n=[...n].map(e=>e+e).join(``));let r=e=>parseInt(n.slice(e,e+2),16);return{r:r(0),g:r(2),b:r(4),a:n.length===8?Math.round(r(6)/255*1e3)/1e3:1}}var qm=e=>Math.round(Math.min(255,Math.max(0,e))).toString(16).padStart(2,`0`);function Jm(e,t=!1){let n=`#${qm(e.r)}${qm(e.g)}${qm(e.b)}`;return t&&e.a<1?n+qm(e.a*255):n}function Ym(e){let t=e.r/255,n=e.g/255,r=e.b/255,i=Math.max(t,n,r),a=i-Math.min(t,n,r),o=0;return a>0&&(o=i===t?(n-r)/a%6:i===n?(r-t)/a+2:(t-n)/a+4,o*=60,o<0&&(o+=360)),{h:o,s:i===0?0:a/i,v:i,a:e.a}}function Xm(e){let t=(e.h%360+360)%360/60,n=e.v*e.s,r=n*(1-Math.abs(t%2-1)),i=e.v-n,[a,o,s]=t<1?[n,r,0]:t<2?[r,n,0]:t<3?[0,n,r]:t<4?[0,r,n]:t<5?[r,0,n]:[n,0,r];return{r:(a+i)*255,g:(o+i)*255,b:(s+i)*255,a:e.a}}function Zm(e,t,n){let r=Math.min(1,Math.max(0,n));return{r:e.r+(t.r-e.r)*r,g:e.g+(t.g-e.g)*r,b:e.b+(t.b-e.b)*r,a:e.a+(t.a-e.a)*r}}function Qm(e){let t=e=>Math.round(Math.min(255,Math.max(0,e)));return`rgb(${t(e.r)} ${t(e.g)} ${t(e.b)} / ${Math.round(e.a*1e3)/1e3})`}function $m(){return[...Array.from({length:12},(e,t)=>Jm(Xm({h:t*30,s:.72,v:.92,a:1}))),`#ffffff`,`#808080`,`#000000`]}function eh(){let e=globalThis.EyeDropper;return typeof e==`function`?e:null}var th=e=>typeof e==`string`?{color:e}:e,nh=e=>`${Math.round(e*100)}%`;function rh(e={}){let t=e.alpha??!1,n=Ym(Km(e.value??``)??{r:255,g:255,b:255,a:1});t||(n.a=1);let r=!1,i=M(`span`,{class:`mh-color-picker__thumb`,"aria-hidden":`true`}),a=M(`div`,{class:`mh-color-picker__area`,role:`slider`,tabindex:0,"aria-label":`Saturation and brightness`,"aria-valuemin":0,"aria-valuemax":100},i),o=M(`input`,{type:`range`,class:`mh-color-picker__range mh-color-picker__hue`,min:0,max:360,step:1,"aria-label":`Hue`}),s=t?M(`input`,{type:`range`,class:`mh-color-picker__range mh-color-picker__alpha`,min:0,max:100,step:1,"aria-label":`Opacity`}):null,c=M(`span`,{class:`mh-color-picker__preview`,"aria-hidden":`true`}),u=e.eyedropper===!1?null:eh(),d=u?M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-color-picker__eyedropper`),"aria-label":`Pick a colour from the screen`,title:`Pick a colour from the screen`},H(re)):null,f=e.hexInput===!1?null:M(`input`,{class:`mh-input__control mh-color-picker__hex`,type:`text`,"aria-label":`Hex colour`,spellcheck:`false`,autocomplete:`off`,autocapitalize:`off`,maxlength:t?9:7}),p=f?M(`div`,{class:Pn(`small`,`mh-color-picker__hex-box`)},Kn(`#`),f):null,m=(e.swatches===!1?[]:(e.swatches??$m()).map(th)).map(e=>{let n=Km(e.color),r=M(`button`,{type:`button`,class:`mh-color-picker__swatch`,"aria-label":e.label??e.color,title:e.label??e.color,"aria-pressed":`false`,"data-color":n?Jm(n,t):e.color});return n&&r.style.setProperty(`--_swatch`,Qm(n)),r}),h=m.length?M(`div`,{class:`mh-color-picker__swatches`,role:`group`,"aria-label":`Swatches`},...m):null,g=M(`div`,{class:`mh-color-picker`,role:`group`,"aria-label":e.label??`Colour`},a,M(`div`,{class:`mh-color-picker__controls`},c,M(`div`,{class:`mh-color-picker__sliders`},o,s),d),p,h),_=()=>Jm(Xm(n),t),v=(e=!1)=>{let t=Xm(n),r=Qm({...t,a:1});g.style.setProperty(`--_hue`,String(Math.round(n.h))),g.style.setProperty(`--_s`,String(n.s)),g.style.setProperty(`--_v`,String(n.v)),g.style.setProperty(`--_color`,Qm(t)),g.style.setProperty(`--_opaque`,r),a.setAttribute(`aria-valuenow`,String(Math.round(n.s*100))),a.setAttribute(`aria-valuetext`,`Saturation ${nh(n.s)}, brightness ${nh(n.v)}`),o.value=String(Math.round(n.h)),o.setAttribute(`aria-valuetext`,`${Math.round(n.h)}°`),s&&(s.value=String(Math.round(n.a*100)),s.setAttribute(`aria-valuetext`,nh(n.a)));let i=_();f&&!e&&(f.value=i.slice(1),f.removeAttribute(`aria-invalid`));for(let e of m)e.setAttribute(`aria-pressed`,String(e.dataset.color===i))},y=()=>e.onInput?.(_()),b=()=>e.onChange?.(_()),x=e=>{let r=Km(e);if(!r)return!1;let i=Ym(r);return t||(i.a=1),(i.s===0||i.v===0)&&(i.h=n.h),i.v===0&&(i.s=n.s),n=i,!0},S=e=>{let t=a.getBoundingClientRect();t.width!==0&&t.height!==0&&(n={...n,s:Math.min(1,Math.max(0,(e.clientX-t.left)/t.width)),v:Math.min(1,Math.max(0,1-(e.clientY-t.top)/t.height))},v(),y())},C=!1;a.addEventListener(`pointerdown`,e=>{r||e.button!==0||(e.preventDefault(),a.focus({preventScroll:!0}),C=!0,a.setPointerCapture?.(e.pointerId),a.classList.add(`is-dragging`),S(e))}),a.addEventListener(`pointermove`,e=>{C&&S(e)});let w=()=>{C&&(C=!1,a.classList.remove(`is-dragging`),b())};a.addEventListener(`pointerup`,w),a.addEventListener(`pointercancel`,w),a.addEventListener(`keydown`,e=>{if(r)return;let t=e.shiftKey?.1:.01,i=getComputedStyle(g).direction===`rtl`,{s:a,v:o}=n;switch(e.key){case`ArrowLeft`:a+=i?t:-t;break;case`ArrowRight`:a+=i?-t:t;break;case`ArrowUp`:o+=t;break;case`ArrowDown`:o-=t;break;case`PageUp`:o+=.1;break;case`PageDown`:o-=.1;break;case`Home`:a=0;break;case`End`:a=1;break;default:return}e.preventDefault(),n={...n,s:Math.min(1,Math.max(0,Math.round(a*100)/100)),v:Math.min(1,Math.max(0,Math.round(o*100)/100))},v(),y(),b()}),o.addEventListener(`input`,()=>{n={...n,h:Number(o.value)},v(),y()}),o.addEventListener(`change`,b),s?.addEventListener(`input`,()=>{n={...n,a:Number(s.value)/100},v(),y()}),s?.addEventListener(`change`,b),f?.addEventListener(`input`,()=>{let e=f.value.trim();(e.replace(`#`,``).length===6||t&&e.replace(`#`,``).length===8)&&x(e)&&(v(!0),f.removeAttribute(`aria-invalid`),y())}),f?.addEventListener(`change`,()=>{x(f.value)?(v(),b()):f.setAttribute(`aria-invalid`,`true`)}),f?.addEventListener(`keydown`,e=>{e.key===`Escape`&&v()});for(let e of m)e.addEventListener(`click`,()=>{e.dataset.color&&x(e.dataset.color)&&(v(),y(),b())});d?.addEventListener(`click`,()=>{u&&new u().open().then(e=>{let t=n.a;x(e.sRGBHex)&&(n.a=t,v(),y(),b())}).catch(()=>{})}),v();let T={el:g,getValue:_,setValue(e){x(e)&&v()},setDisabled(e){r=e,g.classList.toggle(`is-disabled`,e),a.tabIndex=e?-1:0,e?a.setAttribute(`aria-disabled`,`true`):a.removeAttribute(`aria-disabled`);for(let t of[o,s,f,d,...m])t&&(t.disabled=e)}};return e.disabled&&T.setDisabled(!0),T}var ih=(e,t=2)=>String(e).padStart(t,`0`);function ah(e,t,n){let r=new Date(Date.UTC(2e3,0,1));return r.setUTCFullYear(e,t-1,n),`${ih(r.getUTCFullYear(),4)}-${ih(r.getUTCMonth()+1)}-${ih(r.getUTCDate())}`}function oh(e){let[t,n,r]=e.split(`-`).map(Number);return{year:t,month:n,day:r}}function sh(e){let{year:t,month:n,day:r}=oh(e),i=new Date(Date.UTC(2e3,0,1));return i.setUTCFullYear(t,n-1,r),i}function ch(e=new Date){return ah(e.getFullYear(),e.getMonth()+1,e.getDate())}function lh(e,t){let{year:n,month:r,day:i}=oh(e);return ah(n,r,i+t)}function uh(e,t){let{year:n,month:r,day:i}=oh(e),{year:a,month:o}=oh(ah(n,r+t,1));return ah(a,o,Math.min(i,dh(a,o)))}function dh(e,t){return new Date(Date.UTC(e,t,0)).getUTCDate()}function fh(e){return sh(e).getUTCDay()}function ph(e,t){return e<=t?[e,t]:[t,e]}function mh(e,t,n){return(!t||e>=t)&&(!n||e<=n)}function hh(e,t,n){return t&&e<t?t:n&&e>n?n:e}function gh(e){try{let t=new Intl.Locale(e??new Intl.DateTimeFormat().resolvedOptions().locale),n=(typeof t.getWeekInfo==`function`?t.getWeekInfo():t.weekInfo)?.firstDay;if(typeof n==`number`&&n>=1&&n<=7)return n%7}catch{}return 1}var _h=`2023-01-01`;function vh(e,t,n){let r=new Intl.DateTimeFormat(e,{weekday:n,timeZone:`UTC`});return Array.from({length:7},(e,n)=>r.format(sh(lh(_h,(t+n)%7))))}function yh(e,t){return new Intl.DateTimeFormat(t,{month:`long`,year:`numeric`,timeZone:`UTC`}).format(sh(e))}function bh(e,t,n={dateStyle:`medium`}){return new Intl.DateTimeFormat(t,{...n,timeZone:`UTC`}).format(sh(e))}function xh(e,t,n,r={dateStyle:`medium`}){let i=new Intl.DateTimeFormat(n,{...r,timeZone:`UTC`});return typeof i.formatRange==`function`?i.formatRange(sh(e),sh(t)):`${i.format(sh(e))} – ${i.format(sh(t))}`}function Sh(e,t,n){let r=ah(e,t,1),i=lh(r,-((fh(r)-n+7)%7));return Array.from({length:42},(e,t)=>lh(i,t))}function Ch(e){return B(`mh-calendar__day`,e.outside&&`is-outside`,e.today&&`is-today`,e.selected&&`is-selected`,e.start&&`is-range-start`,e.end&&`is-range-end`,e.inRange&&`is-in-range`,e.preview&&`is-preview`,e.disabled&&`is-disabled`)}var wh=e=>{let{year:t,month:n}=oh(e);return ah(t,n,1)};function Th(e={}){let t=e.mode??`single`,n=e.locale,r=e.weekStartsOn??gh(n),i=Math.max(1,Math.min(4,Math.round(e.months??1))),a=e.today??ch(),o=e.value??null,s=e.range??null,c=null,u=wh(e.month??(t===`range`?s?.start:o)??a),d=t===`range`?s?.start??(e.month?u:a):o??(e.month?u:a),f=vh(n,r,`long`),p=vh(n,r,`narrow`),m=new Intl.DateTimeFormat(n,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`,timeZone:`UTC`}),h=new Intl.NumberFormat(n,{useGrouping:!1}),g=t=>!mh(t,e.min,e.max)||(e.isDateDisabled?.(t)??!1),_=M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-calendar__nav`),"aria-label":`Previous month`,title:`Previous month`},H(In)),v=M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-calendar__nav`),"aria-label":`Next month`,title:`Next month`},H(hn)),y=Array.from({length:i},(e,t)=>{let n=I(`mh-calendar-title`),r=M(`h2`,{class:`mh-calendar__title`,id:n,"aria-live":t===0?`polite`:null}),a=M(`div`,{class:`mh-calendar__month-head`},t===0?_:null,r,t===i-1?v:null),o=M(`tbody`),s=M(`table`,{class:`mh-calendar__grid`,role:`grid`,"aria-labelledby":n},M(`thead`,{},M(`tr`,{},...f.map((e,t)=>M(`th`,{scope:`col`,abbr:e,class:`mh-calendar__weekday`},M(`span`,{"aria-hidden":`true`},p[t]),M(`span`,{class:`mh-visually-hidden`},e))))),o);return{title:r,body:o,el:M(`div`,{class:`mh-calendar__month`},a,s)}}),b=M(`div`,{class:B(`mh-calendar`,i>1&&`mh-calendar--multi`),role:`group`,"aria-label":e.label??`Calendar`},M(`div`,{class:`mh-calendar__months`},...y.map(e=>e.el))),x=()=>uh(u,i-1),S=e=>e>=u&&e<uh(u,i),C=``,w=()=>C!==u&&(C=u,y.forEach((e,t)=>{let o=uh(u,t),{year:s,month:c}=oh(o);e.title.textContent=yh(o,n);let l=Sh(s,c,r),d=[];for(let e=0;e<6;e+=1){let t=l.slice(e*7,e*7+7).map(e=>{let t=oh(e).month!==c;if(t&&i>1)return M(`td`,{role:`gridcell`,class:`mh-calendar__cell is-empty`});let n=M(`button`,{type:`button`,"data-date":e,"data-outside":t?`true`:null,"aria-label":m.format(sh(e)),"aria-current":e===a?`date`:null},h.format(oh(e).day));return M(`td`,{role:`gridcell`,class:`mh-calendar__cell`},n)});d.push(M(`tr`,{},...t))}e.body.replaceChildren(...d)}),_.disabled=!!e.min&&lh(u,-1)<e.min,v.disabled=!!e.max&&uh(u,i)>e.max,!0),T=()=>{let e=t===`range`&&s?s:null,n=e&&!e.end&&c?c:null,[r,i]=e?e.end?ph(e.start,e.end):n?ph(e.start,n):[e.start,e.start]:[``,``],l=!!e&&(!!e.end||!!n);for(let s of b.querySelectorAll(`button[data-date]`)){let c=s.dataset.date,u=g(c),f=t===`single`?c===o:!!e&&(c===e.start||c===e.end),p=!!e&&c>r&&c<i,m=l&&c===i;s.className=Ch({outside:s.dataset.outside===`true`,today:c===a,selected:f,start:l&&c===r,end:m,inRange:p,preview:!!n&&(p||m),disabled:u}),s.tabIndex=c===d?0:-1,u?s.setAttribute(`aria-disabled`,`true`):s.removeAttribute(`aria-disabled`),s.parentElement.setAttribute(`aria-selected`,f||p?`true`:`false`)}},E=()=>{let e=b.contains(document.activeElement),t=w();T(),e&&t&&D()};function D(){b.querySelector(`.mh-calendar__day[data-date="${d}"]`)?.focus({preventScroll:!0})}let O=(e,t=!0)=>{d=e,S(e)||(u=wh(e<u?e:uh(e,-(i-1)))),E(),t&&D()},k=n=>{if(!g(n)){if(d=n,t===`single`)o=n,S(n)||(u=wh(n)),E(),D(),e.onSelect?.(n);else{if(!s||s.end)s={start:n,end:null};else{let[e,t]=ph(s.start,n);s={start:e,end:t}}c=null,E(),D(),e.onRangeChange?.({...s})}}};_.addEventListener(`click`,()=>{u=uh(u,-1),d=A(uh(d,-1)),E()}),v.addEventListener(`click`,()=>{u=uh(u,1),d=A(uh(d,1)),E()});function A(e){if(e<u)return u;let t=lh(uh(x(),1),-1);return e>t?t:e}b.addEventListener(`click`,e=>{let t=e.target.closest(`.mh-calendar__day`);t?.dataset.date&&k(t.dataset.date)});let j=e=>{if(t!==`range`||!s||s.end)return;let n=e.target.closest(`.mh-calendar__day`)?.dataset.date??null;n!==c&&(c=n,T())};return b.addEventListener(`pointerover`,j),b.addEventListener(`focusin`,j),b.addEventListener(`pointerleave`,()=>{c&&!b.contains(document.activeElement)&&(c=null,T())}),b.addEventListener(`keydown`,e=>{let t=e.target.closest(`.mh-calendar__day`);if(!t?.dataset.date)return;let n=t.dataset.date,i=getComputedStyle(b).direction===`rtl`,a;switch(e.key){case`ArrowLeft`:a=lh(n,i?1:-1);break;case`ArrowRight`:a=lh(n,i?-1:1);break;case`ArrowUp`:a=lh(n,-7);break;case`ArrowDown`:a=lh(n,7);break;case`Home`:a=lh(n,-((fh(n)-r+7)%7));break;case`End`:a=lh(n,6-(fh(n)-r+7)%7);break;case`PageUp`:a=uh(n,e.shiftKey?-12:-1);break;case`PageDown`:a=uh(n,e.shiftKey?12:1);break;default:return}e.preventDefault(),O(a)}),E(),{el:b,getValue:()=>o,setValue(e){o=e,e&&(d=e,S(e)||(u=wh(e))),E()},getRange:()=>s?{...s}:null,setRange(e){s=e?{...e}:null,c=null,e&&(d=e.start,S(e.start)||(u=wh(e.start))),E()},showMonth(e){O(e,!1)},focus:D}}function Eh(e){let t=e?.closest(`[data-mh-theme]`);return t&&t!==document.documentElement?t:document.body}var Dh=[`a[href]`,`button:not([disabled])`,`input:not([disabled]):not([type="hidden"])`,`select:not([disabled])`,`textarea:not([disabled])`,`iframe`,`[tabindex]:not([tabindex="-1"])`,`[contenteditable="true"]`].join(`,`);function Oh(e){return[...e.querySelectorAll(Dh)].filter(e=>!e.closest(`[hidden], [inert]`))}function kh(e,t){if(e.key!==`Tab`)return;let n=Oh(t);if(n.length===0){e.preventDefault();return}let r=n.indexOf(document.activeElement);e.shiftKey&&r<=0?(e.preventDefault(),n[n.length-1].focus()):!e.shiftKey&&(r===-1||r===n.length-1)&&(e.preventDefault(),n[0].focus())}var Ah=0,jh=``;function Mh(){let e=document.documentElement;Ah===0&&(jh=e.style.overflow,e.style.overflow=`hidden`),Ah+=1;let t=!1;return()=>{t||(t=!0,--Ah,Ah===0&&(e.style.overflow=jh))}}var Nh=8;function Ph(e,t,n,r=6){let i=t.getBoundingClientRect(),a=e.getBoundingClientRect(),o=document.documentElement.clientWidth||window.innerWidth,s=document.documentElement.clientHeight||window.innerHeight,[c,l]=n.split(`-`),u=s-i.bottom-r,d=i.top-r,f=c;f===`bottom`&&a.height>u&&d>u?f=`top`:f===`top`&&a.height>d&&u>d&&(f=`bottom`);let p=f===`bottom`?i.bottom+r:i.top-r-a.height;p=Math.max(Nh,Math.min(p,s-a.height-Nh));let m=l===`start`?i.left:l===`end`?i.right-a.width:i.left+i.width/2-a.width/2;m=Math.max(Nh,Math.min(m,o-a.width-Nh)),e.style.top=`${Math.round(p)}px`,e.style.left=`${Math.round(m)}px`,e.dataset.side=f}function Fh(e){let{anchor:t}=e,n=M(`div`,{class:`mh-picker-popover`,role:`dialog`,id:I(`mh-picker-popover`),"aria-label":e.label},...e.content);t.setAttribute(`aria-haspopup`,`dialog`),t.setAttribute(`aria-expanded`,`false`);let r=!1,i=()=>Ph(n,t,e.placement??`bottom-start`,6),a=e=>{let r=e.target;!n.contains(r)&&!t.contains(r)&&c(!1)},o=e=>{r&&(e.type===`scroll`&&e.target instanceof Node&&n.contains(e.target)||i())};function s(){r||(r=!0,Eh(e.container??t).append(n),t.setAttribute(`aria-expanded`,`true`),t.setAttribute(`aria-controls`,n.id),e.onOpen?.(),i(),document.addEventListener(`pointerdown`,a,!0),window.addEventListener(`resize`,o),window.addEventListener(`scroll`,o,!0),e.initialFocus?e.initialFocus():n.querySelector(`button:not([disabled]), input:not([disabled]), [tabindex="0"]`)?.focus({preventScroll:!0}))}function c(i=!0){if(!r)return;r=!1,document.removeEventListener(`pointerdown`,a,!0),window.removeEventListener(`resize`,o),window.removeEventListener(`scroll`,o,!0),t.setAttribute(`aria-expanded`,`false`),t.removeAttribute(`aria-controls`);let s=n.contains(document.activeElement);n.remove(),(i||s)&&t.focus({preventScroll:!0}),e.onClose?.()}return n.addEventListener(`keydown`,e=>{e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),c(!0))}),n.addEventListener(`focusout`,e=>{let i=e.relatedTarget;r&&i&&!n.contains(i)&&i!==t&&c(!1)}),{el:n,open:s,close:c,isOpen:()=>r,reposition:()=>{r&&i()},destroy(){c(!1),t.removeAttribute(`aria-haspopup`),t.removeAttribute(`aria-expanded`)}}}function Ih(e=`medium`){return Pn(e,`mh-picker-trigger`)}function Lh(e,t){let n=M(`span`,{class:`mh-picker-trigger__value`,id:I(`mh-picker-value`)});return{el:M(`button`,{type:`button`,class:Ih(t)},Kn(H(e)),n,Kn(H(Yn,{class:`mh-picker-trigger__chevron`}),!0)),value:n}}function Rh(e,t,n){if(t)e.el.setAttribute(`aria-labelledby`,`${t.label.id} ${e.value.id}`);else if(n){let t=M(`span`,{class:`mh-visually-hidden`,id:I(`mh-picker-name`)},n);e.el.prepend(t),e.el.setAttribute(`aria-labelledby`,`${t.id} ${e.value.id}`)}}function zh(e={}){let t=e.locale,n=e.value??null,i=Lh(r,e.size),a=e.name?M(`input`,{type:`hidden`,name:e.name}):null,o=M(`div`,{class:`mh-date-picker`},i.el,a),s=Th({value:n,min:e.min,max:e.max,isDateDisabled:e.isDateDisabled,locale:t,weekStartsOn:e.weekStartsOn,label:e.label??e.ariaLabel,onSelect:e=>{h(e),f.close(!0)}}),c=ch(),l=mh(c,e.min,e.max)&&!(e.isDateDisabled?.(c)??!1),u=[];if(e.showToday??!0){let e=M(`button`,{type:`button`,class:B(z(`text`,`small`),`mh-picker-popover__today`)},M(`span`,{class:`mh-button__label`},`Today`));e.disabled=!l,e.addEventListener(`click`,()=>{h(c),f.close(!0)}),u.push(e)}if(e.clearable){let e=M(`button`,{type:`button`,class:B(z(`text`,`small`),`mh-picker-popover__clear`)},M(`span`,{class:`mh-button__label`},`Clear`));e.addEventListener(`click`,()=>{h(null),f.close(!0)}),u.push(e)}let d=u.length?M(`div`,{class:`mh-picker-popover__footer`},...u):null,f=Fh({anchor:i.el,label:e.label??e.ariaLabel??`Choose a date`,content:d?[s.el,d]:[s.el],container:e.container,onOpen:()=>s.showMonth(hh(n??c,e.min,e.max)),initialFocus:()=>s.focus()}),p=e.label?pn({label:e.label,control:o,target:i.el,helper:e.helper,error:e.error,labelStyle:e.labelStyle}):null;Rh(i,p,e.ariaLabel);let m=()=>{i.value.textContent=n?bh(n,t,e.format):e.placeholder??`Choose a date`,i.el.classList.toggle(`is-empty`,!n),a&&(a.value=n??``)};function h(t){let r=t!==n;n=t,s.setValue(t),m(),r&&e.onChange?.(t)}i.el.addEventListener(`click`,()=>f.isOpen()?f.close(!0):f.open()),i.el.addEventListener(`keydown`,e=>{e.key===`ArrowDown`&&e.altKey&&(e.preventDefault(),f.open())}),m();let g={el:p?.el??o,trigger:i.el,calendar:s,popover:f,field:p,getValue:()=>n,setValue(e){n=e,s.setValue(e),m()},open:()=>f.open(),close:()=>f.close(!0),setError:e=>p?.setError(e),setDisabled(e){e&&f.close(!1),i.el.disabled=e,i.el.classList.toggle(`is-disabled`,e),p?.setDisabled(e)},destroy:()=>f.destroy()};return e.disabled&&g.setDisabled(!0),g}function Bh(e={}){let t=e.locale,n=e.value??null,i=Lh(r,e.size),a=e.name?M(`input`,{type:`hidden`,name:`${e.name}-start`}):null,o=e.name?M(`input`,{type:`hidden`,name:`${e.name}-end`}):null,s=M(`div`,{class:`mh-date-range-picker`},i.el,a,o),c=M(`p`,{class:`mh-picker-popover__status`,"aria-live":`polite`}),l=Th({mode:`range`,range:n,min:e.min,max:e.max,isDateDisabled:e.isDateDisabled,locale:t,weekStartsOn:e.weekStartsOn,months:e.months??2,label:e.label??e.ariaLabel,onRangeChange:e=>{e.end?(v({start:e.start,end:e.end}),h.close(!0)):u(e)}}),u=e=>{c.textContent=e&&!e.end?`From ${bh(e.start,t)}. Now pick the end date.`:`Pick the start date.`},d=e.presets?.length?M(`div`,{class:`mh-picker-popover__presets`,role:`group`,"aria-label":`Presets`},...e.presets.map(e=>{let t=M(`button`,{type:`button`,class:B(z(`text`,`small`),`mh-picker-popover__preset`)},M(`span`,{class:`mh-button__label`},e.label));return t.addEventListener(`click`,()=>{v({...e.range}),h.close(!0)}),t})):null,f=e.clearable?M(`button`,{type:`button`,class:B(z(`text`,`small`),`mh-picker-popover__clear`)},M(`span`,{class:`mh-button__label`},`Clear`)):null;f?.addEventListener(`click`,()=>{v(null),h.close(!0)});let p=M(`div`,{class:`mh-picker-popover__footer`},c,f),m=M(`div`,{class:B(`mh-picker-popover__body`,d&&`mh-picker-popover__body--presets`)},d,l.el),h=Fh({anchor:i.el,label:e.label??e.ariaLabel??`Choose dates`,content:[m,p],container:e.container,onOpen:()=>{l.setRange(n),l.showMonth(hh(n?.start??ch(),e.min,e.max)),u(null)},initialFocus:()=>l.focus()}),g=e.label?pn({label:e.label,control:s,target:i.el,helper:e.helper,error:e.error,labelStyle:e.labelStyle}):null;Rh(i,g,e.ariaLabel);let _=()=>{i.value.textContent=n?xh(n.start,n.end,t,e.format):e.placeholder??`Choose dates`,i.el.classList.toggle(`is-empty`,!n),a&&(a.value=n?.start??``),o&&(o.value=n?.end??``)};function v(t){let r=t?.start!==n?.start||t?.end!==n?.end;n=t,l.setRange(t),_(),r&&e.onChange?.(t?{...t}:null)}i.el.addEventListener(`click`,()=>h.isOpen()?h.close(!0):h.open()),i.el.addEventListener(`keydown`,e=>{e.key===`ArrowDown`&&e.altKey&&(e.preventDefault(),h.open())}),_();let y={el:g?.el??s,trigger:i.el,calendar:l,popover:h,field:g,getValue:()=>n?{...n}:null,setValue(e){n=e?{...e}:null,l.setRange(n),_()},open:()=>h.open(),close:()=>h.close(!0),setError:e=>g?.setError(e),setDisabled(e){e&&h.close(!1),i.el.disabled=e,i.el.classList.toggle(`is-disabled`,e),g?.setDisabled(e)},destroy:()=>h.destroy()};return e.disabled&&y.setDisabled(!0),y}function Vh(e){switch(e){case`time`:return Er;case`datetime-local`:return hr;case`month`:return Vn;case`week`:return ar;default:return r}}function Hh(e){return e===`time`?`Open time picker`:`Open date picker`}function Uh(e){return Pn(e,`mh-datetime`)}var Wh=B(l(`default`,`small`),`mh-datetime__button`);function Gh(e){e.focus();try{e.showPicker?.()}catch{}}function Kh(e={}){let t=e.type??`date`,n=M(`input`,{class:`mh-input__control`,type:t,name:e.name,min:e.min,max:e.max,step:e.step,readonly:e.readOnly,"aria-label":e.label?void 0:e.ariaLabel});n.value=e.value??``;let r=e.icon===!1?null:e.icon??Vh(t),i=r?M(`button`,{type:`button`,class:Wh,tabindex:-1,"aria-label":Hh(t),title:Hh(t)},H(r)):null;i?.addEventListener(`click`,()=>{!n.disabled&&!n.readOnly&&Gh(n)});let a=M(`div`,{class:Uh(e.size)},n,i);nn(a,n);let o=e.label?pn({label:e.label,control:a,target:n,helper:e.helper,error:e.error,success:e.success,required:e.required,labelStyle:e.labelStyle}):null;e.onInput&&n.addEventListener(`input`,t=>e.onInput(n.value,t)),e.onChange&&n.addEventListener(`change`,t=>e.onChange(n.value,t));let s={el:o?.el??a,input:n,field:o,getValue:()=>n.value,setValue(e){n.value=e},setError:e=>o?.setError(e),setDisabled(e){n.disabled=e,i&&(i.disabled=e),a.classList.toggle(`is-disabled`,e),o?.setDisabled(e)}};return e.disabled&&s.setDisabled(!0),s}function qh(e,t){if(!t?.trim())return!0;let n=e.name.toLowerCase(),r=(e.type||``).toLowerCase();return t.split(`,`).map(e=>e.trim().toLowerCase()).filter(Boolean).some(e=>e.startsWith(`.`)?n.endsWith(e):e.endsWith(`/*`)?r.startsWith(e.slice(0,-1)):r===e)}function Jh(e,t){let n=[`byte`,`kilobyte`,`megabyte`,`gigabyte`,`terabyte`],r=Math.max(0,e),i=0;for(;r>=1e3&&i<n.length-1;)r/=1e3,i+=1;return new Intl.NumberFormat(t,{style:`unit`,unit:n[i],unitDisplay:i===0?`long`:`short`,maximumFractionDigits:+(r<10&&i>0)}).format(r)}function Yh(e,t={}){if(e.length===0)return``;let n=e[0],r=e.length>1?` (and ${e.length-1} more)`:``;switch(n.reason){case`type`:return`${n.file.name} isn't a file type this accepts${r}.`;case`size`:return`${n.file.name} is larger than ${Jh(t.maxSize??0,t.locale)}${r}.`;default:return t.maxFiles===1?`Only one file can be added.`:`Up to ${t.maxFiles??0} files can be added.`}}var Xh=e=>!!e.dataTransfer&&[...e.dataTransfer.types??[]].includes(`Files`);function Zh(e={}){let t=e.multiple??!0,n=[],r=!1,i=0,a=M(`input`,{type:`file`,class:`mh-drop-zone__input`,tabindex:-1,"aria-hidden":`true`,accept:e.accept,multiple:t,name:e.name,id:I(`mh-drop-input`)}),o=I(`mh-drop-title`),s=I(`mh-drop-hint`),c=I(`mh-drop-message`),u=M(`button`,{type:`button`,class:B(z(`secondary`,`small`),`mh-drop-zone__button`),"aria-describedby":B(e.hint?s:null,c)},M(`span`,{class:`mh-button__label`},e.buttonLabel??(t?`Browse files`:`Choose a file`))),d=M(`div`,{class:`mh-drop-zone__area`},H(e.icon??`M2 12H4V17H20V12H22V17C22 18.11 21.11 19 20 19H4C2.9 19 2 18.11 2 17V12M12 2L6.46 7.46L7.88 8.88L11 5.75V15H13V5.75L16.13 8.88L17.55 7.45L12 2Z`,{class:`mh-drop-zone__icon`}),M(`p`,{class:`mh-drop-zone__title`,id:o},e.title??(t?`Drop files here`:`Drop a file here`)),e.hint?M(`p`,{class:`mh-drop-zone__hint`,id:s},e.hint):null,u),f=M(`p`,{class:`mh-drop-zone__message`,id:c,"aria-live":`polite`,hidden:!0}),p=M(`ul`,{class:`mh-drop-zone__list`,hidden:!0,"aria-label":`Added files`}),m=M(`div`,{class:`mh-drop-zone`},a,d,f,e.showList===!1?null:p),h=e=>{f.textContent=e??``,f.hidden=!e,m.classList.toggle(`is-invalid`,!!e)},g=()=>{e.showList!==!1&&(p.hidden=n.length===0,p.replaceChildren(...n.map((t,n)=>{let i=M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-drop-zone__remove`),"aria-label":`Remove ${t.name}`,title:`Remove`},H(Hr));return i.disabled=r,i.addEventListener(`click`,()=>{v.removeFile(n);let e=p.querySelectorAll(`.mh-drop-zone__remove`);(e[Math.min(n,e.length-1)]??u).focus()}),M(`li`,{class:`mh-drop-zone__file`},H(N,{class:`mh-drop-zone__file-icon`}),M(`span`,{class:`mh-drop-zone__file-name`,title:t.name},t.name),M(`span`,{class:`mh-drop-zone__file-size`},Jh(t.size,e.locale)),i)})))},_=i=>{if(r)return;let a=[],o=[],s=t?e.maxFiles??1/0:1;for(let t of i)qh(t,e.accept)?e.maxSize!==void 0&&t.size>e.maxSize?o.push({file:t,reason:`size`}):a.push(t):o.push({file:t,reason:`type`});let c;if(t){let e=Math.max(0,s-n.length);c=a.slice(0,e);for(let t of a.slice(e))o.push({file:t,reason:`count`});n=[...n,...c]}else{c=a.slice(0,1);for(let e of a.slice(1))o.push({file:e,reason:`count`});c.length&&(n=c)}h(Yh(o,{maxSize:e.maxSize,maxFiles:t?e.maxFiles:1,locale:e.locale})||void 0),g(),e.onFiles?.(c,o),c.length&&e.onChange?.([...n])};u.addEventListener(`click`,()=>{r||a.click()}),d.addEventListener(`click`,e=>{!r&&e.target!==u&&!u.contains(e.target)&&a.click()}),a.addEventListener(`change`,()=>{a.files&&_([...a.files]),a.value=``}),m.addEventListener(`dragenter`,e=>{!r&&Xh(e)&&(e.preventDefault(),i+=1,m.classList.add(`is-dragover`))}),m.addEventListener(`dragover`,e=>{!r&&Xh(e)&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`copy`))}),m.addEventListener(`dragleave`,()=>{i=Math.max(0,i-1),i===0&&m.classList.remove(`is-dragover`)}),m.addEventListener(`drop`,e=>{!r&&Xh(e)&&(e.preventDefault(),i=0,m.classList.remove(`is-dragover`),_([...e.dataTransfer?.files??[]]))});let v={el:m,input:a,button:u,getFiles:()=>[...n],addFiles:e=>_(e),removeFile(t){t<0||t>=n.length||(n=n.filter((e,n)=>n!==t),h(void 0),g(),e.onChange?.([...n]))},clear(){n=[],h(void 0),g()},setError:h,setDisabled(e){r=e,m.classList.toggle(`is-disabled`,e),u.disabled=e,a.disabled=e,g()}};return e.disabled&&v.setDisabled(!0),v}var Qh=e=>Math.round(Math.min(100,Math.max(0,e))*10)/10;function $h(e){return e.map(e=>({offset:Qh(e.offset),color:Jm(Km(e.color)??{r:0,g:0,b:0,a:1}),opacity:Math.min(1,Math.max(0,e.opacity??1))})).sort((e,t)=>e.offset-t.offset)}function eg(e,t){let n=$h(e);if(n.length===0)return{color:`#000000`,opacity:1};let r=e=>({...Km(e.color),a:e.opacity}),i=r(n[0]);if(t>=n[n.length-1].offset)i=r(n[n.length-1]);else for(let e=0;e<n.length-1;e+=1){let a=n[e],o=n[e+1];if(t>=a.offset&&t<=o.offset){i=Zm(r(a),r(o),o.offset===a.offset?0:(t-a.offset)/(o.offset-a.offset));break}}return{color:Jm(i),opacity:Math.round(i.a*1e3)/1e3}}function tg(e,t=90){let n=$h(e).map(e=>`${Qm({...Km(e.color),a:e.opacity})} ${e.offset}%`);return`linear-gradient(${Math.round(t)}deg, ${n.join(`, `)})`}var ng=[{offset:0,color:`#000000`},{offset:100,color:`#ffffff`}];function rg(e={}){let t=e=>$h(e.length>=2?e:ng).map(e=>({id:I(`mh-stop`),offset:e.offset,rgba:{...Km(e.color),a:e.opacity}})),n=t(e.stops??ng),r=n[0].id,i=e.angle??90,a=!1,o=M(`div`,{class:`mh-gradient-editor__fill`,"aria-hidden":`true`}),s=M(`div`,{class:`mh-gradient-editor__stops`}),c=M(`div`,{class:`mh-gradient-editor__track`},o,s),u=M(`p`,{class:`mh-gradient-editor__hint`,id:I(`mh-gradient-hint`)},`Press the bar to add a stop. Arrow keys move the selected stop; Delete removes it.`),d=M(`input`,{class:`mh-input__control mh-gradient-editor__position`,type:`number`,min:0,max:100,step:1,inputmode:`decimal`,"aria-label":`Stop position`}),f=M(`div`,{class:Pn(`small`,`mh-gradient-editor__position-box`)},d,Kn(`%`,!0)),p=M(`button`,{type:`button`,class:B(l(`danger`,`small`),`mh-gradient-editor__remove`),"aria-label":`Remove stop`,title:`Remove stop`},H(Ne)),m=M(`button`,{type:`button`,class:B(z(`text`,`small`),`mh-gradient-editor__add`)},H(vt),M(`span`,{class:`mh-button__label`},`Add stop`)),h=e.showAngle?M(`input`,{class:`mh-input__control mh-gradient-editor__angle`,type:`number`,min:0,max:360,step:1,"aria-label":`Angle`}):null,g=h?M(`div`,{class:Pn(`small`,`mh-gradient-editor__angle-box`)},h,Kn(`°`,!0)):null,_=rh({alpha:!0,swatches:e.swatches,label:`Stop colour`,onInput:e=>C(e,!1),onChange:e=>C(e,!0)}),v=M(`div`,{class:`mh-gradient-editor`,role:`group`,"aria-label":e.label??`Gradient`},c,u,M(`div`,{class:`mh-gradient-editor__toolbar`},f,p,m,g),_.el),y=()=>[...n].sort((e,t)=>e.offset-t.offset).map(e=>({offset:e.offset,color:Jm(e.rgba),opacity:Math.round(e.rgba.a*1e3)/1e3})),b=t=>{let n=y();e.onInput?.(n,i),t&&e.onChange?.(n,i)},x=()=>n.find(e=>e.id===r)??n[0],S=(e=!1)=>{v.style.setProperty(`--_fill`,tg(y(),90)),v.style.setProperty(`--_gradient`,tg(y(),i));let t=[...n].sort((e,t)=>e.offset-t.offset),o=new Map([...s.children].map(e=>[e.dataset.stop,e])),c=new Set;t.forEach((e,n)=>{c.add(e.id);let i=o.get(e.id);i||(i=M(`div`,{class:`mh-gradient-editor__stop`,role:`slider`,"data-stop":e.id,"aria-valuemin":0,"aria-valuemax":100,"aria-describedby":u.id},M(`span`,{class:`mh-gradient-editor__chip`})),s.append(i));let l=Jm(e.rgba);i.style.setProperty(`--_at`,String(e.offset/100)),i.style.setProperty(`--_stop`,Qm(e.rgba)),i.setAttribute(`aria-valuenow`,String(e.offset)),i.setAttribute(`aria-valuetext`,`${e.offset}%, ${l}, opacity ${Math.round(e.rgba.a*100)}%`),i.setAttribute(`aria-label`,`Stop ${n+1} of ${t.length}`),i.tabIndex=a?-1:e.id===r?0:-1,i.classList.toggle(`is-selected`,e.id===r)});for(let[e,t]of o)c.has(e)||t.remove();let l=x();d.value=String(l.offset),p.disabled=a||n.length<=2,h&&(h.value=String(Math.round(i))),_.setValue(Jm(l.rgba,!0)),e&&s.querySelector(`[data-stop="${r}"]`)?.focus({preventScroll:!0})};function C(e,t){let n=Km(e);n&&(x().rgba=n,S(),b(t))}let w=(e,t=!0)=>{r=e,S(t)},T=(e,t)=>{x().offset=Qh(e),S(!0),b(t)},E=()=>{if(n.length<=2)return;let e=[...n].sort((e,t)=>e.offset-t.offset),t=e.findIndex(e=>e.id===r);n=n.filter(e=>e.id!==r),r=(e[t+1]??e[t-1]).id,S(!0),b(!0)},D=e=>{let t=eg(y(),e),r={id:I(`mh-stop`),offset:Qh(e),rgba:{...Km(t.color),a:t.opacity}};n=[...n,r],w(r.id),b(!0)},O=e=>{let t=c.getBoundingClientRect();if(t.width===0)return x().offset;let n=(e.clientX-t.left)/t.width;return Qh((getComputedStyle(v).direction===`rtl`?1-n:n)*100)},k=null;c.addEventListener(`pointerdown`,e=>{if(a||e.button!==0)return;e.preventDefault();let t=e.target.closest(`.mh-gradient-editor__stop`);t?.dataset.stop?(w(t.dataset.stop),k=t.dataset.stop,c.setPointerCapture?.(e.pointerId),c.classList.add(`is-dragging`)):D(O(e))}),c.addEventListener(`pointermove`,e=>{k&&T(O(e),!1)});let A=()=>{k&&(k=null,c.classList.remove(`is-dragging`),b(!0))};c.addEventListener(`pointerup`,A),c.addEventListener(`pointercancel`,A),s.addEventListener(`focusin`,e=>{let t=e.target.dataset.stop;t&&t!==r&&w(t,!1)}),s.addEventListener(`keydown`,e=>{if(a)return;let t=x(),r=e.shiftKey?10:1,i=getComputedStyle(v).direction===`rtl`,o=[...n].sort((e,t)=>e.offset-t.offset),s=o.findIndex(e=>e.id===t.id);switch(e.key){case`ArrowLeft`:case`ArrowDown`:T(t.offset+(e.key===`ArrowLeft`&&i?r:-r),!0);break;case`ArrowRight`:case`ArrowUp`:T(t.offset+(e.key===`ArrowRight`&&i?-r:r),!0);break;case`Home`:T(0,!0);break;case`End`:T(100,!0);break;case`PageUp`:case`PageDown`:{let t=o[s+(e.key===`PageUp`?1:-1)];t&&w(t.id);break}case`Delete`:case`Backspace`:E();break;default:return}e.preventDefault()}),d.addEventListener(`change`,()=>{let e=Number(d.value);d.value!==``&&Number.isFinite(e)?(x().offset=Qh(e),S(),b(!0)):S()}),p.addEventListener(`click`,E),m.addEventListener(`click`,()=>{let e=[...n].sort((e,t)=>e.offset-t.offset),t=e.findIndex(e=>e.id===r),i=e[t],a=e[t+1]??e[t-1];D((i.offset+a.offset)/2)}),h?.addEventListener(`change`,()=>{let e=Number(h.value);h.value!==``&&Number.isFinite(e)&&(i=(e%360+360)%360,b(!0)),S()}),S();let j={el:v,picker:_,getStops:y,setStops(e){n=t(e),r=n[0].id,S()},getAngle:()=>i,setAngle(e){i=e,S()},css:()=>tg(y(),i),setDisabled(e){a=e,v.classList.toggle(`is-disabled`,e),d.disabled=e,m.disabled=e,h&&(h.disabled=e),_.setDisabled(e),S()}};return e.disabled&&j.setDisabled(!0),j}function ig(e){let t=e.replace(/[-_.:]+/g,` `).trim();return t.charAt(0).toUpperCase()+t.slice(1)}function ag(){return Object.entries(Kt).map(([e,t])=>({name:e,path:t,label:ig(e)}))}var og=e=>{let t=typeof e==`string`?{name:e}:e;return{name:t.name,path:t.path??Kt[t.name]??``,label:t.label??ig(t.name),keywords:t.keywords??[]}};function sg(e,t){let n=t.toLowerCase().split(/\s+/).filter(Boolean);if(n.length===0)return!0;let r=[e.name,e.label??ig(e.name),...e.keywords??[]].join(` `).toLowerCase();return n.every(e=>r.includes(e))}var cg=``;function lg(e={}){let t=(e.icons??ag()).map(og),n=e.value??null,r=!1,i=e.label??`Icon`,a=e.search??t.length>12,o=M(`div`,{class:`mh-icon-picker__grid`,role:`listbox`,"aria-label":i,id:I(`mh-icon-picker`)}),s=M(`p`,{class:`mh-icon-picker__empty`,hidden:!0},`No icons match.`),c=M(`p`,{class:`mh-visually-hidden`,"aria-live":`polite`}),l=a?Rd({label:`Search ${i.toLowerCase()}s`,placeholder:`Search icons`,size:`small`,onInput:e=>_(e)}):null;l?.input.setAttribute(`aria-controls`,o.id);let u=M(`div`,{class:`mh-icon-picker`,role:`group`,"aria-label":i},l?.el??null,o,s,c),d=[...e.allowNone?[{name:cg,path:``,label:`No icon`,keywords:[`none`,`empty`]}]:[],...t].map(e=>({item:e,el:M(`div`,{class:B(`mh-icon-picker__option`,e.name===cg&&`mh-icon-picker__option--none`),role:`option`,id:I(`mh-icon-option`),tabindex:-1,"aria-selected":`false`,title:e.label,"data-name":e.name},e.name===cg?H(Hr):H(e.path),M(`span`,{class:`mh-visually-hidden`},e.label))}));o.append(...d.map(e=>e.el));let f=()=>d.filter(e=>!e.el.hidden).map(e=>e.el),p=null,m=(e,t)=>{p=e;for(let t of d)t.el.tabIndex=!r&&t.el===e?0:-1;e&&t&&(e.focus({preventScroll:!0}),e.scrollIntoView?.({block:`nearest`}))},h=()=>d.find(e=>e.item.name===cg?n===null:e.item.name===n)?.el,g=()=>{let e=h();for(let t of d){let n=t.el===e;t.el.setAttribute(`aria-selected`,String(n)),t.el.classList.toggle(`is-selected`,n)}let t=f();!p||p.hidden?m((e&&!e.hidden?e:t[0])??null,!1):m(p,!1)};function _(e){let t=0;for(let n of d){let r=sg(n.item,e);n.el.hidden=!r,r&&(t+=1)}s.hidden=t>0,c.textContent=e.trim()?t===1?`1 icon`:`${t} icons`:``,p=null,g()}let v=t=>{if(r)return;let i=t.dataset.name??cg,a=i===cg?null:i;m(t,!0),a!==n&&(n=a,g(),e.onChange?.(a))},y=e=>{if(e.length<2)return 1;let t=e[0].offsetTop,n=e.findIndex(e=>e.offsetTop!==t);return n===-1?e.length:n};o.addEventListener(`click`,e=>{let t=e.target.closest(`.mh-icon-picker__option`);t&&v(t)}),o.addEventListener(`keydown`,e=>{if(r)return;let t=f(),n=p?t.indexOf(p):-1,i=y(t),a=getComputedStyle(u).direction===`rtl`,o;switch(e.key){case`ArrowRight`:o=n+(a?-1:1);break;case`ArrowLeft`:o=n+(a?1:-1);break;case`ArrowDown`:o=n+i;break;case`ArrowUp`:o=n-i;break;case`Home`:o=e.ctrlKey?0:n-n%i;break;case`End`:o=e.ctrlKey?t.length-1:Math.min(t.length-1,n-n%i+i-1);break;case`Enter`:case` `:e.preventDefault(),p&&v(p);return;default:return}e.preventDefault();let s=t[Math.max(0,Math.min(t.length-1,o))];s&&m(s,!0)}),l?.input.addEventListener(`keydown`,e=>{e.key===`ArrowDown`&&p&&(e.preventDefault(),m(p,!0))}),g();let b={el:u,listbox:o,search:l,getValue:()=>n,setValue(e){n=e,p=null,g()},filter(e){l?.setValue(e),_(e)},setDisabled(e){r=e,u.classList.toggle(`is-disabled`,e),e?o.setAttribute(`aria-disabled`,`true`):o.removeAttribute(`aria-disabled`),l?.setDisabled(e),g()}};return e.disabled&&b.setDisabled(!0),b}var ug=(...e)=>M(`div`,{class:`ex-stack`,style:`max-width: 420px`},...e),dg=(...e)=>M(`div`,{class:`ex-row`,style:`align-items: flex-start`},...e),fg=e=>M(`p`,{class:`mh-text--caption mh-text--muted`,"aria-live":`polite`},e),pg=e=>M(`p`,{class:`mh-text--eyebrow mh-text--muted`},e);function mg(e){let t=fh(e);if(t===0)return{start:e,end:e};let n=lh(e,6-t);return{start:n,end:lh(n,1)}}var hg=[{id:`date-time-field`,render:()=>{let e=fg(`Change a value to see it here.`),t=t=>n=>{e.textContent=`${t}: ${n||`(empty)`}`};return ug(Kh({label:`Holiday starts`,type:`date`,value:`2026-12-21`,helper:`The heating stays in away mode until you are back.`,onChange:t(`Date`)}).el,Kh({label:`Wake-up light`,type:`time`,value:`06:45`,step:60,onChange:t(`Time`)}).el,Kh({label:`Delivery window`,type:`datetime-local`,value:`2026-10-20T14:00`,labelStyle:`eyebrow`,onChange:t(`Date and time`)}).el,dg(Kh({label:`Billing month`,type:`month`,value:`2026-10`,size:`small`,onChange:t(`Month`)}).el,Kh({label:`Rota week`,type:`week`,value:`2026-W43`,size:`small`,onChange:t(`Week`)}).el),Kh({label:`Filter changed`,type:`date`,value:`2099-01-01`,max:ch(),error:`That date is still to come.`,required:!0}).el,Kh({label:`Installed`,type:`date`,value:`2024-03-08`,disabled:!0}).el,Kh({ariaLabel:`Quiet hours start`,type:`time`,value:`22:00`,icon:!1,size:`large`}).el,e)}},{id:`date-picker`,render:()=>{let e=ch(),t=fg(`Nothing picked yet.`),n=zh({label:`Visit date`,value:lh(e,3),clearable:!0,helper:`Arrow keys move by day and week, Page Up and Page Down by month.`,onChange:e=>t.textContent=e?`Picked ${bh(e,void 0,{dateStyle:`full`})}.`:`Cleared.`}),r=zh({label:`Cleaning day`,placeholder:`Any weekday in the next two months`,min:e,max:lh(e,60),isDateDisabled:e=>fh(e)===0||fh(e)===6,format:{weekday:`long`,day:`numeric`,month:`long`},labelStyle:`eyebrow`});return ug(n.el,t,r.el,zh({label:`Liefertermin (de-DE)`,locale:`de-DE`,value:e,size:`small`}).el,zh({label:`Bin collection (en-US, weeks from Sunday)`,locale:`en-US`,value:e}).el,zh({label:`Warranty ends`,value:`2027-05-31`,error:`The warranty has to end after the purchase date.`}).el,zh({label:`Commissioned`,value:`2025-02-14`,disabled:!0}).el)}},{id:`date-range-picker`,render:()=>{let e=ch(),t=fg(`Pick a start and an end date.`),n=Bh({label:`Away from home`,clearable:!0,presets:[{label:`This weekend`,range:mg(e)},{label:`Next 7 days`,range:{start:e,end:lh(e,6)}},{label:`Next 14 days`,range:{start:e,end:lh(e,13)}}],min:e,helper:`The house runs in away mode on these days.`,onChange:e=>t.textContent=e?`${xh(e.start,e.end,void 0,{dateStyle:`long`})}.`:`Cleared.`}),r=Bh({label:`Energy history`,months:1,max:e,value:{start:lh(e,-6),end:e},labelStyle:`eyebrow`,size:`small`});return ug(n.el,t,r.el,Bh({label:`Guest access`,disabled:!0,value:{start:`2026-08-01`,end:`2026-08-04`}}).el)}},{id:`color-picker`,render:()=>{let e=fg(``),t=M(`span`,{style:`display:inline-block;flex:none;width:2.5em;height:2.5em;border-radius:var(--mh-radius-control);box-shadow:inset 0 0 0 var(--mh-border-width) var(--mh-outline)`}),n=n=>{e.textContent=`Lamp colour ${n}`,t.style.background=n},r=rh({value:`#ff9a3c`,label:`Lamp colour`,onInput:n});n(r.getValue());let i=rh({value:`#3c8cff99`,alpha:!0,label:`Overlay tint`,swatches:[{color:`#ffb35c`,label:`Candle`},{color:`#fff1d6`,label:`Warm white`},{color:`#e8f0ff`,label:`Daylight`},{color:`#5c7cff80`,label:`Dusk, half clear`},{color:`#00000000`,label:`Clear`}]}),a=(e,t,...n)=>M(`div`,{class:`ex-stack`,style:`width: min(100%, ${t}px)`},pg(e),...n);return M(`div`,{class:`ex-stack`},dg(a(`Default swatches`,300,r.el,M(`div`,{class:`ex-row`},t,e)),a(`With opacity and own swatches`,300,i.el)),dg(a(`No swatches`,260,rh({value:`#4caf7d`,swatches:!1,eyedropper:!1,label:`Plant shelf`}).el),a(`Disabled`,260,rh({value:`#9c6bff`,disabled:!0,swatches:!1}).el)))}},{id:`gradient-editor`,render:()=>{let e=M(`div`,{style:`height: 96px; border-radius: var(--mh-radius-lg); box-shadow: inset 0 0 0 var(--mh-border-width) var(--mh-outline)`}),t=M(`code`,{class:`mh-text--caption mh-text--mono mh-text--muted`,style:`overflow-wrap: anywhere`}),n=rg({label:`Sunrise light`,showAngle:!0,angle:90,stops:[{offset:0,color:`#1a1446`},{offset:35,color:`#c2457a`},{offset:70,color:`#ff9f43`},{offset:100,color:`#fff3c4`,opacity:.6}],onInput:()=>r()});function r(){e.style.background=n.css(),t.textContent=n.css()}r();let i=rg({label:`Fade`,stops:[{offset:0,color:`#2fbf9f`},{offset:100,color:`#2fbf9f`,opacity:0}],swatches:!1});return M(`div`,{class:`ex-stack`,style:`max-width: 520px`},pg(`Sunrise wake-up`),e,n.el,t,pg(`Colour to clear, no swatches`),i.el)}},{id:`icon-picker`,render:()=>{let e=fg(`Choose an icon.`),t=lg({value:`lightbulb`,label:`Icon`,onChange:t=>e.textContent=t?`Picked “${ig(t)}”.`:`No icon.`}),n=lg({label:`Room icon`,allowNone:!0,value:`sofa`,search:!1,icons:[{name:`sofa`,path:Ar,label:`Living room`,keywords:[`lounge`,`couch`]},{name:`bed`,path:ge,label:`Bedroom`,keywords:[`sleep`]},{name:`kitchen`,path:O,label:`Kitchen`,keywords:[`cook`,`oven`]},{name:`dining`,path:Tr,label:`Dining room`,keywords:[`eat`]},{name:`utility`,path:pr,label:`Utility room`,keywords:[`laundry`]},{name:`hall`,path:Oe,label:`Hallway`,keywords:[`entrance`,`door`]},{name:`garage`,path:Ft,label:`Garage`,keywords:[`car`]},{name:`garden`,path:St,label:`Garden`,keywords:[`outside`,`plants`]},{name:`den`,path:ve,label:`Den`,keywords:[`tv`,`media`]},{name:`nook`,path:nt,label:`Reading nook`,keywords:[`coffee`]}]});return M(`div`,{class:`ex-stack`,style:`max-width: 460px`},pg(`Built-in set, with search`),t.el,e,pg(`Your own list, with “No icon”`),n.el,pg(`Disabled`),lg({icons:[`home`,`fan`,`lock`,`wifi`],value:`fan`,disabled:!0}).el)}},{id:`file-drop-zone`,render:()=>{let e=fg(``),t=Zh({hint:`PNG, JPG or WebP, up to 5 MB each, up to 4 files`,accept:`image/png,image/jpeg,image/webp`,maxSize:5e6,maxFiles:4,onChange:t=>e.textContent=t.length?`${t.length} file${t.length===1?``:`s`}, ${Jh(t.reduce((e,t)=>e+t.size,0))} in all.`:``}),n=M(`button`,{type:`button`,class:`mh-button mh-button--text mh-button--sm`},M(`span`,{class:`mh-button__label`},`Add sample files`));return n.addEventListener(`click`,()=>t.addFiles([new File([new Uint8Array(18e4)],`hallway-plan.png`,{type:`image/png`}),new File([new Uint8Array(2400)],`notes.txt`,{type:`text/plain`})])),ug(t.el,M(`div`,{class:`ex-row`},n,e),Zh({multiple:!1,title:`Drop a backup file`,hint:`A .json or .tar backup`,accept:`.json,.tar`,icon:`download`}).el,Zh({hint:`Uploads are paused`,disabled:!0}).el)}}],gg=`${l()} mh-page-header__back`;function _g(e){let t=e.back?.label??`Back`,n=null;e.back&&(n=e.back.href?M(`a`,{class:gg,href:e.back.href,"aria-label":t,title:t},H(In)):M(`button`,{type:`button`,class:gg,"aria-label":t,title:t},H(In)),e.back.onClick&&n.addEventListener(`click`,e.back.onClick));let r=M(`p`,{class:`mh-page-header__eyebrow`}),i=M(`h${e.level??1}`,{class:`mh-page-header__title`},e.title),a=M(`p`,{class:`mh-page-header__subtitle`}),o=M(`div`,{class:`mh-page-header__actions`}),s=M(`header`,{class:`mh-page-header`},n,M(`hgroup`,{class:`mh-page-header__text`},r,i,a),o),c=(e,t)=>{e.textContent=t??``,e.hidden=!t},l={el:s,setTitle:e=>void(i.textContent=e),setSubtitle:e=>c(a,e),setEyebrow:e=>c(r,e),setActions(...e){o.replaceChildren(),it(o,...e),o.hidden=o.childNodes.length===0}};return c(r,e.eyebrow),c(a,e.subtitle),l.setActions(...e.actions??[]),l}function vg(e=`underline`,t=!1){return B(`mh-tabs`,`mh-tabs--${e}`,t&&`mh-tabs--fill`)}function yg(e,t,n){let r=e.map((e,t)=>e.disabled?-1:t).filter(e=>e>=0);if(r.length===0)return null;let i=r.indexOf(t);switch(n){case`ArrowRight`:return r[(i+1)%r.length];case`ArrowLeft`:return r[(i-1+r.length)%r.length];case`Home`:return r[0];case`End`:return r[r.length-1];default:return null}}function bg(e,t){return e.find(e=>e.id===t&&!e.disabled)?.id??e.find(e=>!e.disabled)?.id??``}function xg(e){let t=I(`mh-tabs`),n=M(`div`,{class:`mh-tabs__list`,role:`tablist`,"aria-label":e.label??null}),r=M(`div`,{class:vg(e.variant,e.fill)},n),i=e.tabs.some(e=>e.panel!==void 0),a=[],o=[],s=bg(e.tabs,e.value);e.tabs.forEach((e,s)=>{let c=`${t}-tab-${s}`,u=`${t}-panel-${s}`,d=M(`button`,{type:`button`,class:`mh-tabs__tab`,role:`tab`,id:c,"aria-controls":i?u:null,disabled:e.disabled??!1},e.icon?H(e.icon):null,M(`span`,{class:`mh-tabs__label`},e.label),e.badge===void 0?null:M(`span`,{class:`mh-tabs__badge`},String(e.badge)));if(d.addEventListener(`click`,()=>l(e.id,!0)),a.push(d),n.append(d),i){let t=M(`div`,{class:`mh-tabs__panel`,role:`tabpanel`,id:u,"aria-labelledby":c,tabindex:0});it(t,...Array.isArray(e.panel)?e.panel:[e.panel]),o.push(t),r.append(t)}});function c(){e.tabs.forEach((e,t)=>{let n=e.id===s;a[t].setAttribute(`aria-selected`,String(n)),a[t].tabIndex=n?0:-1,o[t]&&(o[t].hidden=!n)})}function l(t,n){let r=bg(e.tabs,t);r!==s&&(s=r,c(),n&&e.onChange?.(s))}return n.addEventListener(`keydown`,t=>{let n=a.indexOf(document.activeElement);if(n<0)return;let r=yg(e.tabs,n,t.key);if(r!==null){if(t.preventDefault(),a[r].focus(),(e.activation??`auto`)===`auto`)l(e.tabs[r].id,!0);else for(let[e,t]of a.entries())t.tabIndex=e===r?0:-1}}),c(),{el:r,value:()=>s,setValue:e=>l(e,!1)}}function Sg(e,t,n){let r=Array.from({length:e},(e,t)=>t);if(n||t===void 0||e<=t)return r;let i=Math.max(3,Math.floor(t));if(e<=i)return r;let a=i-1;return[0,`more`,...r.slice(e-a+1)]}var Cg=e=>`Show ${e} more`,wg=()=>M(`span`,{class:`mh-breadcrumbs__separator`,"aria-hidden":`true`},H(hn));function Tg(e){let t=M(`ol`,{class:`mh-breadcrumbs__list`}),n=M(`nav`,{class:`mh-breadcrumbs`,"aria-label":e.label??`Breadcrumb`},t),r=[...e.items],i=!1;function a(e,t){let n=[e.icon?H(e.icon):null,M(`span`,{class:`mh-breadcrumbs__label`},e.label)];if(t)return M(`span`,{class:`mh-breadcrumbs__current`,"aria-current":`page`},...n);if(e.href!==void 0){let t=M(`a`,{class:`mh-breadcrumbs__link`,href:e.href},...n);return e.onClick&&t.addEventListener(`click`,e.onClick),t}let r=M(`button`,{type:`button`,class:`mh-breadcrumbs__link`},...n);return e.onClick&&r.addEventListener(`click`,e.onClick),r}function o(){let n=Sg(r.length,e.maxItems,i),s=r.length-(n.length-+!!n.includes(`more`));t.replaceChildren(...n.map((c,l)=>{let u=M(`li`,{class:`mh-breadcrumbs__item`});if(c===`more`){let n=(e.moreLabel??Cg)(s),r=M(`button`,{type:`button`,class:`mh-breadcrumbs__more`,"aria-label":n,title:n},H(k));r.addEventListener(`click`,()=>{i=!0,o(),t.querySelectorAll(`.mh-breadcrumbs__link`)[1]?.focus()}),u.append(r)}else u.append(a(r[c],c===r.length-1));return l<n.length-1&&u.append(wg()),u}))}return o(),{el:n,setItems(e){r=[...e],i=!1,o()}}}function Eg(e,t,n){if(t!==n)return n;let r=e.findIndex(e=>e.id===t),i=e.filter(e=>e.id!==t);return i.length===0?``:i[Math.min(Math.max(r,0),i.length-1)].id}function Dg(e,t=!1){return B(`mh-document-tabs__tab`,e&&`is-selected`,t&&`is-dirty`)}var Og=`, unsaved changes`;function kg(e){let t=e.closeLabel??`Close`,n=M(`div`,{class:`mh-document-tabs__list`,role:`tablist`,"aria-label":e.label??null}),r=M(`div`,{class:`mh-document-tabs`},n);if(e.onAdd){let t=e.addLabel??`New tab`,n=M(`button`,{type:`button`,class:`mh-document-tabs__add`,"aria-label":t,title:t},H(vt));n.addEventListener(`click`,()=>e.onAdd()),r.append(n)}let i=[...e.tabs],a=i.find(t=>t.id===e.value)?.id??i[0]?.id??``,o=()=>Array.from(n.querySelectorAll(`[role="tab"]`));function s(){let e=o().findIndex(e=>e===document.activeElement);if(n.replaceChildren(...i.map(e=>{let n=e.id===a,r=e.closable??!0,i=M(`button`,{type:`button`,class:`mh-document-tabs__select`,role:`tab`,"aria-selected":String(n),tabindex:n?0:-1,title:e.title??null},e.icon?H(e.icon):null,M(`span`,{class:`mh-document-tabs__label`},e.label),e.dirty?M(`span`,{class:`mh-visually-hidden`},Og):null);i.addEventListener(`click`,()=>c(e.id,!0));let o=M(`div`,{class:Dg(n,e.dirty),role:`presentation`,"data-id":e.id},i);if(r){let n=M(`button`,{type:`button`,class:`mh-document-tabs__close`,tabindex:-1,"aria-label":`${t} ${e.label}`,title:t},e.dirty?M(`span`,{class:`mh-document-tabs__dirty`,"aria-hidden":`true`}):null,H(Hr,{class:`mh-document-tabs__close-icon`}));n.addEventListener(`click`,t=>{t.stopPropagation(),u(e.id)}),o.append(n),o.addEventListener(`auxclick`,t=>{t.button===1&&(t.preventDefault(),u(e.id))})}else e.dirty&&o.append(M(`span`,{class:`mh-document-tabs__dirty`,"aria-hidden":`true`}));return o})),e>=0){let t=o();t[Math.min(e,t.length-1)]?.focus()}}function c(t,n){t!==a&&i.some(e=>e.id===t)&&(a=t,s(),n&&e.onChange?.(a))}function l(t,r){if(!i.some(e=>e.id===t))return;let c=Eg(i,t,a),l=c!==a,u=n.contains(document.activeElement);i=i.filter(e=>e.id!==t),a=c,s(),u&&o().find(e=>e.getAttribute(`aria-selected`)===`true`)?.focus(),r&&l&&a&&e.onChange?.(a)}function u(t){e.onClose?.(t)!==!1&&l(t,!0)}return n.addEventListener(`keydown`,e=>{let t=o().indexOf(e.target);if(t<0)return;if(e.key===`Delete`&&(i[t].closable??!0)){e.preventDefault(),u(i[t].id);return}let n=yg(i.map(()=>({})),t,e.key);n!==null&&(e.preventDefault(),c(i[n].id,!0),o()[n]?.focus())}),s(),{el:r,value:()=>a,setValue:e=>c(e,!1),setTabs(e){i=[...e],i.some(e=>e.id===a)||(a=i[0]?.id??``),s()},setDirty(e,t){i=i.map(n=>n.id===e?{...n,dirty:t}:n),s()},closeTab:e=>l(e,!1)}}var Ag=e=>!(`separator`in e);function jg(e){let t={ctrl:`Control`,control:`Control`,cmd:`Meta`,command:`Meta`,"⌘":`Meta`,opt:`Alt`,option:`Alt`,alt:`Alt`,shift:`Shift`,del:`Delete`,esc:`Escape`};return e.split(`+`).map(e=>e.trim()).filter(Boolean).map(e=>t[e.toLowerCase()]??e).join(`+`)}function Mg(e){return B(`mh-menu-bar__item`,e.danger&&`mh-menu-bar__item--danger`,e.items&&`mh-menu-bar__item--submenu`)}function Ng(e,t,n){if(e===0)return null;switch(n){case`ArrowDown`:return(t+1)%e;case`ArrowUp`:return t<0?e-1:(t-1+e)%e;case`Home`:return 0;case`End`:return e-1;default:return null}}function Pg(e,t){let n=t??M(`div`);n.classList.add(`mh-menu-bar`),n.setAttribute(`role`,`menubar`),e.label&&n.setAttribute(`aria-label`,e.label);let r=I(`mh-menu-bar`),i=[],a=[],o=[],s=new Map,c=new Map,l=[],u=0,d=``,f=0,p=new AbortController,m=p.signal;function h(e,t,n,i,a){let o=M(`div`,{class:B(`mh-menu-bar__popup`,a&&`mh-menu-bar__popup--sub`),role:`menu`,"aria-labelledby":t.id,id:I(`${r}-menu`)});o.hidden=!0;let l={popup:o,items:[],opener:t,parent:n,top:i},u=e.some(e=>Ag(e)&&(e.icon||e.checked!==void 0));for(let t of e){if(!Ag(t)){o.append(M(`div`,{class:`mh-menu-bar__separator`,role:`separator`}));continue}let e=t.checked!==void 0,n=M(`div`,{class:Mg(t),role:e?`menuitemcheckbox`:`menuitem`,id:I(`${r}-item`),tabindex:-1,"aria-checked":e?String(t.checked):null,"aria-disabled":t.disabled?`true`:null,"aria-haspopup":t.items?`menu`:null,"aria-expanded":t.items?`false`:null,"aria-keyshortcuts":t.shortcut?jg(t.shortcut):null},u?M(`span`,{class:`mh-menu-bar__lead`,"aria-hidden":`true`},e?H(Wt,{class:`mh-menu-bar__check`}):t.icon?H(t.icon):null):null,M(`span`,{class:`mh-menu-bar__label`},t.label),t.shortcut?M(`span`,{class:`mh-menu-bar__shortcut`,"aria-hidden":`true`},t.shortcut):null,t.items?H(hn,{class:`mh-menu-bar__chevron`}):null),a=M(`div`,{class:`mh-menu-bar__entry`,role:`none`},n),d=t.items?h(t.items,n,l,i,!0):null;d&&a.append(d.popup),s.set(n,{item:t,level:l,sub:d}),c.set(t.value,n),l.items.push(n),o.append(a)}return l}e.menus.forEach((e,t)=>{let s=M(`button`,{type:`button`,class:`mh-menu-bar__trigger`,role:`menuitem`,id:`${r}-trigger-${t}`,"aria-haspopup":`menu`,"aria-expanded":`false`,"aria-disabled":e.disabled?`true`:null,tabindex:t===0?0:-1},e.label),c=h(e.items,s,null,t,!1),l=M(`div`,{class:`mh-menu-bar__menu`,role:`none`},s,c.popup);i.push(s),a.push(c),o.push(l),n.append(l)});let g=e=>l.includes(e);function _(e){u=e,i.forEach((t,n)=>t.tabIndex=n===e?0:-1)}function v(e){e.popup.hidden=!1,e.opener.setAttribute(`aria-expanded`,`true`),(e.parent?e.opener.parentElement:o[e.top]).classList.add(`is-open`),e.popup.classList.remove(`is-flipped`);let t=e.popup.getBoundingClientRect(),n=document.documentElement.clientWidth||window.innerWidth;t.width>0&&t.right>n&&e.popup.classList.add(`is-flipped`)}function y(e){e.popup.hidden=!0,e.opener.setAttribute(`aria-expanded`,`false`),(e.parent?e.opener.parentElement:o[e.top]).classList.remove(`is-open`)}function b(e){let t=l.indexOf(e);if(!(t<0)){for(let e of l.slice(t).reverse())y(e);l=l.slice(0,t)}}function x(e=!1){let t=l[0];t&&b(t),e&&t&&i[t.top].focus()}function S(e,t){e.items[t]?.focus()}function C(t,n){if(e.menus[t].disabled)return;let r=a[t];g(r)?l.length>1&&b(l[1]):(x(),l=[r],v(r)),_(t),n===`first`?S(r,0):n===`last`&&S(r,r.items.length-1)}function w(e,t){let n=s.get(e);if(!n?.sub||n.item.disabled)return;let r=l[l.indexOf(n.level)+1];r&&r!==n.sub&&b(r),g(n.sub)||(l.push(n.sub),v(n.sub)),t&&S(n.sub,0)}function T(t){let n=s.get(t);if(!n||n.item.disabled)return;if(n.sub){w(t,!0);return}let r;n.item.checked!==void 0&&(r=t.getAttribute(`aria-checked`)!==`true`,t.setAttribute(`aria-checked`,String(r))),x(!0),e.onSelect?.(n.item.value,r)}function E(e,t,n){let r=Date.now();d=r-f>700?t.toLowerCase():d+t.toLowerCase(),f=r;let i=e.items.length,a=d.length>1?n:n+1;for(let t=0;t<i;t++){let n=(a+t+i)%i;if(s.get(e.items[n]).item.label.toLowerCase().startsWith(d)){S(e,n);return}}}let D=(e,t)=>{let n=i.length,r=l.length>0,a;switch(e.key){case`ArrowRight`:a=(t+1)%n;break;case`ArrowLeft`:a=(t-1+n)%n;break;case`Home`:a=0;break;case`End`:a=n-1;break;case`ArrowDown`:case`Enter`:case` `:e.preventDefault(),C(t,`first`);return;case`ArrowUp`:e.preventDefault(),C(t,`last`);return;case`Escape`:r&&(e.preventDefault(),x(!0));return;default:return}e.preventDefault(),_(a),i[a].focus(),r&&C(a,`none`)},O=(e,t)=>{let n=s.get(t),r=n.level,a=r.items.indexOf(t),o=Ng(r.items.length,a,e.key);if(o!==null){e.preventDefault(),l[l.length-1]!==r&&b(l[l.indexOf(r)+1]),S(r,o);return}let c=i.length;switch(e.key){case`ArrowRight`:e.preventDefault(),n.sub&&!n.item.disabled?w(t,!0):C((r.top+1)%c,`first`);return;case`ArrowLeft`:e.preventDefault(),r.parent?(b(r),r.opener.focus()):C((r.top-1+c)%c,`first`);return;case`Enter`:case` `:e.preventDefault(),T(t);return;case`Escape`:e.preventDefault(),b(r),r.opener.focus();return;case`Tab`:x();return;default:e.key.length===1&&/\S/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.preventDefault(),E(r,e.key,a))}};return n.addEventListener(`keydown`,e=>{let t=e.target,n=i.indexOf(t);n>=0?D(e,n):s.has(t)&&O(e,t)},{signal:m}),n.addEventListener(`click`,e=>{let t=e.target,n=t.closest(`.mh-menu-bar__trigger`);if(n){let t=i.indexOf(n);g(a[t])?x(!0):C(t,e.detail===0?`first`:`none`),g(a[t])||n.focus();return}let r=t.closest(`.mh-menu-bar__item`);r&&s.has(r)&&T(r)},{signal:m}),n.addEventListener(`pointerover`,t=>{if(l.length===0)return;let n=t.target,r=n.closest(`.mh-menu-bar__trigger`);if(r){let t=i.indexOf(r);!g(a[t])&&!e.menus[t].disabled&&(C(t,`none`),r.focus());return}let o=n.closest(`.mh-menu-bar__item`),c=o?s.get(o):void 0;if(o&&c&&g(c.level)){if(document.activeElement!==o&&o.focus(),c.sub)w(o,!1);else{let e=l[l.indexOf(c.level)+1];e&&b(e)}}},{signal:m}),n.addEventListener(`focusin`,e=>{let t=i.indexOf(e.target);t>=0&&_(t)},{signal:m}),n.addEventListener(`focusout`,e=>{let t=e.relatedTarget;t&&!n.contains(t)&&x()},{signal:m}),document.addEventListener(`pointerdown`,e=>{l.length>0&&!n.contains(e.target)&&x()},{signal:m}),_(u),{el:n,close:()=>x(),setChecked(e,t){let n=c.get(e);n?.hasAttribute(`aria-checked`)&&n.setAttribute(`aria-checked`,String(t))},setDisabled(e,t){let n=c.get(e),r=n?s.get(n):void 0;n&&r&&(r.item={...r.item,disabled:t},t?n.setAttribute(`aria-disabled`,`true`):n.removeAttribute(`aria-disabled`))},destroy(){x(),p.abort(),t&&t.replaceChildren()}}}function Fg(e=!1,t=`all`){return B(`mh-nav-rail`,e&&`mh-nav-rail--expanded`,t!==`all`&&`mh-nav-rail--labels-${t}`)}function Ig(e){return e===`dot`?``:typeof e==`number`?e>99?`99+`:String(Math.max(0,Math.floor(e))):e}var Lg=e=>e!=null&&e!==``&&!(typeof e==`number`&&e<=0);function Rg(e,t){return t?`, ${t}`:e===`dot`?`, new`:`, ${Ig(e)}`}function zg(e){return B(`mh-nav-rail__badge`,e===`dot`&&`mh-nav-rail__badge--dot`)}function Bg(e){let t=e.labels??`all`,n=M(`nav`,{class:Fg(e.expanded,t),"aria-label":e.label??`Main`}),r=e.value??``,i=new Map,a=new Map;if(e.header!==void 0){let t=M(`div`,{class:`mh-nav-rail__header`});it(t,...Array.isArray(e.header)?e.header:[e.header]),n.append(t)}let o=(e,t)=>{let n=M(`ul`,{class:B(`mh-nav-rail__list`,t&&`mh-nav-rail__list--footer`)});for(let t of e){i.set(t.id,t.badge??null);let e=M(`span`,{class:`mh-nav-rail__icon`}),r=M(`span`,{class:`mh-nav-rail__badge-slot`}),o=[M(`span`,{class:`mh-nav-rail__indicator`,"aria-hidden":`true`},e,r),M(`span`,{class:`mh-nav-rail__label`},t.label)],s=t.href!==void 0&&!t.disabled?M(`a`,{class:`mh-nav-rail__item`,href:t.href},...o):t.href===void 0?M(`button`,{type:`button`,class:`mh-nav-rail__item`,disabled:t.disabled??!1},...o):M(`a`,{class:`mh-nav-rail__item`,role:`link`,"aria-disabled":`true`},...o);t.disabled||s.addEventListener(`click`,e=>{t.href!==void 0&&(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0)||c(t.id,!0)}),a.set(t.id,{item:t,el:s,icon:e,badge:r}),n.append(M(`li`,{class:`mh-nav-rail__entry`},s))}return n};n.append(o(e.items,!1)),e.footerItems?.length&&n.append(o(e.footerItems,!0));function s(e){let t=a.get(e);if(!t)return;let n=e===r;n?t.el.setAttribute(`aria-current`,`page`):t.el.removeAttribute(`aria-current`),t.icon.replaceChildren(H(n&&t.item.iconSelected?t.item.iconSelected:t.item.icon));let o=i.get(e);t.badge.replaceChildren(...Lg(o)?[M(`span`,{class:zg(o)},Ig(o))]:[]),t.el.querySelector(`.mh-nav-rail__label + .mh-visually-hidden`)?.remove(),Lg(o)&&t.el.append(M(`span`,{class:`mh-visually-hidden`},Rg(o,t.item.badgeLabel)))}function c(t,n){if(t===r||!a.has(t))return;let i=r;r=t,s(i),s(t),n&&e.onChange?.(t)}for(let e of a.keys())s(e);return{el:n,value:()=>r,setValue:e=>c(e,!1),setBadge(e,t){i.set(e,t),s(e)},setExpanded(e){n.classList.toggle(`mh-nav-rail--expanded`,e)}}}var Vg=(e,t)=>t<e?[]:Array.from({length:t-e+1},(t,n)=>e+n);function Hg(e,t,n=1,r=1){let i=Math.max(1,Math.floor(t)),a=Math.min(Math.max(1,Math.floor(e)),i);if(i<=r*2+n*2+3)return Vg(1,i);let o=Vg(1,r),s=Vg(i-r+1,i),c=Math.max(Math.min(a-n,i-r-n*2-1),r+2),l=Math.min(Math.max(a+n,r+n*2+2),i-r-1);return[...o,...c>r+2?[`start-ellipsis`]:c>r+1?[r+1]:[],...Vg(c,l),...l<i-r-1?[`end-ellipsis`]:l<i-r?[i-r]:[],...s]}function Ug(e=`pages`){return B(`mh-pagination`,`mh-pagination--${e}`)}var Wg=e=>`Page ${e}`,Gg=(e,t)=>`${e} of ${t}`;function Kg(e){let t=e.variant??`pages`,n=M(`ul`,{class:`mh-pagination__list`}),r=M(`nav`,{class:Ug(t),"aria-label":e.label??`Pagination`},n),i=Math.max(1,Math.floor(e.count)),a=Math.min(Math.max(1,Math.floor(e.page??1)),i),o=e.pageLabel??Wg;function s(t,n,r,i,...a){let o={class:n,"aria-label":r},s;return s=e.href&&!i?M(`a`,{...o,href:e.href(t)},...a):e.href?M(`a`,{...o,"aria-disabled":`true`,role:`link`},...a):M(`button`,{...o,type:`button`,disabled:i},...a),i||s.addEventListener(`click`,n=>{e.href&&(n.metaKey||n.ctrlKey||n.shiftKey||n.button!==0)||(e.href&&n.preventDefault(),l(t,!0))}),s}function c(){let r=Array.from(n.querySelectorAll(`a, button`)).indexOf(document.activeElement),c=s(a-1,`mh-pagination__nav mh-pagination__nav--previous`,e.previousLabel??`Previous page`,a<=1,H(In)),l=s(a+1,`mh-pagination__nav mh-pagination__nav--next`,e.nextLabel??`Next page`,a>=i,H(hn)),u=t===`compact`?[M(`li`,{class:`mh-pagination__item`},M(`span`,{class:`mh-pagination__status`,"aria-live":`polite`},Gg(a,i)))]:Hg(a,i,e.siblings,e.boundaries).map(e=>{if(typeof e!=`number`)return M(`li`,{class:`mh-pagination__item`},M(`span`,{class:`mh-pagination__ellipsis`,"aria-hidden":`true`},`…`));let t=s(e,`mh-pagination__page`,o(e),!1,String(e));return e===a&&t.setAttribute(`aria-current`,`page`),M(`li`,{class:`mh-pagination__item`},t)});if(n.replaceChildren(M(`li`,{class:`mh-pagination__item`},c),...u,M(`li`,{class:`mh-pagination__item`},l)),r>=0){let e=Array.from(n.querySelectorAll(`a, button`)),t=r===0?e[0]:r===e.length-1?e[e.length-1]:n.querySelector(`[aria-current="page"]`);(t&&!t.disabled&&t.getAttribute(`aria-disabled`)!==`true`?t:n.querySelector(`[aria-current="page"]`)??e[0])?.focus()}}function l(t,n){let r=Math.min(Math.max(1,Math.floor(t)),i);r!==a&&(a=r,c(),n&&e.onChange?.(a))}return c(),{el:r,page:()=>a,setPage:e=>l(e,!1),setCount(e){i=Math.max(1,Math.floor(e)),a=Math.min(a,i),c()}}}function qg(e,t,n){return e.error?`error`:t<n?`complete`:t===n?`current`:`upcoming`}function Jg(e=`horizontal`){return B(`mh-steps`,`mh-steps--${e}`)}function Yg(e){return B(`mh-steps__step`,`is-${e}`)}var Xg={complete:`completed`,current:`current step`,upcoming:`not started`,error:`has an error`};function Zg(e){let t=M(`ol`,{class:Jg(e.orientation),"aria-label":e.label??`Progress`}),n=[...e.steps],r=Math.max(0,Math.floor(e.current??0));function i(){t.replaceChildren(...n.map((t,i)=>{let a=qg(t,i,r),o=M(`span`,{class:`mh-steps__marker`,"aria-hidden":`true`},a===`complete`?H(Wt):a===`error`?H(Rn):String(i+1)),s=M(`span`,{class:`mh-steps__text`},M(`span`,{class:`mh-steps__label`},t.label),t.description?M(`span`,{class:`mh-steps__description`},t.description):null,t.optional?M(`span`,{class:`mh-steps__optional`},e.optionalText??`Optional`):null,M(`span`,{class:`mh-visually-hidden`},`, ${Xg[a]}`)),c=!!e.onSelect&&a===`complete`,l=c?M(`button`,{type:`button`,class:`mh-steps__button`},o,s):M(`span`,{class:`mh-steps__body`},o,s);return c&&l.addEventListener(`click`,()=>e.onSelect(i)),M(`li`,{class:Yg(a),"aria-current":a===`current`||t.error&&i===r?`step`:null},l,i<n.length-1?M(`span`,{class:`mh-steps__connector`,"aria-hidden":`true`}):null)}))}return i(),{el:t,current:()=>r,setCurrent(e){r=Math.max(0,Math.floor(e)),i()},setSteps(e){n=[...e],i()}}}var Qg=e=>M(`p`,{class:`mh-text--muted`,style:`margin: 0`},e),$g=e=>M(`span`,{class:`ex-meta`},e),e_=[{id:`tabs`,render:()=>M(`div`,{class:`ex-stack`},$g(`underline`),xg({label:`Sections`,tabs:[{id:`overview`,label:`Overview`,panel:Qg(`Everything at a glance.`)},{id:`activity`,label:`Activity`,badge:3,panel:Qg(`What changed recently.`)},{id:`schedules`,label:`Schedules`,panel:Qg(`When things happen on their own.`)},{id:`archived`,label:`Archived`,disabled:!0,panel:Qg(`Nothing here.`)}]}).el,$g(`pill, with icons`),xg({variant:`pill`,label:`View`,value:`list`,tabs:[{id:`grid`,label:`Grid`,icon:`home`},{id:`list`,label:`List`,icon:`menu`},{id:`calendar`,label:`Calendar`,icon:`calendar`}]}).el,$g(`pill, fill, manual activation`),xg({variant:`pill`,fill:!0,activation:`manual`,label:`Period`,tabs:[{id:`day`,label:`Day`,panel:Qg(`Today, hour by hour.`)},{id:`week`,label:`Week`,panel:Qg(`The last seven days.`)},{id:`month`,label:`Month`,panel:Qg(`This month so far.`)}]}).el)},{id:`page-header`,render:()=>M(`div`,{class:`ex-stack`,style:`gap: var(--mh-space-xl)`},_g({eyebrow:`Settings`,title:`Display`,subtitle:`Brightness, sleep and what shows while idle.`,back:{onClick:()=>void 0},actions:[U({icon:`search`,label:`Search settings`}).el,P({label:`Save`,size:`small`}).el]}).el,_g({title:`Good evening`,subtitle:`Three things need your attention.`}).el,_g({eyebrow:`Section`,title:`A second-level header`,level:2,actions:[P({label:`Add`,icon:`add`,variant:`tonal`,size:`small`}).el]}).el)},{id:`document-tabs`,render:()=>{let e=Qg(`Editing Evening.yaml`),t=0,n=new Set,r=kg({label:`Open files`,value:`evening`,tabs:[{id:`morning`,label:`Morning.yaml`,icon:`edit`,title:`Scenes / Morning.yaml`},{id:`evening`,label:`Evening.yaml`,icon:`edit`,dirty:!0},{id:`away`,label:`Away mode.yaml`,icon:`edit`},{id:`readme`,label:`Read me`,icon:`info`,closable:!1}],onChange:t=>e.textContent=`Editing ${t}`,onClose:t=>r.el.querySelector(`[data-id="${t}"].is-dirty`)&&!n.has(t)?(n.add(t),e.textContent=`Unsaved changes: press close again to discard them`,!1):!0,onAdd:()=>{t+=1,e.textContent=`New file ${t} would open here`}});return M(`div`,{class:`ex-stack`},$g(`the dot marks unsaved changes; hover or focus shows the close button; Delete closes the focused tab`),r.el,e,M(`div`,{class:`ex-row`},P({label:`Toggle unsaved on Morning`,size:`small`,variant:`secondary`,onClick:()=>r.setDirty(`morning`,!r.el.querySelector(`[data-id="morning"].is-dirty`))}).el))}},{id:`menu-bar`,render:()=>{let e=Qg(`Choose a command: click a menu, or Tab to the bar and use the arrow keys.`),t=Pg({menus:[{label:`File`,items:[{value:`new`,label:`New dashboard`,icon:`add`,shortcut:`Ctrl+N`},{value:`open`,label:`Open…`,shortcut:`Ctrl+O`},{value:`recent`,label:`Open recent`,items:[{value:`recent-1`,label:`Living room wall`},{value:`recent-2`,label:`Kitchen tablet`},{value:`recent-3`,label:`Bedside display`}]},{separator:!0},{value:`save`,label:`Save`,shortcut:`Ctrl+S`},{value:`export`,label:`Export`,icon:`download`,shortcut:`Ctrl+Shift+E`},{separator:!0},{value:`delete`,label:`Delete dashboard`,icon:`delete`,danger:!0}]},{label:`Edit`,items:[{value:`undo`,label:`Undo`,shortcut:`Ctrl+Z`},{value:`redo`,label:`Redo`,shortcut:`Ctrl+Y`,disabled:!0},{separator:!0},{value:`copy`,label:`Copy`,icon:`copy`,shortcut:`Ctrl+C`},{value:`paste`,label:`Paste`,shortcut:`Ctrl+V`}]},{label:`View`,items:[{value:`grid`,label:`Show grid`,checked:!0},{value:`names`,label:`Show entity names`,checked:!1},{separator:!0},{value:`zoom`,label:`Zoom`,items:[{value:`zoom-in`,label:`Zoom in`,shortcut:`Ctrl++`},{value:`zoom-out`,label:`Zoom out`,shortcut:`Ctrl+-`},{value:`zoom-reset`,label:`Actual size`,shortcut:`Ctrl+0`}]}]},{label:`Help`,items:[{value:`shortcuts`,label:`Keyboard shortcuts`,icon:`keyboard`},{value:`about`,label:`About`,icon:`info`}]}],label:`Dashboard editor`,onSelect:(t,n)=>e.textContent=n===void 0?`Chose ${t}`:`${t}: ${n?`on`:`off`}`});return M(`div`,{class:`ex-stack`,style:`min-height: 22rem; align-content: start`},t.el,e)}},{id:`breadcrumbs`,render:()=>M(`div`,{class:`ex-stack`},$g(`full trail`),Tg({items:[{label:`Home`,href:`#`,icon:`home`},{label:`Ground floor`,href:`#`},{label:`Kitchen`,href:`#`},{label:`Ceiling light`}]}).el,$g(`collapsed: press … to show the rest`),Tg({maxItems:3,items:[{label:`Settings`,href:`#`,icon:`settings`},{label:`Devices`,href:`#`},{label:`Hallway`,href:`#`},{label:`Motion sensor`,href:`#`},{label:`Sensitivity`}]}).el)},{id:`pagination`,render:()=>{let e=Qg(`Page 4 of 24`);return M(`div`,{class:`ex-stack`},$g(`pages with ellipses`),Kg({count:24,page:4,onChange:t=>e.textContent=`Page ${t} of 24`}).el,e,$g(`few pages`),Kg({count:5,page:2}).el,$g(`two siblings, two at each end`),Kg({count:60,page:30,siblings:2,boundaries:2}).el,$g(`compact, for watches and narrow panels`),Kg({count:12,page:3,variant:`compact`}).el)}},{id:`steps`,render:()=>{let e=[{label:`Connect`,description:`Power on the display`},{label:`Network`,description:`Wi-Fi and password`},{label:`Home`,description:`Find your home`},{label:`Rooms`,description:`Pick what shows`,optional:!0},{label:`Done`}],t=2,n=n=>{t=Math.max(0,Math.min(e.length,n)),r.setCurrent(t)},r=Zg({steps:e,current:t,label:`Setup`,onSelect:n});return M(`div`,{class:`ex-stack`,style:`gap: var(--mh-space-lg)`},$g(`horizontal; completed steps go back when pressed; narrow screens keep only the current label`),r.el,M(`div`,{class:`ex-row`},P({label:`Back`,size:`small`,variant:`secondary`,onClick:()=>n(t-1)}).el,P({label:`Next`,size:`small`,onClick:()=>n(t+1)}).el),$g(`vertical, with an error`),Zg({orientation:`vertical`,current:1,steps:[{label:`Download update`,description:`24 MB`},{label:`Verify`,description:`The checksum did not match. Try again.`,error:!0},{label:`Install`},{label:`Restart`}]}).el)}},{id:`nav-rail`,render:()=>{let e=[{id:`home`,label:`Home`,icon:`home`},{id:`rooms`,label:`Rooms`,icon:`lightbulb`},{id:`media`,label:`Media`,icon:`music`,badge:`dot`,badgeLabel:`something new`},{id:`cameras`,label:`Cameras`,icon:`camera`},{id:`alerts`,label:`Alerts`,icon:`bell`,badge:3,badgeLabel:`3 new`}],t=[{id:`settings`,label:`Settings`,icon:`settings`}],n=e=>M(`div`,{style:`height: 32rem; display: flex; border: var(--mh-border-width) solid var(--mh-panel-outline); border-radius: var(--mh-radius-lg); background: var(--mh-surface)`},e),r=!1,i=Bg({items:e,footerItems:t,value:`home`,label:`Sections`,header:U({icon:`menu`,label:`Expand navigation`,onClick:()=>{r=!r,i.setExpanded(r)}}).el});return M(`div`,{class:`ex-row`,style:`align-items: flex-start`},M(`div`,{class:`ex-stack`},$g(`labels; the menu button expands it`),n(i.el)),M(`div`,{class:`ex-stack`},$g(`selected label only`),n(Bg({items:e,footerItems:t,value:`rooms`,labels:`selected`,label:`Sections, compact`}).el)),M(`div`,{class:`ex-stack`},$g(`expanded`),n(Bg({items:e,footerItems:t,value:`alerts`,expanded:!0,label:`Sections, expanded`}).el)))}}],t_=450,n_=e=>Array.isArray(e)?e:e===void 0?[]:[e];function r_(e){let t=e.block,n=I(`mh-${t}-title`),r=I(`mh-${t}-desc`),i=M(`h2`,{class:`mh-${t}__title`,id:n},e.title??``),a=e.description?M(`p`,{class:`mh-${t}__description`,id:r},e.description):null,o=e.dismissible??!0,s=e.closeButton===!1?null:U({icon:Hr,label:e.closeLabel??`Close`,size:`small`,onClick:()=>b.dismiss(`close-button`)}).el;s?.classList.add(`mh-${t}__close`);let c=M(`header`,{class:`mh-${t}__header`},M(`div`,{class:`mh-${t}__heading`},i,a),s);c.hidden=!e.title&&!s,i.hidden=!e.title;let l=M(`div`,{class:`mh-${t}__body`});it(l,...n_(e.content));let u=M(`footer`,{class:`mh-${t}__footer`}),d=(...e)=>{u.replaceChildren(),it(u,...e),u.hidden=u.childNodes.length===0};d(...n_(e.footer));let f=M(`div`,{class:`mh-${t}__panel`,tabindex:-1},e.before??null,c,l,u),p=M(`div`,{class:`mh-overlay__scrim`,"aria-hidden":`true`}),m=M(`dialog`,{class:B(`mh-overlay`,`mh-${t}`,...e.modifiers??[]),role:e.role===`alertdialog`?`alertdialog`:null,"aria-modal":`true`,"aria-labelledby":e.title?n:null,"aria-label":e.title?null:e.label??null,"aria-describedby":a?r:null},p,f),h=!1,g=null,_=null,v=null,y=()=>{v?.(),v=null,m.classList.remove(`is-closing`),m.open&&m.close(),m.removeAttribute(`open`),m.remove(),_?.(),_=null;let e=g;g=null,e?.isConnected&&e.focus({preventScroll:!0})},b={el:m,panel:f,body:l,footer:u,dismissible:o,open(){if(!h){if(h=!0,v)v(),v=null,m.classList.remove(`is-closing`);else{let e=document.activeElement;g=e instanceof HTMLElement&&e!==document.body?e:null}m.isConnected||Eh(e.container).append(m),m.open||(typeof m.showModal==`function`?m.showModal():m.setAttribute(`open`,``)),_??=Mh(),(e.initialFocus?.()??f.querySelector(`[autofocus]`)??f).focus({preventScroll:!0}),e.onOpen?.()}},dismiss(t){if(!h)return;h=!1,m.classList.add(`is-closing`);let n=e=>{e.target===f&&y()},r=setTimeout(y,t_);f.addEventListener(`animationend`,n),v=()=>{clearTimeout(r),f.removeEventListener(`animationend`,n)},e.onClose?.(t)},close(){b.dismiss(`api`)},isOpen:()=>h,setTitle(e){i.textContent=e,i.hidden=!e,c.hidden=!e&&!s,e&&(m.setAttribute(`aria-labelledby`,n),m.removeAttribute(`aria-label`))},setContent(...e){l.replaceChildren(),it(l,...e)},setFooter:d,destroy(){h=!1,y()}};return m.addEventListener(`keydown`,e=>{e.key===`Escape`?(e.preventDefault(),e.stopPropagation(),o&&b.dismiss(`escape`)):kh(e,f)}),m.addEventListener(`cancel`,e=>{e.preventDefault(),o&&b.dismiss(`escape`)}),m.addEventListener(`close`,()=>{h&&!m.open&&(b.dismiss(`escape`),y())}),p.addEventListener(`click`,()=>{o&&b.dismiss(`scrim`)}),b}function i_(e){let{el:t,panel:n,body:r,footer:i,open:a,close:o,isOpen:s,setTitle:c,setContent:l,setFooter:u,destroy:d}=e;return{el:t,panel:n,body:r,footer:i,open:a,close:o,isOpen:s,setTitle:c,setContent:l,setFooter:u,destroy:d}}var a_=96,o_=.6;function s_(e={}){let t=M(`div`,{class:`mh-sheet__handle`,"aria-hidden":`true`}),n=r_({...e,block:`sheet`,before:t,onOpen:()=>{n.panel.style.removeProperty(`transform`),e.onOpen?.()}});return(e.swipeToClose??!0)&&n.dismissible&&c_(n.panel,t,()=>n.dismiss(`swipe`)),i_(n)}function c_(e,t,n){let r=null,i=0,a=n=>{n.button!==0||t.offsetParent===null||n.target.closest(`button, a, input`)||(r={id:n.pointerId,y:n.clientY,t:n.timeStamp},i=0,e.setPointerCapture?.(n.pointerId),e.classList.add(`is-dragging`))},o=t=>{r&&t.pointerId===r.id&&(i=Math.max(0,t.clientY-r.y),e.style.transform=`translateY(${i}px)`)},s=t=>{if(!r||t.pointerId!==r.id)return;let a=i/Math.max(1,t.timeStamp-r.t);r=null,e.classList.remove(`is-dragging`),i>a_||i>16&&a>o_?n():e.style.removeProperty(`transform`)};for(let n of[t,e.querySelector(`.mh-sheet__header`)])n?.addEventListener(`pointerdown`,a);e.addEventListener(`pointermove`,o),e.addEventListener(`pointerup`,s),e.addEventListener(`pointercancel`,s)}function l_(e){return new Promise(t=>{let n=P({label:e.cancelLabel??`Cancel`,variant:`secondary`,onClick:()=>o.dismiss(`cancel`)}),r=P({label:e.confirmLabel??`Confirm`,variant:e.destructive?`danger`:`primary`,onClick:()=>o.dismiss(`confirm`)});n.el.classList.add(`mh-confirm__cancel`),r.el.classList.add(`mh-confirm__confirm`);let i=null,a=null;if(e.requireText){let t=e.requireText,n=I(`mh-confirm-input`);i=M(`input`,{class:`mh-confirm__input`,id:n,type:`text`,autocomplete:`off`,spellcheck:`false`}),a=M(`div`,{class:`mh-confirm__field`},M(`label`,{class:`mh-confirm__label`,for:n},e.requireTextLabel??`Type "${t}" to confirm`),i),r.setDisabled(!0),i.addEventListener(`input`,()=>r.setDisabled(i.value!==t)),i.addEventListener(`keydown`,e=>{e.key===`Enter`&&i.value===t&&(e.preventDefault(),o.dismiss(`confirm`))})}let o=r_({block:`dialog`,modifiers:[`mh-dialog--sm`,`mh-confirm`,e.destructive&&`mh-confirm--destructive`],role:`alertdialog`,title:e.title,description:e.message,closeButton:!1,container:e.container,content:a??void 0,footer:[n.el,r.el],initialFocus:()=>i??(e.destructive?n.el:r.el),onClose:e=>t(e===`confirm`)});o.body.hidden=!a,o.open()})}function u_(e={}){let t=e.size??`medium`,n=r_({...e,block:`dialog`,modifiers:[t!==`medium`&&`mh-dialog--${t===`small`?`sm`:`lg`}`],initialFocus:()=>n.panel.querySelector(`[autofocus]`)??Oh(n.body)[0]??Oh(n.footer)[0]});return i_(n)}function d_(e={}){return i_(r_({...e,block:`drawer`,modifiers:[`mh-drawer--${e.side??`right`}`]}))}var f_=e=>!(`separator`in e);function p_(e){return B(`mh-menu__item`,e.danger&&`mh-menu__item--danger`)}function m_(e){let t=e.anchor;t.id||=I(`mh-menu-button`);let n=M(`div`,{class:`mh-menu`,role:`menu`,id:I(`mh-menu`),"aria-labelledby":t.id,tabindex:-1});t.setAttribute(`aria-haspopup`,`menu`),t.setAttribute(`aria-expanded`,`false`);let r=[],i=!1,a=t=>{r=[],n.replaceChildren(...t.map(t=>{if(!f_(t))return M(`div`,{class:`mh-menu__separator`,role:`separator`});let n=M(`button`,{type:`button`,class:p_(t),role:`menuitem`,tabindex:-1,"aria-disabled":t.disabled?`true`:null,"data-value":t.value},t.icon?H(t.icon,{class:`mh-menu__icon`}):null,M(`span`,{class:`mh-menu__label`},t.label),t.shortcut?M(`kbd`,{class:`mh-menu__shortcut`},t.shortcut):null);return n.addEventListener(`click`,()=>{t.disabled||(f(!0),e.onSelect?.(t.value))}),r.push(n),n}))},o=()=>r.filter(e=>e.getAttribute(`aria-disabled`)!==`true`),s=e=>{if(e){for(let t of r)t.tabIndex=t===e?0:-1;e.focus({preventScroll:!0})}},c=()=>Ph(n,t,e.placement??`bottom-start`,4),l=e=>{let r=e.target;!n.contains(r)&&!t.contains(r)&&f(!1)},u=()=>{i&&c()};function d(r=`first`){i||(i=!0,Eh(e.container??t).append(n),t.setAttribute(`aria-expanded`,`true`),t.setAttribute(`aria-controls`,n.id),c(),document.addEventListener(`pointerdown`,l,!0),window.addEventListener(`resize`,u),window.addEventListener(`scroll`,u,!0));let a=o();s(r===`first`?a[0]:a[a.length-1]),a.length===0&&n.focus({preventScroll:!0})}function f(e){if(!i)return;i=!1,document.removeEventListener(`pointerdown`,l,!0),window.removeEventListener(`resize`,u),window.removeEventListener(`scroll`,u,!0),t.setAttribute(`aria-expanded`,`false`),t.removeAttribute(`aria-controls`);let r=n.contains(document.activeElement);n.remove(),(e||r)&&t.focus({preventScroll:!0})}let p=()=>i?f(!0):d(`first`),m=e=>{(e.key===`ArrowDown`||e.key===`ArrowUp`)&&(e.preventDefault(),d(e.key===`ArrowDown`?`first`:`last`))};return t.addEventListener(`click`,p),t.addEventListener(`keydown`,m),n.addEventListener(`keydown`,e=>{let t=o(),n=t.indexOf(document.activeElement);switch(e.key){case`ArrowDown`:e.preventDefault(),s(t[(n+1)%t.length]);break;case`ArrowUp`:e.preventDefault(),s(t[(n-1+t.length)%t.length]);break;case`Home`:e.preventDefault(),s(t[0]);break;case`End`:e.preventDefault(),s(t[t.length-1]);break;case`Escape`:e.preventDefault(),e.stopPropagation(),f(!0);break;case`Tab`:f(!0);break;default:if(e.key.length===1&&/\S/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){let r=e.key.toLowerCase(),i=t.length;for(let e=1;e<=i;e+=1){let a=t[(n+e+i)%i];if(a.textContent?.trim().toLowerCase().startsWith(r)){s(a);break}}}}}),n.addEventListener(`focusout`,e=>{let r=e.relatedTarget;i&&r&&!n.contains(r)&&r!==t&&f(!1)}),a(e.items),{el:n,open:d,close:()=>f(!0),isOpen:()=>i,setItems:a,destroy(){f(!1),t.removeEventListener(`click`,p),t.removeEventListener(`keydown`,m),t.removeAttribute(`aria-haspopup`),t.removeAttribute(`aria-expanded`)}}}var h_={label:`Command palette`,placeholder:`Search commands`,list:`Commands`,empty:`No matching commands`,move:`to move`,run:`to run`,close:`to close`,results:e=>e===1?`1 command`:`${e} commands`},g_=(e,t)=>t===0||/[\s\-_/.:]/.test(e[t-1]);function __(e,t){let n=e.toLowerCase().split(/\s+/).filter(Boolean);if(n.length===0)return{command:t,score:0,ranges:[]};let r=t.label.toLowerCase(),i=[...t.keywords??[],t.description??``,t.group??``].join(` `).toLowerCase(),a=0,o=[];for(let e of n){let t=-1;for(let n=r.indexOf(e);n>=0;n=r.indexOf(e,n+1)){if(g_(r,n)){t=n;break}t<0&&(t=n)}if(t>=0){a+=g_(r,t)?t===0?30:20:10,o.push([t,t+e.length]);continue}let n=i.indexOf(e);if(n>=0){a+=g_(i,n)?6:3;continue}let s=v_(r,e)??y_(r,e);if(!s)return null;a+=1;for(let e of s)o.push([e,e+1])}return r.startsWith(e.trim().toLowerCase())&&(a+=50),{command:t,score:a,ranges:b_(o)}}function v_(e,t){let n=[],r=0;for(let i=0;i<e.length&&r<t.length;i+=1)g_(e,i)&&e[i]===t[r]&&(n.push(i),r+=1);return r===t.length?n:null}function y_(e,t){for(let n=e.indexOf(t[0]);n>=0;n=e.indexOf(t[0],n+1)){let r=[n];for(let n of t.slice(1)){let t=e.indexOf(n,r[r.length-1]+1);if(t<0)return null;r.push(t)}if(r[r.length-1]-n+1<=t.length+2)return r}return null}function b_(e){let t=[...e].sort((e,t)=>e[0]-t[0]),n=[];for(let e of t){let t=n[n.length-1];t&&e[0]<=t[1]?t[1]=Math.max(t[1],e[1]):n.push([e[0],e[1]])}return n}function x_(e,t){let n=t.map(t=>__(e,t)).filter(e=>e!==null);return e.trim()?n.map((e,t)=>({m:e,i:t})).sort((e,t)=>t.m.score-e.m.score||e.i-t.i).map(e=>e.m):n}function S_(e,t){let n=[],r=0;for(let[i,a]of t)i>r&&n.push({text:e.slice(r,i),mark:!1}),n.push({text:e.slice(i,a),mark:!0}),r=a;return r<e.length&&n.push({text:e.slice(r),mark:!1}),n}function C_(e){return e.key.toLowerCase()===`k`&&(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey}function w_(e){return B(`mh-palette__option`,e&&`is-active`)}function T_(e){let t={...h_,...e.labels},n=I(`mh-palette-list`),r=M(`input`,{type:`text`,class:`mh-palette__input`,role:`combobox`,"aria-expanded":`true`,"aria-controls":n,"aria-autocomplete":`list`,"aria-label":t.placeholder,placeholder:t.placeholder,autocomplete:`off`,spellcheck:`false`,enterkeyhint:`go`}),i=M(`div`,{class:`mh-palette__list`,role:`listbox`,id:n,"aria-label":t.list}),a=M(`p`,{class:`mh-palette__empty`,hidden:!0},t.empty),o=M(`div`,{class:`mh-visually-hidden`,role:`status`}),s=(e,t)=>M(`span`,{class:`mh-palette__hint`},...e.map(e=>M(`kbd`,{},e)),` ${t}`),c=r_({block:`palette`,label:t.label,closeButton:!1,container:e.container,content:[M(`div`,{class:`mh-palette__search`},H(Dn,{class:`mh-palette__search-icon`}),r),i,a,o],footer:[s([`↑`,`↓`],t.move),s([`Enter`],t.run),s([`Esc`],t.close)],initialFocus:()=>r,onOpen:e.onOpen,onClose:e.onClose}),l=[...e.commands],u=[],d=[],f=-1,p=(e,t=!0)=>{f=e,d.forEach((t,n)=>{t.className=w_(n===e),t.setAttribute(`aria-selected`,String(n===e))});let n=d[e];n?(r.setAttribute(`aria-activedescendant`,n.id),t&&n.scrollIntoView?.({block:`nearest`})):r.removeAttribute(`aria-activedescendant`)},m=(e,t)=>{let n=u.length;for(let r=0;r<n;r+=1){let i=((e+t*r)%n+n)%n;if(!u[i].command.disabled)return i}return-1},h=(e,t)=>{let n=e.command,r=M(`span`,{class:`mh-palette__label`},...S_(n.label,e.ranges).map(e=>e.mark?M(`mark`,{class:`mh-palette__mark`},e.text):e.text)),i=M(`div`,{class:w_(!1),role:`option`,id:I(`mh-palette-option`),"aria-selected":`false`,"aria-disabled":n.disabled?`true`:null,"data-value":n.value},n.icon?H(n.icon,{class:`mh-palette__icon`}):M(`span`,{class:`mh-palette__icon`}),M(`span`,{class:`mh-palette__text`},r,n.description?M(`span`,{class:`mh-palette__description`},n.description):null),n.shortcut?M(`kbd`,{class:`mh-palette__shortcut`},n.shortcut):null);return i.addEventListener(`pointermove`,()=>{!n.disabled&&f!==t&&p(t,!1)}),i.addEventListener(`pointerdown`,e=>e.preventDefault()),i.addEventListener(`click`,()=>_(t)),i},g=()=>{let e=r.value;u=x_(e,l),d=[];let n=e.trim()!==``,s=[];if(n||u.every(e=>!e.command.group))for(let e of u){let t=h(e,d.length);d.push(t),s.push(t)}else{let e=u.some(e=>!e.command.group)?[void 0]:[];for(let t of u)t.command.group&&!e.includes(t.command.group)&&e.push(t.command.group);let t=[];for(let n of e){let e=u.filter(e=>(e.command.group||void 0)===n).map(e=>{let n=h(e,d.length);return d.push(n),t.push(e),n});if(n===void 0)s.push(...e);else{let t=I(`mh-palette-group`);s.push(M(`div`,{class:`mh-palette__group`,role:`group`,"aria-labelledby":t},M(`div`,{class:`mh-palette__heading`,id:t,role:`presentation`},n),...e))}}u=t}i.replaceChildren(...s),a.hidden=u.length>0,i.hidden=u.length===0,o.textContent=n?u.length?t.results(u.length):t.empty:``,p(u.length?m(0,1):-1,!1),i.scrollTop=0};function _(t){let n=u[t];n&&!n.command.disabled&&(c.close(),e.onSelect?.(n.command.value))}r.addEventListener(`input`,g),r.addEventListener(`keydown`,e=>{if(!e.isComposing)switch(e.key){case`ArrowDown`:e.preventDefault(),u.length&&p(m(f+1,1));break;case`ArrowUp`:e.preventDefault(),u.length&&p(m(f<0?u.length-1:f-1,-1));break;case`PageDown`:case`PageUp`:{if(e.preventDefault(),!u.length)break;let t=e.key===`PageDown`?1:-1,n=Math.min(u.length-1,Math.max(0,f+t*8));p(m(n,t));break}case`Enter`:e.preventDefault(),_(f)}});let v=e=>{C_(e)&&(e.preventDefault(),c.isOpen()?c.close():y())};e.hotkey&&document.addEventListener(`keydown`,v);function y(){c.isOpen()||(r.value=``,g(),c.open())}return{el:c.el,input:r,open:y,close:()=>c.close(),isOpen:c.isOpen,setCommands(e){l=[...e],g()},destroy(){document.removeEventListener(`keydown`,v),c.destroy()}}}var E_=e=>Array.isArray(e)?e:e===void 0?[]:[e];function D_(e=`auto`){return B(`mh-popover`,e===`wide`&&`mh-popover--wide`)}function O_(e){let t=e.anchor,n=e.placement??`bottom`,r=I(`mh-popover-title`),i=M(`h2`,{class:`mh-popover__title`,id:r},e.title??``),a=e.closeButton?U({icon:Hr,label:e.closeLabel??`Close`,size:`small`,onClick:()=>h(`close-button`,!0)}).el:null;a?.classList.add(`mh-popover__close`);let o=M(`div`,{class:`mh-popover__header`},i,a),s=M(`div`,{class:`mh-popover__body`});it(s,...E_(e.content));let c=M(`div`,{class:D_(e.size),role:`dialog`,id:I(`mh-popover`),tabindex:-1,"aria-labelledby":e.title?r:null,"aria-label":e.title?null:e.label??null},o,s),l=e=>{i.hidden=!e,o.hidden=!e&&!a};l(e.title??``),t.setAttribute(`aria-haspopup`,`dialog`),t.setAttribute(`aria-expanded`,`false`);let u=!1,d=()=>Ph(c,t,n,8),f=e=>{let n=e.target;!c.contains(n)&&!t.contains(n)&&h(`outside`,!1)},p=()=>{u&&d()};function m(){u||(u=!0,Eh(e.container??t).append(c),t.setAttribute(`aria-expanded`,`true`),t.setAttribute(`aria-controls`,c.id),d(),document.addEventListener(`pointerdown`,f,!0),window.addEventListener(`resize`,p),window.addEventListener(`scroll`,p,!0),(s.querySelector(`[autofocus]`)??Oh(s)[0]??c).focus({preventScroll:!0}),e.onOpen?.())}function h(n,r){if(!u)return;u=!1,document.removeEventListener(`pointerdown`,f,!0),window.removeEventListener(`resize`,p),window.removeEventListener(`scroll`,p,!0),t.setAttribute(`aria-expanded`,`false`),t.removeAttribute(`aria-controls`);let i=c.contains(document.activeElement);c.remove(),(r||i&&n!==`focus`)&&t.focus({preventScroll:!0}),e.onClose?.(n)}let g=()=>{u?h(`anchor`,!0):m()};return(e.toggleOnClick??!0)&&t.addEventListener(`click`,g),c.addEventListener(`keydown`,e=>{e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),h(`escape`,!0))}),c.addEventListener(`focusout`,e=>{let n=e.relatedTarget;u&&n&&!c.contains(n)&&n!==t&&h(`focus`,!1)}),{el:c,body:s,open:m,close:()=>h(`api`,!1),toggle:()=>u?h(`api`,!1):m(),isOpen:()=>u,setTitle(e){i.textContent=e,l(e),e&&(c.setAttribute(`aria-labelledby`,r),c.removeAttribute(`aria-label`)),u&&d()},setContent(...e){s.replaceChildren(),it(s,...e),u&&d()},reposition:()=>{u&&d()},destroy(){h(`api`,!1),t.removeEventListener(`click`,g),t.removeAttribute(`aria-haspopup`),t.removeAttribute(`aria-expanded`)}}}function k_(e=`primary`,t=`medium`){return B(`mh-split-button`,`mh-split-button--${e}`,t!==`medium`&&`mh-split-button--${t===`small`?`sm`:`lg`}`)}function A_(e,t=`primary`,n=`medium`){return B(z(t,n),`mh-split-button__${e}`)}function j_(e){let t=M(`span`,{class:`mh-button__label`},e.label),n=M(`button`,{type:`button`,class:A_(`main`,e.variant,e.size)},e.icon?H(e.icon):null,t),r=e.menuLabel??`More options`,i=M(`button`,{type:`button`,class:A_(`toggle`,e.variant,e.size),"aria-label":r,title:r},H(Yn)),a=M(`div`,{class:k_(e.variant,e.size),role:`group`,"aria-label":e.label},n,i);e.onClick&&n.addEventListener(`click`,e.onClick);let o=m_({anchor:i,items:e.items,placement:e.placement??`bottom-end`,onSelect:t=>e.onSelect?.(t),container:e.container}),s=e=>{n.disabled=e,i.disabled=e,e&&o.close()};return e.disabled&&s(!0),{el:a,button:n,toggle:i,menu:o,setLabel(e){t.textContent=e,a.setAttribute(`aria-label`,e)},setItems:o.setItems,setDisabled:s,destroy:o.destroy}}var M_={neutral:null,info:dn,success:xr,warning:_n,danger:zt},N_=400,P_=100;function F_(e=`bottom`){return`mh-toaster mh-toaster--${e}`}function I_(e=`neutral`){return B(`mh-toast`,`mh-toast--${e}`)}function L_(e={}){let t=e.placement??`bottom`,n=Math.max(1,e.max??3),r=M(`section`,{class:F_(t),"aria-label":e.label??`Notifications`,"aria-live":`polite`,"aria-relevant":`additions`,popover:`manual`});Eh(e.container).append(r);let i=()=>{typeof r.showPopover==`function`&&(r.matches(`:popover-open`)&&r.hidePopover(),r.showPopover())};i();let a=Date.now()+P_,o=[],s=[],c=null,l=()=>{let e=a-Date.now();if(e>0)c??=setTimeout(()=>{c=null,l()},e);else for(;o.length<n&&s.length>0;){let e=s.shift();o.push(e),i(),e.mount()}};return{el:r,show:t=>{let n=typeof t==`string`?{message:t}:t,i=n.tone??`neutral`,a=n.duration??e.duration??(n.action?8e3:5e3),c=n.icon===!1?null:n.icon??M_[i],u=!1,d=null,f=a,p=0,m=()=>{d!==null&&(clearTimeout(d),d=null,f-=Date.now()-p)},h=()=>{u||a<=0||d!==null||(p=Date.now(),d=setTimeout(g,Math.max(0,f)))},g=()=>{if(u)return;u=!0,d!==null&&clearTimeout(d),d=null;let e=s.indexOf(x);e>=0&&s.splice(e,1);let t=o.indexOf(x);if(t>=0&&o.splice(t,1),n.onDismiss?.(),!x.shown)return;y.classList.add(`is-leaving`);let r=!1,i=()=>{r||(r=!0,y.remove())};y.addEventListener(`animationend`,i,{once:!0}),setTimeout(i,N_),l()},_=n.action?P({label:n.action.label,variant:`text`,size:`small`,onClick:()=>{n.action.onClick(),g()}}).el:null;_?.classList.add(`mh-toast__action`);let v=n.dismissible===!1?null:U({icon:Hr,label:`Dismiss`,size:`small`,onClick:g}).el;v?.classList.add(`mh-toast__close`);let y=M(`div`,{class:I_(i),role:i===`danger`?`alert`:null},c?H(c,{class:`mh-toast__icon`}):null,M(`div`,{class:`mh-toast__content`},n.title?M(`p`,{class:`mh-toast__title`},n.title):null,M(`p`,{class:`mh-toast__message`},n.message)),_,v);y.addEventListener(`pointerenter`,m),y.addEventListener(`pointerleave`,()=>{y.contains(document.activeElement)||h()}),y.addEventListener(`focusin`,m),y.addEventListener(`focusout`,e=>{y.contains(e.relatedTarget)||h()}),y.addEventListener(`keydown`,e=>{e.key===`Escape`&&(e.stopPropagation(),g())});let b={el:y,dismiss:g},x={handle:b,shown:!1,mount(){x.shown=!0,r.append(y),h()}};return s.push(x),l(),b},dismissAll(){for(let e of[...s,...o])e.handle.dismiss()},destroy(){c!==null&&clearTimeout(c),s.length=0;for(let e of[...o])e.handle.dismiss();r.remove()}}}var R_=120;function z_(e,t){let n=M(`div`,{class:`mh-tooltip`,role:`tooltip`,id:I(`mh-tooltip`),hidden:!0},t.text);Eh(t.container??e).append(n);let r=e.getAttribute(`title`);e.removeAttribute(`title`);let i=e.getAttribute(`aria-describedby`),a=t.text,o=()=>{let t=(i??``).split(/\s+/).filter(Boolean);e.getAttribute(`aria-label`)!==a&&t.push(n.id),t.length?e.setAttribute(`aria-describedby`,t.join(` `)):e.removeAttribute(`aria-describedby`)};o();let s=null,c=null,l=!1,u=()=>{s!==null&&clearTimeout(s),c!==null&&clearTimeout(c),s=c=null},d=e=>{e.key===`Escape`&&l&&p()};function f(){if(u(),l)return;l=!0;let r=Eh(t.container??e);n.parentElement!==r&&r.append(n),n.hidden=!1,Ph(n,e,t.placement??`top`,8),document.addEventListener(`keydown`,d,!0)}function p(){u(),l&&(l=!1,n.hidden=!0,document.removeEventListener(`keydown`,d,!0))}let m=()=>{s!==null&&clearTimeout(s),s=null,c??=setTimeout(p,R_)},h=e=>{e.pointerType!==`touch`&&(c!==null&&clearTimeout(c),c=null,l||(s??=setTimeout(f,t.delay??500)))},g=()=>{let t=!0;try{t=e.matches(`:focus-visible`)}catch{}t&&f()};return e.addEventListener(`pointerenter`,h),e.addEventListener(`pointerleave`,m),e.addEventListener(`focus`,g),e.addEventListener(`blur`,p),e.addEventListener(`pointerdown`,p),n.addEventListener(`pointerenter`,()=>{c!==null&&clearTimeout(c),c=null}),n.addEventListener(`pointerleave`,m),{el:n,show:f,hide:p,setText(r){a=r,n.textContent=r,o(),l&&Ph(n,e,t.placement??`top`,8)},destroy(){p(),n.remove(),e.removeEventListener(`pointerenter`,h),e.removeEventListener(`pointerleave`,m),e.removeEventListener(`focus`,g),e.removeEventListener(`blur`,p),e.removeEventListener(`pointerdown`,p),r!==null&&e.setAttribute(`title`,r),i===null?e.removeAttribute(`aria-describedby`):e.setAttribute(`aria-describedby`,i)}}}var B_=(...e)=>M(`div`,{class:`ex-row`},...e),V_=e=>M(`span`,{class:`ex-meta`,"aria-live":`polite`},e),W=(e,t,n=`secondary`)=>P({label:e,variant:n,onClick:t}).el,H_=e=>M(`p`,{style:`margin: 0 0 var(--mh-space-md)`},e),U_=[`Changes apply to every screen that uses this layout.`,`You can come back and adjust these at any time; nothing is lost when you close this panel.`,`Swipe down on the handle, press Escape or tap outside to close it.`];function W_(){return M(`div`,{class:`ex-stack`},...[`Brightness follows the time of day`,`Dim the screen after one minute`,`Show the clock while idle`].map(e=>M(`label`,{class:`ex-row`,style:`justify-content: space-between`},M(`span`,{},e),M(`input`,{type:`checkbox`,checked:!0}))))}var G_=null,K_={};function q_(e){let t=K_[e];if(t?.el.isConnected)return t;let n=L_({placement:e,max:3});return K_={...K_,[e]:n},n}var J_=[{id:`bottom-sheet`,render:()=>{let e=M(`div`,{class:`ex-stack`}),t=V_(`closed`),n=s_({title:`Display`,description:`How the screen behaves when nobody is using it.`,container:e,content:W_(),footer:[W(`Cancel`,()=>n.close()),W(`Apply`,()=>n.close(),`primary`)],onOpen:()=>t.textContent=`open`,onClose:e=>t.textContent=`closed (${e})`}),r=s_({title:`About this panel`,container:e,content:Array.from({length:12},(e,t)=>H_(U_[t%U_.length]))}),i=s_({label:`Quick actions`,closeButton:!1,container:e,content:B_(W(`Scene one`,()=>i.close()),W(`Scene two`,()=>i.close()),W(`All off`,()=>i.close(),`tonal`))});return e.append(B_(W(`Open sheet`,()=>n.open(),`primary`),W(`Long content`,()=>r.open()),W(`No header`,()=>i.open()),t)),e.append(M(`p`,{class:`ex-meta`},`A sheet from the bottom on phones, a centred panel on wide screens.`)),e}},{id:`drawer`,render:()=>{let e=M(`div`,{class:`ex-stack`}),t=t=>{let n=d_({side:t,title:t===`left`?`Navigate`:`Filters`,container:e,content:t===`left`?M(`nav`,{class:`ex-stack`},...[`Overview`,`Rooms`,`Schedules`,`Settings`].map(e=>M(`a`,{href:`#drawer`},e))):W_(),footer:t===`right`?[W(`Reset`,()=>n.close()),W(`Show results`,()=>n.close(),`primary`)]:void 0});return n},n=t(`right`),r=t(`left`);return e.append(B_(W(`Open right`,()=>n.open(),`primary`),W(`Open left`,()=>r.open()))),e}},{id:`dialog`,render:()=>{let e=M(`div`,{class:`ex-stack`}),t=(t,n)=>{let r=u_({size:t,title:n,description:`Give it a short name you will recognise later.`,container:e,content:M(`input`,{type:`text`,value:`Evening`,"aria-label":`Name`,style:`width: 100%; font: inherit; padding: var(--mh-space-sm); border-radius: var(--mh-radius-sm); border: var(--mh-border-width) solid var(--mh-outline); background: var(--mh-input); color: var(--mh-text)`}),footer:[W(`Cancel`,()=>r.close()),W(`Save`,()=>r.close(),`primary`)]});return r},n=t(`medium`,`Rename scene`),r=t(`large`,`A wider dialog`),i=t(`small`,`A narrow dialog`);return e.append(B_(W(`Open dialog`,()=>n.open(),`primary`),W(`Small`,()=>i.open()),W(`Large`,()=>r.open()))),e}},{id:`confirm`,render:()=>{let e=M(`div`,{class:`ex-stack`}),t=V_(`—`),n=n=>async()=>{t.textContent=await l_({...n,container:e})?`confirmed`:`cancelled`};return e.append(B_(W(`Confirm`,n({title:`Restart now?`,message:`The screen goes dark for a few seconds.`,confirmLabel:`Restart`}),`primary`),W(`Destructive`,n({title:`Delete this scene?`,message:`This cannot be undone.`,confirmLabel:`Delete`,destructive:!0}),`danger`),W(`Type to confirm`,n({title:`Reset everything?`,message:`Every setting goes back to its default.`,confirmLabel:`Reset`,destructive:!0,requireText:`reset`})),t)),e}},{id:`toast`,render:()=>{let e=(e,t=`bottom`)=>()=>void q_(t).show(e);return M(`div`,{class:`ex-stack`},B_(W(`Neutral`,e({message:`Settings saved`})),W(`Info`,e({tone:`info`,message:`An update is ready`})),W(`Success`,e({tone:`success`,title:`Connected`,message:`The device is online again.`})),W(`Warning`,e({tone:`warning`,message:`Battery is getting low`})),W(`Danger`,e({tone:`danger`,message:`Could not reach the server`}))),B_(W(`With action`,e({message:`Scene deleted`,action:{label:`Undo`,onClick:()=>void 0}}),`primary`),W(`Stays until closed`,e({tone:`info`,message:`This one waits for you.`,duration:0})),W(`Top end`,e({tone:`success`,message:`Shown at the top end`},`top-end`))),M(`p`,{class:`ex-meta`},`Up to three at a time; the rest queue. Hover or focus pauses the timer.`))}},{id:`menu`,render:()=>{let e=V_(`—`),t=[{value:`edit`,label:`Edit`,icon:`edit`,shortcut:`E`},{value:`duplicate`,label:`Duplicate`,icon:`copy`,shortcut:`Ctrl+D`},{value:`share`,label:`Share`,icon:`share`},{value:`archive`,label:`Archive`,disabled:!0},{separator:!0},{value:`delete`,label:`Delete`,icon:`delete`,danger:!0}],n=U({icon:`more`,label:`More actions`}).el;m_({anchor:n,items:t,onSelect:t=>e.textContent=t});let r=P({label:`Sort by`,variant:`secondary`,trailingIcon:`chevron-down`}).el;return m_({anchor:r,placement:`bottom-end`,items:[{value:`name`,label:`Name`},{value:`recent`,label:`Recently used`},{value:`room`,label:`Room`}],onSelect:t=>e.textContent=`sort: ${t}`}),M(`div`,{class:`ex-stack`},B_(n,r,e),M(`p`,{class:`ex-meta`},`Arrow keys, Home, End and a letter move; Escape closes.`))}},{id:`tooltip`,render:()=>{let e=(e,t,n=`top`)=>(z_(e,{text:t,placement:n}),e);return M(`div`,{class:`ex-stack`},B_(e(U({icon:`refresh`,label:`Refresh`}).el,`Refresh`),e(U({icon:`settings`,label:`Settings`}).el,`Settings`),e(U({icon:`info`,label:`About`}).el,`Shows version and licence details`,`bottom`),e(P({label:`Hover or focus me`,variant:`secondary`}).el,`A short hint, never essential information`)))}},{id:`split-button`,render:()=>{let e=V_(`—`),t=[{value:`in-10`,label:`Run in 10 minutes`,icon:`refresh`},{value:`at-sunset`,label:`Run at sunset`,icon:`weather`},{separator:!0},{value:`edit`,label:`Edit scene`,icon:`edit`}],n=(n,r,i=!1)=>j_({label:`Run scene`,icon:`play`,variant:n,size:r,disabled:i,items:t,onClick:()=>e.textContent=`run (${n})`,onSelect:t=>e.textContent=t}).el;return M(`div`,{class:`ex-stack`},B_(n(`primary`),n(`secondary`),n(`tonal`),e),B_(n(`primary`,`small`),n(`secondary`,`large`),n(`primary`,void 0,!0)),M(`p`,{class:`ex-meta`},`The main half runs the default; the chevron opens the alternatives (Arrow Down opens it too).`))}},{id:`popover`,render:()=>{let e=M(`div`,{class:`ex-stack`}),t=V_(`brightness: 70%`),n=M(`input`,{type:`range`,min:0,max:100,value:70,"aria-label":`Brightness`,style:`width: 100%`});n.addEventListener(`input`,()=>t.textContent=`brightness: ${n.value}%`);let r=P({label:`Desk lamp`,icon:`lightbulb-on`,variant:`secondary`,trailingIcon:`chevron-down`}).el;O_({anchor:r,title:`Desk lamp`,container:e,content:M(`div`,{class:`ex-stack`},n,M(`label`,{class:`ex-row`},M(`input`,{type:`checkbox`,checked:!0}),`Follow the sun`))});let i=U({icon:`filter`,label:`Filter rooms`}).el;O_({anchor:i,label:`Filter rooms`,placement:`bottom-start`,size:`wide`,closeButton:!0,container:e,content:M(`div`,{class:`ex-stack`},...[`Living room`,`Kitchen`,`Bedroom`,`Garden`].map(e=>M(`label`,{class:`ex-row`},M(`input`,{type:`checkbox`,checked:e!==`Garden`}),e)))});let a=U({icon:`info`,label:`About this sensor`}).el;return O_({anchor:a,title:`Air quality`,placement:`top`,container:e,content:M(`p`,{style:`margin: 0; max-width: 32ch`},`Measured every five minutes in the hallway. Readings under 50 are good.`)}),e.append(B_(r,i,a,t),M(`p`,{class:`ex-meta`},`Not modal: Escape, a press outside or Tab leaving it closes it.`)),e}},{id:`command-palette`,render:()=>{let e=M(`div`,{class:`ex-stack`}),t=V_(`—`),n=[{value:`search`,label:`Search devices`,icon:`search`,shortcut:`/`},{value:`lights-off`,label:`Turn off all lights`,icon:`lightbulb`,group:`Lights`,keywords:[`dark`,`night`],description:`Every room`},{value:`lights-on`,label:`Turn on all lights`,icon:`lightbulb-on`,group:`Lights`},{value:`evening`,label:`Evening scene`,icon:`play`,group:`Scenes`,description:`Living room and kitchen at 40%`},{value:`movie`,label:`Film night`,icon:`film`,group:`Scenes`,keywords:[`cinema`]},{value:`lock`,label:`Lock the front door`,icon:`lock`,group:`Security`,shortcut:`Ctrl+L`},{value:`away`,label:`Away mode`,icon:`home`,group:`Security`,description:`Needs a connected alarm`,disabled:!0},{value:`heating`,label:`Set heating to 20°`,icon:`thermometer`,group:`Climate`,keywords:[`temperature`,`warm`]},{value:`fan`,label:`Bedroom fan off`,icon:`fan`,group:`Climate`},{value:`settings`,label:`Open settings`,icon:`settings`,group:`App`,shortcut:`Ctrl+,`},{value:`theme`,label:`Switch theme`,icon:`eye`,group:`App`}];G_?.destroy();let r=T_({commands:n,hotkey:!0,container:e,onSelect:e=>t.textContent=`ran: ${e}`});return G_=r,e.append(B_(P({label:`Open palette`,icon:`search`,variant:`primary`,onClick:()=>r.open()}).el,M(`span`,{class:`ex-meta`},`or press Ctrl+K`),t),M(`p`,{class:`ex-meta`},`Type to filter ("lights", "night", "tfd"); arrow keys move, Enter runs, Escape closes.`)),e}}];function Y_(e=!1){return B(`mh-empty-state`,e&&`mh-empty-state--compact`)}function X_(e){return{el:M(`div`,{class:Y_(e.compact)},e.icon?M(`span`,{class:`mh-empty-state__icon`},H(e.icon)):null,M(`h${e.headingLevel??3}`,{class:`mh-empty-state__title`},e.title),e.text?M(`p`,{class:`mh-empty-state__text`},e.text):null,e.action?M(`div`,{class:`mh-empty-state__action`},e.action):null)}}function Z_(e){return[e.status,e.detail].filter(e=>!!e).join(` · `)}var Q_=e=>gi({label:e.name,value:e.value,tone:e.tone});function $_(e){let t=M(`span`,{class:`mh-progress-list__name`}),n=M(`span`,{class:`mh-progress-list__value`,"aria-hidden":`true`}),r=M(`span`,{class:`mh-progress-list__meta`}),i=Q_(e),a={li:M(`li`,{class:`mh-progress-list__item`},M(`div`,{class:`mh-progress-list__header`},t,n),i.el),name:t,value:n,meta:r,bar:i,tone:e.tone};return ev(a,e),a}function ev(e,t){if(e.name.textContent=t.name,e.value.textContent=fi(t.value),e.tone!==t.tone||e.bar.el.getAttribute(`aria-label`)!==t.name){let n=Q_(t);e.bar.el.replaceWith(n.el),e.bar=n,e.tone=t.tone}else e.bar.setValue(t.value);let n=Z_(t);e.meta.textContent=n,n?e.li.append(e.meta):e.meta.remove()}function tv(e){let t=M(`ul`,{class:`mh-progress-list`,"aria-label":e.label}),n=[],r=e=>{e.forEach((e,r)=>{let i=n[r];if(i)ev(i,e);else{let r=$_(e);n.push(r),t.append(r.li)}});for(let t of n.slice(e.length))t.li.remove();n=n.slice(0,e.length)};return r(e.items),{el:t,setItems:r}}function nv(e=3){let t=Math.max(1,Math.floor(e));return Array.from({length:t},(e,n)=>n===t-1&&t>1?`60%`:`100%`)}function rv(e,t){return[e&&`width: ${e}`,t&&`height: ${t}`].filter(Boolean).join(`; `)||void 0}function iv(e=`text`){return B(`mh-skeleton`,`mh-skeleton--${e}`)}function av(e={}){let t=e.shape??`text`,n=t===`text`?nv(e.lines).map(e=>M(`span`,{class:`mh-skeleton__line`,"aria-hidden":`true`,style:`width: ${e}`})):[M(`span`,{class:`mh-skeleton__shape`,"aria-hidden":`true`,style:rv(e.width,e.height)})];return{el:M(`div`,{class:iv(t),role:`status`,"aria-busy":`true`,"aria-label":e.label??`Loading`},...n)}}var ov={online:`Online`,offline:`Offline`,busy:`Busy`,away:`Away`,error:`Error`,unknown:`Unknown`,live:`Live`};function sv(e){return B(`mh-status`,`mh-status--${e}`)}function cv(e){let t=M(`span`,{class:`mh-status__label`}),n=M(`span`,{role:e.announce?`status`:null},M(`span`,{class:`mh-status__dot`,"aria-hidden":`true`}),t),r=(e,r)=>{n.className=sv(e),t.textContent=r??ov[e]};return r(e.state,e.label),{el:n,setState:r}}var lv={listening:`Listening…`,transcribing:`Transcribing…`,thinking:`Thinking…`,speaking:`Speaking…`,idle:`Tap to talk`};function uv(e=`conversation`,t=`listening`){return B(`mh-voice-bar`,`mh-voice-bar--${e}`,`is-${t}`)}function dv(e){return Math.round((Number.isFinite(e)?Math.min(1,Math.max(0,e)):0)*100)/100}var fv=()=>Array(24).fill(0);function pv(e,t){return[...e,dv(t)].slice(-24)}function mv(e={}){let t=e.variant??`conversation`,n=e.phase??`listening`,r=e.label,i=()=>r??lv[n],a=M(`p`,{class:`mh-voice-bar__label`,"aria-live":`polite`},i()),o=M(`div`,{class:uv(t,n)}),s=(e,t,n)=>e.style.setProperty(t,String(n)),c=null,u=[],d=fv(),f=null,p=()=>u.forEach((e,t)=>s(e,`--_v`,d[t])),m=e.doneLabel??`Done`;if(t===`conversation`){let t=[0,1,2,3].map(()=>M(`span`,{class:`mh-voice-bar__tile`}));c=e.onTap?M(`button`,{type:`button`,class:`mh-voice-bar__mosaic`,"aria-label":i()},...t):M(`span`,{class:`mh-voice-bar__mosaic`,"aria-hidden":`true`},...t),e.onTap&&c.addEventListener(`click`,()=>e.onTap()),s(c,`--_level`,dv(e.level));let n=e.endLabel??`End conversation`,r=M(`button`,{type:`button`,class:B(l(`danger`),`mh-voice-bar__end`),"aria-label":n,title:n},H(tr));e.onEnd&&r.addEventListener(`click`,()=>e.onEnd());let u=Array.isArray(e.leading)?e.leading:[e.leading];if(u.some(e=>e!=null&&e!==!1)){let e=M(`div`,{class:`mh-voice-bar__leading`});it(e,...u),o.append(e)}o.append(c,a,r)}else{e.level!==void 0&&(d=pv(d,e.level)),u=d.map(()=>M(`span`,{class:`mh-voice-bar__bar`})),p();let t=e.cancelLabel??`Cancel`,n=M(`button`,{type:`button`,class:B(l(),`mh-voice-bar__cancel`),"aria-label":t,title:t},H(Hr));e.onCancel&&n.addEventListener(`click`,()=>e.onCancel()),f=M(`button`,{type:`button`,class:B(l(`accent`,`medium`,!0),`mh-voice-bar__done`),"aria-label":m,title:m}),e.onDone&&f.addEventListener(`click`,()=>e.onDone()),o.append(n,M(`div`,{class:`mh-voice-bar__wave`,"aria-hidden":`true`},...u),a,f)}let h={el:o,setPhase(e){n=e,o.className=uv(t,n),h.setLabel(r)},setLevel(e){c&&s(c,`--_level`,dv(e)),u.length&&(d=pv(d,e),p())},setLabel(e){r=e,a.textContent=i(),c?.tagName===`BUTTON`&&c.setAttribute(`aria-label`,i())},setBusy(e){f&&(f.disabled=e,e?f.setAttribute(`aria-busy`,`true`):f.removeAttribute(`aria-busy`),f.replaceChildren(e?kr({size:`small`,inherit:!0,label:m}).el:H(Wt)))}};return h.setBusy(e.busy??!1),h}var hv={permission:Jt,capability:dn,tip:Lr};function gv(e=`tip`){return B(`mh-notice`,`mh-notice--${e}`)}var _v=(e=`tip`,t)=>t??e===`tip`;function vv(e,t=!1){return e===`permission`?{variant:t?`primary`:`text`,size:`medium`}:{variant:t?`tonal`:`text`,size:`small`}}function yv(e){let t=e.kind??`tip`,n=t===`permission`&&e.title?I(`mh-notice`):null,r=e.title?t===`permission`?M(`h${e.headingLevel??3}`,{class:`mh-notice__title`,id:n},e.title):M(`p`,{class:`mh-notice__title`},e.title):null,i=M(`p`,{class:`mh-notice__message`},e.message),a=M(`div`,{class:`mh-notice__body`},r,i);e.points?.length&&a.append(M(`ul`,{class:`mh-notice__points`},...e.points.map(e=>M(`li`,{class:`mh-notice__point`},H(Wt),M(`span`,{},e)))));let o=t===`permission`?M(`section`,{class:gv(t),"aria-labelledby":n}):M(`div`,{class:gv(t),role:`note`});e.icon!==!1&&o.append(M(`span`,{class:`mh-notice__icon`},H(e.icon??hv[t]))),o.append(a);let s=()=>{e.onDismiss?.(),o.remove()};if(e.actions?.length){let n=M(`div`,{class:`mh-notice__actions`});for(let r of e.actions){let{variant:e,size:i}=vv(t,r.primary),a=M(`button`,{type:`button`,class:z(e,i)},M(`span`,{class:`mh-button__label`},r.label));a.addEventListener(`click`,()=>{r.onClick?.(),r.dismisses&&s()}),n.append(a)}a.append(n)}if(_v(t,e.dismissible)){let t=e.dismissLabel??`Dismiss`;o.append(M(`button`,{type:`button`,class:`mh-notice__dismiss`,"aria-label":t,title:t,onclick:s},H(Hr)))}return{el:o,setMessage(e){i.textContent=e},dismiss:s}}function bv(e){let t=Math.max(0,Math.floor(Number.isFinite(e)?e:0)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=String(t%60).padStart(2,`0`);return n?`${n}:${String(r).padStart(2,`0`)}:${i}`:`${r}:${i}`}function xv(e){return`PT${Math.max(0,Math.floor(Number.isFinite(e)?e:0))}S`}var Sv=()=>Array(16).fill(0);function Cv(e,t){return[...e,dv(t)].slice(-16)}function wv(e=!1,t){return B(`mh-recording-pill`,t&&`mh-recording-pill--floating mh-recording-pill--${t}`,e?`is-paused`:`is-recording`)}function Tv(e={}){let t=e.label??`Recording`,n=e.pausedLabel??`Paused`,r=e.paused??!1,i=Math.max(0,e.elapsed??0),a=e.level===void 0?Sv():Cv(Sv(),e.level),o=M(`span`,{class:`mh-recording-pill__status mh-visually-hidden`,"aria-live":`polite`}),s=M(`time`,{class:`mh-recording-pill__timer`,role:`timer`}),c=a.map(()=>M(`span`,{class:`mh-recording-pill__bar`})),u=M(`div`,{class:wv(r,e.floating),role:`group`,"aria-label":t},M(`span`,{class:`mh-recording-pill__dot`,"aria-hidden":`true`}),o,s,M(`span`,{class:`mh-recording-pill__wave`,"aria-hidden":`true`},...c)),d=null;if(e.onPauseToggle&&(d=M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-recording-pill__pause`)}),d.addEventListener(`click`,()=>{b.setPaused(!r),e.onPauseToggle(r)}),u.append(d)),e.onStop){let t=e.stopLabel??`Stop recording`,n=M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-recording-pill__stop`),"aria-label":t,title:t},H(Ie));n.addEventListener(`click`,()=>e.onStop()),u.append(n)}let f=()=>{s.textContent=bv(i),s.setAttribute(`datetime`,xv(i))},p=()=>c.forEach((e,t)=>e.style.setProperty(`--_v`,String(a[t]))),m=()=>{if(u.className=wv(r,e.floating),o.textContent=r?n:t,d){let t=r?e.resumeLabel??`Resume recording`:e.pauseLabel??`Pause recording`;d.setAttribute(`aria-label`,t),d.title=t,d.replaceChildren(H(r?Re:ee))}},h=0,g=null,_=!1,v=()=>{g!==null&&clearInterval(g),g=null},y=()=>{v(),!(r||e.ticking===!1)&&(h=Date.now()-i*1e3,g=setInterval(()=>{if(u.isConnected)_=!0;else if(_)return v();let e=Math.floor((Date.now()-h)/1e3);e!==Math.floor(i)&&(i=e,f())},250))},b={el:u,get elapsed(){return i},setElapsed(e){i=Math.max(0,e),f(),g!==null&&y()},setPaused(e){e!==r&&(r=e,m(),y())},setLevel(e){a=Cv(a,e),p()},destroy:v};return f(),p(),m(),y(),b}var Ev=(...e)=>M(`div`,{class:`ex-row`},...e),Dv=(...e)=>M(`div`,{class:`ex-stack`},...e),Ov=e=>C(e,{variant:`label`,tone:`muted`}),kv=[{id:`alert`,render:()=>Dv(di({tone:`info`,message:`The kitchen light schedule starts at sunset.`}).el,di({tone:`success`,title:`Saved`,message:`Living room scene updated.`,dismissible:!0}).el,di({tone:`warning`,title:`Battery low`,message:`Front door sensor is at 12%.`,action:P({label:`Details`,variant:`text`,size:`small`}).el}).el,di({tone:`danger`,title:`Hallway sensor offline`,message:`No reading for 2 hours.`,action:P({label:`Retry`,variant:`secondary`,size:`small`}).el,dismissible:!0}).el)},{id:`progress-bar`,render:()=>{let e=gi({label:`Firmware update`,showLabel:!0,showValue:!0,value:0}),t=0,n=window.setInterval(()=>{if(!e.el.isConnected&&t>0)return window.clearInterval(n);t=(t+7)%107,e.setValue(Math.min(t,100))},600);return Dv(gi({label:`Battery`,showLabel:!0,showValue:!0,value:82,valueText:`82%`,tone:`success`}).el,e.el,gi({label:`Rooms synced`,showLabel:!0,showValue:!0,value:3,max:8,valueText:`3 of 8 rooms`}).el,gi({label:`Searching for devices`,showLabel:!0}).el,Ov(`Sizes and tones`),gi({label:`Small`,value:30,size:`small`}).el,gi({label:`Warning`,value:64,tone:`warning`}).el,gi({label:`Danger`,value:92,tone:`danger`,size:`large`}).el)}},{id:`progress-ring`,render:()=>Dv(Ev(ui({label:`Battery`,value:82,tone:`success`,size:`large`}).el,ui({label:`Humidity`,value:46}).el,ui({label:`Filter life`,value:18,tone:`warning`}).el,ui({label:`Disk`,value:95,tone:`danger`,size:`small`}).el),Ev(ui({label:`Connecting`}).el,ui({label:`Rooms`,value:5,max:8,valueText:`5/8`,size:`large`}).el))},{id:`spinner`,render:()=>Dv(Ev(kr({size:`small`}).el,kr().el,kr({size:`large`,label:`Loading rooms`}).el),Ev(M(`span`,{class:`mh-text--label ex-row`,style:`color: var(--mh-text-muted)`},kr({size:`small`,inherit:!0}).el,`Refreshing kitchen light`)))},{id:`skeleton`,render:()=>Dv(Ev(av({shape:`circle`}).el,M(`div`,{style:`flex: 1`},av({lines:2}).el)),av({shape:`block`}).el,av({lines:4}).el)},{id:`badge`,render:()=>Dv(Ev(hi({label:`Default`}).el,hi({label:`Beta`,tone:`accent`}).el,hi({label:`Info`,tone:`info`}).el,hi({label:`Online`,tone:`success`}).el,hi({label:`Low`,tone:`warning`}).el,hi({label:`Error`,tone:`danger`}).el),Ev(hi({count:3}).el,hi({count:42,tone:`accent`}).el,hi({count:120}).el,hi({dot:!0,label:`Update available`}).el),Ov(`Attached to an icon button`),Ev(M(`span`,{class:`mh-badge-host`},U({icon:`bell`,label:`Notifications, 4 unread`,filled:!0}).el,hi({count:4,attached:!0}).el),M(`span`,{class:`mh-badge-host`},U({icon:`settings`,label:`Settings, update available`,filled:!0}).el,hi({dot:!0,attached:!0,label:`Update available`}).el)))},{id:`status`,render:()=>Dv(Ev(...[`online`,`offline`,`busy`,`away`,`error`,`unknown`].map(e=>cv({state:e}).el)),Ev(cv({state:`live`}).el,cv({state:`online`,label:`Connected`}).el,cv({state:`unknown`,label:`Untested`}).el))},{id:`empty-state`,render:()=>Dv(X_({icon:`lightbulb`,title:`No lights yet`,text:`Add a light to control it from here.`,action:P({label:`Add light`,icon:`add`}).el}).el,M(`div`,{class:`mh-card mh-card--flat`},X_({icon:`search`,title:`Nothing found`,text:`Try another room or device name.`,compact:!0}).el))},{id:`progress-list`,render:()=>{let e=e=>[{name:`Hallway sensor firmware`,value:Math.min(100,20+e*6),status:e*6>=80?`Installed`:`Updating`,detail:`Version 2.3.1`,tone:e*6>=80?`success`:`accent`},{name:`Weekly backup`,value:Math.min(100,55+e*3),status:`Uploading`,detail:`${(1.2+e*.07).toFixed(1)} of 3.4 GB`},{name:`Map of the garden`,value:null,status:`Preparing`},{name:`Voice model for the kitchen display, a long name that is cut short`,value:64,status:`Paused`,detail:`Low battery`,tone:`warning`},{name:`Camera clip export`,value:12,status:`Failed`,detail:`Not enough space`,tone:`danger`}],t=tv({label:`Jobs`,items:e(0)}),n=0,r=window.setInterval(()=>{if(!t.el.isConnected&&n>0)return window.clearInterval(r);n=(n+1)%16,t.setItems(e(n))},900);return M(`div`,{class:`mh-grid`},V({title:`Updates and backups`,body:t.el}).el)}},{id:`voice-bar`,render:()=>{let e=(e,t)=>{let n=0,r=setInterval(()=>{if(!e.isConnected&&n>0)return clearInterval(r);n+=1,t(Math.max(0,Math.min(1,.45+.35*Math.sin(n/2.3)+(Math.random()-.5)*.4)))},90)},t=[`listening`,`transcribing`,`thinking`,`speaking`,`idle`],n=0,r=mv({leading:U({icon:`keyboard`,label:`Type instead`}).el,onTap:()=>{n=(n+1)%t.length,r.setPhase(t[n])},onEnd:()=>r.setPhase(`idle`)});e(r.el,e=>r.setLevel(e));let i=mv({variant:`dictation`,onCancel:()=>i.setPhase(`idle`),onDone:()=>{i.setPhase(`transcribing`),i.setBusy(!0),setTimeout(()=>{i.setBusy(!1),i.setPhase(`listening`)},1500)}});return e(i.el,e=>i.setLevel(e)),Dv(Ov(`Conversation: press the mosaic to step through the phases`),r.el,...[`thinking`,`speaking`,`idle`].map(e=>mv({phase:e,onEnd:()=>{}}).el),Ov(`Dictation: Done transcribes for a moment`),i.el,mv({variant:`dictation`,phase:`transcribing`,busy:!0}).el)}},{id:`notices`,render:()=>{let e=M(`div`),t=()=>{e.replaceChildren(yv({kind:`tip`,title:`Tip`,message:`Long-press a tile to change its size or move it to another room.`,actions:[{label:`Got it`,primary:!0,dismisses:!0}],onDismiss:()=>setTimeout(()=>e.replaceChildren(P({label:`Show the tip again`,variant:`text`,size:`small`,onClick:t}).el))}).el)};t();let n=Ov(``);return Dv(Ov(`Permission explainer, before the system asks`),M(`div`,{style:`max-width: 420px`},yv({kind:`permission`,icon:`microphone`,title:`Talk to your home`,message:`Allow microphone access to control lights and climate by voice.`,points:[`Listens only while you hold the button`,`Audio goes to your own Home Assistant`,`Turn it off any time in Settings`],actions:[{label:`Allow microphone`,primary:!0,onClick:()=>n.textContent=`Allowed`},{label:`Not now`,onClick:()=>n.textContent=`Asked again later`}]}).el),n,Ov(`Capability notices`),yv({kind:`capability`,message:`Voice control needs a microphone, and this display has none.`,actions:[{label:`Learn more`}]}).el,yv({kind:`capability`,icon:`wifi`,title:`Works offline`,message:`Cameras need a connection; lights and climate keep working without one.`}).el,Ov(`Dismissible tip`),e,yv({kind:`tip`,icon:`keyboard`,message:`Press / anywhere to search for a device.`}).el)}},{id:`recording-pill`,render:()=>{let e=e=>{let t=0,n=setInterval(()=>{if(!e.el.isConnected&&t>0)return e.destroy(),clearInterval(n);t+=1,e.setLevel(Math.max(0,Math.min(1,.4+.35*Math.sin(t/1.7)+(Math.random()-.5)*.5)))},120)},t=Ov(`Recording`),n=Tv({elapsed:42,onPauseToggle:e=>t.textContent=e?`Paused`:`Recording`,onStop:()=>{n.setPaused(!0),n.setElapsed(0),t.textContent=`Stopped and saved`}});e(n);let r=Tv({elapsed:3725,paused:!0,onPauseToggle:()=>{},onStop:()=>{}}),i=Tv({elapsed:8,label:`Dictating`});e(i);let a=null,o=P({label:`Show floating pill`,variant:`secondary`,onClick:()=>{a?(a.destroy(),a.el.remove(),a=null,o.setLabel(`Show floating pill`)):(a=Tv({floating:`bottom`,onStop:()=>o.el.click()}),(o.el.closest(`[data-mh-theme]`)??document.body).append(a.el),e(a),o.setLabel(`Hide floating pill`))}});return Dv(Ov(`Pause, resume and stop`),Ev(n.el),t,Ev(r.el),Ov(`No buttons`),Ev(i.el),Ov(`Floating at the bottom of the screen`),Ev(o.el))}}];function Av(e){let t=e.trim().split(/\s+/).filter(Boolean);if(t.length===0)return`?`;let n=t[0],r=t.length>1?t[t.length-1]:``;return(Array.from(n)[0]+(r?Array.from(r)[0]:``)).toUpperCase()}function jv(e){let t=0;for(let n of e)t=t*31+n.codePointAt(0)>>>0;return t%6+1}var Mv={small:`sm`,medium:!1,large:`lg`,xlarge:`xl`};function Nv(e,t=`medium`){let n=Mv[t];return B(`mh-avatar`,n&&`mh-avatar--${n}`,`mh-avatar--tone-${jv(e)}`)}var Pv={online:`online`,offline:`offline`,busy:`busy`,away:`away`};function Fv(e,t){return t?`${e}, ${Pv[t]}`:e}function Iv(e){let t=M(`span`,{class:Nv(e.name,e.size),role:`img`},M(`span`,{class:`mh-avatar__initials`,"aria-hidden":`true`},e.initials??Av(e.name)));if(e.src){let n=M(`img`,{class:`mh-avatar__image`,src:e.src,alt:``});n.addEventListener(`error`,()=>n.hidden=!0),t.append(n)}let n=null,r=r=>{t.setAttribute(`aria-label`,Fv(e.name,r)),r?(n??=t.appendChild(M(`span`,{"aria-hidden":`true`})),n.className=`mh-avatar__status mh-avatar__status--${r}`):(n?.remove(),n=null)};return r(e.status??null),{el:t,setStatus:r}}function Lv(e=`medium`){let t=Mv[e];return B(`mh-avatar`,t&&`mh-avatar--${t}`,`mh-avatar--more`)}function Rv(e){let t=e.max??e.avatars.length,n=e.avatars.slice(0,t),r=e.avatars.length-n.length;return{el:M(`div`,{class:`mh-avatar-group`,role:`group`,"aria-label":e.label},...n.map(t=>Iv({...t,size:e.size}).el),r>0?M(`span`,{class:Lv(e.size),role:`img`,"aria-label":`${r} more`},M(`span`,{class:`mh-avatar__initials`,"aria-hidden":`true`},`+${r}`)):null)}}var zv=`mh-carousel__slide`;function Bv(e,t){return`${e+1} of ${t}`}function Vv(e){return B(`mh-carousel__nav`,e<0?`mh-carousel__nav--previous`:`mh-carousel__nav--next`)}var Hv=e=>getComputedStyle(e).direction===`rtl`;function Uv(e){let t=Math.abs(e.scrollLeft);return{atStart:t<=1,atEnd:t+e.clientWidth>=e.scrollWidth-1}}function Wv(e){let t=e.querySelectorAll(`:scope > .${zv}`),n=t[0];if(!n||t.length<2)return 0;let r=parseFloat(getComputedStyle(e).columnGap)||0,i=n.offsetWidth+r;if(!(i>0))return 0;let{atEnd:a}=Uv(e);return a?t.length-1:Math.max(0,Math.min(t.length-1,Math.round(Math.abs(e.scrollLeft)/i)))}function Gv(e){return B(`mh-carousel__dot`,e&&`is-current`)}function Kv(e,t){let n=e.querySelector(`:scope > .${zv}`);if(!n)return;let r=parseFloat(getComputedStyle(e).columnGap)||0,i=(n.offsetWidth+r)*t*(Hv(e)?-1:1);e.scrollBy({left:i})}function qv(e,t){let n=e.target;if(n&&n!==t&&n.closest(`input, textarea, select, [contenteditable]:not([contenteditable="false"])`)||e.key!==`ArrowLeft`&&e.key!==`ArrowRight`)return null;let r=e.key===`ArrowRight`?1:-1;return Hv(t)?-r:r}function Jv(e){let t=M(`div`,{class:`mh-carousel__track`,tabindex:0}),n=U({icon:In,label:e.previousLabel??`Previous`,size:`small`,filled:!0,disabled:!0}),r=U({icon:hn,label:e.nextLabel??`Next`,size:`small`,filled:!0,disabled:!0});n.el.classList.add(...Vv(-1).split(` `)),r.el.classList.add(...Vv(1).split(` `));let i=M(`div`,{class:`mh-carousel__dots`,"aria-hidden":`true`}),a=M(`div`,{class:`mh-carousel`,role:`region`,"aria-roledescription":`carousel`,"aria-label":e.label},t,n.el,r.el),o=()=>{let{atStart:e,atEnd:o}=Uv(t);n.setDisabled(e),r.setDisabled(o);let s=t.children.length;if(s<2||e&&o){i.remove();return}let c=Wv(t);i.children.length!==s&&i.replaceChildren(...Array.from({length:s},()=>M(`span`,{class:Gv(!1)}))),Array.from(i.children).forEach((e,t)=>e.className=Gv(t===c)),i.parentNode!==a&&a.append(i)},s=e=>Kv(t,e);n.el.addEventListener(`click`,()=>s(-1)),r.el.addEventListener(`click`,()=>s(1)),t.addEventListener(`scroll`,o,{passive:!0}),t.addEventListener(`keydown`,e=>{let n=qv(e,t);n!==null&&(e.preventDefault(),s(n))});let c=typeof ResizeObserver==`function`?new ResizeObserver(o):null;c?.observe(t);let l=e=>{t.replaceChildren(...e.map((t,n)=>M(`div`,{class:zv,role:`group`,"aria-roledescription":`slide`,"aria-label":Bv(n,e.length)},t))),o()};return l(e.items??[]),{el:a,track:t,setItems:l,step:s,destroy(){c?.disconnect()}}}function Yv(e=!1){return B(`mh-property-list`,e&&`mh-property-list--dense`)}function Xv(e){let t=M(`dl`,{class:Yv(e.dense)}),n=e=>{t.replaceChildren(...e.map(e=>M(`div`,{class:`mh-property-list__row`},M(`dt`,{class:`mh-property-list__label`},e.label),M(`dd`,{class:`mh-property-list__value`},e.value))))};return n(e.items),{el:t,setItems:n}}function Zv(e=!1){return B(`mh-media-list__row`,e&&`mh-media-list__row--interactive`)}function Qv(e){return[e.subtitle,e.meta].filter(e=>!!e).join(` · `)}function $v(e,t){return[t?`${t}: ${e.title}`:e.title,e.subtitle,e.meta].filter(e=>!!e).join(`, `)}var ey={loading:`lazy`,decoding:`async`,referrerpolicy:`no-referrer`,alt:``};function ty(e,t,n){let r=M(`span`,{class:`mh-media-list__thumb`,"aria-hidden":`true`},H(e.placeholder??n.placeholder??`M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z`,{class:`mh-media-list__placeholder`}));if(e.image){let t=M(`img`,{class:`mh-media-list__image`,src:e.image,...ey});t.addEventListener(`error`,()=>t.hidden=!0),r.append(t)}let i=Qv(e),a=M(`span`,{class:`mh-media-list__text`},M(`span`,{class:`mh-media-list__title`},e.title),i?M(`span`,{class:`mh-media-list__subtitle`},i):null),o=n.action?M(`span`,{class:`mh-media-list__action`,"aria-hidden":`true`},H(n.action)):null,{onSelect:s}=n,c=Zv(!!s),l=s?M(`button`,{type:`button`,class:c,"aria-label":$v(e,n.actionLabel)},r,a,o):M(`div`,{class:c},r,a,o);return s&&l.addEventListener(`click`,()=>s(t)),M(`li`,{class:`mh-media-list__item`},l)}function ny(e){let t=M(`ul`,{class:`mh-media-list`,"aria-label":e.label}),n=n=>t.replaceChildren(...n.map((t,n)=>ty(t,n,e)));return n(e.items),{el:t,setItems:n}}function ry(e=`list`){return B(`mh-timeline`,`mh-timeline--${e}`)}function iy(e=`neutral`,t=!1){return B(`mh-timeline__item`,e!==`neutral`&&`mh-timeline__item--${e}`,t&&`mh-timeline__item--icon`)}function ay(e=!1){return B(`mh-timeline__row`,e&&`mh-timeline__row--interactive`)}function oy(e,t,n,r){let i=n===`feed`,a=i&&!!e.icon,o=i?M(`span`,{class:`mh-timeline__marker`,"aria-hidden":`true`},e.icon?H(e.icon):null):null,s=M(`span`,{class:`mh-timeline__body`},M(`span`,{class:`mh-timeline__title`},e.title),e.detail?M(`span`,{class:`mh-timeline__detail`},e.detail):null),c=M(`span`,{class:`mh-timeline__time`},e.time),l=ay(!!r),u=r?M(`button`,{type:`button`,class:l},o,c,s):M(`div`,{class:l},o,c,s);return r&&u.addEventListener(`click`,()=>r(t)),M(`li`,{class:iy(e.tone,a)},u)}function sy(e){let t=e.variant??`list`,n=M(`ol`,{class:ry(t),"aria-label":e.label}),r=r=>n.replaceChildren(...r.map((n,r)=>oy(n,r,t,e.onSelect)));return r(e.items),{el:n,setItems:r}}function cy(e=`plain`){return B(`mh-accordion`,`mh-accordion--${e}`)}function ly(e,t,n=`multiple`,r=!1,i){let a=e.includes(t),o=i??!a;return n===`single`?o||r&&a?[t]:e.filter(e=>e!==t):o?a?[...e]:[...e,t]:e.filter(e=>e!==t)}function uy(e,t=[],n=`multiple`,r=!1){let i=t.filter(t=>e.some(e=>e.id===t));if(n===`multiple`)return i;if(i.length>0)return[i[0]];let a=e.find(e=>!e.disabled);return r&&a?[a.id]:[]}function dy(e,t,n){let r=e.map((e,t)=>e.disabled?-1:t).filter(e=>e>=0),i=r.indexOf(t);if(i<0)return null;switch(n){case`ArrowDown`:return r[(i+1)%r.length];case`ArrowUp`:return r[(i-1+r.length)%r.length];case`Home`:return r[0];case`End`:return r[r.length-1];default:return null}}function fy(e){let t=e.mode??`multiple`,n=e.required??!1,r=I(`mh-accordion`),i=M(`div`,{class:cy(e.variant)}),a=uy(e.sections,e.open,t,n),o=[],s=[],c=[];e.sections.forEach((l,d)=>{let f=`${r}-trigger-${d}`,p=`${r}-panel-${d}`,m=M(`button`,{type:`button`,class:`mh-accordion__trigger`,id:f,"aria-controls":p,disabled:l.disabled??!1},l.icon?M(`span`,{class:`mh-accordion__icon`},H(l.icon)):null,M(`span`,{class:`mh-accordion__text`},M(`span`,{class:`mh-accordion__title`},l.title),l.subtitle?M(`span`,{class:`mh-accordion__subtitle`},l.subtitle):null),l.meta?M(`span`,{class:`mh-accordion__meta`},l.meta):null,H(Yn,{class:`mh-accordion__chevron`}));m.addEventListener(`click`,()=>u(ly(a,l.id,t,n),!0));let h=M(`div`,{class:`mh-accordion__panel`,id:p,role:`region`,"aria-labelledby":f}),g=M(`div`,{class:`mh-accordion__content`});it(g,...Array.isArray(l.content)?l.content:[l.content]),h.append(g);let _=M(`div`,{class:`mh-accordion__item`},M(`h${e.headingLevel??3}`,{class:`mh-accordion__heading`},m),h);o.push(m),c.push(h),s.push(_),i.append(_)}),i.addEventListener(`keydown`,t=>{let n=o.indexOf(t.target);if(n<0)return;let r=dy(e.sections,n,t.key);r!==null&&(t.preventDefault(),o[r].focus())});function l(){e.sections.forEach((e,r)=>{let i=a.includes(e.id);o[r].setAttribute(`aria-expanded`,String(i)),t===`single`&&n&&i?o[r].setAttribute(`aria-disabled`,`true`):o[r].removeAttribute(`aria-disabled`),c[r].hidden=!i,s[r].classList.toggle(`is-open`,i)})}function u(t,n){let r=t.length===a.length&&t.every(e=>a.includes(e));a=t,l(),n&&!r&&e.onChange?.([...a])}return l(),{el:i,open:()=>[...a],setOpen:r=>u(uy(e.sections,r,t,n),!1),toggle:(e,r)=>u(ly(a,e,t,n,r),!1)}}function py(e){return B(`mh-data-table`,e.dense&&`mh-data-table--dense`,e.striped&&`mh-data-table--striped`,(e.stickyHeader??!0)&&`mh-data-table--sticky-header`,e.stickyColumn&&`mh-data-table--sticky-column`,e.selectable&&`mh-data-table--selectable`)}function my(e=`start`,t=!1){return B(t?`mh-data-table__th`:`mh-data-table__td`,e!==`start`&&`mh-data-table__cell--${e}`)}function hy(e,t){if(e.value)return e.value(t);let n=t[e.id];return typeof n==`string`||typeof n==`number`||n==null?n:String(n)}var gy=new Intl.Collator(void 0,{numeric:!0,sensitivity:`base`});function _y(e,t,n){let r=n?t.find(e=>e.id===n.column):void 0;if(!n||!r)return[...e];let i=n.direction===`ascending`?1:-1;return e.map((e,t)=>({row:e,i:t,v:hy(r,e)})).sort((e,t)=>{let n=e.v===null||e.v===void 0||e.v===``,r=t.v===null||t.v===void 0||t.v===``;if(n||r)return n===r?e.i-t.i:n?1:-1;let a=typeof e.v==`number`&&typeof t.v==`number`?e.v-t.v:gy.compare(String(e.v),String(t.v));return a===0?e.i-t.i:a*i}).map(e=>e.row)}function vy(e,t){return e?.column===t?{column:t,direction:e.direction===`ascending`?`descending`:`ascending`}:{column:t,direction:`ascending`}}function yy(e,t){let n=e.filter(e=>t.includes(e)).length;return n===0?`none`:n===e.length?`all`:`some`}function by(e,t){return yy(e,t)===`all`?t.filter(t=>!e.includes(t)):[...new Set([...t,...e])]}function xy(e,t,n,r=48){let i=n?64:16;return t===`ArrowLeft`?Math.max(r,e-i):t===`ArrowRight`?e+i:null}function Sy(e,t,n){return`Select ${n?n(e):t[0]?String(hy(t[0],e)??``):``}`.trim()}var Cy=e=>e===`descending`?fn:Rr;function wy(e){let t=I(`mh-data-table`),n=[...e.rows],r=e.sort??null,i=[...e.selected??[]],a={};for(let t of e.columns)t.width&&(a[t.id]=t.width);let o=M(`caption`,{class:B(`mh-data-table__caption`,!e.showCaption&&`mh-visually-hidden`),id:t},e.label),s=M(`colgroup`),c=M(`tr`,{class:`mh-data-table__head-row`}),l=M(`tbody`,{class:`mh-data-table__body`}),u=M(`table`,{class:`mh-data-table__table`},o,s,M(`thead`,{class:`mh-data-table__head`},c),l),d=M(`div`,{class:py(e),role:`region`,"aria-labelledby":t,tabindex:0},u);e.maxHeight&&(d.style.maxHeight=e.maxHeight);let f=[],p=null;e.selectable&&(s.append(M(`col`,{class:`mh-data-table__col mh-data-table__col--select`})),p=Fe({ariaLabel:`Select all rows`,onChange:()=>E(by(n.map(e.rowId),i),!0)}),c.append(M(`th`,{class:`mh-data-table__th mh-data-table__select`,scope:`col`},p.el)));let m=[],h=[],g=[];e.columns.forEach((t,n)=>{let i=M(`col`,{class:`mh-data-table__col`});f.push(i),s.append(i);let a=M(`th`,{class:my(t.align,!0),scope:`col`});if(t.sortable){let i=H(Rr,{class:`mh-data-table__sort-icon`});h[n]=i;let o=M(`button`,{type:`button`,class:`mh-data-table__sort`},M(`span`,{class:`mh-data-table__label`},t.label),i);o.addEventListener(`click`,()=>{r=vy(r,t.id),w(),x(),e.onSortChange?.({...r})}),a.append(o)}else a.append(M(`span`,{class:`mh-data-table__label`},t.label));let o=t.resizable??e.resizable??!1;if(g[n]=null,o){let e=M(`span`,{class:`mh-data-table__resize`,role:`separator`,"aria-orientation":`vertical`,"aria-label":`Resize ${t.label}`,"aria-valuemin":t.minWidth??48,tabindex:0});g[n]=e,e.addEventListener(`keydown`,e=>{let r=xy(v(n),e.key,e.shiftKey,t.minWidth);r!==null&&(e.preventDefault(),y(n,r))}),e.addEventListener(`pointerdown`,r=>{r.preventDefault();let i=r.clientX,a=v(n);e.setPointerCapture?.(r.pointerId),e.classList.add(`is-active`);let o=e=>y(n,Math.max(t.minWidth??48,a+(e.clientX-i))),s=()=>{e.classList.remove(`is-active`),e.removeEventListener(`pointermove`,o),e.removeEventListener(`pointerup`,s),e.removeEventListener(`pointercancel`,s)};e.addEventListener(`pointermove`,o),e.addEventListener(`pointerup`,s),e.addEventListener(`pointercancel`,s)}),e.addEventListener(`click`,e=>e.stopPropagation()),a.append(e)}m.push(a),c.append(a)});function _(){u.classList.contains(`is-sized`)||(e.columns.forEach((e,t)=>{a[e.id]===void 0&&(a[e.id]=Math.round(m[t].getBoundingClientRect().width)||e.minWidth||120)}),u.classList.add(`is-sized`),b())}function v(t){return _(),a[e.columns[t].id]}function y(t,n){let r=e.columns[t];a[r.id]=Math.round(n),b(),e.onColumnResize?.(r.id,a[r.id])}function b(){e.columns.forEach((e,t)=>{let n=a[e.id];f[t].style.width=n===void 0?``:`${n}px`,g[t]?.setAttribute(`aria-valuenow`,String(n??``)),n===void 0&&g[t]?.removeAttribute(`aria-valuenow`)}),Object.keys(a).length>0&&e.columns.every(e=>a[e.id]!==void 0)&&u.classList.add(`is-sized`)}function x(){e.columns.forEach((e,t)=>{let n=m[t],i=r?.column===e.id;e.sortable&&n.setAttribute(`aria-sort`,i?r.direction:`none`),n.classList.toggle(`is-sorted`,i);let a=h[t];a&&a.querySelector(`path`).setAttribute(`d`,dr(Cy(i?r.direction:void 0)))})}function S(){if(!p)return;let t=yy(n.map(e.rowId),i);p.setChecked(t===`all`),p.setIndeterminate(t===`some`),p.setDisabled(n.length===0)}let C=new Map;function w(){C.clear();let t=_y(n,e.columns,r);t.length===0?(l.replaceChildren(M(`tr`,{class:`mh-data-table__row`},M(`td`,{class:`mh-data-table__empty`,colspan:e.columns.length+ +!!e.selectable},e.empty??`Nothing to show`))),S()):(l.replaceChildren(...t.map(t=>{let n=e.rowId(t),r=i.includes(n),a=M(`tr`,{class:B(`mh-data-table__row`,r&&`is-selected`),"data-id":n});if(e.selectable){let o=Fe({ariaLabel:Sy(t,e.columns,e.rowLabel),checked:r,onChange:e=>E(e?[...i,n]:i.filter(e=>e!==n),!0)});a.append(M(`td`,{class:`mh-data-table__td mh-data-table__select`},o.el)),C.set(n,{tr:a,box:o})}for(let n of e.columns){let e=M(`td`,{class:my(n.align)});if(n.render){let r=n.render(t);it(e,...Array.isArray(r)?r:[r])}else{let r=hy(n,t);e.append(r==null?``:String(r))}a.append(e)}return a})),S())}function T(){for(let[e,{tr:t,box:n}]of C){let r=i.includes(e);t.classList.toggle(`is-selected`,r),n?.setChecked(r)}S()}function E(t,n){i=[...new Set(t)],T(),n&&e.onSelectionChange?.([...i])}return b(),x(),w(),{el:d,setRows(e){n=[...e],w()},sort:()=>r?{...r}:null,setSort(e){r=e,x(),w()},selected:()=>[...i],setSelected:e=>E([...e],!1),columnWidths:()=>({...a})}}var Ty=[`L`,`M`,`Q`,`H`],Ey={L:1,M:0,Q:3,H:2},Dy={L:[7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],M:[10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],Q:[13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],H:[17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]},Oy={L:[1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],M:[1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],Q:[1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],H:[1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]},ky=e=>17+4*e;function Ay(e){if(e===1)return[];let t=Math.floor(e/7)+2,n=ky(e)-7,r=e===32?26:Math.ceil((n-6)/(t-1)/2)*2,i=[6];for(let e=t-2;e>=0;e--)i.push(n-e*r);return i}function jy(e){let t=ky(e),n=t*t;n-=192,n-=2*(t-16);let r=Ay(e).length;return r>0&&(n-=(r*r-3)*25,n+=(r-2)*2*5),n-=31,e>=7&&(n-=36),n}var My=e=>Math.floor(jy(e)/8);function Ny(e,t){let n=Oy[t][e-1],r=Dy[t][e-1],i=My(e)-n*r,a=Math.floor(i/n),o=i%n;return{ecPerBlock:r,dataPerBlock:Array.from({length:n},(e,t)=>t>=n-o?a+1:a),dataCodewords:i}}var Py=new Uint8Array(512),Fy=new Uint8Array(256);{let e=1;for(let t=0;t<255;t++)Py[t]=e,Fy[e]=t,e<<=1,e&256&&(e^=285);for(let e=255;e<512;e++)Py[e]=Py[e-255]}function Iy(e,t){return e===0||t===0?0:Py[Fy[e]+Fy[t]]}function Ly(e){let t=[1];for(let n=0;n<e;n++){let e=Array(t.length+1).fill(0);for(let r=0;r<t.length;r++)e[r]=e[r]^t[r],e[r+1]=e[r+1]^Iy(t[r],Py[n]);t=e}return Uint8Array.from(t.slice(1))}function Ry(e,t){let n=Ly(t),r=new Uint8Array(t);for(let i=0;i<e.length;i++){let a=e[i]^r[0];r.copyWithin(0,1),r[t-1]=0;for(let e=0;e<t;e++)r[e]=r[e]^Iy(n[e],a)}return r}function zy(e,t,n){let r=e<<n,i=31-Math.clz32(t);for(let e=31-Math.clz32(r);e>=i;e--)r&1<<e&&(r^=t<<e-i);return r}function By(e,t){let n=Ey[e]<<3|t;return(n<<10|zy(n,1335,10))^21522}function Vy(e){return e<<12|zy(e,7973,12)}var Hy=(e,t)=>4+(t<=9?8:16)+8*e;function Uy(e,t,n){let r=Ny(t,n).dataCodewords,i=[],a=(e,t)=>{for(let n=t-1;n>=0;n--)i.push(e>>>n&1)};a(4,4),a(e.length,t<=9?8:16);for(let t of e)a(t,8);for(a(0,Math.min(4,r*8-i.length));i.length%8;)i.push(0);let o=new Uint8Array(r);for(let e=0;e<i.length/8;e++){let t=0;for(let n=0;n<8;n++)t=t<<1|i[e*8+n];o[e]=t}for(let e=i.length/8,t=0;e<r;e++,t++)o[e]=t%2==0?236:17;return o}function Wy(e,t,n){let r=Ny(t,n),i=[],a=[],o=0;for(let t of r.dataPerBlock){let n=e.subarray(o,o+t);o+=t,i.push(n),a.push(Ry(n,r.ecPerBlock))}let s=[],c=Math.max(...r.dataPerBlock);for(let e=0;e<c;e++)for(let t of i)e<t.length&&s.push(t[e]);for(let e=0;e<r.ecPerBlock;e++)for(let t of a)s.push(t[e]);return Uint8Array.from(s)}function Gy(e,t,n){switch(e){case 0:return(t+n)%2==0;case 1:return t%2==0;case 2:return n%3==0;case 3:return(t+n)%3==0;case 4:return(Math.floor(t/2)+Math.floor(n/3))%2==0;case 5:return t*n%2+t*n%3==0;case 6:return(t*n%2+t*n%3)%2==0;default:return((t+n)%2+t*n%3)%2==0}}function Ky(e){let t=ky(e),n=Array.from({length:t},()=>new Int8Array(t).fill(-1)),r=Array.from({length:t},()=>Array(t).fill(!1)),i=(e,i,a)=>{e<0||i<0||e>=t||i>=t||(n[e][i]=+!!a,r[e][i]=!0)};for(let[e,n]of[[0,0],[0,t-7],[t-7,0]])for(let t=-1;t<=7;t++)for(let r=-1;r<=7;r++){let a=Math.max(Math.abs(t-3),Math.abs(r-3));i(e+t,n+r,a!==2&&a<=3)}for(let e=8;e<t-8;e++)i(6,e,e%2==0),i(e,6,e%2==0);let a=Ay(e);for(let e of a)for(let n of a)if(!(e===6&&n===6||e===6&&n===t-7||e===t-7&&n===6))for(let t=-2;t<=2;t++)for(let r=-2;r<=2;r++)i(e+t,n+r,Math.max(Math.abs(t),Math.abs(r))!==1);for(let e=0;e<9;e++)r[8][e]=!0,r[e][8]=!0;for(let e=0;e<8;e++)r[8][t-1-e]=!0,r[t-1-e][8]=!0;if(i(t-8,8,!0),e>=7)for(let e=0;e<18;e++)r[Math.floor(e/3)][t-11+e%3]=!0,r[t-11+e%3][Math.floor(e/3)]=!0;return{grid:n,reserved:r}}function qy(e,t){let n=ky(e),r=[],i=!0;for(let e=n-1;e>=1;e-=2){e===6&&(e=5);for(let a=0;a<n;a++){let o=i?n-1-a:a;for(let n of[e,e-1])t[o][n]||r.push([o,n])}i=!i}return r}function Jy(e,t,n){let r=e.length,i=By(t,n);for(let t=0;t<15;t++){let n=+((i>>>t&1)==1);t<6?e[t][8]=n:t===6?e[7][8]=n:t===7?e[8][8]=n:t===8?e[8][7]=n:e[8][14-t]=n,t<8?e[8][r-1-t]=n:e[r-15+t][8]=n}}function Yy(e,t){if(t<7)return;let n=e.length,r=Vy(t);for(let t=0;t<18;t++){let i=+((r>>>t&1)==1);e[Math.floor(t/3)][n-11+t%3]=i,e[n-11+t%3][Math.floor(t/3)]=i}}function Xy(e){let t=e.length,n=0,r=(t,n,r)=>r?e[n][t]:e[t][n];for(let e of[!1,!0])for(let i=0;i<t;i++){let a=1;for(let o=1;o<=t;o++)o<t&&r(i,o,e)===r(i,o-1,e)?a++:(a>=5&&(n+=3+(a-5)),a=1);let o=[!0,!1,!0,!0,!0,!1,!0];for(let a=0;a+7<=t;a++){let s=!0;for(let t=0;t<7&&s;t++){let n=a+t;s=r(i,n,e)===o[t]}if(!s)continue;let c=n=>{for(let a=0;a<4;a++){let o=n+a;if(o>=0&&o<t&&r(i,o,e))return!1}return!0};c(a-4)&&(n+=40),c(a+7)&&(n+=40)}}for(let r=0;r<t-1;r++)for(let i=0;i<t-1;i++){let t=e[r][i];e[r][i+1]===t&&e[r+1][i]===t&&e[r+1][i+1]===t&&(n+=3)}let i=0;for(let t of e)for(let e of t)e&&i++;let a=i*100/(t*t);return n+=10*Math.floor(Math.abs(a-50)/5),n}function Zy(e,t,n,r){let{grid:i,reserved:a}=Ky(t);return qy(t,a).forEach(([t,n],a)=>{let o=a>>3,s=o<e.length?e[o]>>>7-(a&7)&1:0;i[t][n]=s===1===Gy(r,t,n)?0:1}),Jy(i,n,r),Yy(i,t),i.map(e=>Array.from(e,e=>e===1))}function Qy(e,t={}){let n=typeof e==`string`?new TextEncoder().encode(e):e,r=t.ecc??`M`,i=Math.max(1,Math.min(40,Math.floor(t.minVersion??1)));for(;i<=40&&Hy(n.length,i)>Ny(i,r).dataCodewords*8;)i++;if(i>40)throw RangeError(`QR code: ${n.length} bytes don't fit at level ${r}`);if(t.boostEcc??!0)for(let e of Ty.slice(Ty.indexOf(r)+1))Hy(n.length,i)<=Ny(i,e).dataCodewords*8&&(r=e);let a=Wy(Uy(n,i,r),i,r),o=null,s=t.mask===void 0?[0,1,2,3,4,5,6,7]:[t.mask&7];for(let e of s){let t=Zy(a,i,r,e),n=s.length===1?0:Xy(t);(!o||n<o.score)&&(o={mask:e,modules:t,score:n})}return{version:i,ecc:r,mask:o.mask,size:ky(i),modules:o.modules}}var $y=`http://www.w3.org/2000/svg`;function eb(e=`medium`){return B(`mh-qr-code`,e!==`medium`&&`mh-qr-code--${e===`small`?`sm`:`lg`}`)}function tb(e,t=4){let n=[];return e.modules.forEach((e,r)=>{let i=0;for(;i<e.length;){if(!e[i]){i++;continue}let a=i;for(;i<e.length&&e[i];)i++;n.push(`M${a+t} ${r+t}h${i-a}v1h${a-i}z`)}}),n.join(``)}var nb=(e,t=4)=>e.size+2*t;function rb(e,t=`M`){try{return Qy(e,{ecc:t})}catch{return Qy(``,{ecc:t})}}function ib(e,t,n){let r=nb(t,n);e.setAttribute(`viewBox`,`0 0 ${r} ${r}`);let i=document.createElementNS($y,`rect`);i.setAttribute(`class`,`mh-qr-code__plate`),i.setAttribute(`width`,String(r)),i.setAttribute(`height`,String(r));let a=document.createElementNS($y,`path`);a.setAttribute(`class`,`mh-qr-code__modules`),a.setAttribute(`d`,tb(t,n)),e.replaceChildren(i,a)}function ab(e){let t=Math.max(0,Math.floor(e.quietZone??4)),n=document.createElementNS($y,`svg`);n.setAttribute(`class`,`mh-qr-code__svg`),n.setAttribute(`role`,`img`),n.setAttribute(`aria-label`,e.label??`QR code`),n.setAttribute(`shape-rendering`,`crispEdges`);let r=M(`figure`,{class:eb(e.size)},n,e.caption?M(`figcaption`,{class:`mh-qr-code__caption`},e.caption):null),i=rb(e.value,e.ecc);return ib(n,i,t),{el:r,setValue(r){i=rb(r,e.ecc),ib(n,i,t)},matrix:()=>i}}var ob=e=>(e.children?.length??0)>0;function sb(e=!1,t=!1){return B(`mh-tree`,e&&`mh-tree--checkable`,t&&`mh-tree--dense`)}function cb(e,t,n=1,r=null){let i=[];return e.forEach((a,o)=>{i.push({node:a,level:n,parent:r,posinset:o+1,setsize:e.length}),ob(a)&&t.includes(a.id)&&i.push(...cb(a.children,t,n+1,a.id))}),i}function lb(e,t){for(let n of e){if(n.id===t)return n;let e=n.children?lb(n.children,t):null;if(e)return e}return null}function ub(e){return e.disabled?[]:ob(e)?e.children.flatMap(ub):[e.id]}function db(e,t){let n=new Set;for(let r of t){let t=lb(e,r);if(t)for(let e of ub(t))n.add(e)}return[...n]}function fb(e,t){let n=ub(e);if(n.length===0)return t.includes(e.id)?`true`:`false`;let r=n.filter(e=>t.includes(e)).length;return r===0?`false`:r===n.length?`true`:`mixed`}function pb(e,t,n){let r=lb(e,t);if(!r||r.disabled)return[...n];let i=ub(r);return fb(r,n)===`true`?n.filter(e=>!i.includes(e)):[...new Set([...n,...i])]}function mb(e,t,n,r){let i=e.findIndex(e=>e.node.id===t);if(i<0)return null;let a=e[i],o=ob(a.node),s=r.includes(t);switch(n){case`ArrowDown`:return i<e.length-1?{focus:e[i+1].node.id}:{};case`ArrowUp`:return i>0?{focus:e[i-1].node.id}:{};case`Home`:return{focus:e[0].node.id};case`End`:return{focus:e[e.length-1].node.id};case`ArrowRight`:return o?s?{focus:a.node.children[0].id}:{expanded:[...r,t]}:{};case`ArrowLeft`:return o&&s?{expanded:r.filter(e=>e!==t)}:a.parent?{focus:a.parent}:{};case`*`:{let t=e.filter(e=>e.parent===a.parent&&ob(e.node)).map(e=>e.node.id);return{expanded:[...new Set([...r,...t])]}}case`Enter`:case` `:return{activate:!0};default:{if(n.length!==1||!/\S/.test(n))return null;let t=n.toLocaleLowerCase();for(let n=1;n<=e.length;n++){let r=e[(i+n)%e.length];if(r.node.label.toLocaleLowerCase().startsWith(t))return{focus:r.node.id}}return{}}}}function hb(e,t,n){return t&&e.some(e=>e.node.id===t)?t:n&&e.some(e=>e.node.id===n)?n:e[0]?.node.id??null}function gb(e){let t=e.checkable??!1,n=M(`ul`,{class:sb(t,e.dense),role:`tree`,"aria-label":e.label}),r=[...e.expanded??[]],i=e.selected??null,a=db(e.nodes,e.checked??[]),o=null,s=(e,n,c)=>{let{node:l}=e,u=ob(l),f=u&&r.includes(l.id),p=t?fb(l,a):null,m=M(`li`,{class:B(`mh-tree__item`,!t&&i===l.id&&`is-selected`),role:`treeitem`,"data-id":l.id,"aria-level":e.level,"aria-setsize":e.setsize,"aria-posinset":e.posinset,"aria-expanded":u?String(f):null,"aria-selected":t?null:String(i===l.id),"aria-checked":p,"aria-disabled":l.disabled?`true`:null,tabindex:c===l.id?0:-1}),h=M(`span`,{class:B(`mh-tree__toggle`,!u&&`mh-tree__toggle--leaf`),"aria-hidden":`true`},u?H(hn):null);u&&h.addEventListener(`click`,e=>{e.stopPropagation(),o=l.id,d(f?r.filter(e=>e!==l.id):[...r,l.id],!0,!0)});let g=M(`div`,{class:`mh-tree__row`,style:`--_level: ${e.level-1}`},h,t?M(`span`,{class:`mh-tree__check`,"aria-hidden":`true`},H(Wt,{class:`mh-tree__check-mark`}),H(ce,{class:`mh-tree__check-dash`})):null,l.icon?M(`span`,{class:`mh-tree__icon`},H(l.icon)):null,M(`span`,{class:`mh-tree__label`},l.label),l.meta?M(`span`,{class:`mh-tree__meta`},l.meta):null);if(m.append(g),f){let e=M(`ul`,{class:`mh-tree__group`,role:`group`});for(let t of n.filter(e=>e.parent===l.id))e.append(s(t,n,c));m.append(e)}return m};function c(){let t=n.contains(document.activeElement),a=cb(e.nodes,r);o=hb(a,o,i),n.replaceChildren(...a.filter(e=>e.level===1).map(e=>s(e,a,o))),t&&o&&u(o)}let l=e=>Array.from(n.querySelectorAll(`[role="treeitem"]`)).find(t=>t.dataset.id===e)??null;function u(e){o=e;for(let t of n.querySelectorAll(`[role="treeitem"]`))t.tabIndex=t.dataset.id===e?0:-1;l(e)?.focus()}function d(t,n,i=!1){r=t,i&&o?(c(),u(o)):c(),n&&e.onExpandedChange?.([...r])}function f(n){let r=lb(e.nodes,n);if(r&&!r.disabled){if(o=n,t)a=pb(e.nodes,n,a),c(),u(n),e.onCheckedChange?.([...a]);else{let t=i!==n;i=n,c(),u(n),t&&e.onSelect?.(n)}}}return n.addEventListener(`click`,e=>{let t=e.target.closest(`[role="treeitem"]`);t?.dataset.id&&f(t.dataset.id)}),n.addEventListener(`keydown`,t=>{let n=t.target.closest(`[role="treeitem"]`);if(!n?.dataset.id||t.target!==n||t.altKey||t.ctrlKey||t.metaKey)return;let i=mb(cb(e.nodes,r),n.dataset.id,t.key,r);i&&(t.preventDefault(),o=n.dataset.id,i.expanded&&d(i.expanded,!0,!0),i.focus&&u(i.focus),i.activate&&f(n.dataset.id))}),n.addEventListener(`focusin`,e=>{let t=e.target.closest(`[role="treeitem"]`);t?.dataset.id&&t.dataset.id!==o&&u(t.dataset.id)}),c(),{el:n,expanded:()=>[...r],setExpanded:e=>d([...e],!1),selected:()=>i,setSelected(e){i=e,c()},checked:()=>[...a],setChecked(t){a=db(e.nodes,t),c()}}}var _b=(...e)=>M(`div`,{class:`ex-row`},...e),vb=(...e)=>M(`div`,{class:`ex-stack`},...e),yb=e=>C(e,{variant:`label`,tone:`muted`}),bb=e=>M(`p`,{class:`${v(`body`,`muted`)} mh-clamp-2`},e),xb=(...e)=>M(`div`,{class:`mh-grid`},...e),Sb=[{id:`card`,render:()=>xb(V({title:`Living room`,subtitle:`3 lights on`,icon:`home`,headerAction:U({icon:`more`,label:`More options`,size:`small`}).el,body:C(`21.5° and 46% humidity. The blinds close at 20:00.`,{tone:`muted`}),footer:[P({label:`All off`,variant:`text`,size:`small`}).el,P({label:`Open`,size:`small`}).el]}).el,V({title:`Flat card`,variant:`flat`,body:C(`No shadow; the outline and surface only.`,{tone:`muted`})}).el,V({title:`Inset card`,variant:`inset`,body:C(`Sits in a well, a step below the surface.`,{tone:`muted`})}).el,V({title:`Kitchen`,subtitle:`Pressable: the whole card opens the room`,icon:`lightbulb`,headerAction:hi({label:`2 on`,tone:`accent`}).el,onClick:()=>void 0}).el)},{id:`list`,render:()=>vb(yb(`Rich rows`),_i({label:`Devices`,items:[{title:`Kitchen light`,subtitle:`On, 80%`,icon:`lightbulb-on`,trailing:hi({label:`On`,tone:`accent`}).el,onClick:()=>void 0},{title:`Hallway sensor`,subtitle:`Battery 82%`,icon:`thermometer`,trailing:`19.5°`,onClick:()=>void 0},{title:`Guest`,subtitle:`Away since 09:10`,leading:Iv({name:`Guest`,size:`small`,status:`away`}).el,chevron:!0,onClick:()=>void 0},{title:`Bedroom fan`,subtitle:`Unavailable`,icon:`fan`,disabled:!0,onClick:()=>void 0}]}).el,pi({title:`Settings`,footnote:`Changes apply to every screen in the home.`,content:_i({inset:!0,items:[{title:`Wi-Fi`,icon:`wifi`,trailing:`Connected`,chevron:!0,onClick:()=>void 0},{title:`Notifications`,icon:`bell`,trailing:hi({count:2}).el,chevron:!0,onClick:()=>void 0},{title:`Appearance`,icon:`eye`,trailing:`Auto`,chevron:!0,onClick:()=>void 0},{title:`Remove this screen`,icon:`delete`,tone:`danger`,onClick:()=>void 0}]}).el}).el)},{id:`avatar`,render:()=>vb(_b(...[`small`,`medium`,`large`,`xlarge`].map(e=>Iv({name:`Living room`,size:e}).el)),_b(Iv({name:`Guest`,status:`online`}).el,Iv({name:`Home owner`,status:`busy`}).el,Iv({name:`Visitor`,status:`away`}).el,Iv({name:`Kitchen display`,status:`offline`}).el,Iv({name:`Broken image`,src:`data:image/png;base64,AAAA`}).el),yb(`Group`),Rv({label:`People at home`,max:4,avatars:[{name:`Guest`},{name:`Home owner`},{name:`Visitor`},{name:`Child room`},{name:`Night shift`},{name:`Cleaner`}]}).el)},{id:`tiles`,render:()=>vb(yb(`Toggle tiles`),i([wn({icon:`lightbulb`,iconOn:`lightbulb-on`,label:`Kitchen light`,state:`On`,on:!0}).el,wn({icon:`lightbulb`,iconOn:`lightbulb-on`,label:`Living room`,state:`Off`,on:!1}).el,wn({icon:`fan`,label:`Bedroom fan`,state:`Speed 2`,on:!0}).el,wn({icon:`lock`,label:`Front door`,state:`Locked`,on:!1}).el,wn({icon:`music`,label:`Speaker`,state:`Unavailable`,disabled:!0,on:!1}).el,wn({icon:`camera`,label:`Garden camera`,state:`Open feed`}).el],{label:`Living room devices`}).el,yb(`Stat tiles`),i([je({label:`Temperature`,icon:`thermometer`,value:`21.5`,unit:`°C`,trend:`up`,caption:`Since 07:00`}).el,je({label:`Battery`,value:82,unit:`%`,trend:`down`}).el,je({label:`Energy today`,value:`4.2`,unit:`kWh`,trend:`flat`}).el]).el)},{id:`carousel`,render:()=>{let e=(e,t)=>M(`div`,{"aria-hidden":`true`,style:`width: 100%; height: 100%; background: linear-gradient(135deg, var(--mh-series-${e}), var(--mh-series-${t}))`}),t=(e,t,n,r,i)=>V({href:`#`,media:i,eyebrow:`${e} · ${t}`,title:n,titleLines:3,variant:`flat`,body:r?bb(r):void 0}).el;return vb(yb(`Answer cards: swipe, or focus the row and use Arrow Left / Right`),Jv({label:`News results`,items:[t(`Riverside Courier`,`2 h ago`,`Town council approves a new cycle path along the old canal towpath`,`Work starts in spring and the path should open before the summer holidays.`,e(1,2)),t(`Morning Ledger`,`5 h ago`,`Local bakery wins regional prize for its sourdough loaf`,`Judges praised the crust and the long, slow fermentation.`,e(3,4)),t(`Valley Weekly`,`Yesterday`,`Library extends weekend opening hours after a successful trial`,void 0,e(5,6)),t(`Harbour Post`,`2 days ago`,`Volunteers plant four hundred trees in the north park in a single weekend`,`The new trees replace those lost in last winter’s storms.`)]}).el)}},{id:`property-list`,render:()=>xb(V({title:`Printer`,body:Xv({items:[{label:`Status`,value:hi({label:`Printing`,tone:`accent`}).el},{label:`Progress`,value:`42 %`},{label:`Time left`,value:`1 h 18 min`},{label:`Nozzle`,value:`215 °C`},{label:`Bed`,value:`60 °C`},{label:`File`,value:`replacement_hinge_for_the_garden_shed_door_v3_final.gcode`}]}).el}).el,V({title:`Dense`,body:Xv({dense:!0,items:[{label:`Battery`,value:`82 %`},{label:`Signal`,value:`-61 dBm`},{label:`Firmware`,value:`1.4.2`},{label:`Last seen`,value:`12:04`}]}).el}).el)},{id:`timeline`,render:()=>{let e=C(`Press a departure`,{variant:`label`,tone:`muted`}),t=[{time:`07:42`,title:`Line 4 to Harbour Square`,detail:`Platform 2`},{time:`07:51`,title:`Line 11 to North Park`,detail:`Platform 1 · 3 min late`,tone:`warning`},{time:`08:05`,title:`Line 4 to Harbour Square`,detail:`Cancelled`,tone:`danger`},{time:`08:12`,title:`Express to Airport`,detail:`Platform 3 · on time`,tone:`success`}];return xb(V({title:`Departures`,body:[sy({label:`Departures`,items:t,onSelect:n=>e.textContent=`Selected: ${t[n].time} ${t[n].title}`}).el,e]}).el,V({title:`Reminders`,body:sy({label:`Reminders`,items:[{time:`Today`,title:`Put the recycling out`,tone:`accent`},{time:`Tue`,title:`Replace the hallway smoke alarm battery`},{time:`14 Nov`,title:`Boiler service`,detail:`Between 09:00 and 12:00`}]}).el}).el,V({title:`Activity`,body:sy({variant:`feed`,label:`Recent activity`,items:[{time:`2 min ago`,title:`Front door unlocked`,detail:`With the keypad`,icon:`lock`,tone:`accent`},{time:`18 min ago`,title:`Washing machine finished`,icon:`check`,tone:`success`},{time:`1 h ago`,title:`Kitchen light turned on`,icon:`lightbulb-on`},{time:`3 h ago`,title:`Garden sensor battery low`,detail:`12% left`,icon:`warning`,tone:`warning`}]}).el}).el,V({title:`Parcel`,body:sy({variant:`feed`,label:`Parcel journey`,items:[{time:`Mon 09:14`,title:`Ordered`,tone:`success`},{time:`Mon 17:30`,title:`Dispatched`,detail:`From the regional depot`,tone:`success`},{time:`Today 07:05`,title:`Out for delivery`,detail:`Expected between 13:00 and 15:00`,tone:`accent`},{time:`Expected`,title:`Delivered`}]}).el}).el)}},{id:`media-list`,render:()=>{let e=(e,t)=>`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${e}"/><stop offset="1" stop-color="${t}"/></linearGradient></defs><rect width="10" height="10" fill="url(#g)"/></svg>`)}`,t=C(`Nothing playing`,{variant:`label`,tone:`muted`}),n=[{title:`Lanterns on the Quay`,subtitle:`Mira Holloway`,meta:`3:42`,image:e(`#d9774b`,`#5b3a8c`)},{title:`Slow Tide Radio`,subtitle:`The Fenwick Lamps`,meta:`4:15`,image:e(`#2f8f83`,`#1d3557`)},{title:`A very long song title that does not fit on one line of a phone screen`,subtitle:`Orchard Static`,meta:`6:03`,image:null},{title:`Paper Weather`,subtitle:`Juno Marsh`,meta:`2:58`,image:`data:image/png;base64,AAAA`}];return xb(V({title:`Up next`,body:[ny({label:`Up next`,action:`play`,actionLabel:`Play`,items:n,onSelect:e=>t.textContent=`Playing ${n[e].title}`}).el,t]}).el,V({title:`Films`,body:ny({label:`Films`,placeholder:`film`,items:[{title:`The Glass Orchard`,subtitle:`Drama`,meta:`1 h 52 min`,image:e(`#e0b04a`,`#8c3b2f`)},{title:`Night Ferry`,subtitle:`Thriller`,meta:`2 h 4 min`},{title:`Small Hours`,meta:`Episode 3`}]}).el}).el)}},{id:`forecast-strip`,render:()=>{let e=[{label:`Today`,condition:`partly-cloudy`,value:16,low:9,sub:`10%`},{label:`Thu`,condition:`rain`,conditionText:`Light rain showers`,value:14,low:8,sub:`80%`},{label:`Fri`,condition:`pouring`,value:12,low:7,sub:`95%`},{label:`Sat`,condition:`cloudy`,value:13,low:6},{label:`Sun`,condition:`clear`,value:17,low:7},{label:`Mon`,condition:`lightning-rain`,value:19,low:11,sub:`60%`},{label:`Tue`,condition:`snow`,value:2,low:-3,sub:`40%`},{label:`Wed`,condition:`fog`,value:8,low:4}],t=Array.from({length:24},(e,t)=>{let n=(14+t)%24,r=n<7||n>=20,i=t>=4&&t<=8;return{label:t===0?`Now`:`${String(n).padStart(2,`0`)}:00`,condition:i?`rain`:r?`clear-night`:`partly-cloudy`,value:Math.round(15-Math.abs(t-2)*.6),sub:i?`${40+t*5}%`:null}});return vb(yb(`Days: up to seven equal columns (the eighth reading is left out); high, low muted, chance of rain`),ei({label:`Next 7 days`,readings:e,subName:`rain`}).el,yb(`Hours: a fixed column width that scrolls sideways and snaps; focus it and use the arrow keys`),ei({label:`Next 24 hours`,readings:t,variant:`hours`,subName:`rain`}).el,yb(`Readings outside the period of interest are muted`),ei({label:`This afternoon`,readings:t.slice(0,8).map((e,t)=>({...e,state:t<2||t>5?`outside`:`within`})),variant:`hours`}).el)}},{id:`accordion`,render:()=>vb(yb(`Many open (default), one panel with dividers`),fy({open:[`lights`],sections:[{id:`lights`,title:`Lights`,subtitle:`3 of 7 on`,icon:`lightbulb`,meta:`3`,content:C(`Turn lights off automatically when a room has been empty for 15 minutes.`,{tone:`muted`})},{id:`climate`,title:`Climate`,subtitle:`Heating to 21°`,icon:`thermometer`,content:C(`The schedule lowers the target by 2° overnight.`,{tone:`muted`})},{id:`media`,title:`Media`,icon:`music`,content:C(`Pause everything when someone rings the doorbell.`,{tone:`muted`})},{id:`locks`,title:`Locks`,subtitle:`Needs an admin`,icon:`lock`,disabled:!0}]}).el,yb(`One open at a time, always one open, separated cards`),fy({mode:`single`,required:!0,variant:`separated`,sections:[{id:`q1`,title:`How do I add a device?`,content:C(`Open Settings, choose Devices and press Add. The display finds devices on the same network.`,{tone:`muted`})},{id:`q2`,title:`Can the screen dim at night?`,content:C(`Yes: under Display, set a quiet period and a night brightness.`,{tone:`muted`})},{id:`q3`,title:`What happens when the network drops?`,content:C(`Controls show their last known state and reconnect on their own.`,{tone:`muted`})}]}).el)},{id:`tree`,render:()=>{let e=[{id:`ground`,label:`Ground floor`,icon:`home`,meta:`9`,children:[{id:`living`,label:`Living room`,meta:`4`,children:[{id:`l1`,label:`Floor lamp`,icon:`lightbulb`},{id:`l2`,label:`Ceiling light`,icon:`lightbulb`},{id:`l3`,label:`Speaker`,icon:`music`},{id:`l4`,label:`Thermostat`,icon:`thermometer`}]},{id:`kitchen`,label:`Kitchen`,meta:`3`,children:[{id:`k1`,label:`Counter strip`,icon:`lightbulb`},{id:`k2`,label:`Extractor fan`,icon:`fan`},{id:`k3`,label:`Window sensor`,icon:`wifi`}]},{id:`hall`,label:`Hallway`,meta:`2`,children:[{id:`h1`,label:`Front door lock`,icon:`lock`},{id:`h2`,label:`Doorbell camera`,icon:`camera`,disabled:!0}]}]},{id:`upstairs`,label:`Upstairs`,icon:`home`,children:[{id:`bed`,label:`Bedroom`,children:[{id:`b1`,label:`Bedside lamp`,icon:`lightbulb`}]},{id:`bath`,label:`Bathroom`}]},{id:`garden`,label:`Garden`,icon:`weather`}],t=C(`Selected: Kitchen`,{variant:`caption`,tone:`muted`}),n=C(`2 devices in the scene`,{variant:`caption`,tone:`muted`});return M(`div`,{class:`mh-grid`},vb(yb(`Select a room; arrows, Home, End, * and typing move`),gb({nodes:e,label:`Rooms`,expanded:[`ground`],selected:`kitchen`,onSelect:e=>t.textContent=`Selected: ${e}`}).el,t),vb(yb(`Checkable and dense: parents check everything under them`),gb({nodes:e,label:`Scene devices`,checkable:!0,dense:!0,expanded:[`ground`,`living`,`hall`],checked:[`l1`,`l2`],onCheckedChange:e=>n.textContent=`${e.length} devices in the scene`}).el,n))}},{id:`data-table`,render:()=>{let e=[{id:`d1`,name:`Hall motion sensor`,room:`Hallway`,kind:`Sensor`,battery:82,seen:`1 min ago`},{id:`d2`,name:`Front door lock`,room:`Hallway`,kind:`Lock`,battery:9,seen:`Just now`},{id:`d3`,name:`Desk lamp`,room:`Study`,kind:`Light`,battery:null,seen:`Just now`},{id:`d4`,name:`Bathroom sensor 2`,room:`Bathroom`,kind:`Sensor`,battery:45,seen:`4 min ago`},{id:`d5`,name:`Bathroom sensor 10`,room:`Bathroom`,kind:`Sensor`,battery:100,seen:`2 min ago`},{id:`d6`,name:`Kitchen window`,room:`Kitchen`,kind:`Contact`,battery:67,seen:`12 min ago`},{id:`d7`,name:`Bedroom radiator`,room:`Bedroom`,kind:`Valve`,battery:23,seen:`1 h ago`},{id:`d8`,name:`Garden plug`,room:`Garden`,kind:`Plug`,battery:null,seen:`Yesterday`}],t=e=>e===null?`neutral`:e<15?`danger`:e<40?`warning`:`success`,n=[{id:`name`,label:`Name`,sortable:!0,width:200},{id:`room`,label:`Room`,sortable:!0},{id:`kind`,label:`Type`,sortable:!0},{id:`battery`,label:`Battery`,align:`end`,sortable:!0,render:e=>hi({label:e.battery===null?`Mains`:`${e.battery}%`,tone:t(e.battery)}).el},{id:`seen`,label:`Last seen`,align:`end`}],r=C(`Nothing selected`,{variant:`caption`,tone:`muted`});return vb(yb(`Sortable, selectable, sticky header and first column, resizable (drag the header edges or use the arrow keys on them)`),wy({columns:n,rows:e,rowId:e=>e.id,rowLabel:e=>e.name,label:`Devices`,showCaption:!0,selectable:!0,resizable:!0,stickyColumn:!0,maxHeight:`18rem`,sort:{column:`name`,direction:`ascending`},onSelectionChange:e=>r.textContent=e.length?`${e.length} selected`:`Nothing selected`}).el,r,yb(`Dense and striped`),wy({columns:n.map(e=>({...e,width:void 0})),rows:e.slice(0,5),rowId:e=>e.id,label:`Sensors`,dense:!0,striped:!0}).el,yb(`Empty`),wy({columns:n,rows:[],rowId:e=>e.id,label:`Offline devices`,empty:`Every device is online`}).el)}},{id:`qr-code`,render:()=>{let e=ab({value:`https://homeassistant.local:8123/`,label:`Link to the dashboard`,caption:`Open on your phone`,size:`large`}),t=qt({label:`Text to encode`,value:`https://homeassistant.local:8123/`}),n=t.input,r=C(``,{variant:`caption`,tone:`muted`}),i=()=>{e.setValue(n.value);let t=e.matrix();r.textContent=`Version ${t.version}, level ${t.ecc}, mask ${t.mask}, ${t.size}×${t.size} modules`};return n.addEventListener(`input`,i),i(),vb(yb(`Type to re-encode; always dark modules on a light plate with a four-module quiet zone`),t.el,r,_b(e.el,ab({value:`WIFI:T:WPA;S:Guest network;P:lanterns-over-the-quay;;`,label:`Join the guest Wi-Fi`,caption:`Guest Wi-Fi`,ecc:`H`}).el,ab({value:`mosaic-pair:7Q2X-91KD`,label:`Pairing code`,caption:`Pair a display`,size:`small`}).el))}}];function Cb(e,t=4){if(!(e>0)||!Number.isFinite(e))return 1;let n=e/Math.max(1,t),r=10**Math.floor(Math.log10(n)),i=n/r;return(i<=1?1:i<=2?2:i<=2.5?2.5:i<=5?5:10)*r}function wb(e){let t=0;for(;t<10&&Math.abs(Math.round(e*10**t)-e*10**t)>1e-6;)t+=1;return t}function Tb(e,t,n=4){let r=Number.isFinite(e)?e:0,i=Number.isFinite(t)?t:r;r>i&&([r,i]=[i,r]),r===i&&(r===0?i=1:r>0?r=0:i=0);let a=Cb(i-r,n),o=wb(a),s=e=>Number(e.toFixed(o)),c=s(Math.floor(r/a+1e-9)*a),l=s(Math.ceil(i/a-1e-9)*a),u=[];for(let e=0;e<=Math.round((l-c)/a);e+=1)u.push(s(c+e*a));return{min:c,max:l,step:a,ticks:u}}function Eb(e,t){let n=e.toFixed(wb(t));return n===`-0`?`0`:n}function Db(e){return String(Number(e.toFixed(2)))}function G(e,t={},...n){let r={};for(let[e,n]of Object.entries(t))n!=null&&n!==!1&&(r[e]=n===!0?``:String(n));let i=[],a=e=>{e!=null&&e!==!1&&(Array.isArray(e)?e.forEach(a):i.push(e))};return n.forEach(a),{tag:e,attrs:r,children:i}}var Ob=`http://www.w3.org/2000/svg`;function kb(e,t=!1){let n=t||e.tag===`svg`,r=n?document.createElementNS(Ob,e.tag):document.createElement(e.tag);for(let[t,n]of Object.entries(e.attrs))r.setAttribute(t,n);for(let t of e.children)r.append(typeof t==`string`?document.createTextNode(t):kb(t,n));return r}function Ab(e,t,n=!1){let r=n||t.tag===`svg`;for(let n of Array.from(e.attributes))n.name in t.attrs||e.removeAttribute(n.name);for(let[n,r]of Object.entries(t.attrs))e.getAttribute(n)!==r&&e.setAttribute(n,r);let i=Array.from(e.childNodes);t.children.forEach((t,n)=>{let a=i[n];typeof t==`string`?a&&a.nodeType===3?a.textContent!==t&&(a.textContent=t):a?e.replaceChild(document.createTextNode(t),a):e.append(t):a instanceof Element&&a.tagName.toLowerCase()===t.tag.toLowerCase()?Ab(a,t,r):a?e.replaceChild(kb(t,r),a):e.append(kb(t,r))});for(let e=i.length-1;e>=t.children.length;--e)i[e].remove()}var K=e=>Math.round(e*100)/100;function jb(e,t=`accent`){return`${e}--${t===`accent`?`accent`:`series-${t}`}`}function Mb(e,t=`medium`){return t!==`medium`&&`${e}--${t===`small`?`sm`:`lg`}`}var Nb=(e,t,n)=>Math.min(n,Math.max(t,e)),Pb=e=>e!==null&&Number.isFinite(e);function Fb(e,t,n=Db){let r=t.filter(e=>Pb(e.value));if(r.length===0)return`${e}: no data`;let i=e=>e.name??e.label;if(t.length<=12)return`${e}: ${t.map(e=>`${i(e)} ${Pb(e.value)?n(e.value):`no data`}`).join(`, `)}`;let a=r.reduce((e,t)=>t.value<e.value?t:e),o=r.reduce((e,t)=>t.value>e.value?t:e),s=r[r.length-1];return`${e}: ${t.length} columns, low ${n(a.value)} (${i(a)}), high ${n(o.value)} (${i(o)}), latest ${n(s.value)} (${i(s)})`}function Ib(e,t,n,r=4){let i=e.map(e=>e.value).filter(Pb),a=Math.min(0,...i),o=Math.max(0,...i),s=Tb(t??a,n??o,r);return{min:t??s.min,max:n??s.max,step:s.step,ticks:s.ticks.filter(e=>e>=(t??s.min)&&e<=(n??s.max))}}function Lb(e,t,n=!0,r=!1){return B(`mh-bar-chart`,jb(`mh-bar-chart`,e),Mb(`mh-bar-chart`,t),!n&&`mh-bar-chart--no-axis`,r&&`mh-bar-chart--highlight`)}function Rb(e){let t=e.format??Db,n=Math.max(1,e.bars.length),r=e.axis!==!1,i=Ib(e.bars,e.min,e.max,e.ticks),a=i.max-i.min||1,o=e=>K(100-(Math.min(i.max,Math.max(i.min,e))-i.min)/a*100),s=o(Math.min(i.max,Math.max(i.min,0))),c=100/n,l=c*.64,u=e.labelEvery??(n<=12?1:Math.ceil(n/8)),d=e.highlight!==void 0&&e.highlight>=0&&e.highlight<e.bars.length,f=i.ticks.map(e=>`M0 ${o(e)}H100`).join(``),p=e.bars.map((t,n)=>{if(!Pb(t.value))return null;let r=Math.min(o(t.value),s),i=Math.abs(s-o(t.value));return G(`rect`,{class:B(`mh-bar-chart__bar`,t.color!==void 0&&jb(`mh-bar-chart__bar`,t.color),d&&n===e.highlight&&`is-highlight`),x:K(n*c+(c-l)/2),y:K(r),width:K(l),height:K(i)})}),m=e.showValues&&G(`div`,{class:`mh-bar-chart__values`,"aria-hidden":`true`},e.bars.map((n,r)=>Pb(n.value)?G(`span`,{class:B(`mh-bar-chart__value`,n.value<0&&`is-negative`,d&&r===e.highlight&&`is-highlight`),style:n.value<0?`left: ${K((r+.5)*c)}%; top: ${o(n.value)}%`:`left: ${K((r+.5)*c)}%; bottom: ${K(100-o(n.value))}%`},t(n.value)):null)),h=Math.max(...i.ticks.map(e=>Eb(e,i.step).length));return G(`div`,{class:B(Lb(e.color,e.size,r,d),e.showValues&&`mh-bar-chart--values`),role:`img`,"aria-label":Fb(e.label,e.bars,t),style:r?`--_gutter: ${h}`:void 0},r&&G(`div`,{class:`mh-bar-chart__axis`,"aria-hidden":`true`},i.ticks.map(e=>G(`span`,{class:`mh-bar-chart__tick`,style:`bottom: ${K(100-o(e))}%`},Eb(e,i.step)))),G(`div`,{class:`mh-bar-chart__plot`},G(`svg`,{class:`mh-bar-chart__svg`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`},r&&G(`path`,{class:`mh-bar-chart__grid`,d:f,"vector-effect":`non-scaling-stroke`}),p,G(`path`,{class:`mh-bar-chart__zero`,d:`M0 ${s}H100`,"vector-effect":`non-scaling-stroke`})),m),G(`div`,{class:`mh-bar-chart__labels`,"aria-hidden":`true`},e.bars.map((t,n)=>G(`span`,{class:B(`mh-bar-chart__label`,n%u!==0&&`is-hidden`,d&&n===e.highlight&&`is-highlight`,!Pb(t.value)&&`is-empty`)},t.label))))}function zb(e){let t=kb(Rb(e));return{el:t,update:e=>Ab(t,Rb(e))}}var Bb=[`luminance`,`red`,`green`,`blue`];function Vb(e,t){let n=t===`luminance`?[`luminance`]:t===`rgb`?[`red`,`green`,`blue`]:Bb;return Bb.filter(t=>n.includes(t)&&(e[t]?.length??0)>0)}var Hb=(e,t)=>t===`sqrt`?Math.sqrt(e):t===`log`?Math.log1p(e):e;function Ub(e,t,n=`linear`){let r=Math.max(0,...t.flatMap(t=>(e[t]??[]).map(e=>Hb(Math.max(0,e),n)))),i={};for(let a of t){let t=e[a]??[],o=t.length,s=e=>o===1?50:K(e/(o-1)*100),c=e=>r>0?K(100-Hb(Math.max(0,e),n)/r*100):100;i[a]=`M0 100${t.map((e,t)=>`L${s(t)} ${c(e)}`).join(``)}L100 100Z`}return i}function Wb(e){let t=e.reduce((e,t)=>e+Math.max(0,t),0);return t===0||e.length<2?{mean:0,shadows:0,highlights:0}:{mean:e.reduce((e,t,n)=>e+Math.max(0,t)*n,0)/t/(e.length-1),shadows:Math.max(0,e[0])/t,highlights:Math.max(0,e[e.length-1])/t}}function Gb(e){if(e.luminance?.length)return e.luminance;let t=[`red`,`green`,`blue`].map(t=>e[t]).filter(e=>!!e?.length);return t.length===0?[]:t[0].map((e,n)=>t.reduce((e,t)=>e+(t[n]??0),0)/t.length)}var Kb=e=>`${e>=.1?Math.round(e*100):Number((e*100).toFixed(1))}%`;function qb(e,t){let n=Gb(t);if(n.reduce((e,t)=>e+t,0)<=0)return`${e}: no data`;let r=Wb(n),i=r.mean<.35?`mostly shadows`:r.mean>.65?`mostly highlights`:`mostly midtones`,a=[r.shadows>=.001&&`${Kb(r.shadows)} clipped shadows`,r.highlights>=.001&&`${Kb(r.highlights)} clipped highlights`].filter(Boolean);return[`${e}: ${i}`,`mean level ${Math.round(r.mean*100)}%`,...a].join(`, `)}function Jb(e){return B(`mh-histogram`,Mb(`mh-histogram`,e))}function Yb(e){let t=Vb(e.data,e.mode),n=Ub(e.data,t,e.scale),r=Wb(Gb(e.data)),i=e.clipping!==!1;return G(`div`,{class:Jb(e.size),role:`img`,"aria-label":qb(e.label,e.data)},G(`svg`,{class:`mh-histogram__svg`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`},G(`path`,{class:`mh-histogram__grid`,d:`M25 0V100M50 0V100M75 0V100`,"vector-effect":`non-scaling-stroke`}),t.map(e=>G(`path`,{class:B(`mh-histogram__channel`,`mh-histogram__channel--${e}`),d:n[e],"vector-effect":`non-scaling-stroke`}))),i&&r.shadows>=.01&&G(`span`,{class:`mh-histogram__clip mh-histogram__clip--shadows`,"aria-hidden":`true`}),i&&r.highlights>=.01&&G(`span`,{class:`mh-histogram__clip mh-histogram__clip--highlights`,"aria-hidden":`true`}))}function Xb(e){let t=kb(Yb(e));return{el:t,update:e=>Ab(t,Yb(e))}}var Zb=.01,Qb=e=>Math.round(e*1e3)/1e3,$b=e=>String(Math.round(e*255));function ex(e){return e.map(e=>({x:Nb(e.x,0,1),y:Nb(e.y,0,1)})).sort((e,t)=>e.x-t.x)}function tx(e){let t=e.length,n=[];for(let r=0;r<t-1;r+=1){let t=e[r+1].x-e[r].x;n.push(t>0?(e[r+1].y-e[r].y)/t:0)}let r=e.map((e,r)=>{if(r===0)return n[0]??0;if(r===t-1)return n[t-2]??0;let i=n[r-1],a=n[r];return i*a<=0?0:(i+a)/2});for(let e=0;e<t-1;e+=1){let t=n[e];if(t===0){r[e]=0,r[e+1]=0;continue}let i=r[e]/t,a=r[e+1]/t,o=i*i+a*a;if(o>9){let n=3/Math.sqrt(o);r[e]=n*i*t,r[e+1]=n*a*t}}return r}function nx(e,t){let n=ex(e);if(n.length===0)return Nb(t,0,1);if(n.length===1||t<=n[0].x)return n[0].y;if(t>=n[n.length-1].x)return n[n.length-1].y;let r=tx(n),i=0;for(;i<n.length-2&&t>n[i+1].x;)i+=1;let a=n[i],o=n[i+1],s=o.x-a.x;if(s<=0)return o.y;let c=(t-a.x)/s,l=c*c,u=l*c;return Nb((2*u-3*l+1)*a.y+(u-2*l+c)*s*r[i]+(-2*u+3*l)*o.y+(u-l)*s*r[i+1],0,1)}function rx(e,t=256){let n=Math.max(2,Math.floor(t));return Array.from({length:n},(t,r)=>nx(e,r/(n-1)))}function ix(e,t=64){return rx(e,t+1).map((e,n)=>`${n?`L`:`M`}${K(n/t*100)} ${K(100-e*100)}`).join(``)}function ax(e,t,n,r){let i=e.map(e=>({...e})),a=t>0?i[t-1].x+Zb:0,o=t<i.length-1?i[t+1].x-Zb:1;return i[t]&&(i[t]={x:Qb(Nb(n,Math.min(a,o),Math.max(a,o))),y:Qb(Nb(r,0,1))}),i}function ox(e,t,n=16,r=nx(e,t)){if(e.length>=n||t<0||t>1||e.some(e=>Math.abs(e.x-t)<Zb*3))return null;let i=[...e.map(e=>({...e})),{x:Qb(t),y:Qb(Nb(r,0,1))}].sort((e,t)=>e.x-t.x);return{points:i,index:i.findIndex(e=>e.x===Qb(t))}}function sx(e,t){return t<=0||t>=e.length-1?null:e.filter((e,n)=>n!==t).map(e=>({...e}))}function cx(e,t,n,r,i=1/255,a=16){let o=e[t];if(!o)return null;let s=r?i*10:i,c={ArrowUp:[0,s],ArrowDown:[0,-s],ArrowRight:[s,0],ArrowLeft:[-s,0],PageUp:[0,.1],PageDown:[0,-.1]}[n];if(c)return{points:ax(e,t,o.x+c[0],o.y+c[1]),focus:t};if(n===`Delete`||n===`Backspace`){let n=sx(e,t);return n?{points:n,focus:t-1}:null}if(n===`Insert`||n===`+`){let n=e[t+1]??e[t-1];if(!n)return null;let r=ox(e,(o.x+n.x)/2,a);return r?{points:r.points,focus:r.index}:null}return null}function lx(e=`luminance`,t,n=!1){return B(`mh-curves`,`mh-curves--${e}`,Mb(`mh-curves`,t),n&&`is-disabled`)}function ux(e){let t=ex(e.points),n=e.format??$b,r=e.histogram?.length?Ub({luminance:e.histogram},[`luminance`],`sqrt`).luminance:void 0;return G(`div`,{class:lx(e.channel,e.size,e.disabled),role:`group`,"aria-label":e.label,"aria-description":`Arrow keys move a point, Shift moves it faster, Insert adds a point and Delete removes it.`},G(`div`,{class:`mh-curves__plot`},G(`svg`,{class:`mh-curves__svg`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`},r&&G(`path`,{class:`mh-curves__histogram`,d:r}),G(`path`,{class:`mh-curves__grid`,d:`M25 0V100M50 0V100M75 0V100M0 25H100M0 50H100M0 75H100`,"vector-effect":`non-scaling-stroke`}),G(`path`,{class:`mh-curves__identity`,d:`M0 100L100 0`,"vector-effect":`non-scaling-stroke`}),G(`path`,{class:`mh-curves__curve`,d:ix(t),"vector-effect":`non-scaling-stroke`})),t.map((r,i)=>G(`span`,{class:`mh-curves__point`,role:`slider`,tabindex:e.disabled?-1:0,"data-index":i,"aria-label":`Point ${i+1} of ${t.length}`,"aria-valuemin":0,"aria-valuemax":1,"aria-valuenow":Qb(r.y),"aria-valuetext":`Input ${n(r.x)}, output ${n(r.y)}`,"aria-disabled":e.disabled?`true`:void 0,style:`left: ${K(r.x*100)}%; top: ${K(100-r.y*100)}%`}))))}function dx(e,t,n){let r=null,i=()=>e.querySelector(`.mh-curves__plot`)??e,a=e=>{let t=i().getBoundingClientRect();return{x:t.width>0?(e.clientX-t.left)/t.width:0,y:t.height>0?1-(e.clientY-t.top)/t.height:0}},o=e=>{let t=e instanceof Element?e.closest(`.mh-curves__point`):null;return t?Number(t.dataset.index):-1},s=i=>{let s=t();if(s.disabled||i.button!==0)return;let c=ex(s.points),l=o(i.target);if(l<0){let{x:e}=a(i),t=ox(c,Nb(e,0,1),s.maxPoints);if(!t)return;l=t.index,n(t.points,l)}i.preventDefault(),r={id:i.pointerId,index:l},e.setPointerCapture?.(i.pointerId),e.querySelector(`[data-index="${l}"]`)?.focus()},c=e=>{if(!r||e.pointerId!==r.id)return;let{x:i,y:o}=a(e);n(ax(ex(t().points),r.index,i,o))},l=e=>{r&&e.pointerId===r.id&&(r=null)},u=e=>{let r=t(),i=o(e.target);if(r.disabled||i<0)return;let a=sx(ex(r.points),i);a&&n(a,i-1)},d=e=>{let r=t(),i=o(e.target);if(r.disabled||i<0)return;let a=cx(ex(r.points),i,e.key,e.shiftKey,r.step,r.maxPoints);a&&(e.preventDefault(),n(a.points,a.focus))};return e.addEventListener(`pointerdown`,s),e.addEventListener(`pointermove`,c),e.addEventListener(`pointerup`,l),e.addEventListener(`pointercancel`,l),e.addEventListener(`dblclick`,u),e.addEventListener(`keydown`,d),()=>{e.removeEventListener(`pointerdown`,s),e.removeEventListener(`pointermove`,c),e.removeEventListener(`pointerup`,l),e.removeEventListener(`pointercancel`,l),e.removeEventListener(`dblclick`,u),e.removeEventListener(`keydown`,d)}}function fx(e){let t={...e,points:ex(e.points)},n=kb(ux(t)),r=e=>{t={...e,points:ex(e.points)},Ab(n,ux(t))};return{el:n,update:r,getPoints:()=>ex(t.points),setPoints:e=>r({...t,points:e}),setHistogram:e=>r({...t,histogram:e}),destroy:dx(n,()=>t,(e,i)=>{r({...t,points:e}),i!==void 0&&n.querySelector(`[data-index="${i}"]`)?.focus(),t.onChange?.(ex(e))})}}function px(e,t,n,r=1500,i=20){if(!e||t>=e.value)return{state:{value:t,at:n},shown:t};let a=n-e.at,o=a<=r?e.value:e.value-(a-r)/1e3*i;return o<=t?{state:{value:t,at:n},shown:t}:{state:e,shown:o}}function mx(e,t=-60,n=0){return Number.isFinite(e)?n>t?Nb((e-t)/(n-t),0,1):0:+(e>0)}function hx(e,t=-60,n=0){return e>t?e>=n?`clipping`:`${Math.round(e)} dB`:`below ${t} dB`}function gx(e=`horizontal`,t=!1,n){return B(`mh-level-meter`,e===`vertical`&&`mh-level-meter--vertical`,t&&`mh-level-meter--segmented`,Mb(`mh-level-meter`,n))}function _x(e,t=e.peaks??[]){let n=e.min??-60,r=e.max??0,i=mx(e.warning??-12,n,r),a=mx(e.danger??-3,n,r),o=e.channels??[],s=Math.max(e.levels.length,o.length,1),c=i=>{let a=e.levels[i]??-1/0,c=o[i],l=t[i],u=l!==void 0&&l>n;return G(`div`,{class:`mh-level-meter__channel`},c!==void 0&&G(`span`,{class:`mh-level-meter__name`,"aria-hidden":`true`},c),G(`div`,{class:`mh-level-meter__track`,role:`meter`,"aria-label":c===void 0?s>1?`${e.label}, channel ${i+1}`:e.label:`${e.label}, ${c}`,"aria-valuemin":n,"aria-valuemax":r,"aria-valuenow":K(Nb(Number.isFinite(a)?a:n,n,r)),"aria-valuetext":hx(a,n,r),style:`--_level: ${K(mx(a,n,r))}; --_peak: ${u?K(mx(l,n,r)):0}`},G(`span`,{class:`mh-level-meter__fill`}),u&&G(`span`,{class:B(`mh-level-meter__peak`,l>=r&&`is-clip`)})))},l=Tb(n,r,4).ticks.filter(e=>e>=n&&e<=r);return G(`div`,{class:gx(e.orientation,e.segmented,e.size),role:`group`,"aria-label":e.label,style:`--_warn: ${K(i*100)}%; --_danger: ${K(a*100)}%`},G(`div`,{class:`mh-level-meter__channels`},Array.from({length:s},(e,t)=>c(t))),e.scale&&G(`div`,{class:B(`mh-level-meter__scale`,o.length>0&&`has-names`),"aria-hidden":`true`},l.map(e=>G(`span`,{class:`mh-level-meter__tick`,style:`--_at: ${K(mx(e,n,r)*100)}%`},String(e)))))}function vx(e){let t=e,n=[],r=(e,r)=>e.map((e,i)=>{let{state:a,shown:o}=px(n[i],Number.isFinite(e)?e:-1/0,r,t.peakHold,t.peakDecay);return n[i]=a,o}),i=()=>typeof performance<`u`?performance.now():Date.now(),a=e=>_x(t,t.peaks??r(t.levels,e)),o=kb(a(i()));return{el:o,setLevels(e,n=i()){t={...t,levels:e},Ab(o,a(n))},update(e){(e.channels?.length??e.levels.length)!==(t.channels?.length??t.levels.length)&&(n=[]),t=e,Ab(o,a(i()))}}}function yx(e,t){return t?t.warning<=t.danger?e>=t.danger?`danger`:e>=t.warning?`warning`:`ok`:e<=t.danger?`danger`:e<=t.warning?`warning`:`ok`:`ok`}function bx(e,t,n,r){return!Number.isFinite(e)||e<=t||n<=t?0:Nb(Math.round((e-t)/(n-t)*r),1,r)}function xx(e=`level`,t=!1,n,r,i=!1){return B(`mh-meter`,`mh-meter--${e}`,t&&e===`level`&&`mh-meter--vertical`,jb(`mh-meter`,n),Mb(`mh-meter`,r),i&&`mh-meter--zones`)}function Sx(e){let t=e.mode??`level`,n=e.min??0,r=e.max??100,i=Math.max(1,Math.round(e.segments??(t===`bars`?4:10))),a=Number.isFinite(e.value)?Nb(e.value,n,r):n,o=bx(a,n,r,i),s=e.format??Db,c=e.colorBy===`value`,l=Array.from({length:i},(s,l)=>{let u=l<o,d=e.zones?yx(c?a:n+(r-n)*(e.zones.warning<=e.zones.danger?l:l+1)/i,e.zones):null;return G(`span`,{class:B(`mh-meter__seg`,u&&`is-on`,d&&`is-${d}`),style:t===`bars`?`--_h: ${K((l+1)/i*100)}%`:void 0})});return G(`div`,{class:xx(t,e.vertical,e.color,e.size,!!e.zones),role:`meter`,"aria-label":e.label,"aria-valuemin":n,"aria-valuemax":r,"aria-valuenow":a,"aria-valuetext":e.valueText??s(a)},l)}function Cx(e){let t=e,n=kb(Sx(t)),r=e=>{t=e,Ab(n,Sx(e))};return{el:n,update:r,setValue:(e,n)=>r({...t,value:e,valueText:n})}}var wx=e=>e!=null&&Number.isFinite(e);function Tx(e,t){return new Date(Date.UTC(e,t,0)).getUTCDate()}function Ex(e,t){return new Date(Date.UTC(e,t-1,1)).getUTCDay()}function Dx(e,t,n=1){let r=(Ex(e,t)-n+7)%7,i=Tx(e,t),a=[...Array(r).fill(null),...Array.from({length:i},(e,t)=>t+1)];for(;a.length%7;)a.push(null);let o=[];for(let e=0;e<a.length;e+=7)o.push(a.slice(e,e+7));return o}function Ox(e,t,n,r=4){if(!wx(e))return 0;if(n<=t)return Math.ceil(r/2);let i=(Math.min(n,Math.max(t,e))-t)/(n-t);return 1+Math.min(r-1,Math.floor(i*r))}function kx(e,t,n){let r=e.filter(wx);return{lo:t??(r.length?Math.min(...r):0),hi:n??(r.length?Math.max(...r):0)}}function Ax(e,t){let n=new Intl.DateTimeFormat(e,{weekday:`narrow`,timeZone:`UTC`}),r=new Intl.DateTimeFormat(e,{weekday:`long`,timeZone:`UTC`});return Array.from({length:7},(e,i)=>{let a=new Date(Date.UTC(1970,0,4+(t+i)%7));return{short:n.format(a),long:r.format(a)}})}function jx(e,t){return B(`mh-month-grid`,jb(`mh-month-grid`,e),Mb(`mh-month-grid`,t))}function Mx(e,t,n,r=Db){return t<=e?`Colour scale: ${r(e)}`:`Colour scale from lightest to darkest: ${Array.from({length:n},(i,a)=>`${r(e+(t-e)*a/n)} to ${r(e+(t-e)*(a+1)/n)}`).join(`, `)}`}function Nx(e){let t=e.format??Db,n=Math.min(6,Math.max(2,Math.round(e.steps??4))),r=((e.weekStart??1)%7+7)%7,{lo:i,hi:a}=kx(e.values,e.min,e.max),o=new Date(Date.UTC(e.year,e.month-1,1)),s=e.caption??new Intl.DateTimeFormat(e.locale,{month:`long`,year:`numeric`,timeZone:`UTC`}).format(o),c=new Intl.DateTimeFormat(e.locale,{day:`numeric`,month:`long`,timeZone:`UTC`}),l=e=>K(e/n),u=r=>{if(r===null)return G(`td`,{class:`mh-month-grid__pad`});let o=e.values[r-1],s=Ox(o,i,a,n),u=`${c.format(new Date(Date.UTC(e.year,e.month-1,r)))}: ${wx(o)?t(o):`no data`}${e.today===r?`, today`:``}`;return G(`td`,{class:B(`mh-month-grid__day`,s===0&&`is-empty`,s/n>.6&&`is-strong`,e.today===r&&`is-today`),style:s?`--_t: ${l(s)}`:void 0},G(`span`,{class:`mh-month-grid__num`,"aria-hidden":`true`},String(r)),G(`span`,{class:`mh-visually-hidden`},u))},d=e.legend!==!1&&G(`div`,{class:`mh-month-grid__legend`,role:`img`,"aria-label":Mx(i,a,n,t)},G(`span`,{class:`mh-month-grid__end`,"aria-hidden":`true`},t(i)),Array.from({length:n},(e,t)=>G(`span`,{class:`mh-month-grid__swatch`,"aria-hidden":`true`,style:`--_t: ${l(t+1)}`})),G(`span`,{class:`mh-month-grid__end`,"aria-hidden":`true`},t(a)));return G(`div`,{class:jx(e.color,e.size)},G(`table`,{class:`mh-month-grid__table`,"aria-label":`${e.label}, ${s}`},G(`caption`,{class:`mh-month-grid__caption`},s),G(`thead`,{},G(`tr`,{},Ax(e.locale,r).map(e=>G(`th`,{class:`mh-month-grid__weekday`,scope:`col`,abbr:e.long},G(`span`,{"aria-hidden":`true`},e.short),G(`span`,{class:`mh-visually-hidden`},e.long))))),G(`tbody`,{},Dx(e.year,e.month,r).map(e=>G(`tr`,{},e.map(u))))),d)}function Px(e){let t=kb(Nx(e));return{el:t,update:e=>Ab(t,Nx(e))}}function Fx(e){let t=Math.max(0,Math.floor(Number.isFinite(e)?e:0)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=String(t%60).padStart(2,`0`);return n?`${n}:${String(r).padStart(2,`0`)}:${i}`:`${r}:${i}`}function Ix(e,t=`bars`){let n=e.length;if(n===0)return``;let r=t=>Nb(Number.isFinite(e[t])?e[t]:0,0,1),i=e=>K((e+.5)/n*100),a=e=>n===1?50:K(e/(n-1)*100);switch(t){case`half`:return e.map((e,t)=>`M${i(t)} 100V${K(100-Math.max(.04,r(t))*100)}`).join(``);case`envelope`:return`M0 50${e.map((e,t)=>`L${a(t)} ${K(50-r(t)*48)}`).join(``)}L100 50${e.map((e,t)=>`L${a(n-1-t)} ${K(50+r(n-1-t)*48)}`).join(``)}Z`;case`line`:return e.map((e,t)=>`${t?`L`:`M`}${a(t)} ${K(50+(t%2?1:-1)*r(t)*48)}`).join(``);case`dots`:{let t=48/5;return e.map((e,n)=>{let a=Math.max(1,Math.round(r(n)*5)),o=new Set;for(let e=0;e<a;e+=1)o.add(K(50-e*t)),o.add(K(50+e*t));return[...o].map(e=>`M${i(n)} ${e}h0`).join(``)}).join(``)}default:return e.map((e,t)=>`M${i(t)} ${K(50-Math.max(.04,r(t))*46)}V${K(50+Math.max(.04,r(t))*46)}`).join(``)}}var Lx=e=>!!(e.onSeek||e.onSelect)&&(e.duration??0)>0;function Rx(e){let t=e.formatTime??Fx,n=e.selection?`, selected ${t(e.selection.start)} to ${t(e.selection.end)}`:``;return`${t(e.position??0)} of ${t(e.duration??0)}${n}`}function zx(e=`bars`,t,n,r=!1){return B(`mh-waveform`,`mh-waveform--${e}`,jb(`mh-waveform`,t),Mb(`mh-waveform`,n),r&&`mh-waveform--interactive`)}function Bx(e){let t=e.style??`bars`,n=Math.max(0,e.duration??0),r=Nb(e.position??0,0,n),i=e=>n?K(Nb(e,0,n)/n*100):0,a=Ix(e.peaks,t),o=e=>G(`svg`,{class:B(`mh-waveform__svg`,`mh-waveform__${e}`),viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`},G(`path`,{class:`mh-waveform__wave`,d:a,"vector-effect":`non-scaling-stroke`})),s=e.formatTime??Fx,c=e.selection&&n?{start:Math.min(e.selection.start,e.selection.end),end:Math.max(e.selection.start,e.selection.end)}:null,l=Lx(e),u=l?{role:`slider`,tabindex:0,"aria-label":e.label,"aria-valuemin":0,"aria-valuemax":K(n),"aria-valuenow":K(r),"aria-valuetext":Rx({...e,position:r,selection:c})}:{role:`img`,"aria-label":n?`${e.label}, ${s(n)}${r?`, at ${s(r)}`:``}`:e.label};return G(`div`,{class:zx(t,e.color,e.size,l),...u,style:`--_n: ${Math.max(1,e.peaks.length)}; --_pos: ${n?i(r):100}%`},o(`base`),o(`played`),c&&G(`div`,{class:`mh-waveform__selection`,"aria-hidden":`true`,style:`left: ${i(c.start)}%; width: ${K(i(c.end)-i(c.start))}%`}),n>0&&G(`div`,{class:`mh-waveform__playhead`,"aria-hidden":`true`,style:`left: ${i(r)}%`}))}function Vx(e,t,n){let r=n.duration??0,i=Nb(n.position??0,0,r),a=n.step??5;if(e===`Escape`)return n.selection&&n.onSelect?{selection:null}:null;let o={ArrowRight:i+a,ArrowUp:i+a,ArrowLeft:i-a,ArrowDown:i-a,PageUp:i+a*6,PageDown:i-a*6,Home:0,End:r}[e];if(o===void 0)return null;let s=K(Nb(o,0,r));if(!t||!n.onSelect)return{position:s};let c=n.selection,l=c?Math.abs(i-c.start)<Math.abs(i-c.end)?c.end:c.start:i;return{position:s,selection:s===l?null:{start:Math.min(l,s),end:Math.max(l,s)}}}function Hx(e,t,n){return t.width>0?K(Nb((e-t.left)/t.width,0,1)*n):0}function Ux(e,t,n,r){let i=null,a=n=>Hx(n.clientX,e.getBoundingClientRect(),t().duration??0),o=n=>{Lx(t())&&n.button===0&&(i={id:n.pointerId,x:n.clientX,t:a(n),dragging:!1},e.setPointerCapture?.(n.pointerId),e.focus())},s=e=>{if(!i||e.pointerId!==i.id)return;let o=t();if(o.onSelect&&Math.abs(e.clientX-i.x)>4&&(i.dragging=!0),i.dragging){let t=a(e);r({start:Math.min(i.t,t),end:Math.max(i.t,t)})}else o.onSelect||n(a(e))},c=e=>{i&&e.pointerId===i.id&&(i.dragging||(t().selection&&r(null),n(a(e))),i=null)},l=()=>{i=null},u=e=>{let i=t();if(!Lx(i))return;let a=Vx(e.key,e.shiftKey,i);a&&(e.preventDefault(),a.position!==void 0&&n(a.position),`selection`in a&&r(a.selection??null))};return e.addEventListener(`pointerdown`,o),e.addEventListener(`pointermove`,s),e.addEventListener(`pointerup`,c),e.addEventListener(`pointercancel`,l),e.addEventListener(`keydown`,u),()=>{e.removeEventListener(`pointerdown`,o),e.removeEventListener(`pointermove`,s),e.removeEventListener(`pointerup`,c),e.removeEventListener(`pointercancel`,l),e.removeEventListener(`keydown`,u)}}function Wx(e){let t=e,n=kb(Bx(t)),r=e=>{t=e,Ab(n,Bx(e))};return{el:n,update:r,setPeaks:e=>r({...t,peaks:e}),setPosition:e=>r({...t,position:e}),setSelection:e=>r({...t,selection:e}),destroy:Ux(n,()=>t,e=>{r({...t,position:e}),t.onSeek?.(e)},e=>{r({...t,selection:e}),t.onSelect?.(e)})}}var Gx=(...e)=>M(`div`,{class:`ex-stack`},...e),Kx=e=>C(e,{variant:`label`,tone:`muted`}),qx=[19.2,19,18.8,18.9,19.4,20.1,20.8,21.3,21.6,21.4,21.9,22.3,22.1,21.7,21.5],Jx=[120,340,280,90,60,null,null,75,410,520,380,210,260],Yx=[1,2,3,4,5,6];function Xx(e){let t=e;return()=>(t=(t*1664525+1013904223)%4294967296,t/4294967296)}var Zx=e=>`${e.toFixed(1)} kWh`,Qx=[`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`,`Sunday`],$x=e=>e.map((e,t)=>({label:Qx[t].slice(0,3),name:Qx[t],value:e}));function eS(e,t){let n=Xx(t);return Array.from({length:e},(e,t)=>{let r=Math.abs(Math.sin(t/2.3))*(.55+.45*n()),i=t%23>19?.1:1;return Math.round(Math.max(.03,r*i)*100)/100})}function tS(e,t=[0,0]){return Array.from({length:64},(n,r)=>{let i=r/63,a=e.reduce((e,[t,n,r])=>e+r*Math.exp(-((i-t)**2)/(2*n*n)),0);return Math.round(a*1e3+(r===0?t[0]:r===63?t[1]:0))})}var nS=e=>Array.from({length:24},(t,n)=>Math.round(50+30*Math.sin(n/3+e)+10*Math.sin(n+e*2))),rS=[{id:`sparkline`,render:()=>Gx(Kx(`Living room temperature, last 15 hours (area)`),_e({values:qx,label:`Living room temperature`,area:!0,size:`large`,format:e=>`${e}°`}).el,Kx(`Kitchen power with a gap in the data`),_e({values:Jx,label:`Kitchen power`,color:2,format:e=>`${e} W`}).el,Kx(`Fixed scale 0 to 100: battery 82%`),_e({values:[100,97,95,92,90,88,85,82],label:`Battery`,color:3,min:0,max:100,size:`small`}).el,Kx(`Series colours`),M(`div`,{class:`mh-grid mh-grid--sm`},...Yx.map((e,t)=>_e({values:nS(t),label:`Series ${e}`,color:e,area:t%2==0,size:`small`}).el)))},{id:`trend`,render:()=>M(`div`,{class:`mh-grid`},V({title:`Living room`,body:[ae({name:`Temperature`,value:21.5,unit:`°C`,values:qx,range:`18.8–22.3 °C over 15 h`,format:e=>e.toFixed(1)}).el,ae({name:`Humidity`,value:46,unit:`%`,values:[52,51,50,49,49,48,47,47,46,46,47,46],color:3}).el,ae({name:`Power`,value:260,unit:`W`,values:Jx,color:2}).el]}).el,V({title:`No data`,body:[ae({name:`Outdoor temperature`,value:null,unit:`°C`,values:[],color:4}).el,ae({name:`Water used`,value:0,unit:`L`,values:[0,0,0,0],color:5}).el]}).el)},{id:`bar-chart`,render:()=>{let e=Xx(7),t=Array.from({length:24},(t,n)=>({label:String(n).padStart(2,`0`),name:`${n}:00`,value:Math.round((.2+(n>6&&n<9?1.4:0)+(n>17&&n<22?1.8:0)+e()*.4)*10)/10})),n=e=>e.toFixed(1),r=zb({bars:$x([6.2,5.8,7.4,4.9,6.6,8.1,7.2]),label:`Energy used per day`,showValues:!0,highlight:6,format:n}),i=P({label:`New week`,variant:`secondary`,size:`small`,onClick:()=>r.update({bars:$x(Qx.map(()=>Math.round((3+e()*6)*10)/10)),label:`Energy used per day`,showValues:!0,highlight:Math.floor(e()*7),format:n})});return M(`div`,{class:`mh-grid`},V({title:`Energy this week`,subtitle:`Today stands out, values above the columns`,body:[r.el,M(`div`,{class:`ex-row`},i.el)]}).el,V({title:`Power by hour`,subtitle:`Every third label is shown`,body:[zb({bars:t,label:`Energy by hour today`,color:2,format:Zx}).el]}).el,V({title:`Net grid use`,subtitle:`Negative values hang below zero, colours per column`,body:[zb({bars:[4.1,2.2,-1.8,-3.4,-.6,1.9,3.3].map((e,t)=>({label:Qx[t].slice(0,1),name:Qx[t],value:e,color:e<0?3:1})),label:`Net grid use per day`,showValues:!0,format:n}).el]}).el,V({title:`Sizes and gaps`,body:[Kx(`Small, no axis, a missing day`),zb({bars:$x([3,4,null,5,2,6,4]),label:`Water used`,size:`small`,axis:!1,color:4}).el,Kx(`Large, fixed 0–100 scale`),zb({bars:[`Hall`,`Kitchen`,`Office`,`Bedroom`].map((e,t)=>({label:e,value:[82,45,67,23][t]})),label:`Battery level of sensors`,size:`large`,min:0,max:100,color:5,showValues:!0,format:e=>`${e}%`}).el]}).el)}},{id:`month-grid`,render:()=>{let e=Xx(11),t=Array.from({length:31},(t,n)=>n>24?null:Math.round((4+e()*5+(n%7>4?2:0))*10)/10),n=Array.from({length:30},()=>e()>.55?Math.round(e()*120)/10:0);return M(`div`,{class:`mh-grid`},V({title:`Energy per day`,subtitle:`Week starts Monday, today outlined, no data after today`,body:[Px({year:2026,month:3,values:t,label:`Energy used per day`,today:25,format:Zx}).el]}).el,V({title:`Rainfall`,subtitle:`Six steps, fixed 0–12 mm scale, week starts Sunday`,body:[Px({year:2026,month:4,values:n,label:`Rainfall per day`,color:3,steps:6,min:0,max:12,weekStart:0,format:e=>`${e} mm`}).el]}).el,V({title:`Compact`,body:[Px({year:2026,month:2,values:Array.from({length:28},(e,t)=>t*7%11),label:`Hours of heating`,color:6,size:`small`,caption:`February`,format:e=>`${e} h`}).el]}).el)}},{id:`meter`,render:()=>{let e=64,t=Cx({value:e,label:`Noise level`,zones:{warning:70,danger:90},segments:12,valueText:`${e} dB`,size:`large`}),n=n=>()=>{e=Math.max(0,Math.min(100,e+n)),t.setValue(e,`${e} dB`)};return Gx(Kx(`Level with zones by LED: noise`),t.el,M(`div`,{class:`ex-row`},P({label:`Quieter`,variant:`secondary`,size:`small`,onClick:n(-8)}).el,P({label:`Louder`,variant:`secondary`,size:`small`,onClick:n(8)}).el),Kx(`Coloured by value, low is bad: batteries at 82%, 24% and 8%`),...[82,24,8].map(e=>Cx({value:e,label:`Battery`,segments:5,zones:{warning:30,danger:10},colorBy:`value`,valueText:`${e}%`}).el),Kx(`Bars: signal strength 0 to 4`),M(`div`,{class:`ex-row`},...[0,1,2,3,4].map(e=>Cx({value:e,max:4,mode:`bars`,label:`Wi-Fi signal`,valueText:`${e} of 4 bars`}).el)),Kx(`Sizes, vertical and series colours`),M(`div`,{class:`ex-row`},Cx({value:3,max:4,mode:`bars`,label:`Signal`,size:`small`,color:2}).el,Cx({value:2,max:5,segments:5,mode:`bars`,label:`Signal`,color:3}).el,Cx({value:4,max:4,mode:`bars`,label:`Signal`,size:`large`,color:4}).el,Cx({value:60,label:`Fan speed`,vertical:!0,color:5}).el,Cx({value:30,label:`Tank level`,vertical:!0,segments:6,color:6}).el),Cx({value:40,label:`Volume`,size:`small`,segments:20,color:1}).el)}},{id:`level-meter`,render:()=>{let e=vx({levels:[-60,-60],channels:[`L`,`R`],label:`Speaker output`,scale:!0}),t=vx({levels:[-60,-60],channels:[`L`,`R`],label:`Speaker output`,orientation:`vertical`,segmented:!0,scale:!0}),n=vx({levels:[-60],label:`Microphone level`,segmented:!0,size:`large`}),r=Xx(5),i=0,a=window.setInterval(()=>{if(!e.el.isConnected&&i>0)return window.clearInterval(a);i+=1;let o=-18+10*Math.sin(i/9)+(i%40==0?17:0),s=Math.min(0,o+r()*8),c=Math.min(0,o-3+r()*8);e.setLevels([s,c]),t.setLevels([s,c]),n.setLevels([i%60>40?-1/0:-30+r()*20])},60);return Gx(Kx(`Stereo with peak hold and a dB scale`),e.el,Kx(`Segmented, large, one channel`),n.el,Kx(`Vertical`),M(`div`,{class:`ex-row`},t.el,vx({levels:[-9],peaks:[0],label:`Clipped input`,orientation:`vertical`,size:`small`}).el),Kx(`Still: −12 dB with a peak at −3 dB`),vx({levels:[-12],peaks:[-3],label:`Line input`,size:`small`}).el)}},{id:`waveform`,render:()=>{let e=eS(72,3),t=!1,n=0,r=C(`0:00 / ${Fx(47)}`,{variant:`label`,tone:`muted`}),i=()=>{r.textContent=`${Fx(n)} / ${Fx(47)}`},a=Wx({peaks:e,label:`Voice message`,duration:47,position:0,onSeek:e=>{n=e,i()}}),o=P({label:`Play`,icon:`play`,size:`small`,onClick:()=>{t=!t,o.setLabel(t?`Pause`:`Play`)}}),s=window.setInterval(()=>{if(!a.el.isConnected&&n>0)return window.clearInterval(s);t&&(n=n+.25>=47?0:n+.25,a.setPosition(n),i())},250),c=`Drag across it to select a part`,l=C(c,{variant:`label`,tone:`muted`}),u=Wx({peaks:eS(160,9),label:`Doorbell recording`,style:`envelope`,duration:12,position:3,selection:{start:5,end:8.5},color:2,size:`large`,onSeek:()=>{},onSelect:e=>{l.textContent=e?`Selected ${e.start.toFixed(1)} s to ${e.end.toFixed(1)} s`:c}});return Gx(Kx(`Voice message: click, drag or use the arrow keys to seek`),M(`div`,{class:`ex-row`},o.el,r),a.el,Kx(`Selectable: drag, or Shift + arrow keys; Escape clears`),u.el,l,Kx(`Five styles, played up to 40%`),...[`bars`,`half`,`envelope`,`line`,`dots`].flatMap((e,t)=>[Kx(e),Wx({peaks:eS(e===`line`?120:56,20+t),label:`Chime, ${e}`,style:e,duration:10,position:4,color:Yx[t%Yx.length]}).el]),Kx(`Static, small`),Wx({peaks:eS(40,2),label:`Chime`,size:`small`}).el)}},{id:`histogram`,render:()=>{let e={luminance:tS([[.18,.08,1],[.55,.12,.45],[.9,.03,.2]],[900,0])},t={red:tS([[.62,.14,.8],[.2,.06,.3]]),green:tS([[.48,.12,.9]]),blue:tS([[.32,.1,.7],[.85,.05,.25]],[0,400])};return M(`div`,{class:`mh-grid`},V({title:`Luminance`,subtitle:`A dark scene with clipped shadows`,body:[Xb({data:e,label:`Camera snapshot histogram`}).el]}).el,V({title:`RGB`,subtitle:`Colour channels overlap, clipped highlights in blue`,body:[Xb({data:t,label:`Camera snapshot histogram`}).el]}).el,V({title:`All channels and scales`,subtitle:`Linear, square root and log height`,body:[Xb({data:{luminance:tS([[.5,.15,1]]),...t},label:`All channels`,size:`small`}).el,Xb({data:e,label:`Square root scale`,scale:`sqrt`,size:`small`}).el,Xb({data:e,label:`Log scale`,scale:`log`,size:`small`}).el]}).el)}},{id:`curves-editor`,render:()=>{let e=[{x:0,y:0},{x:.25,y:.2},{x:.75,y:.82},{x:1,y:1}],t=C(``,{variant:`label`,tone:`muted`}),n=e=>{let n=rx(e,5);t.textContent=`${e.length} points · shadows ${Math.round(n[1]*255)}, midtones ${Math.round(n[2]*255)}, highlights ${Math.round(n[3]*255)}`},r=fx({points:e,label:`Tone curve`,histogram:tS([[.3,.12,1],[.7,.1,.6]]),onChange:n});n(e);let i=P({label:`Reset`,variant:`secondary`,size:`small`,onClick:()=>{r.setPoints(e),n(e)}});return M(`div`,{class:`mh-grid`},V({title:`Tone curve`,subtitle:`Drag points, press an empty spot to add one, double-click or Delete removes, arrows nudge`,body:[r.el,t,M(`div`,{class:`ex-row`},i.el)]}).el,V({title:`Channels`,body:[M(`div`,{class:`mh-grid mh-grid--sm`},fx({points:[{x:0,y:.08},{x:.5,y:.56},{x:1,y:1}],label:`Red curve`,channel:`red`,size:`small`}).el,fx({points:[{x:0,y:0},{x:1,y:.92}],label:`Green curve`,channel:`green`,size:`small`}).el,fx({points:[{x:0,y:0},{x:.4,y:.32},{x:1,y:1}],label:`Blue curve`,channel:`blue`,size:`small`}).el,fx({points:e,label:`Locked curve`,disabled:!0,size:`small`}).el)]}).el)}}],iS=6378137,aS=85.0511287798,oS=1e3,sS=Math.PI/180,cS=e=>Math.max(-85.0511287798,Math.min(aS,e));function lS(e,t){let n=cS(e)*sS;return{x:(t+180)/360,y:.5-Math.log(Math.tan(Math.PI/4+n/2))/(2*Math.PI)}}function uS(e){return Math.atan(Math.sinh(Math.PI*(1-2*e)))/sS}function dS(e){return 2*Math.PI*iS*Math.cos(cS(e)*sS)}function fS(e,t,n,r={}){let i=r.padding??.1,a=r.minSpan??300,o=e??{minX:0,minY:0,maxX:1,maxY:1},s=(o.minX+o.maxX)/2,c=(o.minY+o.maxY)/2,l=e?a/dS(uS(c)):0,u=Math.max(o.maxX-o.minX,l),d=Math.max(o.maxY-o.minY,l),f=1-2*i,p=Math.min(t*f/u,n*f/d),m=s-t/2/p,h=c-n/2/p,g=uS(c);return{width:t,height:n,scale:p,view:{minX:m,minY:h,maxX:m+t/p,maxY:h+n/p},centreLat:g,metresPerUnit:dS(g)/p,empty:e===null,project(e,t){let n=lS(e,t);return{x:(n.x-m)*p,y:(n.y-h)*p}},metres(e,t){return e/dS(t)*p}}}function pS(e){if(!(e>=1))return 1;let t=10**Math.floor(Math.log10(e));return([5,2,1].find(n=>n*t<=e)??1)*t}function mS(e){return e>=1e3?`${e/1e3} km`:`${e} m`}function hS(e,t,n,r={}){let i=Math.max(0,Math.floor(r.minZoom??0)),a=Math.max(i,Math.floor(r.maxZoom??19)),o=r.tileSize&&r.tileSize>0?r.tileSize:256,s=Math.min(2,Math.max(1,Number.isFinite(n)?n:1)),c=e*t/oS,l=Math.floor(Math.log2(c*s/o));return Math.max(i,Math.min(a,Number.isFinite(l)?l:i))}function gS(e,t){let n=2**t;return{x0:Math.floor(e.minX*n),x1:Math.ceil(e.maxX*n)-1,y0:Math.max(0,Math.floor(e.minY*n)),y1:Math.min(n-1,Math.ceil(e.maxY*n)-1)}}function _S(e,t){let n=2**t;return(e%n+n)%n}function vS(e,t,n,r){return e.replace(/\{z\}/g,String(t)).replace(/\{x\}/g,String(n)).replace(/\{y\}/g,String(r))}var yS=e=>Math.round(e*1e3)/1e3;function bS(e,t,n={}){if(e.empty||!t.url)return null;let r=n.width&&n.width>0?n.width:360,i=Math.max(0,Math.floor(t.minZoom??0)),a=hS(e.scale,r,n.dpr??1,t),o=gS(e.view,a),s=e=>Math.max(0,e.x1-e.x0+1)*Math.max(0,e.y1-e.y0+1);for(;s(o)>64&&a>i;)o=gS(e.view,--a);if(s(o)===0||s(o)>64)return null;let c=2**a,l=e.scale/c,u=[];for(let n=o.y0;n<=o.y1;n++)for(let r=o.x0;r<=o.x1;r++){let i=_S(r,a);u.push({z:a,x:i,y:n,url:vS(t.url,a,i,n),left:yS((r/c-e.view.minX)*e.scale/e.width*100),top:yS((n/c-e.view.minY)*e.scale/e.height*100),width:yS(l/e.width*100),height:yS(l/e.height*100)})}return{zoom:a,tiles:u,attribution:t.attribution}}var xS=e=>Math.round(e*10)/10,SS=e=>Math.round(e*100)/100,CS=(...e)=>e.every(e=>Number.isFinite(e)),wS=e=>CS(e.lat,e.lon),TS=e=>!!e&&CS(e.lat,e.lon,e.radius)&&e.radius>=0,ES=e=>(e.rings??[]).map(e=>e.filter(e=>CS(e[0],e[1]))).filter(t=>t.length>=(e.open?2:3)),DS=e=>TS(e.circle)||ES(e).length>0;function OS(e,t){return t?e?{minX:Math.min(e.minX,t.minX),minY:Math.min(e.minY,t.minY),maxX:Math.max(e.maxX,t.maxX),maxY:Math.max(e.maxY,t.maxY)}:{...t}:e}function kS(e,t,n){let r=lS(e,t),i=n/dS(e);return{minX:r.x-i,minY:r.y-i,maxX:r.x+i,maxY:r.y+i}}function AS(e){let t=null;TS(e.circle)&&(t=kS(e.circle.lat,e.circle.lon,e.circle.radius));for(let n of ES(e))for(let[e,r]of n){let n=lS(r,e);t=OS(t,{minX:n.x,minY:n.y,maxX:n.x,maxY:n.y})}return t}function jS(e){return kS(e.lat,e.lon,e.accuracy&&e.accuracy>0?e.accuracy:0)}function MS(e,t,n=`all`){let r=e.filter(wS),i=t.filter(DS),a=n===`focus`?i.filter(e=>(e.tone??`accent`)===`accent`):i,o=n===`focus`&&r.length===0&&a.length===0?i:a,s=null;for(let e of r)s=OS(s,jS(e));for(let e of o)s=OS(s,AS(e));return s}var NS=(e,t)=>e.minX<=t.maxX&&e.maxX>=t.minX&&e.minY<=t.maxY&&e.maxY>=t.minY;function PS(e,t,n){let r=xS(n);return`M${xS(e-n)} ${xS(t)}a${r} ${r} 0 1 0 ${xS(2*n)} 0a${r} ${r} 0 1 0 ${xS(-2*n)} 0Z`}var FS=.016,IS=.04,LS=.7,RS=8,zS=7;function BS(e){let t=e.map(e=>({...e}));for(let e=0;e<t.length;e++){let n=t[e];if(!n.label)continue;let r=t.slice(0,e).find(e=>e.label&&Math.abs(e.x-n.x)<RS&&Math.abs(e.y-n.y)<zS);r&&(r.label.split(`, `).includes(n.label)||(r.label=`${r.label}, ${n.label}`),n.label=null)}return t}function VS(e,t={}){let n=e.aspect&&e.aspect>0&&Number.isFinite(e.aspect)?e.aspect:16/10,r=oS,i=xS(r/n),a=e.fit??`all`,o=fS(MS(e.points,e.shapes,a),r,i,e.tiles?{minSpan:800}:{}),s=e.tiles?bS(o,e.tiles,t):null,c=(e,t)=>SS(e/t*100),l=e.points.filter(wS).map(e=>o.project(e.lat,e.lon)),u=[],d=[],f=e=>{let t=AS(e);if(!t||!NS(t,o.view))return null;let n=[];if(TS(e.circle)){let t=o.project(e.circle.lat,e.circle.lon);n.push(PS(t.x,t.y,o.metres(e.circle.radius,e.circle.lat)))}for(let t of ES(e)){let r=t.map(([e,t],n)=>{let r=o.project(t,e);return`${n?`L`:`M`}${xS(r.x)} ${xS(r.y)}`}).join(``);n.push(e.open?r:`${r}Z`)}let a=e.name?.trim()||null,s=null;if(a){let n=TS(e.circle)?lS(e.circle.lat,e.circle.lon):{x:(t.minX+t.maxX)/2,y:(t.minY+t.maxY)/2},u=(n.x-o.view.minX)*o.scale,f=(n.y-o.view.minY)*o.scale,p=(t.maxX-t.minX)*o.scale,m=(t.maxY-t.minY)*o.scale,h=a.length*FS*r,g=IS*r,_=p>=h&&m>=g,v=_||!TS(e.circle)?f:f+m/2+g*.6,y=l.some(e=>Math.abs(e.x-u)<h/2&&Math.abs(e.y-v)<g)||d.some(e=>Math.abs(e.x-u)<(h+e.w)/2&&Math.abs(e.y-v)<g);(_||TS(e.circle))&&!y&&u>=0&&u<=r&&v>=0&&v<=i&&(s={x:c(u,r),y:c(v,i)},d.push({x:u,y:v,w:h}))}return{d:n.join(``),kind:e.open?`line`:`area`,tone:e.tone??`accent`,name:a,nameAt:s}},p=e.shapes.filter(DS),m=[...p.filter(e=>e.tone===`muted`),...p.filter(e=>e.tone!==`muted`&&!e.open),...p.filter(e=>e.tone!==`muted`&&e.open)],h=[...m.filter(e=>e.tone!==`muted`),...m.filter(e=>e.tone===`muted`)],g=new Map(h.map(e=>[e,f(e)]));for(let e of m){let t=g.get(e);t&&u.push(t)}let _=BS(e.points.filter(wS).map(e=>{let t=o.project(e.lat,e.lon),n=e.accuracy&&e.accuracy>0&&Number.isFinite(e.accuracy)?PS(t.x,t.y,o.metres(e.accuracy,e.lat)):``;return{x:c(t.x,r),y:c(t.y,i),label:e.label?.trim()||null,side:t.x>r*LS?`start`:`end`,tone:e.tone??`accent`,accuracy:n}})),v=null,y=``;if(!o.empty){let e=pS(r/4*o.metresPerUnit),t=e/o.metresPerUnit;v={metres:e,text:mS(e),width:c(t,r)};let n=e/dS(o.centreLat),a=[];for(let e=Math.ceil(o.view.minX/n);e*n<=o.view.maxX;e++)a.push(`M${xS((e*n-o.view.minX)*o.scale)} 0V${i}`);for(let e=Math.ceil(o.view.minY/n);e*n<=o.view.maxY;e++)a.push(`M0 ${xS((e*n-o.view.minY)*o.scale)}H${r}`);y=s?``:a.join(``)}return{width:r,height:i,viewBox:`0 0 ${r} ${i}`,grid:y,shapes:u,points:_,scale:v,tiles:s}}var HS=(e,t,n,r)=>`${e} ${e===1?t:n}${r.length?` (${r.join(`, `)})`:``}`;function US(e,t,n){let r=t.filter(wS),i=n.filter(DS),a=i.filter(e=>!e.open),o=i.filter(e=>e.open),s=e=>e.map(e=>e?.trim()??``).filter(Boolean),c=[];return r.length&&c.push(HS(r.length,`place`,`places`,s(r.map(e=>e.label)))),a.length&&c.push(HS(a.length,`area`,`areas`,s(a.map(e=>e.name)))),o.length&&c.push(HS(o.length,`route`,`routes`,s(o.map(e=>e.name)))),`${e}: ${c.length?c.join(`, `):`nothing to show`}`}function WS(e){return{left:`${e.left}%`,top:`${e.top}%`,width:`calc(${e.width}% + 0.5px)`,height:`calc(${e.height}% + 0.5px)`}}function GS(e){return B(`mh-geo-map__shape`,`mh-geo-map__shape--${e.tone}`,e.kind===`line`&&`mh-geo-map__shape--line`)}function KS(e){return B(`mh-geo-map__point`,e!==`accent`&&`mh-geo-map__point--${e}`)}function qS(e){return e===`home`?Xt:null}function JS(e){return B(`mh-geo-map__accuracy`,e!==`accent`&&`mh-geo-map__accuracy--neutral`)}function YS(e){return B(`mh-geo-map__label`,e===`start`&&`mh-geo-map__label--start`)}function XS(e){return`${e.width} / ${e.height}`}var ZS=e=>`left: ${e.x}%; top: ${e.y}%`,QS=`http://www.w3.org/2000/svg`;function $S(e,t){let n=document.createElementNS(QS,e);for(let[e,r]of Object.entries(t))n.setAttribute(e,r);return n}var eC=()=>typeof window<`u`&&window.devicePixelRatio>0?window.devicePixelRatio:1;function tC(e){let t=M(`div`,{class:`mh-geo-map`,role:`img`}),n=e,r=null,i=()=>({width:t.getBoundingClientRect().width||360,dpr:eC()}),a=e=>{n=e;let a=VS(e,e.tiles?i():{});r=a.tiles?.zoom??null,t.classList.toggle(`mh-geo-map--tiles`,!!a.tiles),t.setAttribute(`aria-label`,US(e.label,e.points,e.shapes)),t.style.aspectRatio=XS(a);let o=$S(`svg`,{class:`mh-geo-map__svg`,viewBox:a.viewBox,"aria-hidden":`true`});a.grid&&o.append($S(`path`,{class:`mh-geo-map__grid`,d:a.grid,"vector-effect":`non-scaling-stroke`}));for(let e of a.shapes)o.append($S(`path`,{class:GS(e),d:e.d,"vector-effect":`non-scaling-stroke`}));for(let e of a.points)e.accuracy&&o.append($S(`path`,{class:JS(e.tone),d:e.accuracy,"vector-effect":`non-scaling-stroke`}));let s=[];for(let e of a.shapes)e.name&&e.nameAt&&s.push(M(`span`,{class:`mh-geo-map__name`,"aria-hidden":`true`,style:ZS(e.nameAt)},e.name));for(let e of a.points){let t=qS(e.tone);s.push(M(`span`,{class:KS(e.tone),"aria-hidden":`true`,style:ZS(e)},...t?[H(t)]:[])),e.label&&s.push(M(`span`,{class:YS(e.side),"aria-hidden":`true`,style:ZS(e)},e.label))}if(a.scale&&s.push(M(`span`,{class:`mh-geo-map__scale`,"aria-hidden":`true`,style:`width: ${a.scale.width}%`},M(`span`,{class:`mh-geo-map__scale-text`},a.scale.text))),!a.tiles){t.replaceChildren(o,...s);return}let c=M(`div`,{class:`mh-geo-map__tiles`,"aria-hidden":`true`});for(let e of a.tiles.tiles){let t=M(`img`,{class:`mh-geo-map__tile`,alt:``,loading:`lazy`,decoding:`async`,draggable:`false`});Object.assign(t.style,WS(e)),t.src=e.url,c.append(t)}t.replaceChildren(c,o,...s,M(`span`,{class:`mh-geo-map__attribution`},a.tiles.attribution))},o=typeof ResizeObserver==`function`?new ResizeObserver(()=>{n.tiles&&(VS(n,i()).tiles?.zoom??null)!==r&&a(n)}):null;return o?.observe(t),a(e),{el:t,update:a,destroy(){o?.disconnect()}}}var nC=(e,t=2)=>String(e).padStart(t,`0`);function rC(e,t={}){let n=Number.isFinite(e)?e:0,r=n<0?`-`:``,i=Math.abs(n),a=t.fps&&t.fps>0?Math.round(t.fps):0;if(a){let e=Math.floor(i*a+1e-6),t=e%a,n=Math.floor(e/a);return`${r}${nC(Math.floor(n/3600))}:${nC(Math.floor(n/60)%60)}:${nC(n%60)}:${nC(t)}`}let o=Math.max(0,Math.min(3,Math.floor(t.decimals??0))),s=10**o,c=Math.round(i*s),l=Math.floor(c/s),u=o?`.${nC(c%s,o)}`:``,d=Math.floor(l/3600),f=Math.floor(l/60)%60,p=l%60;return d||t.hours?`${r}${d}:${nC(f)}:${nC(p)}${u}`:`${r}${f}:${nC(p)}${u}`}function iC(e,t=2){if(!Number.isFinite(e))return`0`;let n=10**t,r=Math.round(e*n)/n;return String(Object.is(r,-0)?0:r)}var q=(e,t,n)=>Math.min(n,Math.max(t,e)),aC={group:`Zoom`,zoomOut:`Zoom out`,zoomIn:`Zoom in`,level:`Zoom level`,fit:`Fit`},oC=[.25,.5,.75,1,1.5,2,4];function sC(e){return`${Math.round(e*100)}%`}var cC=(e,t)=>Math.abs(e-t)<=Math.max(e,t)*.001;function lC(e,t,n){return[...new Set(e.filter(e=>Number.isFinite(e)&&e>=t-1e-9&&e<=n+1e-9))].sort((e,t)=>e-t)}function uC(e,t,n=oC,r=.1,i=8){let a=lC(n,r,i);return q(t>0?a.find(t=>t>e&&!cC(t,e))??e*2:[...a].reverse().find(t=>t<e&&!cC(t,e))??e/2,r,i)}function dC(e,t=oC,n=.1,r=8){let i=lC(t,n,r),a=i.find(t=>cC(t,e)),o=i.map(e=>({value:e,text:sC(e)}));return a===void 0&&(o.push({value:e,text:sC(e)}),o.sort((e,t)=>e.value-t.value)),{options:o,selected:a??e,canZoomOut:e>n&&!cC(e,n),canZoomIn:e<r&&!cC(e,r)}}function fC(e=`medium`){return B(`mh-zoom-control`,e===`small`&&`mh-zoom-control--sm`)}function pC(e=`medium`){return B(l(`default`,e===`small`?`small`:`medium`),`mh-zoom-control__step`)}function mC(e){let t={...aC,...e.labels},n=e.min??.1,r=e.max??8,i=e.presets??oC,a=e.size??`medium`,o=q(e.value,n,r),s=e.disabled??!1,c=M(`button`,{type:`button`,class:pC(a),"aria-label":t.zoomOut,title:t.zoomOut},H(ce)),l=M(`button`,{type:`button`,class:pC(a),"aria-label":t.zoomIn,title:t.zoomIn},H(vt)),u=M(`select`,{class:`mh-zoom-control__select`,"aria-label":t.level}),d=M(`span`,{class:`mh-zoom-control__level`},u,H(Yn,{class:`mh-zoom-control__chevron`})),f=e.showFit===!1?null:M(`button`,{type:`button`,class:`mh-zoom-control__fit`,"aria-pressed":String(e.fitted??!1)},t.fit),p=M(`div`,{class:fC(a),role:`group`,"aria-label":t.group},c,d,l,f),m=()=>{let e=dC(o,i,n,r);u.replaceChildren(...e.options.map(e=>M(`option`,{value:String(e.value)},e.text))),u.value=String(e.selected),c.disabled=s,l.disabled=s,c.setAttribute(`aria-disabled`,String(!e.canZoomOut)),l.setAttribute(`aria-disabled`,String(!e.canZoomIn)),u.disabled=s,f&&(f.disabled=s)},h=t=>{o=q(t,n,r),m(),e.onChange?.(o)};return c.addEventListener(`click`,()=>{c.getAttribute(`aria-disabled`)!==`true`&&h(uC(o,-1,i,n,r))}),l.addEventListener(`click`,()=>{l.getAttribute(`aria-disabled`)!==`true`&&h(uC(o,1,i,n,r))}),u.addEventListener(`change`,()=>h(Number(u.value))),f?.addEventListener(`click`,()=>e.onFit?.()),m(),{el:p,setValue(e){o=q(e,n,r),m()},setFitted(e){f?.setAttribute(`aria-pressed`,String(e))},setDisabled(e){s=e,m()}}}var hC={start:`Go to start`,stepBack:`Step back`,play:`Play`,pause:`Pause`,stepForward:`Step forward`,end:`Go to end`,loop:`Loop`,position:`Position`,duration:`Duration`};function gC(e=`medium`){return B(`mh-transport`,e!==`medium`&&`mh-transport--${e===`small`?`sm`:`lg`}`)}var _C={small:`small`,medium:`medium`,large:`large`},vC={small:`medium`,medium:`large`,large:`large`};function yC(e=`medium`){return B(l(`default`,_C[e]),`mh-transport__button`)}function bC(e=`medium`){return B(l(`accent`,vC[e],!0),`mh-transport__play`)}function xC(e){return e.fps&&e.fps>0?1/Math.round(e.fps):e.step&&e.step>0?e.step:1}function SC(e,t,n,r){let i=Math.round(e/n+1e-9);return q(Math.abs(i*n-e)<1e-6?(i+t)*n:t>0?Math.ceil(e/n)*n:Math.floor(e/n)*n,0,r&&r>0?r:1/0)}function CC(e){let t={...hC,...e.labels},n=e.size??`medium`,r=xC(e),i=e.playing??!1,a=Math.max(0,e.position??0),o=Math.max(0,e.duration??0),s=e.loop??!1,c=e.disabled??!1,l=(e,t,r,i)=>M(`button`,{type:`button`,class:B(yC(n),i),"aria-label":e,title:e,onClick:()=>r()},H(t)),u=t=>{a=t,T(),e.onSeek?.(a)},d=e.skip!==!1,f=e.steps!==!1,p=d?l(t.start,Rt,()=>u(0),`mh-transport__skip`):null,m=f?l(t.stepBack,Se,()=>u(SC(a,-1,r,o))):null,h=M(`button`,{type:`button`,class:bC(n)});h.addEventListener(`click`,()=>{i=!i,T(),e.onPlayingChange?.(i)});let g=f?l(t.stepForward,De,()=>u(SC(a,1,r,o))):null,_=d?l(t.end,Vr,()=>u(o),`mh-transport__skip`):null,v=e.loop===void 0?null:l(t.loop,mr,()=>{s=!s,T(),e.onLoopChange?.(s)},`mh-transport__loop`),y=M(`span`,{class:`mh-transport__current`}),b=M(`span`,{class:`mh-transport__duration`}),x=M(`span`,{class:`mh-transport__sep`,"aria-hidden":`true`},`/`),S=M(`span`,{class:`mh-transport__time`},y,x,b),C=M(`div`,{class:gC(n),role:`group`,"aria-label":e.label},M(`div`,{class:`mh-transport__buttons`},p,m,h,g,_,v),S),w=t=>rC(t,{fps:e.fps,hours:o>=3600}),T=()=>{let e=i?t.pause:t.play;h.setAttribute(`aria-label`,e),h.title=e,h.replaceChildren(H(i?ee:fe)),v?.setAttribute(`aria-pressed`,String(s)),y.textContent=w(a),y.setAttribute(`aria-label`,`${t.position} ${w(a)}`),b.textContent=o>0?w(o):``,b.setAttribute(`aria-label`,`${t.duration} ${w(o)}`),b.hidden=o<=0,x.hidden=o<=0;for(let e of[p,m,h,g,v])e&&(e.disabled=c);_&&(_.disabled=c||o<=0)};return T(),{el:C,setPlaying(e){i=e,T()},setPosition(e){a=Math.max(0,e),T()},setDuration(e){o=Math.max(0,e),T()},setLoop(e){s=e,T()},setDisabled(e){c=e,T()}}}function wC(e){let t=e.deltaMode===1?16:e.deltaMode===2?400:1,n=e.ctrlKey?.01:.0018;return Math.exp(-e.deltaY*t*n)}function TC(e,t){let n=new Map,r=!1,i=0,a={x:0,y:0},o=null,s=t=>{let n=e.getBoundingClientRect();return{x:t.clientX-n.left,y:t.clientY-n.top}},c=o=>{if(o.button!==0&&o.pointerType===`mouse`||t.accept&&!t.accept(o))return;let c=s(o);n.size===0&&(r=!1,i=0,a=c,t.onStart?.()),n.set(o.pointerId,c),i=Math.max(i,n.size);try{e.setPointerCapture(o.pointerId)}catch{}},l=e=>{let i=n.get(e.pointerId);if(!i)return;let o=s(e);!r&&Math.hypot(o.x-a.x,o.y-a.y)>6&&(r=!0);let c=[...n.entries()].filter(([t])=>t!==e.pointerId)[0]?.[1];if(c){let e={x:(i.x+c.x)/2,y:(i.y+c.y)/2},n={x:(o.x+c.x)/2,y:(o.y+c.y)/2},a=Math.hypot(i.x-c.x,i.y-c.y),s=Math.hypot(o.x-c.x,o.y-c.y),l=Math.atan2(i.y-c.y,i.x-c.x),u=(Math.atan2(o.y-c.y,o.x-c.x)-l)*180/Math.PI;u>180&&(u-=360),u<-180&&(u+=360),t.onPan?.(n.x-e.x,n.y-e.y),a>0&&s>0&&t.onPinch?.(s/a,n,u),r=!0}else t.onPan?.(o.x-i.x,o.y-i.y);n.set(e.pointerId,o)},u=e=>{if(!n.has(e.pointerId)||(n.delete(e.pointerId),n.size>0))return;let a=s(e);if(!r&&i===1&&e.type===`pointerup`){let n=e.timeStamp||performance.now();o&&n-o.time<320&&Math.hypot(a.x-o.at.x,a.y-o.at.y)<24?(o=null,t.onDoubleTap?.(a,e)):(o={at:a,time:n},t.onTap?.(a,e))}t.onEnd?.(r)},d=e=>t.onWheel?.(e,s(e));return e.addEventListener(`pointerdown`,c),e.addEventListener(`pointermove`,l),e.addEventListener(`pointerup`,u),e.addEventListener(`pointercancel`,u),e.addEventListener(`lostpointercapture`,u),e.addEventListener(`wheel`,d,{passive:!1}),()=>{e.removeEventListener(`pointerdown`,c),e.removeEventListener(`pointermove`,l),e.removeEventListener(`pointerup`,u),e.removeEventListener(`pointercancel`,u),e.removeEventListener(`lostpointercapture`,u),e.removeEventListener(`wheel`,d)}}var EC={playhead:`Playhead`,hint:`Arrow keys move the clip, Shift and arrow keys change its length.`,locked:`locked`},DC=[.1,.2,.5,1,2,5,10,15,30,60,120,300,600,900,1800,3600,7200];function OC(e,t){let n=DC.find(e=>e*t>=72)??DC[DC.length-1],r=[10,5,4,2].find(e=>n/e*t>=8),i=r?n/r:n,a=[];for(let t=0;t*n<=e+1e-9&&a.length<1e4;t++)a.push(Math.round(t*n*1e3)/1e3);return{major:n,minor:i,ticks:a}}function kC(e,t){return rC(e,{decimals:+(t<1)})}function AC(e,t,n,r){let i={time:e,to:null},a=r;for(let n of t){let t=Math.abs(n-e);t<=a&&(a=t,i={time:n,to:n})}if(n&&n>0&&i.to===null){let t=Math.round(e/n)*n;Math.abs(t-e)<=r&&(i={time:Math.round(t*1e6)/1e6,to:Math.round(t*1e6)/1e6})}return i}function jC(e,t,n,r){let i=[0,r,n];for(let n of e)for(let e of n.clips)e.id!==t&&i.push(e.start,e.end);return i}function MC(e,t,n){let r=e.clips.find(e=>e.id===t);if(!r)return{min:0,max:n};let i=0,a=n;for(let n of e.clips)n.id!==t&&(n.end<=r.start+1e-9&&(i=Math.max(i,n.end)),n.start>=r.end-1e-9&&(a=Math.min(a,n.start)));return{min:i,max:a}}function NC(e){let{mode:t,start:n,end:r,delta:i,room:a,minLength:o,targets:s,grid:c,threshold:l}=e,u=e=>l>0?AC(e,s,c,l):{time:e,to:null};if(t===`move`){let e=r-n,t=n+i,o=u(t),s=u(t+e),c=t,l=null;(o.to===null?1/0:Math.abs(o.time-t))<=(s.to===null?1/0:Math.abs(s.time-(t+e)))&&o.to!==null?(c=o.time,l=o.to):s.to!==null&&(c=s.time-e,l=s.to);let d=q(c,a.min,Math.max(a.min,a.max-e));return{start:d,end:d+e,to:d===c?l:null}}if(t===`start`){let e=u(n+i),t=q(e.time,a.min,r-o);return{start:t,end:r,to:t===e.time?e.to:null}}let d=u(r+i),f=q(d.time,n+o,a.max);return{start:n,end:f,to:f===d.time?d.to:null}}function PC(e,t){return B(`mh-media-timeline__clip`,e.tone&&`mh-media-timeline__clip--tone-${e.tone}`,t&&`is-selected`)}function FC(e){return IC(M(`div`),e)}function IC(e,t){let n={...EC,...t.labels},r=t.minZoom??4,i=t.maxZoom??400,a=t.fps&&t.fps>0?Math.round(t.fps):0,o=I(`mh-timeline-hint`),s=Math.max(0,t.duration),c=t.tracks.map(e=>({...e,clips:[...e.clips]})),l=q(t.position??0,0,s),u=q(t.zoom??48,r,i),d=t.selected??null,f=t.snap!==!1,p=t.follow!==!1,m=e=>rC(e,{fps:a,hours:s>=3600}),h=a?1/a:.1,g=()=>t.snapStep??(a?1/a:OC(s,u).minor),_=()=>t.snapStep??(a?1/a:OC(s,u).minor),v=M(`span`,{class:`mh-media-timeline__time`,"aria-hidden":`true`}),y=M(`div`,{class:`mh-media-timeline__corner`},v),b=M(`div`,{class:`mh-media-timeline__ruler`,role:`slider`,tabindex:0,"aria-label":n.playhead,"aria-valuemin":0}),S=M(`div`,{class:`mh-media-timeline__playhead`}),C=M(`div`,{class:`mh-media-timeline__snap`});C.hidden=!0;let w=M(`div`,{class:`mh-media-timeline__overlay`,"aria-hidden":`true`},S,C),T=M(`div`,{class:`mh-media-timeline__grid`}),E=M(`div`,{class:`mh-media-timeline__scroll`},T),D=M(`span`,{class:`mh-visually-hidden`,id:o},n.hint);e.classList.add(`mh-media-timeline`),e.setAttribute(`role`,`group`),e.setAttribute(`aria-label`,t.label),e.replaceChildren(E,D);let O=new Map,k=()=>{S.style.left=`${l*u}px`,v.textContent=m(l),b.setAttribute(`aria-valuenow`,String(Math.round(l*1e3)/1e3)),b.setAttribute(`aria-valuetext`,m(l))},A=(e,t)=>`${t.label??e.name}, ${m(t.start)} to ${m(t.end)}${e.locked?`, ${n.locked}`:``}`,j=(e,t,n)=>{e.style.left=`${n.start*u}px`,e.style.width=`${Math.max(2,(n.end-n.start)*u)}px`,e.setAttribute(`aria-label`,A(t,n))},N=e=>{let n=q(e,0,s);n!==l&&(l=n,k(),t.onSeek?.(l))},ee=e=>{if(d!==e){d=e;for(let[t,n]of O)n.classList.toggle(`is-selected`,t===e),n.setAttribute(`aria-pressed`,String(t===e));t.onSelect?.(e)}},te=(e,n,r,i,a)=>{let o=c.find(t=>t.id===e),s=o?.clips.find(e=>e.id===n);if(!o||!s)return;let l={...s,start:Math.round(r*1e6)/1e6,end:Math.round(i*1e6)/1e6};o.clips=o.clips.map(e=>e.id===n?l:e);let u=O.get(n);u&&j(u,o,l),t.onClipChange?.({trackId:e,clipId:n,start:l.start,end:l.end},a)},P=e=>{C.hidden=e===null,e!==null&&(C.style.left=`${e*u}px`)},ne=e=>(e-b.getBoundingClientRect().left)/u,re=(e,t)=>{let n=null,r=e=>{let t=ne(e.clientX);return f?AC(t,jC(c,``,-1,s),null,8/u).time:t};e.addEventListener(`pointerdown`,i=>{if(!(t&&i.target!==e||i.pointerType===`mouse`&&i.button!==0)){n=i.pointerId;try{e.setPointerCapture(i.pointerId)}catch{}t&&ee(null),N(r(i))}}),e.addEventListener(`pointermove`,e=>{n===e.pointerId&&N(r(e))});let i=e=>{n===e.pointerId&&(n=null)};e.addEventListener(`pointerup`,i),e.addEventListener(`pointercancel`,i)};re(b,!1),b.addEventListener(`keydown`,e=>{let t=a?1/a:1,n=null;e.key===`ArrowRight`||e.key===`ArrowUp`?n=l+(e.shiftKey?t*10:t):e.key===`ArrowLeft`||e.key===`ArrowDown`?n=l-(e.shiftKey?t*10:t):e.key===`PageUp`?n=l+10:e.key===`PageDown`?n=l-10:e.key===`Home`?n=0:e.key===`End`&&(n=s),n!==null&&(e.preventDefault(),N(Math.round(n*1e6)/1e6),oe())});let ie=(e,t,n)=>{let r=null;e.addEventListener(`pointerdown`,i=>{if(i.pointerType===`mouse`&&i.button!==0)return;ee(n);let a=c.find(e=>e.id===t.id),o=a?.clips.find(e=>e.id===n);if(!a||!o||a.locked)return;let s=i.target.closest(`.mh-media-timeline__clip-handle`),l=s?.classList.contains(`mh-media-timeline__clip-handle--start`)?`start`:s?`end`:`move`;r={id:i.pointerId,x:i.clientX,mode:l,start:o.start,end:o.end,moved:!1};try{e.setPointerCapture(i.pointerId)}catch{}e.classList.add(`is-dragging`)}),e.addEventListener(`pointermove`,e=>{if(!r||r.id!==e.pointerId)return;let i=e.clientX-r.x;if(!r.moved&&Math.abs(i)<3)return;r.moved=!0;let a=c.find(e=>e.id===t.id),o=NC({mode:r.mode,start:r.start,end:r.end,delta:i/u,room:MC(a,n,s),minLength:h,targets:jC(c,n,l,s),grid:g(),threshold:f?8/u:0});P(o.to),te(t.id,n,o.start,o.end,!1)});let i=i=>{if(!r||r.id!==i.pointerId)return;let a=r.moved;if(r=null,e.classList.remove(`is-dragging`),P(null),a){let e=c.find(e=>e.id===t.id)?.clips.find(e=>e.id===n);e&&te(t.id,n,e.start,e.end,!0)}};e.addEventListener(`pointerup`,i),e.addEventListener(`pointercancel`,i),e.addEventListener(`click`,()=>ee(n)),e.addEventListener(`keydown`,e=>{if(e.key!==`ArrowLeft`&&e.key!==`ArrowRight`)return;let r=c.find(e=>e.id===t.id),i=r?.clips.find(e=>e.id===n);if(!r||!i||r.locked)return;e.preventDefault();let a=e.key===`ArrowRight`?1:-1,o=NC({mode:e.shiftKey?`end`:`move`,start:i.start,end:i.end,delta:a*_(),room:MC(r,n,s),minLength:h,targets:[],grid:null,threshold:0});te(t.id,n,o.start,o.end,!0)})},F=()=>{let e=OC(s,u);T.style.setProperty(`--_width`,`${LC(s,u)}px`),T.style.setProperty(`--_major`,`${e.major*u}px`),T.style.setProperty(`--_minor`,`${e.minor*u}px`),b.setAttribute(`aria-valuemax`,String(s)),b.replaceChildren(...e.ticks.map(t=>M(`span`,{class:`mh-media-timeline__tick`,"aria-hidden":`true`,style:`left: ${t*u}px`},kC(t,e.major)))),O.clear();let t=[];for(let e of c){let n=t.length/2+2;t.push(M(`div`,{class:`mh-media-timeline__track-name`,style:`grid-area: ${n} / 1`},e.icon?H(e.icon):null,M(`span`,{class:`mh-media-timeline__track-label`},e.name),e.locked?H(x,{class:`mh-media-timeline__lock`}):null));let r=M(`div`,{class:B(`mh-media-timeline__lane`,e.locked&&`is-locked`),role:`group`,"aria-label":e.name,style:`grid-area: ${n} / 2`});for(let t of e.clips){let n=M(`button`,{type:`button`,class:PC(t,d===t.id),"aria-pressed":String(d===t.id),"aria-describedby":e.locked?void 0:o,"aria-disabled":e.locked?`true`:void 0},M(`span`,{class:`mh-media-timeline__clip-handle mh-media-timeline__clip-handle--start`,"aria-hidden":`true`}),M(`span`,{class:`mh-media-timeline__clip-label`},t.label??``),M(`span`,{class:`mh-media-timeline__clip-handle mh-media-timeline__clip-handle--end`,"aria-hidden":`true`}));j(n,e,t),ie(n,e,t.id),O.set(t.id,n),r.append(n)}re(r,!0),t.push(r)}w.style.gridArea=`1 / 2 / ${c.length+2} / 3`,T.replaceChildren(y,b,...t,w),k()},ae=()=>y.offsetWidth;function oe(){let e=E.clientWidth-ae();if(e<=0)return;let t=l*u;(t<E.scrollLeft+e*.05||t>E.scrollLeft+e*.9)&&(E.scrollLeft=Math.max(0,t-e*.1))}let se=(e,t)=>{let n=q(e,r,i);if(n===u)return;let a=(E.scrollLeft+t)/u;u=n,F(),E.scrollLeft=Math.max(0,a*u-t)},ce=e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();let n=Math.max(0,e.clientX-E.getBoundingClientRect().left-ae());se(u*wC(e),n),t.onZoomChange?.(u)};return E.addEventListener(`wheel`,ce,{passive:!1}),F(),{el:e,setPosition(e){l=q(e,0,s),k(),p&&oe()},setZoom(e){se(e,Math.max(0,(E.clientWidth-ae())/2))},setTracks(e){c=e.map(e=>({...e,clips:[...e.clips]})),F()},setSelected(e){d=e;for(let[t,n]of O)n.classList.toggle(`is-selected`,t===e),n.setAttribute(`aria-pressed`,String(t===e))},setSnap(e){f=e},getTracks:()=>c.map(e=>({...e,clips:[...e.clips]})),destroy(){E.removeEventListener(`wheel`,ce)}}}function LC(e,t){return Math.ceil(Math.max(0,e)*t)+24}var RC={hint:`Drag, or press the up and down arrow keys, to move the layer.`,move:e=>`Move ${e}`,moved:(e,t,n)=>`${e} moved to position ${t} of ${n}`,hide:e=>`Hide ${e}`,lock:e=>`Lock ${e}`,contents:e=>`${e} contents`};function zC(e,t,n=null){for(let r=0;r<e.length;r++){let i=e[r];if(i.id===t)return{layer:i,parent:n,index:r,siblings:e};if(i.children){let e=zC(i.children,t,i);if(e)return e}}return null}function BC(e,t,n){return e.map(e=>e.id===t?{...e,...n}:e.children?{...e,children:BC(e.children,t,n)}:e)}function VC(e,t,n){let r=e=>{let i=e.findIndex(e=>e.id===t);if(i>=0){let t=[...e],[r]=t.splice(i,1);return t.splice(Math.max(0,Math.min(t.length,n)),0,r),t}for(let t=0;t<e.length;t++){let n=e[t].children,i=n?r(n):null;if(i){let n=[...e];return n[t]={...e[t],children:i},n}}return null};return r(e)??[...e]}function HC(e,t,n){return B(`mh-layers__item`,e.children&&`mh-layers__item--group`,t&&`is-selected`,e.visible===!1&&`is-hidden`,n&&`is-hidden-by-parent`,e.locked&&`is-locked`)}var UC=e=>B(l(`default`,`small`),`mh-layers__toggle`,`mh-layers__toggle--${e}`);function WC(e,t=!0){return e.icon?e.icon:e.children?t?_t:Tt:gn}function GC(e){return KC(M(`div`),e)}function KC(e,t){let n={...RC,...t.labels},r=I(`mh-layers-hint`),i=[...t.layers],a=t.selected??null,o=M(`span`,{class:`mh-visually-hidden`,role:`status`}),s=M(`span`,{class:`mh-visually-hidden`,id:r},n.hint),c=M(`ul`,{class:`mh-layers__list`,"aria-label":t.label});e.classList.add(`mh-layers`),e.replaceChildren(c,s,o);let l=(t,n)=>{[...e.querySelectorAll(`[data-layer]`)].find(e=>e.dataset.layer===t)?.querySelector(`:scope > .mh-layers__row > .mh-layers__${n}`)?.focus()},u=(e,r,a)=>{let s=zC(i,e);if(!s)return;let c=Math.max(0,Math.min(s.siblings.length-1,r));c!==s.index&&(i=VC(i,e,c),m(),a&&l(e,a),o.textContent=n.moved(s.layer.name,c+1,s.siblings.length),t.onReorder?.(e,s.parent?.id??null,c,i))},f=(e,t,n)=>{let r=null,a=n=>{if(n.pointerType!==`mouse`||n.button===0){r=n.pointerId;try{e.setPointerCapture(n.pointerId)}catch{}t.classList.add(`is-dragging`),n.preventDefault()}},o=e=>{if(r!==e.pointerId)return;let n=t.parentElement,i=[...n.children].filter(e=>e!==t&&e instanceof HTMLLIElement).find(t=>{let n=t.querySelector(`:scope > .mh-layers__row`).getBoundingClientRect();return e.clientY<n.top+n.height/2});i?t.nextElementSibling!==i&&n.insertBefore(t,i):n.lastElementChild!==t&&n.append(t)},s=e=>{if(r!==e.pointerId)return;r=null,t.classList.remove(`is-dragging`);let a=[...t.parentElement.children].indexOf(t),o=zC(i,n);o&&a!==o.index?u(n,a,`grip`):m()};e.addEventListener(`pointerdown`,a),e.addEventListener(`pointermove`,o),e.addEventListener(`pointerup`,s),e.addEventListener(`pointercancel`,s)},p=(e,o,s,c)=>{let h=e.visible!==!1,g=e.expanded!==!1,_=M(`button`,{type:`button`,class:`mh-layers__grip`,"aria-label":n.move(e.name),"aria-describedby":r},H(ye));_.addEventListener(`keydown`,t=>{(t.key===`ArrowUp`||t.key===`ArrowDown`)&&(t.preventDefault(),u(e.id,c+(t.key===`ArrowUp`?-1:1),`grip`))});let v=e.children?M(`button`,{type:`button`,class:`mh-layers__expand`,"aria-expanded":String(g),"aria-label":n.contents(e.name)},H(hn)):M(`span`,{class:`mh-layers__expand-space`,"aria-hidden":`true`});v.addEventListener(`click`,()=>{i=BC(i,e.id,{expanded:!g}),m(),l(e.id,`expand`),t.onExpandedChange?.(e.id,!g)});let y=M(`span`,{class:B(`mh-layers__thumb`,!e.thumbnail&&`mh-layers__thumb--icon`),"aria-hidden":`true`},e.thumbnail?M(`img`,{src:e.thumbnail,alt:``,draggable:`false`}):H(WC(e,g))),b=M(`button`,{type:`button`,class:`mh-layers__name`,"aria-pressed":String(a===e.id)},M(`span`,{class:`mh-layers__label`},e.name));b.addEventListener(`click`,()=>{a=e.id,m(),l(e.id,`name`),t.onSelect?.(e.id)});let S=M(`button`,{type:`button`,class:UC(`visible`),"aria-label":n.hide(e.name),title:n.hide(e.name),"aria-pressed":String(!h)},H(h?ut:d));S.addEventListener(`click`,()=>{i=BC(i,e.id,{visible:!h}),m(),l(e.id,`toggle--visible`),t.onVisibleChange?.(e.id,!h)});let C=M(`button`,{type:`button`,class:UC(`lock`),"aria-label":n.lock(e.name),title:n.lock(e.name),"aria-pressed":String(!!e.locked)},H(e.locked?x:T));C.addEventListener(`click`,()=>{i=BC(i,e.id,{locked:!e.locked}),m(),l(e.id,`toggle--lock`),t.onLockedChange?.(e.id,!e.locked)});let w=M(`div`,{class:`mh-layers__row`,style:`--_depth: ${o}`},_,v,y,b,S,C),E=M(`li`,{class:HC(e,a===e.id,s),"data-layer":e.id},w);if(e.children){let t=M(`ul`,{class:`mh-layers__list`},...e.children.map((e,t)=>p(e,o+1,s||!h,t)));t.hidden=!g,E.append(t)}return f(_,E,e.id),E};function m(){c.replaceChildren(...i.map((e,t)=>p(e,0,!1,t)))}return m(),{el:e,getLayers:()=>i,setLayers(e){i=[...e],m()},setSelected(e){a=e,m()},destroy(){c.replaceChildren()}}}var qC=[`top-left`,`top`,`top-right`,`left`,`center`,`right`,`bottom-left`,`bottom`,`bottom-right`],JC={"top-left":`Top left`,top:`Top`,"top-right":`Top right`,left:`Left`,center:`Centre`,right:`Right`,"bottom-left":`Bottom left`,bottom:`Bottom`,"bottom-right":`Bottom right`},YC={reference:`Reference point`,lock:`Keep proportions`,x:`X position`,y:`Y position`,width:`Width`,height:`Height`,angle:`Rotation`},XC={x:`X`,y:`Y`,width:`W`,height:`H`,angle:`∠`},ZC=[`x`,`y`,`width`,`height`,`angle`];function QC(e){let t=qC.indexOf(e),n=t<0?0:t;return{fx:n%3/2,fy:Math.floor(n/3)/2}}function $C(e){if(!Number.isFinite(e))return 0;let t=e%360;return t>180&&(t-=360),t<=-180&&(t+=360),t}function ew(e,t){let{fx:n,fy:r}=QC(t);return{x:e.x+n*e.width,y:e.y+r*e.height,width:e.width,height:e.height,angle:$C(e.angle)}}function tw(e,t,n,r,i=!1){if(!Number.isFinite(n))return e;let{fx:a,fy:o}=QC(r),s=e.x+a*e.width,c=e.y+o*e.height;switch(t){case`x`:return{...e,x:n-a*e.width};case`y`:return{...e,y:n-o*e.height};case`angle`:return{...e,angle:$C(n)};case`width`:case`height`:{let r=e.width,l=e.height;return t===`width`?(r=Math.max(0,n),i&&e.width>0&&(l=e.height*r/e.width)):(l=Math.max(0,n),i&&e.height>0&&(r=e.width*l/e.height)),{...e,width:r,height:l,x:s-a*r,y:c-o*l}}}}function nw(e,t,n,r){let i=t?r*10:r;return e===`ArrowUp`?n+i:e===`ArrowDown`?n-i:null}function rw(e){let t={...YC,...e.labels},n=e.unit??`px`,r=e.step??1,i=e.decimals??2,a={...e.value},o=e.reference??`top-left`,s=e.lockAspect??!1,c=I(`mh-transform-ref`),u=qC.map(t=>{let n=M(`input`,{type:`radio`,class:`mh-transform__radio`,name:c,value:t,"aria-label":JC[t]});return n.addEventListener(`change`,()=>{n.checked&&(o=t,v(),e.onReferenceChange?.(o))}),{p:t,input:n,el:M(`label`,{class:`mh-transform__point`,title:JC[t]},n,M(`span`,{class:`mh-transform__dot`,"aria-hidden":`true`}))}}),d=M(`fieldset`,{class:`mh-transform__anchor`},M(`legend`,{class:`mh-visually-hidden`},t.reference),M(`div`,{class:`mh-transform__grid`},...u.map(e=>e.el))),f=(t,n)=>{a=tw(a,t,n,o,s),v(),e.onChange?.({...a},t)},p={},m=e=>{let s=M(`input`,{type:`number`,class:`mh-transform__input`,inputmode:`decimal`,step:`any`,"aria-label":t[e],min:e===`width`||e===`height`?0:void 0});p[e]=s,s.addEventListener(`change`,()=>{let t=Number.parseFloat(s.value);Number.isFinite(t)&&iC(t,i)!==iC(ew(a,o)[e],i)?f(e,t):v()}),s.addEventListener(`keydown`,t=>{if(t.key===`Enter`){s.dispatchEvent(new Event(`change`));return}let n=nw(t.key,t.shiftKey,ew(a,o)[e],r);n!==null&&(t.preventDefault(),f(e,n))});let c=M(`span`,{class:`mh-transform__name`,"aria-hidden":`true`},XC[e]);return iw(c,()=>!_.disabled,()=>ew(a,o)[e],r,t=>f(e,t)),M(`label`,{class:`mh-transform__field mh-transform__field--${e}`},c,s,M(`span`,{class:`mh-transform__unit`,"aria-hidden":`true`},e===`angle`?`°`:n))},h=M(`button`,{type:`button`,class:`${l(`default`,`small`)} mh-transform__lock`,"aria-label":t.lock,title:t.lock});h.addEventListener(`click`,()=>{s=!s,v(),e.onLockAspectChange?.(s)});let _=M(`fieldset`,{class:`mh-transform`},M(`legend`,{class:`mh-visually-hidden`},e.label??`Transform`),d,M(`div`,{class:`mh-transform__fields`},m(`x`),m(`y`),m(`width`),h,m(`height`),m(`angle`)));function v(){let e=ew(a,o);for(let t of ZC)p[t].value=iC(e[t],i);for(let e of u)e.input.checked=e.p===o;h.setAttribute(`aria-pressed`,String(s)),h.replaceChildren(H(s?Qe:g))}return _.disabled=e.disabled??!1,v(),{el:_,getValue:()=>({...a}),setValue(e){a={...e},v()},setReference(e){o=e,v()},setDisabled(e){_.disabled=e}}}function iw(e,t,n,r,i){let a=null,o=r=>{if(!(!t()||r.pointerType===`mouse`&&r.button!==0)){a={x:r.clientX,value:n(),id:r.pointerId};try{e.setPointerCapture(r.pointerId)}catch{}r.preventDefault()}},s=e=>{if(!a||a.id!==e.pointerId)return;let t=Math.trunc((e.clientX-a.x)/2),o=a.value+t*r*(e.shiftKey?10:1);o!==n()&&i(o)},c=e=>{a?.id===e.pointerId&&(a=null)};return e.addEventListener(`pointerdown`,o),e.addEventListener(`pointermove`,s),e.addEventListener(`pointerup`,c),e.addEventListener(`pointercancel`,c),()=>{e.removeEventListener(`pointerdown`,o),e.removeEventListener(`pointermove`,s),e.removeEventListener(`pointerup`,c),e.removeEventListener(`pointercancel`,c)}}function aw(e){return e===`on`?`off`:`on`}function ow(e){return e===`on`?Bn:e===`animated`?vn:ir}function sw(e){return B(`mh-inspector__key`,e===`animated`&&`is-animated`)}function cw(e){return`${e} keyframe`}function lw(e){return`mh-inspector__param mh-inspector__param--${e}`}function uw(e,t){let n=Number.parseFloat(e.replace(`,`,`.`));return Number.isFinite(n)?q(n,t.min??0,t.max??100):null}function dw(e){let t=new Map,n=new Map,r=new Map,i=t=>{if(t.keyframe===void 0)return M(`span`,{class:`mh-inspector__key-space`,"aria-hidden":`true`});let r=t.keyframe,i=M(`button`,{type:`button`,class:sw(r),"aria-label":cw(t.label),title:cw(t.label)}),a=()=>{i.className=sw(r),i.setAttribute(`aria-pressed`,String(r===`on`)),i.replaceChildren(H(ow(r)))};return i.addEventListener(`click`,()=>{r=aw(r),a(),e.onKeyframe?.(t.id,r===`on`)}),n.set(t.id,e=>{r=e,a()}),i.disabled=t.disabled??!1,a(),i},a=n=>{let r=I(`mh-inspector`),a=n.min??0,o=n.max??100,s=M(`input`,{type:`range`,class:`mh-slider__input mh-inspector__range`,id:r,min:a,max:o,step:n.step??1}),c=M(`input`,{type:`number`,class:`mh-inspector__number`,inputmode:`decimal`,min:a,max:o,step:n.step??1,"aria-label":`${n.label} value`});s.disabled=c.disabled=n.disabled??!1;let l=n.value,u=()=>{s.value=String(l),s.style.setProperty(`--_at`,String(Nr(l,a,o))),c.value=iC(l,n.decimals??2)},d=(t,r)=>{l=q(t,a,o),u(),e.onChange?.(n.id,l,r)};return s.addEventListener(`input`,()=>d(Number(s.value),!1)),s.addEventListener(`change`,()=>d(Number(s.value),!0)),c.addEventListener(`change`,()=>{let e=uw(c.value,n);e===null?u():d(e,!0)}),t.set(n.id,e=>{l=Number(e),u()}),u(),M(`div`,{class:lw(`slider`)},i(n),M(`label`,{class:`mh-inspector__label`,for:r},n.label),s,M(`span`,{class:`mh-inspector__value`},c,n.unit?M(`span`,{class:`mh-inspector__unit`,"aria-hidden":`true`},n.unit):null))},o=n=>{let r=I(`mh-inspector`),a=M(`input`,{type:`checkbox`,role:`switch`,class:`mh-switch__input`,"aria-labelledby":r});return a.checked=n.value,a.disabled=n.disabled??!1,a.addEventListener(`change`,()=>e.onChange?.(n.id,a.checked,!0)),t.set(n.id,e=>{a.checked=!!e}),M(`div`,{class:lw(`toggle`)},i(n),M(`span`,{class:`mh-inspector__label`,id:r},n.label),M(`label`,{class:`mh-switch mh-inspector__switch`},M(`span`,{class:`mh-switch__control`},a,M(`span`,{class:`mh-switch__thumb`,"aria-hidden":`true`}))))},s=n=>{let r=I(`mh-inspector`),a=M(`select`,{class:`mh-inspector__select`,id:r},...n.options.map(e=>M(`option`,{value:e.value},e.label)));return a.value=n.value,a.disabled=n.disabled??!1,a.addEventListener(`change`,()=>e.onChange?.(n.id,a.value,!0)),t.set(n.id,e=>{a.value=String(e)}),M(`div`,{class:lw(`choice`)},i(n),M(`label`,{class:`mh-inspector__label`,for:r},n.label),M(`span`,{class:`mh-inspector__choice`},a,H(Yn,{class:`mh-inspector__chevron`})))},c=e=>e.kind===`slider`?a(e):e.kind===`toggle`?o(e):s(e);return{el:M(`div`,{class:`mh-inspector`,role:`group`,"aria-label":e.label},...e.sections.map(t=>{let n=M(`details`,{class:`mh-inspector__section`,open:t.open!==!1},M(`summary`,{class:`mh-inspector__summary`},M(`span`,{class:`mh-inspector__title`},t.title),H(Yn,{class:`mh-inspector__caret`})),M(`div`,{class:`mh-inspector__body`},...t.params.map(c)));return n.addEventListener(`toggle`,()=>e.onSectionToggle?.(t.id,n.open)),r.set(t.id,n),n})),setValue:(e,n)=>t.get(e)?.(n),setKeyframe:(e,t)=>n.get(e)?.(t),setOpen(e,t){let n=r.get(e);n&&(n.open=t)}}}function fw(e=`horizontal`){return B(`mh-compare`,e===`vertical`&&`mh-compare--vertical`)}function pw(e,t,n,r=`horizontal`){let i=r===`vertical`?(n-e.top)/(e.height||1):(t-e.left)/(e.width||1);return Math.round(q(i,0,1)*1e3)/10}function mw(e,t=`Before`){return`${Math.round(e)}% ${t.toLowerCase()}`}var hw=4/3,gw=e=>typeof e.src==`string`&&!(e instanceof Node);function _w(e,t,n,r){let i=null,a=n=>pw(e.getBoundingClientRect(),n.clientX,n.clientY,t),o=t=>{if(!(n()||t.pointerType===`mouse`&&t.button!==0)){i=t.pointerId;try{e.setPointerCapture(t.pointerId)}catch{}e.classList.add(`is-dragging`),r(a(t)),e.querySelector(`.mh-compare__input`)?.focus({preventScroll:!0}),t.preventDefault()}},s=e=>{i===e.pointerId&&r(a(e))},c=t=>{i===t.pointerId&&(i=null,e.classList.remove(`is-dragging`))};return e.addEventListener(`pointerdown`,o),e.addEventListener(`pointermove`,s),e.addEventListener(`pointerup`,c),e.addEventListener(`pointercancel`,c),()=>{e.removeEventListener(`pointerdown`,o),e.removeEventListener(`pointermove`,s),e.removeEventListener(`pointerup`,c),e.removeEventListener(`pointercancel`,c)}}function vw(e){let t=e.orientation??`horizontal`,n=e.beforeLabel??`Before`,r=e.afterLabel??`After`,i=(e,t)=>M(`div`,{class:`mh-compare__pane mh-compare__pane--${e}`},gw(t)?M(`img`,{class:`mh-compare__img`,src:t.src,alt:t.alt,draggable:`false`}):t),a=M(`input`,{type:`range`,class:`mh-compare__input`,min:0,max:100,step:1,"aria-label":e.label,"aria-orientation":t===`vertical`?`vertical`:void 0}),o=M(`div`,{class:fw(t)},i(`after`,e.after),i(`before`,e.before),M(`span`,{class:`mh-compare__label mh-compare__label--before`,"aria-hidden":`true`},n),M(`span`,{class:`mh-compare__label mh-compare__label--after`,"aria-hidden":`true`},r),M(`div`,{class:`mh-compare__divider`,"aria-hidden":`true`},M(`span`,{class:`mh-compare__handle`},H(t===`vertical`?Or:Wr))),a);o.style.aspectRatio=String(e.aspect&&e.aspect>0?e.aspect:hw);let s=q(e.value??50,0,100);a.disabled=e.disabled??!1;let c=()=>{a.value=String(Math.round(s)),a.setAttribute(`aria-valuetext`,mw(s,n)),o.style.setProperty(`--_at`,String(Math.round(s*10)/1e3))},l=t=>{let n=q(t,0,100);n!==s&&(s=n,c(),e.onChange?.(s))};a.addEventListener(`input`,()=>l(Number(a.value)));let u=_w(o,t,()=>a.disabled,l);return c(),{el:o,input:a,getValue:()=>s,setValue(e){s=q(e,0,100),c()},setDisabled(e){a.disabled=e},destroy:u}}function yw(e,t,n,r){if(!(n>0&&r>0&&e>0&&t>0))return{width:Math.max(0,e),height:Math.max(0,t)};let i=Math.min(e/n,t/r);return{width:n*i,height:r*i}}function bw(e,t,n){let r=q(e.scale,n.minScale,n.maxScale),i=(e,t,n)=>{let i=n*r;return i<=t?(t-i)/2:q(e,t-i,0)};return{scale:r,x:i(e.x,t.frameWidth,t.contentWidth),y:i(e.y,t.frameHeight,t.contentHeight)}}function xw(e){return{scale:1,x:(e.frameWidth-e.contentWidth)/2,y:(e.frameHeight-e.contentHeight)/2}}function Sw(e,t,n,r,i){let a=q(t,i.minScale,i.maxScale),o=a/e.scale;return bw({scale:a,x:n.x-(n.x-e.x)*o,y:n.y-(n.y-e.y)*o},r,i)}function Cw(e,t,n,r,i){return bw({scale:e.scale,x:e.x+t,y:e.y+n},r,i)}function ww(e){let t=e=>Math.round(e*100)/100;return`translate(${t(e.x)}px, ${t(e.y)}px) scale(${Math.round(e.scale*1e4)/1e4})`}var Tw=4/3,Ew=48,Dw=1.25;function Ow(e){return kw(M(`div`),e)}function kw(e,t){let n={minScale:1,maxScale:Math.max(1,t.maxScale??4)},r=q(t.doubleTapScale??2.5,1,n.maxScale),i=I(`mh-zoom-hint`),a=M(`img`,{class:`mh-zoomable-image__img`,src:t.src,alt:``,draggable:`false`}),o=M(`span`,{class:`mh-visually-hidden`,id:i},t.hint??`Drag to pan, pinch, scroll or double-tap to zoom. Keys: plus and minus zoom, arrows pan, 0 resets.`);e.classList.add(`mh-zoomable-image`),e.tabIndex=0,e.setAttribute(`role`,`group`),e.setAttribute(`aria-roledescription`,`zoomable image`),e.setAttribute(`aria-label`,t.alt),e.setAttribute(`aria-describedby`,i),e.style.aspectRatio=String(t.aspect&&t.aspect>0?t.aspect:Tw);let s={frameWidth:0,frameHeight:0,contentWidth:0,contentHeight:0},c={scale:1,x:0,y:0},l,u=null,d=()=>{a.style.width=`${s.contentWidth}px`,a.style.height=`${s.contentHeight}px`,a.style.transform=ww(c),e.classList.toggle(`is-zoomed`,c.scale>1.001),u?.setValue(c.scale),u?.setFitted(c.scale<=1.001)},f=(n,r=!1)=>{r&&(e.classList.add(`is-animating`),clearTimeout(l),l=setTimeout(()=>e.classList.remove(`is-animating`),400));let i=n.scale!==c.scale||n.x!==c.x||n.y!==c.y;c=n,d(),i&&t.onChange?.({...c})},p=()=>{let t=e.clientWidth,r=e.clientHeight,i=yw(t,r,a.naturalWidth,a.naturalHeight),o=s;if(s={frameWidth:t,frameHeight:r,contentWidth:i.width,contentHeight:i.height},c.scale<=1.001||!o.contentWidth)c=xw(s);else{let e=o.contentWidth?s.contentWidth/o.contentWidth:1,i=(o.frameWidth/2-c.x)*e,a=(o.frameHeight/2-c.y)*e;c=bw({scale:c.scale,x:t/2-i,y:r/2-a},s,n)}d()},m=()=>({x:s.frameWidth/2,y:s.frameHeight/2}),h=(e,t,r=!1)=>f(Sw(c,e,t,s,n),r);a.addEventListener(`load`,p);let g=TC(e,{accept:e=>!e.target.closest(`.mh-zoomable-image__controls`),onStart:()=>e.classList.add(`is-dragging`),onEnd:()=>e.classList.remove(`is-dragging`),onPan:(e,t)=>f(Cw(c,e,t,s,n)),onPinch:(e,t)=>h(c.scale*e,t),onWheel:(e,t)=>{e.preventDefault(),h(c.scale*wC(e),t)},onDoubleTap:e=>c.scale>1.001?f(xw(s),!0):h(r,e,!0)}),_=t=>{if(t.target!==e||t.altKey||t.ctrlKey||t.metaKey)return;let r=(e,t)=>f(Cw(c,e,t,s,n));switch(t.key){case`+`:case`=`:h(c.scale*Dw,m(),!0);break;case`-`:case`_`:h(c.scale/Dw,m(),!0);break;case`0`:f(xw(s),!0);break;case`ArrowLeft`:r(Ew,0);break;case`ArrowRight`:r(-48,0);break;case`ArrowUp`:r(0,Ew);break;case`ArrowDown`:r(0,-48);break;default:return}t.preventDefault()};e.addEventListener(`keydown`,_);let v=[a,o];t.controls&&(u=mC({value:1,min:1,max:n.maxScale,presets:[1,1.5,2,3,4,6,8].filter(e=>e<=n.maxScale),size:`small`,fitted:!0,onChange:e=>h(e,m(),!0),onFit:()=>f(xw(s),!0)}),v.push(M(`div`,{class:`mh-zoomable-image__controls`},u.el))),e.replaceChildren(...v);let y=typeof ResizeObserver==`function`?new ResizeObserver(()=>p()):null;return y?.observe(e),p(),{el:e,getView:()=>({...c}),setScale:(e,t=!1)=>h(e,m(),t),zoomBy:(e,t=!1)=>h(c.scale*e,m(),t),reset:(e=!1)=>f(xw(s),e),layout:p,destroy(){g(),e.removeEventListener(`keydown`,_),y?.disconnect(),clearTimeout(l),a.removeEventListener(`load`,p)}}}var Aw={zoomIn:`Zoom in`,zoomOut:`Zoom out`,recentre:`Show all places`,compass:e=>e?`Reset to north (facing ${Math.round(e)}°)`:`Facing north`,hint:`Drag to pan, pinch or scroll to zoom. Keys: arrows pan, plus and minus zoom, Shift with left or right turns, N faces north.`,noTiles:`No map tiles set up`,roleDescription:`map`},jw=16/10,Mw=Math.PI/180;function Nw(e,t=256){return t*2**e}function Pw(e,t,n,r){return typeof e==`function`?e(t,n,r):e.replace(/\{z\}/g,String(t)).replace(/\{x\}/g,String(n)).replace(/\{y\}/g,String(r))}function Fw(e){return((e+180)%360+360)%360-180}function Iw(e,t,n){if(!n)return{x:e,y:t};let r=Math.cos(n*Mw),i=Math.sin(n*Mw);return{x:e*r-t*i,y:e*i+t*r}}function Lw(e,t,n,r){let i=lS(n.lat,n.lon),a=lS(e,t),o=a.x-i.x;o-=Math.round(o);let s=Nw(n.zoom,r.tileSize),c=Iw(o*s,(a.y-i.y)*s,-n.bearing);return{x:r.width/2+c.x,y:r.height/2+c.y}}function Rw(e,t,n,r){let i=lS(n.lat,n.lon),a=Nw(n.zoom,r.tileSize),o=Iw(e-r.width/2,t-r.height/2,n.bearing),s=i.x+o.x/a;return{lat:uS(q(i.y+o.y/a,0,1)),lon:Fw(s*360-180)}}function zw(e,t,n,r){let i=Rw(n.x,n.y,e,r),a={...e,zoom:t},o=Lw(i.lat,i.lon,a,r);return Vw(a,o.x-n.x,o.y-n.y,r)}function Bw(e,t,n,r){let i=Rw(n.x,n.y,e,r),a={...e,bearing:Hw(e.bearing+t)},o=Lw(i.lat,i.lon,a,r);return Vw(a,o.x-n.x,o.y-n.y,r)}function Vw(e,t,n,r){let i=lS(e.lat,e.lon),a=Nw(e.zoom,r.tileSize),o=Iw(t,n,e.bearing),s=q(i.y+o.y/a,0,1);return{...e,lat:q(uS(s),-aS,aS),lon:Fw((i.x+o.x/a)*360-180)}}function Hw(e){let t=(e%360+360)%360;return t>180-1e-9?t-360:t}function Uw(e,t,n=48,r=17){let i=e.filter(e=>Number.isFinite(e.lat)&&Number.isFinite(e.lon));if(!i.length)return{lat:20,lon:0,zoom:Math.max(0,Math.log2(Math.max(t.width,1)/t.tileSize)),bearing:0};let a=i.map(e=>lS(e.lat,e.lon)),o=Math.min(...a.map(e=>e.x)),s=Math.max(...a.map(e=>e.x)),c=Math.min(...a.map(e=>e.y)),l=Math.max(...a.map(e=>e.y)),u=Math.max(1,t.width-2*n),d=Math.max(1,t.height-2*n),f=Math.max(s-o,1e-12),p=Math.max(l-c,1e-12),m=Math.min(r,Math.log2(Math.min(u/f,d/p)/t.tileSize));return{lat:uS((c+l)/2),lon:(o+s)/2*360-180,zoom:Math.max(0,m),bearing:0}}function Ww(e,t=0,n=19){return q(Math.round(e),t,n)}function Gw(e,t,n){let r=2**n,i=lS(e.lat,e.lon),a=Nw(e.zoom,t.tileSize),o=e.bearing?Math.hypot(t.width,t.height)/2:0,s=(e.bearing?o:t.width/2)/a,c=(e.bearing?o:t.height/2)/a,l=Math.floor((i.x-s)*r),u=Math.floor((i.x+s)*r),d=Math.max(0,Math.floor((i.y-c)*r)),f=Math.min(r-1,Math.floor((i.y+c)*r)),p=[];for(let e=d;e<=f;e++)for(let t=l;t<=u;t++)if(p.push({key:`${n}/${t}/${e}`,z:n,x:(t%r+r)%r,y:e,column:t}),p.length>512)return p;return p}function Kw(e,t,n){let r=2**e.z,i=lS(t.lat,t.lon),a=Nw(t.zoom,n.tileSize),o=a/r;return{left:(e.column/r-i.x)*a,top:(e.y/r-i.y)*a,size:o}}function qw(e,t=256,n=96){let r=dS(e.lat)/Nw(e.zoom,t),i=pS(n*r);return{metres:i,text:mS(i),px:Math.round(i/r*10)/10}}function Jw(e,t){let n=t.filter(e=>Number.isFinite(e.lat)&&Number.isFinite(e.lon));if(!n.length)return e;let r=n.map(e=>e.label?.trim()).filter(Boolean);return`${e}: ${n.length} ${n.length===1?`place`:`places`}${r.length?` (${r.join(`, `)})`:``}`}function Yw(e=`accent`){return B(`mh-map__marker`,e===`neutral`&&`mh-map__marker--neutral`)}function Xw(e){return eT(M(`div`),e)}var Zw=64,Qw=`M12 2 16 12H8Z`,$w=`M8 12H16L12 22Z`;function eT(e,t){let n={...Aw,...t.labels},r=t.tileSize??256,i=t.minZoom??1,a=t.maxZoom??20,o=t.tileMinZoom??0,s=t.tileMaxZoom??19,c=t.rotate!==!1,u=t.tiles??null,d=t.markers??[],f=I(`mh-map-hint`),p=M(`div`,{class:`mh-map__ground`}),m=M(`div`,{class:`mh-map__tiles`}),h=M(`div`,{class:`mh-map__layer`,"aria-hidden":`true`},p,m),g=M(`div`,{class:`mh-map__markers`}),_=M(`div`,{class:`mh-map__notice`,"aria-hidden":`true`},n.noTiles),v=M(`div`,{class:`mh-map__attribution`}),y=M(`span`,{class:`mh-map__scale-text`}),x=M(`div`,{class:`mh-map__scale`,"aria-hidden":`true`},y),S=M(`span`,{class:`mh-visually-hidden`,id:f},n.hint),C=(e,t,n)=>M(`button`,{type:`button`,class:B(l(`default`,`small`,!0),`mh-map__button`),"aria-label":e,title:e,onClick:()=>n()},H(t)),w=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);w.setAttribute(`viewBox`,`0 0 24 24`),w.setAttribute(`class`,`mh-map__needle`),w.setAttribute(`aria-hidden`,`true`);for(let[e,t]of[[Qw,`mh-map__needle-north`],[$w,`mh-map__needle-south`]]){let n=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);n.setAttribute(`d`,e),n.setAttribute(`class`,t),w.append(n)}let T=t.compass===!1?null:M(`button`,{type:`button`,class:B(l(`default`,`small`,!0),`mh-map__button`,`mh-map__compass`)},w);T?.addEventListener(`click`,()=>F({bearing:0}));let E=t.controls===!1&&!T?null:M(`div`,{class:`mh-map__controls`},t.controls===!1?null:C(n.zoomIn,vt,()=>se(1)),t.controls===!1?null:C(n.zoomOut,ce,()=>se(-1)),t.controls===!1?null:C(n.recentre,b,()=>le()),T);e.classList.add(`mh-map`),e.tabIndex=0,e.setAttribute(`role`,`region`),e.setAttribute(`aria-roledescription`,n.roleDescription),e.setAttribute(`aria-describedby`,f),e.style.aspectRatio=String(t.aspect&&t.aspect>0?t.aspect:jw),e.replaceChildren(...[h,g,_,E,x,v,S].filter(e=>e!==null));let D={width:0,height:0,tileSize:r},O=()=>{let n=e.clientWidth,i=e.clientHeight,a=n||320;return{width:a,height:i||a/(t.aspect&&t.aspect>0?t.aspect:1.6),tileSize:r}};D=O();let k=()=>{if(t.center)return{lat:t.center.lat,lon:t.center.lon,zoom:t.zoom??14,bearing:t.bearing??0};let e=Uw(d,D,48,Math.min(a,17));return{...e,zoom:q(t.zoom??e.zoom,i,a),bearing:t.bearing??0}},A=k();A={...A,zoom:q(A.zoom,i,a),bearing:Hw(A.bearing)};let j=new Map,N=-1,ee=()=>{if(!u){for(let e of j.values())e.remove();j.clear();return}let e=Ww(A.zoom,o,s);N=e;let t=Gw(A,D,e),n=new Set(t.map(e=>e.key)),r=u;for(let e of t){let t=j.get(e.key);if(!t){t=M(`img`,{class:`mh-map__tile`,alt:``,draggable:`false`,decoding:`async`}),t.dataset.z=String(e.z),t.dataset.column=String(e.column),t.dataset.y=String(e.y);let n=t;n.addEventListener(`load`,()=>{n.classList.add(`is-loaded`),te()}),n.addEventListener(`error`,()=>{n.classList.add(`is-missing`),te()}),n.src=Pw(r,e.z,e.x,e.y),j.set(e.key,n),m.append(n)}}for(let[t,r]of j)n.has(t)||(Number(r.dataset.z)===e?(r.remove(),j.delete(t)):r.classList.add(`is-stale`));for(let e of j.values()){let t=Kw({z:Number(e.dataset.z),column:Number(e.dataset.column),y:Number(e.dataset.y)},A,D);e.style.transform=`translate(${t.left}px, ${t.top}px)`,e.style.width=`${t.size+.5}px`,e.style.height=`${t.size+.5}px`}te()};function te(){if(![...j.values()].filter(e=>Number(e.dataset.z)===N).some(e=>!e.classList.contains(`is-loaded`)&&!e.classList.contains(`is-missing`)))for(let[e,t]of j)Number(t.dataset.z)!==N&&(t.remove(),j.delete(e))}let P=()=>{let e=qw(A,r),t=lS(A.lat,A.lon),n=Nw(A.zoom,r),i=e.px,a=Math.hypot(D.width,D.height)/2+i,o=(-t.x*n%i+i)%i,s=(-t.y*n%i+i)%i;p.style.left=`${-a}px`,p.style.top=`${-a}px`,p.style.width=`${a*2}px`,p.style.height=`${a*2}px`,p.style.backgroundSize=`${i}px ${i}px`,p.style.backgroundPosition=`${(o+a)%i}px ${(s+a)%i}px`,x.style.width=`${e.px}px`,y.textContent=e.text},ne=()=>{let e=d.map((e,t)=>({m:e,i:t})).filter(({m:e})=>Number.isFinite(e.lat)&&Number.isFinite(e.lon));g.replaceChildren(...e.map(({m:e,i:n})=>{let r=Lw(e.lat,e.lon,A,D),i=e.label?.trim()||null,a=r.x>-24&&r.y>-24&&r.x<D.width+24&&r.y<D.height+24,o=[M(`span`,{class:`mh-map__pin`,"aria-hidden":`true`},e.icon?H(e.icon):null),i?M(`span`,{class:`mh-map__marker-label`},i):null],s=t.onMarkerSelect?M(`button`,{type:`button`,class:Yw(e.tone),"aria-label":i??`Place ${n+1}`},...o):M(`span`,{class:Yw(e.tone),"aria-hidden":`true`},...o);return s.style.left=`${Math.round(r.x*10)/10}px`,s.style.top=`${Math.round(r.y*10)/10}px`,s.hidden=!a,t.onMarkerSelect&&s.addEventListener(`click`,()=>t.onMarkerSelect(e,n)),s}))},re=()=>{if(h.style.transform=`rotate(${-A.bearing}deg)`,e.classList.toggle(`mh-map--no-tiles`,!u),_.hidden=!!u,v.hidden=!v.textContent,e.setAttribute(`aria-label`,Jw(t.label,d)),x.hidden=t.scale===!1,T){w.style.transform=`rotate(${-A.bearing}deg)`;let e=n.compass(A.bearing);T.setAttribute(`aria-label`,e),T.title=e,T.classList.toggle(`is-turned`,Math.abs(A.bearing)>.5)}P(),ee(),ne()},ie=!t.center,F=(e,n=!1)=>{n||(ie=!1);let r={...A,...e},o={lat:q(Number.isFinite(r.lat)?r.lat:0,-aS,aS),lon:Fw(Number.isFinite(r.lon)?r.lon:0),zoom:q(Number.isFinite(r.zoom)?r.zoom:i,i,a),bearing:c||e.bearing===0?Hw(r.bearing||0):A.bearing},s=o.lat!==A.lat||o.lon!==A.lon||o.zoom!==A.zoom||o.bearing!==A.bearing;A=o,re(),s&&t.onViewChange?.({...A})},ae=()=>({x:D.width/2,y:D.height/2}),oe=(e,t)=>F(zw(A,q(e,i,a),t,D));function se(e){oe(Math.round((A.zoom+e)*2)/2,ae())}function le(){F(d.length?{...Uw(d,D,48,Math.min(a,17)),bearing:0}:{...k(),bearing:0})}let ue=0,de=TC(e,{accept:e=>!e.target.closest(`button, a, .mh-map__controls, .mh-map__attribution`),onStart:()=>{ue=0,e.classList.add(`is-dragging`)},onEnd:()=>e.classList.remove(`is-dragging`),onPan:(e,t)=>F(Vw(A,-e,-t,D)),onPinch:(e,t,n)=>{let r=zw(A,q(A.zoom+Math.log2(e),i,a),t,D);c&&(ue+=n,Math.abs(ue)>12&&(r=Bw(r,n,t,D))),F(r)},onWheel:(e,t)=>{e.preventDefault(),oe(A.zoom+Math.log2(wC(e)),t)},onDoubleTap:e=>oe(Math.floor(A.zoom+1),e)}),fe=t=>{if(!(t.target!==e||t.altKey||t.ctrlKey||t.metaKey)){if(t.shiftKey&&c&&(t.key===`ArrowLeft`||t.key===`ArrowRight`))F(Bw(A,t.key===`ArrowLeft`?-15:15,ae(),D));else if(t.key===`ArrowLeft`)F(Vw(A,-64,0,D));else if(t.key===`ArrowRight`)F(Vw(A,Zw,0,D));else if(t.key===`ArrowUp`)F(Vw(A,0,-64,D));else if(t.key===`ArrowDown`)F(Vw(A,0,Zw,D));else if(t.key===`+`||t.key===`=`)se(1);else if(t.key===`-`||t.key===`_`)se(-1);else if(t.key===`n`||t.key===`N`)F({bearing:0});else return;t.preventDefault()}};e.addEventListener(`keydown`,fe);let pe=e=>{v.textContent=e??``};pe(t.attribution);let me=()=>{D=O(),ie?F(k(),!0):re()},he=typeof ResizeObserver==`function`?new ResizeObserver(()=>me()):null;return he?.observe(e),re(),{el:e,getView:()=>({...A}),setView:e=>F(e),setMarkers(e){d=e,re()},setTiles(e,t){u=e;for(let e of j.values())e.remove();j.clear(),t!==void 0&&pe(t),re()},zoomBy:se,recentre:le,layout:me,destroy(){de(),e.removeEventListener(`keydown`,fe),he?.disconnect()}}}var tT=(...e)=>M(`div`,{class:`ex-stack`},...e),nT=(...e)=>M(`div`,{class:`ex-row`},...e),rT=e=>C(e,{variant:`label`,tone:`muted`}),iT=(e=``)=>M(`span`,{class:`ex-meta`,"aria-live":`polite`},e),aT=e=>`data:image/svg+xml,${encodeURIComponent(e)}`;function oT(e,t,n){let r,i=()=>{clearInterval(r),r=void 0};return{start(){i(),r=setInterval(()=>e.isConnected?n():i(),t)},stop:i}}function sT(e,t){let n=e.theme.palette,r=n.series,i=t?r[4]:n.surfaceRaised,a=t?r[1]:n.surfacePressed,o=t?r[0]:n.textFaint;return aT(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='${i}'/><rect y='210' width='400' height='90' fill='${a}'/>${t?`<circle cx='250' cy='70' r='60' fill='${n.accentLight}' opacity='0.35'/>`:``}<rect x='60' y='60' width='110' height='80' fill='${n.input}' stroke='${n.outline}' stroke-width='6'/><path d='M60 140 L170 60' stroke='${n.divider}' stroke-width='3'/><rect x='70' y='165' width='190' height='60' rx='18' fill='${o}'/><rect x='70' y='145' width='190' height='35' rx='14' fill='${o}' opacity='0.8'/><rect x='244' y='96' width='12' height='130' fill='${n.textMuted}'/><path d='M226 96 h48 l-12 -30 h-24z' fill='${t?n.accent:n.textMuted}'/><rect x='300' y='180' width='60' height='46' fill='${n.surface}'/></svg>`)}function cT(e){let t=e.theme.palette,n=(e,n,r,i,a,o)=>`<rect x='${e}' y='${n}' width='${r}' height='${i}' fill='${o}' stroke='${t.text}' stroke-width='4'/><text x='${e+10}' y='${n+24}' font-family='sans-serif' font-size='18' fill='${t.text}'>${a}</text><text x='${e+10}' y='${n+40}' font-family='sans-serif' font-size='9' fill='${t.textMuted}'>${Math.round(r/40)} × ${Math.round(i/40)} m</text>`,r=t.series;return aT(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'><rect width='800' height='520' fill='${t.surface}'/>${n(20,20,320,260,`Living room`,t.surfaceRaised)}${n(340,20,220,180,`Kitchen`,t.input)}${n(560,20,220,180,`Study`,t.surfaceRaised)}${n(340,200,440,80,`Hall`,t.surfacePressed)}${n(20,280,260,220,`Bedroom`,t.input)}${n(280,280,200,220,`Bath`,t.surfaceRaised)}${n(480,280,300,220,`Workshop`,t.input)}<rect x='60' y='200' width='120' height='50' rx='10' fill='${r[0]}'/><circle cx='600' cy='120' r='26' fill='${r[2]}'/><rect x='60' y='330' width='120' height='90' rx='8' fill='${r[4]}'/><text x='66' y='440' font-family='sans-serif' font-size='7' fill='${t.textFaint}'>Bed: 1.6 m wide, window to the garden</text><rect x='520' y='330' width='200' height='22' fill='${r[1]}'/><text x='522' y='370' font-family='sans-serif' font-size='6' fill='${t.textFaint}'>Bench, tool wall above, sockets every 60 cm</text></svg>`)}function lT(e,t,n){let r=e.theme.palette.series,i=r[n%r.length];return aT(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 30'>${t===`sky`?`<rect width='40' height='30' fill='${i}'/>`:t===`hill`?`<path d='M0 30 Q20 6 40 30Z' fill='${i}'/>`:t===`tree`?`<rect x='18' y='18' width='4' height='10' fill='${e.theme.palette.textMuted}'/><circle cx='20' cy='14' r='9' fill='${i}'/>`:t===`sun`?`<circle cx='20' cy='15' r='9' fill='${i}'/>`:`<text x='5' y='21' font-family='sans-serif' font-size='14' font-weight='700' fill='${i}'>Aa</text>`}</svg>`)}function uT(e){let t=e.theme.palette,n=t.series;return(e,r,i)=>{let a=r*73856093^i*19349663^e*83492791,o=Math.abs(a)%5,s=o===0?`<rect x='40' y='50' width='120' height='90' rx='16' fill='${n[2]}' opacity='0.45'/>`:o===1?`<ellipse cx='170' cy='170' rx='55' ry='38' fill='${n[3]}' opacity='0.5'/>`:o===2?`<rect x='150' y='30' width='70' height='60' fill='${t.surfacePressed}'/><rect x='30' y='160' width='80' height='60' fill='${t.surfacePressed}'/>`:``;return aT(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><rect width='256' height='256' fill='${t.input}'/>${s}<path d='M0 128H256M128 0V256' stroke='${t.surfaceRaised}' stroke-width='6'/><path d='M0 0H256M0 0V256' stroke='${t.textFaint}' stroke-width='10' opacity='0.5'/><text x='8' y='248' font-family='monospace' font-size='12' fill='${t.textFaint}'>${e}/${r}/${i}</text></svg>`)}}var dT=[{id:`video`,name:`Video`,icon:`film`,clips:[{id:`v1`,start:0,end:7.5,label:`Morning garden`},{id:`v2`,start:7.5,end:15,label:`Kitchen`,tone:2},{id:`v3`,start:17,end:26,label:`Lanterns over the quay`,tone:3}]},{id:`titles`,name:`Titles`,clips:[{id:`t1`,start:1,end:5,label:`Our week`,tone:5}]},{id:`music`,name:`Music`,icon:`music`,locked:!0,clips:[{id:`m1`,start:0,end:28,label:`Quiet Harbour (locked)`,tone:4}]}],fT=e=>[{id:`title`,name:`Title`,thumbnail:lT(e,`text`,0)},{id:`scenery`,name:`Scenery`,children:[{id:`tree`,name:`Tree`,thumbnail:lT(e,`tree`,2)},{id:`sun`,name:`Sun`,thumbnail:lT(e,`sun`,4),visible:!1},{id:`hill`,name:`Hill`,thumbnail:lT(e,`hill`,1)}]},{id:`sky`,name:`Sky`,thumbnail:lT(e,`sky`,3),locked:!0},{id:`notes`,name:`Notes`,icon:`edit`,visible:!1}],pT=[{lat:51.0004,lon:7.0012,label:`Home`,icon:`home`},{lat:51.0042,lon:7.0091,label:`Workshop`,tone:`neutral`},{lat:50.9968,lon:7.0108,label:`Pier`}],mT=[{id:`media-timeline`,render:()=>{let e=3,t=!1,n=iT(`Drag clips to move them, their edges to trim; the music track is locked.`),r=tT(),i=oT(r,100,()=>{e=e+.1>=30?0:Math.round((e+.1)*10)/10,o.setPosition(e),a.setPosition(e)}),a=CC({label:`Playback`,duration:30,position:e,size:`small`,onPlayingChange:e=>{t=e,t?i.start():i.stop()},onSeek:t=>{e=t,o.setPosition(t)}}),o=FC({label:`Edit timeline`,duration:30,tracks:dT,position:e,zoom:40,selected:`v2`,onSeek:t=>{e=t,a.setPosition(t)},onClipChange:(e,t)=>{t&&(n.textContent=`${e.clipId}: ${rC(e.start,{decimals:1})} to ${rC(e.end,{decimals:1})}`)},onZoomChange:e=>s.setValue(e/40)}),s=mC({value:1,min:.25,max:8,size:`small`,presets:[.25,.5,1,2,4,8],onChange:e=>o.setZoom(e*40),onFit:()=>{let e=Math.max(.25,(o.el.clientWidth-160)/30/40);s.setValue(e),o.setZoom(e*40)}}),c=L({label:`Snap`,checked:!0,onChange:e=>o.setSnap(e)});return r.append(rT(`Ruler, three tracks of clips, the playhead and snapping to edges, the playhead and the grid. Ctrl or ⌘ + wheel zooms.`),nT(a.el,s.el,c.el),o.el,n),r}},{id:`transport`,render:()=>{let e=tT(),t=41,n=CC({label:`Playback`,duration:222,position:t,loop:!1,onPlayingChange:e=>e?r.start():r.stop(),onSeek:e=>t=e}),r=oT(e,1e3,()=>{t=t+1>222?0:t+1,n.setPosition(t)});return e.append(rT(`Play / pause, step, skip to the ends, loop and the timecode (press play)`),n.el,rT(`Frame-accurate at 25 fps, small`),CC({label:`Clip playback`,fps:25,duration:12.4,position:3.48,size:`small`}).el,rT(`Large, for a TV: no step buttons`),CC({label:`Film`,steps:!1,duration:5400,position:1830,size:`large`,playing:!0,loop:!0}).el,rT(`Disabled, no duration known yet`),CC({label:`Stream`,disabled:!0,skip:!1}).el),e}},{id:`layers-panel`,render:e=>{let t=iT(`Up / Down on a grip moves its layer.`),n=GC({label:`Layers`,layers:fT(e),selected:`tree`,onSelect:e=>t.textContent=`Selected ${e}`,onVisibleChange:(e,n)=>t.textContent=`${e} ${n?`shown`:`hidden`}`,onLockedChange:(e,n)=>t.textContent=`${e} ${n?`locked`:`unlocked`}`,onReorder:(e,n,r)=>t.textContent=`${e} moved to ${r+1}${n?` in ${n}`:``}`});return n.el.style.maxWidth=`22rem`,tT(rT(`Front-most first: thumbnails, a group, a hidden layer (and one hidden with its group), a locked layer; drag the grips to reorder`),n.el,t)}},{id:`zoom-control`,render:()=>{let e=iT(`100%`),t=mC({value:1,onChange:n=>{e.textContent=`${Math.round(n*100)}%`,t.setFitted(!1)},onFit:()=>{e.textContent=`Fitted (63%)`,t.setValue(.63),t.setFitted(!0)}});return tT(rT(`− / preset / + with Fit; a level that is not a preset joins the list`),nT(t.el,e),rT(`Small, without Fit, at the top of its range`),mC({value:4,max:4,size:`small`,showFit:!1}).el,rT(`Disabled`),mC({value:1.5,disabled:!0}).el)}},{id:`transform-fields`,render:e=>{let t={x:40,y:30,width:120,height:80,angle:12},n=`top-left`,r=e.theme.palette,i=M(`div`,{style:`position:absolute; border:2px solid ${r.accent}; background:${r.accentLight}33; transform-origin: center`}),a=M(`div`,{style:`position:absolute; width:8px; height:8px; margin:-4px 0 0 -4px; border-radius:50%; background:${r.accent}`}),o=M(`div`,{style:`position:relative; width:280px; height:200px; overflow:hidden; border-radius:var(--mh-radius-md); background:var(--mh-input)`},i,a),s=()=>{let{fx:e,fy:r}=QC(n);Object.assign(i.style,{left:`${t.x}px`,top:`${t.y}px`,width:`${t.width}px`,height:`${t.height}px`,transform:`rotate(${t.angle}deg)`}),Object.assign(a.style,{left:`${t.x+e*t.width}px`,top:`${t.y+r*t.height}px`})},c=rw({value:t,onChange:e=>{t=e,s()},onReferenceChange:e=>{n=e,s()}});return c.el.style.maxWidth=`22rem`,s(),tT(rT(`X and Y follow the reference point; resizing keeps it still. Up / Down step (Shift for ten); drag a field’s letter to scrub.`),c.el,o,rT(`Disabled, in millimetres, proportions kept`),rw({value:{x:0,y:0,width:210,height:297,angle:0},unit:`mm`,lockAspect:!0,reference:`center`,disabled:!0}).el)}},{id:`inspector`,render:()=>{let e=iT(),t=dw({label:`Clip properties`,onChange:(t,n,r)=>r&&(e.textContent=`${t}: ${String(n)}`),onKeyframe:(t,n)=>e.textContent=`${t}: keyframe ${n?`added`:`removed`}`,sections:[{id:`transform`,title:`Transform`,params:[{id:`scale`,kind:`slider`,label:`Scale`,value:100,max:400,unit:`%`,keyframe:`on`},{id:`rotation`,kind:`slider`,label:`Rotation`,value:0,min:-180,max:180,unit:`°`,keyframe:`animated`},{id:`opacity`,kind:`slider`,label:`Opacity`,value:85,unit:`%`,keyframe:`off`}]},{id:`look`,title:`Look`,params:[{id:`blend`,kind:`choice`,label:`Blend`,value:`normal`,options:[{value:`normal`,label:`Normal`},{value:`screen`,label:`Screen`},{value:`multiply`,label:`Multiply`}]},{id:`blur`,kind:`slider`,label:`Blur`,value:2.5,max:20,step:.5,unit:`px`,keyframe:`off`},{id:`shadow`,kind:`toggle`,label:`Drop shadow`,value:!0},{id:`grain`,kind:`slider`,label:`Film grain`,value:0,disabled:!0,keyframe:`off`}]},{id:`audio`,title:`Audio`,open:!1,params:[{id:`volume`,kind:`slider`,label:`Volume`,value:-6,min:-60,max:6,unit:`dB`,keyframe:`off`}]}]});return t.el.style.maxWidth=`26rem`,tT(rT(`Sections open and close; the diamonds add or remove a keyframe (half-filled: keyed elsewhere)`),t.el,e)}},{id:`compare-slider`,render:e=>tT(rT(`Drag anywhere, or focus and use the arrow keys`),vw({label:`Compare the lighting scene`,before:{src:sT(e,!1),alt:`Sitting room with the lights off`},after:{src:sT(e,!0),alt:`Sitting room with the evening scene on`},beforeLabel:`Off`,afterLabel:`Evening`,value:45}).el,rT(`Split top / bottom`),vw({label:`Compare`,before:{src:sT(e,!0),alt:`With the scene`},after:{src:sT(e,!1),alt:`Without the scene`},orientation:`vertical`,aspect:16/9,value:60}).el)},{id:`zoomable-image`,render:e=>tT(rT(`Pinch, scroll or double-tap to zoom, drag to pan; focus it for + / − / arrows / 0. The small print only reads zoomed in.`),Ow({src:cT(e),alt:`Floor plan of an invented flat`,controls:!0,aspect:16/10}).el,rT(`Without controls, square frame, up to 8×`),Ow({src:sT(e,!0),alt:`Sitting room`,maxScale:8,aspect:1}).el)},{id:`map`,render:e=>{let t=iT(`Places are buttons here.`),n=uT(e);return tT(rT(`Tiles from a caller-supplied source (stand-in tiles drawn on the spot: nothing is fetched), markers, zoom, recentre and compass. Twist with two fingers, or Shift + arrows, to turn.`),Xw({label:`Around the house`,tiles:n,attribution:`Stand-in tiles`,markers:pT,onMarkerSelect:e=>t.textContent=`${e.label??`Place`} selected`}).el,t,rT(`Turned 30°: the compass points north and resets on press`),Xw({label:`Turned map`,tiles:n,attribution:`Stand-in tiles`,center:{lat:51.0004,lon:7.0012},zoom:15.5,bearing:30,markers:pT.slice(0,1),aspect:2}).el,rT(`No tile source set: a themed grid that still pans and zooms, and a notice`),Xw({label:`Map without tiles`,markers:pT,aspect:2}).el)}}],hT=(...e)=>M(`div`,{class:`ex-stack`},...e),gT=e=>C(e,{variant:`label`,tone:`muted`}),_T={name:`Willow Green`,tone:`accent`,rings:[[[7,51],[7.008,51.0005],[7.0095,51.0035],[7.006,51.0052],[7.0005,51.0045],[7,51]],[[7.0035,51.0018],[7.0058,51.002],[7.0055,51.0032],[7.0038,51.003],[7.0035,51.0018]]]},vT={name:`Home`,tone:`muted`,circle:{lat:50.9965,lon:6.9935,radius:150}},yT={name:`Morning walk`,tone:`accent`,open:!0,rings:[[[6.9938,50.9966],[6.9962,50.9978],[6.9975,50.9991],[6.9992,50.9997],[7.0012,51.0012],[7.0026,51.0039]]]},bT={lat:51.0039,lon:7.0026,label:`Sam`,accuracy:40},xT={lat:50.9965,lon:6.9935,label:`Kai`,tone:`neutral`},ST={name:`Workshop`,tone:`muted`,circle:{lat:51.03,lon:7.06,radius:200}},CT=[`<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>`,`<rect width='256' height='256' fill='#efece6'/>`,`<path d='M0 96H256M0 200H256M72 0V256M180 0V256' stroke='#ffffff' stroke-width='10'/>`,`<path d='M0 0H256V256' fill='none' stroke='#d6d1c8' stroke-width='1'/>`,`<text x='8' y='20' font-family='sans-serif' font-size='13' fill='#9a948a'>{z}/{x}/{y}</text>`,`</svg>`].join(``),wT={url:`data:image/svg+xml,${encodeURIComponent(CT).replace(/%7B(z|x|y)%7D/g,`{$1}`)}`,attribution:`Placeholder tiles · an app passes its tile server and credit`,maxZoom:19},TT=[{id:`geo-map`,render:()=>hT(gT(`A park with a pond (accent area with a hole), a home zone (muted circle), a route and a person with accuracy`),tC({label:`Where Sam is`,points:[bT,xT],shapes:[vT,_T,yT]}).el,gT(`Fit to focus: the park and Sam; muted zones only as context, a far-away one left out`),tC({label:`Sam in the park`,points:[bT],shapes:[vT,ST,_T],fit:`focus`,aspect:4/3}).el,gT(`A single place: the view keeps a minimum span`),tC({label:`Phone location`,points:[{lat:51,lon:7,label:`Phone`,accuracy:15}],shapes:[],aspect:2}).el,gT(`With a tile layer (placeholder tiles here, toned down in dark themes) and the required credit`),tC({label:`Where Sam is`,points:[bT,xT],shapes:[vT,_T,yT],tiles:wT}).el,gT(`Nothing to show`),tC({label:`Map`,points:[],shapes:[],aspect:3}).el)}];TT.push(...mT);function ET(e=`medium`,t=!0){return B(`mh-screen`,t&&`mh-canvas`,e!==`medium`&&`mh-screen--${e}`)}function DT(e={},...t){let n=M(`main`,{class:`mh-screen__main`,"aria-label":e.label},...t);return{el:M(`div`,{class:ET(e.width,e.canvas??!0)},M(`div`,{class:`mh-screen__column`},e.header?M(`header`,{class:`mh-screen__header`},e.header):null,n)),main:n}}function OT(e=`auto`,t=!0,n=!0){return B(`mh-app-shell`,t&&`mh-canvas`,`mh-app-shell--nav-${e}`,n&&`mh-app-shell--fixed`)}function kT(e,...t){let n=M(`h1`,{class:`mh-app-shell__title`},e.title),r=M(`p`,{class:`mh-app-shell__subtitle`,hidden:!e.subtitle},e.subtitle??``),i=M(`header`,{class:`mh-app-shell__bar`},e.leading?M(`div`,{class:`mh-app-shell__leading`},e.leading):null,M(`div`,{class:`mh-app-shell__titles`},n,r),e.actions?.length?M(`div`,{class:`mh-app-shell__actions`},...e.actions):null),a=DT({canvas:!1,width:e.width??`wide`,label:e.label},...t),o=M(`div`,{class:`mh-app-shell__content`},a.el),s=M(`div`,{class:`mh-app-shell__body`},e.nav?M(`div`,{class:`mh-app-shell__nav`},e.nav):null,o);return{el:M(`div`,{class:OT(e.navPosition,e.canvas??!0,e.fixed??!0)},i,s,e.status?M(`div`,{class:`mh-app-shell__status`},e.status):null),main:a.main,content:o,setTitle:e=>{n.textContent=e},setSubtitle:e=>{r.textContent=e,r.hidden=!e}}}var AT={label:`Introduction`,next:`Next`,back:`Back`,done:`Get started`,skip:`Skip`,step:(e,t)=>`Step ${e} of ${t}`};function jT(e,t){return Math.max(0,Math.min(t-1,Math.round(e)))}var MT=48;function NT(e,t,n,r=!1){return n===`mouse`||Math.abs(e)<MT||Math.abs(e)<Math.abs(t)*1.5?0:(r?e>0:e<0)?1:-1}function PT(e){return B(`mh-onboarding__media`,e&&`mh-onboarding__media--icon`)}function FT(e){let t={...AT,...e.labels},n=e.steps.length,r=I(`mh-onboarding`),i=jT(e.step??0,n),a=e.steps.map((i,a)=>{let o=i.media??(i.icon?H(i.icon):null),s=M(`div`,{class:`mh-onboarding__step`,role:`group`,"aria-label":t.step(a+1,n),id:`${r}-step-${a}`},o?M(`div`,{class:PT(!i.media)},o):null,M(`h${e.headingLevel??2}`,{class:`mh-onboarding__title`},i.title),i.text?M(`p`,{class:`mh-onboarding__text`},i.text):null);return i.content!==void 0&&it(s,M(`div`,{class:`mh-onboarding__content`},...Array.isArray(i.content)?i.content:[i.content])),s}),o=M(`div`,{class:`mh-onboarding__steps`},...a),s=M(`div`,{class:`mh-onboarding__live mh-visually-hidden`,"aria-live":`polite`}),c=e.skippable===!1?null:M(`button`,{type:`button`,class:B(z(`text`,`small`),`mh-onboarding__skip`)},M(`span`,{class:`mh-button__label`},t.skip)),l=M(`button`,{type:`button`,class:B(z(`text`),`mh-onboarding__back`)},M(`span`,{class:`mh-button__label`},t.back)),u=M(`span`,{class:`mh-button__label`},t.next),d=M(`button`,{type:`button`,class:B(z(`primary`),`mh-onboarding__next`)},u),f=e.steps.map(()=>M(`li`,{class:`mh-onboarding__dot`})),p=M(`section`,{class:`mh-onboarding`,"aria-label":t.label},c?M(`div`,{class:`mh-onboarding__top`},c):null,o,s,M(`div`,{class:`mh-onboarding__footer`},l,M(`ol`,{class:`mh-onboarding__dots`,"aria-hidden":`true`},...f),d)),m=()=>{a.forEach((e,t)=>e.hidden=t!==i),f.forEach((e,t)=>{e.classList.toggle(`is-current`,t===i),e.classList.toggle(`is-done`,t<i)}),l.hidden=i===0,u.textContent=i===n-1?t.done:t.next},h=(r,a)=>{let o=jT(r,n);if(o===i)return;let c=document.activeElement===l;i=o,m(),c&&l.hidden&&d.focus(),s.textContent=`${t.step(i+1,n)}: ${e.steps[i].title}`,a&&e.onStepChange?.(i)},g=()=>{i===n-1?e.onDone?.():h(i+1,!0)};d.addEventListener(`click`,g),l.addEventListener(`click`,()=>h(i-1,!0)),c?.addEventListener(`click`,()=>e.onSkip?.()),p.addEventListener(`keydown`,e=>{if(e.target.closest(`input, textarea, select, [contenteditable="true"], [role="slider"]`))return;let t=getComputedStyle(p).direction===`rtl`;if(e.key===(t?`ArrowLeft`:`ArrowRight`)&&i<n-1)h(i+1,!0);else if(e.key===(t?`ArrowRight`:`ArrowLeft`)&&i>0)h(i-1,!0);else return;e.preventDefault()});let _=null;return o.addEventListener(`pointerdown`,e=>_={x:e.clientX,y:e.clientY,type:e.pointerType}),o.addEventListener(`pointerup`,e=>{if(!_)return;let t=NT(e.clientX-_.x,e.clientY-_.y,_.type,getComputedStyle(p).direction===`rtl`);_=null,t&&h(i+t,!0)}),o.addEventListener(`pointercancel`,()=>_=null),m(),{el:p,step:()=>i,setStep:e=>h(e,!1),next:g,back:()=>h(i-1,!0)}}function IT(e=`tool`,t=!1,n=!1){return B(`mh-panel`,e===`section`&&`mh-panel--section`,t&&`mh-panel--collapsible`,n&&`mh-panel--flush`)}var LT=e=>Array.isArray(e)?e:e===void 0?[]:[e];function RT(e){let t=I(`mh-panel`),n=e.collapsible??!1,r=!n||(e.open??!0),i=M(`span`,{class:`mh-panel__title`,id:`${t}-title`},e.title),a=[e.icon?H(e.icon,{class:`mh-panel__icon`}):null,i],o=n?M(`button`,{type:`button`,class:`mh-panel__toggle`,"aria-controls":`${t}-body`},...a,H(Yn,{class:`mh-panel__chevron`})):null,s=M(`h${e.headingLevel??3}`,{class:`mh-panel__heading`},...o?[o]:a),c=M(`div`,{class:`mh-panel__header`},M(`div`,{class:`mh-panel__titles`},s,e.description?M(`p`,{class:`mh-panel__description`},e.description):null),e.actions?.length?M(`div`,{class:`mh-panel__actions`},...e.actions):null),l=M(`div`,{class:`mh-panel__body`,id:`${t}-body`});it(l,...LT(e.body));let u=e.footer===void 0?null:M(`div`,{class:`mh-panel__footer`},...LT(e.footer)),d=M(`section`,{class:IT(e.variant,n,e.flush),"aria-labelledby":`${t}-title`},c,l,u),f=()=>{o?.setAttribute(`aria-expanded`,String(r)),d.classList.toggle(`is-collapsed`,!r),l.hidden=!r,u&&(u.hidden=!r)},p=(t,i)=>{n&&t!==r&&(r=t,f(),i&&e.onToggle?.(r))};return o?.addEventListener(`click`,()=>p(!r,!0)),f(),{el:d,body:l,open:()=>r,setOpen:e=>p(e,!1),setTitle:e=>{i.textContent=e}}}function zT(e=!1){return B(`mh-panel-group`,e&&`mh-panel-group--flush`)}function BT(e,t){return e.find(e=>e.id===t&&!e.disabled)?.id??e.find(e=>!e.disabled)?.id??``}function VT(e,t,n){let r=e.map((e,t)=>e.disabled?-1:t).filter(e=>e>=0);if(r.length===0)return null;let i=Math.max(0,r.indexOf(t));return n===`ArrowRight`||n===`ArrowDown`?r[(i+1)%r.length]:n===`ArrowLeft`||n===`ArrowUp`?r[(i-1+r.length)%r.length]:n===`Home`?r[0]:n===`End`?r[r.length-1]:null}var HT=e=>Array.isArray(e)?e:e===void 0?[]:[e];function UT(e){let t=I(`mh-panel-group`),n=M(`div`,{class:`mh-panel-group__tabs`,role:`tablist`,"aria-label":e.label}),r=[],i=[],a=BT(e.panels,e.value),o=!!(e.collapsible&&e.collapsed),s=e.collapsible?M(`button`,{type:`button`,class:`mh-panel-group__fold`,"aria-controls":e.panels.map((e,n)=>`${t}-panel-${n}`).join(` `)},H(Yn)):null,c=e.actions?.length||s?M(`div`,{class:`mh-panel-group__actions`},...e.actions??[],s):null,l=M(`div`,{class:zT(e.flush)},M(`div`,{class:`mh-panel-group__bar`},n,c));e.panels.forEach((e,a)=>{let o=`${t}-tab-${a}`,s=`${t}-panel-${a}`,c=M(`button`,{type:`button`,class:`mh-panel-group__tab`,role:`tab`,id:o,"aria-controls":s,disabled:e.disabled??!1},e.icon?H(e.icon):null,M(`span`,{class:`mh-panel-group__label`},e.label),e.badge===void 0?null:M(`span`,{class:`mh-panel-group__badge`},String(e.badge)));c.addEventListener(`click`,()=>{d(e.id,!0),f(!1,!0)}),r.push(c),n.append(c);let u=M(`div`,{class:`mh-panel-group__panel`,role:`tabpanel`,id:s,"aria-labelledby":o,tabindex:0});it(u,...HT(e.content)),i.push(u),l.append(u)});function u(){if(e.panels.forEach((e,t)=>{let n=e.id===a;r[t].setAttribute(`aria-selected`,String(n)),r[t].tabIndex=n?0:-1,i[t].hidden=!n||o}),l.classList.toggle(`is-collapsed`,o),s){let t=o?e.expandLabel??`Expand panels`:e.collapseLabel??`Collapse panels`;s.setAttribute(`aria-expanded`,String(!o)),s.setAttribute(`aria-label`,t),s.title=t}}function d(t,n){let r=BT(e.panels,t);r!==a&&(a=r,u(),n&&e.onChange?.(a))}function f(t,n){e.collapsible&&t!==o&&(o=t,u(),n&&e.onCollapse?.(o))}return s?.addEventListener(`click`,()=>f(!o,!0)),n.addEventListener(`keydown`,t=>{let n=r.indexOf(t.target);if(n<0)return;let i=VT(e.panels,n,t.key);i!==null&&(t.preventDefault(),r[i].focus(),d(e.panels[i].id,!0))}),u(),{el:l,value:()=>a,setValue:e=>d(e,!1),collapsed:()=>o,setCollapsed:e=>f(e,!1)}}var WT={instructions:`Press Space to pick up. Use the up and down arrows to move, Space to drop, Escape to cancel.`,handle:e=>`Reorder ${e}`,grabbed:(e,t,n)=>`${e} picked up, position ${t} of ${n}.`,moved:(e,t,n)=>`${e} moved to position ${t} of ${n}.`,dropped:(e,t,n)=>`${e} dropped at position ${t} of ${n}.`,cancelled:(e,t,n)=>`Reorder cancelled. ${e} is back at position ${t} of ${n}.`};function GT(e,t,n){let r=e.slice(),[i]=r.splice(t,1);return i!==void 0&&r.splice(Math.max(0,Math.min(r.length,n)),0,i),r}function KT(e,t,n){let r=t;for(let i=t+1;i<e.length&&n>e[i];i++)r=i;for(let i=t-1;i>=0&&n<e[i];i--)r=i;return r}function qT(e,t){let n=()=>({...WT,...t.messages}),r=e.querySelector(`:scope > .mh-reorder__list`),i=e.querySelector(`:scope > .mh-reorder__live`),a=()=>Array.from(r.children).filter(e=>e.classList.contains(`mh-reorder__item`)),o=e=>e.querySelector(`.mh-reorder__label`)?.textContent??``,s=e=>a().find(t=>t.dataset.id===e),c=e=>{i.textContent=e},l=null,u=(e,t)=>{e&&(e.classList.toggle(`is-grabbed`,t),e.querySelector(`.mh-reorder__handle`)?.setAttribute(`aria-pressed`,String(t)))},d=()=>{if(!l)return;let e=s(l.id)?.querySelector(`.mh-reorder__handle`);e&&document.activeElement!==e&&e.focus({preventScroll:!1}),e&&u(s(l.id),!0)},f=(e,n)=>{t.onMove(e,n),d(),queueMicrotask(d)},p=e=>{if(!l)return;let t=l,r=a(),i=r.findIndex(e=>e.dataset.id===t.id),d=r[i];e&&i!==t.origin&&i>=0&&f(i,t.origin),l=null,u(s(t.id),!1),d&&c((e?n().cancelled:n().dropped)(o(d),(e?t.origin:i)+1,r.length))},m=e=>{let t=e.target.closest?.(`.mh-reorder__handle`);if(!t||!r.contains(t))return;let i=t.closest(`.mh-reorder__item`),s=a(),d=s.indexOf(i),m=e.key===` `||e.key===`Enter`;if(!l||l.id!==i.dataset.id){if(!m)return;e.preventDefault(),l&&p(!1),l={id:i.dataset.id??``,origin:d},u(i,!0),c(n().grabbed(o(i),d+1,s.length));return}let h=null;if(e.key===`ArrowUp`)h=Math.max(0,d-1);else if(e.key===`ArrowDown`)h=Math.min(s.length-1,d+1);else if(e.key===`Home`)h=0;else if(e.key===`End`)h=s.length-1;else if(m||e.key===`Escape`){e.preventDefault(),p(e.key===`Escape`);return}h!==null&&(e.preventDefault(),h!==d&&f(d,h),c(n().moved(o(i),h+1,s.length)))},h=e=>{e.key===` `&&e.target.closest?.(`.mh-reorder__handle`)&&e.preventDefault()},g=()=>{l&&requestAnimationFrame(()=>{if(!l)return;let e=s(l.id)?.querySelector(`.mh-reorder__handle`);document.activeElement!==e&&p(!1)})},_=null,v=t=>{let n=t.target.closest?.(`.mh-reorder__handle`);if(!n||!r.contains(n)||t.button!==0||_)return;l&&p(!1);let i=a(),o=n.closest(`.mh-reorder__item`),s=i.indexOf(o),c=i.map(e=>e.getBoundingClientRect()),u=c[s],d=c[s+1]??c[s-1],f=d?Math.max(0,d.top>u.top?d.top-u.bottom:u.top-d.bottom):0;t.preventDefault(),n.setPointerCapture?.(t.pointerId),_={pointer:t.pointerId,row:o,from:s,to:s,startY:t.clientY,mids:c.map(e=>e.top+e.height/2),others:i,step:u.height+f},e.classList.add(`is-sorting`),o.classList.add(`is-dragging`)},y=e=>{if(!_||e.pointerId!==_.pointer)return;let t=e.clientY-_.startY;_.row.style.transform=`translateY(${t}px)`,_.to=KT(_.mids,_.from,_.mids[_.from]+t),_.others.forEach((e,t)=>{if(e===_.row)return;let n=_.from<t&&t<=_.to?-_.step:_.to<=t&&t<_.from?_.step:0;e.style.transform=n?`translateY(${n}px)`:``})},b=(r,i)=>{if(!_||r.pointerId!==_.pointer)return;let{row:a,from:s,to:l,others:u}=_;_=null,e.classList.remove(`is-sorting`),a.classList.remove(`is-dragging`);for(let e of u)e.style.transform=``;i&&l!==s&&(t.onMove(s,l),c(n().dropped(o(a),l+1,u.length)))},x=e=>b(e,!0),S=e=>b(e,!1);return e.addEventListener(`keydown`,m),e.addEventListener(`keyup`,h),e.addEventListener(`focusout`,g),e.addEventListener(`pointerdown`,v),e.addEventListener(`pointermove`,y),e.addEventListener(`pointerup`,x),e.addEventListener(`pointercancel`,S),{destroy:()=>{e.removeEventListener(`keydown`,m),e.removeEventListener(`keyup`,h),e.removeEventListener(`focusout`,g),e.removeEventListener(`pointerdown`,v),e.removeEventListener(`pointermove`,y),e.removeEventListener(`pointerup`,x),e.removeEventListener(`pointercancel`,S)}}}function JT(e,t,n={}){let r={...WT,...n};return M(`li`,{class:`mh-reorder__item`,"data-id":e.id},M(`button`,{type:`button`,class:`mh-reorder__handle`,"aria-label":r.handle(e.label),"aria-describedby":t,"aria-pressed":`false`},H(ye)),e.icon?H(e.icon,{class:`mh-reorder__icon`}):null,M(`div`,{class:`mh-reorder__text`},M(`span`,{class:`mh-reorder__label`},e.label),e.description?M(`span`,{class:`mh-reorder__description`},e.description):null),e.trailing?M(`div`,{class:`mh-reorder__trailing`},e.trailing):null)}function YT(e){let t=I(`mh-reorder`),n={...WT,...e.messages},r=M(`ul`,{class:`mh-reorder__list`,"aria-label":e.label}),i=M(`div`,{class:`mh-reorder`},M(`p`,{class:`mh-visually-hidden`,id:t},n.instructions),r,M(`div`,{class:`mh-reorder__live mh-visually-hidden`,"aria-live":`assertive`,"aria-atomic":`true`})),a=()=>Array.from(r.children).map(e=>e.dataset.id??``),o=n=>{r.replaceChildren(...n.map(n=>JT(n,t,e.messages)))};return o(e.items),{el:i,order:a,setItems:o,...qT(i,{messages:e.messages,onMove:(t,n)=>{let i=Array.from(r.children),o=i[t];o&&t!==n&&(i.splice(t,1),r.insertBefore(o,i[n]??null),e.onChange?.(a()))}})}}function XT(e={}){let t=e.size??`medium`;return B(`mh-scroll-panel`,t!==`medium`&&`mh-scroll-panel--${t===`small`?`sm`:t===`large`?`lg`:`fill`}`,e.axis===`x`&&`mh-scroll-panel--x`,e.shadows===!1&&`mh-scroll-panel--plain`,e.inset&&`mh-scroll-panel--inset`)}function ZT(e,t,n){let r=Math.abs(e);return{start:r>1,end:r+t<n-1}}function QT(e){let t=e.querySelector(`:scope > .mh-scroll-panel__viewport`),n=e.classList.contains(`mh-scroll-panel--x`),r=()=>{let r=n?ZT(t.scrollLeft,t.clientWidth,t.scrollWidth):ZT(t.scrollTop,t.clientHeight,t.scrollHeight);e.classList.toggle(`is-overflow-start`,r.start),e.classList.toggle(`is-overflow-end`,r.end)};t.addEventListener(`scroll`,r,{passive:!0});let i=typeof ResizeObserver==`function`?new ResizeObserver(r):null;i?.observe(t);let a=typeof MutationObserver==`function`?new MutationObserver(r):null;return a?.observe(t,{childList:!0,subtree:!0}),r(),{update:r,destroy:()=>{t.removeEventListener(`scroll`,r),i?.disconnect(),a?.disconnect()}}}function $T(e,...t){let n=M(`div`,{class:`mh-scroll-panel__viewport`,role:`region`,"aria-label":e.label,tabindex:0},...t),r=M(`div`,{class:XT(e)},n),i=QT(r),a=e.axis===`x`;return{el:r,viewport:n,...i,scrollToStart:()=>n.scrollTo(a?{left:0}:{top:0}),scrollToEnd:()=>n.scrollTo(a?{left:n.scrollWidth}:{top:n.scrollHeight})}}function eE(e=`horizontal`,t){return B(`mh-split`,e===`vertical`&&`mh-split--vertical`,t&&`mh-split--collapse-${t}`)}function tE(e=`horizontal`){return e===`vertical`?`horizontal`:`vertical`}function nE(e,t=20,n=80){return Math.round(Math.min(n,Math.max(t,e))*10)/10}function rE(e){return[e.collapsible===`start`?0:e.min??20,e.collapsible===`end`?100:e.max??80]}function iE(e,t,n){return!t||!n?e:n===`start`?0:100}var aE=e=>Array.isArray(e)?e:e===void 0?[]:[e];function oE(e,t={}){let n=t.min??20,r=t.max??80,i=t.step??5,a=t.orientation===`vertical`,o=e.querySelector(`:scope > .mh-split__handle`),s=e.querySelector(`:scope > .mh-split__pane--start`),c=e.querySelector(`:scope > .mh-split__pane--end`),l=nE(t.size??50,n,r),u=!!(t.collapsible&&t.collapsed),d=()=>{e.style.setProperty(`--_size`,`${l}%`),e.classList.toggle(`is-collapsed`,u),s.hidden=u&&t.collapsible===`start`,c.hidden=u&&t.collapsible===`end`,o.setAttribute(`aria-valuenow`,String(iE(l,u,t.collapsible)))},f=(e,i)=>{let a=nE(e,n,r),o=u;(a!==l||o)&&(l=a,o&&(u=!1),d(),i&&(o&&t.onCollapse?.(!1),t.onResize?.(l)))},p=(e,n)=>{t.collapsible&&e!==u&&(u=e,d(),n&&t.onCollapse?.(u))},m=()=>!a&&getComputedStyle(e).direction===`rtl`,h=e=>{let o=a?`ArrowUp`:m()?`ArrowRight`:`ArrowLeft`,s=a?`ArrowDown`:m()?`ArrowLeft`:`ArrowRight`,c=u?iE(l,!0,t.collapsible):l,d=null;if(e.key===o)d=c-i;else if(e.key===s)d=c+i;else if(e.key===`PageUp`)d=c-i*4;else if(e.key===`PageDown`)d=c+i*4;else if(e.key===`Home`)d=n;else if(e.key===`End`)d=r;else if(e.key===`Enter`&&t.collapsible){e.preventDefault(),p(!u,!0);return}d!==null&&(e.preventDefault(),!(u&&(t.collapsible===`start`?d<=c:d>=c))&&f(d,!0))},g=null,_=t=>{let n=e.getBoundingClientRect(),r=a?n.height:n.width;return r<=0?l:(a?t.clientY-n.top:m()?n.right-t.clientX:t.clientX-n.left)/r*100},v=t=>{t.button===0&&(t.preventDefault(),g=t.pointerId,o.setPointerCapture?.(t.pointerId),e.classList.add(`is-resizing`),o.focus({preventScroll:!0}))},y=e=>{if(g!==e.pointerId)return;let i=_(e);t.collapsible===`start`&&i<n/2||t.collapsible===`end`&&i>r+(100-r)/2?p(!0,!0):f(i,!0)},b=t=>{g===t.pointerId&&(g=null,o.releasePointerCapture?.(t.pointerId),e.classList.remove(`is-resizing`))},x=()=>p(!u,!0);return o.addEventListener(`keydown`,h),o.addEventListener(`pointerdown`,v),o.addEventListener(`pointermove`,y),o.addEventListener(`pointerup`,b),o.addEventListener(`pointercancel`,b),o.addEventListener(`dblclick`,x),d(),{size:()=>l,collapsed:()=>u,setSize:e=>{l=nE(e,n,r),d()},setCollapsed:e=>p(e,!1),destroy:()=>{o.removeEventListener(`keydown`,h),o.removeEventListener(`pointerdown`,v),o.removeEventListener(`pointermove`,y),o.removeEventListener(`pointerup`,b),o.removeEventListener(`pointercancel`,b),o.removeEventListener(`dblclick`,x)}}}function sE(e={}){let t=I(`mh-split`),n=M(`div`,{class:`mh-split__pane mh-split__pane--start`,id:`${t}-start`,role:e.startLabel?`region`:null,"aria-label":e.startLabel}),r=M(`div`,{class:`mh-split__pane mh-split__pane--end`,id:`${t}-end`,role:e.endLabel?`region`:null,"aria-label":e.endLabel});it(n,...aE(e.start)),it(r,...aE(e.end));let i=M(`div`,{class:`mh-split__handle`,role:`separator`,tabindex:0,"aria-orientation":tE(e.orientation),"aria-label":e.label??`Resize panes`,"aria-controls":`${t}-${e.collapsible===`end`?`end`:`start`}`,"aria-valuemin":rE(e)[0],"aria-valuemax":rE(e)[1]},M(`span`,{class:`mh-split__grip`,"aria-hidden":`true`})),a=M(`div`,{class:eE(e.orientation,e.collapsible)},n,i,r);return{el:a,startPane:n,endPane:r,...oE(a,e)}}function cE(e=!1){return B(`mh-status-bar`,e&&`mh-status-bar--sticky`)}function lE(e=`default`,t=!1){return B(`mh-status-bar__item`,e!=="default"&&`mh-status-bar__item--${e}`,t&&`mh-status-bar__item--interactive`)}function uE(e){return[e.icon?H(e.icon,{class:`mh-status-bar__icon`}):null,M(`span`,{class:`mh-status-bar__label`},e.label),e.value===void 0?null:M(`span`,{class:`mh-status-bar__value`},e.value)]}function dE(e){let t=M(`div`,{class:`mh-status-bar__start`}),n=M(`div`,{class:`mh-status-bar__end`}),r=M(`footer`,{class:cE(e.sticky),"aria-label":e.label??`Status`},t,n),i=new Map,a=new Map;for(let r of e.items){let e=r.onClick?M(`button`,{type:`button`,class:lE(r.tone,!0),title:r.title,"aria-live":r.announce?`polite`:null},...uE(r)):M(`span`,{class:lE(r.tone),title:r.title,"aria-live":r.announce?`polite`:null},...uE(r));r.onClick&&e.addEventListener(`click`,r.onClick),i.set(r.id,e),a.set(r.id,r),(r.end?n:t).append(e)}return{el:r,setItem(e,t){let n=i.get(e),r=a.get(e);if(!n||!r)return;let o={...r,...t};a.set(e,o),n.className=lE(o.tone,!!o.onClick),o.title?n.title=o.title:n.removeAttribute(`title`),n.replaceChildren(...uE(o).filter(e=>e!==null))}}}function fE(e=`default`){return B(`mh-swipe-row__action`,e!=="default"&&`mh-swipe-row__action--${e}`)}var pE=8,mE=.6;function hE(e,t,n,r,i=!1){return e>0&&t>0?i&&r>0&&e>r*mE?{side:`start`,run:!0}:{side:e>t/2?`start`:null,run:!1}:e<0&&n>0?i&&r>0&&-e>r*mE?{side:`end`,run:!0}:{side:-e>n/2?`end`:null,run:!1}:{side:null,run:!1}}function gE(e,t={}){let n=e.querySelector(`:scope > .mh-swipe-row__content`),r=n.querySelector(`.mh-swipe-row__more`),i={start:e.querySelector(`:scope > .mh-swipe-row__actions--start`),end:e.querySelector(`:scope > .mh-swipe-row__actions--end`)},a=()=>getComputedStyle(e).direction===`rtl`?-1:1,o=e=>i[e]?.offsetWidth??0,s=null,c=e=>{n.style.setProperty(`--_x`,`${e*a()}px`)},l=()=>{e.classList.toggle(`is-open-start`,s===`start`),e.classList.toggle(`is-open-end`,s===`end`);for(let e of[`start`,`end`])i[e]?.toggleAttribute(`inert`,s!==e);r?.setAttribute(`aria-expanded`,String(s!==null)),c(s===`start`?o(`start`):s===`end`?-o(`end`):0)},u=t=>{e.contains(t.target)||d(null)},d=e=>{(!e||i[e])&&(e===s?l():(s=e,l(),s?document.addEventListener(`pointerdown`,u,!0):document.removeEventListener(`pointerdown`,u,!0),t.onOpenChange?.(s)))},f=e=>{d(null),t.onAction?.(e)},p=t=>{let n=t.target,a=n.closest?.(`.mh-swipe-row__action`);a&&e.contains(a)?f(a.dataset.action??``):r&&(n===r||r.contains(n))&&d(s?null:i.end?`end`:`start`)},m=e=>{if(e.key===`Escape`&&s){e.preventDefault(),d(null),r?.focus();return}if(e.target!==r)return;let t=e.key===`ArrowRight`&&a()>0||e.key===`ArrowLeft`&&a()<0,n=e.key===`ArrowLeft`&&a()>0||e.key===`ArrowRight`&&a()<0;if(t)d(s===`end`?null:`start`);else if(n)d(s===`start`?null:`end`);else return;e.preventDefault()},h=null,g=(n,r)=>{let a=e.offsetWidth||1/0,s=i.end?-(t.fullSwipe?a:o(`end`)*1.25):0,c=i.start?t.fullSwipe?a:o(`start`)*1.25:0;return Math.max(s,Math.min(c,r+n))},_=e=>{if(e.button!==0||h||e.target.closest?.(`.mh-swipe-row__more`))return;let t=s===`start`?o(`start`):s===`end`?-o(`end`):0;h={pointer:e.pointerId,x0:e.clientX,y0:e.clientY,base:t,x:t,active:!1}},v=r=>{if(!h||r.pointerId!==h.pointer)return;let i=(r.clientX-h.x0)*a(),s=r.clientY-h.y0;if(!h.active){if(Math.abs(s)>pE&&Math.abs(s)>Math.abs(i)){h=null;return}if(Math.abs(i)<pE)return;h.active=!0,n.setPointerCapture?.(r.pointerId),e.classList.add(`is-dragging`)}h.x=g(i,h.base),c(h.x),e.classList.toggle(`is-reveal-start`,h.x>0),e.classList.toggle(`is-reveal-end`,h.x<0);let l=hE(h.x,o(`start`),o(`end`),e.offsetWidth,t.fullSwipe);e.classList.toggle(`is-armed`,l.run)},y=r=>{if(!h||r.pointerId!==h.pointer)return;let{active:a,x:s}=h;if(h=null,!a)return;n.releasePointerCapture?.(r.pointerId),e.classList.remove(`is-dragging`,`is-armed`,`is-reveal-start`,`is-reveal-end`);let c=e=>{e.stopPropagation(),e.preventDefault()};n.addEventListener(`click`,c,{capture:!0,once:!0}),setTimeout(()=>n.removeEventListener(`click`,c,{capture:!0}),0);let l=hE(s,o(`start`),o(`end`),e.offsetWidth,t.fullSwipe),u=l.side?i[l.side]?.querySelector(`.mh-swipe-row__action`):null;l.run&&u?f(u.dataset.action??``):d(l.side)},b=t=>{h&&t.pointerId===h.pointer&&(h=null,e.classList.remove(`is-dragging`,`is-armed`,`is-reveal-start`,`is-reveal-end`),l())};return e.addEventListener(`click`,p),e.addEventListener(`keydown`,m),n.addEventListener(`pointerdown`,_),n.addEventListener(`pointermove`,v),n.addEventListener(`pointerup`,y),n.addEventListener(`pointercancel`,b),l(),{side:()=>s,open:e=>d(e),close:()=>d(null),destroy:()=>{e.removeEventListener(`click`,p),e.removeEventListener(`keydown`,m),n.removeEventListener(`pointerdown`,_),n.removeEventListener(`pointermove`,v),n.removeEventListener(`pointerup`,y),n.removeEventListener(`pointercancel`,b),document.removeEventListener(`pointerdown`,u,!0)}}}function _E(e,t,n,r){return t?.length?M(`div`,{class:`mh-swipe-row__actions mh-swipe-row__actions--${e}`,id:`${n}-${e}`,role:`group`,"aria-label":r},...t.map(e=>M(`button`,{type:`button`,class:fE(e.tone),"data-action":e.id},H(e.icon),M(`span`,{class:`mh-swipe-row__action-label`},e.label)))):null}function vE(e,t,n){return[t&&`${e}-start`,n&&`${e}-end`].filter(Boolean).join(` `)}function yE(e){let t=I(`mh-swipe`),n=e.moreLabel??`Actions for ${e.label}`,r=M(`div`,{class:`mh-swipe-row__main`});it(r,...Array.isArray(e.content)?e.content:[e.content]);let i=M(`button`,{type:`button`,class:`mh-swipe-row__more`,"aria-label":n,title:n,"aria-expanded":`false`,"aria-controls":vE(t,!!e.start?.length,!!e.end?.length)},H(k)),a=M(`div`,{class:`mh-swipe-row`},M(`div`,{class:`mh-swipe-row__content`},r,i),_E(`start`,e.start,t,n),_E(`end`,e.end,t,n));return{el:a,...gE(a,e)}}function bE(e=`horizontal`,t=`bar`){return B(`mh-toolbar`,e===`vertical`&&`mh-toolbar--vertical`,t===`floating`&&`mh-toolbar--floating`)}function xE(e=`horizontal`){return e===`vertical`?`horizontal`:`vertical`}function SE(e,t=`horizontal`){return e===`separator`?M(`div`,{class:`mh-toolbar__separator`,role:`separator`,"aria-orientation":xE(t)}):e===`spacer`?M(`div`,{class:`mh-toolbar__spacer`,"aria-hidden":`true`}):e}var CE=`button, input, select, textarea, a[href], [tabindex]:not(.mh-toolbar__separator)`,wE=new Set([`ArrowLeft`,`ArrowRight`,`Home`,`End`]);function TE(e){let t=()=>e.getAttribute(`aria-orientation`)===`vertical`,n=()=>Array.from(e.querySelectorAll(CE)).filter(t=>!t.disabled&&!t.closest(`[hidden], [inert]`)&&t.closest(`.mh-toolbar`)===e),r=null,i=()=>{let e=n();(!r||!e.includes(r))&&(r=e[0]??null);for(let t of e)t.tabIndex=t===r?0:-1},a=e=>{let t=n().find(t=>t===e.target||t.contains(e.target));t&&t!==r&&(r=t,i())},o=a=>{let o=n(),s=o.findIndex(e=>e===a.target||e.contains(a.target));if(s<0)return;let c=a.target;if((c instanceof HTMLInputElement?![`button`,`checkbox`,`radio`,`range`,`color`].includes(c.type):c instanceof HTMLTextAreaElement||c.isContentEditable)&&wE.has(a.key))return;let l=!t()&&getComputedStyle(e).direction===`rtl`,u=t()?`ArrowDown`:l?`ArrowLeft`:`ArrowRight`,d=t()?`ArrowUp`:l?`ArrowRight`:`ArrowLeft`,f=null;a.key===u?f=(s+1)%o.length:a.key===d?f=(s-1+o.length)%o.length:a.key===`Home`?f=0:a.key===`End`&&(f=o.length-1),f!==null&&(a.preventDefault(),r=o[f],i(),r.focus())};e.addEventListener(`focusin`,a),e.addEventListener(`keydown`,o);let s=typeof MutationObserver==`function`?new MutationObserver(i):null;return s?.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:[`disabled`,`hidden`]}),i(),{refresh:i,destroy:()=>{e.removeEventListener(`focusin`,a),e.removeEventListener(`keydown`,o),s?.disconnect()}}}function EE(e){let t=e.orientation??`horizontal`,n=M(`div`,{class:bE(t,e.variant),role:`toolbar`,"aria-label":e.label,"aria-orientation":t},...(e.items??[]).map(e=>SE(e,t))),r=TE(n);return{el:n,...r,add:e=>{n.append(SE(e,t)),r.refresh()}}}function DE(e={}){let t=e.gap??`md`;return B(`mh-stack`,e.direction===`row`&&`mh-stack--row`,t!==`md`&&`mh-stack--gap-${t}`,e.align&&`mh-stack--align-${e.align}`,e.justify&&`mh-stack--justify-${e.justify}`,e.wrap&&`mh-stack--wrap`)}function OE(e={},...t){return{el:M(e.as??`div`,{class:DE(e)},...t)}}function kE(e={},...t){return OE({align:`center`,...e,direction:`row`},...t)}function AE(e={}){let t=e.min??`medium`,n=e.gap??`md`;return B(`mh-grid`,t!==`medium`&&`mh-grid--${t===`small`?`sm`:`lg`}`,n!==`md`&&`mh-grid--gap-${n}`)}function jE(e={},...t){return{el:M(e.as??`div`,{class:AE(e)},...t)}}var J=e=>C(e,{variant:`label`,tone:`muted`}),ME=e=>M(`div`,{class:`ex-card`},e),NE=e=>M(`div`,{style:`height: 360px; overflow: auto; border: var(--mh-border-width) solid var(--mh-outline); border-radius: var(--mh-radius-md)`},e),Y=(e,t,n)=>U({icon:e,label:t,pressed:n}).el,PE=(e,...t)=>M(`div`,{style:`height: ${e}px; display: flex; flex-direction: column; overflow: hidden; border: var(--mh-border-width) solid var(--mh-outline); border-radius: var(--mh-radius-md)`},...t),FE=e=>C(e,{tone:`muted`}),IE=()=>{let e=C(`Try it: nothing has happened yet.`,{variant:`caption`,tone:`muted`});return e.setAttribute(`aria-live`,`polite`),e},LE=[`Living room`,`Kitchen`,`Hall`,`Bedroom`,`Office`,`Bathroom`,`Garden`,`Garage`,`Attic`,`Utility room`,`Porch`,`Landing`],RE=[{id:`screen`,render:()=>OE({},...[`narrow`,`medium`].flatMap(e=>[J(`Width: ${e}`),NE(DT({width:e,label:`Home`,header:OE({gap:`xxs`},C(`Living room`,{variant:`eyebrow`,tone:`muted`}),C(`Good evening`,{variant:`headline`})).el},V({title:`Climate`,body:C(`21.5° and 46% humidity.`,{tone:`muted`})}).el,V({title:`Lights`,body:C(`Kitchen light and 2 others are on.`,{tone:`muted`})}).el).el)])).el},{id:`stack`,render:()=>OE({gap:`lg`},J(`Stack (column), gap md`),OE({},ME(`Living room`),ME(`Kitchen`),ME(`Bedroom`)).el,J(`Row: gaps xs, md, xl`),...[`xs`,`md`,`xl`].map(e=>kE({gap:e},ME(e),ME(`Kitchen`),ME(`Bedroom`)).el),J(`Row, space between`),kE({justify:`between`},C(`Kitchen light`,{variant:`label`}),P({label:`Turn off`,variant:`secondary`,size:`small`}).el).el,J(`Grid: columns fill the width (small, medium)`),jE({min:`small`,gap:`sm`},...[`Hall`,`Kitchen`,`Office`,`Garden`,`Garage`,`Attic`].map(ME)).el,jE({},ME(`Living room`),ME(`Kitchen`),ME(`Bedroom`)).el).el},{id:`split-pane`,render:()=>{let e=IE(),t=_i({label:`Rooms`,items:LE.slice(0,6).map(e=>({title:e,icon:`home`,onClick:()=>void 0}))}).el,n=OE({gap:`sm`},C(`Living room`,{variant:`title`}),FE(`3 lights on, 21.5° and 46% humidity.`),FE(`Drag the divider, or focus it and use the arrow keys. Enter folds the room list away.`)).el;n.style.padding=`var(--mh-space-md)`;let r=sE({start:t,end:n,size:35,min:25,max:65,collapsible:`start`,label:`Resize room list`,startLabel:`Rooms`,onResize:t=>e.textContent=`Room list at ${t}%`,onCollapse:t=>e.textContent=t?`Room list folded away`:`Room list shown`}),i=sE({orientation:`vertical`,start:M(`div`,{style:`padding: var(--mh-space-md)`},C(`Camera: Porch`,{variant:`label`})),end:M(`div`,{style:`padding: var(--mh-space-md)`},FE(`Motion at 14:02, 13:40 and 09:15.`)),size:60,label:`Resize camera and events`});return OE({gap:`lg`},J(`Side by side, start pane collapsible`),PE(320,r.el),e,J(`Stacked`),PE(260,i.el)).el}},{id:`panel`,render:()=>{let e=RT({title:`Lights`,icon:`lightbulb`,description:`3 of 5 on`,actions:[Y(`more`,`Light options`)],body:[L({label:`Ceiling`,row:!0,checked:!0}).el,L({label:`Floor lamp`,row:!0}).el],footer:[P({label:`All off`,variant:`secondary`,size:`small`}).el]}),t=RT({title:`Advanced`,collapsible:!0,open:!1,body:FE(`Transition time, default brightness and power-on behaviour.`)}),n=RT({title:`Display`,variant:`section`,flush:!0,body:_i({items:[{title:`Brightness`,trailing:`70%`,chevron:!0,onClick:()=>void 0},{title:`Screen off after`,trailing:`2 min`,chevron:!0,onClick:()=>void 0}]}).el,footer:`The screen dims at night in the bedroom theme.`}),r=RT({title:`Network`,variant:`section`,collapsible:!0,body:[L({label:`Reconnect automatically`,row:!0,checked:!0}).el]});return OE({gap:`lg`},J(`Tool panel`),e.el,J(`Collapsible`),t.el,J(`Settings sections`),n.el,r.el).el}},{id:`panel-group`,render:()=>{let e=(e,t)=>OE({gap:`xs`},...Array.from({length:e},(e,n)=>C(`${t} ${n+1}`,{variant:`mono`,tone:`muted`}))).el,t=UT({label:`Diagnostics`,panels:[{id:`events`,label:`Events`,icon:`bell`,badge:4,content:e(4,`Motion in the hall, event`)},{id:`devices`,label:`Devices`,icon:`wifi`,content:FE(`12 devices online, 1 asleep.`)},{id:`logs`,label:`Logs`,icon:`info`,content:e(3,`Info: heartbeat`)},{id:`trace`,label:`Trace`,disabled:!0}],actions:[Y(`refresh`,`Refresh`)],collapsible:!0});return PE(300,M(`div`,{style:`flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: var(--mh-space-sm)`},t.el))}},{id:`scroll-panel`,render:()=>{let e=_i({items:LE.map((e,t)=>({title:e,subtitle:`${t+1} device${t?`s`:``}`,icon:`home`}))}).el,t=M(`div`,{style:`display: flex; gap: var(--mh-space-xs); width: max-content`},...LE.map(e=>P({label:e,variant:`secondary`,size:`small`}).el));return OE({gap:`lg`},J(`Vertical, medium, edges fade while there is more`),$T({label:`Rooms`},e).el,J(`Small, inset well`),$T({label:`Event log`,size:`small`,inset:!0},...Array.from({length:12},(e,t)=>C(`14:${String(59-t).padStart(2,`0`)}  Hall motion`,{variant:`mono`,tone:`muted`}))).el,J(`Horizontal`),$T({label:`Room shortcuts`,axis:`x`,size:`small`},t).el).el}},{id:`toolbar`,render:()=>{let e=EE({label:`Floor plan`,items:[Y(`arrow-left`,`Undo`),Y(`arrow-right`,`Redo`),`separator`,Y(`add`,`Add device`),Y(`edit`,`Edit room`,!0),Y(`delete`,`Remove`),`spacer`,P({label:`Done`,size:`small`}).el]}),t=EE({label:`Drawing tools`,orientation:`vertical`,variant:`floating`,items:[Y(`edit`,`Pen`,!0),Y(`lightbulb`,`Place light`),Y(`thermometer`,`Place sensor`),`separator`,Y(`search`,`Zoom`)]}),n=EE({label:`Media`,variant:`floating`,items:[Y(`previous`,`Previous`),Y(`pause`,`Pause`),Y(`next`,`Next`),`separator`,Y(`volume-high`,`Volume`)]});return OE({gap:`lg`},J(`Toolbar: one tab stop, arrows move between controls`),e.el,J(`Floating`),n.el,J(`Vertical tool rail`),kE({align:`start`},t.el,M(`div`,{class:`ex-card`,style:`flex: 1; min-height: 220px`},`Canvas`)).el).el}},{id:`status-bar`,render:()=>{let e=dE({label:`Hub status`,items:[{id:`net`,label:`Connected`,icon:`wifi`,tone:`success`},{id:`devices`,label:`Devices`,value:`24`},{id:`updates`,label:`2 updates`,icon:`download`,tone:`accent`,end:!0,onClick:()=>void 0},{id:`time`,label:`Synced`,value:`14:02`,end:!0,announce:!0}]}),t=!1,n=P({label:`Toggle connection`,variant:`secondary`,size:`small`,onClick:()=>{t=!t,e.setItem(`net`,t?{label:`Offline`,icon:`error`,tone:`danger`}:{label:`Connected`,icon:`wifi`,tone:`success`})}}),r=dE({items:[{id:`b`,label:`Hall sensor battery`,value:`12%`,icon:`warning`,tone:`warning`},{id:`m`,label:`Away mode`,end:!0}]});return OE({gap:`lg`},J(`At the bottom of a frame`),PE(200,M(`div`,{style:`flex: 1; padding: var(--mh-space-md)`},FE(`Content`)),e.el),n.el,J(`Warning tone`),r.el).el}},{id:`app-shell`,render:()=>{let e=e=>M(`nav`,{"aria-label":`Sections`,style:`display: flex; ${e?`flex-direction: column; padding-inline: var(--mh-space-xs)`:`justify-content: space-around; border-top: var(--mh-border-width) solid var(--mh-divider); background: var(--mh-surface)`}; gap: var(--mh-space-xxs)`},Y(`home`,`Home`,!0),Y(`lightbulb`,`Lights`),Y(`thermometer`,`Climate`),Y(`settings`,`Settings`)),t=()=>[V({title:`Climate`,body:FE(`21.5° and 46% humidity.`)}).el,V({title:`Lights`,body:FE(`Kitchen light and 2 others are on.`)}).el,V({title:`Doors`,body:FE(`All locked.`)}).el],n=n=>{let r=kT({title:`Home`,subtitle:`Living room`,leading:Y(`menu`,`Menu`),actions:[Y(`search`,`Search`),Y(`bell`,`Notifications`)],nav:e(n===`start`),navPosition:n,status:dE({items:[{id:`net`,label:`Connected`,icon:`wifi`,tone:`success`},{id:`t`,label:`Synced`,value:`14:02`,end:!0}]}).el,label:`Home`},jE({min:`small`},...t()).el,...t());return r.el.style.height=`100%`,r.el.style.minHeight=`0`,PE(440,r.el)};return OE({gap:`lg`},J(`Navigation rail at the start (tablets, TVs)`),n(`start`),J(`Navigation at the bottom (phones, watches)`),n(`bottom`)).el}},{id:`reorderable-list`,render:()=>{let e=C(`Order: Living room, Kitchen, Hall, Bedroom, Office`,{variant:`caption`,tone:`muted`}),t=new Map(LE.map((e,t)=>[`r${t}`,e])),n=YT({label:`Room order on the dashboard`,items:LE.slice(0,5).map((e,t)=>({id:`r${t}`,label:e,icon:`home`,description:t===0?`Shown first`:void 0,trailing:t===1?L({ariaLabel:`Show ${e}`,checked:!0}).el:void 0})),onChange:n=>e.textContent=`Order: ${n.map(e=>t.get(e)).join(`, `)}`});return OE({gap:`md`},J(`Drag a handle, or focus it and press Space, then the arrow keys`),n.el,e).el}},{id:`swipe-row`,render:()=>{let e=IE(),t=(t,n,r=!1)=>yE({label:t,content:OE({gap:`none`},C(t,{variant:`label`}),C(n,{variant:`caption`,tone:`muted`})).el,start:[{id:`fav`,label:`Favourite`,icon:`star`,tone:`accent`}],end:[{id:`edit`,label:`Edit`,icon:`edit`},{id:`delete`,label:`Delete`,icon:`delete`,tone:`danger`}],fullSwipe:r,onAction:n=>e.textContent=`${n} on ${t}`}).el,n=yE({label:`Water the plants`,content:C(`Water the plants`,{variant:`label`}),end:[{id:`done`,label:`Done`,icon:`check`,tone:`success`}],fullSwipe:!0,onAction:()=>e.textContent=`Reminder done`}).el;return OE({gap:`sm`},J(`Swipe left or right; the actions button opens them from the keyboard`),t(`Kitchen light`,`On, 80%`),t(`Hall sensor`,`Battery 12%`),J(`Full swipe runs the first action`),t(`Porch camera`,`Motion at 14:02`,!0),n,e).el}},{id:`onboarding`,render:()=>{let e=IE();return OE({gap:`sm`},PE(460,FT({steps:[{title:`Welcome home`,text:`Every room, light and sensor on one screen.`,icon:`home`},{title:`Group by room`,text:`Rooms keep the dashboard short. Reorder them any time.`,icon:`lightbulb`},{title:`Stay in the loop`,text:`Get a gentle chime when a door is left open.`,icon:`bell`,content:L({label:`Allow notifications`,row:!0,checked:!0}).el},{title:`All set`,text:`Swipe, tap or use the arrow keys to move around.`,icon:`check`}],onDone:()=>e.textContent=`Done`,onSkip:()=>e.textContent=`Skipped`,onStepChange:t=>e.textContent=`Step ${t+1}`}).el),e).el}}],zE=(...e)=>M(`div`,{class:`ex-stack`},...e),BE=(...e)=>M(`div`,{class:`mh-grid`},...e),VE=e=>C(e,{variant:`label`,tone:`muted`}),HE=(e,t)=>{for(let[n,r]of Object.entries(_r(e.theme)))t.style.setProperty(n,r);return t},UE=(e,t=600)=>void setTimeout(e,t);function WE(e,t,n){let r=n!==null,i=()=>r?n===null?`On`:`On · ${n}%`:`Off`,a=L({ariaLabel:`${e} power`,checked:r,onChange:e=>s(e)}),o=R({title:e,icon:t,active:r,tone:`warm`,state:i(),control:a.el}),s=e=>{o.update({loading:!0}),UE(()=>{r=e,r&&n===null&&(n=60),a.setChecked(r),o.update({loading:!1,active:r,state:i()})})};return o}var GE=[{value:`off`,label:`Off`},{value:`heat`,label:`Heat`},{value:`cool`,label:`Cool`},{value:`heat_cool`,label:`Auto`}],KE=[...GE,{value:`dry`,label:`Dry`},{value:`fan_only`,label:`Fan only`}];function qE(e,t){let n=Ht({...e,onTarget:e=>{t&&(t.textContent=`Sent ${typeof e==`number`?kn(e):`${kn(e.low)}–${kn(e.high)}`}`),UE(()=>n.update(typeof e==`number`?{target:e}:{targetLow:e.low,targetHigh:e.high}))},onMode:e=>UE(()=>n.update({mode:e,action:e===`off`?`off`:`idle`}))});return n.el}function JE(e){let t=cn({...e,onToggle:e=>UE(()=>t.update({on:e,brightness:e?80:null})),onBrightness:e=>UE(()=>t.update({brightness:e})),onColorTemp:n=>UE(()=>t.update({colorTemp:e.colorTemp?{...e.colorTemp,value:n}:null})),onHue:e=>UE(()=>t.update({hue:e}))});return t.el}function YE(e){let t=e.position??0,n,r=()=>{clearInterval(n),n=void 0},i=e=>{r(),e!==t&&(a.update({state:e>t?`opening`:`closing`}),n=setInterval(()=>{t+=Math.sign(e-t)*Math.min(10,Math.abs(e-t));let n=t===e;a.update(n?{position:t,state:t===100?`open`:t===0?`closed`:`stopped`}:{position:t}),n&&r()},400))},a=ni({...e,onOpen:()=>i(100),onClose:()=>i(0),onStop:()=>{r(),a.update({state:`stopped`})},onPosition:i});return a.el}function XE(e,t){let n=Yr({...t,state:e,onLock:()=>{n.update({state:`locking`}),UE(()=>n.update({state:`locked`}),1200)},onUnlock:()=>{n.update({state:`unlocking`}),UE(()=>n.update({state:`unlocked`}),1200)},onOpen:()=>{n.update({state:`opening`}),UE(()=>n.update({state:`open`}),1200)}});return{el:n.el,handle:n}}var ZE=[{id:`control-card`,render:e=>{let t=R({title:`Reading nook`,icon:de,state:`On · 40%`,active:!0,tone:`warm`,onOpen:()=>void 0});t.update({body:cn({on:!0,brightness:40,toggle:!1}).el});let n=M(`div`,{style:`aspect-ratio: 16 / 7; background: linear-gradient(135deg, var(--mh-accent-soft), var(--mh-surface-pressed));`,role:`img`,"aria-label":`Snapshot of the porch`});return HE(e,zE(VE(`Lights with a trailing switch: tap it to see the loading state, then the lit badge`),BE(WE(`Desk lamp`,de,70).el,WE(`Ceiling light over the long dining table by the window`,lr,null).el),VE(`Tones: heat and cool (home colours), accent; the header opens more controls`),BE(R({title:`Hallway radiator`,icon:$t,state:`Heating to 21°C`,active:!0,tone:`heat`,onOpen:()=>void 0}).el,R({title:`Studio air`,icon:u,state:`Cooling · 24.5°C`,active:!0,tone:`cool`,onOpen:()=>void 0}).el,R({title:`Garden valve`,icon:Ve,state:`Open`,active:!0,control:U({icon:`more`,label:`More`}).el}).el),VE(`Body slot and media slot`),BE(t.el,R({title:`Porch`,icon:`camera`,state:`Updated 2 min ago`,media:n}).el),VE(`Loading and unavailable (the switch is disabled, the state says what is given)`),BE(R({title:`Kitchen counter`,icon:`lightbulb`,state:`Turning on…`,loading:!0,control:L({ariaLabel:`Kitchen counter power`}).el}).el,R({title:`Shed light`,icon:`lightbulb`,state:`Unavailable`,unavailable:!0,control:L({ariaLabel:`Shed light power`}).el}).el),VE(`Without the home colours: warm and heat fall back to the warning role, cool to info`),M(`div`,{class:`mh-grid`,style:`--mh-home-heat: initial; --mh-home-cool: initial; --mh-home-light-on: initial;`},R({title:`Desk lamp`,icon:de,state:`On`,active:!0,tone:`warm`}).el,R({title:`Hallway radiator`,icon:$t,state:`Heating`,active:!0,tone:`heat`}).el,R({title:`Studio air`,icon:u,state:`Cooling`,active:!0,tone:`cool`}).el)))}},{id:`thermostat`,render:e=>{let t=C(`Tap − / + a few times: one event is sent 0.7 s after the last tap.`,{variant:`label`,tone:`muted`});return HE(e,zE(t,BE(R({title:`Living room`,icon:u,state:`Heating · Now 19.5°C`,active:!0,tone:`heat`,body:qE({label:`Living room thermostat`,current:19.5,target:21,mode:`heat`,modes:GE,action:`heating`},t)}).el,R({title:`Studio`,icon:u,state:`Heat and cool`,active:!0,tone:`cool`,body:qE({label:`Studio thermostat`,current:23.4,targetLow:19,targetHigh:24,mode:`heat_cool`,modes:GE,action:`cooling`},t)}).el),VE(`More than four modes become a select; Fahrenheit with whole-degree steps`),BE(R({title:`Guest room`,icon:u,state:`Drying`,body:qE({label:`Guest room thermostat`,current:71,target:70,unit:`°F`,min:50,max:90,step:1,mode:`dry`,modes:KE,action:`drying`},t)}).el,R({title:`Workshop`,icon:u,state:`Off`,body:qE({label:`Workshop thermostat`,current:14,target:null,mode:`off`,modes:GE,action:`off`})}).el),VE(`Compact, for small cards; and disabled`),BE(R({title:`Nursery`,icon:u,state:`Idle`,body:qE({label:`Nursery thermostat`,compact:!0,current:20.5,target:20.5,action:`idle`})}).el,R({title:`Loft`,icon:u,state:`Unavailable`,unavailable:!0,body:qE({label:`Loft thermostat`,compact:!0,disabled:!0,current:null,target:18})}).el)))}},{id:`light-control`,render:e=>HE(e,zE(VE(`Sliders send when the finger lifts, or at once from the keyboard`),BE(R({title:`Bedside lamp`,icon:de,state:`On`,active:!0,tone:`warm`,body:JE({label:`Bedside lamp`,on:!0,brightness:65,colorTemp:{value:2700,min:2e3,max:6500}})}).el,R({title:`Mood strip`,icon:lr,state:`On`,active:!0,tone:`warm`,body:JE({label:`Mood strip`,on:!0,brightness:80,colorTemp:{value:4e3,min:2200,max:6500},hue:210})}).el),VE(`Brightness only, off; and disabled`),BE(R({title:`Pantry`,icon:`lightbulb`,state:`Off`,body:JE({label:`Pantry`,on:!1,brightness:30})}).el,R({title:`Porch light`,icon:`lightbulb`,state:`Unavailable`,unavailable:!0,body:JE({label:`Porch light`,on:!1,brightness:50,disabled:!0})}).el)))},{id:`position-control`,render:()=>zE(VE(`A blind with a position: open, stop, close and a slider; the arrow drifts while it moves`),BE(R({title:`Studio blind`,icon:yt,state:`Half open`,body:YE({label:`Studio blind`,state:`stopped`,position:50,can:{open:!0,close:!0,stop:!0,position:!0},labels:{open:`Raise`,close:`Lower`}})}).el,R({title:`Garage door`,icon:Ft,state:`Closed`,body:YE({label:`Garage door`,state:`closed`,position:0,can:{open:!0,close:!0,stop:!0}})}).el),VE(`Only open and close (no position); and disabled`),BE(R({title:`Side gate`,icon:xn,state:`Open`,body:ni({label:`Side gate`,state:`open`,position:null}).el}).el,R({title:`Patio awning`,icon:yt,state:`Unavailable`,unavailable:!0,body:ni({label:`Patio awning`,state:null,position:30,disabled:!0,can:{open:!0,close:!0,stop:!0,position:!0}}).el}).el))},{id:`lock-control`,render:()=>{let e=XE(`locked`,{label:`Front door`,confirm:!0,canOpen:!0});return zE(VE(`Unlock and open ask for a second tap (no modal); Escape or a few seconds cancel`),BE(R({title:`Front door`,icon:`lock`,state:`Locked`,body:e.el}).el,R({title:`Back door`,icon:`lock`,state:`Unlocked`,body:XE(`unlocked`,{label:`Back door`}).el}).el),VE(`Jammed takes the alert tone; unknown state`),BE(R({title:`Shed`,icon:`lock`,state:`Jammed`,body:XE(`jammed`,{label:`Shed`}).el}).el,R({title:`Bike store`,icon:`lock`,state:`Unknown`,body:Yr({label:`Bike store`,state:null}).el}).el))}}];function QE(e,t){return G(`svg`,{viewBox:`0 0 24 24`,class:t?`mh-icon ${t}`:`mh-icon`,"aria-hidden":`true`},G(`path`,{d:dr(e),fill:`currentColor`}))}var X=e=>typeof e==`number`&&Number.isFinite(e),Z=(e,t,n)=>Math.min(n,Math.max(t,e));function $E(e){let t=String(e),n=t.indexOf(`.`);return n<0?0:t.length-n-1}function eD(e,t){return Number((Math.round(e/t)*t).toFixed($E(t)))}function tD(e){let t=Math.abs(e);return Math.round(t)<1e3?`${Math.round(t)} W`:`${(t/1e3).toFixed(1)} kW`}function nD(e){let t=Math.max(0,Math.round(e));if(t<1)return`under a minute`;let n=Math.floor(t/60),r=t%60;return n===0?`${r} min`:r===0?`${n} h`:`${n} h ${r} min`}function rD(e){let t=Math.round(e),n=Math.floor(t/60),r=t%60;return`${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}var iD={power:`Power`,speed:`Speed`,oscillate:`Oscillate`,direction:`Direction`,forward:`Forward`,reverse:`Reverse`,preset:`Preset`,on:`On`,off:`Off`};function aD(e){return X(e)&&e>=2&&e<=6}function oD(e,t){return!X(e)||e<=0||t<1?0:Z(Math.round(e*t/100),1,t)}function sD(e,t){return t<1?0:Math.round(Z(e,0,t)*100/t)}function cD(e){return X(e)&&e>0?100/e:1}function lD(e){return`${Math.round(e)}%`}function uD(e,t){if(!e)return null;let n=X(t)?Z(t,0,100):50;return n<=0?null:Math.round((2.4-n/100*1.95)*100)/100}function dD(e,t){let n=uD(e,t);return n===null?void 0:`--_spin: ${n}s`}function fD(e){return B(`mh-fan-control`,e.on&&`is-on`,e.spinning&&`is-spinning`,e.disabled&&`is-disabled`)}function pD(e){return Array.from({length:e},(e,t)=>({value:String(t+1),label:String(t+1)}))}function mD(e){return[{value:`forward`,label:e.forward,icon:cr},{value:`reverse`,label:e.reverse,icon:Un}]}var hD=Nt;function gD(e){let t={...e},n=M(`div`,{role:`group`}),r=``,i=null,a=null,o=null,s=null,c=null,l=null,u=null,d=()=>({...iD,...t.labels}),f=(e,t,n)=>M(`div`,{class:`mh-fan-control__field mh-fan-control__field--${e}`},M(`span`,{class:`mh-fan-control__field-label`,"aria-hidden":`true`},t),n),p=()=>{let e=d();o?.dispose(),a=o=s=c=l=u=null;let r=[];if(i=L({label:e.power,row:!0,icon:ot,checked:t.on,onChange:e=>t.onToggle?.(e)}),i.el.classList.add(`mh-fan-control__power`),r.push(i.el),aD(t.speedCount)){let n=t.speedCount;a=D({label:e.speed,options:pD(n),fullWidth:!0,onChange:e=>t.onPercentage?.(sD(Number(e),n))}),r.push(f(`speed`,e.speed,a.el))}else t.percentage!==null&&t.percentage!==void 0&&(o=wr({label:e.speed,className:`mh-fan-control__slider`,value:t.percentage,min:0,max:100,step:cD(t.speedCount),format:lD,onCommit:e=>t.onPercentage?.(Math.round(e))}),r.push(o.el));t.direction&&(c=D({label:e.direction,options:mD(e),fullWidth:!0,onChange:e=>t.onDirection?.(e)}),r.push(f(`direction`,e.direction,c.el)));let p=t.presets??[];if(p.length>0){let n=e=>t.onPreset?.(e);p.length<=4?(l=D({label:e.preset,options:p,fullWidth:!0,onChange:n}),r.push(f(`preset`,e.preset,l.el))):(u=vr({ariaLabel:e.preset,options:p.map(e=>({value:e.value,label:e.label})),onChange:n}),r.push(f(`preset`,e.preset,u.el)))}typeof t.oscillating==`boolean`&&(s=L({label:e.oscillate,row:!0,icon:hD,checked:t.oscillating,onChange:e=>t.onOscillate?.(e)}),s.el.classList.add(`mh-fan-control__oscillate`),r.push(s.el)),m(n,r)},h=()=>{let e=!!t.disabled,d=dD(t.on,t.percentage);n.className=fD({on:t.on,disabled:e,spinning:d!==void 0}),n.setAttribute(`aria-label`,t.label??`Fan`),d?n.setAttribute(`style`,d):n.removeAttribute(`style`);let f=JSON.stringify([aD(t.speedCount)?t.speedCount:t.percentage===null||t.percentage===void 0?`none`:`slider${t.speedCount??``}`,!!t.direction,typeof t.oscillating==`boolean`,t.presets??[],t.labels??{}]);if(f!==r&&(r=f,p()),i?.setChecked(t.on),i?.setDisabled(e),a){let n=oD(t.percentage,t.speedCount);for(let e of a.inputs)e.checked=Number(e.value)===n;a.setDisabled(e)}if(o&&X(t.percentage)&&o.set({value:t.percentage,min:0,max:100,disabled:e}),s&&typeof t.oscillating==`boolean`&&(s.setChecked(t.oscillating),s.setDisabled(e)),c&&t.direction&&(c.setValue(t.direction),c.setDisabled(e)),l){for(let e of l.inputs)e.checked=e.value===t.preset;l.setDisabled(e)}u&&(u.setValue(t.preset??``),u.setDisabled(e))};return h(),{el:n,update(e){t={...t,...e},h()},destroy:()=>o?.dispose()}}var _D={power:`Power`,target:`Target humidity`,lower:`Lower`,raise:`Raise`,now:`Now`,mode:`Mode`,humidifying:`Humidifying`,drying:`Drying`,idle:`Idle`,off:`Off`},vD={min:30,max:80,step:1,comfort:{low:40,high:60}};function yD(e){return{min:e.min??vD.min,max:e.max??vD.max,step:e.step??vD.step}}function bD(e,t=vD.step){return X(e)?e.toFixed($E(t)):`–`}function xD(e,t,n){return Z(eD(e+t*n.step,n.step),n.min,n.max)}function SD(e){let t=e=>X(e)?Z(e,0,100):null,n=e.comfort===void 0?vD.comfort:e.comfort,r=n?{left:Z(Math.min(n.low,n.high),0,100),width:Z(Math.abs(n.high-n.low),0,100)}:null;return{current:t(e.current),target:t(e.target),comfort:r}}function CD(e){return B(`mh-humidity-control`,e.compact&&`mh-humidity-control--compact`,e.off&&`is-off`,e.disabled&&`is-disabled`)}function wD(e){return`mh-humidity-control__action mh-humidity-control__action--${e}`}function TD(e,t){return t===void 0?`left: ${e}%`:`left: ${e}%; width: ${t}%`}function ED(e){let t={...e},n=M(`div`,{role:`group`}),r=M(`span`,{class:`mh-humidity-control__number`}),i=M(`span`,{class:`mh-humidity-control__unit`}),a=M(`output`,{class:`mh-humidity-control__value`},r,i),o=M(`div`,{class:`mh-humidity-control__adjust`}),s=M(`div`,{class:`mh-humidity-control__target`,role:`group`},o),c=M(`div`,{class:`mh-humidity-control__track`}),l=M(`div`,{class:`mh-humidity-control__gauge`,"aria-hidden":`true`},c),u=M(`span`,{class:`mh-humidity-control__comfort`}),d=M(`span`,{class:`mh-humidity-control__marker mh-humidity-control__marker--target`}),f=M(`span`,{class:`mh-humidity-control__marker mh-humidity-control__marker--current`}),p=M(`span`,{class:`mh-humidity-control__current`}),h=M(`span`,{}),g=M(`div`,{class:`mh-humidity-control__status`}),_=M(`div`,{class:`mh-humidity-control__mode`}),v=null,y=null,b=null,x=``,S=``,C=``,w=null,T=null,E=()=>({..._D,...t.labels}),O=()=>X(t.target)?t.target:null,k=zr({send:e=>{e!==null&&t.onTarget?.(e)},changed:()=>N(),delay:t.delay??700}),A=e=>{let n=k.shown(O());n===null||t.disabled||(k.schedule(xD(n,e,yD(t)),O()),N())},j=e=>{let n=t.modes??[],r=JSON.stringify([n,t.compact,e.mode]);if(r!==C){C=r;let i=e=>t.onMode?.(e),a=t.compact?`small`:`medium`;if(n.length===0)_.replaceChildren(),w=T=null;else if(n.length<=4){let r=D({label:e.mode,options:n,value:t.mode,size:a,fullWidth:!0,onChange:i});_.replaceChildren(r.el),w=r.setValue,T=r.setDisabled}else{let r=vr({ariaLabel:e.mode,options:n.map(e=>({value:e.value,label:e.label})),value:t.mode,size:a,onChange:i});_.replaceChildren(r.el),w=r.setValue,T=r.setDisabled}}t.mode!==void 0&&w?.(t.mode),T?.(!!t.disabled)},N=()=>{let e=E(),C=yD(t),w=k.shown(O()),T=!!t.disabled;n.className=CD({compact:t.compact,disabled:T,off:t.on===!1}),n.setAttribute(`aria-label`,t.label??`Humidity`);let D=typeof t.on==`boolean`;D&&(!b||x!==e.power)&&(x=e.power,b=L({label:e.power,row:!0,checked:!!t.on,onChange:e=>t.onToggle?.(e)}),b.el.classList.add(`mh-humidity-control__power`)),D||(b=null),b?.setChecked(!!t.on),b?.setDisabled(T);let M=JSON.stringify([t.compact,e.lower,e.raise]);if(M!==S){S=M;let n=t.compact?`small`:`medium`;v=U({icon:ce,label:e.lower,size:n,filled:!0,onClick:()=>A(-1)}),y=U({icon:vt,label:e.raise,size:n,filled:!0,onClick:()=>A(1)}),v.el.classList.add(`mh-humidity-control__step`),y.el.classList.add(`mh-humidity-control__step`),o.replaceChildren(v.el,a,y.el)}s.setAttribute(`aria-label`,e.target),r.textContent=bD(w,C.step),i.textContent=w===null?``:`%`,v?.setDisabled(T||w===null||w<=C.min),y?.setDisabled(T||w===null||w>=C.max);let N=SD({current:t.current,target:w,comfort:t.comfort}),ee=[];N.comfort&&(u.setAttribute(`style`,TD(N.comfort.left,N.comfort.width)),ee.push(u)),N.target!==null&&(d.setAttribute(`style`,TD(N.target)),ee.push(d)),N.current!==null&&(f.setAttribute(`style`,TD(N.current)),ee.push(f)),m(c,ee);let te=X(t.current);p.textContent=te?`${e.now} ${bD(t.current,C.step)}%`:``,t.action&&(h.className=wD(t.action),h.textContent=e[t.action]),m(g,[...te?[p]:[],...t.action?[h]:[]]),j(e);let P=[];b&&P.push(b.el),P.push(s,l),(te||t.action)&&P.push(g),(t.modes??[]).length>0&&P.push(_),m(n,P)};return N(),{el:n,update(e){t={...t,...e},N()},destroy:()=>k.dispose()}}var DD=[`good`,`moderate`,`poor`,`very-poor`],OD={co2:{name:`Carbon dioxide`,unit:`ppm`,bands:{moderate:800,poor:1200,veryPoor:2e3,max:2500}},pm25:{name:`Fine particles`,unit:`µg/m³`,bands:{moderate:15,poor:35,veryPoor:55,max:75}},pm10:{name:`Particles`,unit:`µg/m³`,bands:{moderate:45,poor:100,veryPoor:150,max:200}},voc:{name:`Volatile compounds`,unit:`ppb`,bands:{moderate:300,poor:1e3,veryPoor:3e3,max:4e3}}},kD={good:`Good`,moderate:`Moderate`,poor:`Poor`,"very-poor":`Very poor`,rising:`Rising`,falling:`Falling`,steady:`Steady`,noData:`No reading`},AD={name:`Air quality`,unit:``,bands:{moderate:25,poor:50,veryPoor:75,max:100}};function jD(e){let t=e.kind&&e.kind!==`other`?OD[e.kind]:AD;return{name:e.name??t.name,unit:e.unit??t.unit,bands:e.bands??t.bands}}function MD(e,t){return e>=t.veryPoor?`very-poor`:e>=t.poor?`poor`:e>=t.moderate?`moderate`:`good`}function ND(e,t){let n=e.filter(X);if(n.length<2)return null;let r=n.slice(0,Math.max(1,Math.floor(n.length/3))),i=r.reduce((e,t)=>e+t,0)/r.length,a=n[n.length-1]-i,o=Math.max(t.moderate*.05,2**-52);return Math.abs(a)<o?`steady`:a>0?`rising`:`falling`}function PD(e){return String(Math.abs(e)<10?Number(e.toFixed(1)):Math.round(e))}function FD(e){let t=Math.max(e.max,e.veryPoor,1e-9),n=[0,e.moderate,e.poor,e.veryPoor,t].map(e=>Z(e,0,t));return[0,1,2,3].map(e=>K((n[e+1]-n[e])/t*100))}function ID(e,t=!1){return B(`mh-air-quality`,e?`mh-air-quality--${e}`:`is-empty`,t&&`mh-air-quality--compact`)}var LD={rising:ue,falling:pe,steady:$n};function RD(e){let t={...kD,...e.labels},n=jD(e),r=e.format??PD,i=X(e.value),a=i?MD(e.value,n.bands):null,o=Math.max(n.bands.max,n.bands.veryPoor),s=a?t[a]:t.noData,c=i?`${r(e.value)}${n.unit?` ${n.unit}`:``}`:t.noData,l=e.trend&&e.trend.length>1?ND(e.trend,n.bands):null,u=(e.trend??[]).filter(X),d=e.trend&&u.length>1?Ge(e.trend,Math.min(0,...u),Math.max(o*.5,...u)):null;return G(`div`,{class:ID(a,e.compact),role:`group`,"aria-label":n.name},G(`div`,{class:`mh-air-quality__head`},G(`span`,{class:`mh-air-quality__name`},n.name),G(`span`,{class:`mh-air-quality__level`},s)),G(`div`,{class:`mh-air-quality__reading`,"aria-hidden":`true`},G(`span`,{class:`mh-air-quality__value`},i?r(e.value):`–`),i&&n.unit&&G(`span`,{class:`mh-air-quality__unit`},n.unit)),G(`div`,{class:`mh-air-quality__band`,role:`meter`,"aria-label":n.name,"aria-valuemin":0,"aria-valuemax":o,"aria-valuenow":i?Z(e.value,0,o):void 0,"aria-valuetext":i?`${c}, ${s}`:t.noData},FD(n.bands).map((e,t)=>G(`span`,{class:`mh-air-quality__zone mh-air-quality__zone--${DD[t]}`,style:`width: ${e}%`})),i&&G(`span`,{class:`mh-air-quality__marker`,style:`left: ${K(Z(e.value,0,o)/o*100)}%`})),l&&G(`div`,{class:B(`mh-air-quality__trend`,`mh-air-quality__trend--${l}`)},d&&G(`svg`,{class:`mh-air-quality__spark`,viewBox:`0 0 100 100`,preserveAspectRatio:`none`,"aria-hidden":`true`},G(`path`,{class:`mh-air-quality__spark-line`,d:d.line,"vector-effect":`non-scaling-stroke`})),G(`span`,{class:`mh-air-quality__direction`},QE(LD[l]),t[l]),e.trendLabel&&G(`span`,{class:`mh-air-quality__span`},e.trendLabel)))}function zD(e){let t=kb(RD(e));return{el:t,update:e=>Ab(t,RD(e))}}var BD=1440,VD={otherwise:`Otherwise`,add:`Add a block on`,to:`to`,help:`Left and right arrows move the block, up and down make it longer or shorter, Shift moves by an hour. Enter changes the value, Delete removes it.`},HD=(e,t)=>Z(Math.round(e/t)*t,0,BD);function UD(e){let t=e.map(e=>({start:Z(Math.min(e.start,e.end),0,BD),end:Z(Math.max(e.start,e.end),0,BD),value:e.value})).sort((e,t)=>e.start-t.start),n=[];for(let e of t){let t=Math.max(e.start,n[n.length-1]?.end??0);e.end>t&&n.push({...e,start:t})}return n}var WD=(e,t)=>({lo:e[t-1]?.end??0,hi:e[t+1]?.start??1440});function GD(e,t,n){let r=e[t];if(!r)return[...e];let{lo:i,hi:a}=WD(e,t),o=r.end-r.start,s=Z(r.start+n,i,a-o);return e.map((e,n)=>n===t?{...e,start:s,end:s+o}:e)}function KD(e,t,n,r,i=15){if(!e[t])return[...e];let{lo:a,hi:o}=WD(e,t),s=HD(r,i);return e.map((e,r)=>r===t?n===`start`?{...e,start:Z(s,a,e.end-i)}:{...e,end:Z(s,e.start+i,o)}:e)}function qD(e,t,n,r=60,i=15){let a=UD(e),o=Z(t,0,BD);if(a.some(e=>o>=e.start&&o<e.end))return null;let s=a.filter(e=>e.end<=o).reduce((e,t)=>Math.max(e,t.end),0),c=a.filter(e=>e.start>o).reduce((e,t)=>Math.min(e,t.start),BD),l=Math.min(Math.max(i,HD(r,i)),c-s);if(l<i)return null;let u=Z(HD(o-l/2,i),s,c-l),d={start:u,end:u+l,value:n},f=UD([...a,d]);return{blocks:f,index:f.findIndex(e=>e.start===u)}}function JD(e,t=15){let n=UD(e),r=null,i=0;for(let e of[...n,{start:BD,end:BD,value:``}])e.start-i>=t&&(!r||e.start-i>r.hi-r.lo)&&(r={lo:i,hi:e.start}),i=Math.max(i,e.end);return r?(r.lo+r.hi)/2:null}function YD(e,t,n){return n.length===0?[...e]:e.map((e,r)=>{if(r!==t)return e;let i=n.findIndex(t=>t.value===e.value);return{...e,value:n[(i+1)%n.length].value}})}function XD(e,t,n,r,i,a=15){let o=e[t];if(!o)return null;let s=r?60:a;switch(n){case`ArrowLeft`:return{blocks:GD(e,t,-s),focus:t};case`ArrowRight`:return{blocks:GD(e,t,s),focus:t};case`ArrowUp`:return{blocks:KD(e,t,`end`,o.end+s,a),focus:t};case`ArrowDown`:return{blocks:KD(e,t,`end`,o.end-s,a),focus:t};case`Enter`:case` `:return{blocks:YD(e,t,i),focus:t};case`Delete`:case`Backspace`:{let n=e.filter((e,n)=>n!==t);return{blocks:n,focus:n.length===0?null:Math.min(t,n.length-1)}}default:return null}}function ZD(e,t){let n=e.findIndex(e=>e.value===t),r=e[n];return r?.color===void 0?(n<0?0:n)%6+1:r.color}function QD(e,t,n=VD.to){let r=t.find(t=>t.value===e.value);return`${rD(e.start)} ${n} ${rD(e.end)}, ${r?.label??e.value}`}function $D(e=!1){return B(`mh-schedule`,e&&`is-disabled`)}var eO=e=>K(e/BD*100),tO=[0,3,6,9,12,15,18,21,24];function nO(e){let t={...VD,...e.labels},n=!!e.disabled;return G(`div`,{class:$D(n),role:`group`,"aria-label":e.label},G(`div`,{class:`mh-schedule__hours`,"aria-hidden":`true`},tO.map(e=>G(`span`,{class:B(`mh-schedule__hour`,e%6!=0&&`is-minor`),style:`left: ${eO(e*60)}%`},String(e).padStart(2,`0`)))),e.days.map((r,i)=>{let a=UD(r.blocks),o=r.name??r.label;return G(`div`,{class:`mh-schedule__day`,role:`group`,"aria-label":o},G(`span`,{class:`mh-schedule__day-label`,"aria-hidden":`true`},r.label),G(`div`,{class:`mh-schedule__track`,"data-day":i},e.now&&e.now.day===i&&G(`span`,{class:`mh-schedule__now`,style:`left: ${eO(Z(e.now.minute,0,1440))}%`,"aria-hidden":`true`}),a.map((r,a)=>G(`div`,{class:B(`mh-schedule__block`,jb(`mh-schedule__block`,ZD(e.levels,r.value))),"data-day":i,"data-index":a,role:`button`,tabindex:n?-1:0,"aria-label":QD(r,e.levels,t.to),"aria-description":t.help,"aria-disabled":n?`true`:void 0,style:`left: ${eO(r.start)}%; width: ${eO(r.end-r.start)}%`},G(`span`,{class:`mh-schedule__handle mh-schedule__handle--start`,"data-edge":`start`,"aria-hidden":`true`}),G(`span`,{class:`mh-schedule__block-label`,"aria-hidden":`true`},e.levels.find(e=>e.value===r.value)?.label??r.value),G(`span`,{class:`mh-schedule__handle mh-schedule__handle--end`,"data-edge":`end`,"aria-hidden":`true`})))),G(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-schedule__add`),"data-add":i,"aria-label":`${t.add} ${o}`,title:`${t.add} ${o}`,disabled:n},QE(vt)))}),G(`div`,{class:`mh-schedule__legend`,"aria-hidden":`true`},e.levels.map(t=>G(`span`,{class:B(`mh-schedule__key`,jb(`mh-schedule__key`,ZD(e.levels,t.value)))},t.label)),e.base&&G(`span`,{class:`mh-schedule__key mh-schedule__key--base`},`${t.otherwise} ${e.base}`)))}var rO=(e,t,n)=>e.map((e,r)=>r===t?{...e,blocks:n}:e);function iO(e,t){(t.index===null?e.querySelector(`[data-add="${t.day}"]`):e.querySelector(`.mh-schedule__block[data-day="${t.day}"][data-index="${t.index}"]`))?.focus()}var aO=4;function oO(e,t,n){let r=null,i=()=>t().step??15,a=e=>UD(t().days[e]?.blocks??[]),o=(t,n)=>{let r=e.querySelector(`.mh-schedule__track[data-day="${t}"]`)?.getBoundingClientRect();return r&&r.width>0?Z((n-r.left)/r.width*BD,0,BD):0},s=(e,r,i)=>n(rO(t().days,e,r),i),c=n=>{if(t().disabled||n.button!==0||!(n.target instanceof Element))return;let i=n.target.closest(`.mh-schedule__block`),s=n.target.closest(`.mh-schedule__track`);if(!s)return;let c=Number(s.dataset.day);if(i){let e=Number(i.dataset.index),t=n.target.closest(`.mh-schedule__handle`)?.dataset.edge,s=a(c)[e];if(!s)return;r=t?{kind:`edge`,id:n.pointerId,day:c,index:e,edge:t}:{kind:`move`,id:n.pointerId,day:c,index:e,x:n.clientX,grab:o(c,n.clientX)-s.start,moved:!1}}else r={kind:`paint`,id:n.pointerId,day:c,x:n.clientX,anchor:o(c,n.clientX),index:null};n.preventDefault(),e.setPointerCapture?.(n.pointerId)},l=e=>{if(!r||e.pointerId!==r.id)return;let n=i(),c=o(r.day,e.clientX),l=a(r.day);if(r.kind===`edge`)s(r.day,KD(l,r.index,r.edge,c,n));else if(r.kind===`move`){if(!r.moved&&Math.abs(e.clientX-r.x)<aO)return;r.moved=!0;let t=l[r.index];t&&s(r.day,GD(l,r.index,HD(c-r.grab,n)-t.start))}else{if(r.index===null){if(Math.abs(e.clientX-r.x)<aO)return;let i=qD(l,r.anchor,t().levels[0]?.value??``,n,n);if(!i){r=null;return}r.index=i.index,s(r.day,i.blocks);return}let i=c<r.anchor?`start`:`end`,a=l[r.index];if(!a)return;let o=i===`start`?KD(l,r.index,`end`,Math.max(a.end,HD(r.anchor,n)),n):KD(l,r.index,`start`,Math.min(a.start,HD(r.anchor,n)),n);s(r.day,KD(o,r.index,i,c,n))}},u=n=>{if(!r||n.pointerId!==r.id)return;let o=r;r=null;let c=t(),l=a(o.day);if(o.kind===`move`&&!o.moved)s(o.day,YD(l,o.index,c.levels),{day:o.day,index:o.index});else if(o.kind===`paint`&&o.index===null){let e=qD(l,o.anchor,c.levels[0]?.value??``,c.length??60,i());e&&s(o.day,e.blocks,{day:o.day,index:e.index})}else iO(e,{day:o.day,index:o.index})},d=e=>{r&&e.pointerId===r.id&&(r=null)},f=e=>{let n=t();if(n.disabled||!(e.target instanceof HTMLElement)||!e.target.classList.contains(`mh-schedule__block`))return;let r=Number(e.target.dataset.day),o=Number(e.target.dataset.index),c=XD(a(r),o,e.key,e.shiftKey,n.levels,i());c&&(e.preventDefault(),s(r,c.blocks,{day:r,index:c.focus}))},p=e=>{let n=t(),r=e.target instanceof Element?e.target.closest(`.mh-schedule__add`):null;if(n.disabled||!r)return;let o=Number(r.dataset.add),c=a(o),l=JD(c,i());if(l===null)return;let u=qD(c,l,n.levels[0]?.value??``,n.length??60,i());u&&s(o,u.blocks,{day:o,index:u.index})};return e.addEventListener(`pointerdown`,c),e.addEventListener(`pointermove`,l),e.addEventListener(`pointerup`,u),e.addEventListener(`pointercancel`,d),e.addEventListener(`keydown`,f),e.addEventListener(`click`,p),()=>{e.removeEventListener(`pointerdown`,c),e.removeEventListener(`pointermove`,l),e.removeEventListener(`pointerup`,u),e.removeEventListener(`pointercancel`,d),e.removeEventListener(`keydown`,f),e.removeEventListener(`click`,p)}}function sO(e){let t={...e},n=kb(nO(t)),r=e=>{t={...e},Ab(n,nO(t))},i=()=>t.days.map(e=>({...e,blocks:UD(e.blocks)}));return{el:n,update:r,getDays:i,setDays:e=>r({...t,days:e}),destroy:oO(n,()=>t,(e,a)=>{r({...t,days:e}),a&&iO(n,a),t.onChange?.(i())})}}var cO=[`solar-home`,`solar-battery`,`solar-grid`,`grid-home`,`grid-battery`,`battery-home`,`battery-grid`],lO={solar:`Solar`,grid:`Grid`,battery:`Battery`,home:`Home`,producing:`producing`,importing:`importing`,exporting:`exporting`,charging:`charging`,discharging:`discharging`,using:`using`,idle:`idle`,unknown:`unknown`,to:`to`,import:`Import`,export:`Export`},uO=e=>X(e)&&e>0?e:0;function dO(e){if(X(e.home))return Math.max(0,e.home);let t=[e.solar,e.grid,e.battery].filter(e=>e!==void 0);return t.length===0||t.some(e=>!X(e))?null:Math.max(0,t.reduce((e,t)=>e+t,0))}function fO(e){let t=uO(e.solar),n=uO(e.grid),r=uO(X(e.grid)?-e.grid:0),i=uO(e.battery),a=uO(X(e.battery)?-e.battery:0),o=dO(e)??0,s=Math.min(t,o);o-=s;let c=t-s,l=Math.min(c,a);c-=l;let u=Math.min(c,r),d=Math.min(i,o);o-=d;let f=Math.min(n,o),p={"solar-home":s,"solar-battery":l,"solar-grid":u,"grid-home":f,"grid-battery":Math.min(n-f,a-l),"battery-home":d,"battery-grid":Math.min(i-d,r-u)};for(let e of cO)p[e]=Math.max(0,Math.round(p[e]));return p}var pO={solar:[50,15],grid:[14,55],home:[50,55],battery:[86,55]},mO={width:100,height:84},hO=(e,t)=>[e,[e[0]+(t[0]-e[0])/3,e[1]+(t[1]-e[1])/3],[e[0]+(t[0]-e[0])*2/3,e[1]+(t[1]-e[1])*2/3],t],{solar:gO,grid:_O,home:vO,battery:yO}=pO,bO={"solar-home":hO(gO,vO),"grid-home":hO(_O,vO),"battery-home":hO(yO,vO),"solar-grid":[gO,[30,15],[14,33],_O],"solar-battery":[gO,[70,15],[86,33],yO],"grid-battery":[_O,[14,82],[86,82],yO]};function xO(e){if(e===`battery-grid`){let[e,t,n,r]=bO[`grid-battery`];return[r,n,t,e]}return bO[e]}var SO=e=>`M${e[0][0]} ${e[0][1]}C${e[1][0]} ${e[1][1]} ${e[2][0]} ${e[2][1]} ${e[3][0]} ${e[3][1]}`;function CO(e,t=.62,n=2.6){let r=1-t,i=n=>r*r*r*e[0][n]+3*r*r*t*e[1][n]+3*r*t*t*e[2][n]+t*t*t*e[3][n],a=n=>3*r*r*(e[1][n]-e[0][n])+6*r*t*(e[2][n]-e[1][n])+3*t*t*(e[3][n]-e[2][n]),o=i(0),s=i(1),c=Math.hypot(a(0),a(1))||1,l=a(0)/c,u=a(1)/c,d=o-l*n,f=s-u*n,p=-u*n*.75,m=l*n*.75;return`M${K(d+p)} ${K(f+m)}L${K(o)} ${K(s)}L${K(d-p)} ${K(f-m)}`}function wO(e,t){let n=Math.sqrt(Z(e/Math.max(t,1),0,1));return{width:K(.9+n*2.1),seconds:K(1.6-n*1.25)}}var TO={"solar-home":`solar`,"solar-battery":`solar`,"solar-grid":`solar`,"grid-home":`grid`,"grid-battery":`grid`,"battery-home":`battery`,"battery-grid":`battery`},EO=[te,Mr,rt,E,S,Pe,On,c,Cn,Te,_];function DO(e,t=!1){return t?ze:X(e)?EO[Z(Math.round(e/10),0,10)]:Pe}function OO(e=!1){return B(`mh-energy-flow`,e&&`mh-energy-flow--compact`)}function kO(e){let t={...lO,...e.labels},n=e.format??tD,r=e.threshold??10,i=[],a=(e,n)=>({kind:e,icon:n,value:`–`,word:t[e],spoken:`${t[e]} ${t.unknown}`,idle:!0});if(e.solar!==void 0){if(!X(e.solar))i.push(a(`solar`,tt));else{let a=e.solar<r;i.push({kind:`solar`,icon:tt,value:n(e.solar),word:t.solar,spoken:a?`${t.solar} ${t.idle}`:`${t.solar} ${t.producing} ${n(e.solar)}`,idle:a})}}if(e.grid!==void 0){if(!X(e.grid))i.push(a(`grid`,ft));else{let a=Math.abs(e.grid)<r,o=a?t.grid:e.grid>0?t.import:t.export;i.push({kind:`grid`,icon:ft,value:n(e.grid),word:o,spoken:a?`${t.grid} ${t.idle}`:`${t.grid} ${e.grid>0?t.importing:t.exporting} ${n(e.grid)}`,idle:a})}}if(e.battery!==void 0){let o=X(e.batteryLevel)?`${Math.round(Z(e.batteryLevel,0,100))}%`:``;if(!X(e.battery))i.push({...a(`battery`,DO(e.batteryLevel)),word:o||t.battery,spoken:`${t.battery} ${t.unknown}${o?`, ${o}`:``}`});else{let a=Math.abs(e.battery)<r,s=a?t.idle:e.battery>0?`${t.discharging} ${n(e.battery)}`:`${t.charging} ${n(e.battery)}`;i.push({kind:`battery`,icon:DO(e.batteryLevel,!a&&e.battery<0),value:n(e.battery),word:o||t.battery,spoken:`${t.battery} ${s}${o?`, ${o}`:``}`,idle:a})}}let o=dO(e);return i.push(o===null?a(`home`,Xn):{kind:`home`,icon:Xn,value:n(o),word:t.home,spoken:`${t.home} ${t.using} ${n(o)}`,idle:o<r}),i}function AO(e){let t={...lO,...e.labels},n=e.format??tD,r=e.threshold??10,i=kO(e),a=new Set(i.map(e=>e.kind)),o={...fO(e),...e.flows},s=cO.filter(e=>{let[t,n]=e.split(`-`);return a.has(t)&&a.has(n)&&uO(o[e])>=r}),c=e.scale??Math.max(1e3,...s.map(e=>o[e])),l=Object.keys(bO).filter(e=>{let[t,n]=e.split(`-`);return a.has(t)&&a.has(n)}),{width:u,height:d}=mO;return G(`div`,{class:OO(e.compact),role:`group`,"aria-label":e.label??`Energy flow`},G(`div`,{class:`mh-energy-flow__stage`},G(`svg`,{class:`mh-energy-flow__svg`,viewBox:`0 0 ${u} ${d}`,"aria-hidden":`true`},l.map(e=>G(`path`,{class:`mh-energy-flow__track`,d:SO(bO[e])})),s.map(e=>{let t=wO(o[e],c);return G(`path`,{class:`mh-energy-flow__flow mh-energy-flow__flow--${TO[e]}`,d:SO(xO(e)),style:`--_w: ${t.width}; --_s: ${t.seconds}s`})}),s.map(e=>G(`path`,{class:`mh-energy-flow__arrow mh-energy-flow__arrow--${TO[e]}`,d:CO(xO(e))}))),i.map(e=>{let[t,n]=pO[e.kind];return G(`div`,{class:B(`mh-energy-flow__node`,`mh-energy-flow__node--${e.kind}`,e.idle&&`is-idle`),style:`left: ${K(t/u*100)}%; top: ${K(n/d*100)}%`,"aria-hidden":`true`},QE(e.icon,`mh-energy-flow__icon`),G(`span`,{class:`mh-energy-flow__value`},e.value),G(`span`,{class:`mh-energy-flow__word`},e.word))})),G(`ul`,{class:`mh-visually-hidden`},i.map(e=>G(`li`,{},e.spoken)),s.map(e=>{let[r,i]=e.split(`-`);return G(`li`,{},`${t[r]} ${t.to} ${t[i].toLowerCase()} ${n(o[e])}`)})))}function jO(e){let t=kb(AO(e));return{el:t,update:e=>Ab(t,AO(e))}}var MO={now:`Now`,cheapest:`Cheapest`,average:`average`,low:`low`,high:`high`,noData:`no data`};function NO(e,t,n=0){if(t<1)return null;let r=null;for(let i=Math.max(0,n);i+t<=e.length;i+=1){let n=e.slice(i,i+t);if(!n.every(X))continue;let a=n.reduce((e,t)=>e+t,0)/t;(!r||a<r.average-1e-12)&&(r={start:i,end:i+t,average:a})}return r}function PO(e,t,n){if(n-t<=1e-12)return`mid`;let r=(e-t)/(n-t);return r<1/3?`low`:r<2/3?`mid`:`high`}var FO=e=>e.toFixed(2),IO=e=>e.name??e.label;function LO(e,t,n){let r=e[t.end]?IO(e[t.end]):n??IO(e[t.end-1]);return`${IO(e[t.start])}–${r}`}function RO(e){let t={...MO,...e.labels},n=t=>`${(e.format??FO)(t)}${e.unit??``}`,r=e.label??`Energy prices`,i=e.prices.map((e,t)=>({p:e,i:t})).filter(e=>X(e.p.value));if(i.length===0)return`${r}: ${t.noData}`;let a=i.reduce((e,t)=>t.p.value<e.p.value?t:e),o=i.reduce((e,t)=>t.p.value>e.p.value?t:e),s=[`${e.prices.length} slots from ${IO(e.prices[0])}`],c=e.current===void 0?void 0:e.prices[e.current];c&&X(c.value)&&s.push(`${t.now.toLowerCase()} ${n(c.value)}`),s.push(`${t.low} ${n(a.p.value)} at ${IO(a.p)}`,`${t.high} ${n(o.p.value)} at ${IO(o.p)}`);let l=NO(e.prices.map(e=>e.value),e.window??3,e.windowFrom??e.current??0);return l&&s.push(`${t.cheapest.toLowerCase()} ${LO(e.prices,l,e.end)}, ${t.average} ${n(l.average)}`),`${r}: ${s.join(`, `)}`}function zO(e){return B(`mh-price-strip`,Mb(`mh-price-strip`,e))}function BO(e){let t={...MO,...e.labels},n=e.format??FO,r=Math.max(1,e.prices.length),i=e.prices.map(e=>e.value),a=i.filter(X),o=a.length?Math.min(...a):0,s=a.length?Math.max(...a):1,c=Tb(Math.min(0,o),Math.max(0,s),3),l=c.max-c.min||1,u=e=>K((e-c.min)/l*100),d=u(0),f=NO(i,e.window??3,e.windowFrom??e.current??0),p=e.labelEvery??(r<=12?1:3),m=e.current===void 0?void 0:e.prices[e.current],h=e.unit?G(`span`,{class:`mh-price-strip__unit`},e.unit):null;return G(`div`,{class:zO(e.size),role:`group`,"aria-label":e.label??`Energy prices`},G(`div`,{class:`mh-price-strip__head`,"aria-hidden":`true`},m&&G(`div`,{class:`mh-price-strip__stat mh-price-strip__now`},G(`span`,{class:`mh-price-strip__stat-label`},t.now),G(`span`,{class:`mh-price-strip__stat-value`},X(m.value)?n(m.value):`–`,X(m.value)&&h)),f&&G(`div`,{class:`mh-price-strip__stat mh-price-strip__cheap`},G(`span`,{class:`mh-price-strip__stat-label`},t.cheapest),G(`span`,{class:`mh-price-strip__stat-value`},LO(e.prices,f,e.end)),G(`span`,{class:`mh-price-strip__stat-note`},`${t.average} ${n(f.average)}${e.unit??``}`))),G(`div`,{class:`mh-price-strip__plot`,role:`img`,"aria-label":RO(e)},f&&G(`span`,{class:`mh-price-strip__window`,style:`left: ${K(f.start/r*100)}%; width: ${K((f.end-f.start)/r*100)}%`}),c.min<0&&G(`span`,{class:`mh-price-strip__zero`,style:`bottom: ${d}%`}),e.prices.map((t,n)=>{let r=t.value,i=B(`mh-price-strip__slot`,e.current!==void 0&&n<e.current&&`is-past`,n===e.current&&`is-now`,f&&n>=f.start&&n<f.end&&`is-cheap`,!X(r)&&`is-empty`);if(!X(r))return G(`span`,{class:i});let a=Math.max(u(r),d),c=Math.min(u(r),d);return G(`span`,{class:i},G(`span`,{class:`mh-price-strip__bar mh-price-strip__bar--${PO(r,o,s)}`,style:`bottom: ${c}%; height: ${K(Math.max(a-c,0))}%`}))})),G(`div`,{class:`mh-price-strip__labels`,"aria-hidden":`true`},e.prices.map((t,n)=>G(`span`,{class:B(`mh-price-strip__label`,n%p!==0&&n!==e.current&&`is-hidden`,n===e.current&&`is-now`)},t.label))))}function VO(e){let t=kb(BO(e));return{el:t,update:e=>Ab(t,BO(e))}}var HO={unplugged:`Unplugged`,plugged:`Plugged in`,charging:`Charging`,discharging:`Discharging`,full:`Full`,charge:`Charge`,limit:`Limit`,toFull:`to full`,to:`to`,noData:`Unknown`},UO={unplugged:Ue,plugged:Kr,charging:er,discharging:er,full:Kr},WO={size:36,center:18,radius:15.9155};function GO(e){let t=Z(e,0,100)/100*2*Math.PI,{center:n,radius:r}=WO,i=Math.sin(t),a=-Math.cos(t);return`M${K(n+i*(r-3))} ${K(n+a*(r-3))}L${K(n+i*(r+3))} ${K(n+a*(r+3))}`}function KO(e,t,n){if(!X(e))return null;let r=X(t)&&t<100?`${n.to} ${Math.round(t)}%`:n.toFull;return`${nD(e)} ${r}`}function qO(e){let t=X(e.level)&&e.level<(e.low??20);return B(`mh-charge-card`,e.state&&`mh-charge-card--${e.state}`,e.compact&&`mh-charge-card--compact`,t&&`is-low`,!X(e.level)&&`is-empty`)}function JO(e){let t={...HO,...e.labels},n=e.format??tD,r=X(e.level),i=r?Math.round(Z(e.level,0,100)):0,a=X(e.limit)&&e.limit<100,{size:o,center:s,radius:c}=WO,l=e.state===`charging`||e.state===`discharging`?KO(e.minutesLeft,e.limit,t):null,u=[];(e.state===`charging`||e.state===`discharging`)&&X(e.rate)&&u.push(G(`li`,{class:`mh-charge-card__fact mh-charge-card__fact--rate`},QE(er),n(e.rate))),l&&u.push(G(`li`,{class:`mh-charge-card__fact mh-charge-card__fact--time`},QE(lt),l)),a&&u.push(G(`li`,{class:`mh-charge-card__fact mh-charge-card__fact--limit`},`${t.limit} ${Math.round(e.limit)}%`)),e.detail&&u.push(G(`li`,{class:`mh-charge-card__fact mh-charge-card__fact--detail`},e.detail));let d=r?`${i}%${a?`, ${t.limit.toLowerCase()} ${Math.round(e.limit)}%`:``}`:t.noData;return G(`div`,{class:qO(e),role:`group`,"aria-label":e.name},G(`div`,{class:`mh-charge-card__ring`,role:`meter`,"aria-label":t.charge,"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":r?i:void 0,"aria-valuetext":d},G(`svg`,{class:`mh-charge-card__svg`,viewBox:`0 0 ${o} ${o}`,"aria-hidden":`true`},G(`circle`,{class:`mh-charge-card__track`,cx:s,cy:s,r:c}),r&&G(`circle`,{class:`mh-charge-card__fill`,cx:s,cy:s,r:c,style:`--_level: ${i}`}),a&&G(`path`,{class:`mh-charge-card__limit`,d:GO(e.limit)})),G(`span`,{class:`mh-charge-card__level`,"aria-hidden":`true`},r?String(i):`–`,r&&G(`span`,{class:`mh-charge-card__percent`},`%`))),G(`div`,{class:`mh-charge-card__body`},G(`div`,{class:`mh-charge-card__title`},QE(e.icon??(e.kind===`battery`?`M16 20H8V6H16M16.67 4H15V2H9V4H7.33C6.6 4 6 4.6 6 5.33V20.67C6 21.4 6.6 22 7.33 22H16.67C17.41 22 18 21.41 18 20.67V5.33C18 4.6 17.4 4 16.67 4M15 16H9V19H15V16M15 7H9V10H15V7M15 11.5H9V14.5H15V11.5Z`:`M18.92 2C18.72 1.42 18.16 1 17.5 1H6.5C5.84 1 5.29 1.42 5.08 2L3 8V16C3 16.55 3.45 17 4 17H5C5.55 17 6 16.55 6 16V15H18V16C18 16.55 18.45 17 19 17H20C20.55 17 21 16.55 21 16V8L18.92 2M6.85 3H17.14L18.22 6.11H5.77L6.85 3M19 13H5V8H19V13M7.5 9C8.33 9 9 9.67 9 10.5S8.33 12 7.5 12 6 11.33 6 10.5 6.67 9 7.5 9M16.5 9C17.33 9 18 9.67 18 10.5S17.33 12 16.5 12C15.67 12 15 11.33 15 10.5S15.67 9 16.5 9M7 20H11V18L17 21H13V23L7 20Z`),`mh-charge-card__icon`),G(`span`,{class:`mh-charge-card__name`},e.name)),e.state&&G(`span`,{class:`mh-charge-card__state`},QE(UO[e.state]),t[e.state]),u.length>0&&G(`ul`,{class:`mh-charge-card__facts`},u)))}function YO(e){let t=kb(JO(e));return{el:t,update:e=>Ab(t,JO(e))}}var XO={more:`more`,less:`less`,same:`About the same`,byNow:`by this time`,inAll:`in all`,against:`against`,noData:`no data`},ZO=(e,t)=>e.slice(0,t).reduce((e,t)=>e+(X(t)?t:0),0);function QO(e){let t=-1;e.current.forEach((e,n)=>{X(e)&&(t=n)});let n=Math.max(0,Math.min(e.upTo??t+1,Math.max(e.slots.length,e.current.length))),r=ZO(e.current,n),i=ZO(e.previous,n),a=ZO(e.previous,e.previous.length),o=r-i,s=i===0?null:o/Math.abs(i),c=e.same??.03;return{upTo:n,current:r,previousSoFar:i,previousAll:a,difference:o,ratio:s,trend:s===null?Math.abs(o)<1e-9?`same`:o>0?`more`:`less`:Math.abs(s)<c?`same`:o>0?`more`:`less`}}function $O(e,t){let n={...XO,...t.labels};if(e.trend===`same`)return n.same;let r=t.format??Db,i=e.ratio===null?``:` · ${Math.round(Math.abs(e.ratio)*100)}%`;return`${r(Math.abs(e.difference))}${t.unit?` ${t.unit}`:``} ${e.trend===`more`?n.more:n.less}${i}`}function ek(e,t=!1){return e===`same`?`neutral`:e===`more`===t?`good`:`bad`}function tk(e){return B(`mh-usage-comparison`,Mb(`mh-usage-comparison`,e))}var nk={more:Rr,less:fn,same:qe};function rk(e){let t={...XO,...e.labels},n=e.format??Db,r=e.periods??{current:`Today`,previous:`Yesterday`},i=e.label??`Energy use`,a=QO(e),o=Math.max(1,e.slots.length),s=[...e.current.slice(0,o),...e.previous.slice(0,o)].filter(X),c=Tb(0,Math.max(0,...s),3),l=c.max||1,u=e=>K(Math.max(0,Math.min(e,l))/l*100),d=e.labelEvery??(o<=12?1:6),f=e.unit?` ${e.unit}`:``,p=a.upTo<o,m=ek(a.trend,e.higherIsBetter),h=$O(a,e),g=p?`${r.previous} ${n(a.previousSoFar)}${f} ${t.byNow} · ${n(a.previousAll)}${f} ${t.inAll}`:`${r.previous} ${n(a.previousAll)}${f}`,_=e.slotNames??e.slots,v=o<=12?`; ${e.slots.map((r,i)=>{let a=e.current[i],o=e.previous[i];return`${_[i]??e.slots[i]} ${X(a)?n(a):t.noData} ${t.against} ${X(o)?n(o):t.noData}`}).join(`, `)}`:``,y=`${i}: ${r.current} ${n(a.current)}${f}, ${g}, ${h}${v}`,b=Math.max(...c.ticks.map(e=>Eb(e,c.step).length));return G(`div`,{class:tk(e.size),role:`group`,"aria-label":i},G(`div`,{class:`mh-usage-comparison__head`,"aria-hidden":`true`},G(`div`,{class:`mh-usage-comparison__total`},G(`span`,{class:`mh-usage-comparison__period`},r.current),G(`span`,{class:`mh-usage-comparison__value`},n(a.current),e.unit&&G(`span`,{class:`mh-usage-comparison__unit`},e.unit))),G(`span`,{class:`mh-usage-comparison__previous`},g),G(`span`,{class:`mh-usage-comparison__difference mh-usage-comparison__difference--${m}`},QE(nk[a.trend]),h)),G(`div`,{class:`mh-usage-comparison__chart`,style:`--_gutter: ${b}`},G(`div`,{class:`mh-usage-comparison__axis`,"aria-hidden":`true`},c.ticks.map(e=>G(`span`,{class:`mh-usage-comparison__tick`,style:`bottom: ${u(e)}%`},Eb(e,c.step)))),G(`div`,{class:`mh-usage-comparison__plot`,role:`img`,"aria-label":y},c.ticks.map(e=>G(`span`,{class:`mh-usage-comparison__grid`,style:`bottom: ${u(e)}%`})),e.slots.map((t,n)=>{let r=e.current[n],i=e.previous[n];return G(`span`,{class:B(`mh-usage-comparison__slot`,n>=a.upTo&&`is-ahead`)},X(i)&&G(`span`,{class:`mh-usage-comparison__bar mh-usage-comparison__bar--previous`,style:`height: ${u(i)}%`}),X(r)&&n<a.upTo&&G(`span`,{class:`mh-usage-comparison__bar mh-usage-comparison__bar--current`,style:`height: ${u(r)}%`}))})),G(`div`,{class:`mh-usage-comparison__labels`,"aria-hidden":`true`},e.slots.map((e,t)=>G(`span`,{class:B(`mh-usage-comparison__label`,t%d!==0&&`is-hidden`)},e)))),G(`div`,{class:`mh-usage-comparison__legend`,"aria-hidden":`true`},G(`span`,{class:`mh-usage-comparison__key mh-usage-comparison__key--current`},r.current),G(`span`,{class:`mh-usage-comparison__key mh-usage-comparison__key--previous`},r.previous)))}function ik(e){let t=kb(rk(e));return{el:t,update:e=>Ab(t,rk(e))}}var ak=(...e)=>M(`div`,{class:`ex-stack`},...e),ok=(...e)=>M(`div`,{class:`mh-grid`},...e),sk=e=>C(e,{variant:`label`,tone:`muted`}),Q=(e,t)=>V({title:t,body:e}).el,ck=e=>M(`div`,{style:`width: calc(var(--mh-control-lg) * 3.6); max-width: 100%`},e),lk=(e,t)=>{for(let[n,r]of Object.entries(_r(e.theme)))t.style.setProperty(n,r);return t},uk=(e,t=500)=>void setTimeout(e,t);function dk(e,t,n){let r=setInterval(()=>{e.isConnected?n():clearInterval(r)},t)}function fk(e,t,n){let r={...n},i=()=>r.on?typeof r.percentage==`number`?`On · ${lD(r.percentage)}`:`On`:`Off`,a=null,o=R({title:e,icon:t,active:r.on,state:i()}),s=e=>uk(()=>{r={...r,...e},a?.update(e),o.update({active:r.on,state:i()})});return a=gD({...r,label:`${e} fan`,onToggle:e=>s({on:e}),onPercentage:e=>s({percentage:e,on:e>0}),onOscillate:e=>s({oscillating:e}),onDirection:e=>s({direction:e}),onPreset:e=>s({preset:e})}),o.update({body:a.el}),o.el}function pk(e,t,n=!1){let r=R({title:e,icon:Zt,active:!!t.on,tone:`cool`,unavailable:n,state:t.on===!1?`Off`:`Now ${t.current??`–`}%`}),i=ED({...t,label:`${e} humidity`,onTarget:e=>uk(()=>i.update({target:e})),onMode:e=>uk(()=>i.update({mode:e})),onToggle:e=>uk(()=>{i.update({on:e,action:e?t.action:`off`}),r.update({active:e,state:e?`Now ${t.current??`–`}%`:`Off`})})});return r.update({body:i.el}),r.el}var mk=[{value:`comfort`,label:`21°`,color:5},{value:`eco`,label:`18°`,color:3},{value:`boost`,label:`23°`,color:1}],hk=()=>[{start:390,end:480,value:`comfort`},{start:1020,end:1350,value:`comfort`}],gk=()=>[{start:480,end:660,value:`comfort`},{start:660,end:900,value:`eco`},{start:900,end:1380,value:`comfort`}],_k=[{label:`Mon`,name:`Monday`,blocks:hk()},{label:`Tue`,name:`Tuesday`,blocks:hk()},{label:`Wed`,name:`Wednesday`,blocks:[...hk().slice(0,1),{start:720,end:780,value:`eco`},...hk().slice(1)]},{label:`Thu`,name:`Thursday`,blocks:hk()},{label:`Fri`,name:`Friday`,blocks:[hk()[0],{start:960,end:1410,value:`boost`}]},{label:`Sat`,name:`Saturday`,blocks:gk()},{label:`Sun`,name:`Sunday`,blocks:gk()}],vk=e=>`${String(Math.floor(e/60)).padStart(2,`0`)}:${String(e%60).padStart(2,`0`)}`;function yk(e,t=1600){let n=0,r=jO(e),i=()=>{n+=1;let t=Math.max(0,Math.sin(n%24/24*Math.PI))*5200,r=600+Math.round(Math.abs(Math.sin(n*1.7))*1400),i=30+n*3%60,a=0;t>r?a=-Math.min(3e3,t-r):i>35&&(a=Math.min(2500,r-t));let o=r-t-a;return{...e,solar:Math.round(t),home:r,battery:Math.round(a),grid:Math.round(o),batteryLevel:i}};return dk(r.el,t,()=>r.update(i())),r.el}var bk=[.31,.29,.24,.18,.15,.14,.17,.26,.34,.33,.27,.22,.19,.16,.13,.12,.18,.29,.41,.44,.38,.32,.28,.25],xk=e=>e.map((e,t)=>({label:String(t),name:`${String(t).padStart(2,`0`)}:00`,value:e})),Sk=[.31,.28,.27,.26,.27,.3,.52,.81,.64,.42,.38,.45,.61,.47,.39,null,null,null,null,null,null,null,null,null],Ck=[.33,.3,.29,.28,.28,.34,.66,.92,.71,.5,.44,.52,.7,.55,.48,.5,.62,.95,1.21,1.08,.86,.71,.52,.4],wk=[{id:`fan-control`,render:e=>lk(e,ak(sk(`Three speeds as steps, with oscillation; the icon spins faster with the speed and stands still under reduced motion`),ok(fk(`Bedroom`,ot,{on:!0,percentage:67,speedCount:3,oscillating:!0}),fk(`Living room`,Wn,{on:!0,percentage:40,direction:`forward`,preset:`breeze`,presets:[{value:`normal`,label:`Normal`},{value:`breeze`,label:`Breeze`},{value:`sleep`,label:`Sleep`}]})),sk(`A percentage slider (stepping one speed of eight), many presets as a select; off and unavailable`),ok(fk(`Study`,ot,{on:!0,percentage:25,speedCount:8,preset:`auto`,presets:[`auto`,`quiet`,`normal`,`strong`,`turbo`].map(e=>({value:e,label:e[0].toUpperCase()+e.slice(1)}))}),fk(`Loft`,ot,{on:!1,percentage:33,speedCount:3}),R({title:`Garage`,icon:ot,state:`Unavailable`,unavailable:!0,body:gD({on:!1,percentage:0,speedCount:4,disabled:!0}).el}).el)))},{id:`humidity-control`,render:e=>lk(e,ak(sk(`Tap − / + a few times: one target is sent 0.7 s after the last tap. The gauge shows the comfortable band, the target and the reading`),ok(pk(`Nursery`,{current:36,target:45,on:!0,action:`humidifying`,mode:`normal`,modes:[{value:`normal`,label:`Normal`},{value:`sleep`,label:`Sleep`},{value:`auto`,label:`Auto`}]}),pk(`Cellar`,{current:68,target:55,step:5,on:!0,action:`drying`,min:35,max:70})),sk(`Compact, idle, and without a reading; unavailable`),ok(pk(`Studio`,{current:47,target:50,compact:!0,action:`idle`}),pk(`Shed`,{current:null,target:50,on:!1,disabled:!0,compact:!0},!0))))},{id:`air-quality`,render:()=>ak(sk(`Carbon dioxide, particles and volatile compounds on good-to-poor bands, with the direction of the last readings`),ok(Q(zD({kind:`co2`,value:640,trend:[520,560,600,610,640],trendLabel:`Last 2 hours`}).el),Q(zD({kind:`co2`,value:1340,trend:[700,850,1020,1190,1340],trendLabel:`Last 2 hours`}).el),Q(zD({kind:`pm25`,value:22,trend:[40,34,30,26,22],trendLabel:`Since 06:00`}).el),Q(zD({kind:`voc`,value:3400,trend:[3300,3420,3380,3400],trendLabel:`Last hour`}).el)),sk(`In a control card; a custom reading with its own bands; no reading yet`),ok(R({title:`Kitchen`,icon:Je,state:`Window open since 14:20`,body:zD({kind:`co2`,value:980,trend:[1400,1300,1150,980]}).el}).el,Q(zD({name:`Pollen`,unit:`grains/m³`,value:38,bands:{moderate:20,poor:50,veryPoor:100,max:150},trend:[10,18,30,38]}).el),Q(zD({kind:`pm10`,value:null}).el)),sk(`Compact, for a watch`),ck(Q(zD({kind:`co2`,value:870,compact:!0,trend:[700,760,820,870]}).el)))},{id:`schedule-editor`,render:()=>{let e=sk(`Drag a block or its ends, drag on an empty stretch to draw one, tap a block to change its value; on a focused block the arrows move and stretch it, Enter changes it, Delete removes it.`),t=sO({label:`Living room heating`,days:_k,levels:mk,base:`16°`,now:{day:2,minute:880},onChange:t=>{let n=t.reduce((e,t)=>e+t.blocks.length,0),r=t[0]?.blocks[0];e.textContent=`${n} blocks this week${r?`; Monday starts ${vk(r.start)}`:``}`}}),n=sO({label:`Aquarium light`,days:[{label:`Daily`,blocks:[{start:540,end:720,value:`on`},{start:900,end:1260,value:`on`}]}],levels:[{value:`on`,label:`On`,color:`accent`}],base:`Off`,step:30}),r=sO({label:`Hot water (managed elsewhere)`,days:_k.slice(0,2).map(e=>({...e,blocks:[{start:300,end:420,value:`boost`}]})),levels:mk,disabled:!0});return ak(e,Q(t.el,`Living room heating`),sk(`On or off, half-hour steps`),Q(n.el,`Aquarium light`),sk(`Disabled`),Q(r.el,`Hot water`))}},{id:`energy-flow`,render:e=>lk(e,ak(sk(`A made-up day running fast: the dots move faster and the lines get wider with more power; chevrons show the direction, and the dots stand still under reduced motion`),M(`div`,{style:`max-width: calc(var(--mh-control-lg) * 9)`},Q(yk({label:`Energy now`,solar:3200,grid:-1100,battery:-800,home:1300,batteryLevel:64}),`Energy now`)),sk(`Evening: battery and grid share the load; night charging from the grid; no solar or battery`),ok(Q(jO({solar:0,grid:450,battery:900,batteryLevel:52}).el),Q(jO({solar:0,grid:3400,battery:-3e3,home:400,batteryLevel:18}).el),Q(jO({grid:760}).el)),sk(`Watch size, compact`),M(`div`,{class:`ex-row`},ck(Q(yk({compact:!0,solar:2100,grid:-400,battery:-600,home:1100,batteryLevel:80},2200))),ck(Q(jO({solar:null,grid:1200,battery:0,batteryLevel:100,compact:!0}).el)))))},{id:`price-strip`,render:()=>ak(sk(`Twenty-four hours, now at 09:00; the cheapest three hours ahead are shaded`),Q(VO({label:`Electricity prices today`,prices:xk(bk),current:9,unit:`/kWh`,end:`24:00`}).el,`Electricity today`),sk(`A two-hour window, small; tomorrow not yet known after 18:00`),ok(Q(VO({prices:xk(bk.map((e,t)=>t>=18?null:e)),current:2,window:2,size:`small`,unit:`/kWh`}).el),Q(VO({label:`Windy night`,prices:xk([.12,.06,-.02,-.04,.01,.08,.15,.22]),current:0,unit:`/kWh`,end:`08:00`}).el)))},{id:`charge-card`,render:()=>{let e={name:`Car`,level:46,limit:80,state:`charging`,rate:7400,minutesLeft:95,detail:`Range 180 km`},t=YO(e),n=e.level??0;return dk(t.el,1500,()=>{n=n>=80?46:n+2;let r=n>=80;t.update({...e,level:n,state:r?`full`:`charging`,minutesLeft:Math.round((80-n)/34*95),detail:`Range ${Math.round(n*3.9)} km`})}),ak(sk(`Charging towards an 80% limit (ticking along); a home battery feeding the house; low and unplugged`),ok(t.el,YO({name:`Home battery`,kind:`battery`,level:72,state:`discharging`,rate:1300,minutesLeft:260,detail:`Covers the evening`}).el,YO({name:`Bike`,level:14,state:`unplugged`,detail:`Plug in tonight`}).el,YO({name:`Van`,level:100,state:`full`,detail:`Ready since 05:40`}).el,YO({name:`Mower`,kind:`battery`,level:null,state:`plugged`}).el),sk(`Compact, for small tiles and watches`),M(`div`,{class:`ex-row`},ck(YO({name:`Car`,level:64,limit:80,state:`charging`,rate:11e3,minutesLeft:25,compact:!0}).el)))}},{id:`usage-comparison`,render:()=>ak(sk(`Today so far against yesterday by the hour; the totals compare the same hours`),Q(ik({label:`Electricity`,slots:Sk.map((e,t)=>String(t)),slotNames:Sk.map((e,t)=>`${String(t).padStart(2,`0`)}:00`),current:Sk,previous:Ck,unit:`kWh`}).el,`Electricity`),sk(`This week against last; more solar is the good direction`),ok(Q(ik({label:`Heating gas`,slots:[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],current:[8.2,9.1,7.4,10.3,null,null,null],previous:[7.1,7.9,7.6,8.8,9.4,11.2,10.6],periods:{current:`This week`,previous:`Last week`},unit:`m³`,size:`small`}).el),Q(ik({label:`Solar`,slots:[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],current:[14.1,18.6,21.2,9.8,16.4,22.5,19.9],previous:[12.2,13.5,15.1,11.4,12.8,17.6,18.3],periods:{current:`This week`,previous:`Last week`},unit:`kWh`,higherIsBetter:!0,size:`small`}).el)))}],Tk=[{id:`home`,label:`Home`,icon:rn},{id:`away`,label:`Away`,icon:Jn},{id:`night`,label:`Night`,icon:Fn}],Ek={states:{disarmed:`Disarmed`,arming:`Arming · {mode}`,armed:`Armed · {mode}`,pending:`Enter the code`,triggered:`Alarm triggered`,disarming:`Disarming`,unknown:`Unknown`},details:{disarmed:`Choose how to arm`,arming:`Leave before the time runs out`,armed:``,pending:`The alarm sounds when the time runs out`,triggered:`Enter the code to stop it`,disarming:``},enterCode:`Enter code`,codeEmpty:`No digits entered`,codeOne:`1 digit entered`,codeMany:`{n} digits entered`,keypad:`Keypad`,clear:`Clear`,back:`Delete last digit`,arm:`Arm {mode}`,armGroup:`Arm`,disarm:`Disarm`,cancel:`Cancel`},Dk={disarmed:mn,arming:ln,armed:Jn,pending:br,triggered:br,disarming:ln,unknown:mn};function Ok(e){return{...Ek,...e,states:{...Ek.states,...e?.states},details:{...Ek.details,...e?.details}}}var kk=(e,t)=>e.replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):e);function Ak(e){let t=Math.max(0,Math.ceil(e));return`${Math.floor(t/60)}:${String(t%60).padStart(2,`0`)}`}function jk(e,t){return e==null||!Number.isFinite(e)?null:Math.max(0,Math.ceil((e-t)/1e3))}function Mk(e,t,n){let r=Ok(e.labels),i=e.state??null,a=e.modes??Tk,o=a.find(t=>t.id===e.mode)?.label??e.mode??``,s=r.states[i??`unknown`],c=kk(s,{mode:o}).replace(/\s*·\s*$/,``),l=i?r.details[i]:``,u=!!e.disabled||i===`disarming`||i===null,d=i===`disarmed`,f=d?!!e.codeToArm:e.codeToDisarm??!0,p=f&&i!==null&&i!==`disarming`,m=f&&t===0,h=d?a.map(e=>({key:`arm:${e.id}`,kind:`arm`,mode:e.id,text:e.label,ariaLabel:kk(r.arm,{mode:e.label}),icon:e.icon,variant:`secondary`,disabled:u||m})):i===null?[]:[{key:`disarm`,kind:`disarm`,text:i===`arming`?r.cancel:r.disarm,icon:mn,variant:i===`arming`?`secondary`:`primary`,disabled:u||m}],g=i===`arming`||i===`pending`?jk(e.deadline,n):null,_=g!==null&&e.delay&&e.delay>0?Math.min(1,g/e.delay):null,v=t===0?r.codeEmpty:t===1?r.codeOne:kk(r.codeMany,{n:t});return{stateText:c,detail:l,icon:Dk[i??`unknown`],keypad:p,time:g===null?null:Ak(g),left:_,actions:h,codeText:v}}function Nk(e){return B(`mh-alarm-panel`,`mh-alarm-panel--${e.state??`unknown`}`,(e.state===`arming`||e.state===`disarming`)&&`is-busy`,!!e.error&&`is-error`,e.disabled&&`is-disabled`)}var Pk=[`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`clear`,`0`,`back`];function Fk(e){return B(`mh-alarm-panel__key`,e===`clear`?`mh-alarm-panel__key--clear`:e===`back`?`mh-alarm-panel__key--back`:`mh-alarm-panel__key--digit`)}function Ik(e,t){let n=t&&t>0?Math.max(t,e):e;return Array.from({length:n},(t,n)=>n<e)}function Lk(e,t,n){return t===`clear`?``:t===`back`?e.slice(0,-1):/^[0-9]$/.test(t)&&e.length<n?e+t:e}function Rk(e){return Math.max(1,e.codeLength&&e.codeLength>0?e.codeLength:e.maxCodeLength??12)}function zk(e){return e.actions.length===1&&!e.actions[0].disabled?e.actions[0]:null}function Bk(e){return e===`triggered`?`assertive`:`polite`}var Vk=$e;function Hk(e){let t={...e},n=``,r,i=M(`span`,{class:`mh-alarm-panel__icon`,"aria-hidden":`true`}),a=M(`span`,{class:`mh-alarm-panel__state`,"aria-live":`polite`}),o=M(`span`,{class:`mh-alarm-panel__detail`}),s=M(`span`,{class:`mh-alarm-panel__text`},a),c=M(`span`,{class:`mh-alarm-panel__time`,role:`timer`}),l=M(`div`,{class:`mh-alarm-panel__status`},i,s),u=M(`span`,{class:`mh-alarm-panel__bar-fill`}),d=M(`div`,{class:`mh-alarm-panel__bar`,"aria-hidden":`true`},u),f=M(`span`,{class:`mh-alarm-panel__slots`,"aria-hidden":`true`}),p=M(`span`,{class:`mh-visually-hidden`,"aria-live":`polite`}),h=M(`div`,{class:`mh-alarm-panel__code`},f,p),g=M(`p`,{class:`mh-alarm-panel__message`,role:`alert`}),_=M(`div`,{class:`mh-alarm-panel__keypad`,role:`group`}),v=new Map;for(let e of Pk){let t=M(`button`,{type:`button`,class:Fk(e)});t.addEventListener(`click`,()=>D(e)),v.set(e,t),_.append(t)}let y=M(`div`,{class:`mh-alarm-panel__actions`}),b=M(`div`,{role:`group`}),x=``,S=``,C=new Map,w=t.state,T=t.error,E=e=>{if(e.disabled)return;let r=n===``?void 0:n;n=``,k(),e.kind===`arm`?t.onArm?.(e.mode,r):t.onDisarm?.(r)};function D(e){if(t.disabled)return;let r=Lk(n,e,Rk(t));r!==n&&(n=r,k())}b.addEventListener(`keydown`,e=>{let r=e.target;if(r.closest(`input, textarea, select, [contenteditable]`))return;let i=Mk(t,n.length,Date.now());if(i.keypad||e.key===`Enter`){if(/^[0-9]$/.test(e.key))D(e.key);else if(e.key===`Backspace`)D(`back`);else if(e.key===`Escape`&&n)D(`clear`);else if(e.key===`Enter`&&r.tagName!==`BUTTON`){let e=zk(i);if(e)E(e);else return}else return;e.preventDefault(),e.stopPropagation()}});let O=()=>{let e=(t.state===`arming`||t.state===`pending`)&&jk(t.deadline,Date.now())!==null;e&&r===void 0&&(r=setInterval(k,1e3)),!e&&r!==void 0&&(clearInterval(r),r=void 0)};function k(){let e=Ok(t.labels),r=Mk(t,n.length,Date.now());b.className=Nk(t),b.setAttribute(`aria-label`,t.label??`Alarm`),r.icon!==x&&(x=r.icon,i.replaceChildren(H(r.icon))),a.textContent=r.stateText,a.setAttribute(`aria-live`,Bk(t.state)),o.textContent=r.detail,m(s,r.detail?[a,o]:[a]),c.textContent=r.time??``,m(l,r.time===null?[i,s]:[i,s,c]),r.left!==null&&u.style.setProperty(`--_left`,String(r.left));let w=Ik(n.length,t.codeLength);w.length===0?f.replaceChildren(M(`span`,{class:`mh-alarm-panel__prompt`},e.enterCode)):f.replaceChildren(...w.map(e=>M(`span`,{class:B(`mh-alarm-panel__slot`,e&&`is-filled`)}))),p.textContent=r.codeText,g.textContent=t.error??``,_.setAttribute(`aria-label`,e.keypad);for(let[r,i]of v)r===`clear`?i.textContent=e.clear:r===`back`?(i.setAttribute(`aria-label`,e.back),i.title=e.back,i.firstChild||i.append(H(Vk))):i.textContent=r,i.disabled=!!t.disabled||(r===`clear`||r===`back`?n===``:n.length>=Rk(t));let T=r.actions.map(e=>e.key).join();if(T!==S){S=T,C.clear();let i=r.actions.map(e=>{let r=P({label:e.text,icon:e.icon,variant:e.variant,size:`large`,onClick:()=>E(Mk(t,n.length,Date.now()).actions.find(t=>t.key===e.key)??e)});return C.set(e.key,r),r.el}),a=r.actions[0]?.kind===`arm`;y.replaceChildren(a?M(`div`,{class:`mh-alarm-panel__modes`,role:`group`,"aria-label":e.armGroup},...i):i[0]??``)}y.querySelector(`.mh-alarm-panel__modes`)?.setAttribute(`aria-label`,e.armGroup);for(let e of r.actions){let t=C.get(e.key);t.el.className=B(z(e.variant,`large`),`mh-alarm-panel__action`,`mh-alarm-panel__action--${e.kind}`),t.setLabel(e.text),t.setDisabled(e.disabled),e.ariaLabel?t.el.setAttribute(`aria-label`,e.ariaLabel):t.el.removeAttribute(`aria-label`)}m(b,[l,...r.left===null?[]:[d],...r.keypad?[h]:[],...t.error?[g]:[],...r.keypad?[_]:[],...r.actions.length?[y]:[]]),O()}return k(),{el:b,update(e){t={...t,...e},(t.state!==w||t.error&&t.error!==T)&&(n=``),w=t.state,T=t.error,k()},clearCode(){n=``,k()},destroy(){clearInterval(r),r=void 0}}}var Uk={states:{connected:`Connected`,connecting:`Connecting`,reconnecting:`Reconnecting`,offline:`Offline`,rejected:`Access refused`},retryIn:`Retrying in {time}`,retrying:`Retrying…`,retry:`Retry now`};function Wk(e){return{...Uk,...e,states:{...Uk.states,...e?.states}}}var Gk={connected:Ir,connecting:jr,reconnecting:jr,offline:Ze,rejected:Mt},Kk=e=>Gk[e];function qk(e){let t=Math.max(0,Math.ceil(e));if(t<60)return`${t} s`;let n=Math.floor(t/60),r=t%60;return r?`${n} min ${r} s`:`${n} min`}function Jk(e,t){let n=Wk(e.labels),r=e.state===`connected`,i=r&&!!e.quietWhenConnected,a=e.detail?.trim()??``;if(!a&&!r&&e.state!==`rejected`&&e.retryAt!==null&&e.retryAt!==void 0&&Number.isFinite(e.retryAt)){let r=Math.ceil((e.retryAt-t)/1e3);a=r>0?n.retryIn.replace(`{time}`,qk(r)):n.retrying}return a||=e.server?.trim()??``,{stateText:n.states[e.state],detail:i?``:a,quiet:i,retry:!r&&!!e.onRetry,busy:e.state===`connecting`||e.state===`reconnecting`}}function Yk(e,t){return B(`mh-connection-status`,`mh-connection-status--${e.state}`,e.variant===`banner`&&`mh-connection-status--banner`,t.quiet&&`is-quiet`,t.busy&&`is-busy`)}var Xk=B(z(`secondary`,`small`),`mh-connection-status__retry`);function Zk(e){let t={...e},n,r=M(`span`,{class:`mh-connection-status__icon`,"aria-hidden":`true`}),i=M(`span`,{class:`mh-connection-status__state`,role:`status`}),a=M(`span`,{class:`mh-connection-status__detail`}),o=M(`span`,{class:`mh-connection-status__text`},i),s=M(`button`,{type:`button`,class:Xk},M(`span`,{class:`mh-button__label`}));s.addEventListener(`click`,()=>t.onRetry?.());let c=M(`div`,{}),l=``,u=()=>{let e=t.state!==`connected`&&t.state!==`rejected`&&!t.detail&&typeof t.retryAt==`number`&&t.retryAt>Date.now();e&&n===void 0&&(n=setInterval(d,1e3)),!e&&n!==void 0&&(clearInterval(n),n=void 0)};function d(){let e=Wk(t.labels),n=Jk(t,Date.now());c.className=Yk(t,n);let d=Kk(t.state);d!==l&&(l=d,r.replaceChildren(H(d))),i.textContent=n.stateText,i.classList.toggle(`mh-visually-hidden`,n.quiet),a.textContent=n.detail,m(o,n.detail?[i,a]:[i]),s.firstElementChild.textContent=e.retry,m(c,n.retry?[r,o,s]:[r,o]),u()}return d(),{el:c,update(e){t={...t,...e},d()},destroy(){clearInterval(n),n=void 0}}}var Qk={title:`Connect to your home server`,addressStep:`Server`,address:`Server address`,addressHelp:`The address you open the server at, with its port`,addressRequired:`Enter the server address`,addressInvalid:`That doesn’t look like an address`,accessStep:`Access`,method:`How to sign in`,methodToken:`Access token`,methodQr:`QR code`,token:`Access token`,tokenHelp:`Create a long-lived access token on the server and paste it here`,tokenRequired:`Paste the access token`,tokenMissing:`Scan a code or paste an access token first`,qrCode:`Setup code`,qrCaption:`Scan with a phone that is signed in to the server`,scan:`Scan a code`,scanned:`Code scanned`,scanEmpty:`No setup details in that code`,testStep:`Test`,test:`Test connection`,testing:`Testing…`,success:`Connected`,failed:`Couldn’t connect`,finish:`Finish`,cancel:`Cancel`};function $k(e){let t=e.trim();if(!t)return null;/^[a-z][a-z0-9+.-]*:\/\//i.test(t)||(t=`http://${t}`);try{let e=new URL(t);return e.protocol!==`http:`&&e.protocol!==`https:`||!e.hostname?null:`${e.protocol}//${e.host}${e.pathname.replace(/\/+$/,``)}`}catch{return null}}function eA(e){return{...Qk,...e}}function tA(e){return e.methods?.length?[...new Set(e.methods)]:e.qrValue||e.onScan?[`token`,`qr`]:[`token`]}function nA(e){return[{value:`token`,label:e.methodToken,icon:Dr},{value:`qr`,label:e.methodQr,icon:n}]}function rA(e,t,n,r){let i=$k(e),a={address:i??e.trim(),token:t.trim()},o={values:a};return e.trim()?i||(o.addressError=r.addressInvalid):o.addressError=r.addressRequired,a.token||(n===`token`?o.tokenError=r.tokenRequired:o.error=r.tokenMissing),o}function iA(e){return B(`mh-device-setup__result`,e===`success`&&`is-success`,e===`error`&&`is-error`,e===`testing`&&`is-testing`)}var aA=e=>e===`success`?jn:e===`error`?Zn:null;function oA(e,t,n,r,...i){return M(`li`,{class:B(`mh-device-setup__step`,`mh-device-setup__step--${e}`)},M(`span`,{class:`mh-device-setup__number`,"aria-hidden":`true`},String(t)),M(`div`,{class:`mh-device-setup__content`},M(`h${r}`,{class:`mh-device-setup__step-title`},n),...i))}function sA(e){let t={...e},r=eA(t.labels),i=tA(t),a=t.method&&i.includes(t.method)?t.method:i[0],o=`idle`,s=``,c=``,l=0,u=t.headingLevel??2,d=I(`mh-device-setup-title`),f=()=>{o!==`idle`&&(l++,o=`idle`,s=``),le(),t.onChange?.({address:p.getValue(),token:h.getValue(),method:a})},p=qt({label:r.address,type:`url`,inputMode:`url`,autocomplete:`off`,placeholder:t.placeholder,helper:r.addressHelp,value:t.address??``,icon:An,onInput:()=>{p.setError(void 0),f()}});p.input.setAttribute(`spellcheck`,`false`),p.input.setAttribute(`autocapitalize`,`off`);let h=wf({label:r.token,kind:`key`,copyable:!1,helper:r.tokenHelp,value:t.token??``,onInput:()=>{h.setError(void 0),c=``,f()}}),g=i.length>1?D({label:r.method,options:nA(r).filter(e=>i.includes(e.value)),value:a,fullWidth:!0,onChange:e=>{a=e,f()}}):null;g?.el.classList.add(`mh-device-setup__method`);let _=null,v=null,y=M(`div`,{class:`mh-device-setup__qr`}),b=M(`p`,{class:`mh-device-setup__scanned`,role:`status`}),x=P({label:r.scan,icon:n,variant:`secondary`,onClick:()=>void se()});x.el.className=B(z(`secondary`),`mh-device-setup__scan`);let S=M(`div`,{class:`mh-device-setup__panel mh-device-setup__panel--token`},h.el),C=M(`div`,{class:`mh-device-setup__panel mh-device-setup__panel--qr`}),w=P({label:r.test,icon:Ur,variant:`secondary`,onClick:()=>void ae()});w.el.className=B(z(`secondary`),`mh-device-setup__test`);let T=M(`span`,{class:`mh-device-setup__result-icon`,"aria-hidden":`true`}),E=M(`span`,{class:`mh-device-setup__result-text`}),O=M(`p`,{class:iA(`idle`),role:`status`},T,E),k=t.onCancel?P({label:r.cancel,variant:`text`,onClick:()=>t.onCancel?.()}):null,A=P({label:r.finish,variant:`primary`,type:`submit`});A.el.classList.add(`mh-device-setup__finish`),k?.el.classList.add(`mh-device-setup__cancel`);let j=M(`div`,{class:`mh-device-setup__actions`},k?.el??null,A.el),N=M(`h${u}`,{class:`mh-device-setup__title`,id:d},r.title),ee=M(`p`,{class:`mh-device-setup__intro`}),te=M(`div`,{class:`mh-device-setup__head`},N),ne=M(`div`,{class:`mh-device-setup__access`}),re=M(`ol`,{class:`mh-device-setup__steps`},oA(`address`,1,r.addressStep,u+1,p.el),oA(`access`,2,r.accessStep,u+1,ne),oA(`test`,3,r.testStep,u+1,M(`div`,{class:`mh-device-setup__check`},w.el,O))),ie=M(`form`,{class:`mh-device-setup`,novalidate:!0,"aria-labelledby":d},te,re,j),F=()=>rA(p.getValue(),h.getValue(),a,r).values;async function ae(){let e=rA(p.getValue(),h.getValue(),a,r);if(p.setError(e.addressError),h.setError(e.tokenError),e.addressError||e.tokenError||e.error)return o=e.error?`error`:`idle`,s=e.error??``,le(),(e.addressError?p.input:e.tokenError?h.input:null)?.focus(),!1;if(!t.onTest)return!1;let n=++l;o=`testing`,s=r.testing,le();let i;try{i=await t.onTest(e.values)}catch{i={ok:!1}}return n===l&&(o=i.ok?`success`:`error`,s=i.message?.trim()||(i.ok?r.success:r.failed),!i.ok&&i.field===`address`&&p.setError(s),!i.ok&&i.field===`token`&&a===`token`&&h.setError(s),le(),i.ok)}let oe=e=>{e.address!==void 0&&(p.setValue(e.address),p.setError(void 0)),e.token!==void 0&&(h.setValue(e.token),h.setError(void 0)),f()};async function se(){if(!t.onScan)return;let e;try{e=await t.onScan()}catch{e=null}if(!e)return;let n=!!e.address?.trim()||!!e.token?.trim();oe(n?e:{}),c=n?r.scanned:r.scanEmpty,le()}ie.addEventListener(`submit`,e=>{e.preventDefault(),ce()});async function ce(){if(o!==`testing`){if(o!==`success`){if((t.requireTest??!0)&&t.onTest){if(!await ae())return}else{let e=rA(p.getValue(),h.getValue(),a,r);if(p.setError(e.addressError),h.setError(e.tokenError),e.addressError||e.tokenError||e.error){e.error&&(o=`error`,s=e.error),le();return}}}t.onFinish?.(F())}}function le(){N.textContent=r.title,ee.textContent=t.intro??``,m(te,t.intro?[N,ee]:[N]),a===`qr`&&(t.qrValue&&(!_||v!==t.qrValue)&&(_=ab({value:t.qrValue,label:r.qrCode,caption:r.qrCaption}),v=t.qrValue,y.replaceChildren(_.el)),b.textContent=c,m(C,[...t.qrValue?[y]:[],...t.onScan?[x.el]:[],...c?[b]:[]])),m(ne,[...g?[g.el]:[],a===`qr`?C:S]),w.setLoading(o===`testing`),w.setDisabled(!t.onTest),O.className=iA(o);let e=aA(o);T.replaceChildren(...e?[H(e)]:[]),E.textContent=s,O.hidden=!s,A.setDisabled(o===`testing`)}return le(),{el:ie,getValues:F,fill:oe,test:ae,update(e){t={...t,...e},r=eA(t.labels),`placeholder`in e&&(p.input.placeholder=e.placeholder??``),le()}}}var cA={title:`Someone is at the door`,answer:`Answer`,talk:`Talk`,dismiss:`Dismiss`,end:`End`,picture:`Live picture from {door}`,noPicture:`No picture`},lA=4/3;function uA(e){return{...cA,...e}}function dA(e){return B(`mh-doorbell`,e.takeover&&`mh-doorbell--takeover`,(e.ringing??!0)&&!e.answered&&`is-ringing`,e.answered&&`is-answered`,e.talking&&`is-talking`,!e.picture&&`is-empty`)}function fA(e){let t=uA(e.labels),n=[];return!e.answered&&(e.canAnswer??!!e.onAnswer)&&n.push({action:`answer`,label:t.answer,icon:he,variant:`primary`}),(e.canTalk??!!e.onTalk)&&n.push({action:`talk`,label:t.talk,icon:Re,variant:`tonal`,pressed:!!e.talking}),n.push({action:`dismiss`,label:e.answered?t.end:t.dismiss,icon:e.answered?tr:Hr,variant:e.answered?`danger`:`secondary`}),n}function pA(e){return B(z(e.variant,`large`),`mh-doorbell__action`,`mh-doorbell__action--${e.action}`)}function mA(e){let t=uA(e.labels);return{title:e.visitor?.trim()||t.title,detail:[e.door,e.when?.trim()].filter(Boolean).join(` · `)}}function hA(e){return String(Math.round((e&&e>0&&Number.isFinite(e)?e:lA)*1e4)/1e4)}var gA=`button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])`;function _A(e,t){if(t.key!==`Tab`)return!1;let n=Array.from(e.querySelectorAll(gA));if(n.length===0)return!1;let r=n[0],i=n[n.length-1],a=e.ownerDocument.activeElement,o=!!a&&e.contains(a);return t.shiftKey&&(a===r||!o)?(t.preventDefault(),i.focus(),!0):!t.shiftKey&&(a===i||!o)&&(t.preventDefault(),r.focus(),!0)}var vA=e=>e===void 0?1:e??0;function yA(e){let t={...e},n=!1,r=null,i=null,a=I(`mh-doorbell-title`),o=I(`mh-doorbell-detail`),s=M(`span`,{class:`mh-doorbell__bell`,"aria-hidden":`true`},H(wt)),c=M(`h2`,{class:`mh-doorbell__title`,id:a}),l=M(`p`,{class:`mh-doorbell__detail`,id:o}),u=M(`div`,{class:`mh-doorbell__header`},s,M(`div`,{class:`mh-doorbell__text`},c,l)),d=M(`span`,{class:`mh-doorbell__placeholder-text`}),f=M(`span`,{class:`mh-doorbell__placeholder`},H(Le),d),p=M(`img`,{class:`mh-doorbell__image`,alt:``,decoding:`async`,referrerpolicy:`no-referrer`}),h=M(`div`,{class:`mh-doorbell__picture`},f),g=M(`div`,{class:`mh-doorbell__actions`}),_=M(`div`,{class:`mh-doorbell__panel`},u,h,g),v=M(`div`,{role:`alertdialog`,"aria-labelledby":a,"aria-describedby":o},_),y=new Map,b=``;p.addEventListener(`error`,()=>{n=!0,S()}),p.addEventListener(`load`,()=>{n&&(n=!1,S())}),v.addEventListener(`keydown`,e=>{t.takeover&&(e.key===`Escape`?(e.preventDefault(),e.stopPropagation(),t.onDismiss?.()):_A(v,e))});let x=e=>{e===`answer`?t.onAnswer?.():e===`talk`?t.onTalk?.(!t.talking):t.onDismiss?.()},S=()=>{let e=uA(t.labels),a=mA(t),o=!!t.src&&!n;v.className=dA({...t,picture:o}),t.takeover?v.setAttribute(`aria-modal`,`true`):v.removeAttribute(`aria-modal`),c.textContent=a.title,l.textContent=a.detail,d.textContent=e.noPicture,h.style.aspectRatio=hA(t.aspect),p.alt=e.picture.replace(`{door}`,t.door),o?((p.getAttribute(`src`)===null||i?.src!==t.src)&&(p.src=t.src),p.parentNode!==h&&h.append(p)):p.remove();let s=vA(t.refreshEvery);(!i||i.src!==(t.src??null)||i.every!==s)&&(r?.stop(),i={src:t.src??null,every:s},r=t.src?oi(v,t.src,s,e=>p.src=e):null);let u=fA(t),f=u.map(e=>e.action).join();if(f!==b){b=f;let e=new Map(y);y.clear();for(let t of u){let n=e.get(t.action)??P({label:t.label,icon:t.icon,variant:t.variant,size:`large`,onClick:()=>x(t.action)});y.set(t.action,n)}m(g,u.map(e=>y.get(e.action).el))}for(let e of u){let t=y.get(e.action);t.el.className=pA(e),t.setLabel(e.label);let n=t.el.querySelector(`.mh-icon`),r=H(e.icon);n&&n.querySelector(`path`)?.getAttribute(`d`)!==r.querySelector(`path`)?.getAttribute(`d`)&&n.replaceWith(r),e.pressed===void 0?t.el.removeAttribute(`aria-pressed`):t.el.setAttribute(`aria-pressed`,String(e.pressed))}};return S(),{el:v,update(e){`src`in e&&e.src!==t.src&&(n=!1),t={...t,...e},S()},focus(){v.querySelector(`.mh-doorbell__action`)?.focus()},destroy(){r?.stop(),r=null}}}var bA={titles:{smoke:`Smoke detected`,co:`Carbon monoxide detected`,gas:`Gas detected`,leak:`Water leak`,heat:`Too hot`,freeze:`Freezing`,other:`Hazard`},cleared:`Cleared: {title}`,since:`since {time}`,silence:`Silence`,dismiss:`Dismiss`,advice:`What to do`};function xA(e){return{...bA,...e,titles:{...bA.titles,...e?.titles}}}var SA={smoke:Fr,co:be,gas:me,leak:zn,heat:Gr,freeze:Xe,other:sn},CA=(e,t=`alarm`)=>t===`cleared`?jn:SA[e];function wA(e){return B(`mh-hazard-banner`,`mh-hazard-banner--${e.kind}`,`mh-hazard-banner--${e.severity??`alarm`}`)}function TA(e){let t=xA(e.labels),n=e.title?.trim()||t.titles[e.kind],r=(e.severity??`alarm`)===`cleared`&&!e.title?.trim()?t.cleared.replace(`{title}`,n):n,i=e.since?.trim()?t.since.replace(`{time}`,e.since.trim()):``;return{title:r,where:[e.where?.trim(),i].filter(Boolean).join(` · `)}}var EA=e=>(typeof e==`string`?[e]:[...e??[]]).map(e=>e.trim()).filter(Boolean);function DA(e){let t=xA(e.labels),n=(e.actions??[]).map(e=>({id:e.id,label:e.label,variant:e.primary?`primary`:`secondary`,kind:`action`}));return e.onSilence&&n.push({id:`silence`,label:t.silence,variant:`secondary`,icon:Qt,kind:`silence`}),e.onDismiss&&n.push({id:`dismiss`,label:t.dismiss,variant:`text`,kind:`dismiss`}),n}function OA(e){return B(z(e.variant,`large`),`mh-hazard-banner__action`,`mh-hazard-banner__action--${e.kind}`)}var kA=e=>(e??`alarm`)===`cleared`?`status`:`alert`;function AA(e){let t={...e},n=I(`mh-hazard-title`),r=M(`section`,{"aria-labelledby":n}),i=()=>{let e=xA(t.labels),i=TA(t),a=EA(t.advice),o=DA(t),s=r.contains(document.activeElement)?document.activeElement.dataset.action:void 0;r.className=wA(t),r.setAttribute(`role`,kA(t.severity));let c=M(`h${t.headingLevel??2}`,{class:`mh-hazard-banner__title`,id:n},i.title),l=M(`div`,{class:`mh-hazard-banner__body`},c,i.where?M(`p`,{class:`mh-hazard-banner__where`},i.where):null,a.length?M(`ol`,{class:`mh-hazard-banner__advice`,"aria-label":e.advice},...a.map(e=>M(`li`,{},e))):null),u=o.length?M(`div`,{class:`mh-hazard-banner__actions`},...o.map(e=>{let n=M(`button`,{type:`button`,class:OA(e),"data-action":e.id},e.icon?H(e.icon):null,M(`span`,{class:`mh-button__label`},e.label));return n.addEventListener(`click`,()=>e.kind===`silence`?t.onSilence?.():e.kind===`dismiss`?t.onDismiss?.():t.onAction?.(e.id)),n})):null;r.replaceChildren(M(`span`,{class:`mh-hazard-banner__icon`,"aria-hidden":`true`},H(CA(t.kind,t.severity))),l,...u?[u]:[]),s!==void 0&&Array.from(r.querySelectorAll(`.mh-hazard-banner__action`)).find(e=>e.dataset.action===s)?.focus()};return i(),{el:r,update(e){t={...t,...e},i()}}}var jA={title:`Doors and windows`,open:`{n} open`,allShut:`All shut`,shouldBeShut:`should be shut`,closed:`Closed`};function MA(e){return{...jA,...e}}var NA={door:Oe,window:Pr,garage:Gn,gate:Mn,other:Oe},PA={door:Ce,window:Lt,garage:ur,gate:Gt,other:Ce},FA=(e,t=!0)=>(t?NA:PA)[e??`other`];function IA(e){let t=MA(e.labels),n=e.items.filter(e=>e.open),r=n.filter(e=>e.alert),i=n.filter(e=>!e.alert),a=e.showClosed?e.items.filter(e=>!e.open):[],o=r.length>0||!!e.warning&&n.length>0;return{count:n.length,warning:o,countText:n.length===0?t.allShut:t.open.replace(`{n}`,String(n.length)),items:[...r,...i,...a],icon:o?sn:n.length===0?jn:Oe}}function LA(e){return B(`mh-openings-summary`,e.warning&&`is-warning`,e.count===0&&`is-clear`)}function RA(e){return B(`mh-openings-summary__item`,e.open&&e.alert&&`is-alert`,!e.open&&`is-closed`)}function zA(e,t){let n=MA(t);return[e.area?.trim(),e.open?e.since?.trim():n.closed].filter(Boolean).join(` · `)}function BA(e,t){let n=MA(t.labels),r=zA(e,t.labels),i=[M(`span`,{class:`mh-openings-summary__item-icon`,"aria-hidden":`true`},H(FA(e.kind,e.open))),M(`span`,{class:`mh-openings-summary__item-text`},M(`span`,{class:`mh-openings-summary__name`},e.name),r?M(`span`,{class:`mh-openings-summary__meta`},r):null),e.open&&e.alert?M(`span`,{class:`mh-openings-summary__flag`},H(sn),M(`span`,{class:`mh-visually-hidden`},n.shouldBeShut)):null],a=t.onSelect?M(`button`,{type:`button`,class:`mh-openings-summary__row`,onclick:(()=>t.onSelect?.(e.id))},...i):M(`span`,{class:`mh-openings-summary__row`},...i);return M(`li`,{class:RA(e)},a)}function VA(e){let t={...e},n=I(`mh-openings-title`),r=M(`section`,{"aria-labelledby":n}),i=()=>{let e=MA(t.labels),i=IA(t);r.className=LA(i);let a=M(`h${t.headingLevel??3}`,{class:`mh-openings-summary__title`,id:n},e.title),o=M(`div`,{class:`mh-openings-summary__header`},M(`span`,{class:`mh-openings-summary__icon`,"aria-hidden":`true`},H(i.icon)),M(`div`,{class:`mh-openings-summary__heading`},a,M(`span`,{class:`mh-openings-summary__count`,"aria-live":`polite`},i.countText))),s=i.warning&&t.reason?.trim()?M(`p`,{class:`mh-openings-summary__reason`},t.reason.trim()):null,c=i.items.length?M(`ul`,{class:`mh-openings-summary__list`},...i.items.map(e=>BA(e,t))):null,l=r.contains(document.activeElement)?document.activeElement.closest(`li`)?.dataset.id:void 0;r.replaceChildren(o,...s?[s]:[],...c?[c]:[]),c?.querySelectorAll(`li`).forEach((e,t)=>{e.dataset.id=i.items[t].id,l!==void 0&&e.dataset.id===l&&e.querySelector(`button`)?.focus()})};return i(),{el:r,update(e){t={...t,...e},i()}}}var HA={label:`People`,home:`Home`,away:`Away`,unknown:`Unknown`,summary:`{n} of {total} home`};function UA(e){return{...HA,...e}}function WA(e=!1){return B(`mh-people-strip`,e&&`mh-people-strip--compact`)}function GA(e){return B(`mh-people-strip__person`,`mh-people-strip__person--${e.where}`)}var KA={home:Xt,away:s,zone:we,unknown:Sn},qA=e=>KA[e];function JA(e,t){let n=UA(t);return[e.where===`zone`?e.zone?.trim()||n.away:n[e.where],e.since?.trim()].filter(Boolean).join(` · `)}function YA(e,t){let n=UA(t);if(e.length===0)return n.label;let r=e.filter(e=>e.where===`home`).length;return`${n.label}, ${n.summary.replace(`{n}`,String(r)).replace(`{total}`,String(e.length))}`}function XA(e,t){let n=Iv({name:e.name,src:e.picture,size:t.compact?`medium`:`large`}).el,r=M(`span`,{class:`mh-people-strip__face`,"aria-hidden":`true`},n,M(`span`,{class:`mh-people-strip__badge`},H(qA(e.where)))),i=M(`span`,{class:B(`mh-people-strip__text`,t.compact&&`mh-visually-hidden`)},M(`span`,{class:`mh-people-strip__name`},e.name),M(`span`,{class:`mh-people-strip__place`},JA(e,t.labels))),a=t.compact?`${e.name}: ${JA(e,t.labels)}`:void 0,o=t.onSelect?M(`button`,{type:`button`,class:`mh-people-strip__main`,title:a,onclick:(()=>t.onSelect?.(e.id))},r,i):M(`span`,{class:`mh-people-strip__main`,title:a},r,i);return M(`li`,{class:GA(e)},o)}function ZA(e){let t={...e},n=M(`ul`,{}),r=()=>{n.className=WA(t.compact),n.setAttribute(`aria-label`,YA(t.people,t.labels)),n.replaceChildren(...t.people.map(e=>XA(e,t)))};return r(),{el:n,update(e){t={...t,...e},r()}}}var QA=(...e)=>M(`div`,{class:`ex-stack`},...e),$A=(...e)=>M(`div`,{class:`mh-grid`},...e),ej=(...e)=>M(`div`,{class:`ex-row`},...e),tj=e=>C(e,{variant:`label`,tone:`muted`}),nj=(e,t=600)=>void setTimeout(e,t),rj=(e,t)=>R({title:e,icon:rn,body:t}).el,ij=`1234`;function aj(){let e=tj(`Demo code ${ij}. Arm, wait for the exit delay, then use “Open a door”.`),t,n=(e,t={})=>r.update({state:e,deadline:null,delay:null,error:null,...t}),r=Hk({label:`House alarm`,state:`disarmed`,onArm:e=>{n(`arming`,{mode:e,deadline:Date.now()+1e4,delay:10}),t=setTimeout(()=>n(`armed`,{mode:e}),1e4)},onDisarm:e=>{e!==ij&&e!==void 0?r.update({error:`Wrong code`}):(clearTimeout(t),n(`disarming`),nj(()=>n(`disarmed`)))}}),i=P({label:`Open a door`,variant:`secondary`,size:`small`,onClick:()=>{clearTimeout(t),n(`pending`,{deadline:Date.now()+15e3,delay:15}),t=setTimeout(()=>n(`triggered`),15e3)}});return QA(e,rj(`House alarm`,r.el),ej(i.el))}var oj=`data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20300%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%235d6b80%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%232a3140%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22url(%23g)%22%2F%3E%3Crect%20x%3D%22250%22%20y%3D%2240%22%20width%3D%22110%22%20height%3D%22260%22%20fill%3D%22%233b2f2a%22%2F%3E%3Ccircle%20cx%3D%22340%22%20cy%3D%22175%22%20r%3D%225%22%20fill%3D%22%23c9b27a%22%2F%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%22120%22%20r%3D%2242%22%20fill%3D%22%23c8a68a%22%2F%3E%3Cpath%20d%3D%22M70%20300c0-70%2036-120%2080-120s80%2050%2080%20120z%22%20fill%3D%22%2332557a%22%2F%3E%3Crect%20x%3D%2240%22%20y%3D%22250%22%20width%3D%2270%22%20height%3D%2250%22%20rx%3D%224%22%20fill%3D%22%23a87b4f%22%2F%3E%3C%2Fsvg%3E`;function sj(){let e=null,t=()=>{e?.destroy(),e?.el.remove(),e=null,n.el.focus()},n=P({label:`Ring the doorbell`,icon:`bell`,onClick:()=>{let n=yA({door:`Front door`,visitor:`Parcel delivery`,when:`Just now`,src:oj,refreshEvery:0,takeover:!0,onAnswer:()=>n.update({answered:!0}),onTalk:e=>n.update({talking:e}),onDismiss:t});e=n,document.body.append(n.el),n.focus()}}),r=yA({door:`Side gate`,when:`10:42`,src:oj,refreshEvery:0,onAnswer:()=>r.update({answered:!0}),onTalk:e=>r.update({talking:e}),onDismiss:()=>r.update({answered:!1,talking:!1,ringing:!1})});return QA(tj(`The takeover covers the screen, keeps focus inside and closes with Escape`),ej(n.el),tj(`Inline: answer, then hold a conversation with Talk; End stops the call`),M(`div`,{style:`max-width: 32rem`},r.el),tj(`Without a picture, and without Answer or Talk`),M(`div`,{style:`max-width: 32rem`},yA({door:`Back door`,when:`2 min ago`,ringing:!1,onDismiss:()=>void 0}).el))}var cj=[{id:`robin`,name:`Robin Vale`,where:`home`,since:`2 h`},{id:`kit`,name:`Kit Harrow`,where:`zone`,zone:`Studio`,since:`25 min`},{id:`ash`,name:`Ash Merrow`,where:`away`,since:`3 h`},{id:`juno`,name:`Juno Pell`,where:`home`,since:`6 h`},{id:`sol`,name:`Sol Brannock`,where:`unknown`}];function lj(){let e=tj(`Tap someone`);return QA(tj(`Home is lit with a ring; away and in a place are dimmed, with a badge for where`),ZA({people:cj,onSelect:t=>e.textContent=`Selected ${cj.find(e=>e.id===t).name}`}).el,e,tj(`Compact (watches, narrow strips): avatars only, the words spoken and in the tooltip`),ZA({people:cj,compact:!0}).el)}var uj=[{id:`skylight`,name:`Skylight`,kind:`window`,open:!0,area:`Landing`,since:`1 h`,alert:!0},{id:`bath`,name:`Bathroom window`,kind:`window`,open:!0,area:`Upstairs`,since:`40 min`},{id:`back`,name:`Back door`,kind:`door`,open:!0,area:`Kitchen`,since:`5 min`},{id:`garage`,name:`Garage door`,kind:`garage`,open:!1},{id:`gate`,name:`Garden gate`,kind:`gate`,open:!1}];function dj(){let e=uj.map(e=>({...e})),t=VA({items:e,reason:`Rain expected within the hour`,onSelect:n=>{e=e.map(e=>e.id===n?{...e,open:!e.open,since:e.open?void 0:`Just now`}:e),t.update({items:e})}});return QA(tj(`Tap an item to shut it (or open it again); the one that should be shut comes first`),$A(t.el,VA({items:uj.map(e=>({...e,alert:!1}))}).el,VA({items:uj.map(e=>({...e,open:!1}))}).el),tj(`With closed items listed`),M(`div`,{style:`max-width: 24rem`},VA({items:uj.slice(2),showClosed:!0}).el))}function fj(){let e=AA({kind:`smoke`,where:`Kitchen`,since:`10:42`,advice:[`Leave the house now and close doors behind you`,`Call the fire service from outside`],actions:[{id:`call`,label:`Call for help`,primary:!0}],onSilence:()=>e.update({onSilence:void 0,severity:`warning`,advice:`Siren silenced. Check the kitchen before the all clear.`,onDismiss:()=>e.update({severity:`cleared`,advice:void 0,actions:[],onDismiss:void 0})}),onAction:()=>void 0});return QA(tj(`An alarm: Silence turns it into a warning, Dismiss then clears it`),e.el,tj(`Warnings and a cleared hazard`),AA({kind:`leak`,severity:`warning`,where:`Utility room, under the sink`,since:`3 min ago`,advice:`Turn off the water at the main valve.`,actions:[{id:`valve`,label:`Shut off water`}],onAction:()=>void 0}).el,AA({kind:`freeze`,severity:`warning`,where:`Garden room`,advice:`Pipes may freeze tonight.`}).el,AA({kind:`co`,severity:`cleared`,where:`Boiler cupboard`,since:`09:15`,onDismiss:()=>void 0}).el)}function pj(){let e=Zk({state:`connected`,server:`homeassistant.local`,variant:`banner`,onRetry:()=>n()}),t,n=()=>{clearTimeout(t),e.update({state:`connecting`,retryAt:null}),t=setTimeout(()=>e.update({state:`connected`}),1200)},r=P({label:`Drop the connection`,variant:`secondary`,size:`small`,onClick:()=>{clearTimeout(t),e.update({state:`reconnecting`,retryAt:Date.now()+8e3}),t=setTimeout(n,8e3)}});return QA(tj(`Banner: drop the connection to see the retry countdown`),e.el,ej(r.el),tj(`Pills`),ej(Zk({state:`connected`,server:`192.0.2.10`}).el,Zk({state:`connected`,quietWhenConnected:!0}).el,Zk({state:`connecting`}).el,Zk({state:`reconnecting`,retryAt:Date.now()+75e3,onRetry:()=>void 0}).el,Zk({state:`offline`,detail:`No network`,onRetry:()=>void 0}).el,Zk({state:`rejected`,detail:`Check the access token in Settings`}).el))}var mj=e=>new Promise(t=>nj(()=>{let n=new URL(e.address).hostname;n!==`192.0.2.10`&&n!==`homeassistant.local`?t({ok:!1,field:`address`,message:`No server answered at that address`}):e.token.startsWith(`fake-`)?t({ok:!0,message:`Connected to Home`}):t({ok:!1,field:`token`,message:`The server refused that token`})},1200));function hj(){let e=tj(`Try http://192.0.2.10:8123 with the token fake-token-for-docs; other values show the errors.`),t=sA({placeholder:`http://192.0.2.10:8123`,intro:`This screen talks to your home server directly.`,qrValue:`${$k(`192.0.2.10:8123`)}/pair?code=EXAMPLE-ONLY`,onScan:()=>new Promise(e=>nj(()=>e({address:`http://homeassistant.local:8123`,token:`fake-scanned-token`}),800)),onTest:mj,onFinish:t=>e.textContent=`Finished with ${t.address}`,onCancel:()=>e.textContent=`Cancelled`});return QA(e,M(`div`,{style:`max-width: 36rem`},t.el))}var gj=[{id:`alarm-panel`,render:()=>QA(aj(),tj(`States: exit delay (no code to cancel), entry delay with a fixed-length code, triggered`),$A(rj(`Arming`,Hk({state:`arming`,mode:`away`,deadline:Date.now()+4e4,delay:60,codeToDisarm:!1}).el),rj(`Entry delay`,Hk({state:`pending`,deadline:Date.now()+25e3,delay:30,codeLength:4}).el),rj(`Triggered`,Hk({state:`triggered`,error:`Wrong code`}).el)),tj(`Arming that needs the code, with two modes`),M(`div`,{style:`max-width: 24rem`},rj(`Studio alarm`,Hk({state:`disarmed`,codeToArm:!0,modes:[{id:`away`,label:`Away`},{id:`night`,label:`Night`}]}).el)))},{id:`doorbell`,render:sj},{id:`people-strip`,render:lj},{id:`openings-summary`,render:dj},{id:`hazard-banner`,render:fj},{id:`connection-status`,render:pj},{id:`device-setup`,render:hj}],_j={states:{idle:`Ready`,running:`Running`,paused:`Paused`,finished:`Finished`,error:`Needs attention`},left:e=>`${e} left`,progress:`Progress`,stages:`Stages`,pause:`Pause`,resume:`Resume`,dismiss:`Done`};function vj(e){if(!Number.isFinite(e)||e<=0)return`0 min`;if(e<60)return`< 1 min`;let t=Math.round(e/60),n=Math.floor(t/60),r=t%60;return n===0?`${t} min`:r===0?`${n} h`:`${n} h ${r} min`}function yj(e){return e.state===`finished`?100:typeof e.progress==`number`?Math.max(0,Math.min(100,e.progress)):typeof e.remaining==`number`&&typeof e.duration==`number`&&e.duration>0?Math.round(Math.max(0,Math.min(100,(1-e.remaining/e.duration)*100))*10)/10:null}function bj(e){let t=e.state===`finished`?1/0:typeof e.stage==`number`?e.stage:-1,n=e.state===`running`||e.state===`paused`||e.state===`error`;return(e.stages??[]).map((e,r)=>({label:e,status:r<t?`done`:r===t&&n?`current`:`next`}))}function xj(e){return B(`mh-appliance-cycle`,`mh-appliance-cycle--${e.state}`)}function Sj(e){return B(`mh-appliance-cycle__stage`,`is-${e}`)}function Cj(e,t){return e.programme?`${t.states[e.state]} · ${e.programme}`:t.states[e.state]}var wj=pr;function Tj(e){let t={...e},n=R({title:t.name,icon:t.icon??wj}),r=M(`div`,{class:`mh-appliance-cycle__body`}),i=M(`span`,{class:`mh-visually-hidden`,"aria-live":`polite`}),a=P({label:``,variant:`tonal`,size:`small`,onClick:()=>t.onDismiss?.()});a.el.classList.add(`mh-appliance-cycle__dismiss`);let o=U({icon:ee,label:``,filled:!0,onClick:()=>t.state===`paused`?t.onResume?.():t.onPause?.()});o.el.classList.add(`mh-appliance-cycle__toggle`);let s=()=>{let e={..._j,...t.labels,states:{..._j.states,...t.labels?.states}},s=[],c=yj(t),l=(t.state===`running`||t.state===`paused`)&&typeof t.remaining==`number`;if((l||t.endsAt&&t.state!==`finished`)&&s.push(M(`p`,{class:`mh-appliance-cycle__time`},l?M(`span`,{class:`mh-appliance-cycle__left`},e.left(vj(t.remaining))):null,t.endsAt?M(`span`,{class:`mh-appliance-cycle__ends`},t.endsAt):null)),t.state===`error`&&t.error&&s.push(M(`p`,{class:`mh-appliance-cycle__error`,role:`alert`},t.error)),t.state===`finished`&&s.push(M(`div`,{class:`mh-appliance-cycle__done`},M(`span`,{class:`mh-appliance-cycle__done-icon`},H(xr)),M(`span`,{class:`mh-appliance-cycle__done-text`},t.endsAt??e.states.finished),t.onDismiss?a.el:null)),t.state!==`idle`&&t.state!==`finished`&&c!==null){let n=gi({label:e.progress,value:c,valueText:`${Math.round(c)}%`,tone:t.state===`error`?`danger`:`accent`});n.el.classList.add(`mh-appliance-cycle__progress`),s.push(n.el)}let u=bj(t);u.length&&s.push(M(`ol`,{class:`mh-appliance-cycle__stages`,"aria-label":e.stages},...u.map(e=>M(`li`,{class:Sj(e.status),"aria-current":e.status===`current`?`step`:null},M(`span`,{class:`mh-appliance-cycle__stage-label`},e.label))))),a.setLabel(e.dismiss),i.textContent!==e.states[t.state]&&(i.textContent=e.states[t.state]),s.push(i),m(r,s);let d=t.state===`paused`,f=t.state===`running`&&!!t.onPause||d&&!!t.onResume;f&&(o.setIcon(d?fe:ee),o.el.setAttribute(`aria-label`,d?e.resume:e.pause),o.el.title=d?e.resume:e.pause);let p=f?o.el:null;n.update({title:t.name,icon:t.state===`finished`?xr:t.icon??wj,state:Cj(t,e),active:t.state===`running`||t.state===`finished`,unavailable:t.unavailable,control:p,body:r}),n.el.classList.add(...xj(t).split(` `))};return s(),{el:n.el,update(e){t={...t,...e},s()}}}function Ej(e){if(`points`in e)return[...e.points];let{x:t,y:n,width:r,height:i}=e;return[[t,n],[t+r,n],[t+r,n+i],[t,n+i]]}function Dj(e){return Ej(e).map(([e,t])=>`${e},${t}`).join(` `)}function Oj(e){let t=Ej(e);if(t.length===0)return[0,0];let n=0,r=0,i=0;for(let e=0;e<t.length;e++){let[a,o]=t[e],[s,c]=t[(e+1)%t.length],l=a*c-s*o;n+=l,r+=(a+s)*l,i+=(o+c)*l}return Math.abs(n)<1e-9?[t.reduce((e,t)=>e+t[0],0)/t.length,t.reduce((e,t)=>e+t[1],0)/t.length]:[r/(3*n),i/(3*n)]}function kj(e){if(e.length===0)return{x:0,y:0,width:1,height:1};let t=e.map(e=>e[0]),n=e.map(e=>e[1]),r=Math.min(...t),i=Math.min(...n);return{x:r,y:i,width:Math.max(Math.max(...t)-r,1e-6),height:Math.max(Math.max(...n)-i,1e-6)}}function Aj(e,t=[]){return kj([...e.flatMap(e=>Ej(e.shape)),...t.map(e=>[e.x,e.y])])}function jj(e,t){return{left:(e[0]-t.x)/t.width*100,top:(e[1]-t.y)/t.height*100}}function Mj(e){let t=e.rooms.filter(e=>!e.disabled).map(e=>{let[t,n]=e.labelAt??Oj(e.shape);return{kind:`room`,id:e.id,x:t,y:n}}),n=e.onMarker?(e.markers??[]).map(e=>({kind:`marker`,id:e.id,x:e.x,y:e.y})):[];return[...t,...n]}var Nj={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]};function Pj(e,t,n){if(e.length===0)return null;if(n===`Home`)return 0;if(n===`End`)return e.length-1;let r=Nj[n],i=e[t];if(!r||!i)return null;let a=null,o=1/0,s=!1;return e.forEach((e,n)=>{if(n===t)return;let c=e.x-i.x,l=e.y-i.y,u=c*r[0]+l*r[1];if(u<=1e-9)return;let d=Math.abs(c*r[1]-l*r[0]),f=d<=u,p=u+d*2;(f&&!s||f===s&&p<o)&&(a=n,o=p,s=f)}),a}function Fj(e,t,n){let r=(t,n)=>e.findIndex(e=>e.id===t&&(!n||e.kind===n)),i=t===null?-1:e.findIndex(e=>`${e.kind}:${e.id}`===t);if(i>=0)return i;let a=r(n,`room`);return a>=0?a:0}function Ij(e){return e.summary?`${e.name}, ${e.summary}`:e.name}function Lj(e){return e.state?`${e.label}, ${e.state}`:e.label}function Rj(e){return typeof e.light==`number`&&e.light>0?Math.min(1,e.light/100):0}function zj(e,t){return B(`mh-floor-plan__room`,Rj(e)>0&&`is-lit`,e.climate&&`is-${e.climate}`,e.alert&&`is-alert`,t&&`is-selected`,e.disabled&&`is-disabled`)}function Bj(e,t){let n=e.tone??`accent`;return B(`mh-floor-plan__marker`,n!==`accent`&&`mh-floor-plan__marker--${n}`,t&&`mh-floor-plan__marker--button`,e.active&&`is-active`)}function Vj(e,t,n){let r=[];for(let t of e)t.alert&&r.push({id:t.id,kind:`alert`,points:Dj(t.shape)});let i=e.find(e=>e.id===t);i&&r.push({id:i.id,kind:`selected`,points:Dj(i.shape)});let a=e.find(e=>e.id===n);return a&&r.push({id:a.id,kind:`focus`,points:Dj(a.shape)}),r}function Hj(e){return`${e.x} ${e.y} ${e.width} ${e.height}`}function Uj(e,t){let n=jj(e.labelAt??Oj(e.shape),t),r=kj(Ej(e.shape)).width;return{left:`${n.left}%`,top:`${n.top}%`,maxWidth:`${r/t.width*100}%`}}var Wj=`http://www.w3.org/2000/svg`;function Gj(e){try{return e.matches(`:focus-visible`)}catch{return!0}}var Kj=(e,t={})=>{let n=document.createElementNS(Wj,e);for(let[e,r]of Object.entries(t))n.setAttribute(e,r);return n};function qj(e){return`mh-floor-plan-glow-${e.replace(/[^a-zA-Z0-9_-]/g,``)}`}function Jj(e){let t={...e},n=qj(I(`g`)),r=Kj(`radialGradient`,{id:n,class:`mh-floor-plan__gradient`,cx:`50%`,cy:`50%`,r:`65%`});r.append(Kj(`stop`,{offset:`0`,class:`mh-floor-plan__stop mh-floor-plan__stop--core`}),Kj(`stop`,{offset:`1`,class:`mh-floor-plan__stop mh-floor-plan__stop--edge`}));let i=Kj(`defs`);i.append(r);let a=Kj(`g`,{class:`mh-floor-plan__rooms`}),o=Kj(`g`,{class:`mh-floor-plan__rings`,"aria-hidden":`true`}),s=Kj(`svg`,{class:`mh-floor-plan__svg`,preserveAspectRatio:`xMidYMid meet`});s.append(i,a,o);let c=M(`div`,{class:`mh-floor-plan__labels`,"aria-hidden":`true`}),l=M(`div`,{class:`mh-floor-plan__markers`}),u=M(`div`,{class:`mh-floor-plan__canvas`},s,c,l),d=M(`div`,{class:`mh-floor-plan`,role:`group`},u),f=new Map,p=new Map,h=null,g=null,_=e=>e.kind===`room`?f.get(e.id)?.g:p.get(e.id),v=e=>{let n=t.rooms.find(t=>t.id===e);n&&!n.disabled&&(h=`room:${e}`,t.onRoom?.(e),y())},y=()=>{let e=t.bounds??Aj(t.rooms,t.markers);d.setAttribute(`aria-label`,t.label),u.style.setProperty(`aspect-ratio`,`${e.width} / ${e.height}`),s.setAttribute(`viewBox`,Hj(e));let r=Mj(t),i=Fj(r,h,t.selected),_=r[i]?`${r[i].kind}:${r[i].id}`:null;for(let[e,n]of f)t.rooms.some(t=>t.id===e)||(n.g.remove(),f.delete(e));let b=t.rooms.map(e=>{let r=f.get(e.id);if(!r){let t=Kj(`g`,{role:`button`});t.addEventListener(`click`,()=>v(e.id)),t.addEventListener(`focus`,()=>{g=Gj(t)?e.id:null,h=`room:${e.id}`,y()}),t.addEventListener(`blur`,()=>{g=null,y()});let i=Kj(`polygon`,{class:`mh-floor-plan__shape`}),a=Kj(`polygon`,{class:`mh-floor-plan__glow`,fill:`url(#${n})`});t.append(i),r={g:t,shape:i,glow:a},f.set(e.id,r)}let i=Dj(e.shape),a=Rj(e);return r.g.setAttribute(`class`,zj(e,t.selected===e.id)),r.g.setAttribute(`aria-label`,Ij(e)),r.g.style.setProperty(`--_level`,String(a)),t.selected===e.id?r.g.setAttribute(`aria-current`,`true`):r.g.removeAttribute(`aria-current`),e.disabled?(r.g.setAttribute(`aria-disabled`,`true`),r.g.removeAttribute(`tabindex`)):(r.g.removeAttribute(`aria-disabled`),r.g.setAttribute(`tabindex`,_===`room:${e.id}`?`0`:`-1`)),r.shape.setAttribute(`points`,i),r.glow.setAttribute(`points`,i),a>0?r.g.append(r.glow):r.glow.remove(),r.g});m(a,b),o.replaceChildren(...Vj(t.rooms,t.selected,g).map(e=>Kj(`polygon`,{class:`mh-floor-plan__ring mh-floor-plan__ring--${e.kind}`,points:e.points}))),c.hidden=t.showNames===!1,c.replaceChildren(...t.showNames===!1?[]:t.rooms.map(t=>{let n=Uj(t,e),r=M(`span`,{class:B(`mh-floor-plan__label`,t.disabled&&`is-disabled`)},M(`span`,{class:`mh-floor-plan__name`},t.name),t.summary?M(`span`,{class:`mh-floor-plan__summary`},t.summary):null);return r.style.left=n.left,r.style.top=n.top,r.style.maxWidth=n.maxWidth,r}));let x=!!t.onMarker,S=t.markers??[];for(let[e,t]of p)S.some(t=>t.id===e)&&t.tagName===`BUTTON`===x||(t.remove(),p.delete(e));let C=S.map(n=>{let r=p.get(n.id);if(!r){if(x){let e=M(`button`,{type:`button`});e.addEventListener(`click`,()=>{h=`marker:${n.id}`,t.onMarker?.(n.id),y()}),e.addEventListener(`focus`,()=>{h=`marker:${n.id}`,y()}),r=e}else r=M(`span`,{role:`img`});p.set(n.id,r)}let i=jj([n.x,n.y],e);return r.className=Bj(n,x),r.setAttribute(`aria-label`,Lj(n)),x&&(r.setAttribute(`title`,Lj(n)),r.setAttribute(`tabindex`,_===`marker:${n.id}`?`0`:`-1`)),r.style.left=`${i.left}%`,r.style.top=`${i.top}%`,r.replaceChildren(H(n.icon)),r});m(l,C)};return d.addEventListener(`keydown`,e=>{let n=Mj(t),r=n.findIndex(t=>_(t)===e.target);if(r<0)return;let i=n[r];if(i.kind===`room`&&(e.key===`Enter`||e.key===` `)){e.preventDefault(),v(i.id);return}let a=Pj(n,r,e.key);if(a===null){e.key in Nj&&e.preventDefault();return}e.preventDefault();let o=n[a];h=`${o.kind}:${o.id}`,y(),_(o)?.focus()}),y(),{el:d,update(e){t={...t,...e},y()}}}var Yj={watering:e=>`Watering ${e}`,left:e=>`${e} left`,next:e=>`Next run ${e}`,skipped:`Next run skipped for rain`,idle:`No run planned`,run:e=>`Run ${e}`,stop:`Stop`,rainSkip:`Skip for rain`,zones:`Zones`,progress:`Progress`,minutes:e=>`${e} min`};function Xj(e,t){let n=e.running?e.zones.find(t=>t.id===e.running.zone):void 0;return e.running&&n?`${t.watering(n.name)} · ${t.left(vj(e.running.remaining))}`:e.rainSkip?t.skipped:e.nextRun?t.next(e.nextRun):t.idle}function Zj(e){if(!e.running)return null;let t=e.zones.find(t=>t.id===e.running.zone),n=e.running.duration??(t?t.duration*60:0);return n>0?Math.round(Math.max(0,Math.min(100,(1-e.running.remaining/n)*100))*10)/10:null}function Qj(e){return B(`mh-irrigation-zones`,e.running&&`is-running`,e.rainSkip&&`is-skipping`)}function $j(e,t){return B(`mh-irrigation-zones__zone`,e&&`is-running`,t&&`is-disabled`)}var eM=Tn,tM=qn,nM=Ie;function rM(e){let t={...e},n=R({title:t.name,icon:t.icon??eM}),r=M(`div`,{class:`mh-irrigation-zones__body`}),i=M(`ul`,{class:`mh-irrigation-zones__zones`}),a=P({label:``,icon:nM,variant:`secondary`,size:`small`,onClick:()=>t.onStop?.()});a.el.classList.add(`mh-irrigation-zones__stop`);let o=M(`span`,{class:`mh-irrigation-zones__now-name`}),s=M(`span`,{class:`mh-irrigation-zones__now-left`}),c=null,l=``,u=M(`div`,{class:`mh-irrigation-zones__now`},M(`span`,{class:`mh-irrigation-zones__now-icon`},H(eM)),M(`span`,{class:`mh-irrigation-zones__now-text`},o,s),a.el),d=new Map,f=null,p=``,h=()=>{let e={...Yj,...t.labels},h=[],g=t.running?t.zones.find(e=>e.id===t.running.zone):void 0,_=!!t.unavailable;if(t.running&&g){let n=e.left(vj(t.running.remaining));(!c||l!==e.progress)&&(c?.el.remove(),l=e.progress,c=gi({label:e.progress,size:`small`}),u.append(c.el)),c.setValue(Zj(t),n),c.el.classList.add(`mh-irrigation-zones__progress`),o.textContent=g.name,s.textContent=n,a.setLabel(e.stop),a.setDisabled(_),h.push(u)}if(t.onRainSkip){let n=JSON.stringify([e.rainSkip,t.rainNote??``]);(!f||n!==p)&&(p=n,f=L({label:e.rainSkip,description:t.rainNote,row:!0,icon:tM,onChange:e=>t.onRainSkip?.(e)}),f.el.classList.add(`mh-irrigation-zones__rain`)),f.setChecked(!!t.rainSkip),f.setDisabled(_),h.push(f.el)}i.setAttribute(`aria-label`,e.zones);for(let[e,n]of d)t.zones.some(t=>t.id===e)||(n.li.remove(),d.delete(e));let v=t.zones.map(n=>{let r=d.get(n.id);if(!r){let e=M(`span`,{class:`mh-irrigation-zones__zone-name`}),i=M(`span`,{class:`mh-irrigation-zones__zone-time`}),a=U({icon:fe,label:``,onClick:()=>{t.running?.zone===n.id?t.onStop?.():t.onRun?.(n.id)}});a.el.classList.add(`mh-irrigation-zones__run`),r={li:M(`li`,{},M(`span`,{class:`mh-irrigation-zones__zone-text`},e,i),a.el),name:e,time:i,button:a},d.set(n.id,r)}let i=t.running?.zone===n.id;r.li.className=$j(i,!!n.disabled),r.name.textContent=n.name,r.time.textContent=e.minutes(n.duration);let a=i?`${e.stop} ${n.name}`:e.run(n.name);return r.button.setIcon(i?nM:fe),r.button.el.setAttribute(`aria-label`,a),r.button.el.title=a,r.button.setDisabled(_||!i&&!!n.disabled),r.li});m(i,v),v.length&&h.push(i),m(r,h),n.update({title:t.name,icon:t.icon??eM,state:Xj(t,e),active:!!g,tone:`cool`,unavailable:t.unavailable,body:h.length?r:null}),n.el.classList.add(...Qj(t).split(` `))};return h(),{el:n.el,update(e){t={...t,...e},h()}}}var iM={summary:(e,t,n)=>{let r=e===0?`All off`:e===t?`All on`:`${e} of ${t} on`;return n===null||e===0?r:`${r} · ${Ot(n)}`},all:e=>`All lights in ${e}`,brightness:`Brightness`,show:e=>`Show ${e} ${e===1?`light`:`lights`}`,hide:`Hide lights`};function aM(e){let t=e.filter(e=>!e.unavailable),n=t.filter(e=>e.on),r=n.map(e=>e.brightness).filter(e=>typeof e==`number`);return{on:n.length,total:e.length,brightness:r.length?Math.round(r.reduce((e,t)=>e+t,0)/r.length):null,dims:t.some(e=>typeof e.brightness==`number`)}}var oM=Bt,sM=`mh-light-control__slider mh-light-control__slider--brightness mh-light-group__level`;function cM(e){return B(`mh-light-group`,e.on&&`is-on`,e.expanded&&`is-expanded`)}function lM(e){let t={...e},n=!!t.expanded,r=I(`mh-light-group`),i=L({ariaLabel:``,onChange:e=>t.onToggle?.(e)}),a=M(`span`,{class:`mh-light-group__expand-label`}),o=M(`button`,{type:`button`,class:`mh-light-group__expand`,"aria-controls":r,onclick:(()=>{n=!n,p(),t.onExpandedChange?.(n)})},a,H(Yn,{class:`mh-light-group__chevron`})),s=M(`ul`,{class:`mh-light-group__members`,id:r}),c=M(`div`,{class:`mh-light-group__body`}),l=new Map,u=null,d=``,f=R({title:t.name,icon:t.icon??oM,control:i.el}),p=()=>{let e={...iM,...t.labels},r=aM(t.members);i.input.setAttribute(`aria-label`,e.all(t.name)),i.setChecked(r.on>0),i.setDisabled(!!t.unavailable||r.total===0);let p=[];if(r.dims?((!u||d!==e.brightness)&&(u?.dispose(),d=e.brightness,u=wr({label:e.brightness,className:sM,value:0,min:0,max:100,format:Ot,onCommit:e=>t.onBrightness?.(e)})),u.set({value:r.brightness??0,min:0,max:100,disabled:!!t.unavailable}),p.push(u.el)):u&&=(u.dispose(),null),t.members.length){o.setAttribute(`aria-expanded`,String(n)),a.textContent=n?e.hide:e.show(t.members.length),p.push(o);for(let[e,n]of l)t.members.some(t=>t.id===e)||(n.light.destroy(),n.li.remove(),l.delete(e));let r=t.members.map(n=>{let r={label:n.name,on:n.on,brightness:typeof n.brightness==`number`?n.brightness:null,disabled:!!(n.unavailable||t.unavailable),labels:{power:n.name,brightness:e.brightness}},i=l.get(n.id);if(i)i.light.update(r);else{let e=cn({...r,onToggle:e=>t.onMemberToggle?.(n.id,e),onBrightness:e=>t.onMemberBrightness?.(n.id,e)});i={li:M(`li`,{class:`mh-light-group__member`},e.el),light:e},l.set(n.id,i)}return i.li.classList.toggle(`is-unavailable`,!!n.unavailable),i.li});m(s,r),s.hidden=!n,p.push(s)}m(c,p),f.update({title:t.name,icon:t.icon??oM,state:e.summary(r.on,r.total,r.brightness),active:r.on>0,tone:`warm`,unavailable:t.unavailable,body:p.length?c:null}),f.el.classList.add(...cM({on:r.on>0,expanded:n}).split(` `))};return p(),{el:f.el,update(e){e.expanded!==void 0&&(n=e.expanded),t={...t,...e},p()},destroy(){u?.dispose();for(let e of l.values())e.light.destroy()}}}var uM={lights:(e,t)=>e===0?`Lights off`:t===null?`${e} ${e===1?`light`:`lights`} on`:`${e} of ${t} ${t===1?`light`:`lights`} on`,open:e=>`${e} ${e===1?`window`:`windows`} open`,humidity:e=>`${e}% humidity`},dM=Ar,fM=e=>(Math.round(e*10)/10).toString();function pM(e,t=uM){let n=[];return typeof e.temperature==`number`&&n.push(`${fM(e.temperature)} ${e.unit??`°C`}`),typeof e.humidity==`number`&&n.push(t.humidity(Math.round(e.humidity))),n.join(` · `)}function mM(e,t=uM){let n=[];return typeof e.lightsOn==`number`&&n.push({kind:`lights`,icon:Lr,text:t.lights(e.lightsOn,typeof e.lightsTotal==`number`?e.lightsTotal:null),tone:e.lightsOn>0?`lit`:`muted`}),typeof e.open==`number`&&e.open>0&&n.push({kind:`open`,icon:Pr,text:t.open(e.open),tone:`warning`}),n}function hM(e){return B(`mh-room-card__fact`,`mh-room-card__fact--${e.kind}`,`is-${e.tone}`)}function gM(e){let t=e.tone??`warm`;return B(`mh-room-card__toggle`,t!==`accent`&&`mh-room-card__toggle--${t}`,e.on&&`is-on`)}function _M(e){let t={...e},n=M(`ul`,{class:`mh-room-card__facts`}),r=M(`div`,{class:`mh-room-card__toggles`,role:`group`}),i=M(`div`,{class:`mh-room-card__body`}),a=new Map,o=R({title:t.name,icon:t.icon??dM}),s=e=>{let n=(t.toggles??[]).find(t=>t.id===e);n&&!n.disabled&&!t.unavailable&&t.onToggle?.(e,!n.on)},c=()=>{let e={...uM,...t.labels};n.replaceChildren(...mM(t,e).map(e=>M(`li`,{class:hM(e)},H(e.icon),M(`span`,{class:`mh-room-card__fact-text`},e.text)))),r.setAttribute(`aria-label`,t.name);let c=t.toggles??[];for(let[e,t]of a)c.some(t=>t.id===e)||(a.delete(e),t.remove());let l=c.map(e=>{let t=a.get(e.id);return t||(t=M(`button`,{type:`button`,onclick:(()=>s(e.id))}),a.set(e.id,t)),t.className=gM(e),t.setAttribute(`aria-pressed`,String(e.on)),t.disabled=!!e.disabled,t.replaceChildren(H(e.icon),M(`span`,{class:`mh-room-card__toggle-label`},e.label)),t});m(r,l);let u=[];n.children.length&&u.push(n),l.length&&u.push(r),m(i,u),o.update({title:t.name,icon:t.icon??dM,state:pM(t,e)||void 0,active:(t.lightsOn??0)>0,tone:`warm`,unavailable:t.unavailable,onOpen:t.onOpen,body:u.length?i:null}),o.el.classList.add(`mh-room-card`)};return c(),{el:o.el,update(e){t={...t,...e},c()}}}var vM={active:`Active`,applied:`Set`,announce:e=>`${e} set`};function yM(e){return B(`mh-scene-grid`,e.size&&e.size!==`regular`&&`mh-scene-grid--${e.size}`,e.disabled&&`is-disabled`)}function bM(e,t){return B(`mh-scene-grid__tile`,e&&`is-active`,t&&`is-applied`)}function xM(e,t,n,r){return n===e?r.applied:t===e?r.active:``}function SM(e){let t={...e},n=M(`ul`,{class:`mh-scene-grid__list`,role:`list`}),r=M(`span`,{class:`mh-visually-hidden`,"aria-live":`polite`}),i=M(`div`,{},n,r),a=new Map,o=null,s,c=e=>{let n=t.scenes.find(t=>t.id===e);if(!n||n.disabled||t.disabled)return;let i={...vM,...t.labels};o=e,r.textContent=i.announce(n.label),clearTimeout(s),s=setTimeout(()=>{o=null,l()},t.appliedFor??1600),l(),t.onActivate?.(e)},l=()=>{let e={...vM,...t.labels};i.className=yM(t),i.setAttribute(`role`,`group`),i.setAttribute(`aria-label`,t.label??`Scenes`);for(let[e,n]of a)t.scenes.some(t=>t.id===e)||(a.delete(e),n.li.remove());let r=t.scenes.map(n=>{let r=a.get(n.id);if(!r){let e=M(`button`,{type:`button`,onclick:(()=>c(n.id))});r={li:M(`li`,{class:`mh-scene-grid__item`},e),button:e},a.set(n.id,r)}let i=t.active===n.id,s=xM(n.id,t.active,o,e),l=r.button;return l.className=bM(i,o===n.id),i?l.setAttribute(`aria-current`,`true`):l.removeAttribute(`aria-current`),l.disabled=!!(n.disabled||t.disabled),l.replaceChildren(),it(l,M(`span`,{class:`mh-scene-grid__icon`},H(o===n.id?Wt:n.icon)),M(`span`,{class:`mh-scene-grid__text`},M(`span`,{class:`mh-scene-grid__label`},n.label),n.description?M(`span`,{class:`mh-scene-grid__description`},n.description):null),s?M(`span`,{class:`mh-scene-grid__tag`,"aria-hidden":`true`},s):null),r.li});m(n,r)};return l(),{el:i,update(e){t={...t,...e},l()},destroy(){clearTimeout(s)}}}var CM={states:{docked:`Docked`,idle:`Ready`,cleaning:`Cleaning`,paused:`Paused`,returning:`Returning to dock`,error:`Needs help`},start:`Clean everywhere`,startRooms:e=>`Clean ${e} ${e===1?`room`:`rooms`}`,resume:`Resume`,pause:`Pause`,dock:`Dock`,rooms:`Rooms to clean`,battery:`Battery`,charging:`charging`},wM=[te,Mr,rt,E,S,Pe,On,c,Cn,Te,_],TM=[j,j,le,xe,Ye,Jr,p,dt,F,ct,ze];function EM(e,t=!1){if(typeof e!=`number`||!Number.isFinite(e))return Ae;let n=Math.max(0,Math.min(10,Math.round(e/10)));return(t?TM:wM)[n]}function DM(e,t=!1){return B(`mh-vacuum-control__battery`,typeof e==`number`&&e<20&&!t&&`is-low`,t&&`is-charging`)}function OM(e,t,n){let r=typeof e==`number`?`${Math.round(e)}%`:`–`;return{text:r,label:`${n.battery} ${r}${t?`, ${n.charging}`:``}`}}function kM(e){return B(`mh-vacuum-control`,`mh-vacuum-control--${e.state}`,(e.state===`cleaning`||e.state===`returning`)&&`is-busy`)}function AM(e,t){return e.detail?`${t.states[e.state]} · ${e.detail}`:t.states[e.state]}function jM(e,t,n){let r=!!e.unavailable,i=e.state;return[{action:`start`,label:i===`paused`?n.resume:t>0?n.startRooms(t):n.start,icon:fe,disabled:r||i===`cleaning`,primary:i!==`cleaning`},{action:`pause`,label:n.pause,icon:ee,disabled:r||i!==`cleaning`&&i!==`returning`,primary:!1},{action:`dock`,label:n.dock,icon:on,disabled:r||i===`docked`||i===`returning`,primary:!1}]}function MM(e){return`mh-vacuum-control__button mh-vacuum-control__button--${e}`}var NM=Pt;function PM(e){let t={...e},n=[...t.selectedRooms??[]],r=M(`span`,{class:`mh-vacuum-control__battery-icon`}),i=M(`span`,{class:`mh-vacuum-control__battery-text`,"aria-hidden":`true`}),a=M(`span`,{class:`mh-visually-hidden`}),o=M(`span`,{},r,i,a),s=M(`p`,{class:`mh-vacuum-control__error`,role:`alert`}),c=M(`div`,{class:`mh-vacuum-control__actions`}),l=M(`span`,{class:`mh-vacuum-control__rooms-label`,"aria-hidden":`true`}),u=M(`div`,{class:`mh-chip-group`,role:`group`}),d=M(`div`,{class:`mh-vacuum-control__rooms`},l,u),f=M(`div`,{class:`mh-vacuum-control__body`}),p=new Map,h=``,g=R({title:t.name,icon:t.icon??NM}),_=e=>{e===`start`?t.onStart?.([...n]):e===`pause`?t.onPause?.():t.onDock?.()},v=()=>{let e={...CM,...t.labels,states:{...CM.states,...t.labels?.states}},y=new Set((t.rooms??[]).map(e=>e.id));n=n.filter(e=>y.has(e));let b=[];t.state===`error`&&t.error&&(s.textContent=t.error,b.push(s));let x=jM(t,n.length,e).map(e=>{let t=p.get(e.action),n=e.primary?`primary`:`secondary`;if(!t||!t.el.classList.contains(`mh-button--${n}`)){let r=P({label:e.label,icon:e.icon,variant:n,onClick:()=>_(e.action)});r.el.classList.add(...MM(e.action).split(` `)),t?.el.replaceWith(r.el),t=r,p.set(e.action,t)}return t.setLabel(e.label),t.setDisabled(e.disabled),t.el});if(m(c,x),b.push(c),t.rooms?.length){l.textContent=e.rooms,u.setAttribute(`aria-label`,e.rooms);let r=JSON.stringify([t.rooms,n,!!t.unavailable]);if(r!==h){h=r;let e=Array.from(u.children).findIndex(e=>e===document.activeElement);u.replaceChildren(...t.rooms.map(e=>li({label:e.name,selectable:!0,selected:n.includes(e.id),disabled:!!t.unavailable,onToggle:r=>{n=r?[...n,e.id]:n.filter(t=>t!==e.id),v(),t.onRoomsChange?.([...n])}}).el)),e>=0&&u.children[e]?.focus()}b.push(d)}m(f,b);let S=!!t.charging;r.replaceChildren(H(EM(t.battery,S)));let C=OM(t.battery,S,e);i.textContent=C.text,a.textContent=C.label,o.className=DM(t.battery,S),g.update({title:t.name,icon:t.icon??NM,state:AM(t,e),active:t.state===`cleaning`||t.state===`returning`,unavailable:t.unavailable,control:t.battery===void 0?null:o,body:f}),g.el.classList.add(...kM(t).split(` `))};return v(),{el:g.el,update(e){e.selectedRooms&&(n=[...e.selectedRooms]),t={...t,...e},v()}}}var FM=(...e)=>M(`div`,{class:`ex-stack`},...e),IM=(...e)=>M(`div`,{class:`mh-grid`},...e),LM=e=>C(e,{variant:`label`,tone:`muted`}),RM=(e,t)=>{for(let[n,r]of Object.entries(_r(e.theme)))t.style.setProperty(n,r);return t},zM=(e,t=500)=>void setTimeout(e,t);function BM(e,t,n){let r=!1,i=setInterval(()=>{if(e.isConnected)r=!0;else if(r){clearInterval(i);return}n()},t)}function VM(e){let t={...e},n=_M({...t,onOpen:()=>void 0,onToggle:(e,r)=>zM(()=>{let i=(t.toggles??[]).map(t=>t.id===e?{...t,on:r}:t),a=e===`lights`&&typeof t.lightsTotal==`number`?{lightsOn:r?t.lightsTotal:0}:{};t={...t,toggles:i,...a},n.update({toggles:i,...a})})});return n.el}var HM=[{id:`living`,name:`Living room`,shape:{points:[[0,0],[500,0],[500,250],[380,250],[380,400],[0,400]]}},{id:`kitchen`,name:`Kitchen`,shape:{x:500,y:0,width:300,height:250}},{id:`hall`,name:`Hall`,shape:{x:380,y:250,width:420,height:150}},{id:`bedroom`,name:`Bedroom`,shape:{x:0,y:400,width:420,height:300}},{id:`bath`,name:`Bathroom`,shape:{x:420,y:400,width:200,height:300}},{id:`study`,name:`Study`,shape:{x:620,y:400,width:180,height:300}},{id:`balcony`,name:`Balcony`,shape:{x:800,y:0,width:100,height:250},disabled:!0}];function UM(){let e={living:{light:70,climate:null,temp:21.5,open:!1},kitchen:{light:100,climate:null,temp:22,open:!1},hall:{light:0,climate:null,temp:20,open:!1},bedroom:{light:0,climate:`heat`,temp:18.5,open:!1},bath:{light:30,climate:null,temp:23,open:!0},study:{light:0,climate:`cool`,temp:25,open:!1},balcony:{light:0,climate:null,temp:14,open:!1}},t=[{id:`lamp-living`,room:`living`,x:90,y:90,icon:de,label:`Living room lamp`},{id:`lamp-kitchen`,room:`kitchen`,x:740,y:60,icon:lr,label:`Kitchen ceiling light`},{id:`lamp-hall`,room:`hall`,x:740,y:325,icon:lr,label:`Hall light`},{id:`lamp-bedroom`,room:`bedroom`,x:60,y:640,icon:En,label:`Bedside lamp`},{id:`lamp-study`,room:`study`,x:740,y:640,icon:En,label:`Study desk lamp`}],n=[{id:`motion-hall`,x:440,y:325,icon:qr,label:`Hall motion sensor`,state:`Clear`},{id:`thermo-bedroom`,x:360,y:450,icon:u,label:`Bedroom thermostat`,state:`Heating to 20 °C`,active:!0,tone:`heat`},{id:`thermo-study`,x:680,y:450,icon:ot,label:`Study air conditioner`,state:`Cooling to 23 °C`,active:!0,tone:`cool`},{id:`window-bath`,x:560,y:650,icon:Pr,label:`Bathroom window`,state:`Open`,active:!0,tone:`alert`},{id:`speaker-living`,x:320,y:340,icon:y,label:`Living room speaker`,state:`Idle`},{id:`door`,x:790,y:325,icon:xn,label:`Front door`,state:`Locked`}],r=`living`,i=!0,a=C(``,{variant:`label`}),o=t=>{let n=e[t],r=[n.light>0?`Lights ${n.light}%`:`Lights off`,`${n.temp.toFixed(1)} °C`];return n.open&&r.push(`Window open`),r.join(` · `)},s=()=>HM.map(t=>{let n=e[t.id];return{...t,light:n.light,climate:n.climate,alert:n.open,summary:t.disabled?void 0:`${n.temp.toFixed(1)} °C`}}),c=()=>[...t.map(t=>({id:t.id,x:t.x,y:t.y,icon:t.icon,label:t.label,state:e[t.room].light>0?`On`:`Off`,active:e[t.room].light>0,tone:`warm`})),...n],l=()=>{let e=HM.find(e=>e.id===r);a.textContent=e?`${e.name}: ${o(e.id)}`:`Tap a room; tap a lamp to switch it.`},d=Jj({label:`Flat`,rooms:s(),markers:c(),selected:r,onRoom:e=>{r=e,d.update({selected:r}),l()},onMarker:n=>{let r=t.find(e=>e.id===n);r&&zM(()=>{let t=e[r.room];t.light=t.light>0?0:80,d.update({rooms:s(),markers:c()}),l()},300)}});l();let f=L({label:`Show room names`,checked:!0,onChange:e=>{i=e,d.update({showNames:i})}}),p=Jj({label:`Flat, small`,rooms:s(),showNames:!1});return p.el.style.maxWidth=`calc(var(--mh-control-lg) * 5)`,FM(LM(`Arrow keys move between rooms and markers by where they are; Enter or Space chooses. Lit rooms glow with their brightness; heated and cooled rooms take a warm or cool tint; an open window outlines the room.`),f.el,d.el,a,LM(`Small, without names (the glow and tints still read)`),p.el)}function WM(){let e=`docked`,t=96,n=[],r=0,i={living:`Living room`,kitchen:`Kitchen`,hall:`Hall`,bedroom:`Bedroom`},a=PM({name:`Floor cleaner`,state:e,battery:t,charging:!0,rooms:Object.entries(i).map(([e,t])=>({id:e,name:t})),onStart:e=>{n=e.length?e:Object.keys(i),zM(()=>o(`cleaning`))},onPause:()=>zM(()=>o(`paused`)),onDock:()=>zM(()=>o(`returning`))}),o=t=>{e=t,a.update({state:e,charging:e===`docked`,detail:e===`cleaning`||e===`paused`?i[n[r%n.length]]:void 0})};return BM(a.el,1500,()=>{e===`cleaning`?(t=Math.max(5,t-3),r+=1,t<=20?o(`returning`):a.update({battery:t,detail:i[n[r%n.length]]})):e===`returning`?o(`docked`):e===`docked`&&t<100&&(t=Math.min(100,t+4),a.update({battery:t}))}),a.el}function GM(){let e=[`Wash`,`Rinse`,`Spin`],t=5400,n=4320,r={name:`Washing machine`,state:`running`,programme:`Cotton 40°`,stages:e,stage:0,remaining:n,duration:t,endsAt:`Ends 14:20`},i=n=>Math.min(e.length-1,Math.floor((t-n)/t*e.length)),a=Tj({...r,onPause:()=>zM(()=>o({state:`paused`})),onResume:()=>zM(()=>o({state:`running`})),onDismiss:()=>zM(()=>{n=t,o({state:`running`,remaining:n,stage:0,endsAt:`Ends 15:50`})})}),o=e=>{r={...r,...e},a.update(e)};return BM(a.el,1e3,()=>{r.state===`running`&&(n=Math.max(0,n-60),o(n===0?{state:`finished`,remaining:0,endsAt:`Done at 14:20`}:{remaining:n,stage:i(n)}))}),a.el}function KM(){let e=[{id:`lawn`,name:`Front lawn`,duration:20},{id:`beds`,name:`Flower beds`,duration:10},{id:`veg`,name:`Vegetable patch`,duration:15},{id:`pots`,name:`Terrace pots`,duration:5,disabled:!0}],t={zone:`beds`,remaining:420},n=rM({name:`Garden watering`,zones:e,running:t,nextRun:`Tomorrow 06:00`,rainNote:`6 mm of rain expected tonight`,onRun:r=>zM(()=>{t={zone:r,remaining:e.find(e=>e.id===r).duration*60},n.update({running:t})}),onStop:()=>zM(()=>{t=null,n.update({running:t})}),onRainSkip:e=>zM(()=>n.update({rainSkip:e}))});return BM(n.el,1e3,()=>{t&&(t=t.remaining>10?{...t,remaining:t.remaining-10}:null,n.update({running:t}))}),n.el}var qM=[{id:`morning`,label:`Morning`,icon:nt,description:`Bright, cool white`},{id:`evening`,label:`Evening`,icon:kt,description:`Dim, warm`},{id:`film`,label:`Film night`,icon:f,description:`Lamps low, blinds down`},{id:`reading`,label:`Reading`,icon:Dt,description:`Chair lamp only`},{id:`party`,label:`Party`,icon:mt,description:`Colours on`},{id:`night`,label:`Goodnight`,icon:yr,description:`Everything off`}];function JM(e,t=qM){let n=SM({label:`Scenes`,scenes:t,active:`evening`,size:e,onActivate:e=>zM(()=>n.update({active:e}),400)});return n.el}function YM(e,t,n=!1){let r=t,i=e=>{r=e,zM(()=>a.update({members:r}))},a=lM({name:e,members:r,expanded:n,onToggle:e=>i(r.map(t=>t.unavailable?t:{...t,on:e,brightness:typeof t.brightness==`number`&&e?Math.max(t.brightness,60):t.brightness})),onBrightness:e=>i(r.map(t=>t.unavailable||typeof t.brightness!=`number`?t:{...t,brightness:e,on:e>0})),onMemberToggle:(e,t)=>i(r.map(n=>n.id===e?{...n,on:t}:n)),onMemberBrightness:(e,t)=>i(r.map(n=>n.id===e?{...n,brightness:t,on:t>0}:n))});return a.el}var XM=[{id:`room-card`,render:e=>RM(e,FM(LM(`Temperature and humidity on the state line; lights and open windows under it; quick toggles answer a moment later`),IM(VM({name:`Living room`,temperature:21.5,humidity:46,lightsOn:3,lightsTotal:4,toggles:[{id:`lights`,label:`Lights`,icon:`lightbulb`,on:!0},{id:`fan`,label:`Fan`,icon:ot,on:!1,tone:`cool`},{id:`music`,label:`Music`,icon:y,on:!1,tone:`accent`}]}),VM({name:`Bathroom`,icon:At,temperature:23.2,humidity:71,lightsOn:0,lightsTotal:2,open:1,toggles:[{id:`lights`,label:`Lights`,icon:`lightbulb`,on:!1},{id:`heat`,label:`Towel rail`,icon:u,on:!0,tone:`heat`}]})),LM(`Few facts, a long name, and unavailable`),IM(_M({name:`Kitchen`,icon:O,temperature:22}).el,_M({name:`Guest bedroom by the garden stairs`,icon:nr,temperature:70,unit:`°F`,lightsOn:1}).el,_M({name:`Loft`,unavailable:!0,lightsOn:0,toggles:[{id:`lights`,label:`Lights`,icon:`lightbulb`,on:!1}]}).el)))},{id:`scene-grid`,render:()=>FM(LM(`Tap a tile: a check for a moment, then the active mark moves to it`),JM(`regular`),LM(`Compact, for phones and small screens`),JM(`compact`,qM.slice(0,4)),LM(`Large, for wall screens`),JM(`large`,qM.slice(0,3)))},{id:`light-group`,render:e=>RM(e,FM(LM(`The master switch and slider set every light; expand for each one`),IM(YM(`Kitchen`,[{id:`pendants`,name:`Pendants`,on:!0,brightness:80},{id:`counter`,name:`Counter strip`,on:!0,brightness:40},{id:`spots`,name:`Spots`,on:!1,brightness:0},{id:`cabinet`,name:`Cabinet light`,on:!1}]),YM(`Garden`,[{id:`path`,name:`Path lights`,on:!1},{id:`string`,name:`String lights`,on:!1},{id:`shed`,name:`Shed light`,on:!1,unavailable:!0}],!0))))},{id:`floor-plan`,render:e=>RM(e,UM())},{id:`vacuum-control`,render:()=>FM(LM(`Choose rooms (or none for everywhere), start, pause, send it home; the battery drains while it cleans`),IM(WM(),PM({name:`Upstairs cleaner`,state:`error`,battery:41,error:`Main brush is stuck. Free it and press start.`,rooms:[{id:`landing`,name:`Landing`}]}).el),LM(`Returning with a low battery; unavailable`),IM(PM({name:`Floor cleaner`,state:`returning`,battery:12}).el,PM({name:`Garage cleaner`,state:`idle`,battery:null,unavailable:!0}).el))},{id:`appliance-cycle`,render:()=>FM(LM(`Running, a minute a second here: stages, time left and progress; it finishes with a Done button`),IM(GM(),Tj({name:`Dishwasher`,icon:o,state:`finished`,programme:`Eco`,stages:[`Prewash`,`Wash`,`Rinse`,`Dry`],endsAt:`Done at 13:05`,onDismiss:()=>void 0}).el),LM(`Paused, needs attention, and ready with a planned start`),IM(Tj({name:`Dryer`,icon:xt,state:`paused`,programme:`Cupboard dry`,stages:[`Dry`,`Cool down`],stage:0,remaining:2100,duration:4800,onResume:()=>void 0}).el,Tj({name:`Washing machine`,state:`error`,programme:`Wool 30°`,stages:[`Wash`,`Rinse`,`Spin`],stage:1,progress:55,error:`Door not closed`}).el,Tj({name:`Dishwasher`,icon:o,state:`idle`,programme:`Quick 45`,endsAt:`Starts 23:00`}).el))},{id:`irrigation-zones`,render:e=>RM(e,FM(LM(`A zone runs now (ten seconds a second here); run another, stop, or skip the next run for rain`),IM(KM(),rM({name:`Back garden`,zones:[{id:`hedge`,name:`Hedge drip line`,duration:30},{id:`lawn`,name:`Lawn`,duration:25}],nextRun:`Friday 05:30`,rainSkip:!0,rainNote:`12 mm fell overnight`,onRainSkip:()=>void 0,onRun:()=>void 0}).el)))}],ZM={group:`Assistant`,heard:`You said`,changes:`Changed`,failed:`Didn’t respond`,undo:`Undo`,undone:`Undone`};function QM(e){let t={...ZM,...e.labels},n=(e.changes??[]).map((e,n)=>({key:e.id??`${e.name}\u0000${n}`,name:e.name,icon:e.failed?Rn:e.icon,state:e.state?.trim()||(e.failed?t.failed:``),className:B(`mh-assist-reply__change`,e.tone&&e.tone!==`accent`&&`mh-assist-reply__change--${e.tone}`,e.active&&!e.failed&&`is-active`,e.failed&&`is-failed`)}));return{labels:t,label:e.label??t.group,className:B(`mh-assist-reply`,e.error&&`is-error`),heard:e.heard?.trim()||``,reply:e.reply?.trim()||``,changes:n,undo:e.undone?`done`:e.canUndo?`button`:null,undoing:!!e.undoing&&!e.undone}}function $M(e){return B(z(`text`,`small`),`mh-assist-reply__undo`,e&&`is-loading`)}var eN=gt;function tN(e){let t=e,n=M(`span`,{class:`mh-assist-reply__heard-text`}),r=M(`span`,{class:`mh-visually-hidden`}),i=M(`p`,{class:`mh-assist-reply__heard`},H(Re),r,n),a=M(`p`,{class:`mh-assist-reply__reply`,"aria-live":`polite`}),o=M(`ul`,{class:`mh-assist-reply__changes`}),s=M(`span`,{class:`mh-button__label`}),c=M(`button`,{type:`button`,class:$M(!1)},H(eN),s);c.addEventListener(`click`,()=>t.onUndo?.());let l=M(`span`,{}),u=M(`p`,{class:`mh-assist-reply__undone`},H(Wt),l),d=M(`div`,{class:`mh-assist-reply__footer`}),f=M(`div`,{role:`group`}),p=new Map,h=()=>{let e=QM({...t,canUndo:!!t.onUndo});f.className=e.className,f.setAttribute(`aria-label`,e.label),r.textContent=`${e.labels.heard}: `,n.textContent=e.heard,a.textContent=e.reply,o.setAttribute(`aria-label`,e.labels.changes);let h=new Set,g=e.changes.map(e=>{h.add(e.key);let t=p.get(e.key);if(!t){let n=M(`span`,{class:`mh-assist-reply__name`});t={el:M(`li`,{}),badge:M(`span`,{class:`mh-assist-reply__badge`}),icon:``,name:n,state:M(`span`,{class:`mh-assist-reply__state`}),text:M(`span`,{class:`mh-assist-reply__text`},n)},t.el.append(t.badge,t.text),p.set(e.key,t)}return t.el.className=e.className,t.icon!==e.icon&&(t.icon=e.icon,t.badge.replaceChildren(H(e.icon))),t.name.textContent=e.name,t.state.textContent=e.state,m(t.text,e.state?[t.name,t.state]:[t.name]),t.el});for(let e of[...p.keys()])h.has(e)||p.delete(e);m(o,g),s.textContent=e.labels.undo,c.className=$M(e.undoing),c.disabled=e.undoing,e.undoing?c.setAttribute(`aria-busy`,`true`):c.removeAttribute(`aria-busy`),l.textContent=e.labels.undone;let _=e.undo===`done`&&document.activeElement===c;m(d,e.undo===`button`?[c]:e.undo===`done`?[u]:[]),m(f,[...e.heard?[i]:[],a,...e.changes.length?[o]:[],...e.undo?[d]:[]]),_&&f.focus()};return f.tabIndex=-1,h(),{el:f,update(e){t=e,h()}}}var nN={group:`Play on`,playing:`Playing`,unavailable:`Unavailable`,volume:`{name} volume`,mute:`Mute {name}`,empty:`No speakers`},rN=(e,t)=>e.replace(/\{name\}/g,t);function iN(e){let t={...nN,...e.labels},n=e.multiple??!0,r=!1,i=e.speakers.map(e=>{let i=!!e.unavailable,a=!!e.selected&&(n||!r);a&&(r=!0);let o=!!e.playing&&!i,s=[e.detail?.trim(),o&&t.playing,i&&t.unavailable].filter(Boolean).join(` · `),c=e.volume===null||e.volume===void 0||!Number.isFinite(e.volume)?null:Math.round(Math.min(1,Math.max(0,e.volume))*100),l=a&&!i;return{id:e.id,name:e.name,detail:s,icon:e.icon??`M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M12,20A5,5 0 0,1 7,15A5,5 0 0,1 12,10A5,5 0 0,1 17,15A5,5 0 0,1 12,20M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8C10.89,8 10,7.1 10,6C10,4.89 10.89,4 12,4M17,2H7C5.89,2 5,2.89 5,4V20A2,2 0 0,0 7,22H17A2,2 0 0,0 19,20V4C19,2.89 18.1,2 17,2Z`,selected:a,unavailable:i,playing:o,className:B(`mh-speaker-selector__item`,a&&`is-selected`,o&&`is-playing`,i&&`is-unavailable`),mute:l&&e.muted!==void 0,muted:!!e.muted,muteLabel:rN(t.mute,e.name),volume:l&&e.volume!==void 0,level:c,volumeLabel:rN(t.volume,e.name)}});return{labels:t,label:e.label??t.group,multiple:n,speakers:i}}function aN(){return B(l(`default`,`small`),`mh-speaker-selector__mute`)}function oN(e){return B(`mh-slider`,`mh-speaker-selector__level`,e&&`is-muted`)}function sN(t){let n=t,r=iN(t),i=I(`mh-speakers`),a=new Map,o=M(`legend`,{class:`mh-visually-hidden`}),s=M(`ul`,{class:`mh-speaker-selector__list`}),c=M(`p`,{class:`mh-speaker-selector__empty`}),l=M(`fieldset`,{class:`mh-speaker-selector`},o),u=null,d=e=>r.speakers.find(t=>t.id===e),f=(e,t)=>(e.input.className=t?`mh-checkbox__input mh-speaker-selector__input`:`mh-radio__input mh-speaker-selector__input`,e.input.type=t?`checkbox`:`radio`,t?e.input.removeAttribute(`name`):e.input.name=i,t?M(`span`,{class:`mh-checkbox__control`},e.input,H(Wt,{class:`mh-checkbox__check`})):M(`span`,{class:`mh-radio__control`},e.input,M(`span`,{class:`mh-radio__dot`}))),p=e=>{let t=a.get(e);if(t)return t;let i=M(`input`,{type:`checkbox`}),o=M(`span`,{class:`mh-speaker-selector__name`}),s=M(`span`,{class:`mh-speaker-selector__detail`}),c=M(`input`,{type:`range`,class:`mh-slider__input`,min:0,max:100,step:1}),l={el:M(`li`,{}),pick:M(`label`,{class:`mh-speaker-selector__pick`}),badge:M(`span`,{class:`mh-speaker-selector__badge`}),icon:null,name:o,detail:s,text:M(`span`,{class:`mh-speaker-selector__text`},o),bars:M(`span`,{class:`mh-speaker-selector__bars`,"aria-hidden":`true`},M(`span`,{}),M(`span`,{}),M(`span`,{})),control:M(`span`,{}),input:i,volume:M(`div`,{class:`mh-speaker-selector__volume`}),mute:M(`button`,{type:`button`,class:aN()}),level:M(`div`,{class:oN(!1)},c),range:c,dragging:!1};return i.addEventListener(`change`,()=>{(r.multiple||i.checked)&&n.onSelect?.(e,i.checked)}),l.mute.addEventListener(`click`,()=>n.onMute?.(e,!d(e)?.muted)),c.addEventListener(`input`,()=>{l.dragging=!0,c.style.setProperty(`--_at`,String(Nr(Number(c.value)))),c.setAttribute(`aria-valuetext`,`${c.value}%`)}),c.addEventListener(`change`,()=>{l.dragging=!1,n.onVolume?.(e,Number(c.value)/100)}),a.set(e,l),l},h=()=>{let t=r;if(o.textContent=t.label,u!==null&&u!==t.multiple)for(let e of a.values())e.control=f(e,t.multiple);u=t.multiple;let n=new Set,i=t.speakers.map(r=>{n.add(r.id);let i=!a.has(r.id),o=p(r.id);i&&(o.control=f(o,t.multiple)),o.el.className=r.className,o.icon!==r.icon&&(o.icon=r.icon,o.badge.replaceChildren(H(r.icon))),o.name.textContent=r.name,o.detail.textContent=r.detail,m(o.text,r.detail?[o.name,o.detail]:[o.name]),m(o.pick,[o.badge,o.text,...r.playing?[o.bars]:[],o.control]),o.input.checked=r.selected,o.input.disabled=r.unavailable,o.mute.setAttribute(`aria-label`,r.muteLabel),o.mute.title=r.muteLabel,o.mute.setAttribute(`aria-pressed`,String(r.muted));let s=r.muted?Qt:e;return o.mute.dataset.icon!==s&&(o.mute.dataset.icon=s,o.mute.replaceChildren(H(s))),o.level.className=oN(r.muted),o.range.setAttribute(`aria-label`,r.volumeLabel),o.range.disabled=r.level===null,o.dragging||(o.range.value=String(r.level??0),o.range.setAttribute(`aria-valuetext`,`${r.level??0}%`),o.range.style.setProperty(`--_at`,String(Nr(r.level??0)))),m(o.volume,[...r.mute?[o.mute]:[],...r.volume?[o.level]:[]]),m(o.el,r.mute||r.volume?[o.pick,o.volume]:[o.pick]),o.el});for(let e of[...a.keys()])n.has(e)||a.delete(e);m(s,i),c.textContent=t.labels.empty,m(l,[o,t.speakers.length?s:c])};return h(),{el:l,update(e){n=e,r=iN(e),h()}}}var cN={group:`Timers`,empty:`No timers`,timer:`Timer`,running:`Running`,paused:`Paused`,finished:`Finished`,pause:`Pause {name}`,resume:`Resume {name}`,addText:`+{time}`,add:`Add {time} to {name}`,cancel:`Cancel {name}`,stopText:`Stop`,stop:`Stop {name}`,started:`{name} started, {time}`,pausedNotice:`{name} paused, {time} left`,resumedNotice:`{name} running, {time} left`,finishedNotice:`{name} finished`};function lN(e){let t=Math.max(0,Math.ceil(Number.isFinite(e)?e-1e-6:0)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),i=String(t%60).padStart(2,`0`);return n?`${n}:${String(r).padStart(2,`0`)}:${i}`:`${r}:${i}`}var uN=(e,t)=>e.replace(/\{(\w+)\}/g,(e,n)=>t[n]??e);function dN(e,t){if(e.state===`finished`)return 0;if(e.state===`running`&&e.endsAt!==null&&e.endsAt!==void 0&&Number.isFinite(e.endsAt))return Math.max(0,(e.endsAt-t)/1e3);let n=e.remaining??e.duration;return Math.max(0,Number.isFinite(n)?n:0)}function fN(e,t){return e.state===`running`&&dN(e,t)<=0?`finished`:e.state}function pN(e,t){let n=null;for(let r of e){if(r.state!==`running`)continue;let e=dN(r,t)*1e3;if(e<=0)continue;let i=Math.max(1,Math.ceil(e%1e3||1e3));n=n===null?i:Math.min(n,i)}return n}function mN(e,t){let n={...cN,...e.labels},r=e.addStep&&e.addStep>0?e.addStep:60,i=lN(r),a=e.timers.map(e=>{let r=e.name?.trim()||n.timer,a=fN(e,t),o=a===`finished`?0:dN(e,t),s=e.duration>0?Math.round(Math.min(1,o/e.duration)*1e3)/1e3:0,c=a===`running`?`pause`:a===`paused`?`resume`:null;return{id:e.id,name:r,state:a,className:B(`mh-timer__item`,`is-${a}`),left:o,time:lN(o),fraction:s,stateText:n[a],main:c,mainLabel:c?uN(n[c],{name:r}):``,addText:uN(n.addText,{time:i}),addLabel:uN(n.add,{name:r,time:i}),cancelLabel:uN(n.cancel,{name:r}),stopLabel:uN(n.stop,{name:r})}});return{labels:n,label:e.label??n.group,addStep:r,items:a}}function hN(e,t){if(!e)return``;let n=t.labels,r=[];for(let i of t.items){let t=e[i.id];if(t===i.state)continue;let a={name:i.name,time:i.time};i.state===`finished`?r.push(uN(n.finishedNotice,a)):t===void 0?r.push(uN(n.started,a)):i.state===`paused`?r.push(uN(n.pausedNotice,a)):t===`paused`&&r.push(uN(n.resumedNotice,a))}return r.join(`. `)}function gN(e){return Object.fromEntries(e.items.map(e=>[e.id,e.state]))}function _N(e){return e===`add`?B(z(`tonal`,`small`),`mh-timer__add`):e===`stop`?B(z(`primary`,`small`),`mh-timer__stop`):B(l(`default`,`small`,e===`main`),`mh-timer__${e}`)}function vN(e){return e===`paused`?ee:e===`finished`?wt:null}var yN=`http://www.w3.org/2000/svg`;function bN(e){let t=document.createElementNS(yN,`circle`);return t.setAttribute(`class`,e),t.setAttribute(`cx`,`20`),t.setAttribute(`cy`,`20`),t.setAttribute(`r`,`17`),t.setAttribute(`pathLength`,`100`),t}function xN(e){let t=e,n=()=>(t.now??Date.now)(),r=new Map,i=M(`ul`,{class:`mh-timer__list`}),a=M(`p`,{class:`mh-timer__empty`}),o=M(`div`,{class:`mh-visually-hidden mh-timer__announce`,"aria-live":`polite`}),s=M(`div`,{class:`mh-timer`,role:`group`}),c=null,l=new Set,u,d=e=>{let n=r.get(e);if(n)return n;let i=document.createElementNS(yN,`svg`);i.setAttribute(`class`,`mh-timer__ring`),i.setAttribute(`viewBox`,`0 0 40 40`),i.append(bN(`mh-timer__track`),bN(`mh-timer__arc`));let a=M(`span`,{class:`mh-timer__glyph`}),o={el:M(`li`,{}),glyph:a,glyphFor:null,name:M(`span`,{class:`mh-timer__name`}),time:M(`span`,{class:`mh-timer__time`,role:`timer`}),state:M(`span`,{class:`mh-timer__state`}),actions:M(`div`,{class:`mh-timer__actions`,role:`group`}),main:M(`button`,{type:`button`,class:_N(`main`)}),mainFor:null,add:M(`button`,{type:`button`,class:_N(`add`)},M(`span`,{class:`mh-button__label`})),cancel:M(`button`,{type:`button`,class:_N(`cancel`)},H(Hr)),stop:M(`button`,{type:`button`,class:_N(`stop`)},M(`span`,{class:`mh-button__label`}))},s=()=>p.items.find(t=>t.id===e);return o.main.addEventListener(`click`,()=>s()?.main===`pause`?t.onPause?.(e):t.onResume?.(e)),o.add.addEventListener(`click`,()=>t.onAdd?.(e,p.addStep)),o.cancel.addEventListener(`click`,()=>t.onCancel?.(e)),o.stop.addEventListener(`click`,()=>(t.onStop??t.onCancel)?.(e)),o.el.append(M(`span`,{class:`mh-timer__dial`,"aria-hidden":`true`},i,a),M(`div`,{class:`mh-timer__text`},o.name,o.time,o.state),o.actions),r.set(e,o),o},f=(e,t)=>{e.setAttribute(`aria-label`,t),e.title=t},p=mN(e,n()),h=()=>{let e=n();p=mN(t,e),s.setAttribute(`aria-label`,p.label);let g=new Set,_=p.items.map(e=>{g.add(e.id);let t=d(e.id);t.el.className=e.className,t.el.style.setProperty(`--_left`,String(e.fraction));let n=vN(e.state);return n!==t.glyphFor&&(t.glyphFor=n,t.glyph.replaceChildren(...n?[H(n)]:[])),t.name.textContent=e.name,t.time.textContent=e.time,t.state.textContent=e.stateText,t.actions.setAttribute(`aria-label`,e.name),e.main&&(f(t.main,e.mainLabel),t.mainFor!==e.main&&(t.mainFor=e.main,t.main.replaceChildren(H(e.main===`pause`?ee:fe)))),t.add.firstElementChild.textContent=e.addText,f(t.add,e.addLabel),f(t.cancel,e.cancelLabel),t.stop.firstElementChild.textContent=p.labels.stopText,f(t.stop,e.stopLabel),m(t.actions,e.state===`finished`?[t.add,t.stop]:[t.main,t.add,t.cancel]),t.el});for(let e of[...r.keys()])g.has(e)||r.delete(e);m(i,_),a.textContent=p.labels.empty,m(s,[p.items.length?i:a,o]);let v=hN(c,p);v&&(o.textContent=v),c=gN(p);for(let n of t.timers)n.state===`running`&&fN(n,e)===`finished`?l.has(n.id)||(l.add(n.id),t.onFinish?.(n.id)):l.delete(n.id);clearTimeout(u);let y=pN(t.timers,e);u=y===null?void 0:setTimeout(h,y)},g=()=>{document.visibilityState===`visible`&&h()};return document.addEventListener(`visibilitychange`,g),h(),{el:s,update(e){t=e,h()},destroy(){clearTimeout(u),u=void 0,document.removeEventListener(`visibilitychange`,g)}}}var SN=[`power`,`mute`,`play-pause`,`up`,`left`,`ok`,`right`,`down`,`back`,`home`,`menu`,`volume-up`,`volume-down`,`channel-up`,`channel-down`],CN=new Set([`up`,`down`,`left`,`right`,`volume-up`,`volume-down`,`channel-up`,`channel-down`]),wN={remote:`Remote`,navigation:`Navigation`,up:`Up`,down:`Down`,left:`Left`,right:`Right`,ok:`OK`,back:`Back`,home:`Home`,menu:`Menu`,power:`Power`,mute:`Mute`,"play-pause":`Play or pause`,volume:`Volume`,"volume-up":`Volume up`,"volume-down":`Volume down`,channel:`Channel`,"channel-up":`Channel up`,"channel-down":`Channel down`,volumeShort:`Vol`,channelShort:`Ch`,sources:`Inputs and apps`},TN={up:un,down:Yn,left:In,right:hn,back:Vt,home:Ln,menu:ke,power:Et,mute:Qt,"play-pause":Ct,"volume-up":vt,"volume-down":ce,"channel-up":un,"channel-down":Yn};function EN(e){return e===`ok`?null:TN[e]}function DN(e){return e===`up`||e===`down`||e===`left`||e===`right`?B(`mh-tv-remote__dir`,`mh-tv-remote__dir--${e}`):e===`ok`?`mh-tv-remote__ok`:e.startsWith(`volume-`)||e.startsWith(`channel-`)?B(`mh-tv-remote__step`,`mh-tv-remote__step--${e.endsWith(`up`)?`up`:`down`}`):B(l(e===`power`?`danger`:`default`,`medium`,!0),`mh-tv-remote__key mh-tv-remote__key--${e}`)}function ON(e){return B(z(e?`primary`:`tonal`,`small`),`mh-tv-remote__source`,e&&`is-active`)}function kN(e){return e===`ArrowUp`?`up`:e===`ArrowDown`?`down`:e===`ArrowLeft`?`left`:e===`ArrowRight`?`right`:null}function AN(e){let t={...wN,...e.labels},n=new Set(e.keys??SN),r=e=>e.filter(e=>n.has(e));return{labels:t,label:e.label??t.remote,top:r([`power`,`mute`,`play-pause`]),pad:r([`up`,`left`,`ok`,`right`,`down`]),nav:r([`back`,`home`,`menu`]),volume:r([`volume-up`,`volume-down`]),channel:r([`channel-up`,`channel-down`]),sources:[...e.sources??[]],muted:!!e.muted,disabled:!!e.disabled}}function jN(e){let t,n,r=()=>{clearTimeout(t),clearInterval(n),t=n=void 0};return{down(i){r(),e(i),CN.has(i)&&(t=setTimeout(()=>{n=setInterval(()=>e(i),140)},450))},up:r}}function MN(e){let t=e.find(e=>e.endsWith(`-up`)),n=e.find(e=>e.endsWith(`-down`));return[...t?[t]:[],null,...n?[n]:[]]}function NN(e,t,n,r){e.addEventListener(`pointerdown`,r=>{r.button!==0||e.disabled||n.down(t)});for(let t of[`pointerup`,`pointerleave`,`pointercancel`])e.addEventListener(t,()=>n.up());e.addEventListener(`click`,e=>{e.detail===0&&r(t)})}function PN(e){let t=e,n=AN(e),r=e=>{n.disabled||t.onKey?.(e)},i=jN(r),a=M(`div`,{class:`mh-tv-remote`,role:`group`}),o=M(`div`,{class:`mh-tv-remote__top`}),s=M(`div`,{class:`mh-tv-remote__pad`,role:`group`}),c=M(`div`,{class:`mh-tv-remote__nav`}),l=M(`div`,{class:`mh-tv-remote__rocker`,role:`group`}),u=M(`div`,{class:`mh-tv-remote__rocker`,role:`group`}),d=M(`span`,{class:`mh-tv-remote__rocker-label`,"aria-hidden":`true`}),f=M(`span`,{class:`mh-tv-remote__rocker-label`,"aria-hidden":`true`}),p=M(`div`,{class:`mh-tv-remote__rockers`}),h=M(`div`,{class:`mh-tv-remote__sources`,role:`group`}),g=new Map,_=new Map;s.addEventListener(`keydown`,e=>{let t=kN(e.key);t&&n.pad.includes(t)&&(e.preventDefault(),r(t))});let v=e=>{let t=g.get(e);if(!t){let n=EN(e);t=M(`button`,{type:`button`,class:DN(e)},n?H(n):M(`span`,{class:`mh-tv-remote__ok-text`})),NN(t,e,i,r),g.set(e,t)}let a=n.labels[e];return t.setAttribute(`aria-label`,a),t.title=a,e===`ok`&&(t.firstElementChild.textContent=a),e===`mute`&&t.setAttribute(`aria-pressed`,String(n.muted)),t.disabled=n.disabled,t},y=e=>{let r=_.get(e.id);return r||(r=M(`button`,{type:`button`}),r.addEventListener(`click`,()=>t.onSource?.(e.id)),_.set(e.id,r)),r.className=ON(!!e.active),r.setAttribute(`aria-pressed`,String(!!e.active)),r.disabled=n.disabled,r.replaceChildren(...e.icon?[H(e.icon)]:[],M(`span`,{class:`mh-button__label`},e.label)),r},b=()=>{let e=n,t=e.labels;a.className=B(`mh-tv-remote`,e.disabled&&`is-disabled`),a.setAttribute(`aria-label`,e.label),s.setAttribute(`aria-label`,t.navigation),l.setAttribute(`aria-label`,t.volume),u.setAttribute(`aria-label`,t.channel),h.setAttribute(`aria-label`,t.sources),d.textContent=t.volumeShort,f.textContent=t.channelShort,m(o,e.top.map(v)),m(s,e.pad.map(v)),m(c,e.nav.map(v)),m(l,MN(e.volume).map(e=>e===null?d:v(e))),m(u,MN(e.channel).map(e=>e===null?f:v(e))),m(p,[...e.volume.length?[l]:[],...e.channel.length?[u]:[]]);let r=new Set(e.sources.map(e=>e.id));for(let e of[..._.keys()])r.has(e)||_.delete(e);m(h,e.sources.map(y)),m(a,[...e.top.length?[o]:[],...e.pad.length?[s]:[],...e.nav.length?[c]:[],...e.volume.length||e.channel.length?[p]:[],...e.sources.length?[h]:[]])};return b(),{el:a,update(e){t=e,n=AN(e),b()},destroy:()=>i.up()}}var FN={group:`Up next`,empty:`Nothing up next`,play:`Play {title} now`,remove:`Remove {title}`,more:`{count} more`},IN=(e,t)=>e.replace(/\{(\w+)\}/g,(e,n)=>t[n]??e);function LN(e){let t={...FN,...e.labels},n=e.max!==void 0&&e.max>=0?Math.floor(e.max):1/0,r=e.items.slice(0,n),i=e.items.length-r.length;return{labels:t,label:e.label??t.group,items:r.map(e=>{let n=e.title.trim(),r=e.duration;return{id:e.id,title:n,subtitle:e.subtitle?.trim()||``,art:e.art||null,icon:e.icon??`M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z`,duration:r!=null&&Number.isFinite(r)&&r>0?$r(r):``,playLabel:IN(t.play,{title:n}),removeLabel:IN(t.remove,{title:n})}}),more:i>0?IN(t.more,{count:String(i)}):``}}function RN(e){return B(`mh-up-next__art`,!e&&`is-empty`)}function zN(e){return B(l(`default`,`small`),`mh-up-next__${e}`)}function BN(e,t){return t===0?-1:Math.min(e,t-1)}function VN(e){let t=e,n=LN(e),r=new Map,i=M(`ol`,{class:`mh-up-next__list`}),a=M(`p`,{class:`mh-up-next__empty`}),o=M(`p`,{class:`mh-up-next__more`}),s=M(`div`,{class:`mh-up-next`,role:`group`}),c=(e,t)=>{let n=!!t.art&&e.failed!==t.art;e.art.className=RN(n),n&&e.image.getAttribute(`src`)!==t.art&&(e.image.src=t.art),m(e.art,n?[e.placeholder,e.image]:[e.placeholder])},l=e=>{let i=r.get(e);if(i)return i;let a=M(`img`,{class:`mh-up-next__image`,alt:``,loading:`lazy`,decoding:`async`,referrerpolicy:`no-referrer`}),o=M(`div`,{class:`mh-up-next__title`}),s={el:M(`li`,{class:`mh-up-next__item`}),art:M(`div`,{"aria-hidden":`true`}),image:a,placeholder:M(`span`,{class:`mh-up-next__placeholder`}),icon:null,failed:null,text:M(`div`,{class:`mh-up-next__text`},o),title:o,subtitle:M(`div`,{class:`mh-up-next__subtitle`}),duration:M(`span`,{class:`mh-up-next__duration`}),play:M(`button`,{type:`button`,class:zN(`play`)},H(fe)),remove:M(`button`,{type:`button`,class:zN(`remove`)},H(Hr))};return a.addEventListener(`error`,()=>{let t=n.items.find(t=>t.id===e);s.failed=t?.art??null,t&&c(s,t)}),s.play.addEventListener(`click`,()=>t.onPlay?.(e)),s.remove.addEventListener(`click`,()=>t.onRemove?.(e)),r.set(e,s),s},u=(e,t)=>{e.setAttribute(`aria-label`,t),e.title=t},d=()=>{let e=n;s.setAttribute(`aria-label`,e.label);let d=document.activeElement,f=[...r.entries()].filter(([,e])=>e.el.parentNode===i).map(([e])=>e),p=f.findIndex(e=>r.get(e).el.contains(d)),h=p>=0&&r.get(f[p]).remove===d?`remove`:`play`,g=new Set,_=e.items.map(e=>{g.add(e.id);let n=l(e.id);return n.icon!==e.icon&&(n.icon=e.icon,n.placeholder.replaceChildren(H(e.icon))),c(n,e),n.title.textContent=e.title,n.subtitle.textContent=e.subtitle,m(n.text,e.subtitle?[n.title,n.subtitle]:[n.title]),n.duration.textContent=e.duration,u(n.play,e.playLabel),u(n.remove,e.removeLabel),m(n.el,[n.art,n.text,...e.duration?[n.duration]:[],n.play,...t.onRemove?[n.remove]:[]]),n.el});for(let e of[...r.keys()])g.has(e)||r.delete(e);if(m(i,_),a.textContent=e.labels.empty,o.textContent=e.more,m(s,[e.items.length?i:a,...e.more?[o]:[]]),p>=0&&!g.has(f[p])){let n=f.slice(0,p).filter(e=>g.has(e)).length,i=BN(n,e.items.length),a=i<0?null:r.get(e.items[i].id);(a?h===`remove`&&t.onRemove?a.remove:a.play:s).focus()}};return s.tabIndex=-1,d(),{el:s,update(e){t=e,n=LN(e),d()}}}var HN={...lv,idle:`Ready`,muted:`Microphone off`,error:`Something went wrong`};function UN(e=`idle`,t=`large`){return B(`mh-voice-ring`,t!==`large`&&`mh-voice-ring--${t}`,`is-${e}`)}function WN(e,t,n){return t===void 0?e===`idle`&&n?lv.idle:HN[e]:t}function GN(t){return t===`muted`?A:t===`error`?Rn:t===`speaking`?e:Re}function KN(e={}){let t=e.phase??`idle`,n=e.label,r=e.size??`large`,i=!!e.onTap,a=()=>WN(t,n,i),o=M(`span`,{class:`mh-voice-ring__core`}),s=[M(`span`,{class:`mh-voice-ring__halo`}),M(`span`,{class:`mh-voice-ring__band`}),o],c=i?M(`button`,{type:`button`,class:`mh-voice-ring__ring`},...s):M(`span`,{class:`mh-voice-ring__ring`,"aria-hidden":`true`},...s);e.onTap&&c.addEventListener(`click`,()=>e.onTap());let l=M(`p`,{class:`mh-voice-ring__label`,"aria-live":`polite`}),u=M(`p`,{class:`mh-voice-ring__detail`}),d=M(`div`,{class:UN(t,r)},c,l),f=``,p={el:d,setPhase(e){t=e,d.className=UN(t,r);let i=GN(t);i!==f&&(f=i,o.replaceChildren(H(i))),p.setLabel(n)},setLevel(e){c.style.setProperty(`--_level`,String(dv(e)))},setLabel(e){n=e,l.textContent=a(),i&&c.setAttribute(`aria-label`,a())},setDetail(e){let t=e?.trim()??``;u.textContent=t,t?d.append(u):u.remove()}};return p.setPhase(t),p.setLevel(e.level??0),p.setDetail(e.detail),p}var qN=(...e)=>M(`div`,{class:`ex-stack`},...e),JN=(...e)=>M(`div`,{class:`mh-grid`},...e),YN=(...e)=>M(`div`,{class:`ex-row`},...e),XN=e=>C(e,{variant:`label`,tone:`muted`}),ZN=(e,t)=>V({title:t,body:e}).el,QN=e=>`data:image/svg+xml,${encodeURIComponent(e)}`,$N=(e,t,n)=>{let r=e.theme.palette.series;return QN(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='${r[t]}'/><rect x='30' y='30' width='60' height='60' rx='12' fill='${r[n]}'/></svg>`)},eP=(e,t,n)=>{let r=!1,i=setInterval(()=>{e.isConnected?r=!0:r&&clearInterval(i),r&&n()},t)};function tP(e){let t=e,n=(e,n)=>{t=t.flatMap(t=>t.id===e?n(t)??[]:[t]),a.update({timers:t,...i})},r=e=>e.state===`running`&&e.endsAt?Math.max(0,(e.endsAt-Date.now())/1e3):e.remaining??e.duration,i={onPause:e=>n(e,e=>({...e,state:`paused`,remaining:r(e),endsAt:null})),onResume:e=>n(e,e=>({...e,state:`running`,endsAt:Date.now()+r(e)*1e3,remaining:null})),onAdd:(e,t)=>n(e,e=>{let n=(e.state===`finished`?0:r(e))+t;return e.state===`paused`?{...e,remaining:n,duration:Math.max(e.duration,n)}:{...e,state:`running`,endsAt:Date.now()+n*1e3,remaining:null,duration:Math.max(e.duration,n)}}),onCancel:e=>n(e,()=>null),onFinish:e=>n(e,e=>({...e,state:`finished`,endsAt:null}))},a=xN({timers:t,...i}),o=P({label:`Add a 10-second timer`,variant:`secondary`,size:`small`,icon:`add`,onClick:()=>{t=[...t,{id:`quick-${Date.now()}`,name:`Quick check`,duration:10,state:`running`,endsAt:Date.now()+1e4}],a.update({timers:t,...i})}});return qN(a.el,YN(o.el))}var nP={id:`timer`,render:()=>{let e=Date.now();return qN(XN(`Several at once: running, paused and finished (the buttons work; the eggs finish in eight seconds)`),ZN(tP([{id:`eggs`,name:`Eggs`,duration:20,state:`running`,endsAt:e+8e3},{id:`pasta`,name:`Pasta`,duration:600,state:`running`,endsAt:e+431e3},{id:`bread`,name:`Bread proving`,duration:5400,state:`paused`,remaining:3725},{id:`tea`,name:`Tea`,duration:240,state:`finished`}]),`Kitchen timers`),XN(`No name, two minutes added each time; and nothing running`),JN(ZN(xN({timers:[{id:`a`,duration:900,state:`running`,endsAt:e+512e3}],addStep:120}).el),ZN(xN({timers:[]}).el)))}};function rP(e,t=!0){let n=e,r=(e,r)=>{n=n.map(n=>n.id===e?{...n,...r}:t||r.selected===void 0?n:{...n,selected:!1}),a.update({speakers:n,multiple:t,...i})},i={onSelect:(e,t)=>r(e,{selected:t}),onVolume:(e,t)=>r(e,{volume:t,muted:!1}),onMute:(e,t)=>r(e,{muted:t})},a=sN({speakers:n,multiple:t,...i});return a.el}var iP={id:`speaker-selector`,render:()=>qN(XN(`Grouped playback: pick several, each with its own volume (the controls work here)`),ZN(rP([{id:`living`,name:`Living room`,detail:`Soundbar`,icon:h,selected:!0,playing:!0,volume:.42,muted:!1},{id:`kitchen`,name:`Kitchen`,detail:`Shelf speaker`,selected:!0,playing:!0,volume:.25,muted:!0},{id:`study`,name:`Study`,detail:`Desk speaker`,volume:.5,muted:!1},{id:`garden`,name:`Garden`,detail:`Outdoor pair`,icon:Me,volume:null,muted:!1},{id:`loft`,name:`Loft`,detail:`Bookshelf speaker`,unavailable:!0,volume:.3}]),`Play on`),XN(`One at a time (radios); the picked one has a volume without mute`),ZN(rP([{id:`tv`,name:`Television`,icon:ve,selected:!0,volume:.6},{id:`hall`,name:`Hallway`,detail:`Ceiling speaker`,volume:.2},{id:`bath`,name:`Bathroom`,detail:`Mirror speaker`,volume:.35}],!1),`Send to`))},aP=[{id:`hdmi1`,label:`HDMI 1`,icon:Sr},{id:`console`,label:`Console`,icon:yn},{id:`films`,label:`Film Hall`,icon:Ke,active:!0},{id:`aerial`,label:`Aerial`}];function oP(){let e=aP,t=!1,n=C(`Press a key (hold the arrows or volume to repeat)`,{variant:`label`,tone:`muted`}),r=0,i={onKey:o=>{r+=1,n.textContent=`Sent “${o}” (${r})`,o===`mute`&&(t=!t,a.update({sources:e,muted:t,...i}))},onSource:r=>{e=e.map(e=>({...e,active:e.id===r})),n.textContent=`Switched to ${e.find(e=>e.id===r).label}`,a.update({sources:e,muted:t,...i})}},a=PN({sources:e,muted:t,...i});return qN(a.el,n)}var sP={id:`tv-remote`,render:()=>qN(XN(`Every key, with inputs and apps (with focus on the pad, the arrow keys send directions)`),ZN(oP(),`Living room TV`),XN(`Fewer keys: a streaming stick without channels or power; and a remote that is off`),JN(ZN(PN({keys:[`up`,`down`,`left`,`right`,`ok`,`back`,`home`,`play-pause`,`volume-up`,`volume-down`,`mute`]}).el),ZN(PN({keys:[`power`,`up`,`down`,`left`,`right`,`ok`,`back`,`home`],disabled:!0}).el)))};function cP(e){let t=[{id:`q1`,title:`Harbour Lights at Dusk`,subtitle:`Marram and the Low Hills`,art:$N(e,1,4),duration:214},{id:`q2`,title:`Slow Rivers`,subtitle:`Ines Okafor-Lund`,art:$N(e,2,0),duration:187},{id:`q3`,title:`A Map of Quiet Places`,subtitle:`Cinder Vale Quartet`,art:null,duration:301},{id:`q4`,title:`Copper Kettle Morning`,subtitle:`Wick and the Teaspoons`,art:`data:image/png;base64,broken`,duration:162},{id:`q5`,title:`Weekend in the Orchard`,subtitle:`Fen and Bramble`,art:$N(e,5,3),duration:248}],n=C(`Now playing: Lanterns Over the Quay`,{variant:`label`,tone:`muted`}),r={onPlay:e=>{let a=t.find(t=>t.id===e);n.textContent=`Now playing: ${a.title}`,t=t.filter(t=>t.id!==e),i.update({items:t,...r})},onRemove:e=>{t=t.filter(t=>t.id!==e),i.update({items:t,...r})}},i=VN({items:t,...r});return qN(n,i.el)}var lP={id:`up-next`,render:e=>qN(XN(`Play now and remove work here (removing keeps the keyboard focus in the list); a broken picture shows the placeholder`),ZN(cP(e),`Up next`),XN(`Episodes, at most two shown; and an empty queue`),JN(ZN(VN({items:[{id:`e1`,title:`Episode 4: The Lighthouse Keeper`,subtitle:`Saltmarsh Stories`,icon:`film`,duration:2710},{id:`e2`,title:`Episode 5: Low Tide`,subtitle:`Saltmarsh Stories`,icon:`film`,duration:2655},{id:`e3`,title:`Episode 6: The Storm Wall`,subtitle:`Saltmarsh Stories`,icon:`film`,duration:2930},{id:`e4`,title:`Episode 7: Homecoming`,subtitle:`Saltmarsh Stories`,icon:`film`,duration:3020}],max:2,onPlay:()=>{}}).el,`Next episodes`),ZN(VN({items:[]}).el,`Up next`)))},uP=[`idle`,`listening`,`transcribing`,`thinking`,`speaking`,`muted`,`error`],dP={id:`voice-ring`,render:()=>{let e=KN({phase:`listening`,onTap:()=>r(1)}),t=1,n={listening:`Turn on the lights in the…`,transcribing:`Turn on the lights in the study`,error:`The assistant didn’t answer. Try again in a moment.`},r=r=>{t=(t+r+uP.length)%uP.length,e.setPhase(uP[t]),e.setDetail(n[uP[t]])};e.setDetail(n.listening),eP(e.el,90,()=>{let t=Date.now()/1e3;e.setLevel(Math.max(0,Math.min(1,.4+.35*Math.sin(t*2.7)+(Math.random()-.5)*.45)))});let i=YN(...uP.map((e,n)=>P({label:e,variant:`tonal`,size:`small`,onClick:()=>r(n-t)}).el));return qN(XN(`Tap the ring (or a phase) to step through the phases; the level here is made up`),ZN(qN(e.el,i)),XN(`Every phase at the medium size`),JN(...uP.map(e=>ZN(KN({phase:e,size:`medium`,level:.6}).el))))}};function fP(e){let t={heard:`Turn off the living room lights and close the blinds`,reply:`Done. I turned off 2 lights and closed the blinds.`,changes:[{id:`l1`,name:`Ceiling light`,icon:lr,state:`Off`},{id:`l2`,name:`Reading lamp`,icon:`lightbulb`,state:`Off`},{id:`b1`,name:`Living room blinds`,icon:yt,state:`Closing`,active:!0}]},n=()=>{t={...t,undoing:!0},r.update({...t,onUndo:n}),setTimeout(()=>{t={...t,undoing:!1,undone:!0,changes:[{id:`l1`,name:`Ceiling light`,icon:lr,state:`On`,active:!0,tone:`warm`},{id:`l2`,name:`Reading lamp`,icon:`lightbulb-on`,state:`On · 40%`,active:!0,tone:`warm`},{id:`b1`,name:`Living room blinds`,icon:yt,state:`Open`}]},r.update({...t,onUndo:n})},900)},r=tN({...t,onUndo:n}),i=r.el;for(let[t,n]of Object.entries(_r(e.theme)))i.style.setProperty(t,n);return i}var pP=[nP,iP,sP,lP,dP,{id:`assist-reply`,render:e=>qN(XN(`What was heard, the reply and what changed; Undo works here (and the lit lamps take the home colours)`),ZN(fP(e)),XN(`One part failed, no undo`),ZN(tN({heard:`Set the heating to 21 and start the fan`,reply:`The heating is set to 21 °C, but the bedroom fan didn’t respond.`,changes:[{name:`Hallway thermostat`,icon:$t,state:`Heat · 21 °C`,active:!0,tone:`heat`},{name:`Bedroom fan`,icon:ot,failed:!0}]}).el),XN(`A question answered (nothing changed), and an error`),JN(ZN(tN({heard:`Is the back door locked?`,reply:`Yes, the back door is locked.`,changes:[{name:`Back door`,icon:x,state:`Locked`}]}).el),ZN(tN({heard:`Dim the porch light`,reply:`I couldn’t reach the porch light.`,error:!0}).el)))}],mP=e=>typeof e==`number`?e:e.getTime(),hP=new Map;function gP(e,t){let n=JSON.stringify([e.locale??``,e.timeZone??``,e.hour12??null,t]),r=hP.get(n);if(!r){let i={...t,timeZone:e.timeZone};e.hour12!==void 0&&(t.hour!==void 0||t.timeStyle!==void 0)&&(i.hour12=e.hour12),r=new Intl.DateTimeFormat(e.locale,i),hP.set(n,r)}return r}function _P(e){if(e.hour12!==void 0)return e.hour12;let t=gP(e,{hour:`numeric`}).resolvedOptions().hourCycle;return t===`h11`||t===`h12`}function vP(e,t={},n=!1){return gP(t,{hour:_P(t)?`numeric`:`2-digit`,minute:`2-digit`,second:n?`2-digit`:void 0}).format(mP(e))}function yP(e,t={}){let n=gP({timeZone:t.timeZone},{year:`numeric`,month:`numeric`,day:`numeric`}).formatToParts(mP(e)),r=e=>Number(n.find(t=>t.type===e)?.value??0);return Math.round(Date.UTC(r(`year`),r(`month`)-1,r(`day`))/864e5)}function bP(e,t){let n=mP(e),r=gP({timeZone:t,locale:`en-US`},{year:`numeric`,month:`numeric`,day:`numeric`,hour:`numeric`,minute:`numeric`,second:`numeric`,hourCycle:`h23`}).formatToParts(n),i=e=>Number(r.find(t=>t.type===e)?.value??0),a=Date.UTC(i(`year`),i(`month`)-1,i(`day`),i(`hour`)%24,i(`minute`),i(`second`));return Math.round((a-(n-n%1e3))/6e4)}function xP(e,t){return e&&e.charAt(0).toLocaleUpperCase(t)+e.slice(1)}var SP={justNow:`Just now`,by:`by`,more:`Show older`,empty:`Nothing has happened yet`};function CP(e,t,n={},r=SP.justNow){let i=(mP(t)-mP(e))/1e3;if(i<45)return r;let a=new Intl.RelativeTimeFormat(n.locale,{numeric:`always`});if(i<3600)return a.format(-Math.max(1,Math.round(i/60)),`minute`);if(i<86400)return a.format(-Math.round(i/3600),`hour`);let o=yP(t,n)-yP(e,n);return o<7?xP(new Intl.RelativeTimeFormat(n.locale,{numeric:`auto`}).format(-Math.max(1,o),`day`),n.locale):gP(n,{day:`numeric`,month:`short`}).format(mP(e))}function wP(e,t,n={}){let r=yP(t,n)-yP(e,n);return r>=0&&r<2?xP(new Intl.RelativeTimeFormat(n.locale,{numeric:`auto`}).format(-r,`day`),n.locale):r>=0&&r<7?gP(n,{weekday:`long`}).format(mP(e)):gP(n,{weekday:`long`,day:`numeric`,month:`long`}).format(mP(e))}function TP(e,t){let n={...SP,...e.labels},r=[...e.items].sort((e,t)=>mP(t.time)-mP(e.time)),i=e.max!==void 0&&e.max>=0?r.slice(0,Math.floor(e.max)):r,a=gP(e,{dateStyle:`medium`,timeStyle:`short`}),o=[],s=null;for(let r of i){let i={item:r,ago:e.groupByDay!==!1&&yP(r.time,e)<yP(t,e)?vP(r.time,e):CP(r.time,t,e,n.justNow),full:a.format(mP(r.time)),iso:new Date(mP(r.time)).toISOString()},c=yP(r.time,e);e.groupByDay===!1?o.length||o.push({label:null,entries:[]}):c!==s&&o.push({label:wP(r.time,t,e),entries:[]}),s=c,o[o.length-1].entries.push(i)}return{days:o,empty:i.length===0}}function EP(e=`neutral`){return B(`mh-activity-feed__item`,e!==`neutral`&&`mh-activity-feed__item--${e}`)}var DP=jt;function OP(e){let t={...e},n=M(`section`,{class:`mh-activity-feed`}),r,i=()=>{let e={...SP,...t.labels},r=TP(t,t.now??Date.now()),i=`h${t.headingLevel??3}`;n.setAttribute(`aria-label`,t.label??`Activity`);let a=n=>{let r=[M(`span`,{class:`mh-activity-feed__icon`,"aria-hidden":`true`},H(n.item.icon??DP)),M(`span`,{class:`mh-activity-feed__text`},M(`span`,{class:`mh-activity-feed__title`},n.item.title),n.item.by?M(`span`,{class:`mh-activity-feed__by`},M(`span`,{class:`mh-visually-hidden`},`${e.by} `),n.item.by):null),M(`time`,{class:`mh-activity-feed__time`,datetime:n.iso,title:n.full},n.ago)],i=t.onSelect,a=i?M(`button`,{type:`button`,class:`mh-activity-feed__row mh-activity-feed__row--button`,onclick:()=>i(n.item.id)},...r):M(`div`,{class:`mh-activity-feed__row`},...r);return M(`li`,{class:EP(n.item.tone),"data-id":n.item.id},a)},o=t.onMore?P({label:e.more,variant:`text`,size:`small`,onClick:()=>t.onMore?.()}).el:null;o?.classList.add(`mh-activity-feed__more`),n.replaceChildren(...r.days.map(e=>M(`div`,{class:`mh-activity-feed__day`},e.label?M(i,{class:`mh-activity-feed__day-label`},e.label):null,M(`ol`,{class:`mh-activity-feed__list`,role:`list`},...e.entries.map(a)))),...r.empty?[M(`p`,{class:`mh-activity-feed__empty`},e.empty)]:[],...o?[o]:[])},a=()=>{let e=TP(t,Date.now()),r=[...n.querySelectorAll(`.mh-activity-feed__day-label`)].map(e=>e.textContent);if(e.days.some((e,t)=>e.label!==null&&e.label!==r[t]))return i();let a=n.querySelectorAll(`.mh-activity-feed__time`);e.days.flatMap(e=>e.entries).forEach((e,t)=>{let n=a[t];n&&n.textContent!==e.ago&&(n.textContent=e.ago)})},o=()=>{clearInterval(r),r=t.now===void 0?setInterval(a,3e4):void 0};return i(),o(),{el:n,update(e){t={...t,...e},i(),o()},destroy(){clearInterval(r),r=void 0}}}function kP(e,t={},n=!1){let r=mP(e),i=gP(t,{hour:_P(t)?`numeric`:`2-digit`,minute:`2-digit`,second:n?`2-digit`:void 0}).formatToParts(r),a=i.findIndex(e=>e.type===`dayPeriod`),o=a>=0?i[a].value:``,s=i.findIndex(e=>e.type===`hour`),c=i.filter(e=>e.type!==`dayPeriod`).map(e=>e.value).join(``).trim(),l=gP(t,{weekday:`long`,day:`numeric`,month:`long`}).format(r);return{time:c,period:o,periodFirst:a>=0&&a<s,date:l,iso:new Date(r).toISOString()}}function AP(e){let t=e=>Math.round(e*1e3)/1e3;return{x:t(Math.sin(e*.61)),y:t(Math.sin(e*.37+1.3))}}function jP(e,t){let n=t?1e3:6e4;return n-e%n+5}function MP(e){return B(`mh-ambient-clock`,e.night&&`is-night`)}var NP=()=>typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches,PP=en;function FP(e){let t={...e},n=M(`span`,{class:`mh-ambient-clock__digits`}),r=M(`span`,{class:`mh-ambient-clock__period`}),i=M(`time`,{class:`mh-ambient-clock__time`}),a=M(`div`,{class:`mh-ambient-clock__date`}),o=M(`div`,{class:`mh-ambient-clock__extras`}),s=M(`div`,{class:`mh-ambient-clock__face`},i),c=M(`div`,{role:`group`},s),l,u,d=0,f=``,p=()=>!!t.seconds&&!t.night,m=()=>{let e=kP(t.time??Date.now(),t,p());n.textContent=e.time,r.textContent=e.period,i.dateTime=e.iso,i.replaceChildren(...e.period?e.periodFirst?[r,n]:[n,r]:[n]),a.textContent=e.date},h=()=>{let e=JSON.stringify([t.nextEvent??null,t.weather??null]);if(e===f)return;f=e;let n=t.nextEvent,r=t.weather;o.replaceChildren(...n?[M(`div`,{class:`mh-ambient-clock__event`},H(n.icon??PP,{class:`mh-ambient-clock__event-icon`}),n.when?M(`span`,{class:`mh-ambient-clock__event-when`},n.when):null,M(`span`,{class:`mh-ambient-clock__event-title`},n.title))]:[],...r?[M(`div`,{class:`mh-ambient-clock__weather`},H(Qr(r.condition),{class:ii(r.condition,`mh-ambient-clock__weather-icon`)}),M(`span`,{class:`mh-ambient-clock__temperature`},ci(r.temperature,r.unit)),r.text??ti(r.condition)?M(`span`,{class:`mh-ambient-clock__condition`},r.text??ti(r.condition)):null)]:[])},g=()=>{clearTimeout(l),l=void 0,t.time===void 0&&(l=setTimeout(()=>{m(),g()},jP(Date.now(),p())))},_=e=>{let t=AP(e);c.style.setProperty(`--_dx`,String(t.x)),c.style.setProperty(`--_dy`,String(t.y))},v=()=>{clearInterval(u),u=void 0,t.drift===!1||NP()?(c.style.removeProperty(`--_dx`),c.style.removeProperty(`--_dy`)):(_(d),u=setInterval(()=>_(++d),t.driftEvery??6e4))},y=()=>{c.className=MP(t),c.setAttribute(`aria-label`,t.label??`Clock`),m(),h(),s.replaceChildren(i,...t.date===!1?[]:[a],...t.nextEvent||t.weather?[o]:[])};return y(),g(),v(),{el:c,update(e){let n=`drift`in e||`driftEvery`in e;t={...t,...e},y(),g(),n&&v()},destroy(){clearTimeout(l),clearInterval(u),l=u=void 0}}}var IP={line:`Line`,destination:`Destination`,platform:`Platform`,departs:`Departs`,now:`Now`,min:`min`,inMinutes:e=>e===1?`in 1 minute`:`in ${e} minutes`,late:e=>`${e} min late`,early:e=>`${e} min early`,cancelled:`Cancelled`,live:`Live`,scheduled:`Timetabled`,stale:`Live times unavailable, showing the timetable`,empty:`No departures soon`,more:e=>`${e} more later`};function LP(e,t){let n=e.filter(e=>e.minutes===null||e.minutes>=0).map((e,t)=>({d:e,i:t})).sort((e,t)=>(e.d.minutes??1/0)-(t.d.minutes??1/0)||e.i-t.i).map(e=>e.d),r=t!==void 0&&t>=0?n.slice(0,Math.floor(t)):n;return{rows:r,hidden:n.length-r.length,platforms:r.some(e=>!!e.platform)}}var RP={bus:We,tram:at,train:ne,metro:oe,ferry:pt},zP=Nn,BP=_n;function VP(e){let t=(e.delay??0)>0;return B(`mh-departures-board__row`,e.cancelled&&`is-cancelled`,!e.cancelled&&e.minutes!==null&&e.minutes<1&&`is-due`,!e.cancelled&&t&&`is-late`)}function HP(e){return B(`mh-departures-board__line-badge`,e&&`mh-departures-board__line-badge--c${e}`)}function UP(e,t){if(e.minutes===null)return{value:`–`,unit:``,spoken:``};let n=Math.floor(e.minutes);return n<1?{value:t.now,unit:``,spoken:t.now}:{value:String(n),unit:t.min,spoken:t.inMinutes(n)}}function WP(e,t){let n=Math.round(e.delay??0);return!n||e.cancelled?null:n>0?{text:`+${n}`,spoken:t.late(n)}:{text:`−${-n}`,spoken:t.early(-n)}}function GP(e){let t={...e},n=M(`section`,{}),r=()=>{let e={...IP,...t.labels},r=LP(t.departures,t.max),i=`h${t.headingLevel??3}`;n.className=B(`mh-departures-board`,t.stale&&`is-stale`),n.setAttribute(`aria-label`,t.stop||t.label||`Departures`);let a=(e,t)=>M(`th`,{scope:`col`,class:t},e),o=n=>{let i=UP(n,e),a=WP(n,e),o=n.live&&!t.stale&&!n.cancelled;return M(`tr`,{class:VP(n),"data-id":n.id},M(`td`,{class:`mh-departures-board__line`},M(`span`,{class:HP(n.color)},n.mode?H(RP[n.mode]):null,M(`span`,{class:`mh-departures-board__line-name`},n.line))),M(`td`,{class:`mh-departures-board__destination`},M(`span`,{class:`mh-departures-board__name`},n.destination),n.via?M(`span`,{class:`mh-departures-board__via`},n.via):null,n.note?M(`span`,{class:`mh-departures-board__note`},n.note):null),r.platforms?M(`td`,{class:`mh-departures-board__platform`},n.platform??``):null,M(`td`,{class:`mh-departures-board__departs`},n.cancelled?M(`span`,{class:`mh-departures-board__cancelled`},e.cancelled):M(`span`,{class:`mh-departures-board__minutes`},o?H(zP,{class:`mh-departures-board__live`,label:e.live}):null,M(`span`,{class:`mh-departures-board__value`,"aria-hidden":i.spoken?`true`:null},i.value),i.unit?M(`span`,{class:`mh-departures-board__unit`,"aria-hidden":`true`},i.unit):null,i.spoken?M(`span`,{class:`mh-visually-hidden`},i.spoken):null),a?M(`span`,{class:`mh-departures-board__delay`},M(`span`,{"aria-hidden":`true`},a.text),M(`span`,{class:`mh-visually-hidden`},a.spoken)):null,n.time?M(`span`,{class:`mh-departures-board__time`},M(`span`,{class:`mh-visually-hidden`},`${e.scheduled} `),n.time):null))},s=t.stop||t.updated?M(`div`,{class:`mh-departures-board__header`},t.stop?M(i,{class:`mh-departures-board__stop`},t.stop):null,t.updated?M(`span`,{class:`mh-departures-board__updated`},t.updated):null):null;n.replaceChildren(...s?[s]:[],...t.stale?[M(`p`,{class:`mh-departures-board__stale`},H(BP),e.stale)]:[],...r.rows.length?[M(`table`,{class:`mh-departures-board__table`},M(`thead`,{class:`mh-visually-hidden`},M(`tr`,{},a(e.line,`mh-departures-board__th`),a(e.destination,`mh-departures-board__th`),r.platforms?a(e.platform,`mh-departures-board__th`):null,a(e.departs,`mh-departures-board__th`))),M(`tbody`,{},...r.rows.map(o)))]:[M(`p`,{class:`mh-departures-board__empty`},e.empty)],...r.hidden?[M(`p`,{class:`mh-departures-board__more`},e.more(r.hidden))]:[])};return r(),{el:n,update(e){t={...t,...e},r()}}}var KP={title:`Notifications`,pinned:`Needs attention`,other:`Other`,critical:`Critical`,unread:`New`,dismiss:e=>`Dismiss ${e}`,clearAll:`Clear all`,empty:`No notifications`,showMore:e=>`Show ${e} more`,showLess:`Show less`};function qP(e,t){return t&&(e.dismissible??e.priority!==`critical`)}function JP(e,t={}){let n=t.collapseAfter??3,r=e.filter(e=>e.priority===`critical`),i=new Map;for(let t of e){if(t.priority===`critical`)continue;let e=t.group?.trim()??``,n=i.get(e)??[];n.push(t),i.set(e,n)}let a=[...i.keys()].filter(e=>e!==``);i.has(``)&&a.push(``);let o=a.some(e=>e!==``);return{pinned:r,groups:a.map(e=>{let r=i.get(e),a=n>0&&r.length>n,s=t.expanded?.has(e)??!1,c=a&&!s?r.slice(0,n):r;return{key:e,name:e||(o?t.other??KP.other:null),items:c,hidden:r.length-c.length,expanded:s,folds:a}}),dismissible:e.filter(e=>qP(e,t.canDismiss??!0)).map(e=>e.id),count:e.length}}function YP(e){return B(`mh-notification`,e.priority&&e.priority!==`normal`&&`mh-notification--${e.priority}`,e.unread&&`is-unread`)}function XP(e){return e.icon??(e.priority===`critical`?`M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z`:e.priority===`high`?`M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16`:`M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z`)}function ZP(e){return e===`primary`?`tonal`:e===`danger`?`danger`:`text`}function QP(e,t){return[e.priority===`critical`&&t.critical,e.unread&&t.unread].filter(Boolean).join(`, `)+(e.priority===`critical`||e.unread?`: `:``)}var $P=Hr;function eF(e){let t={...e},n=new Set,r=M(`section`,{class:`mh-notification-centre`,tabindex:`-1`}),i=null,a=(e,n,a)=>{let o=QP(e,n),s=e.actions?.length?M(`div`,{class:`mh-notification__actions`},...e.actions.map(n=>P({label:n.label,size:`small`,variant:ZP(n.tone),onClick:()=>t.onAction?.(e.id,n.id)}).el)):null,c=M(`li`,{class:YP(e),"data-id":e.id},M(`span`,{class:`mh-notification__icon`,"aria-hidden":`true`},H(XP(e))),M(`div`,{class:`mh-notification__body`},M(`div`,{class:`mh-notification__top`},M(`span`,{class:`mh-notification__title`},o?M(`span`,{class:`mh-visually-hidden`},o):null,e.title),e.time?M(`span`,{class:`mh-notification__time`},e.time):null),e.message?M(`p`,{class:`mh-notification__message`},e.message):null,s));if(qP(e,a)){let a=U({icon:$P,label:n.dismiss(e.title),size:`small`,onClick:()=>{i=[...r.querySelectorAll(`.mh-notification`)].indexOf(c),t.onDismiss?.(e.id)}}).el;a.classList.add(`mh-notification__dismiss`),c.append(a)}return c},o=()=>{let e={...KP,...t.labels},i=!!t.onDismiss,s=JP(t.notifications,{collapseAfter:t.collapseAfter,expanded:n,canDismiss:i,other:e.other}),c=t.headingLevel??2,l=`h${c}`,u=`h${Math.min(c+1,6)}`;r.setAttribute(`aria-label`,e.title);let d=(t,s,c,l)=>M(`div`,{class:B(`mh-notification-centre__section`,c&&`mh-notification-centre__section--pinned`)},t?M(u,{class:`mh-notification-centre__section-title`},t):null,M(`ul`,{class:`mh-notification-centre__list`,role:`list`},...s.map(t=>a(t,e,i))),l?.folds?(()=>{let t=P({label:l.expanded?e.showLess:e.showMore(l.hidden),size:`small`,variant:`text`,onClick:()=>{n.has(l.key)?n.delete(l.key):n.add(l.key),o(),r.querySelector(`.mh-notification-centre__more[data-group="${CSS.escape(l.key)}"]`)?.focus()}}).el;return t.classList.add(`mh-notification-centre__more`),t.setAttribute(`aria-expanded`,String(l.expanded)),t.dataset.group=l.key,t})():null),f=t.onClearAll&&s.dismissible.length?P({label:e.clearAll,size:`small`,variant:`text`,onClick:()=>t.onClearAll?.(JP(t.notifications,{canDismiss:!!t.onDismiss}).dismissible)}).el:null;f?.classList.add(`mh-notification-centre__clear`),r.replaceChildren(...t.header===!1?[]:[M(`div`,{class:`mh-notification-centre__header`},M(l,{class:`mh-notification-centre__title`},e.title),s.count?M(`span`,{class:`mh-notification-centre__count`},s.count):null,f)],...s.pinned.length?[d(e.pinned,s.pinned,!0)]:[],...s.groups.map(e=>d(e.name,e.items,!1,e)),...s.count?[]:[M(`p`,{class:`mh-notification-centre__empty`},e.empty)])},s=()=>{if(i===null)return;let e=i;if(i=null,r.contains(document.activeElement)&&document.activeElement!==r)return;let t=[...r.querySelectorAll(`.mh-notification`)];(t[Math.min(e,t.length-1)]?.querySelector(`.mh-notification__dismiss, button`)??r).focus()};return o(),{el:r,update(e){t={...t,...e},o(),s()}}}var tF={to:`to`,ongoing:`until now`,before:`since before`,on:`On`,none:`Not at all`},nF=[5,10,15,30,60,120,180,240,360,720,1440];function rF(e,t,n={},r=4){let i=t-e;if(!(i>0))return[];let a=i/6e4/Math.max(1,r),o=(nF.find(e=>e>=a)??1440)*6e4,s=bP(e,n.timeZone)*6e4,c=Math.ceil((e+s)/o)*o-s,l=[];for(let r=c;r<=t&&l.length<50;r+=o)l.push({at:(r-e)/i,label:vP(r,n)});return l}function iF(e){let t={...tF,...e.labels},n=mP(e.start),r=mP(e.end),i=r-n,a=e.now===void 0||e.now===null?null:mP(e.now),o=a===null?r:Math.min(a,r),s=t=>vP(t,e);return{rows:e.rows.map(e=>({label:e.label,icon:e.icon,segments:i>0?e.spans.flatMap(a=>{let c=mP(a.from),l=a.to===null?o:mP(a.to),u=Math.max(c,n),d=Math.min(l,r);if(!(d>u))return[];let f=a.state??e.state??t.on,p=c<n?`${t.before} ${s(n)}`:s(c),m=a.to===null?t.ongoing:`${t.to} ${s(l)}`;return[{left:(u-n)/i,width:(d-u)/i,openStart:c<n,openEnd:a.to===null||l>r,color:a.color??e.color??`accent`,text:`${f}, ${p} ${m}`}]}):[]})),ticks:rF(n,r,e,e.ticks),now:a!==null&&a>=n&&a<=r&&i>0?(a-n)/i:null}}function aF(e){return B(`mh-state-timeline__span`,e.color!==`accent`&&`mh-state-timeline__span--c${e.color}`,e.openStart&&`is-open-start`,e.openEnd&&`is-open-end`)}var oF=e=>`--_at: ${sF(e)}; --_k: ${Math.round(e*1e3)/1e3}`,sF=e=>`${Math.round(e*1e5)/1e3}%`;function cF(e){let t={...e},n=M(`div`,{class:`mh-state-timeline`,role:`group`}),r=()=>{let e={...tF,...t.labels},r=iF(t);n.setAttribute(`aria-label`,t.label??`Timeline`);let i=()=>r.now===null?null:M(`span`,{class:`mh-state-timeline__now`,"aria-hidden":`true`,style:`--_at: ${sF(r.now)}`});n.replaceChildren(M(`ul`,{class:`mh-state-timeline__rows`,role:`list`},...r.rows.map(t=>M(`li`,{class:`mh-state-timeline__row`},M(`span`,{class:`mh-state-timeline__label`},t.icon?H(t.icon,{class:`mh-state-timeline__icon`}):null,M(`span`,{class:`mh-state-timeline__name`},t.label)),M(`span`,{class:`mh-state-timeline__track`},...t.segments.map(e=>M(`span`,{class:aF(e),title:e.text,style:`--_from: ${sF(e.left)}; --_len: ${sF(e.width)}`},M(`span`,{class:`mh-visually-hidden`},e.text))),t.segments.length?null:M(`span`,{class:`mh-visually-hidden`},e.none),i())))),M(`div`,{class:`mh-state-timeline__axis`,"aria-hidden":`true`},M(`span`,{class:`mh-state-timeline__scale`},...r.ticks.map(e=>M(`span`,{class:`mh-state-timeline__tick`,style:oF(e.at)},e.label)))))};return r(),{el:n,update(e){t={...t,...e},r()}}}var lF={add:`Add`,newItem:`Add an item`,completed:e=>`Completed (${e})`,clearCompleted:`Clear completed`,remove:e=>`Remove ${e}`,empty:`Nothing on the list`,allDone:`All done`,added:e=>`${e} added`,checked:e=>`${e} checked off`,unchecked:e=>`${e} back on the list`};function uF(e){return{open:e.filter(e=>!e.done),done:e.filter(e=>e.done)}}function dF(e){return B(`mh-reorder__item`,`mh-todo-list__item`,e&&`is-done`)}function fF(e,t,n){if(t&&!t.closest(`[hidden]`))return t.focus();let r=e.querySelectorAll(`.mh-todo-list__open .mh-checkbox__input`);(r[Math.min(n,r.length-1)]??e.querySelector(`.mh-todo-list__toggle`))?.focus()}var pF=vt,mF=Hr,hF=Yn,gF=ye;function _F(e){let t={...e},n=t.completedOpen??!1,r=I(`mh-todo`),i=I(`mh-todo-done`),a=M(`section`,{class:`mh-todo-list`}),o=M(`div`,{class:`mh-reorder__live mh-visually-hidden`,"aria-live":`polite`,"aria-atomic":`true`}),s=M(`p`,{class:`mh-visually-hidden`,id:r}),c=M(`ul`,{class:`mh-reorder__list mh-todo-list__list`}),u=M(`div`,{class:`mh-reorder mh-todo-list__open`},c,o),d=M(`p`,{class:`mh-todo-list__empty`}),f=M(`span`,{class:`mh-todo-list__toggle-text`}),p=M(`button`,{type:`button`,class:`mh-todo-list__toggle`,"aria-controls":i},H(hF,{class:`mh-todo-list__chevron`}),f),h=M(`ul`,{class:`mh-reorder__list mh-todo-list__list mh-todo-list__done-list`,id:i}),g=M(`div`,{class:`mh-todo-list__done-header`},p),_=M(`div`,{class:`mh-todo-list__done`},g,h),v=M(`input`,{class:`mh-input__control`,type:`text`,autocomplete:`off`,enterkeyhint:`done`}),y=M(`button`,{type:`submit`,class:B(l(`accent`,`medium`,!0),`mh-todo-list__add-button`)},H(pF)),b=M(`form`,{class:`mh-todo-list__add`},M(`div`,{class:Pn(`medium`,`mh-todo-list__input`)},v),y),x=null,S=new Map,C=null,w=()=>({...lF,...t.labels}),T=e=>{o.textContent=e};b.addEventListener(`submit`,e=>{e.preventDefault();let n=v.value.trim();n&&(t.onAdd?.(n),v.value=``,T(w().added(n)))}),p.addEventListener(`click`,()=>{n=!n,O()});let E=(e,n)=>{let i=!e.done&&!!t.onReorder,a=M(`input`,{type:`checkbox`,class:`mh-checkbox__input`});a.checked=e.done,a.addEventListener(`change`,()=>{let r=a.closest(`li`);C={id:e.id,at:r?Array.from(r.parentElement?.children??[]).indexOf(r):0},T((a.checked?n.checked:n.unchecked)(e.text)),t.onToggle?.(e.id,a.checked)});let o=t.onRemove?M(`button`,{type:`button`,class:B(l(`default`,`small`),`mh-todo-list__remove`),"aria-label":n.remove(e.text),title:n.remove(e.text),onclick:()=>t.onRemove?.(e.id)},H(mF)):null,s={...WT,...t.messages};return M(`li`,{class:dF(e.done),"data-id":e.id},i?M(`button`,{type:`button`,class:`mh-reorder__handle`,"aria-label":s.handle(e.text),"aria-describedby":r,"aria-pressed":`false`},H(gF)):null,M(`label`,{class:`mh-checkbox mh-todo-list__check`},M(`span`,{class:`mh-checkbox__control`},a,H(Wt,{class:`mh-checkbox__check`}),H(ce,{class:`mh-checkbox__dash`})),M(`span`,{class:`mh-checkbox__text`},M(`span`,{class:`mh-checkbox__label mh-reorder__label mh-todo-list__text`},e.text),e.note?M(`span`,{class:`mh-checkbox__description mh-todo-list__note`},e.note):null)),o)},D=(e,n)=>e.map(e=>{let r=JSON.stringify([e.text,e.done,e.note??null,!!t.onReorder,!!t.onRemove,t.labels??null,t.messages??null]),i=S.get(e.id);if(i&&i.key===r)return i.li;let a=E(e,n);return S.set(e.id,{li:a,key:r}),a}),O=()=>{let e=w(),r=uF(t.items);a.setAttribute(`aria-label`,t.label),c.setAttribute(`aria-label`,t.label),s.textContent={...WT,...t.messages}.instructions,v.setAttribute(`aria-label`,e.newItem),v.placeholder=e.newItem,y.setAttribute(`aria-label`,e.add),y.title=e.add;let i=new Set(t.items.map(e=>e.id));for(let e of[...S.keys()])i.has(e)||S.delete(e);if(m(c,D(r.open,e)),m(h,D(r.done,e)),m(u,t.onReorder?[s,c,o]:[c,o]),d.textContent=r.done.length?e.allDone:e.empty,f.textContent=e.completed(r.done.length),p.setAttribute(`aria-expanded`,String(n)),h.hidden=!n,h.setAttribute(`aria-label`,e.completed(r.done.length)),t.onClearCompleted&&r.done.length?(x||(x=P({label:e.clearCompleted,variant:`text`,size:`small`,onClick:()=>t.onClearCompleted?.(uF(t.items).done.map(e=>e.id))}).el,x.classList.add(`mh-todo-list__clear`)),x.querySelector(`.mh-button__label`).textContent=e.clearCompleted,m(g,[p,x])):m(g,[p]),m(a,[...t.onAdd?[b]:[],u,...r.open.length?[]:[d],...r.done.length?[_]:[]]),C!==null){let e=C;C=null,a.contains(document.activeElement)||fF(a,S.get(e.id)?.li.querySelector(`.mh-checkbox__input`)??null,e.at)}};O();let k=qT(u,{get messages(){return t.messages},onMove:(e,n)=>{let r=GT(Array.from(c.children).map(e=>e.dataset.id??``),e,n),i=c.children[e];if(!i||e===n)return;let a=Array.from(c.children).filter(e=>e!==i);c.insertBefore(i,a[n]??null),t.onReorder?.(r)}});return{el:a,update(e){t={...t,...e},`completedOpen`in e&&(n=e.completedOpen??!1),O()},destroy:()=>k.destroy()}}var vF=(...e)=>M(`div`,{class:`ex-stack`},...e),yF=(...e)=>M(`div`,{class:`mh-grid`},...e),bF=e=>C(e,{variant:`label`,tone:`muted`}),xF=(e,t)=>V({title:t,body:e}).el,SF=[{id:`leak`,title:`Water under the kitchen sink`,message:`The leak sensor has been wet for 2 minutes.`,priority:`critical`,icon:zn,time:`Now`,actions:[{id:`valve`,label:`Close main valve`,tone:`primary`},{id:`ok`,label:`I’m on it`}]},{id:`door`,title:`Back door left open`,message:`Open for 10 minutes.`,group:`Security`,priority:`high`,icon:Oe,time:`10 min`,unread:!0,actions:[{id:`remind`,label:`Remind me later`}]},{id:`garage`,title:`Garage door open`,group:`Security`,icon:Ft,time:`25 min`,actions:[{id:`close`,label:`Close it`,tone:`primary`}]},{id:`window`,title:`Bathroom window open`,group:`Security`,icon:Pr,time:`1 h`},{id:`motion`,title:`Motion on the porch`,group:`Security`,priority:`low`,icon:qr,time:`2 h`},{id:`washer`,title:`Washing finished`,message:`Cotton 40° · 1 h 52 min`,group:`Appliances`,icon:pr,time:`12 min`,unread:!0},{id:`vacuum`,title:`Vacuum stuck under the sofa`,group:`Appliances`,priority:`high`,icon:Pt,time:`40 min`,actions:[{id:`locate`,label:`Play sound`}]},{id:`update`,title:`Two updates are ready`,message:`They install tonight at 03:00.`,time:`Yesterday`,priority:`low`}];function CF(){let e=SF,t=bF(`Tap an action, dismiss a notification or clear them all.`),n=eF({notifications:e,onAction:(r,i)=>{t.textContent=`Action “${i}” on ${r}`,r===`leak`&&n.update({notifications:e=e.filter(e=>e.id!==`leak`)})},onDismiss:t=>n.update({notifications:e=e.filter(e=>e.id!==t)}),onClearAll:t=>n.update({notifications:e=e.filter(e=>!t.includes(e.id))})}),r=M(`button`,{type:`button`,class:`mh-button mh-button--secondary mh-button--sm`,onclick:()=>n.update({notifications:e=SF})},M(`span`,{class:`mh-button__label`},`Bring them back`));return vF(n.el,M(`div`,{class:`ex-row`},r,t))}var wF=(e,t={})=>M(`div`,{...t,style:`display: grid; aspect-ratio: 16 / 10; min-height: 14rem; overflow: hidden; border-radius: var(--mh-radius-lg); border: var(--mh-border-width) solid var(--mh-panel-outline); background: linear-gradient(var(--mh-canvas-top), var(--mh-canvas-bottom)); color: var(--mh-text);`},e);function TF(){let e=FP({nextEvent:{title:`Bins out`,when:`19:30`},weather:{condition:`partly-cloudy`,temperature:14},driftEvery:4e3}),t=L({label:`Night`,onChange:t=>e.update({night:t})}),n=L({label:`Seconds`,onChange:t=>e.update({seconds:t})}),r=L({label:`12-hour`,onChange:t=>e.update({hour12:t?!0:void 0})});return vF(wF(e.el),M(`div`,{class:`ex-row`},t.el,n.el,r.el),bF(`The face drifts a little every few seconds here (once a minute by default), and holds still with reduced motion.`))}var $=(e,t=0)=>new Date(2026,9,16,e,t).getTime(),EF=[{label:`Hall light`,icon:Lr,spans:[{from:$(6,40),to:$(7,55)},{from:$(17,10),to:null}]},{label:`Back door`,icon:Oe,state:`Open`,color:2,spans:[{from:$(8,5),to:$(8,9)},{from:$(12,30),to:$(12,52)},{from:$(16,2),to:$(16,4)}]},{label:`Front lock`,icon:x,state:`Unlocked`,color:4,spans:[{from:$(-2),to:$(7,50)},{from:$(15,45),to:$(16,0)}]},{label:`Heating`,icon:u,state:`Heating`,color:5,spans:[{from:$(5,30),to:$(8,30)},{from:$(16,30),to:null}]},{label:`Sam`,icon:Cr,state:`Home`,color:1,spans:[{from:$(0),to:$(8,10)},{from:$(15,40),to:null}]},{label:`Garage door`,icon:Ft,state:`Open`,spans:[]}],DF=e=>Date.now()-e*6e4,OF=[{id:`1`,title:`Back door opened`,by:`Robin`,time:DF(.2),icon:Oe,tone:`accent`},{id:`2`,title:`Heating set to 21 °C`,by:`Evening routine`,time:DF(14),icon:u,tone:`warning`},{id:`3`,title:`Hall light turned on`,by:`Motion in the hall`,time:DF(52),icon:Lr},{id:`4`,title:`Front door locked`,by:`Sam`,time:DF(190),icon:x,tone:`success`},{id:`5`,title:`Water leak cleared`,by:`Kitchen leak sensor`,time:DF(1560),icon:zn,tone:`danger`},{id:`6`,title:`Washing finished`,time:DF(1740),icon:pr},{id:`7`,title:`Garage door closed`,by:`Robin`,time:DF(4350),icon:Ft}],kF=[{id:`a`,line:`14`,mode:`bus`,color:1,destination:`Harbour Gate`,via:`via Old Market`,minutes:0,live:!0},{id:`b`,line:`T3`,mode:`tram`,color:3,destination:`Mill Lane`,minutes:4,time:`08:46`,live:!0},{id:`c`,line:`14`,mode:`bus`,color:1,destination:`Harbour Gate`,minutes:13,time:`08:52`,delay:3,live:!0},{id:`d`,line:`R2`,mode:`train`,color:5,destination:`Brackenmoor Junction`,platform:`2`,minutes:21,time:`09:03`,cancelled:!0},{id:`e`,line:`R2`,mode:`train`,color:5,destination:`Brackenmoor Junction`,platform:`1`,minutes:33,time:`09:15`,note:`Replacement bus from Fernhollow`},{id:`f`,line:`N8`,mode:`bus`,destination:`Larkspur Park`,minutes:47,time:`09:29`},{id:`g`,line:`F1`,mode:`ferry`,color:2,destination:`Gull Island`,minutes:58,time:`09:40`,delay:-1}];function AF(){let e=kF,t=GP({stop:`Elm Street`,updated:`Updated just now`,departures:e,max:6}),n=M(`button`,{type:`button`,class:`mh-button mh-button--secondary mh-button--sm`,onclick:()=>t.update({departures:e=e.map(e=>({...e,minutes:e.minutes===null?null:e.minutes-1}))})},M(`span`,{class:`mh-button__label`},`A minute later`));return vF(t.el,M(`div`,{class:`ex-row`},n))}var jF=[{id:`milk`,text:`Oat milk`,done:!1,note:`2 cartons`},{id:`bread`,text:`Sourdough loaf`,done:!1},{id:`apples`,text:`Apples`,done:!1,note:`The crunchy ones`},{id:`soap`,text:`Washing-up liquid`,done:!1},{id:`eggs`,text:`Eggs`,done:!0},{id:`rice`,text:`Basmati rice`,done:!0}];function MF(e,t,n=!1){let r=t,i=0,a=e=>o.update({items:r=e}),o=_F({label:e,items:r,completedOpen:n,onAdd:e=>a([...r,{id:`new-${i++}`,text:e,done:!1}]),onToggle:(e,t)=>a(r.map(n=>n.id===e?{...n,done:t}:n)),onReorder:e=>a([...e.map(e=>r.find(t=>t.id===e)),...r.filter(e=>e.done)]),onRemove:e=>a(r.filter(t=>t.id!==e)),onClearCompleted:e=>a(r.filter(t=>!e.includes(t.id)))});return o.el}var NF=[{id:`notification-centre`,render:()=>yF(xF(CF()),vF(xF(eF({notifications:SF.slice(5,7),labels:{title:`Kitchen`},headingLevel:3,onDismiss:()=>{}}).el),xF(eF({notifications:[]}).el)))},{id:`ambient-clock`,render:()=>vF(TF(),bF(`Fixed times: a 12-hour locale, and the night look in the nightstand theme`),yF(wF(FP({time:new Date(2026,9,16,7,5),locale:`en-US`,weather:{condition:`clear`,temperature:61,unit:`°F`},drift:!1}).el),wF(FP({time:new Date(2026,9,16,23,42),night:!0,nextEvent:{title:`Alarm`,when:`06:30`},drift:!1}).el,{"data-mh-theme":`nightstand`})))},{id:`state-timeline`,render:()=>vF(xF(cF({label:`Today at home`,rows:EF,start:$(0),end:$(24),now:$(18,20)}).el,`Today`),xF(cF({label:`This morning`,rows:EF.slice(0,3),start:$(6),end:$(9),ticks:6}).el,`This morning, 06:00 to 09:00`))},{id:`activity-feed`,render:()=>{let e=bF(`Select an entry.`);return yF(xF(vF(OP({items:OF,onSelect:t=>e.textContent=`Selected entry ${t}`,onMore:()=>e.textContent=`Load older entries`}).el,e),`Activity`),xF(OP({items:OF.slice(0,4),groupByDay:!1,max:3}).el,`Latest`))}},{id:`departures-board`,render:()=>yF(xF(AF()),vF(xF(GP({stop:`Quayside`,departures:kF.slice(0,3),stale:!0}).el),xF(GP({stop:`Larkspur Park`,departures:[]}).el)))},{id:`todo-list`,render:()=>yF(xF(MF(`Shopping`,jF),`Shopping`),xF(MF(`Chores`,[{id:`plants`,text:`Water the plants`,done:!1},{id:`filter`,text:`Change the hood filter`,done:!1,note:`Every 3 months`},{id:`bins`,text:`Bins out`,done:!0}],!0),`Chores`))}],PF=(...e)=>M(`div`,{class:`ex-stack`},...e),FF=(...e)=>M(`div`,{class:`mh-grid`},...e),IF=e=>C(e,{variant:`label`,tone:`muted`}),LF=(e,t)=>V({title:t,body:e}).el,RF=e=>`data:image/svg+xml,${encodeURIComponent(e)}`,zF=(e,t,n)=>{let r=e.theme.palette.series;return RF(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' fill='${r[t]}'/><circle cx='60' cy='60' r='28' fill='${r[n]}'/></svg>`)},BF=e=>{let t=e.theme.palette;return RF(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 90'><rect width='160' height='90' fill='${t.series[3]}'/><rect y='52' width='160' height='38' fill='${t.series[2]}'/><rect x='92' y='22' width='26' height='40' fill='${t.surfaceRaised}'/><path d='M60 90 L92 62 H118 L100 90Z' fill='${t.surface}'/></svg>`)};function VF(e){let t=e,n=e=>{t={...t,...e},i.update({...t,...r})},r={onPlay:()=>n({state:`playing`}),onPause:()=>n({state:`paused`}),onStop:()=>n({state:`idle`,position:null}),onNext:()=>n({position:0}),onPrevious:()=>n({position:0}),onSeek:e=>n({position:e}),onVolume:e=>n({volume:e,muted:!1}),onMute:e=>n({muted:e})},i=ai({...e,...r});return i.el}var HF={play:!0,pause:!0,stop:!0,next:!0,previous:!0,volume:!0,mute:!0,seek:!0},UF=[`Light rain showers`,`Mostly sunny`,`Thunderstorms`,`Overcast`,`Mist`,`Sleet showers`,`Gale-force winds`,`Clear night`],WF=[{id:`media-player`,render:e=>PF(IF(`Playing, with art, every control, a seekable position and volume (the buttons work here)`),LF(VF({title:`Lanterns Over the Quay`,subtitle:`Marlow and the Tidelines`,art:zF(e,0,3),state:`playing`,position:83,duration:227,volume:.45,muted:!1,can:HF})),IF(`Banner art: a square cover centred over a blurred copy of itself`),LF(VF({title:`Lanterns Over the Quay`,subtitle:`Marlow and the Tidelines`,art:zF(e,0,3),artLayout:`banner`,state:`playing`,position:83,duration:227,volume:.45,muted:!1,can:HF})),IF(`Banner art: a wide still filling the banner, paused`),LF(VF({title:`The Harbour Light, Part Two`,subtitle:`Season 1`,art:BF(e),artLayout:`banner`,artShape:`wide`,state:`paused`,position:1460,duration:3125,can:HF})),IF(`Paused, no art (the placeholder), a progress line it can’t seek, volume only`),LF(VF({title:`Episode 12: The Long Winter Garden`,subtitle:`Seed and Soil Hour`,art:null,state:`paused`,position:1460,duration:3125,volume:.3,can:{play:!0,pause:!0,volume:!0}})),IF(`Radio: buffering, no duration; play and stop, mute only, muted`),LF(VF({title:`Evening Jazz Hour`,subtitle:`Willowmere Radio`,art:zF(e,4,1),state:`buffering`,muted:!0,can:{play:!0,stop:!0,mute:!0}})),IF(`Off: nothing playing, only play allowed`),LF(VF({state:`off`,can:{play:!0}})))},{id:`camera-tile`,render:e=>FF(LF(ri({src:BF(e),name:`Front door`,status:`Motion · 2 min ago`,refreshEvery:10,action:U({icon:`refresh`,label:`Refresh Front door`,size:`small`}).el}).el),LF(ri({src:BF(e),name:`Garden`,status:`Square picture`,aspect:1}).el),LF(ri({src:null,name:`Garage`,status:`Offline`}).el),LF(ri({src:`data:image/png;base64,broken`,name:`Side gate`,status:`The picture failed to load`}).el))},{id:`weather-now`,render:()=>PF(FF(LF(si({condition:`partly-cloudy`,temperature:14.4,place:`Hillside`,detail:`Feels 12° · 10% rain`}).el),LF(si({condition:`rain`,temperature:9,text:`Light rain showers`,detail:`Feels 6° · 80% rain`,place:`Hillside`}).el),LF(si({condition:`clear-night`,temperature:3,unit:`°C`,detail:`Wind 12 km/h`}).el),LF(si({condition:`lightning-rain`,temperature:21,detail:`Gusts to 60 km/h`}).el),LF(si({condition:null,temperature:null,detail:`No reading yet`}).el)),IF(`weatherConditionFromText maps a source’s own words to the vocabulary`),FF(...UF.map(e=>{let t=Zr(e);return M(`div`,{class:`ex-row`},H(Qr(t),{class:ii(t)}),C(`${e} → ${t??`unknown`}`,{variant:`label`}))})))},{id:`agenda`,render:()=>{let e=[{label:`Today`,events:[{time:`08:30`,end:`09:00`,title:`School run`,color:2},{time:null,title:`Bin day`,color:4},{time:`12:15`,end:`13:00`,title:`Lunch with Robin`,location:`Bramblewick Café`,color:1},{time:`18:00`,title:`Piano lesson`,location:`Music room, 2 Elm Row`,color:3}]},{label:`Thu 17 Oct`,events:[{time:null,title:`Grandma’s birthday`,color:5},{time:null,title:`Half term`,color:6},{time:`10:00`,end:`11:30`,title:`Boiler service`,location:`Home`}]},{label:`Fri 18 Oct`,events:[{time:`19:30`,end:`22:00`,title:`Quiz night`,location:`Lantern Hall`,color:1}]}];return FF(LF(Xr({days:e}).el,`Family calendar`),LF(Xr({days:e,max:4}).el,`Cut to four events`),LF(Xr({days:[{label:`Today`,events:[]}]}).el,`Nothing planned`))}},...ZE,...wk,...gj,...XM,...pP,...NF],GF=[...md,...jd,...Mp,...Wm,...hg,...e_,...J_,...kv,...Sb,...rS,...TT,...RE,...WF],KF=new URLSearchParams(location.search),qF={theme:KF.get(`theme`)??`midnight`,device:KF.get(`device`)??`phone`,accent:KF.get(`accent`)??`default`,corners:KF.get(`corners`)??``,density:KF.get(`density`)??``,depth:KF.get(`depth`)??``},JF=M(`nav`,{class:`ex-nav`,"aria-label":`Components`}),YF=M(`main`,{class:`ex-stage`}),XF=M(`form`,{class:`ex-tune`,"aria-label":`Tune`});document.body.append(M(`div`,{class:`ex-app mh-canvas`},JF,M(`div`,{class:`ex-main`},XF,YF)));var ZF;function QF(e,t,n){let r=M(`select`,{name:e},...n.map(([t,n])=>M(`option`,{value:t,selected:qF[e]===t},n)));return r.addEventListener(`change`,()=>{qF[e]=r.value;let t=new URLSearchParams(Object.entries(qF).filter(([,e])=>e&&e!=="default"));history.replaceState(null,``,`?${t}${location.hash}`),$F()}),M(`label`,{class:`ex-tune__field`},M(`span`,{class:`mh-text--caption mh-text--muted`},t),r)}XF.append(QF(`theme`,`Theme`,Qn.map(e=>[e.id,e.name])),QF(`device`,`Device`,Be.map(e=>[e,e])),QF(`accent`,`Accent`,[[`default`,`theme`],...sr.map(e=>[e,e])]),QF(`corners`,`Corners`,[[``,`theme`],...bt.map(e=>[e,e])]),QF(`density`,`Density`,[[``,`theme`],...ht.map(e=>[e,e])]),QF(`depth`,`Depth`,[[``,`theme`],[`shadow`,`shadow`],[`glow`,`glow`],[`flat`,`flat`]]));function $F(){let e={};qF.corners&&(e.corners=qF.corners),qF.density&&(e.density=qF.density),qF.depth&&(e.depth=qF.depth),qF.depth===`glow`&&(e.glow=1),ZF=fr(qF.theme,{deviceClass:qF.device,character:e,accent:qF.accent}),eI(),dI()}function eI(){let e=location.hash.slice(1)||GF[0].id;JF.replaceChildren(M(`div`,{class:`ex-brand`},M(`a`,{href:`index.html${location.search}`,class:`ex-home`},C(`Mosaic Home`,{variant:`title`,as:`span`})),C(`${Ku.size} of ${Gu.length} components`,{variant:`caption`,tone:`muted`,as:`span`}),M(`a`,{href:`themes.html`,class:`ex-studio`},`Theme studio`)),...Wu.map(t=>M(`section`,{},C(t.name,{variant:`eyebrow`,tone:`faint`,as:`h2`}),M(`ul`,{},...Gu.filter(e=>e.group===t.id).map(t=>M(`li`,{},Ku.has(t.id)?M(`a`,{href:`#${t.id}`,"aria-current":t.id===e?`page`:null},t.name):M(`span`,{class:`ex-planned`,title:`Planned`},t.name)))))))}var tI=e=>new Map(Object.entries(e).map(([e,t])=>[e.replace(/^.*\/|\.tsx?$/g,``),t])),nI=tI(Object.assign({"../examples/web/accent-headline.ts":vi,"../examples/web/accordion.ts":yi,"../examples/web/activity-feed.ts":bi,"../examples/web/agenda.ts":xi,"../examples/web/air-quality.ts":Si,"../examples/web/alarm-panel.ts":Ci,"../examples/web/alert.ts":wi,"../examples/web/ambient-clock.ts":Ti,"../examples/web/app-shell.ts":Ei,"../examples/web/appliance-cycle.ts":Di,"../examples/web/assist-reply.ts":Oi,"../examples/web/avatar.ts":ki,"../examples/web/backdrop.ts":Ai,"../examples/web/badge.ts":ji,"../examples/web/bar-chart.ts":Mi,"../examples/web/boot-splash.ts":Ni,"../examples/web/bottom-sheet.ts":Pi,"../examples/web/breadcrumbs.ts":Fi,"../examples/web/button-group.ts":Ii,"../examples/web/button.ts":Li,"../examples/web/camera-tile.ts":Ri,"../examples/web/card.ts":zi,"../examples/web/carousel.ts":Bi,"../examples/web/charge-card.ts":Vi,"../examples/web/checkbox.ts":Hi,"../examples/web/chip.ts":Ui,"../examples/web/click-wheel.ts":Wi,"../examples/web/color-picker.ts":Gi,"../examples/web/command-bar.ts":Ki,"../examples/web/command-palette.ts":qi,"../examples/web/compare-slider.ts":Ji,"../examples/web/composer.ts":Yi,"../examples/web/confirm.ts":Xi,"../examples/web/connection-status.ts":Zi,"../examples/web/control-card.ts":Qi,"../examples/web/curves-editor.ts":$i,"../examples/web/data-table.ts":ea,"../examples/web/date-picker.ts":ta,"../examples/web/date-range-picker.ts":na,"../examples/web/date-time-field.ts":ra,"../examples/web/departures-board.ts":ia,"../examples/web/device-setup.ts":aa,"../examples/web/dialog.ts":oa,"../examples/web/divider.ts":sa,"../examples/web/document-tabs.ts":ca,"../examples/web/doorbell.ts":la,"../examples/web/drawer.ts":ua,"../examples/web/duration-field.ts":da,"../examples/web/elevation.ts":fa,"../examples/web/empty-state.ts":pa,"../examples/web/energy-flow.ts":ma,"../examples/web/fan-control.ts":ha,"../examples/web/favourite-toggle.ts":ga,"../examples/web/field.ts":_a,"../examples/web/file-drop-zone.ts":va,"../examples/web/floor-plan.ts":ya,"../examples/web/forecast-strip.ts":ba,"../examples/web/geo-map.ts":xa,"../examples/web/gradient-editor.ts":Sa,"../examples/web/hazard-banner.ts":Ca,"../examples/web/histogram.ts":wa,"../examples/web/hotkey-field.ts":Ta,"../examples/web/humidity-control.ts":Ea,"../examples/web/icon-button.ts":Da,"../examples/web/icon-picker.ts":Oa,"../examples/web/icon.ts":ka,"../examples/web/inspector.ts":Aa,"../examples/web/irrigation-zones.ts":ja,"../examples/web/kbd.ts":Ma,"../examples/web/layers-panel.ts":Na,"../examples/web/level-meter.ts":Pa,"../examples/web/light-control.ts":Fa,"../examples/web/light-group.ts":Ia,"../examples/web/link.ts":La,"../examples/web/list.ts":Ra,"../examples/web/lock-control.ts":za,"../examples/web/map.ts":Ba,"../examples/web/media-list.ts":Va,"../examples/web/media-player.ts":Ha,"../examples/web/media-timeline.ts":Ua,"../examples/web/menu-bar.ts":Wa,"../examples/web/menu.ts":Ga,"../examples/web/meter.ts":Ka,"../examples/web/month-grid.ts":qa,"../examples/web/multi-select.ts":Ja,"../examples/web/nav-rail.ts":Ya,"../examples/web/notices.ts":Xa,"../examples/web/notification-centre.ts":Za,"../examples/web/number-input.ts":Qa,"../examples/web/onboarding.ts":$a,"../examples/web/openings-summary.ts":eo,"../examples/web/page-header.ts":to,"../examples/web/pagination.ts":no,"../examples/web/palette.ts":ro,"../examples/web/panel-group.ts":io,"../examples/web/panel.ts":ao,"../examples/web/people-strip.ts":oo,"../examples/web/popover.ts":so,"../examples/web/position-control.ts":co,"../examples/web/price-strip.ts":lo,"../examples/web/progress-bar.ts":uo,"../examples/web/progress-list.ts":fo,"../examples/web/progress-ring.ts":po,"../examples/web/property-list.ts":mo,"../examples/web/qr-code.ts":ho,"../examples/web/radial-dial.ts":go,"../examples/web/radio-group.ts":_o,"../examples/web/range-slider.ts":vo,"../examples/web/rating.ts":yo,"../examples/web/recording-pill.ts":bo,"../examples/web/reorderable-list.ts":xo,"../examples/web/room-card.ts":So,"../examples/web/scene-grid.ts":Co,"../examples/web/schedule-editor.ts":wo,"../examples/web/screen.ts":To,"../examples/web/scroll-panel.ts":Eo,"../examples/web/search-field.ts":Do,"../examples/web/secret-field.ts":Oo,"../examples/web/segmented-control.ts":ko,"../examples/web/select.ts":Ao,"../examples/web/shape-space.ts":jo,"../examples/web/skeleton.ts":Mo,"../examples/web/slider.ts":No,"../examples/web/sparkline.ts":Po,"../examples/web/speaker-selector.ts":Fo,"../examples/web/spinner.ts":Io,"../examples/web/split-button.ts":Lo,"../examples/web/split-pane.ts":Ro,"../examples/web/stack.ts":zo,"../examples/web/state-timeline.ts":Bo,"../examples/web/status-bar.ts":Vo,"../examples/web/status.ts":Ho,"../examples/web/stepper.ts":Uo,"../examples/web/steps.ts":Wo,"../examples/web/swipe-row.ts":Go,"../examples/web/switch.ts":Ko,"../examples/web/tabs.ts":qo,"../examples/web/text-area.ts":Jo,"../examples/web/text-field.ts":Yo,"../examples/web/text.ts":Xo,"../examples/web/thermostat.ts":Zo,"../examples/web/tiles.ts":Qo,"../examples/web/timeline.ts":$o,"../examples/web/timer.ts":es,"../examples/web/toast.ts":ts,"../examples/web/todo-list.ts":ns,"../examples/web/toggle-group.ts":rs,"../examples/web/toolbar.ts":is,"../examples/web/tooltip.ts":as,"../examples/web/transfer-list.ts":os,"../examples/web/transform-fields.ts":ss,"../examples/web/transport.ts":cs,"../examples/web/tree.ts":ls,"../examples/web/trend.ts":us,"../examples/web/tv-remote.ts":ds,"../examples/web/type-scale.ts":fs,"../examples/web/up-next.ts":ps,"../examples/web/usage-comparison.ts":ms,"../examples/web/vacuum-control.ts":hs,"../examples/web/voice-bar.ts":gs,"../examples/web/voice-ring.ts":_s,"../examples/web/waveform.ts":vs,"../examples/web/weather-now.ts":ys,"../examples/web/zoom-control.ts":bs,"../examples/web/zoomable-image.ts":xs})),rI=tI(Object.assign({"../examples/react/accent-headline.tsx":Ss,"../examples/react/accordion.tsx":Cs,"../examples/react/activity-feed.tsx":ws,"../examples/react/agenda.tsx":Ts,"../examples/react/air-quality.tsx":Es,"../examples/react/alarm-panel.tsx":Ds,"../examples/react/alert.tsx":Os,"../examples/react/ambient-clock.tsx":ks,"../examples/react/app-shell.tsx":As,"../examples/react/appliance-cycle.tsx":js,"../examples/react/assist-reply.tsx":Ms,"../examples/react/avatar.tsx":Ns,"../examples/react/backdrop.tsx":Ps,"../examples/react/badge.tsx":Fs,"../examples/react/bar-chart.tsx":Is,"../examples/react/boot-splash.tsx":Ls,"../examples/react/bottom-sheet.tsx":Rs,"../examples/react/breadcrumbs.tsx":zs,"../examples/react/button-group.tsx":Bs,"../examples/react/button.tsx":Vs,"../examples/react/camera-tile.tsx":Hs,"../examples/react/card.tsx":Us,"../examples/react/carousel.tsx":Ws,"../examples/react/charge-card.tsx":Gs,"../examples/react/checkbox.tsx":Ks,"../examples/react/chip.tsx":qs,"../examples/react/click-wheel.tsx":Js,"../examples/react/color-picker.tsx":Ys,"../examples/react/command-bar.tsx":Xs,"../examples/react/command-palette.tsx":Zs,"../examples/react/compare-slider.tsx":Qs,"../examples/react/composer.tsx":$s,"../examples/react/confirm.tsx":ec,"../examples/react/connection-status.tsx":tc,"../examples/react/control-card.tsx":nc,"../examples/react/curves-editor.tsx":rc,"../examples/react/data-table.tsx":ic,"../examples/react/date-picker.tsx":ac,"../examples/react/date-range-picker.tsx":oc,"../examples/react/date-time-field.tsx":sc,"../examples/react/departures-board.tsx":cc,"../examples/react/device-setup.tsx":lc,"../examples/react/dialog.tsx":uc,"../examples/react/divider.tsx":dc,"../examples/react/document-tabs.tsx":fc,"../examples/react/doorbell.tsx":pc,"../examples/react/drawer.tsx":mc,"../examples/react/duration-field.tsx":hc,"../examples/react/elevation.tsx":gc,"../examples/react/empty-state.tsx":_c,"../examples/react/energy-flow.tsx":vc,"../examples/react/fan-control.tsx":yc,"../examples/react/favourite-toggle.tsx":bc,"../examples/react/field.tsx":xc,"../examples/react/file-drop-zone.tsx":Sc,"../examples/react/floor-plan.tsx":Cc,"../examples/react/forecast-strip.tsx":wc,"../examples/react/geo-map.tsx":Tc,"../examples/react/gradient-editor.tsx":Ec,"../examples/react/hazard-banner.tsx":Dc,"../examples/react/histogram.tsx":Oc,"../examples/react/hotkey-field.tsx":kc,"../examples/react/humidity-control.tsx":Ac,"../examples/react/icon-button.tsx":jc,"../examples/react/icon-picker.tsx":Mc,"../examples/react/icon.tsx":Nc,"../examples/react/inspector.tsx":Pc,"../examples/react/irrigation-zones.tsx":Fc,"../examples/react/kbd.tsx":Ic,"../examples/react/layers-panel.tsx":Lc,"../examples/react/level-meter.tsx":Rc,"../examples/react/light-control.tsx":zc,"../examples/react/light-group.tsx":Bc,"../examples/react/link.tsx":Vc,"../examples/react/list.tsx":Hc,"../examples/react/lock-control.tsx":Uc,"../examples/react/map.tsx":Wc,"../examples/react/media-list.tsx":Gc,"../examples/react/media-player.tsx":Kc,"../examples/react/media-timeline.tsx":qc,"../examples/react/menu-bar.tsx":Jc,"../examples/react/menu.tsx":Yc,"../examples/react/meter.tsx":Xc,"../examples/react/month-grid.tsx":Zc,"../examples/react/multi-select.tsx":Qc,"../examples/react/nav-rail.tsx":$c,"../examples/react/notices.tsx":el,"../examples/react/notification-centre.tsx":tl,"../examples/react/number-input.tsx":nl,"../examples/react/onboarding.tsx":rl,"../examples/react/openings-summary.tsx":il,"../examples/react/page-header.tsx":al,"../examples/react/pagination.tsx":ol,"../examples/react/palette.tsx":sl,"../examples/react/panel-group.tsx":cl,"../examples/react/panel.tsx":ll,"../examples/react/people-strip.tsx":ul,"../examples/react/popover.tsx":dl,"../examples/react/position-control.tsx":fl,"../examples/react/price-strip.tsx":pl,"../examples/react/progress-bar.tsx":ml,"../examples/react/progress-list.tsx":hl,"../examples/react/progress-ring.tsx":gl,"../examples/react/property-list.tsx":_l,"../examples/react/qr-code.tsx":vl,"../examples/react/radial-dial.tsx":yl,"../examples/react/radio-group.tsx":bl,"../examples/react/range-slider.tsx":xl,"../examples/react/rating.tsx":Sl,"../examples/react/recording-pill.tsx":Cl,"../examples/react/reorderable-list.tsx":wl,"../examples/react/room-card.tsx":Tl,"../examples/react/scene-grid.tsx":El,"../examples/react/schedule-editor.tsx":Dl,"../examples/react/screen.tsx":Ol,"../examples/react/scroll-panel.tsx":kl,"../examples/react/search-field.tsx":Al,"../examples/react/secret-field.tsx":jl,"../examples/react/segmented-control.tsx":Ml,"../examples/react/select.tsx":Nl,"../examples/react/shape-space.tsx":Pl,"../examples/react/skeleton.tsx":Fl,"../examples/react/slider.tsx":Il,"../examples/react/sparkline.tsx":Ll,"../examples/react/speaker-selector.tsx":Rl,"../examples/react/spinner.tsx":zl,"../examples/react/split-button.tsx":Bl,"../examples/react/split-pane.tsx":Vl,"../examples/react/stack.tsx":Hl,"../examples/react/state-timeline.tsx":Ul,"../examples/react/status-bar.tsx":Wl,"../examples/react/status.tsx":Gl,"../examples/react/stepper.tsx":Kl,"../examples/react/steps.tsx":ql,"../examples/react/swipe-row.tsx":Jl,"../examples/react/switch.tsx":Yl,"../examples/react/tabs.tsx":Xl,"../examples/react/text-area.tsx":Zl,"../examples/react/text-field.tsx":Ql,"../examples/react/text.tsx":$l,"../examples/react/thermostat.tsx":eu,"../examples/react/tiles.tsx":tu,"../examples/react/timeline.tsx":nu,"../examples/react/timer.tsx":ru,"../examples/react/toast.tsx":iu,"../examples/react/todo-list.tsx":au,"../examples/react/toggle-group.tsx":ou,"../examples/react/toolbar.tsx":su,"../examples/react/tooltip.tsx":cu,"../examples/react/transfer-list.tsx":lu,"../examples/react/transform-fields.tsx":uu,"../examples/react/transport.tsx":du,"../examples/react/tree.tsx":fu,"../examples/react/trend.tsx":pu,"../examples/react/tv-remote.tsx":mu,"../examples/react/type-scale.tsx":hu,"../examples/react/up-next.tsx":gu,"../examples/react/usage-comparison.tsx":_u,"../examples/react/vacuum-control.tsx":vu,"../examples/react/voice-bar.tsx":yu,"../examples/react/voice-ring.tsx":bu,"../examples/react/waveform.tsx":xu,"../examples/react/weather-now.tsx":Su,"../examples/react/zoom-control.tsx":Cu,"../examples/react/zoomable-image.tsx":wu})),iI=`mh-explorer-code`,aI=`web`;try{localStorage.getItem(iI)===`react`&&(aI=`react`)}catch{}var oI=/(\b\w*[iI]con\w*\s*[:=]\s*\{?\s*|createIcon\(\s*)['"][a-z][a-z-]*['"]/;function sI(e,t,n){let r=(n===`web`?nI:rI).get(e);if(r)return/from '@mosaic-home\/design-system\/(web|react)'/.test(r)?`import '@mosaic-home/design-system/css/${t}';\n${oI.test(r)?`import '@mosaic-home/design-system/icons';
`:``}${r}`:r}var cI=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|function|return|const|let|new|type|interface|if|else|true|false|null|undefined|await|async)\b|\b(\d+(?:\.\d+)?)\b/g;function lI(e){let t=[],n=0;for(let r of e.matchAll(cI)){r.index>n&&t.push(document.createTextNode(e.slice(n,r.index)));let i=r[1]?`comment`:r[2]?`string`:r[3]?`keyword`:`number`;t.push(M(`span`,{class:`ex-code__${i}`},r[0])),n=r.index+r[0].length}return t.push(document.createTextNode(e.slice(n))),t}function uI(e,t){let n=sI(e,t,`web`),r=sI(e,t,`react`);if(!n&&!r)return null;let i=M(`code`,{}),a=M(`span`,{class:`ex-code__note`,"aria-live":`polite`}),o=()=>(aI===`react`?r:n)??n??r??``,s=()=>{i.replaceChildren(...lI(o())),a.textContent=``},c=D({label:`Example code`,size:`small`,value:aI,options:[{value:`web`,label:`TypeScript`,disabled:!n},{value:`react`,label:`React`,disabled:!r}],onChange:e=>{aI=e;try{localStorage.setItem(iI,aI)}catch{}s()}}),l=U({icon:`copy`,label:`Copy the example`,size:`small`,onClick:()=>{navigator.clipboard?.writeText(o()).then(()=>{a.textContent=`Copied`,setTimeout(()=>a.textContent=``,1500)})}});return s(),M(`section`,{class:`ex-code`,"aria-label":`Example code`},M(`div`,{class:`ex-code__bar`},C(`Code`,{variant:`title`,as:`h3`}),c.el,M(`span`,{class:`ex-code__end`},a,l.el)),M(`pre`,{class:`ex-code__pre`,tabindex:`0`},i))}function dI(){let e=location.hash.slice(1)||GF[0].id,t=GF.find(t=>t.id===e)??GF[0],n=Gu.find(e=>e.id===t.id);YF.replaceChildren(M(`header`,{class:`ex-head`},C(n.name,{variant:`headline`}),C(n.summary,{tone:`muted`})),M(`section`,{class:`ex-demo`},t.render(ZF)),...[uI(t.id,n.group)].filter(e=>e!==null)),JF.querySelectorAll(`a`).forEach(e=>e.toggleAttribute(`aria-current`,e.getAttribute(`href`)===`#${t.id}`))}window.addEventListener(`hashchange`,dI),$F();