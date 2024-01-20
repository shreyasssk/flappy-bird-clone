import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);
        
        this.bird = null;
        this.pipes = null;
        this.isPaused = false;

        this.pipeHorizontalDistance = 0;
        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = "";

        this.currentDifficulty = "easy";
        this.difficulties = {
            'easy': {
                pipeHorizontalDistanceRange: [300, 350],
                pipeVerticalDistanceRange: [150, 200],
            },
            'normal': {
                pipeHorizontalDistanceRange: [280, 330],
                pipeVerticalDistanceRange: [140, 190],
            },
            'hard': {
                pipeHorizontalDistanceRange: [250, 310],
                pipeVerticalDistanceRange: [120, 170],
            },
        };
    };

    // For remaining stuff, like event listeners, etc
    create() {
        this.currentDifficulty = "easy";

        super.create();
        this.createBird();
        this.createPipes();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
        this.listenToEvents();

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bird', {
                start: 9,
                end: 15
            }),
            // 24 fps default, it will play 8 frames in 1 second
            frameRate: 8,
            // repeat infinitely
            repeat: -1
        });

        this.bird.play('fly');
    };

    // Velocity increase gravity times 
    // Using `setOrigin()`
    // (0, 0)-----(0.5, 0)-----(1, 0)
    // |                        |
    // |                        |
    // |          x             |
    // |            (0.5, 0.5)  |
    // |                        |
    // (0, 1)-----(0.5, 1)-----(1, 1)

    // 60 times per second
    update() {
        this.checkGameStatus();
        this.recyclePipes();
    };

    listenToEvents() {
        if (this.pauseEvent) { return; };

        this.pauseEvent = this.events.on('resume', () => {
            this.initialTime = 3;
            this.countDownText = this.add.text(
                ...this.screenCenter,
                'Fly in: ' + this.initialTime,
                this.fontOptions
            )
            .setOrigin(0.5);
            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countDown,
                callbackScope: this,
                loop: true,
            });
        });
    };

    countDown() {
        this.initialTime--;
        this.countDownText.setText('Fly in: ' + this.initialTime);
        
        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.countDownText.setText('');
            this.physics.resume();
            this.timedEvent.remove();
        }
    }

    createBG() {
        // provide coordinate for the center of config (x & y), with key
        // this.add.image(config.width / 2, config.height / 2, 'sky');
        this.add.image(0, 0, 'sky').setOrigin(0);
    };

    createBird() {
        this.bird = this.physics.add
        .sprite(
            this.config.startPosition.x, 
            this.config.startPosition.y, 
            'bird'
        )
        .setFlipX(true)
        .setScale(3)
        .setOrigin(0);
        // bird.body.velocity.x = VELOCITY;
        
        this.bird.setBodySize(this.bird.width, this.bird.height - 8);

        this.bird.body.gravity.y = 600;
        this.bird.setCollideWorldBounds(true);
    };

    createPipes() {
        this.pipes = this.physics.add.group();

        for (let i = 0; i < PIPES_TO_RENDER; i++) {
            // const upperPipe = this.physics.add.sprite(0, 0, 'pipe').setOrigin(0, 1);
            // const lowerPipe = this.physics.add.sprite(0, 0, 'pipe').setOrigin(0, 0);

            const upperPipe = this
            .pipes
            .create(0, 0, 'pipe')
            .setImmovable(true)
            .setOrigin(0, 1);
            const lowerPipe = this
            .pipes
            .create(0, 0, 'pipe')
            .setImmovable(true)
            .setOrigin(0, 0);
            
            this.placePipe(upperPipe, lowerPipe);
        }

        this.pipes.setVelocityX(-200);
    };

    createColliders() {
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
    };

    createScore() {
        this.score = 0;
        const bestScore = localStorage.getItem('bestScore');
        this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: '32px', fill: '#000' });
        this.add.text(16, 52, `Best score: ${bestScore || 0}`, { fontSize: '18px', fill: '#000' });
    };

    createPause() {
        this.isPaused = false;

        const pauseButton = this.add
        .image(
            this.config.width - 10,
            this.config.height - 10,
            'pause'
        )
        .setInteractive()
        .setScale(3)
        .setOrigin(1);

        pauseButton.on('pointerdown', () => {
            this.isPaused = true;
            this.physics.pause();
            this.scene.pause();
            this.scene.launch('PauseScene');
        });
    };

    handleInputs() {
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown_SPACE', this.flap, this);
    };

    checkGameStatus() {
        if (
            this.bird.getBounds().bottom >= this.config.height || 
            this.bird.y <= 0
        ) {
            this.gameOver();
        }
    }

    placePipe(uPipe, lPipe) {
        const difficulty = this.difficulties[this.currentDifficulty];

        const rightMostX = this.getRightMostPipe();
        const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
        const pipeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - pipeVerticalDistance);
        const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);
      
        uPipe.x = rightMostX + pipeHorizontalDistance;
        uPipe.y = pipeVerticalPosition;
      
        lPipe.x = uPipe.x;
        lPipe.y = uPipe.y + pipeVerticalDistance;
      
        // not using below code because we are adding
        // velocity to the entire `pipe` group
        // uPipe.body.velocity.x = -200;
        // lPipe.body.velocity.x = -200;
      };
      
      //   ----
      //  |    |
      //  |    x <- getBounds().right
      //  |    |
      //   ----

    recyclePipes() {
        const tempPipes = [];
        this.pipes.getChildren().forEach((pipe) => {
            if (pipe.getBounds().right <= 0) {
                tempPipes.push(pipe);
                if (tempPipes.length === 2) {
                    this.placePipe(...tempPipes);
                    this.increaseScore();
                    this.saveBestScore();
                    this.increaseDifficulty();
                }
            }
        });
    };

    increaseDifficulty() {
        if (this.score === 1) {
            this.currentDifficulty = "normal";
        }

        if (this.score === 3) {
            this.currentDifficulty = "hard";
        }
    };

    getRightMostPipe() {
        let rightMostX = 0;
      
        this.pipes.getChildren().forEach(function(pipe) {
          rightMostX = Math.max(pipe.x, rightMostX);
        });
      
        return rightMostX;
    };

    saveBestScore() {
        const bestScoreText = localStorage.getItem('bestScore');
        const bestScore = bestScoreText && parseInt(bestScoreText, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
    };

    gameOver() {
        // console.log(`[gameOver] config: ${JSON.stringify(this.config)}`);
        // this.bird.x = this.config.startPosition.x;
        // this.bird.y = this.config.startPosition.y;
        // // velocity increases because of gravity, so to "restart" make it 0
        // this.bird.body.velocity.y = 0;

        this.physics.pause();
        this.bird.setTint(0xEE4824);

        this.saveBestScore();

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false
        });
    };
      
    flap() {
        // to avoid adding velocity when the game resumes
        if (this.isPaused) { return; }

        this.bird.body.velocity.y = -this.flapVelocity;
    };

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`);
    }
};

export default PlayScene;