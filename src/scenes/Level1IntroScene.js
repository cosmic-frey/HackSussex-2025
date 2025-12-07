import Phaser from 'phaser';

/**
 * Level1IntroScene - Instructions before Level 1
 */
export default class Level1IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1IntroScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'medium';
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Start Level 1 background music (quieter than sound effects)
        if (this.sound.get('level1_music')) {
            this.sound.get('level1_music').stop();
        }
        this.bgMusic = this.sound.add('level1_music', { 
            loop: true, 
            volume: 0.3  // Background music quieter than sound effects
        });
        this.bgMusic.play();
        
        // Background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);
        
        // Title
        const title = this.add.text(width / 2, 80, 'LEVEL 1: PASSWORD DASH', {
            font: 'bold 48px Arial',
            fill: '#9b59b6',
            stroke: '#000000',
            strokeThickness: 6
        });
        title.setOrigin(0.5);
        
        // Wobble animation like Level 2 (horizontal shake - less intense)
        this.tweens.add({
            targets: title,
            x: width / 2 + Phaser.Math.Between(-2, 2),
            duration: 150,
            repeat: -1,
            yoyo: true
        });
        
        // Instructions
        const instructions = [
            'OBJECTIVE:',
            'Collect spilt password tokens and destroy shadow threats',
            '',
            'CONTROLS:',
            '↑ or W - Jump (press twice for double jump)',
            'SPACE - Cast spell to destroy shadows',
            '',
            'WARNINGS:',
            '• Shadow hackers steal 50% of your password tokens on contact',
            '• Destroy the shadow threats before they steal your password tokens',
            '• Collect as many password tokens as possible to win back your identity!',
            '',
            'Duration: 60 seconds'
        ];
        
        let yPos = 180;
        instructions.forEach(line => {
            const style = line.includes('OBJECTIVE') || line.includes('CONTROLS') || line.includes('WARNINGS') 
                ? { font: 'bold 24px Arial', fill: '#f1c40f' }
                : line.startsWith('•')
                ? { font: '18px Arial', fill: '#e74c3c' }
                : { font: '20px Arial', fill: '#ffffff' };
            
            this.add.text(width / 2, yPos, line, style).setOrigin(0.5);
            yPos += line === '' ? 20 : 35;
        });
        
        // Create interactive button
        this.createButton(width / 2, height - 80, 'START LEVEL 1', 0x9b59b6, () => {
            this.scene.start('CountdownScene', { difficulty: this.difficulty });
        });
        
        // Instruction text
        const instructionText = this.add.text(width / 2, height - 30, 'Click button or press SPACE', {
            font: '16px Arial',
            fill: '#888888'
        });
        instructionText.setOrigin(0.5);
        
        // Input
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start('CountdownScene', { difficulty: this.difficulty });
        }
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 300, 60, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 28px Arial',
            fill: '#ffffff'
        });
        buttonText.setOrigin(0.5);
        
        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(color, 0.8);
            button.setScale(1.05);
            buttonText.setScale(1.05);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(color, 1);
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', callback);
        
        // Pulse animation
        this.tweens.add({
            targets: [button, buttonText],
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
