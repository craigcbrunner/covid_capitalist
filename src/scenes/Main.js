import Phaser from 'phaser'
import constants from '../utils/constants';
export default class Main extends Phaser.Scene
{
	constructor()
	{
		super('main')
	}

	preload()
    {
        this.load.image('sky', 'assets/backgrounds/sky.png');

    }

    create()
    {
        // sky background
        const skyBackground = this.add.tileSprite(0, 0, constants.GAME_WIDTH * 2, constants.GAME_HEIGHT * 2, 'sky');
        skyBackground.tileScaleY = 3;
        skyBackground.tileScaleX = 3;

    }
}
