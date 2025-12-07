/*
* Asset from: https://kenney.nl/assets/pixel-platformer
*
*/
import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.centreX;
        this.centreY;
        this.pathY;
        this.pathOffset = 0;
        this.pathOffsetTarget = 0;
        this.pathOffsetMax = 100;
        this.pathHeight = 300;
        this.pathHeightTarget = 300;
        this.pathHeightMin = 50;
        this.pathHeightMax = 200;

        this.score = 0;
        this.distance = 0;
        this.distanceMax = 200;
        this.flyVelocity = -200;
        this.backgroundSpeed = 1;
        this.coinDistance = 0;
        this.coinDistanceMax = 50;
        this.spikeDistance = 0;
        this.spikeDistanceMax = 18;

        this.gameStarted = false;
    }

    create() {
        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;
        this.pathHeight = this.pathHeightMax;

        this.cameras.main.setBackgroundColor(0x00ff00);

        this.background1 = this.add.image(0, 0, 'background').setOrigin(0);
        this.background2 = this.add.image(this.background1.width, 0, 'background').setOrigin(0);

        // Create tutorial text
        this.tutorialText = this.add.text(this.centreX, this.centreY, 'Tap to fly!', {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Create score text
        this.scoreText = this.add.text(this.centreX, 50, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100);

        this.initAnimations();
        this.initPlayer();
        this.initInput();
        this.initPhysics();
    }

    update() {
        this.background1.x -= this.backgroundSpeed;
        this.background2.x -= this.backgroundSpeed;

        if (this.background1.x + this.background1.width < 0) {
            this.background1.x += (this.background1.width * 2);
        }

        if (this.background2.x + this.background2.width < 0) {
            this.background2.x += (this.background2.width * 2);
        }

        if (!this.gameStarted) return;

        this.distance += this.backgroundSpeed;
        this.coinDistance += this.backgroundSpeed;
        this.spikeDistance += this.backgroundSpeed;

        if (this.distance > this.distanceMax) {
            this.distance -= this.distanceMax;
            this.randomPath();
        }

        if (this.coinDistance > this.coinDistanceMax) {
            this.coinDistance -= this.coinDistanceMax;
            this.addCoin();
        }

        if (this.spikeDistance > this.spikeDistanceMax) {
            this.spikeDistance -= this.spikeDistanceMax;
            this.addSpike();
        }

        this.coinGroup.getChildren().forEach(coin => {
            coin.x -= this.backgroundSpeed;
            coin.refreshBody();
        }, this);

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

    initAnimations() {
        this.anims.create({
            key: ANIMATION.bat.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.bat.texture),
            frameRate: ANIMATION.bat.frameRate,
            repeat: ANIMATION.bat.repeat
        });
        this.anims.create({
            key: ANIMATION.coin.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.coin.texture),
            frameRate: ANIMATION.coin.frameRate,
            repeat: ANIMATION.coin.repeat
        });
    }

    initPhysics() {
        this.obstacleGroup = this.add.group();
        this.coinGroup = this.add.group();

        this.physics.add.overlap(this.player, this.obstacleGroup, this.hitObstacle, null, this);
        this.physics.add.overlap(this.player, this.coinGroup, this.collectCoin, null, this);
    }

    initPlayer() {
        this.player = this.physics.add.sprite(200, this.centreY, ASSETS.spritesheet.bat.key)
            .setDepth(100)
            .setCollideWorldBounds(true);
        this.player.anims.play(ANIMATION.bat.key, true);
    }

    initInput() {
        this.physics.pause();
        this.input.once('pointerdown', () => {
            this.startGame();
        });
    }

    startGame() {
        this.gameStarted = true;
        this.physics.resume();
        this.input.on('pointerdown', () => {
            this.fly();
        });

        this.fly();
        this.tutorialText.setVisible(false);
    }

    addCoin() {
        const coin = this.physics.add.staticSprite(this.scale.width + 50, this.pathY, ASSETS.spritesheet.coin.key);
        coin.anims.play(ANIMATION.coin.key, true);
        this.coinGroup.add(coin);
    }

    addSpike() {
        const spikeTop = this.physics.add.staticSprite(this.scale.width + 50, this.pathY - this.pathHeight, 'spikes').setFlipY(true);
        const spikeBottom = this.physics.add.staticSprite(this.scale.width + 50, this.pathY + this.pathHeight, 'spikes');
        this.obstacleGroup.add(spikeTop);
        this.obstacleGroup.add(spikeBottom);
    }

    fly() {
        this.player.setVelocityY(this.flyVelocity);
    }

    hitObstacle(player, obstacle) {
        this.gameStarted = false;
        this.physics.pause();

        this.tweens.add({
            targets: this.player,
            scale: 3,
            alpha: 0,
            duration: 1000,
            ease: Phaser.Math.Easing.Expo.Out
        });

        this.GameOver();
    }

    collectCoin(player, coin) {
        coin.destroy();
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    GameOver() {
        this.time.delayedCall(2000, () => {
            this.scene.start('GameOver');
        });
    }
}
