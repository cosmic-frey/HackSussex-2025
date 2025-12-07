import AuthService from './AuthService';

/**
 * ApiService - Handles API calls to Vultr backend
 */
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    }

    /**
     * Submit score to leaderboard
     */
    async submitScore(scoreData) {
        try {
            const token = await AuthService.getAccessToken();
            
            if (!token) {
                console.warn('Cannot submit score: User not authenticated');
                return { success: false, error: 'Not authenticated' };
            }

            const response = await fetch(`${this.baseURL}/scores`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    difficulty: scoreData.difficulty,
                    score: scoreData.score,
                    totalCoins: scoreData.totalCoins,
                    bossKillTime: scoreData.bossKillTime,
                    level1Coins: scoreData.level1Coins,
                    level2Coins: scoreData.level2Coins,
                    level2Alerts: scoreData.level2Alerts
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit score');
            }

            const result = await response.json();
            console.log('Score submitted successfully:', result);
            return result;
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get leaderboard for specific difficulty
     */
    async getLeaderboard(difficulty, limit = 100) {
        try {
            const response = await fetch(
                `${this.baseURL}/leaderboard/${difficulty}?limit=${limit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    /**
     * Get current user's best scores
     */
    async getUserScores() {
        try {
            const token = await AuthService.getAccessToken();
            
            if (!token) {
                return null;
            }

            const response = await fetch(`${this.baseURL}/scores/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user scores');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching user scores:', error);
            return null;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }
}

export default new ApiService();
