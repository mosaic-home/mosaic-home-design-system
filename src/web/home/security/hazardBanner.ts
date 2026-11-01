import { mdiAlert, mdiCheckCircle, mdiFire, mdiMoleculeCo, mdiSmokeDetectorVariantAlert, mdiSnowflakeAlert, mdiThermometerAlert, mdiVolumeOff, mdiWaterAlert } from '@mdi/js';
import { buttonClass, type ButtonVariant } from '../../actions/button.ts';
import { cx, h, uid } from '../../dom.ts';
import { createIcon } from '../../icons.ts';

export type HazardKind = 'smoke' | 'co' | 'gas' | 'leak' | 'heat' | 'freeze' | 'other';

/** `alarm`: danger now. `warning`: needs attention soon. `cleared`: it is over (kept on screen until dismissed). */
export type HazardSeverity = 'alarm' | 'warning' | 'cleared';

export interface HazardAction {
  id: string;
  label: string;
  /** The main thing to do (filled button). */
  primary?: boolean;
}

export interface HazardBannerLabels {
  /** The heading, by kind, when no title is given. */
  titles: Record<HazardKind, string>;
  /** The heading once cleared: `{title}` is the kind's title. */
  cleared: string;
  /** "since {time}". */
  since: string;
  silence: string;
  dismiss: string;
  /** The steps list. */
  advice: string;
}

export const HAZARD_BANNER_LABELS: HazardBannerLabels = {
  titles: { smoke: 'Smoke detected', co: 'Carbon monoxide detected', gas: 'Gas detected', leak: 'Water leak', heat: 'Too hot', freeze: 'Freezing', other: 'Hazard' },
  cleared: 'Cleared: {title}',
  since: 'since {time}',
  silence: 'Silence',
  dismiss: 'Dismiss',
  advice: 'What to do',
};

export type HazardBannerLabelsInput = Partial<Omit<HazardBannerLabels, 'titles'>> & { titles?: Partial<HazardBannerLabels['titles']> };

export interface HazardBannerOptions {
  kind: HazardKind;
  severity?: HazardSeverity;
  /** The heading (default by kind). */
  title?: string;
  /** Where ("Kitchen", "Utility room, under the sink"). */
  where?: string;
  /** When it started, as the app words it ("10:42", "3 min ago"). */
  since?: string;
  /** What to do: one sentence, or steps. */
  advice?: string | readonly string[];
  /** Extra buttons (Call for help, Shut off water); the app runs them. */
  actions?: readonly HazardAction[];
  /** Offers Silence (the siren is sounding). */
  onSilence?: () => void;
  /** Offers Dismiss (usually once cleared). */
  onDismiss?: () => void;
  onAction?: (id: string) => void;
  /** Level of the heading (default 2). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  labels?: HazardBannerLabelsInput;
}

export interface HazardBannerHandle {
  el: HTMLElement;
  update(changes: Partial<HazardBannerOptions>): void;
}

export function hazardBannerLabels(labels: HazardBannerLabelsInput | undefined): HazardBannerLabels {
  return { ...HAZARD_BANNER_LABELS, ...labels, titles: { ...HAZARD_BANNER_LABELS.titles, ...labels?.titles } };
}

const KIND_ICON: Record<HazardKind, string> = {
  smoke: mdiSmokeDetectorVariantAlert,
  co: mdiMoleculeCo,
  gas: mdiFire,
  leak: mdiWaterAlert,
  heat: mdiThermometerAlert,
  freeze: mdiSnowflakeAlert,
  other: mdiAlert,
};

export const hazardIcon = (kind: HazardKind, severity: HazardSeverity = 'alarm'): string => (severity === 'cleared' ? mdiCheckCircle : KIND_ICON[kind]);

export function hazardBannerClass(o: Pick<HazardBannerOptions, 'kind' | 'severity'>): string {
  return cx('mh-hazard-banner', `mh-hazard-banner--${o.kind}`, `mh-hazard-banner--${o.severity ?? 'alarm'}`);
}

/** The heading, and the where-and-when line. */
export function hazardBannerText(o: HazardBannerOptions): { title: string; where: string } {
  const l = hazardBannerLabels(o.labels);
  const base = o.title?.trim() || l.titles[o.kind];
  const title = (o.severity ?? 'alarm') === 'cleared' && !o.title?.trim() ? l.cleared.replace('{title}', base) : base;
  const since = o.since?.trim() ? l.since.replace('{time}', o.since.trim()) : '';
  return { title, where: [o.where?.trim(), since].filter(Boolean).join(' · ') };
}

/** The steps, as a list (one sentence is one item). */
export const hazardAdvice = (advice: HazardBannerOptions['advice']): string[] => (typeof advice === 'string' ? [advice] : [...(advice ?? [])]).map((s) => s.trim()).filter(Boolean);

export interface HazardButton {
  id: string;
  label: string;
  variant: ButtonVariant;
  icon?: string;
  kind: 'action' | 'silence' | 'dismiss';
}

/** The buttons, in order: the app's actions, Silence, Dismiss. */
export function hazardButtons(o: HazardBannerOptions): HazardButton[] {
  const l = hazardBannerLabels(o.labels);
  const out: HazardButton[] = (o.actions ?? []).map((a) => ({ id: a.id, label: a.label, variant: a.primary ? 'primary' : 'secondary', kind: 'action' }));
  if (o.onSilence) out.push({ id: 'silence', label: l.silence, variant: 'secondary', icon: mdiVolumeOff, kind: 'silence' });
  if (o.onDismiss) out.push({ id: 'dismiss', label: l.dismiss, variant: 'text', kind: 'dismiss' });
  return out;
}

export function hazardButtonClass(b: HazardButton): string {
  return cx(buttonClass(b.variant, 'large'), 'mh-hazard-banner__action', `mh-hazard-banner__action--${b.kind}`);
}

/** `alert` while there is danger (announced at once), `status` once cleared. */
export const hazardRole = (severity: HazardSeverity | undefined): 'alert' | 'status' => ((severity ?? 'alarm') === 'cleared' ? 'status' : 'alert');

/**
 * `.mh-hazard-banner` (`--<kind>`, `--alarm | --warning | --cleared`): an unmissable alert, `role="alert"` until
 * cleared. A large `__icon`, then `__body` with the `__title` heading, the `__where` line (place and since when)
 * and the `__advice` steps, then `__actions` (the app's actions, Silence, Dismiss). An alarm is filled with the
 * danger colour and its edge pulses (steady with reduced motion); a warning takes the warning tone; cleared, the
 * success tone.
 */
export function createHazardBanner(options: HazardBannerOptions): HazardBannerHandle {
  let o: HazardBannerOptions = { ...options };
  const titleId = uid('mh-hazard-title');
  const el = h('section', { 'aria-labelledby': titleId });
  const render = (): void => {
    const l = hazardBannerLabels(o.labels);
    const text = hazardBannerText(o);
    const steps = hazardAdvice(o.advice);
    const buttons = hazardButtons(o);
    const focused = el.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.action : undefined;
    el.className = hazardBannerClass(o);
    el.setAttribute('role', hazardRole(o.severity));
    const title = h(`h${o.headingLevel ?? 2}` as 'h2', { class: 'mh-hazard-banner__title', id: titleId }, text.title);
    const body = h(
      'div',
      { class: 'mh-hazard-banner__body' },
      title,
      text.where ? h('p', { class: 'mh-hazard-banner__where' }, text.where) : null,
      steps.length ? h('ol', { class: 'mh-hazard-banner__advice', 'aria-label': l.advice }, ...steps.map((s) => h('li', {}, s))) : null,
    );
    const actions = buttons.length
      ? h(
          'div',
          { class: 'mh-hazard-banner__actions' },
          ...buttons.map((b) => {
            const button = h('button', { type: 'button', class: hazardButtonClass(b), 'data-action': b.id }, b.icon ? createIcon(b.icon) : null, h('span', { class: 'mh-button__label' }, b.label));
            button.addEventListener('click', () => (b.kind === 'silence' ? o.onSilence?.() : b.kind === 'dismiss' ? o.onDismiss?.() : o.onAction?.(b.id)));
            return button;
          }),
        )
      : null;
    el.replaceChildren(h('span', { class: 'mh-hazard-banner__icon', 'aria-hidden': 'true' }, createIcon(hazardIcon(o.kind, o.severity))), body, ...(actions ? [actions] : []));
    if (focused !== undefined) Array.from(el.querySelectorAll<HTMLButtonElement>('.mh-hazard-banner__action')).find((b) => b.dataset.action === focused)?.focus();
  };
  render();
  return {
    el,
    update(changes) {
      o = { ...o, ...changes };
      render();
    },
  };
}
