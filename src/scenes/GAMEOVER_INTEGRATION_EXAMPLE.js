/**
 * Example GameOverScene showing how to integrate API calls
 * Add this to your GameOverScene.js after game ends
 */

// At the top of GameOverScene.js, add these imports:
// import { submitScore, reportAnalytics, getLeaderboard } from '../services/api.js';
// import { getUser, isUserAuthenticated } from '../services/auth.js';

/**
 * Call this function when the player finishes the boss fight
 */
async function submitGameScore() {
    try {
        // Only submit if user is authenticated
        if (!isUserAuthenticated()) {
            console.log('User not authenticated, skipping score submission');
            return;
        }

        const user = getUser();

        const scoreData = {
            username: user.email || user.nickname,
            score: this.calculateFinalScore(),
            level: 3,
            difficulty: this.difficulty,
            tokens: this.tokensCollected,
            timeSpent: this.calculateTimeSpent()
        };

        console.log('Submitting score:', scoreData);

        // Submit to backend
        const response = await submitScore(scoreData);
        console.log('✓ Score submitted successfully:', response);

        // Report analytics
        await reportAnalytics({
            event: 'game_completed',
            data: {
                difficulty: this.difficulty,
                timeSpent: scoreData.timeSpent,
                tokensCollected: scoreData.tokens
            }
        });

        // Display rank
        this.showRankMessage(response.rank);

    } catch (error) {
        console.error('✗ Failed to submit score:', error);
        this.showErrorMessage('Could not save score. Check your internet connection.');
    }
}

/**
 * Calculate final game score based on performance
 */
function calculateFinalScore() {
    let score = this.tokensCollected * 100; // 100 points per token
    score += (1000 - this.timeSpent); // Bonus for speed
    score += this.shadowsDestroyed * 50; // 50 points per shadow
    return Math.max(0, score);
}

/**
 * Calculate time spent in the game
 */
function calculateTimeSpent() {
    return Math.floor((Date.now() - this.gameStartTime) / 1000); // Seconds
}

/**
 * Display rank to player
 */
function showRankMessage(rank) {
    const rankText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height * 0.7,
        `Your Rank: #${rank}`,
        {
            font: '32px Courier',
            fill: '#00ff00',
            stroke: '#003300',
            strokeThickness: 3
        }
    );
    rankText.setOrigin(0.5);
}

/**
 * Display leaderboard on screen
 */
async function displayLeaderboard() {
    try {
        const scores = await getLeaderboard();
        
        const leaderboardText = scores
            .map((s, i) => `${i + 1}. ${s.username}: ${s.score} pts`)
            .join('\n');

        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'TOP SCORES\n' + leaderboardText,
            {
                font: '16px Courier',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
}

/**
 * Export these functions or integrate into your GameOverScene class
 */
export { submitGameScore, displayLeaderboard, calculateFinalScore };
