import Phaser from 'phaser';
import ApiService from '../services/ApiService';

/**
 * LeaderboardScene - Display top scores for each difficulty
 */
export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    init(data) {
        this.selectedDifficulty = data.difficulty || 'easy';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0e27).setOrigin(0);

        // Title
        this.add.text(width / 2, 50, 'LEADERBOARD', {
            font: 'bold 48px Arial',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Difficulty tabs
        this.createDifficultyTabs();

        // Loading text
        this.loadingText = this.add.text(width / 2, height / 2, 'Loading leaderboard...', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Load leaderboard data
        this.loadLeaderboard();

        // Back button
        this.createButton(width / 2, height - 50, 'BACK TO MENU', 0x95a5a6, () => {
            this.scene.start('MenuScene');
        });
    }

    createDifficultyTabs() {
        const width = this.cameras.main.width;
        const difficulties = ['easy', 'medium', 'hard'];
        const tabWidth = 150;
        const startX = width / 2 - (tabWidth * 1.5);

        difficulties.forEach((diff, index) => {
            const x = startX + (index * tabWidth);
            const isSelected = diff === this.selectedDifficulty;
            const color = isSelected ? 0x00ff00 : 0x333333;

            const tab = this.add.rectangle(x, 120, tabWidth - 10, 40, color);
            tab.setInteractive({ useHandCursor: true });

            const text = this.add.text(x, 120, diff.toUpperCase(), {
                font: 'bold 18px Arial',
                fill: isSelected ? '#000000' : '#ffffff'
            }).setOrigin(0.5);

            tab.on('pointerover', () => {
                if (!isSelected) {
                    tab.setFillStyle(0x555555);
                }
            });

            tab.on('pointerout', () => {
                if (!isSelected) {
                    tab.setFillStyle(0x333333);
                }
            });

            tab.on('pointerdown', () => {
                this.selectedDifficulty = diff;
                this.scene.restart({ difficulty: diff });
            });
        });
    }

    async loadLeaderboard() {
        try {
            const result = await ApiService.getLeaderboard(this.selectedDifficulty, 10);
            
            if (result.success && result.data && result.data.length > 0) {
                this.displayLeaderboard(result.data);
            } else {
                this.loadingText.setText('No scores yet. Be the first!');
            }
        } catch (error) {
            this.loadingText.setText('Failed to load leaderboard');
            console.error('Error loading leaderboard:', error);
        }
    }

    displayLeaderboard(data) {
        this.loadingText.destroy();

        const width = this.cameras.main.width;
        const startY = 180;

        // Headers
        this.add.text(80, startY, 'RANK', { 
            font: 'bold 16px Arial', 
            fill: '#00ff00' 
        });
        this.add.text(180, startY, 'PLAYER', { 
            font: 'bold 16px Arial', 
            fill: '#00ff00' 
        });
        this.add.text(width - 150, startY, 'SCORE', { 
            font: 'bold 16px Arial', 
            fill: '#00ff00' 
        });

        // Entries
        data.forEach((entry, index) => {
            const y = startY + 40 + (index * 35);
            
            // Medal colors for top 3
            let color = '#ffffff';
            if (index === 0) color = '#f1c40f'; // Gold
            else if (index === 1) color = '#c0c0c0'; // Silver
            else if (index === 2) color = '#cd7f32'; // Bronze

            // Rank
            const rankText = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}`;
            this.add.text(80, y, rankText, { 
                font: '18px Arial', 
                fill: color 
            });

            // Player name (truncate if too long)
            const playerName = entry.username.length > 15 
                ? entry.username.substring(0, 15) + '...' 
                : entry.username;
            this.add.text(180, y, playerName, { 
                font: '18px Arial', 
                fill: color 
            });

            // Score
            this.add.text(width - 150, y, entry.score.toFixed(2), { 
                font: 'bold 18px Arial', 
                fill: color 
            });
        });
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 250, 50, color);
        button.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(x, y, text, {
            font: 'bold 20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        button.on('pointerover', () => {
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', callback);
    }
}
