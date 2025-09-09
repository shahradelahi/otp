export class InvalidAlgorithmError extends Error {
  public constructor(algorithm: string) {
    super(`Invalid algorithm: ${algorithm}. Supported algorithms are SHA1, SHA256, SHA512.`);
    this.name = 'InvalidAlgorithmError';
  }
}
