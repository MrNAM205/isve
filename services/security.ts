
/**
 * Cryptographic Utility Service for Sovereign Identity
 * Handles Key Generation, Signing, and Hashing via Web Crypto API
 */

export const generateSigningKeyPair = async (): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> => {
  return window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true, // whether the key is extractable (i.e. can be used in exportKey)
    ["sign", "verify"]
  );
};

export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  const exportedAsBase64 = arrayBufferToBase64(exported);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
};

export const signData = async (privateKey: CryptoKey, data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const signature = await window.crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    privateKey,
    encoded
  );
  return arrayBufferToBase64(signature);
};

export const generateDocumentHash = async (content: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}