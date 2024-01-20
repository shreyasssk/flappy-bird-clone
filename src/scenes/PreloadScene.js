import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    // To load assests, such as images, music, etc
    preload() {
        // 'this' context - scene
        // contains functions and properties we can use
        this.load.image('sky', 'assets/sky.png');
        // this.load.image('bird', 'assets/bird.png');
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('pause', 'assets/pause.png');
        this.load.image('back', 'assets/back.png');

        this.load.spritesheet('bird', 'assets/birdSprite.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        this.scene.start("MenuScene");
    }
};

export default PreloadScene;