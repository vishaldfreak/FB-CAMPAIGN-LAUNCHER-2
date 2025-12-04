/**
 * Token Management Service
 * Phase 0: Token validation, expiration tracking, and management
 */

import dotenv from 'dotenv';
dotenv.config();

class TokenService {
  constructor() {
    this.token = process.env.FB_ACCESS_TOKEN;
    this.expiresIn = 5350; // seconds from OAuth callback
    this.dataAccessExpirationTime = 1772587850; // Unix timestamp
    this.tokenExpiresAt = null;
    this.calculateExpiration();
  }

  /**
   * Calculate token expiration timestamp
   * Priority: data_access_expiration_time (absolute) > expiresIn (relative from now)
   */
  calculateExpiration() {
    if (this.dataAccessExpirationTime) {
      // Use absolute expiration time if available (more reliable)
      this.tokenExpiresAt = new Date(this.dataAccessExpirationTime * 1000);
    } else if (this.expiresIn) {
      // Fallback to relative expiration (assumes token was just issued)
      this.tokenExpiresAt = new Date(Date.now() + this.expiresIn * 1000);
    }
  }

  /**
   * Get current access token
   */
  getToken() {
    return this.token;
  }

  /**
   * Check if token is expired
   */
  isExpired() {
    if (!this.tokenExpiresAt) return false;
    return new Date() >= this.tokenExpiresAt;
  }

  /**
   * Get remaining time in seconds
   */
  getRemainingTime() {
    if (!this.tokenExpiresAt) return null;
    const remaining = Math.floor((this.tokenExpiresAt - new Date()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  /**
   * Get remaining time in minutes
   */
  getRemainingMinutes() {
    const seconds = this.getRemainingTime();
    return seconds ? Math.floor(seconds / 60) : 0;
  }

  /**
   * Check if token is about to expire (within threshold minutes)
   */
  isExpiringSoon(thresholdMinutes = 15) {
    const remainingMinutes = this.getRemainingMinutes();
    return remainingMinutes > 0 && remainingMinutes <= thresholdMinutes;
  }

  /**
   * Get expiration status for dashboard
   */
  getExpirationStatus() {
    const remainingSeconds = this.getRemainingTime();
    const remainingMinutes = this.getRemainingMinutes();
    
    if (!remainingSeconds || remainingSeconds <= 0) {
      return {
        status: 'expired',
        message: 'Token has expired. Please update the token in .env file.',
        remainingSeconds: 0,
        remainingMinutes: 0,
        expiresAt: this.tokenExpiresAt?.toISOString() || null
      };
    }

    let alertLevel = 'ok';
    if (remainingMinutes <= 15) {
      alertLevel = 'critical';
    } else if (remainingMinutes <= 30) {
      alertLevel = 'warning';
    } else if (remainingMinutes <= 60) {
      alertLevel = 'info';
    }

    return {
      status: 'active',
      alertLevel,
      message: `Token expires in ${remainingMinutes} minutes`,
      remainingSeconds,
      remainingMinutes,
      expiresAt: this.tokenExpiresAt?.toISOString() || null,
      alerts: {
        at15Minutes: remainingMinutes <= 15,
        at30Minutes: remainingMinutes <= 30 && remainingMinutes > 15,
        at60Minutes: remainingMinutes <= 60 && remainingMinutes > 30
      }
    };
  }

  /**
   * Update token (for manual updates)
   */
  updateToken(newToken, expiresIn = null, dataAccessExpirationTime = null) {
    this.token = newToken;
    if (expiresIn) this.expiresIn = expiresIn;
    if (dataAccessExpirationTime) this.dataAccessExpirationTime = dataAccessExpirationTime;
    this.calculateExpiration();
  }

  /**
   * Validate token before API call
   */
  validateToken() {
    if (!this.token) {
      throw new Error('Access token is not configured. Please set FB_ACCESS_TOKEN in .env file.');
    }

    if (this.isExpired()) {
      throw new Error('Access token has expired. Please update FB_ACCESS_TOKEN in .env file and restart the server.');
    }

    if (this.isExpiringSoon(15)) {
      console.warn(`⚠️  Token expires in ${this.getRemainingMinutes()} minutes. Consider updating soon.`);
    }

    return true;
  }

  /**
   * Redact token from logs
   */
  redactToken(str) {
    if (!str || !this.token) return str;
    return str.replace(new RegExp(this.token, 'g'), '[REDACTED]');
  }
}

// Export singleton instance
export default new TokenService();
