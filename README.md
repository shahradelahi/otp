# @se-oss/otp

[![CI](https://github.com/shahradelahi/otp/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/shahradelahi/otp/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/@se-oss/otp.svg)](https://www.npmjs.com/package/@se-oss/otp)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](/LICENSE)
[![Install Size](https://packagephobia.com/badge?p=@se-oss/otp)](https://packagephobia.com/result?p=@se-oss/otp)

_@se-oss/otp_ is a simple and lightweight library for generating and verifying one-time passwords (OTP) that are compatible with Google Authenticator. It supports both time-based (TOTP) and counter-based (HOTP) OTPs.

---

- [Installation](#-installation)
- [Usage](#-usage)
  - [Generating a New OTP Instance](#generating-a-new-otp-instance)
  - [Loading an Existing Secret](#loading-an-existing-secret)
  - [TOTP (Time-Based OTP)](#totp-time-based-otp)
  - [HOTP (Counter-Based OTP)](#hotp-counter-based-otp)
- [Todo](#-todo)
- [Documentation](#-documentation)
- [References](#-references)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
npm install @se-oss/otp
```

<details>
<summary>Install using your favorite package manager</summary>

**pnpm**

```bash
pnpm install @se-oss/otp
```

**yarn**

```bash
yarn add @se-oss/otp
```

</details>

## 📖 Usage

### Generating a New OTP Instance

To get started, you can generate a new `OTP` instance. This will create a cryptographically secure secret for you.

```typescript
import { OTP } from '@se-oss/otp';

// Generate a new OTP instance with default options
const otp = OTP.generate();

// You can access the secret to store it for later use
console.log('Generated Secret:', otp.secret);
// e.g., store otp.secret in your database for a user
```

### Loading an Existing Secret

If you have an existing base32 encoded secret, you can create an `OTP` instance with it.

```typescript
import { OTP } from '@se-oss/otp';

const existingSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // User's secret from your database

const otp = new OTP({ secret: existingSecret });
```

### TOTP (Time-Based OTP)

TOTP is the most common type of OTP, used by apps like Google Authenticator.

```typescript
// Assuming 'otp' is an OTP instance from the examples above

// Generate a TOTP code
const code = otp.totp();
console.log('Current TOTP code:', code);

// To verify a code from the user:
const userCode = '123456'; // Code provided by the user
const isValid = otp.totpVerify({ code: userCode });

if (isValid) {
  console.log('✅ Code is valid!');
} else {
  console.log('❌ Code is invalid!');
}

// You can also check a wider window of time (e.g., 2 steps back, 2 steps forward)
const isValidWithWindow = otp.totpVerify({ code: userCode, window: 2 });
```

### HOTP (Counter-Based OTP)

HOTP uses a counter instead of time. The counter must be synchronized between the server and the client.

```typescript
// Assuming 'otp' is an OTP instance from the examples above

const counter = 1; // This should be stored and incremented on your server

// Generate an HOTP code
const code = otp.hotp({ counter });
console.log(`HOTP code for counter ${counter}:`, code);

// To verify a code from the user:
const userCode = '755224'; // Code provided by the user for counter 1
const isValid = otp.hotpVerify({ code: userCode, counter });

if (isValid) {
  console.log('✅ Code is valid!');
  // IMPORTANT: Increment the counter for this user for the next verification
} else {
  console.log('❌ Code is invalid!');
}
```

## ✅ Todo

- [ ] Generate `otpauth://` URI for QR code scanning
- [ ] Create dedicated `TOTP` and `HOTP` classes
- [ ] Add QR code generation (e.g., as a data URI)
- [ ] Add recovery codes generation
- [ ] Add more detailed documentation and examples

## 📚 Documentation

For all configuration options, please see [the API docs](https://www.jsdocs.io/package/@se-oss/otp).

## 📑 References

- HOTP (HMAC-Based One-Time Password Algorithm): [RFC 4226](http://tools.ietf.org/html/rfc4226)
- TOTP (Time-Based One-Time Password Algorithm): [RFC 6238](http://tools.ietf.org/html/rfc6238)

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/otp)

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/otp/graphs/contributors).
