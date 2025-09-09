import * as base32 from '@se-oss/base32';
import CryptoJS from 'crypto-js';

import { InvalidAlgorithmError } from './errors';
import type {
  Algorithm,
  Hash,
  HOTPOptions,
  HOTPVerify,
  OTPGeneratorOptions,
  TOTPOptions,
  TOTPVerifyOptions,
} from './typings';
import { numberToWordArray, wordArrayToBytes } from './utils';

/**
 * The OTP class for generating and verifying one-time passwords.
 */
export class OTP {
  readonly #algorithm: Algorithm;
  readonly #digits: number;
  readonly #secret: string;
  #period: number;
  #hash: Hash = CryptoJS.HmacSHA1;

  /**
   * Creates an instance of the OTP class.
   * @param {OTPGeneratorOptions} [options={}] - The options for generating the OTP.
   */
  public constructor(options: OTPGeneratorOptions = {}) {
    this.#algorithm = options.algorithm ?? 'SHA1';
    this.#digits = options.digits ?? 6;
    this.#period = options.period ?? 30;
    this.#secret = options.secret ?? this.generateSecret();

    this.setHash();
  }

  /**
   * The algorithm used for generating the OTP.
   * @type {Algorithm}
   */
  public get algorithm(): Algorithm {
    return this.#algorithm;
  }

  /**
   * The number of digits in the OTP.
   * @type {number}
   */
  public get digits(): number {
    return this.#digits;
  }

  /**
   * The secret used for generating the OTP.
   * @type {string}
   */
  public get secret(): string {
    return this.#secret;
  }

  /**
   * The period in seconds for the OTP.
   * @type {number}
   */
  public get period(): number {
    return this.#period;
  }

  /**
   * Sets the hash function based on the algorithm.
   * @private
   */
  private setHash(): void {
    switch (this.#algorithm) {
      case 'SHA1':
        this.#hash = CryptoJS.HmacSHA1;
        break;
      case 'SHA256':
        this.#hash = CryptoJS.HmacSHA256;
        break;
      case 'SHA512':
        this.#hash = CryptoJS.HmacSHA512;
        break;
      default:
        throw new InvalidAlgorithmError(this.#algorithm);
    }
  }

  /**
   * Generates a random secret.
   * @private
   * @returns {string} The generated secret.
   */
  private generateSecret(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(20);
    const bytes: number[] = [];
    for (let i = 0; i < randomBytes.sigBytes; i++) {
      bytes.push((randomBytes.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff);
    }
    return base32.encode(new Uint8Array(bytes));
  }

  /**
   * Generates a new HOTP.
   * @param {HOTPOptions} options - The options for generating the HOTP.
   * @returns {string} The generated HOTP.
   */
  public hotp(options: HOTPOptions): string {
    const counter = options.counter;
    const key = CryptoJS.lib.WordArray.create(base32.decode(this.#secret));
    const counterWordArray = numberToWordArray(counter);

    const hmac = this.#hash(counterWordArray, key);
    const hmacBytes = wordArrayToBytes(hmac);

    const offset = hmacBytes[hmacBytes.length - 1]! & 0x0f;

    const code =
      (((hmacBytes[offset]! & 0x7f) << 24) |
        ((hmacBytes[offset + 1]! & 0xff) << 16) |
        ((hmacBytes[offset + 2]! & 0xff) << 8) |
        (hmacBytes[offset + 3]! & 0xff)) %
      10 ** this.#digits;

    return code.toString().padStart(this.#digits, '0');
  }

  /**
   * Generates a new TOTP.
   * @param {TOTPOptions} [options={}] - The options for generating the TOTP.
   * @returns {string} The generated TOTP.
   */
  public totp(options: TOTPOptions = {}): string {
    const timestamp = options.timestamp ?? Date.now();
    if (options.period) this.#period = options.period;
    const counter = Math.floor(timestamp / 1000 / this.#period);

    return this.hotp({ counter });
  }

  /**
   * Generates a new `OTP` instance with a random secret.
   * @param {OTPGeneratorOptions} [options={}] - The options for generating the OTP.
   * @returns {OTP} A new OTP instance.
   */
  public static generate(options: OTPGeneratorOptions = {}): OTP {
    return new OTP(options);
  }

  /**
   * Verifies an HOTP.
   * @param {HOTPVerify} options - The options for verifying the HOTP.
   * @returns {boolean} Whether the HOTP is valid.
   */
  public hotpVerify(options: HOTPVerify): boolean {
    const code = options.code;
    const counter = options.counter;

    const otp = this.hotp({ counter });

    return otp === code;
  }

  /**
   * Verifies a TOTP.
   * @param {TOTPVerifyOptions} options - The options for verifying the TOTP.
   * @returns {boolean} Whether the TOTP is valid.
   */
  public totpVerify(options: TOTPVerifyOptions): boolean {
    const code = options.code;
    const timestamp = options.timestamp ?? Date.now();
    const window = options.window ?? 1;

    for (let i = -window; i <= window; i++) {
      const counter = Math.floor(timestamp / 1000 / this.#period) + i;
      if (this.hotp({ counter }) === code) {
        return true;
      }
    }

    return false;
  }
}
