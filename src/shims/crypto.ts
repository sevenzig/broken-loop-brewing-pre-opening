/**
 * Browser-compatible crypto shim for packages that require('crypto').
 * Bridges Node's crypto.randomBytes to the Web Crypto API.
 * Used by bcryptjs for salt generation in the browser.
 */

function randomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export { randomBytes };
export default { randomBytes };
