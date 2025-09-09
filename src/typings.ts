import type { HmacSHA1, HmacSHA256, HmacSHA512 } from 'crypto-js';

/**
 * The algorithm to use for generating the OTP.
 */
export type Algorithm = 'SHA1' | 'SHA256' | 'SHA512';

export type Hash = typeof HmacSHA1 | typeof HmacSHA256 | typeof HmacSHA512;

/**
 * The options for generating an HOTP.
 */
export interface HOTPOptions {
  /**
   * The counter value.
   * @type {number}
   */
  counter: number;
}

/**
 * The options for generating a TOTP.
 */
export interface TOTPOptions {
  /**
   * The period in seconds for the OTP.
   * @type {number}
   * @default 30
   */
  period?: number;
  /**
   * The timestamp in milliseconds.
   * @type {number}
   * @default Date.now()
   */
  timestamp?: number;
}

/**
 * The options for generating an OTP.
 */
export interface OTPGeneratorOptions {
  /**
   * The algorithm to use.
   * @type {Algorithm}
   * @default 'SHA1'
   */
  algorithm?: Algorithm;
  /**
   * The number of digits in the OTP.
   * @type {number}
   * @default 6
   */
  digits?: number;
  /**
   * The period in seconds for the OTP.
   * @type {number}
   * @default 30
   */
  period?: number;
  /**
   * The secret to use for generating the OTP.
   * @type {string}
   */
  secret?: string;
}

/**
 * The options for verifying a TOTP.
 */
export interface TOTPVerifyOptions extends TOTPOptions {
  /**
   * The OTP to verify.
   * @type {string}
   */
  code: string;
  /**
   * The number of previous and future time steps to check.
   * @type {number}
   * @default 1
   */
  window?: number;
}

/**
 * The options for verifying an HOTP.
 */
export interface HOTPVerify extends HOTPOptions {
  /**
   * The OTP to verify.
   * @type {string}
   */
  code: string;
}
