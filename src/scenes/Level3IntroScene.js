import Phaser from 'phaser';

/**
 * Level3IntroScene - Instructions before Boss Fight
 */
export default class Level3IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3IntroScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'medium';
        this.level1Coins = data.level1Coins || 0;
        this.level2Coins = data.level2Coins || 0;
        this.level2Alerts = data.level2Alerts || 0;
        this.bonusSpells = data.bonusSpells || 0;
        this.tokens = this.level1Coins + this.level2Coins; // For display
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Stop Level 2 music if still playing
        if (this.sound.get('level2_music')) {
            this.sound.get('level2_music').stop();
        }
        
        // Start Level 3 background music (quieter than sound effects)
        if (this.sound.get('level3_music')) {
            this.sound.get('level3_music').stop();
        }
        this.bgMusic = this.sound.add('level3_music', { 
            loop: true, 
            volume: 0.3  // Background music quieter than sound effects
        });
        this.bgMusic.play();
        
        // Black background (matches Level 1 and Level 2 intro themes)
        this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);
        
        // Animated fire particles in background
        const fireParticles = this.add.particles(0, 0, 'spark', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            speed: { min: 20, max: 50 },
            scale: { start: 0.3, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            frequency: 100,
            tint: [0xff0000, 0xff4500, 0xff6347]
        });
        
        // Title
        const title = this.add.text(width / 2, 70, 'LEVEL 3: FINAL BATTLE', {
            font: 'bold 52px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);
        
        // Pulse animation
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtitle
        const subtitle = this.add.text(width / 2, 130, 'REGAIN YOUR INTERNET PRIVACY!', {
            font: 'bold 28px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);
        
        // Stats from previous levels
        const stats = [
            'YOUR PROGRESS:',
            `Password Tokens Collected: ${this.tokens}`,
            `Bonus Spells Earned: ${this.bonusSpells}`,
            `Difficulty: ${this.difficulty.toUpperCase()}`,
            '',
            'BOSS FIGHT RULES:',
            '• Attack the dragon with SPACE',
            '• Dodge incoming fireballs',
            '• Dragon health varies by difficulty',
            '• Your health: ' + (this.difficulty === 'easy' ? '10 HP' : this.difficulty === 'medium' ? '15 HP' : '20 HP'),
            '',
            'VICTORY CONDITIONS:',
            '• Reduce dragon health to 0',
            '• Survive the dragon\'s attacks',
            '• Use your bonus spells wisely!',
            '',
            'The dragon represents all threats to your privacy.',
            'Defeat it to reclaim your digital freedom!'
        ];
        
        let yPos = 200;
        stats.forEach(line => {
            const style = line.includes('YOUR PROGRESS') || line.includes('BOSS FIGHT') || line.includes('VICTORY')
                ? { font: 'bold 22px Arial', fill: '#ffff00', stroke: '#000000', strokeThickness: 3 }
                : line.startsWith('•')
                ? { font: '18px Arial', fill: '#ffffff' }
                : line.includes('Password Tokens') || line.includes('Bonus') || line.includes('Difficulty')
                ? { font: 'bold 20px Arial', fill: '#00ff00' }
                : line.includes('dragon')
                ? { font: 'italic 18px Arial', fill: '#ff6347' }
                : { font: '18px Arial', fill: '#ffffff' };
            
            this.add.text(width / 2, yPos, line, style).setOrigin(0.5);
            yPos += line === '' ? 15 : 28;
        });
        
        // Create interactive button
        this.createButton(width / 2, height - 80, 'BEGIN BOSS FIGHT', 0xff0000, () => {
            this.startBossFight();
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
            this.startBossFight();
        }
    }

    startBossFight() {
        console.log(`✓ Level3IntroScene: Starting BossScene with difficulty: ${this.difficulty}`);
        this.scene.start('BossScene', {
            difficulty: this.difficulty,
            level1Coins: this.level1Coins,
            level2Coins: this.level2Coins,
            level2Alerts: this.level2Alerts,
            bonusSpells: this.bonusSpells,
            shadowsDestroyed: 0,
            shadowsHit: 0
        });
    }

    createButton(x, y, text, color, callback) {
        const button = this.add.rectangle(x, y, 350, 70, color);
        button.setInteractive({ useHandCursor: true });
        
        const buttonText = this.add.text(x, y, text, {
            font: 'bold 32px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        buttonText.setOrigin(0.5);
        
        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(color, 0.8);
            button.setScale(1.08);
            buttonText.setScale(1.08);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(color, 1);
            button.setScale(1);
            buttonText.setScale(1);
        });
        
        button.on('pointerdown', callback);
        
        // Intense pulse animation
        this.tweens.add({
            targets: [button, buttonText],
            scale: 1.08,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Glow effect
        this.tweens.add({
            targets: button,
            alpha: 0.9,
            duration: 300,
            yoyo: true,
            repeat: -1
        });
    }
}
