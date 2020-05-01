import Phaser, { Game } from 'phaser'
import constants from '../utils/constants';
import loadFonts from '../utils/loadFonts';
import GameStateManager from '../utils/GameStateManager';
import businesses from '../data/businesses';

let previousBusinessesBuilt = 0;

const OperatingBusinesses = {};

export default class Main extends Phaser.Scene
{
	constructor()
	{
		super('main')
	}

	preload()
    {   

        // use plugin to preload the fonts...
        loadFonts(this);

        this.load.image('sky', 'assets/backgrounds/sky.png');

    }


    setupNewBusiness = (business) => {
        console.log('setting up new business: ', business);
    }

    createAndUpdateBusinesses = () => {
        const currentBusinessesCount = GameStateManager.getCurrentBusinessCount();
        if (currentBusinessesCount > previousBusinessesBuilt) {
            const operatingBusinesses = GameStateManager.getOperatingBusinesses();
            operatingBusinesses.forEach((business) => {
                const { name } = business;
                if (!OperatingBusinesses[name]) {
                    this.setupNewBusiness(business);
                }
            });

            previousBusinessesBuilt += 1;
        }
    }

    create()
    {
        // start other scenes after intial load:
        this.scene.launch('header');
        this.scene.launch('buy-panel');


        // sky background
        const skyBackground = this.add.tileSprite(0, 0, constants.GAME_WIDTH * 2, constants.GAME_HEIGHT * 2, 'sky');
        skyBackground.tileScaleY = 3;
        skyBackground.tileScaleX = 3;

        this.createAndUpdateBusinesses();

    }

    update() {
        this.createAndUpdateBusinesses();
    }
}
