import crypto from 'crypto';

/**
 * Token Service:
 * Handles secure, 32-byte random tokens for the client portal.
 */
export class TokenService {
  /**
   * Generates a secure, 32-byte hex token.
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a token for storage in the database (SHA-256).
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifies a provided token against a stored hash.
   */
  static verifyToken(token: string, storedHash: string): boolean {
    const providedHash = this.hashToken(token);
    return crypto.timingSafeEqual(
      Buffer.from(providedHash),
      Buffer.from(storedHash)
    );
  }

  /**
   * Rotation Logic:
   * Returns a new token and its hash to replace old ones.
   */
  static rotateToken(): { token: string; hash: string } {
    const token = this.generateToken();
    const hash = this.hashToken(token);
    return { token, hash };
  }
}
