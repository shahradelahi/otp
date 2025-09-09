import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { OTP } from './index';

describe('OTP', () => {
  // Test vectors from RFC 4226
  const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // '12345678901234567890' in base32
  const otp = new OTP({ secret });

  test('should generate correct HOTP values', () => {
    const expectedCodes = [
      '755224',
      '287082',
      '359152',
      '969429',
      '338314',
      '254676',
      '287922',
      '162583',
      '399871',
      '520489',
    ];

    for (let i = 0; i < expectedCodes.length; i++) {
      const code = otp.hotp({ counter: i });
      expect(code).toBe(expectedCodes[i]);
    }
  });

  test('should verify correct HOTP values', () => {
    const code = otp.hotp({ counter: 0 });
    const isValid = otp.hotpVerify({ counter: 0, code });
    expect(isValid).toBe(true);
  });

  test('should not verify incorrect HOTP values', () => {
    const isValid = otp.hotpVerify({ counter: 0, code: '123456' });
    expect(isValid).toBe(false);
  });

  describe('TOTP', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should generate a TOTP', () => {
      const totp = new OTP({ secret });
      vi.setSystemTime(new Date(1672531200000)); // 2023-01-01 00:00:00 UTC
      const code = totp.totp();
      expect(code).toBeTypeOf('string');
      expect(code.length).toBe(6);
    });

    test('should verify a TOTP', () => {
      const totp = new OTP({ secret });
      vi.setSystemTime(new Date(1672531200000));
      const code = totp.totp();
      const isValid = totp.totpVerify({ code });
      expect(isValid).toBe(true);
    });

    test('should verify a TOTP within the window', () => {
      const totp = new OTP({ secret });
      vi.setSystemTime(new Date(1672531200000));
      const code = totp.totp();

      vi.advanceTimersByTime(30000); // Advance time by 30 seconds
      const isValid = totp.totpVerify({ code, window: 1 });
      expect(isValid).toBe(true);
    });

    test('should not verify an invalid TOTP', () => {
      const totp = new OTP({ secret });
      vi.setSystemTime(new Date(1672531200000));
      const isValid = totp.totpVerify({ code: '123456' });
      expect(isValid).toBe(false);
    });

    test('should not verify an expired TOTP', () => {
      const totp = new OTP({ secret });
      vi.setSystemTime(new Date(1672531200000));
      const code = totp.totp();
      vi.advanceTimersByTime(61000); // Advance time by 61 seconds (outside window of 1)
      const isValid = totp.totpVerify({ code });
      expect(isValid).toBe(false);
    });

    // Test vectors from RFC 6238
    test('should generate correct TOTP values for SHA1', () => {
      const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // '12345678901234567890' in base32
      const otp = new OTP({ secret, algorithm: 'SHA1', digits: 8 });

      const testVectors = {
        '59': '94287082',
        '1111111109': '07081804',
        '1111111111': '14050471',
        '1234567890': '89005924',
        '2000000000': '69279037',
        '20000000000': '65353130',
      };

      for (const [timestamp, code] of Object.entries(testVectors)) {
        const generatedCode = otp.totp({ timestamp: parseInt(timestamp, 10) * 1000 });
        expect(generatedCode).toBe(code);
      }
    });
  });

  test('should generate a new OTP instance with a random secret', () => {
    const generatedOtp = OTP.generate();
    expect(generatedOtp).toBeInstanceOf(OTP);
  });
});
