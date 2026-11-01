// data-display group: React bindings. Same DOM and classes as the web renderer.
import { mdiArrowDown, mdiArrowRight, mdiArrowUp, mdiCheck, mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiMinus, mdiMusic } from '@mdi/js';
import { Children, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { accordionClass, accordionInitial, accordionKeyTarget, accordionNext, type AccordionSection, type AccordionVariant } from '../web/data-display/accordion.ts';
import {
  dataTableCellClass,
  dataTableClass,
  dataTableNextSort,
  dataTableResizeKey,
  dataTableRowLabel,
  dataTableSelectAll,
  dataTableSortIcon,
  dataTableSortRows,
  dataTableToggleAll,
  dataTableValue,
  type DataTableColumn,
  type DataTableSort,
} from '../web/data-display/dataTable.ts';
import { qrCodeClass, qrCodeExtent, qrCodeMatrix, qrCodePath, type QrCodeSize } from '../web/data-display/qrCode.ts';
import type { QrEcc } from '../web/data-display/qrEncode.ts';
import {
  treeCheckState,
  treeClass,
  treeFind,
  treeKeyAction,
  treeNormalizeChecked,
  treeRows,
  treeTabStop,
  treeToggleChecked,
  type TreeNode,
  type TreeRow,
} from '../web/data-display/tree.ts';
import { Checkbox } from './choice-inputs.tsx';
import { avatarClass, avatarInitials, avatarLabel, avatarMoreClass, type AvatarSize, type AvatarStatus } from '../web/data-display/avatar.ts';
import { cardClass, cardLinkRel, cardTitleClass, type CardVariant, type ClampLines } from '../web/data-display/card.ts';
import {
  CAROUSEL_SLIDE_CLASS,
  carouselDotClass,
  carouselEdges,
  carouselIndex,
  carouselKeyDirection,
  carouselNavClass,
  carouselSlideLabel,
  carouselStep,
  type CarouselDirection,
} from '../web/data-display/carousel.ts';
import { propertyListClass } from '../web/data-display/propertyList.ts';
import { timelineClass, timelineItemClass, timelineRowClass, type TimelineItem, type TimelineVariant } from '../web/data-display/timeline.ts';
import { MEDIA_LIST_IMAGE_ATTRS, mediaListItemLabel, mediaListRowClass, mediaListSecondary, type MediaListItem } from '../web/data-display/mediaList.ts';
import { listClass, listRowClass } from '../web/data-display/list.ts';
import { statTrendLabel, tileClass, tileGridClass, type TileGridSize, type Trend } from '../web/data-display/tiles.ts';
import { forecastItemClass, forecastItemLabel, forecastStripClass, forecastVisible, type ForecastStripOptions } from '../web/data-display/forecastStrip.ts';
import { formatTemperature, weatherIcon, weatherIconClass } from '../web/home/weather.ts';
import { cx } from '../web/dom.ts';
import type { IconName } from '../web/icons.ts';
import { IconButton } from './actions.tsx';
import { Icon } from './foundations.tsx';

// Card ---------------------------------------------------------------------------------------------------------

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** A small line above the title ("Source · 2 h ago"). */
  eyebrow?: ReactNode;
  /** Clamps the title to this many lines. */
  titleLines?: ClampLines;
  icon?: IconName | string;
  headerAction?: ReactNode;
  /** Edge-to-edge media at the top (an `<img>`), shown 16:9 and cropped to cover. */
  media?: ReactNode;
  /** Width / height of the media (default 16 / 9). */
  mediaAspect?: number;
  footer?: ReactNode;
  variant?: CardVariant;
  /** The whole card is one link (`<a href>`). Don't put other links or buttons inside. */
  href?: string;
  /** Link target; `_blank` also sets `rel="noopener noreferrer"`. */
  target?: string;
  /** The whole card is one pressable target (`role="button"`, Enter and Space); with `href`, a click handler on the link. */
  onClick?: (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => void;
  /** Accessible name of a pressable card. */
  label?: string;
  headingLevel?: 2 | 3 | 4;
  /** The body. */
  children?: ReactNode;
}

/** Same DOM and classes as `createCard`. */
export function Card({
  title,
  subtitle,
  eyebrow,
  titleLines,
  icon,
  headerAction,
  media,
  mediaAspect,
  footer,
  variant,
  href,
  target,
  onClick,
  label,
  headingLevel = 3,
  className,
  children,
  ...rest
}: CardProps) {
  const link = href !== undefined;
  const interactive = link || Boolean(onClick);
  const Heading = `h${headingLevel}` as 'h3';
  const hasHeader = title !== undefined || subtitle !== undefined || eyebrow !== undefined || headerAction !== undefined;
  const content = (
    <>
      {media && (
        <div className="mh-card__media" style={mediaAspect && mediaAspect > 0 && Number.isFinite(mediaAspect) ? { aspectRatio: String(Math.round(mediaAspect * 10000) / 10000) } : undefined}>
          {media}
        </div>
      )}
      {hasHeader && (
        <div className="mh-card__header">
          {icon && (
            <span className="mh-card__icon">
              <Icon icon={icon} />
            </span>
          )}
          <div className="mh-card__heading">
            {eyebrow !== undefined && <p className="mh-card__eyebrow">{eyebrow}</p>}
            {title !== undefined && <Heading className={cardTitleClass(titleLines)}>{title}</Heading>}
            {subtitle !== undefined && <p className="mh-card__subtitle">{subtitle}</p>}
          </div>
          {headerAction && <div className="mh-card__action">{headerAction}</div>}
        </div>
      )}
      <div className="mh-card__body">{children}</div>
      {footer && <div className="mh-card__footer">{footer}</div>}
    </>
  );
  const cls = cx(cardClass(variant, interactive), className);
  if (link) {
    return (
      <a {...rest} className={cls} href={href} target={target} rel={cardLinkRel(target)} aria-label={label} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <div
      {...rest}
      className={cls}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? label : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
              e.preventDefault();
              onClick(e);
            }
          : undefined
      }
    >
      {content}
    </div>
  );
}

// List ---------------------------------------------------------------------------------------------------------

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  dividers?: boolean;
  inset?: boolean;
  label?: string;
  /** `ListItem`s. */
  children?: ReactNode;
}

/** Same DOM and classes as `createList`. */
export function List({ dividers = true, inset, label, className, children, ...rest }: ListProps) {
  return (
    <ul {...rest} className={cx(listClass(dividers, inset), className)} aria-label={label}>
      {children}
    </ul>
  );
}

export interface ListItemProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName | string;
  /** A leading element instead of the icon (an `Avatar`). */
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  href?: string;
  disabled?: boolean;
  current?: boolean;
  tone?: 'default' | 'danger';
}

/** Same DOM and classes as `createListItem`. */
export function ListItem({ title, subtitle, icon, leading, trailing, chevron, onClick, href, disabled, current, tone }: ListItemProps) {
  const cls = listRowClass(Boolean(onClick || href), tone);
  const content = (
    <>
      {leading ? (
        <span className="mh-list-row__leading">{leading}</span>
      ) : icon ? (
        <span className="mh-list-row__leading mh-list-row__icon">
          <Icon icon={icon} />
        </span>
      ) : null}
      <span className="mh-list-row__text">
        <span className="mh-list-row__title">{title}</span>
        {subtitle && <span className="mh-list-row__subtitle">{subtitle}</span>}
      </span>
      {trailing !== undefined && trailing !== null && trailing !== false && <span className="mh-list-row__trailing">{trailing}</span>}
      {chevron && (
        <span className="mh-list-row__chevron">
          <Icon icon={mdiChevronRight} />
        </span>
      )}
    </>
  );
  const ariaCurrent = current ? ('true' as const) : undefined;
  return (
    <li className="mh-list__item">
      {href ? (
        <a className={cls} href={href} aria-current={ariaCurrent} aria-disabled={disabled ? 'true' : undefined} onClick={onClick}>
          {content}
        </a>
      ) : onClick ? (
        <button type="button" className={cls} disabled={disabled} aria-current={ariaCurrent} onClick={onClick}>
          {content}
        </button>
      ) : (
        <div className={cls} aria-current={ariaCurrent} aria-disabled={disabled ? 'true' : undefined}>
          {content}
        </div>
      )}
    </li>
  );
}

export interface ListSectionProps {
  title?: ReactNode;
  footnote?: ReactNode;
  children?: ReactNode;
}

/** Same DOM and classes as `createListSection`. */
export function ListSection({ title, footnote, children }: ListSectionProps) {
  return (
    <section className="mh-list-section">
      {title && <h3 className="mh-list-section__title">{title}</h3>}
      {children}
      {footnote && <p className="mh-list-section__footnote">{footnote}</p>}
    </section>
  );
}

// Avatar -------------------------------------------------------------------------------------------------------

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  initials?: string;
  className?: string;
}

/** Same DOM and classes as `createAvatar`. */
export function Avatar({ name, src, size, status, initials, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cx(avatarClass(name, size), className)} role="img" aria-label={avatarLabel(name, status)}>
      <span className="mh-avatar__initials" aria-hidden="true">
        {initials ?? avatarInitials(name)}
      </span>
      {src && <img className="mh-avatar__image" src={src} alt="" hidden={failed || undefined} onError={() => setFailed(true)} />}
      {status && <span aria-hidden="true" className={`mh-avatar__status mh-avatar__status--${status}`} />}
    </span>
  );
}

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
  label?: string;
}

/** Same DOM and classes as `createAvatarGroup`. */
export function AvatarGroup({ avatars, max = avatars.length, size, label }: AvatarGroupProps) {
  const shown = avatars.slice(0, max);
  const rest = avatars.length - shown.length;
  return (
    <div className="mh-avatar-group" role="group" aria-label={label}>
      {shown.map((a, i) => (
        <Avatar key={`${a.name}-${i}`} {...a} size={size} />
      ))}
      {rest > 0 && (
        <span className={avatarMoreClass(size)} role="img" aria-label={`${rest} more`}>
          <span className="mh-avatar__initials" aria-hidden="true">
            +{rest}
          </span>
        </span>
      )}
    </div>
  );
}

// Tiles --------------------------------------------------------------------------------------------------------

export interface TileProps {
  icon: IconName | string;
  iconOn?: IconName | string;
  label: ReactNode;
  state?: ReactNode;
  /** Controlled on/off: makes the tile a toggle (`aria-pressed`). */
  on?: boolean;
  onToggle?: (on: boolean) => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
}

/** Same DOM and classes as `createTile`. Toggle tiles are controlled through `on` and `onToggle`. */
export function Tile({ icon, iconOn, label, state, on, onToggle, onClick, disabled, className }: TileProps) {
  const toggle = on !== undefined;
  return (
    <button
      type="button"
      className={cx(tileClass(on ?? false), className)}
      disabled={disabled}
      aria-pressed={toggle ? on : undefined}
      onClick={(e) => {
        if (toggle) onToggle?.(!on);
        onClick?.(e);
      }}
    >
      <span className="mh-tile__icon">
        <Icon icon={on && iconOn ? iconOn : icon} />
      </span>
      <span className="mh-tile__label">{label}</span>
      <span className="mh-tile__state">{state}</span>
    </button>
  );
}

export interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  icon?: IconName | string;
  caption?: ReactNode;
  trend?: Trend;
  className?: string;
}

const TREND_ICON: Record<Trend, string> = { up: mdiArrowUp, down: mdiArrowDown, flat: mdiArrowRight };

/** Same DOM and classes as `createStatTile`. */
export function StatTile({ label, value, unit, icon, caption, trend, className }: StatTileProps) {
  return (
    <div className={cx('mh-tile mh-tile--stat', className)}>
      <span className="mh-tile__label">
        {icon && (
          <span className="mh-tile__icon">
            <Icon icon={icon} />
          </span>
        )}
        {label}
      </span>
      <span className="mh-tile__value">
        <span className="mh-tile__number">{value}</span>
        {unit && <span className="mh-tile__unit">{unit}</span>}
        {trend && (
          <span className={`mh-tile__trend mh-tile__trend--${trend}`}>
            <Icon icon={TREND_ICON[trend]} label={statTrendLabel(trend)} />
          </span>
        )}
      </span>
      {caption && <span className="mh-tile__caption">{caption}</span>}
    </div>
  );
}

export interface TileGridProps {
  size?: TileGridSize;
  label?: string;
  className?: string;
  children?: ReactNode;
}

/** Same DOM and classes as `createTileGrid`. */
export function TileGrid({ size, label, className, children }: TileGridProps) {
  return (
    <div className={cx(tileGridClass(size), className)} role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}

// Carousel -----------------------------------------------------------------------------------------------------

export interface CarouselProps {
  /** Required: the region's accessible name. */
  label: string;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
  /** One child per slide; each is wrapped in a `.mh-carousel__slide`. */
  children?: ReactNode;
}

/** Same DOM and classes as `createCarousel`: a snapping, focusable track; Arrow Left / Right step one slide. */
export function Carousel({ label, previousLabel = 'Previous', nextLabel = 'Next', className, children }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true, index: 0 });
  const slides = Children.toArray(children);
  const update = useCallback(() => {
    if (!track.current) return;
    const next = { ...carouselEdges(track.current), index: carouselIndex(track.current) };
    setEdges((prev) => (prev.atStart === next.atStart && prev.atEnd === next.atEnd && prev.index === next.index ? prev : next));
  }, []);
  const count = slides.length;
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    update();
    if (typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, count]);
  const step = (direction: CarouselDirection): void => {
    if (track.current) carouselStep(track.current, direction);
  };
  return (
    <div className={cx('mh-carousel', className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        className="mh-carousel__track"
        tabIndex={0}
        onScroll={update}
        onKeyDown={(e) => {
          if (!track.current) return;
          const direction = carouselKeyDirection(e.nativeEvent, track.current);
          if (direction === null) return;
          e.preventDefault();
          step(direction);
        }}
      >
        {slides.map((child, i) => (
          <div
            key={isValidElement(child) && child.key !== null ? child.key : i}
            className={CAROUSEL_SLIDE_CLASS}
            role="group"
            aria-roledescription="slide"
            aria-label={carouselSlideLabel(i, count)}
          >
            {child}
          </div>
        ))}
      </div>
      <IconButton icon={mdiChevronLeft} label={previousLabel} size="small" filled className={carouselNavClass(-1)} disabled={edges.atStart} onClick={() => step(-1)} />
      <IconButton icon={mdiChevronRight} label={nextLabel} size="small" filled className={carouselNavClass(1)} disabled={edges.atEnd} onClick={() => step(1)} />
      {count > 1 && !(edges.atStart && edges.atEnd) && (
        <div className="mh-carousel__dots" aria-hidden="true">
          {slides.map((_, i) => (
            <span key={i} className={carouselDotClass(i === edges.index)} />
          ))}
        </div>
      )}
    </div>
  );
}

// Property list ------------------------------------------------------------------------------------------------

export interface PropertyListEntry {
  label: ReactNode;
  value: ReactNode;
}

export interface PropertyListProps {
  items: PropertyListEntry[];
  /** Tighter rows. */
  dense?: boolean;
  className?: string;
}

/** Same DOM and classes as `createPropertyList`. */
export function PropertyList({ items, dense, className }: PropertyListProps) {
  return (
    <dl className={cx(propertyListClass(dense), className)}>
      {items.map((item, i) => (
        <div key={i} className="mh-property-list__row">
          <dt className="mh-property-list__label">{item.label}</dt>
          <dd className="mh-property-list__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Timeline -----------------------------------------------------------------------------------------------------

export interface TimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  /** Accessible name of the list. */
  label?: string;
  /** Makes every row a button; called with the row's index. */
  onSelect?: (index: number) => void;
  className?: string;
}

/** Same DOM and classes as `createTimeline`. */
export function Timeline({ items, variant = 'list', label, onSelect, className }: TimelineProps) {
  const feed = variant === 'feed';
  const cls = timelineRowClass(Boolean(onSelect));
  return (
    <ol className={cx(timelineClass(variant), className)} aria-label={label}>
      {items.map((item, i) => {
        const content = (
          <>
            {feed && (
              <span className="mh-timeline__marker" aria-hidden="true">
                {item.icon && <Icon icon={item.icon} />}
              </span>
            )}
            <span className="mh-timeline__time">{item.time}</span>
            <span className="mh-timeline__body">
              <span className="mh-timeline__title">{item.title}</span>
              {item.detail && <span className="mh-timeline__detail">{item.detail}</span>}
            </span>
          </>
        );
        return (
          <li key={i} className={timelineItemClass(item.tone, feed && Boolean(item.icon))}>
            {onSelect ? (
              <button type="button" className={cls} onClick={() => onSelect(i)}>
                {content}
              </button>
            ) : (
              <div className={cls}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Media list ---------------------------------------------------------------------------------------------------

export interface MediaListProps {
  items: MediaListItem[];
  /** Accessible name of the list. */
  label?: string;
  /** Placeholder icon when a row has no image (default `music`). */
  placeholder?: IconName | string;
  /** A trailing icon on every row (`play`). */
  action?: IconName | string;
  /** What the action does, the start of each row's accessible name ("Play"). */
  actionLabel?: string;
  /** Makes every row a button; called with the row's index. */
  onSelect?: (index: number) => void;
  className?: string;
}

function MediaListThumb({ image, placeholder }: { image?: string | null; placeholder: IconName | string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="mh-media-list__thumb" aria-hidden="true">
      <Icon icon={placeholder} className="mh-media-list__placeholder" />
      {image && (
        <img
          className="mh-media-list__image"
          src={image}
          alt={MEDIA_LIST_IMAGE_ATTRS.alt}
          loading={MEDIA_LIST_IMAGE_ATTRS.loading}
          decoding={MEDIA_LIST_IMAGE_ATTRS.decoding}
          referrerPolicy={MEDIA_LIST_IMAGE_ATTRS.referrerpolicy}
          hidden={failed || undefined}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

/** Same DOM and classes as `createMediaList`. */
export function MediaList({ items, label, placeholder = mdiMusic, action, actionLabel, onSelect, className }: MediaListProps) {
  const cls = mediaListRowClass(Boolean(onSelect));
  return (
    <ul className={cx('mh-media-list', className)} aria-label={label}>
      {items.map((item, i) => {
        const secondary = mediaListSecondary(item);
        const content = (
          <>
            <MediaListThumb key={item.image ?? ''} image={item.image} placeholder={item.placeholder ?? placeholder} />
            <span className="mh-media-list__text">
              <span className="mh-media-list__title">{item.title}</span>
              {secondary && <span className="mh-media-list__subtitle">{secondary}</span>}
            </span>
            {action && (
              <span className="mh-media-list__action" aria-hidden="true">
                <Icon icon={action} />
              </span>
            )}
          </>
        );
        return (
          <li key={i} className="mh-media-list__item">
            {onSelect ? (
              <button type="button" className={cls} aria-label={mediaListItemLabel(item, actionLabel)} onClick={() => onSelect(i)}>
                {content}
              </button>
            ) : (
              <div className={cls}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Forecast strip -----------------------------------------------------------------------------------------------

export interface ForecastStripProps extends ForecastStripOptions {
  className?: string;
}

/** Same DOM and classes as `createForecastStrip`. */
export function ForecastStrip({ label, readings, unit = '°', variant = 'days', subName, className }: ForecastStripProps) {
  const shown = forecastVisible(readings, variant);
  return (
    <div className={cx(forecastStripClass(variant), className)}>
      <ul
        className="mh-forecast-strip__list"
        role="list"
        aria-label={label}
        tabIndex={variant === 'hours' ? 0 : undefined}
        style={{ '--_n': String(Math.max(1, shown.length)) } as CSSProperties}
      >
        {shown.map((r, i) => (
          <li key={i} className={forecastItemClass(r)}>
            <span className="mh-visually-hidden">{forecastItemLabel(r, { unit, variant, subName })}</span>
            <span className="mh-forecast-strip__label" aria-hidden="true">
              {r.label}
            </span>
            <Icon icon={weatherIcon(r.condition)} className={weatherIconClass(r.condition, 'mh-forecast-strip__icon')} />
            <span className="mh-forecast-strip__value" aria-hidden="true">
              {formatTemperature(r.value, unit)}
            </span>
            {variant === 'days' && r.low !== null && r.low !== undefined && Number.isFinite(r.low) && (
              <span className="mh-forecast-strip__low" aria-hidden="true">
                {formatTemperature(r.low, unit)}
              </span>
            )}
            {r.sub?.trim() && (
              <span className="mh-forecast-strip__sub" aria-hidden="true">
                {r.sub.trim()}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Accordion ----------------------------------------------------------------------------------------------------

export interface AccordionItem extends Omit<AccordionSection, 'content'> {
  content?: ReactNode;
}

export interface AccordionProps {
  sections: readonly AccordionItem[];
  /** Controlled open ids. */
  open?: readonly string[];
  /** Uncontrolled: open at the start. */
  defaultOpen?: readonly string[];
  mode?: 'single' | 'multiple';
  required?: boolean;
  variant?: AccordionVariant;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  onChange?: (open: string[]) => void;
  className?: string;
}

/** Same DOM and classes as `createAccordion`; controlled through `open` / `onChange`, or uncontrolled. */
export function Accordion({ sections, open, defaultOpen, mode = 'multiple', required = false, variant, headingLevel = 3, onChange, className }: AccordionProps) {
  const base = useId();
  const [inner, setInner] = useState(() => accordionInitial(sections, defaultOpen, mode, required));
  const current = open ? accordionInitial(sections, open, mode, required) : inner;
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const Heading = `h${headingLevel}` as 'h3';
  const press = (id: string): void => {
    const next = accordionNext(current, id, mode, required);
    if (next.length === current.length && next.every((x) => current.includes(x))) return;
    setInner(next);
    onChange?.(next);
  };
  return (
    <div
      className={cx(accordionClass(variant), className)}
      onKeyDown={(e) => {
        const from = triggers.current.indexOf(e.target as HTMLButtonElement);
        if (from < 0) return;
        const to = accordionKeyTarget(sections, from, e.key);
        if (to === null) return;
        e.preventDefault();
        triggers.current[to]?.focus();
      }}
    >
      {sections.map((section, i) => {
        const on = current.includes(section.id);
        return (
          <div key={section.id} className={cx('mh-accordion__item', on && 'is-open')}>
            <Heading className="mh-accordion__heading">
              <button
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                type="button"
                className="mh-accordion__trigger"
                id={`${base}-trigger-${i}`}
                aria-controls={`${base}-panel-${i}`}
                aria-expanded={on}
                aria-disabled={mode === 'single' && required && on ? 'true' : undefined}
                disabled={section.disabled}
                onClick={() => press(section.id)}
              >
                {section.icon && (
                  <span className="mh-accordion__icon">
                    <Icon icon={section.icon} />
                  </span>
                )}
                <span className="mh-accordion__text">
                  <span className="mh-accordion__title">{section.title}</span>
                  {section.subtitle && <span className="mh-accordion__subtitle">{section.subtitle}</span>}
                </span>
                {section.meta && <span className="mh-accordion__meta">{section.meta}</span>}
                <Icon icon={mdiChevronDown} className="mh-accordion__chevron" />
              </button>
            </Heading>
            <div className="mh-accordion__panel" id={`${base}-panel-${i}`} role="region" aria-labelledby={`${base}-trigger-${i}`} hidden={!on}>
              <div className="mh-accordion__content">{section.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Tree ---------------------------------------------------------------------------------------------------------

export interface TreeProps {
  nodes: readonly TreeNode[];
  label?: string;
  /** Controlled expanded ids. */
  expanded?: readonly string[];
  defaultExpanded?: readonly string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Controlled selection (when not `checkable`). */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelect?: (id: string) => void;
  checkable?: boolean;
  /** Controlled checked ids (a parent stands for its leaves). */
  checked?: readonly string[];
  defaultChecked?: readonly string[];
  onCheckedChange?: (checked: string[]) => void;
  dense?: boolean;
  className?: string;
}

/** Same DOM and classes as `createTree`; each of expanded, selected and checked is controlled or uncontrolled. */
export function Tree({
  nodes,
  label,
  expanded,
  defaultExpanded,
  onExpandedChange,
  selected,
  defaultSelected = null,
  onSelect,
  checkable = false,
  checked,
  defaultChecked,
  onCheckedChange,
  dense,
  className,
}: TreeProps) {
  const [innerExpanded, setInnerExpanded] = useState<readonly string[]>(defaultExpanded ?? []);
  const [innerSelected, setInnerSelected] = useState<string | null>(defaultSelected);
  const [innerChecked, setInnerChecked] = useState<readonly string[]>(defaultChecked ?? []);
  const [focusId, setFocusId] = useState<string | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const root = useRef<HTMLUListElement>(null);
  const open = expanded ?? innerExpanded;
  const sel = selected === undefined ? innerSelected : selected;
  const leaves = treeNormalizeChecked(nodes, checked ?? innerChecked);
  const rows = treeRows(nodes, open);
  const tabStop = treeTabStop(rows, focusId, sel);

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    Array.from(root.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])
      .find((li) => li.dataset.id === id)
      ?.focus();
  });

  const focus = (id: string): void => {
    pendingFocus.current = id;
    setFocusId(id);
  };
  const setOpen = (next: string[]): void => {
    setInnerExpanded(next);
    onExpandedChange?.(next);
  };
  const activate = (id: string): void => {
    const node = treeFind(nodes, id);
    if (!node || node.disabled) return;
    focus(id);
    if (checkable) {
      const next = treeToggleChecked(nodes, id, leaves);
      setInnerChecked(next);
      onCheckedChange?.(next);
    } else if (sel !== id) {
      setInnerSelected(id);
      onSelect?.(id);
    }
  };

  const item = (row: TreeRow): ReactNode => {
    const { node } = row;
    const parent = (node.children?.length ?? 0) > 0;
    const isOpen = parent && open.includes(node.id);
    return (
      <li
        key={node.id}
        className={cx('mh-tree__item', !checkable && sel === node.id && 'is-selected')}
        role="treeitem"
        data-id={node.id}
        aria-level={row.level}
        aria-setsize={row.setsize}
        aria-posinset={row.posinset}
        aria-expanded={parent ? isOpen : undefined}
        aria-selected={checkable ? undefined : sel === node.id}
        aria-checked={checkable ? treeCheckState(node, leaves) : undefined}
        aria-disabled={node.disabled ? 'true' : undefined}
        tabIndex={tabStop === node.id ? 0 : -1}
      >
        <div className="mh-tree__row" style={{ '--_level': String(row.level - 1) } as CSSProperties}>
          <span
            className={cx('mh-tree__toggle', !parent && 'mh-tree__toggle--leaf')}
            aria-hidden="true"
            onClick={
              parent
                ? (e) => {
                    e.stopPropagation();
                    focus(node.id);
                    setOpen(isOpen ? open.filter((x) => x !== node.id) : [...open, node.id]);
                  }
                : undefined
            }
          >
            {parent && <Icon icon={mdiChevronRight} />}
          </span>
          {checkable && (
            <span className="mh-tree__check" aria-hidden="true">
              <Icon icon={mdiCheck} className="mh-tree__check-mark" />
              <Icon icon={mdiMinus} className="mh-tree__check-dash" />
            </span>
          )}
          {node.icon && (
            <span className="mh-tree__icon">
              <Icon icon={node.icon} />
            </span>
          )}
          <span className="mh-tree__label">{node.label}</span>
          {node.meta && <span className="mh-tree__meta">{node.meta}</span>}
        </div>
        {isOpen && (
          <ul className="mh-tree__group" role="group">
            {rows.filter((r) => r.parent === node.id).map(item)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul
      ref={root}
      className={cx(treeClass(checkable, dense), className)}
      role="tree"
      aria-label={label}
      onClick={(e) => {
        const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
        if (li?.dataset.id) activate(li.dataset.id);
      }}
      onFocus={(e) => {
        const li = (e.target as Element).closest<HTMLElement>('[role="treeitem"]');
        if (li?.dataset.id && li.dataset.id !== focusId) setFocusId(li.dataset.id);
      }}
      onKeyDown={(e) => {
        const li = e.target as HTMLElement;
        const id = li.dataset.id;
        if (!id || li.getAttribute('role') !== 'treeitem' || e.altKey || e.ctrlKey || e.metaKey) return;
        const result = treeKeyAction(rows, id, e.key, open);
        if (!result) return;
        e.preventDefault();
        if (result.expanded) {
          setOpen(result.expanded);
          focus(id);
        }
        if (result.focus) focus(result.focus);
        if (result.activate) activate(id);
      }}
    >
      {rows.filter((r) => r.level === 1).map(item)}
    </ul>
  );
}

// Data table ---------------------------------------------------------------------------------------------------

export interface DataTableColumnProps<T> extends Omit<DataTableColumn<T>, 'render'> {
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: readonly DataTableColumnProps<T>[];
  rows: readonly T[];
  rowId: (row: T) => string;
  label: string;
  showCaption?: boolean;
  /** Controlled sort. */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  selectable?: boolean;
  /** Controlled selection. */
  selected?: readonly string[];
  defaultSelected?: readonly string[];
  onSelectionChange?: (selected: string[]) => void;
  rowLabel?: (row: T) => string;
  resizable?: boolean;
  onColumnResize?: (column: string, width: number) => void;
  dense?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  stickyColumn?: boolean;
  maxHeight?: string;
  empty?: ReactNode;
  className?: string;
}

/** Same DOM and classes as `createDataTable`; sort and selection controlled or uncontrolled, widths kept inside. */
export function DataTable<T>({
  columns,
  rows,
  rowId,
  label,
  showCaption,
  sort,
  defaultSort = null,
  onSortChange,
  selectable,
  selected,
  defaultSelected,
  onSelectionChange,
  rowLabel,
  resizable,
  onColumnResize,
  dense,
  striped,
  stickyHeader = true,
  stickyColumn,
  maxHeight,
  empty = 'Nothing to show',
  className,
}: DataTableProps<T>) {
  const captionId = useId();
  const [innerSort, setInnerSort] = useState<DataTableSort | null>(defaultSort);
  const [innerSelected, setInnerSelected] = useState<readonly string[]>(defaultSelected ?? []);
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(columns.filter((c) => c.width).map((c) => [c.id, c.width!])));
  const ths = useRef<(HTMLTableCellElement | null)[]>([]);
  const currentSort = sort === undefined ? innerSort : sort;
  const current = selected ?? innerSelected;
  const ids = rows.map(rowId);
  const all = dataTableSelectAll(ids, current);
  const sized = columns.length > 0 && columns.every((c) => widths[c.id] !== undefined);
  const sorted = dataTableSortRows(rows, columns, currentSort);

  const select = (next: string[]): void => {
    const unique = [...new Set(next)];
    setInnerSelected(unique);
    onSelectionChange?.(unique);
  };
  /** Measures every column the first time one is resized, so only that one changes. */
  const measured = (): Record<string, number> => {
    if (sized) return widths;
    const out = { ...widths };
    columns.forEach((c, i) => {
      if (out[c.id] === undefined) out[c.id] = Math.round(ths.current[i]?.getBoundingClientRect().width ?? 0) || c.minWidth || 120;
    });
    return out;
  };
  const resize = (id: string, width: number, base = measured()): void => {
    const w = Math.round(width);
    setWidths({ ...base, [id]: w });
    onColumnResize?.(id, w);
  };

  return (
    <div
      className={cx(dataTableClass({ dense, striped, stickyHeader, stickyColumn, selectable }), className)}
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className={cx('mh-data-table__table', sized && 'is-sized')}>
        <caption className={cx('mh-data-table__caption', !showCaption && 'mh-visually-hidden')} id={captionId}>
          {label}
        </caption>
        <colgroup>
          {selectable && <col className="mh-data-table__col mh-data-table__col--select" />}
          {columns.map((c) => (
            <col key={c.id} className="mh-data-table__col" style={widths[c.id] !== undefined ? { width: `${widths[c.id]}px` } : undefined} />
          ))}
        </colgroup>
        <thead className="mh-data-table__head">
          <tr className="mh-data-table__head-row">
            {selectable && (
              <th className="mh-data-table__th mh-data-table__select" scope="col">
                <Checkbox aria-label="Select all rows" checked={all === 'all'} indeterminate={all === 'some'} disabled={rows.length === 0} onChange={() => select(dataTableToggleAll(ids, current))} />
              </th>
            )}
            {columns.map((column, i) => {
              const on = currentSort?.column === column.id;
              const canResize = column.resizable ?? resizable ?? false;
              const min = column.minWidth ?? 48;
              return (
                <th
                  key={column.id}
                  ref={(el) => {
                    ths.current[i] = el;
                  }}
                  className={cx(dataTableCellClass(column.align, true), on && 'is-sorted')}
                  scope="col"
                  aria-sort={column.sortable ? (on ? currentSort!.direction : 'none') : undefined}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="mh-data-table__sort"
                      onClick={() => {
                        const next = dataTableNextSort(currentSort, column.id);
                        setInnerSort(next);
                        onSortChange?.(next);
                      }}
                    >
                      <span className="mh-data-table__label">{column.label}</span>
                      <Icon icon={dataTableSortIcon(on ? currentSort!.direction : undefined)} className="mh-data-table__sort-icon" />
                    </button>
                  ) : (
                    <span className="mh-data-table__label">{column.label}</span>
                  )}
                  {canResize && (
                    <span
                      className="mh-data-table__resize"
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize ${column.label}`}
                      aria-valuemin={min}
                      aria-valuenow={widths[column.id]}
                      tabIndex={0}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        const base = measured();
                        const next = dataTableResizeKey(base[column.id]!, e.key, e.shiftKey, column.minWidth);
                        if (next === null) return;
                        e.preventDefault();
                        resize(column.id, next, base);
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        const handle = e.currentTarget;
                        const base = measured();
                        const start = base[column.id]!;
                        const startX = e.clientX;
                        handle.setPointerCapture?.(e.pointerId);
                        handle.classList.add('is-active');
                        const move = (ev: globalThis.PointerEvent): void => resize(column.id, Math.max(min, start + (ev.clientX - startX)), base);
                        const up = (): void => {
                          handle.classList.remove('is-active');
                          handle.removeEventListener('pointermove', move);
                          handle.removeEventListener('pointerup', up);
                          handle.removeEventListener('pointercancel', up);
                        };
                        handle.addEventListener('pointermove', move);
                        handle.addEventListener('pointerup', up);
                        handle.addEventListener('pointercancel', up);
                      }}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="mh-data-table__body">
          {sorted.length === 0 ? (
            <tr className="mh-data-table__row">
              <td className="mh-data-table__empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const id = rowId(row);
              const on = current.includes(id);
              return (
                <tr key={id} className={cx('mh-data-table__row', on && 'is-selected')} data-id={id}>
                  {selectable && (
                    <td className="mh-data-table__td mh-data-table__select">
                      <Checkbox
                        aria-label={dataTableRowLabel(row, columns, rowLabel)}
                        checked={on}
                        onChange={(e) => select(e.target.checked ? [...current, id] : current.filter((x) => x !== id))}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const v = dataTableValue(column, row);
                    return (
                      <td key={column.id} className={dataTableCellClass(column.align)}>
                        {column.render ? column.render(row) : v === null || v === undefined ? '' : String(v)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// QR code ------------------------------------------------------------------------------------------------------

export interface QrCodeProps {
  value: string;
  label?: string;
  caption?: ReactNode;
  ecc?: QrEcc;
  size?: QrCodeSize;
  quietZone?: number;
  className?: string;
}

/** Same DOM and classes as `createQrCode`. */
export function QrCode({ value, label = 'QR code', caption, ecc, size, quietZone = 4, className }: QrCodeProps) {
  const quiet = Math.max(0, Math.floor(quietZone));
  const matrix = useMemo(() => qrCodeMatrix(value, ecc), [value, ecc]);
  const extent = qrCodeExtent(matrix, quiet);
  return (
    <figure className={cx(qrCodeClass(size), className)}>
      <svg className="mh-qr-code__svg" role="img" aria-label={label} shapeRendering="crispEdges" viewBox={`0 0 ${extent} ${extent}`}>
        <rect className="mh-qr-code__plate" width={extent} height={extent} />
        <path className="mh-qr-code__modules" d={qrCodePath(matrix, quiet)} />
      </svg>
      {caption !== undefined && caption !== null && caption !== '' && <figcaption className="mh-qr-code__caption">{caption}</figcaption>}
    </figure>
  );
}
