import CryptoJS from 'crypto-js';

export function numberToWordArray(counter: number): CryptoJS.lib.WordArray {
  const hexCounter = counter.toString(16).padStart(16, '0');
  return CryptoJS.enc.Hex.parse(hexCounter);
}

export function wordArrayToBytes(wordArray: CryptoJS.lib.WordArray): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < wordArray.sigBytes; i++) {
    bytes.push((wordArray.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff);
  }
  return bytes;
}
