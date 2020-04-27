import Phaser from 'phaser'
import constants from '../../utils/constants';

export default class Header extends Phaser.Scene
{
	constructor()
	{
		super({key: 'header', active: true})
	}

	preload()
    {
        this.load.image('covid', 'assets/sprites/covid.png');

        // hack to force the fonts to load early
        const styleBio = {font: "1px biohazard", fill: "#000"};

        this.add.text(0,0,"", styleBio);

        const styleMoney = {font: "1px money", fill: "#000"};

        this.add.text(0,0,"", styleMoney);


    }

    create()
    {
        // background overlay
        const headerBg = this.add.rectangle(0, 0, constants.GAME_WIDTH * 2, constants.HEADER_HEIGHT, constants.MENU_BACKGROUND_COLOR, constants.MENU_BACKGROUND_ALPHA)
        headerBg.setOrigin(0,0);
        // header text and logo
        const covid = this.add.image(constants.GAME_WIDTH - 265, 35, 'covid');
        covid.scaleX = 0.3;
        covid.scaleY = 0.3;

        var style = {font: "85px biohazard", fill: "#963d5a"};

        this.add.text(constants.GAME_WIDTH - 225,20,"COVID Capitalist", style);

        // // money total 
        var style = {font: "30px money", fill: constants.MONEY_FONT_COLOR};

        this.add.text(10,10,"$1", style);
    }
}
