import AuthService from './AuthService.js';

/**
 * ApiService - Central service for all API calls with Auth0 authentication
 * Handles requests to the Vultr backend through Cloudflare Workers
 */
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_VULTR_API_URL || 'https://api.password-quest.com';
        this.timeout = 30000; // 30 seconds
    }

    /**
     * Make authenticated API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add Auth0 token if user is authenticated
        if (AuthService.isUserAuthenticated()) {
            try {
                const token = await AuthService.getAccessToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error getting access token:', error);
            }
        }

        const fetchOptions = {
            ...options,
            headers
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(
                    errorData.error || `HTTP ${response.status}: ${response.statusText}`
                );
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            throw error;
        }
    }

    /**
     * GET request
     */
    get(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    /**
     * PUT request
     */
    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    /**
     * DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    // ============================================
    // Game Score Endpoints
    // ============================================

    /**
     * Submit player score
     */
    async submitScore(scoreData) {
        try {
            const response = await this.post('/api/scores', {
                difficulty: scoreData.difficulty,
                score: scoreData.score,
                totalCoins: scoreData.totalCoins,
                bossKillTime: scoreData.bossKillTime,
                level1Coins: scoreData.level1Coins,
                level2Coins: scoreData.level2Coins,
                level2Alerts: scoreData.level2Alerts
            });
            console.log('✓ Score submitted:', response);
            return response;
        } catch (error) {
            console.error('✗ Error submitting score:', error);
            throw error;
        }
    }

    /**
     * Get leaderboard for a difficulty
     */
    async getLeaderboard(difficulty, limit = 100) {
        try {
            const response = await this.get(
                `/api/leaderboard/${difficulty}?limit=${limit}`
            );
            return response.data || [];
        } catch (error) {
            console.error('✗ Error fetching leaderboard:', error);
            return [];
        }
    }

    /**
     * Get all leaderboards
     */
    async getAllLeaderboards(limit = 50) {
        try {
            const difficulties = ['easy', 'medium', 'hard'];
            const leaderboards = await Promise.all(
                difficulties.map(diff => this.getLeaderboard(diff, limit))
            );
            return {
                easy: leaderboards[0],
                medium: leaderboards[1],
                hard: leaderboards[2]
            };
        } catch (error) {
            console.error('✗ Error fetching leaderboards:', error);
            return { easy: [], medium: [], hard: [] };
        }
    }

    /**
     * Get user's best scores
     */
    async getUserScores() {
        try {
            if (!AuthService.isUserAuthenticated()) {
                console.warn('User not authenticated for fetching scores');
                return {};
            }
            const response = await this.get('/api/scores/me');
            return response.data || {};
        } catch (error) {
            console.error('✗ Error fetching user scores:', error);
            return {};
        }
    }

    /**
     * Get leaderboard statistics
     */
    async getLeaderboardStats() {
        try {
            const response = await this.get('/api/stats');
            return response.data || [];
        } catch (error) {
            console.error('✗ Error fetching stats:', error);
            return [];
        }
    }

    // ============================================
    // Health Check
    // ============================================

    /**
     * Check backend health
     */
    async healthCheck() {
        try {
            const response = await this.get('/api/health');
            return response;
        } catch (error) {
            console.error('✗ Backend health check failed:', error);
            return null;
        }
    }
}

export default new ApiService();
