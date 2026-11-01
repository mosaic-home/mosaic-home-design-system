// Design tokens: renderer-agnostic. Colours are '#rrggbb' strings with separate 0..1 alphas,
// dimensions are dp (CSS px on the web). Every renderer (the web renderer here, React bindings,
// the LVGL kit in mosaic-home-design-system-lvgl) resolves the same values.

export type Hex = `#${string}`;

/** The six categorical series colours used by charts, in order of use. */
export type Series = readonly [Hex, Hex, Hex, Hex, Hex, Hex];

/** Colour roles. General-purpose: nothing here names a particular kind of app. */
export interface Palette {
  /** Canvas: a vertical gradient with an optional radial glow. */
  canvasTop: Hex;
  /** Bottom of the canvas gradient; also the deepest ground (status bars, behind media). */
  canvasBottom: Hex;
  /** Ambient glow tint behind the canvas. */
  glow: Hex;
  glowAlpha: number;
  /** Cards and panels. */
  surface: Hex;
  surfaceAlpha: number;
  /** Chips, buttons and tiles on cards. */
  surfaceRaised: Hex;
  surfacePressed: Hex;
  /** Inset fields and wells, a step below `surface`. */
  input: Hex;
  /** Hairline borders. */
  outline: Hex;
  outlineAlpha: number;
  /** Rules between rows. */
  divider: Hex;
  /** Headings, a step stronger than `text`. */
  heading: Hex;
  text: Hex;
  textMuted: Hex;
  textFaint: Hex;
  /** Primary actions, selection, focus. */
  accent: Hex;
  /** Ink on accent fills. */
  onAccent: Hex;
  /** Accent text and icons on dark grounds, hover. */
  accentLight: Hex;
  /** Pressed accent, gradients. */
  accentDark: Hex;
  focus: Hex;
  /** Selected rows and text. Solid; renderers draw it translucent. */
  selection: Hex;
  success: Hex;
  info: Hex;
  warning: Hex;
  danger: Hex;
  /** Ink on success / warning / danger fills. */
  onStatus: Hex;
  series: Series;
  scrim: Hex;
  scrimAlpha: number;
}

/** Corner language: from no radius at all to pills; `mosaic` is generous card radii per device class with pill controls. */
export type Corners = 'square' | 'crisp' | 'soft' | 'round' | 'pill' | 'mosaic';
/** How tightly controls pack: spacing and control heights scale with it. */
export type Density = 'compact' | 'regular' | 'comfortable';
/** How surfaces lift off the canvas: a soft shadow, a halo in the accent, or nothing. */
export type Depth = 'shadow' | 'glow' | 'flat';

/** A theme's character: everything about its look that isn't a colour. */
export interface Character {
  corners: Corners;
  density: Density;
  depth: Depth;
  /** 0..1: strength of halos when `depth` is `glow`. */
  glow: number;
  /** Outline width in dp (1..3). */
  outline: number;
  /** Canvas gradient and radial glow behind everything. */
  backdrop: boolean;
  /** Panels drawn as solid outlines over the canvas. */
  outlined: boolean;
}

export interface Theme {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dark: boolean;
  /** Solid surfaces, solid outlines on everything interactive, a stronger focus ring; text keeps >= 7:1. */
  readonly highContrast: boolean;
  readonly palette: Palette;
  readonly character: Character;
}

/** Broad device classes. They set the type scale, radii and spacing; layout always works from the real screen. */
export type DeviceClass = 'wearable' | 'phone' | 'tablet' | 'tv';

export type TextRole = 'display' | 'headline' | 'title' | 'body' | 'label' | 'caption';

export type TypeScale = Record<TextRole, number>;

export interface Spacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Radii {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
  /** Buttons, chips and segments are pills; otherwise they take `md` corners. */
  pillControls: boolean;
}

export interface Motion {
  fast: number;
  normal: number;
  slow: number;
  reflow: number;
  enter: number;
  exit: number;
  stagger: number;
  overlay: number;
}

export interface Elevation {
  /** Shadow blur, dp. */
  blur: number;
  /** Vertical offset, dp. */
  offsetY: number;
  /** 0..1. */
  alpha: number;
}

export interface ControlHeights {
  sm: number;
  md: number;
  lg: number;
}

export interface Typeface {
  sans: string;
  mono: string;
  serif: string;
}

/** Everything a renderer needs: a theme resolved for one device class. */
export interface Tokens {
  readonly theme: Theme;
  readonly deviceClass: DeviceClass;
  readonly type: TypeScale;
  readonly space: Spacing;
  readonly radius: Radii;
  readonly motion: Motion;
  /** Levels 0..3; level 0 is always none. */
  readonly elevation: readonly [Elevation, Elevation, Elevation, Elevation];
  /** Spacing is multiplied by this; control heights by half as much. */
  readonly density: number;
  readonly control: ControlHeights;
  readonly typeface: Typeface;
}
