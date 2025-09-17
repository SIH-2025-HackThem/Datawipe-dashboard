import { generateKeyPairSync, sign as nodeSign } from 'crypto'

// Generate a process-lifetime Ed25519 keypair. In production, load from env/secret store.
const { privateKey, publicKey } = generateKeyPairSync('ed25519')

export function signBytes(message: Uint8Array): Uint8Array {
  const sig = nodeSign(null, Buffer.from(message), privateKey)
  return new Uint8Array(sig)
}

export function getPublicKeyRaw(): Uint8Array {
  // Export as JWK and return the raw 32-byte x coordinate (base64url)
  const jwk = (publicKey.export({ format: 'jwk' }) as any)
  const xB64u = jwk.x as string
  const xB64 = xB64u.replace(/-/g, '+').replace(/_/g, '/')
  const pad = xB64.length % 4 === 2 ? '==' : xB64.length % 4 === 3 ? '=' : ''
  const raw = Buffer.from(xB64 + pad, 'base64')
  return new Uint8Array(raw)
}

export function getPublicKeyHex(): string {
  return Buffer.from(getPublicKeyRaw()).toString('hex')
}


