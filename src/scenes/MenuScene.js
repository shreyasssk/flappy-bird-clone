import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
    constructor(config) {
        super('MenuScene', config);

        this.menu = [
            { scene: 'PlayScene', text: 'Play' },
            { scene: 'ScoreScene', text: 'Score' },
            { scene: null, text: 'Exit' },
        ];
    }

    create() {
        super.create();
        // the following code is done to bind `MenuScene` "this"
        // this.createMenu(this.menu, (menuItem) => this.setupMenuEvents(menuItem));
        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();

        textGO.on('pointerover', () => {
            textGO.setStyle({ fill: '#ff0' });
        });

        textGO.on('pointerout', () => {
            textGO.setStyle({ fill: '#fff' });
        });

        textGO.on('pointerup', () => {
            menuItem.scene && this.scene.start(menuItem.scene);

            if (menuItem.text === 'Exit') {
                this.game.destroy(true);
            };
        });
    };
};

export default MenuScene;