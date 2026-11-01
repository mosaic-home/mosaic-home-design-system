import { cx, h } from '../dom.ts';
import { encodeQr, type QrEcc, type QrMatrix } from './qrEncode.ts';

const SVG_NS = 'http://www.w3.org/2000/svg';

export type QrCodeSize = 'small' | 'medium' | 'large';

export interface QrCodeOptions {
  /** The text or link to encode (UTF-8, byte mode). */
  value: string;
  /** Accessible name ("Link to the guest Wi-Fi page"). Default "QR code". */
  label?: string;
  /** A visible line under the code ("Scan with your phone"). */
  caption?: string;
  /** Error correction level; default `M`. Use `H` when part of the code may be covered or worn. */
  ecc?: QrEcc;
  /** Default `medium`; sizes follow the device class. */
  size?: QrCodeSize;
  /** Light modules around the code, in modules; default 4 (the spec's minimum). */
  quietZone?: number;
}

export interface QrCodeHandle {
  el: HTMLElement;
  setValue(value: string): void;
  /** The encoded matrix (version, level, mask, modules). */
  matrix(): QrMatrix;
}

export function qrCodeClass(size: QrCodeSize = 'medium'): string {
  return cx('mh-qr-code', size !== 'medium' && `mh-qr-code--${size === 'small' ? 'sm' : 'lg'}`);
}

/**
 * SVG path data for the dark modules: one rectangle per horizontal run, offset by the quiet zone. Shared with the
 * React binding so both draw the same path.
 */
export function qrCodePath(matrix: QrMatrix, quietZone = 4): string {
  const parts: string[] = [];
  matrix.modules.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      if (!row[c]) {
        c++;
        continue;
      }
      const start = c;
      while (c < row.length && row[c]) c++;
      parts.push(`M${start + quietZone} ${r + quietZone}h${c - start}v1h${start - c}z`);
    }
  });
  return parts.join('');
}

/** The viewBox side: modules plus the quiet zone on both sides. */
export const qrCodeExtent = (matrix: QrMatrix, quietZone = 4): number => matrix.size + 2 * quietZone;

/** Encodes, falling back to an empty version-1 code for text that doesn't fit, so a bad value never throws in a render. */
export function qrCodeMatrix(value: string, ecc: QrEcc = 'M'): QrMatrix {
  try {
    return encodeQr(value, { ecc });
  } catch {
    return encodeQr('', { ecc });
  }
}

function setSvg(svg: SVGSVGElement, matrix: QrMatrix, quietZone: number): void {
  const extent = qrCodeExtent(matrix, quietZone);
  svg.setAttribute('viewBox', `0 0 ${extent} ${extent}`);
  const plate = document.createElementNS(SVG_NS, 'rect');
  plate.setAttribute('class', 'mh-qr-code__plate');
  plate.setAttribute('width', String(extent));
  plate.setAttribute('height', String(extent));
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('class', 'mh-qr-code__modules');
  path.setAttribute('d', qrCodePath(matrix, quietZone));
  svg.replaceChildren(plate, path);
}

/**
 * `figure.mh-qr-code` (`--sm | --lg`): a QR code as an SVG (`role="img"`, named by `label`) with a
 * `.mh-qr-code__plate` and `.mh-qr-code__modules`, and an optional `figcaption.mh-qr-code__caption`. The code is
 * always dark ink on a light plate, taken from the theme's text and surface colours, so cameras read it in dark
 * themes too; the quiet zone is part of the plate.
 */
export function createQrCode(options: QrCodeOptions): QrCodeHandle {
  const quietZone = Math.max(0, Math.floor(options.quietZone ?? 4));
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'mh-qr-code__svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', options.label ?? 'QR code');
  svg.setAttribute('shape-rendering', 'crispEdges');
  const el = h('figure', { class: qrCodeClass(options.size) }, svg, options.caption ? h('figcaption', { class: 'mh-qr-code__caption' }, options.caption) : null);
  let matrix = qrCodeMatrix(options.value, options.ecc);
  setSvg(svg, matrix, quietZone);
  return {
    el,
    setValue(value) {
      matrix = qrCodeMatrix(value, options.ecc);
      setSvg(svg, matrix, quietZone);
    },
    matrix: () => matrix,
  };
}
