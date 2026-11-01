import { h } from '../../../src/web/dom.ts';
import { createButton } from '../../../src/web/actions/button.ts';
import { createIconButton } from '../../../src/web/actions/iconButton.ts';
import { createAlert } from '../../../src/web/feedback/alert.ts';
import { createBadge } from '../../../src/web/feedback/badge.ts';
import { createEmptyState } from '../../../src/web/feedback/emptyState.ts';
import { createProgressBar, createProgressRing } from '../../../src/web/feedback/progress.ts';
import { createProgressList, type ProgressListItem } from '../../../src/web/feedback/progressList.ts';
import { createCard } from '../../../src/web/data-display/card.ts';
import { createSkeleton } from '../../../src/web/feedback/skeleton.ts';
import { createSpinner } from '../../../src/web/feedback/spinner.ts';
import { createStatus, type StatusState } from '../../../src/web/feedback/status.ts';
import { createText } from '../../../src/web/foundations/text.ts';
import { createVoiceBar, type VoicePhase } from '../../../src/web/feedback/voiceBar.ts';
import { createNotice } from '../../../src/web/feedback/notice.ts';
import { createRecordingPill, type RecordingPillHandle } from '../../../src/web/feedback/recordingPill.ts';
import type { Story } from './types.ts';

const row = (...children: Node[]): HTMLElement => h('div', { class: 'ex-row' }, ...children);
const stack = (...children: Node[]): HTMLElement => h('div', { class: 'ex-stack' }, ...children);
const caption = (text: string): HTMLElement => createText(text, { variant: 'label', tone: 'muted' });

export const feedbackStories: Story[] = [
  {
    id: 'alert',
    render: () =>
      stack(
        createAlert({ tone: 'info', message: 'The kitchen light schedule starts at sunset.' }).el,
        createAlert({ tone: 'success', title: 'Saved', message: 'Living room scene updated.', dismissible: true }).el,
        createAlert({ tone: 'warning', title: 'Battery low', message: 'Front door sensor is at 12%.', action: createButton({ label: 'Details', variant: 'text', size: 'small' }).el }).el,
        createAlert({ tone: 'danger', title: 'Hallway sensor offline', message: 'No reading for 2 hours.', action: createButton({ label: 'Retry', variant: 'secondary', size: 'small' }).el, dismissible: true }).el,
      ),
  },
  {
    id: 'progress-bar',
    render: () => {
      const live = createProgressBar({ label: 'Firmware update', showLabel: true, showValue: true, value: 0 });
      let v = 0;
      const timer = window.setInterval(() => {
        if (!live.el.isConnected && v > 0) return window.clearInterval(timer);
        v = (v + 7) % 107;
        live.setValue(Math.min(v, 100));
      }, 600);
      return stack(
        createProgressBar({ label: 'Battery', showLabel: true, showValue: true, value: 82, valueText: '82%', tone: 'success' }).el,
        live.el,
        createProgressBar({ label: 'Rooms synced', showLabel: true, showValue: true, value: 3, max: 8, valueText: '3 of 8 rooms' }).el,
        createProgressBar({ label: 'Searching for devices', showLabel: true }).el,
        caption('Sizes and tones'),
        createProgressBar({ label: 'Small', value: 30, size: 'small' }).el,
        createProgressBar({ label: 'Warning', value: 64, tone: 'warning' }).el,
        createProgressBar({ label: 'Danger', value: 92, tone: 'danger', size: 'large' }).el,
      );
    },
  },
  {
    id: 'progress-ring',
    render: () =>
      stack(
        row(
          createProgressRing({ label: 'Battery', value: 82, tone: 'success', size: 'large' }).el,
          createProgressRing({ label: 'Humidity', value: 46 }).el,
          createProgressRing({ label: 'Filter life', value: 18, tone: 'warning' }).el,
          createProgressRing({ label: 'Disk', value: 95, tone: 'danger', size: 'small' }).el,
        ),
        row(createProgressRing({ label: 'Connecting' }).el, createProgressRing({ label: 'Rooms', value: 5, max: 8, valueText: '5/8', size: 'large' }).el),
      ),
  },
  {
    id: 'spinner',
    render: () =>
      stack(
        row(createSpinner({ size: 'small' }).el, createSpinner().el, createSpinner({ size: 'large', label: 'Loading rooms' }).el),
        row(h('span', { class: 'mh-text--label ex-row', style: 'color: var(--mh-text-muted)' }, createSpinner({ size: 'small', inherit: true }).el, 'Refreshing kitchen light')),
      ),
  },
  {
    id: 'skeleton',
    render: () =>
      stack(
        row(createSkeleton({ shape: 'circle' }).el, h('div', { style: 'flex: 1' }, createSkeleton({ lines: 2 }).el)),
        createSkeleton({ shape: 'block' }).el,
        createSkeleton({ lines: 4 }).el,
      ),
  },
  {
    id: 'badge',
    render: () =>
      stack(
        row(
          createBadge({ label: 'Default' }).el,
          createBadge({ label: 'Beta', tone: 'accent' }).el,
          createBadge({ label: 'Info', tone: 'info' }).el,
          createBadge({ label: 'Online', tone: 'success' }).el,
          createBadge({ label: 'Low', tone: 'warning' }).el,
          createBadge({ label: 'Error', tone: 'danger' }).el,
        ),
        row(createBadge({ count: 3 }).el, createBadge({ count: 42, tone: 'accent' }).el, createBadge({ count: 120 }).el, createBadge({ dot: true, label: 'Update available' }).el),
        caption('Attached to an icon button'),
        row(
          h('span', { class: 'mh-badge-host' }, createIconButton({ icon: 'bell', label: 'Notifications, 4 unread', filled: true }).el, createBadge({ count: 4, attached: true }).el),
          h('span', { class: 'mh-badge-host' }, createIconButton({ icon: 'settings', label: 'Settings, update available', filled: true }).el, createBadge({ dot: true, attached: true, label: 'Update available' }).el),
        ),
      ),
  },
  {
    id: 'status',
    render: () => {
      const states: StatusState[] = ['online', 'offline', 'busy', 'away', 'error', 'unknown'];
      return stack(row(...states.map((state) => createStatus({ state }).el)), row(createStatus({ state: 'live' }).el, createStatus({ state: 'online', label: 'Connected' }).el, createStatus({ state: 'unknown', label: 'Untested' }).el));
    },
  },
  {
    id: 'empty-state',
    render: () =>
      stack(
        createEmptyState({ icon: 'lightbulb', title: 'No lights yet', text: 'Add a light to control it from here.', action: createButton({ label: 'Add light', icon: 'add' }).el }).el,
        h('div', { class: 'mh-card mh-card--flat' }, createEmptyState({ icon: 'search', title: 'Nothing found', text: 'Try another room or device name.', compact: true }).el),
      ),
  },
  {
    id: 'progress-list',
    render: () => {
      const items = (step: number): ProgressListItem[] => [
        { name: 'Hallway sensor firmware', value: Math.min(100, 20 + step * 6), status: step * 6 >= 80 ? 'Installed' : 'Updating', detail: 'Version 2.3.1', tone: step * 6 >= 80 ? 'success' : 'accent' },
        { name: 'Weekly backup', value: Math.min(100, 55 + step * 3), status: 'Uploading', detail: `${(1.2 + step * 0.07).toFixed(1)} of 3.4 GB` },
        { name: 'Map of the garden', value: null, status: 'Preparing' },
        { name: 'Voice model for the kitchen display, a long name that is cut short', value: 64, status: 'Paused', detail: 'Low battery', tone: 'warning' },
        { name: 'Camera clip export', value: 12, status: 'Failed', detail: 'Not enough space', tone: 'danger' },
      ];
      const list = createProgressList({ label: 'Jobs', items: items(0) });
      let step = 0;
      const timer = window.setInterval(() => {
        if (!list.el.isConnected && step > 0) return window.clearInterval(timer);
        step = (step + 1) % 16;
        list.setItems(items(step));
      }, 900);
      return h('div', { class: 'mh-grid' }, createCard({ title: 'Updates and backups', body: list.el }).el);
    },
  },
  {
    id: 'voice-bar',
    render: () => {
      // A made-up input level, only while the story is on screen.
      const simulate = (target: HTMLElement, onLevel: (level: number) => void): void => {
        let t = 0;
        const timer = setInterval(() => {
          if (!target.isConnected && t > 0) return clearInterval(timer);
          t += 1;
          onLevel(Math.max(0, Math.min(1, 0.45 + 0.35 * Math.sin(t / 2.3) + (Math.random() - 0.5) * 0.4)));
        }, 90);
      };
      const phases: VoicePhase[] = ['listening', 'transcribing', 'thinking', 'speaking', 'idle'];
      let current = 0;
      const talk = createVoiceBar({
        leading: createIconButton({ icon: 'keyboard', label: 'Type instead' }).el,
        onTap: () => {
          current = (current + 1) % phases.length;
          talk.setPhase(phases[current]!);
        },
        onEnd: () => talk.setPhase('idle'),
      });
      simulate(talk.el, (level) => talk.setLevel(level));
      const dictation = createVoiceBar({
        variant: 'dictation',
        onCancel: () => dictation.setPhase('idle'),
        onDone: () => {
          dictation.setPhase('transcribing');
          dictation.setBusy(true);
          setTimeout(() => {
            dictation.setBusy(false);
            dictation.setPhase('listening');
          }, 1500);
        },
      });
      simulate(dictation.el, (level) => dictation.setLevel(level));
      return stack(
        caption('Conversation: press the mosaic to step through the phases'),
        talk.el,
        ...(['thinking', 'speaking', 'idle'] as const).map((phase) => createVoiceBar({ phase, onEnd: () => {} }).el),
        caption('Dictation: Done transcribes for a moment'),
        dictation.el,
        createVoiceBar({ variant: 'dictation', phase: 'transcribing', busy: true }).el,
      );
    },
  },
  {
    id: 'notices',
    render: () => {
      const tipSlot = h('div');
      const tip = (): void => {
        tipSlot.replaceChildren(
          createNotice({
            kind: 'tip',
            title: 'Tip',
            message: 'Long-press a tile to change its size or move it to another room.',
            actions: [{ label: 'Got it', primary: true, dismisses: true }],
            onDismiss: () => setTimeout(() => tipSlot.replaceChildren(createButton({ label: 'Show the tip again', variant: 'text', size: 'small', onClick: tip }).el)),
          }).el,
        );
      };
      tip();
      const answer = caption('');
      return stack(
        caption('Permission explainer, before the system asks'),
        h(
          'div',
          { style: 'max-width: 420px' },
          createNotice({
            kind: 'permission',
            icon: 'microphone',
            title: 'Talk to your home',
            message: 'Allow microphone access to control lights and climate by voice.',
            points: ['Listens only while you hold the button', 'Audio goes to your own Home Assistant', 'Turn it off any time in Settings'],
            actions: [
              { label: 'Allow microphone', primary: true, onClick: () => (answer.textContent = 'Allowed') },
              { label: 'Not now', onClick: () => (answer.textContent = 'Asked again later') },
            ],
          }).el,
        ),
        answer,
        caption('Capability notices'),
        createNotice({ kind: 'capability', message: 'Voice control needs a microphone, and this display has none.', actions: [{ label: 'Learn more' }] }).el,
        createNotice({ kind: 'capability', icon: 'wifi', title: 'Works offline', message: 'Cameras need a connection; lights and climate keep working without one.' }).el,
        caption('Dismissible tip'),
        tipSlot,
        createNotice({ kind: 'tip', icon: 'keyboard', message: 'Press / anywhere to search for a device.' }).el,
      );
    },
  },
  {
    id: 'recording-pill',
    render: () => {
      // A made-up input level, only while the story is on screen.
      const simulate = (pill: RecordingPillHandle): void => {
        let t = 0;
        const timer = setInterval(() => {
          if (!pill.el.isConnected && t > 0) {
            pill.destroy();
            return clearInterval(timer);
          }
          t += 1;
          pill.setLevel(Math.max(0, Math.min(1, 0.4 + 0.35 * Math.sin(t / 1.7) + (Math.random() - 0.5) * 0.5)));
        }, 120);
      };
      const state = caption('Recording');
      const live: RecordingPillHandle = createRecordingPill({
        elapsed: 42,
        onPauseToggle: (paused) => (state.textContent = paused ? 'Paused' : 'Recording'),
        onStop: () => {
          live.setPaused(true);
          live.setElapsed(0);
          state.textContent = 'Stopped and saved';
        },
      });
      simulate(live);
      const paused = createRecordingPill({ elapsed: 3725, paused: true, onPauseToggle: () => {}, onStop: () => {} });
      const plain = createRecordingPill({ elapsed: 8, label: 'Dictating' });
      simulate(plain);

      let floating: RecordingPillHandle | null = null;
      const toggle = createButton({
        label: 'Show floating pill',
        variant: 'secondary',
        onClick: () => {
          if (floating) {
            floating.destroy();
            floating.el.remove();
            floating = null;
            toggle.setLabel('Show floating pill');
            return;
          }
          floating = createRecordingPill({ floating: 'bottom', onStop: () => toggle.el.click() });
          (toggle.el.closest('[data-mh-theme]') ?? document.body).append(floating.el);
          simulate(floating);
          toggle.setLabel('Hide floating pill');
        },
      });
      return stack(caption('Pause, resume and stop'), row(live.el), state, row(paused.el), caption('No buttons'), row(plain.el), caption('Floating at the bottom of the screen'), row(toggle.el));
    },
  },
];
