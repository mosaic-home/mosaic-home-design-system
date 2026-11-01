import { describe, expect, it } from 'vitest';
import { createQrCode, qrCodeClass, qrCodeExtent, qrCodePath } from './qrCode.ts';
import {
  encodeQr,
  gfExp,
  gfMul,
  qrAlignmentPositions,
  qrBlockLayout,
  qrByteCapacity,
  qrDataPositions,
  qrFormatBits,
  qrFunctionGrid,
  qrMaskBit,
  qrPenalty,
  qrTotalCodewords,
  qrVersionBits,
  rsRemainder,
  type QrEcc,
  type QrMatrix,
} from './qrEncode.ts';

const LEVELS: readonly QrEcc[] = ['L', 'M', 'Q', 'H'];

/** Reads the first format copy (around the top-left finder) as a 15-bit number. */
function readFormat(m: boolean[][]): number {
  let bits = 0;
  for (let i = 0; i < 15; i++) {
    const v = i < 6 ? m[i]![8] : i === 6 ? m[7]![8] : i === 7 ? m[8]![8] : i === 8 ? m[8]![7] : m[8]![14 - i];
    if (v) bits |= 1 << i;
  }
  return bits;
}

function readFormatCopy2(m: boolean[][]): number {
  const size = m.length;
  let bits = 0;
  for (let i = 0; i < 15; i++) if (i < 8 ? m[8]![size - 1 - i] : m[size - 15 + i]![8]) bits |= 1 << i;
  return bits;
}

const popcount = (n: number): number => n.toString(2).replaceAll('0', '').length;

/** A minimal decoder: format by nearest valid code word, unmask, de-interleave, check Reed–Solomon, read byte mode. */
function decode(m: boolean[][]): { text: string; ecc: QrEcc; mask: number; version: number } {
  const size = m.length;
  const version = (size - 17) / 4;
  const raw = readFormat(m);
  let best = { ecc: 'M' as QrEcc, mask: 0, distance: 99 };
  for (const ecc of LEVELS) for (let mask = 0; mask < 8; mask++) {
    const distance = popcount(qrFormatBits(ecc, mask) ^ raw);
    if (distance < best.distance) best = { ecc, mask, distance };
  }
  expect(best.distance).toBe(0);
  const { ecc, mask } = best;
  const { reserved } = qrFunctionGrid(version);
  const bits = qrDataPositions(version, reserved).map(([r, c]) => (m[r]![c]! !== qrMaskBit(mask, r, c) ? 1 : 0));
  const total = qrTotalCodewords(version);
  const codewords: number[] = [];
  for (let i = 0; i < total; i++) codewords.push(bits.slice(i * 8, i * 8 + 8).reduce((a: number, b) => (a << 1) | b, 0));
  // Every remainder bit after the last codeword is light.
  expect(bits.slice(total * 8).every((b) => b === 0)).toBe(true);

  const layout = qrBlockLayout(version, ecc);
  const blocks = layout.dataPerBlock.map(() => [] as number[]);
  let at = 0;
  const longest = Math.max(...layout.dataPerBlock);
  for (let i = 0; i < longest; i++) layout.dataPerBlock.forEach((n, b) => i < n && blocks[b]!.push(codewords[at++]!));
  for (let i = 0; i < layout.ecPerBlock; i++) blocks.forEach((block) => block.push(codewords[at++]!));
  const data: number[] = [];
  blocks.forEach((block, b) => {
    // A valid code word has zero syndromes: it evaluates to 0 at α^0 … α^(n−1).
    for (let k = 0; k < layout.ecPerBlock; k++) {
      let s = 0;
      for (const c of block) s = gfMul(s, gfExp(k)) ^ c;
      expect(s).toBe(0);
    }
    data.push(...block.slice(0, layout.dataPerBlock[b]));
  });
  const stream = data.flatMap((byte) => Array.from({ length: 8 }, (_, i) => (byte >> (7 - i)) & 1));
  let p = 0;
  const take = (n: number): number => {
    let v = 0;
    for (let i = 0; i < n; i++) v = (v << 1) | stream[p++]!;
    return v;
  };
  expect(take(4)).toBe(0b0100);
  const count = take(version <= 9 ? 8 : 16);
  const bytes = Uint8Array.from({ length: count }, () => take(8));
  return { text: new TextDecoder().decode(bytes), ecc, mask, version };
}

function expectFinder(m: boolean[][], r0: number, c0: number): void {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = r0 + dr;
      const c = c0 + dc;
      if (r < 0 || c < 0 || r >= m.length || c >= m.length) continue;
      const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
      expect(m[r]![c], `finder module ${r},${c}`).toBe(ring !== 2 && ring <= 3);
    }
  }
}

function expectStructure(q: QrMatrix): void {
  const m = q.modules;
  const size = q.size;
  expect(m.length).toBe(size);
  expect(m.every((row) => row.length === size)).toBe(true);
  expectFinder(m, 0, 0);
  expectFinder(m, 0, size - 7);
  expectFinder(m, size - 7, 0);
  for (let i = 8; i < size - 8; i++) {
    expect(m[6]![i]).toBe(i % 2 === 0);
    expect(m[i]![6]).toBe(i % 2 === 0);
  }
  expect(m[size - 8]![8]).toBe(true); // the dark module
  const pos = qrAlignmentPositions(q.version);
  for (const r of pos) for (const c of pos) {
    if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
    expect(m[r]![c]).toBe(true);
    expect(m[r - 1]![c]).toBe(false);
    expect(m[r - 2]![c - 2]).toBe(true);
  }
  expect(readFormat(m)).toBe(qrFormatBits(q.ecc, q.mask));
  expect(readFormatCopy2(m)).toBe(qrFormatBits(q.ecc, q.mask));
  if (q.version >= 7) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < 18; i++) {
      if (m[Math.floor(i / 3)]![size - 11 + (i % 3)]) a |= 1 << i;
      if (m[size - 11 + (i % 3)]![Math.floor(i / 3)]) b |= 1 << i;
    }
    expect(a).toBe(qrVersionBits(q.version));
    expect(b).toBe(qrVersionBits(q.version));
  }
}

describe('QR encoder building blocks', () => {
  it('Reed–Solomon matches the specification example (version 1-M)', () => {
    const data = [0x10, 0x20, 0x0c, 0x56, 0x61, 0x80, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11];
    expect(Array.from(rsRemainder(data, 10))).toEqual([0xa5, 0x24, 0xd4, 0xc1, 0xed, 0x36, 0xc7, 0x87, 0x2c, 0x55]);
  });

  it('format and version information', () => {
    expect(qrFormatBits('M', 0)).toBe(0b101010000010010);
    expect(qrFormatBits('L', 0)).toBe(0b111011111000100);
    expect(qrFormatBits('H', 1)).toBe(0b001001110111110);
    expect(qrFormatBits('H', 7)).toBe(0b000100000111011);
    expect(qrFormatBits('Q', 3)).toBe(0b011101000000110);
    expect(qrVersionBits(7)).toBe(0x07c94);
    expect(qrVersionBits(40)).toBe(0x28c69);
  });

  it('alignment positions and codeword totals', () => {
    expect(qrAlignmentPositions(1)).toEqual([]);
    expect(qrAlignmentPositions(2)).toEqual([6, 18]);
    expect(qrAlignmentPositions(7)).toEqual([6, 22, 38]);
    expect(qrAlignmentPositions(32)).toEqual([6, 34, 60, 86, 112, 138]);
    expect(qrAlignmentPositions(40)).toEqual([6, 30, 58, 86, 114, 142, 170]);
    expect([1, 2, 7, 10, 40].map(qrTotalCodewords)).toEqual([26, 44, 196, 346, 3706]);
    // Byte capacities at the ends of the range.
    expect(LEVELS.map((e) => qrByteCapacity(1, e))).toEqual([17, 14, 11, 7]);
    expect(LEVELS.map((e) => qrByteCapacity(40, e))).toEqual([2953, 2331, 1663, 1273]);
    // Every version and level splits into non-empty blocks that differ by at most one codeword.
    for (let v = 1; v <= 40; v++) for (const e of LEVELS) {
      const { dataPerBlock } = qrBlockLayout(v, e);
      expect(Math.min(...dataPerBlock)).toBeGreaterThan(0);
      expect(Math.max(...dataPerBlock) - Math.min(...dataPerBlock)).toBeLessThanOrEqual(1);
    }
  });

  it('data positions fill exactly the non-function modules', () => {
    for (const v of [1, 6, 7, 21, 40]) {
      const { reserved } = qrFunctionGrid(v);
      const free = reserved.flat().filter((r) => !r).length;
      expect(qrDataPositions(v, reserved).length).toBe(free);
      expect(Math.floor(free / 8)).toBe(qrTotalCodewords(v));
    }
  });
});

describe('encodeQr', () => {
  it('chooses the smallest version and round-trips', () => {
    const q = encodeQr('Hello', { ecc: 'L', boostEcc: false });
    expect(q.version).toBe(1);
    expect(q.size).toBe(21);
    expectStructure(q);
    expect(decode(q.modules)).toMatchObject({ text: 'Hello', ecc: 'L', version: 1, mask: q.mask });
  });

  it('round-trips links, UTF-8 and long text across versions and levels', () => {
    const cases: [string, QrEcc][] = [
      ['https://homeassistant.local:8123/lovelace/0', 'M'],
      ['WIFI:T:WPA;S:Guest network;P:correct horse battery;;', 'Q'],
      ['Grüße aus dem Wohnzimmer · 21.5 °C', 'H'],
      ['x'.repeat(300), 'M'],
      ['Lanterns over the quay. '.repeat(40), 'L'],
    ];
    for (const [text, ecc] of cases) {
      const q = encodeQr(text, { ecc, boostEcc: false });
      expectStructure(q);
      expect(decode(q.modules).text).toBe(text);
      expect(q.ecc).toBe(ecc);
    }
    expect(encodeQr('x'.repeat(300), { ecc: 'M' }).version).toBeGreaterThanOrEqual(10);
  });

  it('every forced mask decodes, and the automatic one has the lowest penalty', () => {
    const scores: number[] = [];
    for (let mask = 0; mask < 8; mask++) {
      const q = encodeQr('Living room display', { ecc: 'M', mask, boostEcc: false });
      expect(decode(q.modules).mask).toBe(mask);
      scores.push(qrPenalty(q.modules));
    }
    const auto = encodeQr('Living room display', { ecc: 'M', boostEcc: false });
    expect(qrPenalty(auto.modules)).toBe(Math.min(...scores));
  });

  it('boosts the level when it fits in the same version, honours minVersion, rejects oversize text', () => {
    const q = encodeQr('Hi');
    expect(q.version).toBe(1);
    expect(q.ecc).toBe('H');
    expect(encodeQr('Hi', { minVersion: 5 }).version).toBe(5);
    expect(() => encodeQr('x'.repeat(3000), { ecc: 'L' })).toThrow(RangeError);
  });

  it('penalty counts runs, blocks, finder-like patterns and balance', () => {
    const allLight = Array.from({ length: 21 }, () => new Array<boolean>(21).fill(false));
    // Runs: 2 × 21 lines of 21 → 21 × 2 × (3 + 16); blocks: 20 × 20 × 3; balance: 0 % dark → 100 points.
    expect(qrPenalty(allLight)).toBe(42 * 19 + 1200 + 100);
  });
});

describe('qr-code', () => {
  it('renders an SVG with a plate, module path and quiet zone', () => {
    const qr = createQrCode({ value: 'https://example.com/pair', label: 'Pair this display', caption: 'Scan with your phone', size: 'large' });
    expect(qr.el.tagName).toBe('FIGURE');
    expect(qr.el.className).toBe(qrCodeClass('large'));
    expect(qr.el.className).toBe('mh-qr-code mh-qr-code--lg');
    const svg = qr.el.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Pair this display');
    const m = qr.matrix();
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${m.size + 8} ${m.size + 8}`);
    expect(svg.querySelector('.mh-qr-code__plate')!.getAttribute('width')).toBe(String(qrCodeExtent(m)));
    expect(svg.querySelector('.mh-qr-code__modules')!.getAttribute('d')).toBe(qrCodePath(m));
    expect(qr.el.querySelector('figcaption')!.textContent).toBe('Scan with your phone');
    // The top-left finder's first row is one 7-module run, offset by the quiet zone.
    expect(qrCodePath(m).startsWith('M4 4h7v1h-7z')).toBe(true);
  });

  it('updates the value and survives text that is too long', () => {
    const qr = createQrCode({ value: 'a', quietZone: 2 });
    const before = qr.el.querySelector('path')!.getAttribute('d');
    qr.setValue('https://example.com/a/much/longer/link/that/needs/a/bigger/version');
    expect(qr.el.querySelector('path')!.getAttribute('d')).not.toBe(before);
    expect(qr.matrix().version).toBeGreaterThan(1);
    expect(decode(qr.matrix().modules).text).toBe('https://example.com/a/much/longer/link/that/needs/a/bigger/version');
    qr.setValue('x'.repeat(5000));
    expect(qr.matrix().version).toBe(1);
  });
});
