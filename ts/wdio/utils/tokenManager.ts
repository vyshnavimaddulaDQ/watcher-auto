import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';
import { admin } from '../resources/creds';

const AUTH_URL = 'https://auth-qa.dequelabs.com/auth';
const REALM = 'axe-qa';
const CLIENT_ID = 'axepro-public';
const TOKEN_CACHE_FILE = path.join(process.cwd(), '.tokenCache.json');
const IS_CI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI);

interface TokenCache {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * TokenManager - Handles token caching and refresh
 * - Caches tokens in memory during execution
 * - Uses refresh tokens for local development (20 day validity)
 * - Always gets fresh tokens in CI environments
 */
class TokenManager {
  private cachedToken: TokenCache | null = null;

  constructor() {
    this.loadCachedToken();
  }

  /**
   * Get a valid access token
   * Uses refresh token if available and valid, otherwise gets new token
   */
  async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.accessToken;
    }

    // Try to refresh token if we have one and not in CI
    if (!IS_CI && this.cachedToken?.refreshToken) {
      try {
        return await this.refreshAccessToken(this.cachedToken.refreshToken);
      } catch (error) {
        // Refresh failed, fall back to password grant
      }
    }

    // Get new token using password grant
    return await this.getNewToken();
  }

  /**
   * Get new token using password grant
   */
  private async getNewToken(): Promise<string> {
    const requestData = new URLSearchParams();
    requestData.append('client_id', CLIENT_ID);
    requestData.append('username', admin.username);
    requestData.append('password', admin.password);
    requestData.append('grant_type', 'password');

    const response: AxiosResponse<TokenResponse> = await axios.post(
      `${AUTH_URL}/realms/${REALM}/protocol/openid-connect/token`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in || 1800; // Default 15 mins

    // Cache the token
    this.cachedToken = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    // Save refresh token to file (local dev only)
    if (!IS_CI && refreshToken) {
      this.saveRefreshToken(refreshToken);
    }

    return accessToken;
  }

  /**
   * Refresh access token using refresh token
   * Uses grant_type=refresh_token
   */
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const requestData = new URLSearchParams();
    requestData.append('client_id', CLIENT_ID);
    requestData.append('refresh_token', refreshToken);
    requestData.append('grant_type', 'refresh_token');

    const response: AxiosResponse<TokenResponse> = await axios.post(
      `${AUTH_URL}/realms/${REALM}/protocol/openid-connect/token`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;
    const expiresIn = response.data.expires_in || 900;

    // Update cached token
    this.cachedToken = {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    // Save updated refresh token
    if (!IS_CI && newRefreshToken) {
      this.saveRefreshToken(newRefreshToken);
    }

    return accessToken;
  }

  /**
   * Load refresh token from file (local dev only)
   */
  private loadCachedToken(): void {
    if (IS_CI) return;

    try {
      if (fs.existsSync(TOKEN_CACHE_FILE)) {
        const data = fs.readFileSync(TOKEN_CACHE_FILE, 'utf-8');
        const parsed: TokenCache = JSON.parse(data);
        this.cachedToken = parsed;
      }
    } catch (error) {
      // Ignore errors reading cache file
    }
  }

  /**
   * Save refresh token to file (local dev only)
   */
  private saveRefreshToken(refreshToken: string): void {
    if (IS_CI) return;

    try {
      if (this.cachedToken) {
        fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(this.cachedToken), 'utf-8');
      }
    } catch (error) {
      // Ignore errors writing cache file
    }
  }

  /**
   * Clear cached tokens (for testing)
   */
  clearCache(): void {
    this.cachedToken = null;
    if (!IS_CI && fs.existsSync(TOKEN_CACHE_FILE)) {
      try {
        fs.unlinkSync(TOKEN_CACHE_FILE);
      } catch (error) {
        // Ignore errors
      }
    }
  }
}

// Export singleton instance
export default new TokenManager();

