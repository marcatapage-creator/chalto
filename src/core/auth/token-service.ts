import { Project } from '../types';

/**
 * Token Service V2 for Chalto Pro:
 * - 30-day fixed lifespan
 * - 3-day soft warning threshold
 * - Secure rotation Support
 */

const PORTAL_TOKEN_LIFESPAN_DAYS = 30;
const WARNING_THRESHOLD_DAYS = 3;

export class TokenService {
  /**
   * Generates a new 32-byte secure token with an expiration date.
   */
  static generatePortalToken(): { token: string; expiresAt: string } {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PORTAL_TOKEN_LIFESPAN_DAYS);
    
    return {
      token,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Validates if a token is valid and not expired.
   */
  static isValid(project: Project, token: string, now: Date = new Date()): boolean {
    if (!project.clientPortalToken || project.clientPortalToken !== token) {
      return false;
    }

    if (!project.portalTokenExpiresAt) {
      return false;
    }

    const expiryDate = new Date(project.portalTokenExpiresAt);
    return expiryDate > now;
  }

  /**
   * HUD Logic: Detect if a token will expire soon (Soft Warning).
   */
  static isNearExpiry(project: Project, now: Date = new Date()): boolean {
    if (!project.portalTokenExpiresAt) return false;

    const expiryDate = new Date(project.portalTokenExpiresAt);
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > 0 && diffDays <= WARNING_THRESHOLD_DAYS;
  }

  /**
   * Create a new token for rotation.
   */
  static rotateToken(project: Project): Project {
    const { token, expiresAt } = this.generatePortalToken();
    return {
      ...project,
      clientPortalToken: token,
      portalTokenExpiresAt: expiresAt,
      updatedAt: new Date().toISOString(),
    };
  }
}
