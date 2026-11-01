// QR code model 2 encoder, written from the public QR code specification (ISO/IEC 18004): byte mode (UTF-8),
// four error correction levels, Reed–Solomon over GF(256), block interleaving, the eight data masks chosen by
// penalty score, and the smallest version (1–40) that holds the data. No DOM.

export type QrEcc = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  /** Error correction level: L ~7 %, M ~15 % (default), Q ~25 %, H ~30 % of codewords can be restored. */
  ecc?: QrEcc;
  /** Smallest version to use (1–40); default 1. */
  minVersion?: number;
  /** Force a mask pattern (0–7) instead of choosing the lowest penalty. */
  mask?: number;
  /** Use a higher error correction level when it fits in the same version (default true). */
  boostEcc?: boolean;
}

export interface QrMatrix {
  version: number;
  ecc: QrEcc;
  mask: number;
  /** Modules per side: 17 + 4 × version. */
  size: number;
  /** `modules[row][column]`, true for dark. */
  modules: boolean[][];
}

const ECC_ORDER: readonly QrEcc[] = ['L', 'M', 'Q', 'H'];
/** Two-bit level indicator in the format information. */
export const QR_ECC_BITS: Record<QrEcc, number> = { L: 1, M: 0, Q: 3, H: 2 };

// Error correction codewords per block and number of blocks, versions 1–40 (the spec's table of error correction
// characteristics). Data codewords follow: the total codewords of a version minus the error correction ones, shared
// out so that later blocks carry one more data codeword when the division isn't even.
const EC_PER_BLOCK: Record<QrEcc, readonly number[]> = {
  L: [7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const BLOCKS: Record<QrEcc, readonly number[]> = {
  L: [1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};

/** Modules per side. */
export const qrSize = (version: number): number => 17 + 4 * version;

/** Centre coordinates of the alignment patterns on each axis: 6, evenly spaced (even steps) up to size − 7. */
export function qrAlignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const count = Math.floor(version / 7) + 2;
  const last = qrSize(version) - 7;
  // The spacing is even and the same between all inner patterns; any slack goes to the first gap.
  const step = version === 32 ? 26 : Math.ceil((last - 6) / (count - 1) / 2) * 2;
  const out = [6];
  for (let i = count - 2; i >= 0; i--) out.push(last - i * step);
  return out;
}

/** Modules left for data and error correction after the function patterns, format and version areas. */
export function qrRawModules(version: number): number {
  const size = qrSize(version);
  let n = size * size;
  n -= 3 * 64; // finders with separators
  n -= 2 * (size - 16); // timing patterns between the separators
  const a = qrAlignmentPositions(version).length;
  if (a > 0) {
    n -= (a * a - 3) * 25; // alignment patterns, minus the three corners under the finders
    n += (a - 2) * 2 * 5; // the ones on the timing lines were counted twice
  }
  n -= 31; // format information (2 × 15) and the dark module
  if (version >= 7) n -= 36; // version information (2 × 18)
  return n;
}

/** Total codewords of a version (data plus error correction). */
export const qrTotalCodewords = (version: number): number => Math.floor(qrRawModules(version) / 8);

export interface QrBlockLayout {
  ecPerBlock: number;
  /** Data codewords of each block, in order. */
  dataPerBlock: number[];
  dataCodewords: number;
}

export function qrBlockLayout(version: number, ecc: QrEcc): QrBlockLayout {
  const blocks = BLOCKS[ecc][version - 1]!;
  const ecPerBlock = EC_PER_BLOCK[ecc][version - 1]!;
  const dataCodewords = qrTotalCodewords(version) - blocks * ecPerBlock;
  const short = Math.floor(dataCodewords / blocks);
  const longCount = dataCodewords % blocks;
  const dataPerBlock = Array.from({ length: blocks }, (_, i) => (i >= blocks - longCount ? short + 1 : short));
  return { ecPerBlock, dataPerBlock, dataCodewords };
}

// GF(256) with the primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 ---------------------------------------------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]!;
}

export function gfMul(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : EXP[LOG[a]! + LOG[b]!]!;
}

/** Exponent table of GF(256): `gfExp(i)` is α^i. */
export const gfExp = (i: number): number => EXP[((i % 255) + 255) % 255]!;

/** Generator polynomial ∏ (x − α^i), i < degree; coefficients from the highest power down, leading 1 dropped. */
function rsGenerator(degree: number): Uint8Array {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] = next[j]! ^ poly[j]!;
      next[j + 1] = next[j + 1]! ^ gfMul(poly[j]!, EXP[i]!);
    }
    poly = next;
  }
  return Uint8Array.from(poly.slice(1));
}

/** Reed–Solomon error correction codewords: the remainder of data · x^n divided by the generator. */
export function rsRemainder(data: ArrayLike<number>, degree: number): Uint8Array {
  const gen = rsGenerator(degree);
  const rem = new Uint8Array(degree);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i]! ^ rem[0]!;
    rem.copyWithin(0, 1);
    rem[degree - 1] = 0;
    for (let j = 0; j < degree; j++) rem[j] = rem[j]! ^ gfMul(gen[j]!, factor);
  }
  return rem;
}

// BCH codes for the format and version information ----------------------------------------------------------

function bchRemainder(value: number, generator: number, bits: number): number {
  let rem = value << bits;
  const top = 31 - Math.clz32(generator);
  for (let bit = 31 - Math.clz32(rem); bit >= top; bit--) if (rem & (1 << bit)) rem ^= generator << (bit - top);
  return rem;
}

/** The 15 format bits: level and mask, BCH(15,5) with generator 0x537, XORed with 0x5412. */
export function qrFormatBits(ecc: QrEcc, mask: number): number {
  const data = (QR_ECC_BITS[ecc] << 3) | mask;
  return ((data << 10) | bchRemainder(data, 0x537, 10)) ^ 0x5412;
}

/** The 18 version bits (versions 7–40): version number, BCH(18,6) with generator 0x1F25. */
export function qrVersionBits(version: number): number {
  return (version << 12) | bchRemainder(version, 0x1f25, 12);
}

// Data -------------------------------------------------------------------------------------------------------

/** Bits needed for the byte-mode payload: mode, count and 8 per byte. */
const payloadBits = (bytes: number, version: number): number => 4 + (version <= 9 ? 8 : 16) + 8 * bytes;

/** Data codewords: mode 0100, character count, the bytes, terminator, padding to a byte, then 0xEC 0x11. */
export function qrDataCodewords(bytes: Uint8Array, version: number, ecc: QrEcc): Uint8Array {
  const capacity = qrBlockLayout(version, ecc).dataCodewords;
  const bits: number[] = [];
  const put = (value: number, length: number): void => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  put(0b0100, 4);
  put(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  put(0, Math.min(4, capacity * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const out = new Uint8Array(capacity);
  for (let i = 0; i < bits.length / 8; i++) {
    let v = 0;
    for (let j = 0; j < 8; j++) v = (v << 1) | bits[i * 8 + j]!;
    out[i] = v;
  }
  for (let i = bits.length / 8, pad = 0; i < capacity; i++, pad++) out[i] = pad % 2 === 0 ? 0xec : 0x11;
  return out;
}

/** Splits data into blocks, adds error correction to each and interleaves: data column by column, then EC. */
export function qrInterleave(data: Uint8Array, version: number, ecc: QrEcc): Uint8Array {
  const layout = qrBlockLayout(version, ecc);
  const blocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let at = 0;
  for (const n of layout.dataPerBlock) {
    const block = data.subarray(at, at + n);
    at += n;
    blocks.push(block);
    ecBlocks.push(rsRemainder(block, layout.ecPerBlock));
  }
  const out: number[] = [];
  const longest = Math.max(...layout.dataPerBlock);
  for (let i = 0; i < longest; i++) for (const b of blocks) if (i < b.length) out.push(b[i]!);
  for (let i = 0; i < layout.ecPerBlock; i++) for (const b of ecBlocks) out.push(b[i]!);
  return Uint8Array.from(out);
}

// Matrix -----------------------------------------------------------------------------------------------------

type Grid = Int8Array[]; // -1 unset, 0 light, 1 dark

/** Whether module (row, column) is dark under mask pattern `mask`, before XOR. */
export function qrMaskBit(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

/** Function patterns of a version: `fn[row][col]` set where finders, timing, alignment, format and version live. */
export function qrFunctionGrid(version: number): { grid: Grid; reserved: boolean[][] } {
  const size = qrSize(version);
  const grid: Grid = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
  const reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (r: number, c: number, dark: boolean): void => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    grid[r]![c] = dark ? 1 : 0;
    reserved[r]![c] = true;
  };
  // Finders (7×7 rings around a 3×3 core) with their light separators.
  for (const [r0, c0] of [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ] as const) {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
        set(r0 + dr, c0 + dc, ring !== 2 && ring <= 3);
      }
    }
  }
  // Timing patterns.
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  // Alignment patterns (5×5), except where they would cover a finder.
  const pos = qrAlignmentPositions(version);
  for (const r of pos) {
    for (const c of pos) {
      if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  }
  // Format areas (filled later) and the dark module.
  for (let i = 0; i < 9; i++) {
    reserved[8]![i] = true;
    reserved[i]![8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8]![size - 1 - i] = true;
    reserved[size - 1 - i]![8] = true;
  }
  set(size - 8, 8, true);
  // Version areas.
  if (version >= 7) {
    for (let i = 0; i < 18; i++) {
      reserved[Math.floor(i / 3)]![size - 11 + (i % 3)] = true;
      reserved[size - 11 + (i % 3)]![Math.floor(i / 3)] = true;
    }
  }
  return { grid, reserved };
}

/** The (row, col) of every data module in placement order: two-column strips from the right, zigzagging up and down. */
export function qrDataPositions(version: number, reserved: boolean[][]): [number, number][] {
  const size = qrSize(version);
  const out: [number, number][] = [];
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // the vertical timing column is skipped
    for (let k = 0; k < size; k++) {
      const row = upward ? size - 1 - k : k;
      for (const col of [right, right - 1]) if (!reserved[row]![col]) out.push([row, col]);
    }
    upward = !upward;
  }
  return out;
}

/** Writes the format bits: one copy around the top-left finder, one split between the other two. */
export function qrPlaceFormat(grid: Grid, ecc: QrEcc, mask: number): void {
  const size = grid.length;
  const bits = qrFormatBits(ecc, mask);
  for (let i = 0; i < 15; i++) {
    const dark = ((bits >>> i) & 1) === 1 ? 1 : 0;
    // Top-left: column 8 from the top (bits 0–7, skipping the timing row), then row 8 leftwards (bits 8–14).
    if (i < 6) grid[i]![8] = dark;
    else if (i === 6) grid[7]![8] = dark;
    else if (i === 7) grid[8]![8] = dark;
    else if (i === 8) grid[8]![7] = dark;
    else grid[8]![14 - i] = dark;
    // Second copy: row 8 from the right edge (bits 0–7), column 8 up to the bottom edge (bits 8–14).
    if (i < 8) grid[8]![size - 1 - i] = dark;
    else grid[size - 15 + i]![8] = dark;
  }
}

function placeVersion(grid: Grid, version: number): void {
  if (version < 7) return;
  const size = grid.length;
  const bits = qrVersionBits(version);
  for (let i = 0; i < 18; i++) {
    const dark = ((bits >>> i) & 1) === 1 ? 1 : 0;
    grid[Math.floor(i / 3)]![size - 11 + (i % 3)] = dark;
    grid[size - 11 + (i % 3)]![Math.floor(i / 3)] = dark;
  }
}

/** Penalty score of a finished matrix: runs, 2×2 blocks, finder-like patterns and dark/light balance. */
export function qrPenalty(m: readonly (readonly boolean[])[]): number {
  const size = m.length;
  let score = 0;
  const at = (r: number, c: number, transpose: boolean): boolean => (transpose ? m[c]![r]! : m[r]![c]!);
  for (const transpose of [false, true]) {
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c <= size; c++) {
        if (c < size && at(r, c, transpose) === at(r, c - 1, transpose)) run++;
        else {
          if (run >= 5) score += 3 + (run - 5);
          run = 1;
        }
      }
      // 1:1:3:1:1 dark-light-dark-light-dark with four light modules on one side (light outside the symbol counts).
      const pattern = [true, false, true, true, true, false, true];
      for (let c = 0; c + 7 <= size; c++) {
        let core = true;
        for (let k = 0; k < 7 && core; k++) {
          const cc = c + k;
          core = at(r, cc, transpose) === pattern[k];
        }
        if (!core) continue;
        const lightRun = (from: number): boolean => {
          for (let k = 0; k < 4; k++) {
            const cc = from + k;
            if (cc >= 0 && cc < size && at(r, cc, transpose)) return false;
          }
          return true;
        };
        if (lightRun(c - 4)) score += 40;
        if (lightRun(c + 7)) score += 40;
      }
    }
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r]![c];
      if (m[r]![c + 1] === v && m[r + 1]![c] === v && m[r + 1]![c + 1] === v) score += 3;
    }
  }
  let dark = 0;
  for (const row of m) for (const v of row) if (v) dark++;
  const percent = (dark * 100) / (size * size);
  score += 10 * Math.floor(Math.abs(percent - 50) / 5);
  return score;
}

function buildMatrix(codewords: Uint8Array, version: number, ecc: QrEcc, mask: number): boolean[][] {
  const { grid, reserved } = qrFunctionGrid(version);
  const positions = qrDataPositions(version, reserved);
  positions.forEach(([r, c], i) => {
    const byte = i >> 3;
    const bit = byte < codewords.length ? (codewords[byte]! >>> (7 - (i & 7))) & 1 : 0;
    grid[r]![c] = (bit === 1) !== qrMaskBit(mask, r, c) ? 1 : 0;
  });
  qrPlaceFormat(grid, ecc, mask);
  placeVersion(grid, version);
  return grid.map((row) => Array.from(row, (v) => v === 1));
}

/** Byte capacity of a version and level in byte mode. */
export function qrByteCapacity(version: number, ecc: QrEcc): number {
  const bits = qrBlockLayout(version, ecc).dataCodewords * 8 - 4 - (version <= 9 ? 8 : 16);
  return Math.floor(bits / 8);
}

/**
 * Encodes text (as UTF-8 bytes) into a QR code matrix in the smallest version that fits. Throws a `RangeError`
 * when the text is too long for version 40 at the requested level.
 */
export function encodeQr(text: string | Uint8Array, options: QrOptions = {}): QrMatrix {
  const bytes = typeof text === 'string' ? new TextEncoder().encode(text) : text;
  let ecc = options.ecc ?? 'M';
  let version = Math.max(1, Math.min(40, Math.floor(options.minVersion ?? 1)));
  while (version <= 40 && payloadBits(bytes.length, version) > qrBlockLayout(version, ecc).dataCodewords * 8) version++;
  if (version > 40) throw new RangeError(`QR code: ${bytes.length} bytes don't fit at level ${ecc}`);
  if (options.boostEcc ?? true) {
    for (const next of ECC_ORDER.slice(ECC_ORDER.indexOf(ecc) + 1)) {
      if (payloadBits(bytes.length, version) <= qrBlockLayout(version, next).dataCodewords * 8) ecc = next;
    }
  }
  const codewords = qrInterleave(qrDataCodewords(bytes, version, ecc), version, ecc);
  let best: { mask: number; modules: boolean[][]; score: number } | null = null;
  const masks = options.mask !== undefined ? [options.mask & 7] : [0, 1, 2, 3, 4, 5, 6, 7];
  for (const mask of masks) {
    const modules = buildMatrix(codewords, version, ecc, mask);
    const score = masks.length === 1 ? 0 : qrPenalty(modules);
    if (!best || score < best.score) best = { mask, modules, score };
  }
  return { version, ecc, mask: best!.mask, size: qrSize(version), modules: best!.modules };
}
