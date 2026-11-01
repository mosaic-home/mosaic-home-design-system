// The component catalogue: every component of the design system, by group. Every renderer works from this one list
// (the web renderer here, the LVGL kit through catalog.json), and each says which entries it has built.

import { WEB_READY_IDS } from './ready.ts';

export type GroupId =
  | 'foundations'
  | 'actions'
  | 'text-inputs'
  | 'choice-inputs'
  | 'pickers'
  | 'navigation'
  | 'overlays'
  | 'feedback'
  | 'data-display'
  | 'charts'
  | 'media'
  | 'layout'
  | 'home';

export interface CatalogGroup {
  id: GroupId;
  name: string;
}

export interface CatalogEntry {
  id: string;
  name: string;
  group: GroupId;
  summary: string;
}

export const GROUPS: readonly CatalogGroup[] = [
  { id: 'foundations', name: 'Foundations' },
  { id: 'actions', name: 'Actions' },
  { id: 'text-inputs', name: 'Text inputs' },
  { id: 'choice-inputs', name: 'Choice & range' },
  { id: 'pickers', name: 'Pickers' },
  { id: 'navigation', name: 'Navigation' },
  { id: 'overlays', name: 'Overlays' },
  { id: 'feedback', name: 'Feedback' },
  { id: 'data-display', name: 'Data display' },
  { id: 'charts', name: 'Charts & instruments' },
  { id: 'media', name: 'Media & editors' },
  { id: 'layout', name: 'Layout & shells' },
  { id: 'home', name: 'Home controls' },
];

export const CATALOG: readonly CatalogEntry[] = [
  { id: 'text', name: 'Text', group: 'foundations', summary: 'Type scale: jumbo to caption, mono eyebrows and section titles, tones.' },
  { id: 'accent-headline', name: 'Accent headline', group: 'foundations', summary: 'Headline with one serif-italic accent phrase.' },
  { id: 'icon', name: 'Icon', group: 'foundations', summary: 'One SVG icon set for both renderers (Material Design Icons).' },
  { id: 'kbd', name: 'Keyboard key', group: 'foundations', summary: 'Key caps and shortcut chords (Ctrl + K).' },
  { id: 'divider', name: 'Divider', group: 'foundations', summary: 'Horizontal or vertical rule, optionally labelled.' },
  { id: 'backdrop', name: 'Backdrop', group: 'foundations', summary: 'The canvas gradient and ambient glow behind screens; off in calm themes.' },
  { id: 'boot-splash', name: 'Boot splash', group: 'foundations', summary: 'An animated start screen with the product mark.' },
  { id: 'palette', name: 'Palette', group: 'foundations', summary: 'Every colour role of the theme.' },
  { id: 'type-scale', name: 'Type scale', group: 'foundations', summary: 'The text styles, jumbo to caption, at this device class.' },
  { id: 'shape-space', name: 'Shape and space', group: 'foundations', summary: 'Radii, spacing and touch targets from the theme character.' },
  { id: 'elevation', name: 'Elevation', group: 'foundations', summary: 'Flat, raised and overlay surfaces: shadow, glow or none.' },
  { id: 'button', name: 'Button', group: 'actions', summary: 'Primary, secondary, text and danger buttons in three sizes, with icon and loading states.' },
  { id: 'icon-button', name: 'Icon button', group: 'actions', summary: 'Icon-only button with tones, sizes and a filled variant.' },
  { id: 'button-group', name: 'Button group', group: 'actions', summary: 'Joined buttons, a toolbar segment.' },
  { id: 'link', name: 'Link', group: 'actions', summary: 'Inline text link: accent, muted or inherit.' },
  { id: 'favourite-toggle', name: 'Favourite toggle', group: 'actions', summary: 'Star toggle for favourites.' },
  { id: 'field', name: 'Field', group: 'text-inputs', summary: 'Label, helper, error and success around any control.' },
  { id: 'text-field', name: 'Text field', group: 'text-inputs', summary: 'Text input: eyebrow or floating label, adornments, validation, counter.' },
  { id: 'text-area', name: 'Text area', group: 'text-inputs', summary: 'Multi-line input that grows with its text, with a character count.' },
  { id: 'search-field', name: 'Search field', group: 'text-inputs', summary: 'Search box with clear button and keyboard-driven suggestions.' },
  { id: 'composer', name: 'Composer', group: 'text-inputs', summary: 'Message input for chat and assistants: grows to six lines, action slots, mode chip, suggestions.' },
  { id: 'number-input', name: 'Number input', group: 'text-inputs', summary: 'Number entry with − / + buttons, units and drag-to-scrub.' },
  { id: 'secret-field', name: 'Secret field', group: 'text-inputs', summary: 'Password / API key entry with reveal and copy.' },
  { id: 'hotkey-field', name: 'Hotkey field', group: 'text-inputs', summary: 'Records a keyboard shortcut.' },
  { id: 'command-bar', name: 'Command bar', group: 'text-inputs', summary: 'Mono prompt with suggestions and history.' },
  { id: 'duration-field', name: 'Duration field', group: 'text-inputs', summary: 'Free-text duration entry ("1h 30m").' },
  { id: 'select', name: 'Select', group: 'text-inputs', summary: 'Custom dropdown with search, groups and icons.' },
  { id: 'multi-select', name: 'Multi-select', group: 'text-inputs', summary: 'Pick several options, shown as removable chips.' },
  { id: 'transfer-list', name: 'Transfer list', group: 'text-inputs', summary: 'Move items between two lists.' },
  { id: 'checkbox', name: 'Checkbox', group: 'choice-inputs', summary: 'Checkbox with indeterminate state, and checkbox groups.' },
  { id: 'radio-group', name: 'Radio group', group: 'choice-inputs', summary: 'One of several, vertical or inline.' },
  { id: 'switch', name: 'Switch', group: 'choice-inputs', summary: 'On/off switch and the settings toggle row.' },
  { id: 'segmented-control', name: 'Segmented control', group: 'choice-inputs', summary: 'Pill radio group for a few options.' },
  { id: 'toggle-group', name: 'Toggle group', group: 'choice-inputs', summary: 'Icon or text toggles, single or multiple.' },
  { id: 'chip', name: 'Chip', group: 'choice-inputs', summary: 'Selectable or removable pill; chip groups and weekday picker.' },
  { id: 'slider', name: 'Slider', group: 'choice-inputs', summary: 'Single value slider, horizontal or vertical, with marks.' },
  { id: 'range-slider', name: 'Range slider', group: 'choice-inputs', summary: 'Two-thumb range.' },
  { id: 'radial-dial', name: 'Radial dial', group: 'choice-inputs', summary: 'Knob for angles and amounts.' },
  { id: 'click-wheel', name: 'Click wheel', group: 'choice-inputs', summary: 'Large rotary wheel with ticks.' },
  { id: 'stepper', name: 'Stepper', group: 'choice-inputs', summary: '− value + for small counts.' },
  { id: 'rating', name: 'Rating', group: 'choice-inputs', summary: 'Star rating, read-only or editable.' },
  { id: 'date-time-field', name: 'Date & time field', group: 'pickers', summary: 'Platform date/time input.' },
  { id: 'date-picker', name: 'Date picker', group: 'pickers', summary: 'Calendar popover for one date.' },
  { id: 'date-range-picker', name: 'Date range picker', group: 'pickers', summary: 'Calendar for a start and end date.' },
  { id: 'color-picker', name: 'Colour picker', group: 'pickers', summary: 'Swatches, HSV field, hue and alpha, hex entry, eyedropper.' },
  { id: 'gradient-editor', name: 'Gradient editor', group: 'pickers', summary: 'Multi-stop gradient with colour and opacity stops.' },
  { id: 'icon-picker', name: 'Icon picker', group: 'pickers', summary: 'Pick an icon from a grid.' },
  { id: 'file-drop-zone', name: 'File drop zone', group: 'pickers', summary: 'Drop files or browse.' },
  { id: 'tabs', name: 'Tabs', group: 'navigation', summary: 'Tabs with panels: underline, pill or boxed.' },
  { id: 'document-tabs', name: 'Document tabs', group: 'navigation', summary: 'Closable editor tabs with unsaved dot.' },
  { id: 'menu-bar', name: 'Menu bar', group: 'navigation', summary: 'Desktop menu bar with submenus and shortcuts.' },
  { id: 'breadcrumbs', name: 'Breadcrumbs', group: 'navigation', summary: 'Where you are, one step at a time.' },
  { id: 'pagination', name: 'Pagination', group: 'navigation', summary: 'Page buttons with ellipses.' },
  { id: 'steps', name: 'Steps', group: 'navigation', summary: 'Wizard progress: horizontal or vertical, with complete and error states.' },
  { id: 'nav-rail', name: 'Navigation rail', group: 'navigation', summary: 'Side navigation with icons, labels and badges.' },
  { id: 'page-header', name: 'Page header', group: 'navigation', summary: 'Eyebrow, title, subtitle and actions.' },
  { id: 'split-button', name: 'Split button', group: 'overlays', summary: 'A main action with a menu of alternatives.' },
  { id: 'dialog', name: 'Dialog', group: 'overlays', summary: 'Modal dialog, optionally draggable.' },
  { id: 'confirm', name: 'Confirm', group: 'overlays', summary: 'Promise-based confirm with destructive and type-to-confirm modes.' },
  { id: 'bottom-sheet', name: 'Bottom sheet', group: 'overlays', summary: 'Sheet on phones, centred panel on wide screens.' },
  { id: 'drawer', name: 'Drawer', group: 'overlays', summary: 'Side panel from the left or right.' },
  { id: 'popover', name: 'Popover', group: 'overlays', summary: 'Floating panel anchored to a control.' },
  { id: 'tooltip', name: 'Tooltip', group: 'overlays', summary: 'Short hint on hover or focus.' },
  { id: 'menu', name: 'Menu', group: 'overlays', summary: 'Dropdown and context menus with icons, shortcuts and submenus.' },
  { id: 'toast', name: 'Toast', group: 'overlays', summary: 'Transient message with variants, an action and a queue.' },
  { id: 'command-palette', name: 'Command palette', group: 'overlays', summary: 'Search every command from the keyboard.' },
  { id: 'alert', name: 'Alert', group: 'feedback', summary: 'Inline message: info, success, warning, error; dismissible.' },
  { id: 'progress-bar', name: 'Progress bar', group: 'feedback', summary: 'Determinate or indeterminate, with tones.' },
  { id: 'progress-ring', name: 'Progress ring', group: 'feedback', summary: 'Circular progress with a value in the middle.' },
  { id: 'progress-list', name: 'Progress list', group: 'feedback', summary: 'Several jobs at once: name, percentage, bar and a status line each.' },
  { id: 'spinner', name: 'Spinner', group: 'feedback', summary: 'Busy indicator in three sizes.' },
  { id: 'skeleton', name: 'Skeleton', group: 'feedback', summary: 'Shimmering placeholders while loading.' },
  { id: 'badge', name: 'Badge', group: 'feedback', summary: 'Small label or count: default, beta, success, warning, error.' },
  { id: 'status', name: 'Status', group: 'feedback', summary: 'Status dot with label (connected, untested, error) and the LIVE badge.' },
  { id: 'empty-state', name: 'Empty state', group: 'feedback', summary: 'Nothing here yet, with one action; and not-found.' },
  { id: 'notices', name: 'Notices', group: 'feedback', summary: 'Permission explainer, capability notice, dismissible tip.' },
  { id: 'recording-pill', name: 'Recording pill', group: 'feedback', summary: 'Floating recording status with timer and live waveform.' },
  { id: 'voice-bar', name: 'Voice bar', group: 'feedback', summary: 'Stands in for the composer during a voice conversation (animated mosaic) or dictation (live waveform).' },
  { id: 'card', name: 'Card', group: 'data-display', summary: 'Outlined panel: flat, raised or glow; header, body, footer; pressable.' },
  { id: 'list', name: 'List', group: 'data-display', summary: 'Settings sections and rows, rich list items.' },
  { id: 'tiles', name: 'Tiles', group: 'data-display', summary: 'Stat tiles, action tiles, list cards, hero card, icon badge.' },
  { id: 'avatar', name: 'Avatar', group: 'data-display', summary: 'Photo or initials in sizes, supporter ring, stacked groups.' },
  { id: 'accordion', name: 'Accordion', group: 'data-display', summary: 'Collapsible sections, one or many open.' },
  { id: 'tree', name: 'Tree', group: 'data-display', summary: 'Expandable hierarchy with optional checkboxes.' },
  { id: 'data-table', name: 'Data table', group: 'data-display', summary: 'Sortable, selectable, sticky, dense, resizable columns.' },
  { id: 'property-list', name: 'Property list', group: 'data-display', summary: 'Label / value rows for inspectors and details.' },
  { id: 'carousel', name: 'Carousel', group: 'data-display', summary: 'Horizontal row of cards that scrolls and snaps; one card and a peek of the next on phones.' },
  { id: 'timeline', name: 'Timeline', group: 'data-display', summary: 'Activity feed and journey milestones.' },
  { id: 'qr-code', name: 'QR code', group: 'data-display', summary: 'QR code for links and pairing.' },
  { id: 'forecast-strip', name: 'Forecast strip', group: 'data-display', summary: 'Horizontal strip of readings with within/outside states.' },
  { id: 'media-list', name: 'Media list', group: 'data-display', summary: 'Songs, episodes and films: thumbnail, title, subtitle and meta, pressable rows.' },
  { id: 'sparkline', name: 'Sparkline', group: 'charts', summary: 'Trend line with gaps and a last-value dot.' },
  { id: 'trend', name: 'Trend', group: 'charts', summary: 'A reading over time: big latest value, sparkline and range.' },
  { id: 'bar-chart', name: 'Bar chart', group: 'charts', summary: 'Small column chart with labels.' },
  { id: 'month-grid', name: 'Month heat grid', group: 'charts', summary: 'Calendar heat map with legend.' },
  { id: 'meter', name: 'Meter', group: 'charts', summary: 'Segmented LED meter: level or bars.' },
  { id: 'level-meter', name: 'Level meter', group: 'charts', summary: 'Audio level with peak hold, horizontal or vertical.' },
  { id: 'waveform', name: 'Waveform', group: 'charts', summary: 'Audio waveform in five styles with playhead and selection.' },
  { id: 'histogram', name: 'Histogram', group: 'charts', summary: 'Luminance / RGB histogram.' },
  { id: 'curves-editor', name: 'Curves editor', group: 'charts', summary: 'Tone curve with draggable points over a histogram.' },
  { id: 'media-timeline', name: 'Media timeline', group: 'media', summary: 'Tracks, clips, ruler, playhead, snapping and zoom.' },
  { id: 'transport', name: 'Transport', group: 'media', summary: 'Play, step, loop and timecode.' },
  { id: 'layers-panel', name: 'Layers panel', group: 'media', summary: 'Layers with visibility, lock, thumbnails, groups and reorder.' },
  { id: 'zoom-control', name: 'Zoom control', group: 'media', summary: '− / preset / + zoom with fit.' },
  { id: 'transform-fields', name: 'Transform fields', group: 'media', summary: 'X, Y, W, H, angle with a reference-point grid.' },
  { id: 'inspector', name: 'Inspector', group: 'media', summary: 'Collapsible parameter sections with sliders and keyframe toggles.' },
  { id: 'compare-slider', name: 'Compare slider', group: 'media', summary: 'Before / after split with a draggable divider.' },
  { id: 'zoomable-image', name: 'Zoomable image', group: 'media', summary: 'Pinch, wheel, pan and double-tap zoom.' },
  { id: 'map', name: 'Map', group: 'media', summary: 'Map controls and compass.' },
  { id: 'geo-map', name: 'Geo map', group: 'media', summary: 'Drawn map of places, areas and routes from coordinates; tile background optional.' },
  { id: 'screen', name: 'Screen', group: 'layout', summary: 'Page shell with background glow, safe areas and a centred column.' },
  { id: 'stack', name: 'Stack & grid', group: 'layout', summary: 'Stack, row and responsive card grid.' },
  { id: 'split-pane', name: 'Split pane', group: 'layout', summary: 'Resizable, collapsible panes.' },
  { id: 'panel', name: 'Panel', group: 'layout', summary: 'Titled tool panel and settings section, collapsible.' },
  { id: 'panel-group', name: 'Panel group', group: 'layout', summary: 'Tabbed dock of panels.' },
  { id: 'scroll-panel', name: 'Scroll panel', group: 'layout', summary: 'Fixed-height scrolling region with themed scrollbar.' },
  { id: 'toolbar', name: 'Toolbar', group: 'layout', summary: 'Horizontal toolbar and vertical tool rail.' },
  { id: 'status-bar', name: 'Status bar', group: 'layout', summary: 'Bottom bar with status items.' },
  { id: 'app-shell', name: 'App shell', group: 'layout', summary: 'Title bar with actions and the app frame.' },
  { id: 'reorderable-list', name: 'Reorderable list', group: 'layout', summary: 'Drag to reorder.' },
  { id: 'swipe-row', name: 'Swipe row', group: 'layout', summary: 'Swipe to reveal actions (accessibility actions on the web).' },
  { id: 'onboarding', name: 'Onboarding', group: 'layout', summary: 'Step-by-step intro.' },
  { id: 'control-card', name: 'Control card', group: 'home', summary: 'Frame for one controllable thing: icon badge, title, state, a trailing control, media and body slots.' },
  { id: 'thermostat', name: 'Thermostat', group: 'home', summary: 'Target temperature or range with − / +, current reading, mode and what it is doing.' },
  { id: 'light-control', name: 'Light control', group: 'home', summary: 'On/off, brightness, colour temperature and hue sliders that commit on release.' },
  { id: 'position-control', name: 'Position control', group: 'home', summary: 'Open, stop, close and a position slider for blinds, gates, doors and valves.' },
  { id: 'lock-control', name: 'Lock control', group: 'home', summary: 'Lock, unlock and unlatch with an inline confirm step and a jammed alert.' },
  { id: 'media-player', name: 'Media player', group: 'home', summary: 'Art (a thumbnail, or a full-width banner while playing), title and artist, the transport buttons a player allows, a progress line and volume.' },
  { id: 'camera-tile', name: 'Camera tile', group: 'home', summary: 'A still picture that refreshes on a timer, with a name, status line and placeholder.' },
  { id: 'weather-now', name: 'Weather now', group: 'home', summary: 'Current condition icon, temperature, words and a detail line; a generic condition vocabulary.' },
  { id: 'agenda', name: 'Agenda', group: 'home', summary: 'Upcoming calendar events grouped by day: all-day chips, timed rows with a colour bar.' },
  { id: 'fan-control', name: 'Fan control', group: 'home', summary: 'Speed steps or a percentage, oscillation, direction and preset modes for a fan.' },
  { id: 'humidity-control', name: 'Humidity control', group: 'home', summary: 'Target humidity with − / +, the current reading, a mode and whether it is running, for humidifiers and dehumidifiers.' },
  { id: 'air-quality', name: 'Air quality', group: 'home', summary: 'A reading (CO₂, particles, VOC) on a good-to-poor band with its level word and a short trend.' },
  { id: 'schedule-editor', name: 'Schedule editor', group: 'home', summary: 'A week of time blocks, each with a value (a temperature, on or off), drawn as rows you drag to shape.' },
  { id: 'energy-flow', name: 'Energy flow', group: 'home', summary: 'Solar, grid, battery and home as nodes with animated flows sized by power, and import or export direction.' },
  { id: 'price-strip', name: 'Price strip', group: 'home', summary: 'Hourly energy prices as columns with the current hour marked and the cheapest window highlighted.' },
  { id: 'charge-card', name: 'Charge card', group: 'home', summary: 'A battery or vehicle charge: level ring, charging rate, time to full, limit and plug state.' },
  { id: 'usage-comparison', name: 'Usage comparison', group: 'home', summary: 'This period against the last (today and yesterday, this week and last) by hour or day, with the difference.' },
  { id: 'alarm-panel', name: 'Alarm panel', group: 'home', summary: 'Arm modes, a keypad with masked code entry, arming and entry countdowns, and a triggered state.' },
  { id: 'doorbell', name: 'Doorbell', group: 'home', summary: 'A ring that takes over the screen: live picture, who rang and when, and Answer, Talk and Dismiss.' },
  { id: 'people-strip', name: 'People strip', group: 'home', summary: 'People and their whereabouts (home, away, a zone) as avatars with how long they have been there.' },
  { id: 'openings-summary', name: 'Openings summary', group: 'home', summary: 'Open doors and windows counted and listed, with a warning tone when something should be shut.' },
  { id: 'hazard-banner', name: 'Hazard banner', group: 'home', summary: 'An unmissable alert for smoke, carbon monoxide, leaks or heat: where, since when, and what to do.' },
  { id: 'connection-status', name: 'Connection status', group: 'home', summary: 'Connected, reconnecting with a retry countdown, and offline states for a screen that talks to a home server.' },
  { id: 'device-setup', name: 'Device setup', group: 'home', summary: 'Pairing a screen with a home server: server address, access token entry or a QR code to scan, and a test step.' },
  { id: 'room-card', name: 'Room card', group: 'home', summary: 'One room at a glance: temperature and humidity, lights on, open windows, and quick toggles.' },
  { id: 'scene-grid', name: 'Scene grid', group: 'home', summary: 'Large tiles that set a scene, with the active scene marked and a brief applied state.' },
  { id: 'light-group', name: 'Light group', group: 'home', summary: 'A master switch and brightness for a group of lights that expands to each member.' },
  { id: 'floor-plan', name: 'Floor plan', group: 'home', summary: 'A plan of rooms as shapes you can tap, coloured or lit by their state, with markers for devices.' },
  { id: 'vacuum-control', name: 'Vacuum control', group: 'home', summary: 'A robot cleaner: status, battery, start, pause, return to dock, and the rooms to clean.' },
  { id: 'appliance-cycle', name: 'Appliance cycle', group: 'home', summary: 'A washing machine or dishwasher programme: stage, time left, progress, and a finished state.' },
  { id: 'irrigation-zones', name: 'Irrigation zones', group: 'home', summary: 'Watering zones with durations, the zone running now, the next run, and a skip for rain.' },
  { id: 'timer', name: 'Timer', group: 'home', summary: 'Named countdowns, several at once: time left, pause, add a minute, cancel, and a finished alert.' },
  { id: 'speaker-selector', name: 'Speaker selector', group: 'home', summary: 'Rooms and speakers to send playback to and group together, each with its own volume.' },
  { id: 'tv-remote', name: 'TV remote', group: 'home', summary: 'A direction pad with OK, back and home, volume and channel rockers, and input or app buttons.' },
  { id: 'up-next', name: 'Up next', group: 'home', summary: 'The queue after the current track or episode: art, titles, play now and remove.' },
  { id: 'voice-ring', name: 'Voice ring', group: 'home', summary: 'A large ring for a voice satellite: idle, listening (follows the level), thinking, speaking, muted and error.' },
  { id: 'assist-reply', name: 'Assist reply', group: 'home', summary: 'What the voice assistant understood and did, with the things it changed and an undo.' },
  { id: 'notification-centre', name: 'Notification centre', group: 'home', summary: 'Notifications with actions, grouped and dismissible, critical ones pinned on top.' },
  { id: 'ambient-clock', name: 'Ambient clock', group: 'home', summary: 'A screensaver for wall and bedside screens: large clock, date, next event and weather, dimmed at night.' },
  { id: 'state-timeline', name: 'State timeline', group: 'home', summary: 'When things were on, open or present over a day, as bars on a shared time axis.' },
  { id: 'activity-feed', name: 'Activity feed', group: 'home', summary: 'What happened in the home, newest first: icon, what changed, by what, and how long ago.' },
  { id: 'departures-board', name: 'Departures board', group: 'home', summary: 'Next departures from a stop: line, destination, minutes to go, and delays or cancellations.' },
  { id: 'todo-list', name: 'To-do list', group: 'home', summary: 'A shared list (to-do or shopping): add, check off, reorder, and clear the completed items.' },
];

/** The entries the web renderer (and its React bindings) has built (src/ready/<group>.ts). Each has a story in the explorer. */
export const WEB_READY: ReadonlySet<string> = new Set(WEB_READY_IDS);

export function catalogEntry(id: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.id === id);
}
