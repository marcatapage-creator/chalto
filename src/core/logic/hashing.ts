/**
 * Hashing logic for Chalto Pro:
 * Uses Web Crypto API (SubtleCrypto) for SHA-256 calculation.
 * Client-side hashing ensures document integrity without heavy libraries.
 */

export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Compare two file hashes to detect logical identity.
 */
export function areFilesIdentical(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}
