import Phaser from 'phaser'
import constants from '../../utils/constants';

export default class BuyPanel extends Phaser.Scene
{
	constructor()
	{
		super({key: 'buy-panel', active: true})
	}

	preload()
    {


    }

    create()
    {
        // background overlay
        const headerBg = this.add.rectangle(0, constants.HEADER_HEIGHT, constants.SIDE_PANEL_WIDTH, constants.GAME_HEIGHT * 2, constants.MENU_BACKGROUND_COLOR, constants.MENU_BACKGROUND_ALPHA)
        headerBg.setOrigin(0,0);
    }
}
