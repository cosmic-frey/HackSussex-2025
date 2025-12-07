import Phaser from 'phaser';

/**
 * Level2Scene - Breach Space (Flappy Bird style)
 * Based on trial L2 code structure
 */
export default class Level2Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2Scene' });
        
        // Game state (like trial L2)
        this.score = 0;
        this.alerts = 0;
        this.distance = 0;
        this.distanceMax = 200;
        this.flyVelocity = -350;
        this.backgroundSpeed = 3;
        this.coinDistance = 0;
        this.coinDistanceMax = 60;
        this.alertDistance = 0;
        this.alertDistanceMax = 100;
        this.obstacleDistance = 0;
        this.obstacleDistanceMax = 25;
        
        this.pathY = 0;
        this.pathOffset = 0;
        this.pathOffsetTarget = 0;
        this.pathOffsetMax = 100;
        this.pathHeight = 250;
        this.pathHeightTarget = 250;
        this.pathHeightMin = 150;
        this.pathHeightMax = 250;
        
        this.gameStarted = false;
        this.levelDuration = 45000;
        this.gameTime = 0;
    }

    init(data) {
        this.difficulty = data.difficulty || 'medium';
        this.tokensFromLevel1 = data.tokensFromLevel1 || 0;
        
        // Apply difficulty settings
        const difficultySettings = {
            easy: {
                backgroundSpeed: 2,
                flyVelocity: -300,
                coinDistanceMax: 40,        // More coins (spawn more frequently)
                alertDistanceMax: 60,       // More warnings (spawn more frequently)
                obstacleDistanceMax: 280,   // 1/8 shadow people (8x less frequent: 35 * 8 = 280)
                pathHeightMin: 180,
                pathHeightMax: 280
            },
            medium: {
                backgroundSpeed: 3,
                flyVelocity: -350,
                coinDistanceMax: 50,        // More coins
                alertDistanceMax: 80,       // More warnings
                obstacleDistanceMax: 100,   // 1/4 shadow people (4x less frequent: 25 * 4 = 100)
                pathHeightMin: 150,
                pathHeightMax: 250
            },
            hard: {
                backgroundSpeed: 4,
                flyVelocity: -400,
                coinDistanceMax: 60,        // More coins
                alertDistanceMax: 100,      // More warnings
                obstacleDistanceMax: 36,    // 1/2 shadow people (2x less frequent: 18 * 2 = 36)
                pathHeightMin: 120,
                pathHeightMax: 220
            }
        };
        
        const settings = difficultySettings[this.difficulty];
        this.backgroundSpeed = settings.backgroundSpeed;
        this.flyVelocity = settings.flyVelocity;
        this.coinDistanceMax = settings.coinDistanceMax;
        this.alertDistanceMax = settings.alertDistanceMax;
        this.obstacleDistanceMax = settings.obstacleDistanceMax;
        this.pathHeightMin = settings.pathHeightMin;
        this.pathHeightMax = settings.pathHeightMax;
        this.pathHeight = settings.pathHeightMax;
        this.pathHeightTarget = settings.pathHeightMax;
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        this.centreX = width * 0.5;
        this.centreY = height * 0.5;
        
        // Continue Level 2 background music if not already playing
        if (!this.sound.get('level2_music') || !this.sound.get('level2_music').isPlaying) {
            this.bgMusic = this.sound.add('level2_music', { 
                loop: true, 
                volume: 0.3  // Background music quieter than sound effects
            });
            this.bgMusic.play();
        } else {
            this.bgMusic = this.sound.get('level2_music');
        }
        
        // Black background (no glitch effects yet)
        this.cameras.main.setBackgroundColor(0x000000);
        
        // Tutorial text
        this.tutorialText = this.add.text(this.centreX, this.centreY, 'CLICK TO FLY!', {
            fontFamily: 'Courier', fontSize: 42, color: '#00ff00',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        // Score text
        this.scoreText = this.add.text(this.centreX, 50, 'Score: 0', {
            fontFamily: 'Courier', fontSize: 28, color: '#00ff00',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100);
        
        // Warnings text
        this.alertText = this.add.text(16, 16, 'Warnings: 0 (Spells: 0)', {
            fontFamily: 'Courier', fontSize: 20, color: '#ff0000',
            stroke: '#000000', strokeThickness: 4
        }).setDepth(100);
        
        // Timer text
        this.timerText = this.add.text(width - 16, 16, 'Time: 45s', {
            fontFamily: 'Courier', fontSize: 24, color: '#ffff00',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(1, 0).setDepth(100);
        
        this.initPlayer();
        this.initInput();
        this.initPhysics();
    }

    update() {
        if (!this.gameStarted) return;
        
        this.gameTime += 16.67; // Approximate delta
        
        // Update timer
        const timeLeft = Math.max(0, Math.ceil((this.levelDuration - this.gameTime) / 1000));
        this.timerText.setText(`Time: ${timeLeft}s`);
        
        // End level when time runs out
        if (timeLeft === 0) {
            this.endLevel();
            return;
        }
        
        this.distance += this.backgroundSpeed;
        this.coinDistance += this.backgroundSpeed;
        this.alertDistance += this.backgroundSpeed;
        this.obstacleDistance += this.backgroundSpeed;
        
        if (this.distance > this.distanceMax) {
            this.distance -= this.distanceMax;
            this.randomPath();
        }
        
        if (this.coinDistance > this.coinDistanceMax) {
            this.coinDistance -= this.coinDistanceMax;
            this.addCoin();
        }
        
        if (this.alertDistance > this.alertDistanceMax) {
            this.alertDistance -= this.alertDistanceMax;
            this.addAlert();
        }
        
        // Spawn obstacles (shadow people)
        if (this.obstacleDistance > this.obstacleDistanceMax) {
            this.obstacleDistance -= this.obstacleDistanceMax;
            this.addObstacle();
        }
        
        this.coinGroup.getChildren().forEach(coin => {
            coin.x -= this.backgroundSpeed;
            coin.refreshBody();
        }, this);
        
        this.alertGroup.getChildren().forEach(alert => {
            alert.x -= this.backgroundSpeed;
            if (alert.body) {
                alert.body.updateFromGameObject();
            }
        }, this);
        
        // Move obstacles (shadow people)
        this.obstacleGroup.getChildren().forEach(obstacle => {
            obstacle.x -= this.backgroundSpeed;
            obstacle.refreshBody();
        }, this);
        
        this.updatePath();
    }

    randomPath() {
        this.pathOffsetTarget = Phaser.Math.RND.between(-this.pathOffsetMax, this.pathOffsetMax);
        this.pathHeightTarget = Phaser.Math.RND.between(this.pathHeightMin, this.pathHeightMax);
    }

    updatePath() {
        const d1 = this.pathOffsetTarget - this.pathOffset;
        const d2 = this.pathHeightTarget - this.pathHeight;
        
        this.pathOffset += d1 * 0.01;
        this.pathHeight += d2 * 0.01;
        
        this.pathY = this.centreY + this.pathOffset;
    }

    initPlayer() {
        this.player = this.physics.add.sprite(200, this.centreY, 'player_dance')
            .setDepth(100)
            .setCollideWorldBounds(true)
            .setScale(2)
            .setGravityY(600);
        this.player.play('dance');
        console.log('Player created at', 200, this.centreY);
    }

    initInput() {
        this.physics.pause();
        this.input.once('pointerdown', () => {
            this.startGame();
        });
    }

    initPhysics() {
        this.obstacleGroup = this.add.group();
        this.coinGroup = this.add.group();
        this.alertGroup = this.add.group();
        
        this.physics.add.overlap(this.player, this.obstacleGroup, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.coinGroup, this.collectCoin, null, this);
        this.physics.add.overlap(this.player, this.alertGroup, this.collectAlert, null, this);
    }

    startGame() {
        this.gameStarted = true;
        this.physics.resume();
        this.input.on('pointerdown', () => {
            this.fly();
        });
        
        this.fly();
        this.tutorialText.setVisible(false);
        console.log('Game started! gameStarted =', this.gameStarted);
    }

    addCoin() {
        // Spawn at random Y position across screen height
        const randomY = Phaser.Math.Between(50, this.scale.height - 50);
        const coin = this.physics.add.staticSprite(this.scale.width + 50, randomY, 'token_placeholder');
        coin.setDepth(50);
        this.coinGroup.add(coin);
        console.log('Coin spawned at', this.scale.width + 50, randomY);
    }

    addAlert() {
        // Spawn at random Y position across screen height
        const randomY = Phaser.Math.Between(50, this.scale.height - 50);
        const alert = this.add.text(this.scale.width + 50, randomY, '❗', {
            font: 'bold 32px Arial',
            fill: '#ff0000'
        });
        alert.setOrigin(0.5);
        alert.setDepth(50);
        this.physics.add.existing(alert, true);
        this.alertGroup.add(alert);
        console.log('Alert spawned at', this.scale.width + 50, randomY);
    }

    addObstacle() {
        // Spawn pulsing shadow figure at random Y position
        const randomY = Phaser.Math.Between(100, this.scale.height - 100);
        
        if (this.textures.exists('shadow_fig')) {
            const shadow = this.physics.add.staticSprite(this.scale.width + 50, randomY, 'shadow_fig');
            shadow.setScale(2);
            shadow.setDepth(50);
            this.obstacleGroup.add(shadow);
            
            // Pulsing animation
            this.tweens.add({
                targets: shadow,
                scale: 2.3,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            console.log('Shadow spawned at', this.scale.width + 50, randomY);
        }
    }

    fly() {
        this.player.setVelocityY(this.flyVelocity);
        // Play jump sound when clicking to fly
        this.sound.play('jump', { volume: 0.8 });
    }

    hitObstacle(player, obstacle) {
        // Play shadow hit sound (louder than background music)
        this.sound.play('hit_shadow', { volume: 0.7 });
        
        // Lose ALL warnings
        const warningsLost = this.alerts;
        this.alerts = 0;
        const bonusSpells = 0;
        this.alertText.setText(`Warnings: ${this.alerts} (Spells: ${bonusSpells})`);
        
        // Visual feedback
        const text = this.add.text(this.player.x, this.player.y - 50, `-${warningsLost} WARNINGS!`, {
            font: 'bold 24px Courier',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        });
        text.setOrigin(0.5);
        text.setDepth(200);
        this.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 1500,
            onComplete: () => text.destroy()
        });
        
        // Flash player red
        this.tweens.add({
            targets: this.player,
            tint: 0xff0000,
            duration: 200,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.player.clearTint();
            }
        });
        
        // Screen shake
        this.cameras.main.shake(300, 0.01);
        
        // Destroy obstacle
        obstacle.destroy();
        
        console.log(`Hit shadow! Lost ${warningsLost} warnings.`);
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Play coin collection sound (louder than background music)
        this.sound.play('coin_collect', { volume: 0.6 });
    }

    collectAlert(player, alert) {
        alert.destroy();
        this.alerts++;
        const bonusSpells = Math.floor(this.alerts / 5);
        this.alertText.setText(`Warnings: ${this.alerts} (Spells: ${bonusSpells})`);
        
        // Play alert collection sound (same as coin - louder than background music)
        this.sound.play('coin_collect', { volume: 0.6 });
    }

    endLevel() {
        this.gameStarted = false;
        console.log('Level2Scene: Complete');
        
        // Stop Level 2 background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        const bonusSpells = Math.floor(this.alerts / 5);
        
        this.scene.start('Level3IntroScene', {
            difficulty: this.difficulty,
            level1Coins: this.tokensFromLevel1,
            level2Coins: this.score,
            level2Alerts: this.alerts,
            bonusSpells: bonusSpells
        });
    }


}
