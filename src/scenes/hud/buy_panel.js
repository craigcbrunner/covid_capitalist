import Phaser from 'phaser'
import constants from '../../utils/constants';
import businesses from '../../data/businesses';

import { Viewport, Column } from 'phaser-ui-tools';
const BUTTON_HEIGHT = 100;
const BUTTON_WIDTH = 100;
export default class BuyPanel extends Phaser.Scene
{
	constructor()
	{
		super({key: 'buy-panel', active: true})
	}

	preload()
    {
        businesses.forEach((business) => {
            const { name, image } = business;
            this.load.image(`${name}_image`, image);
        });


    }

    createBusinessBuyButton(business, yPos){
        const { name, basePrice, multiplier } = business;
        const spriteName = `${name}_image`;

        //const buttonBackground = this.add.rectangle(0, 0, 100, 100, 0xfffff, 1);

        const businessButtonContainer = this.add.container(constants.SIDE_PANEL_WIDTH / 2,yPos);

        const buttonBackground = this.add.rectangle(0, 0, BUTTON_HEIGHT, BUTTON_WIDTH, 0xffffff, 0.2);
        businessButtonContainer.add(buttonBackground);
        const businessIcon = this.add.sprite(0, 0, spriteName);
        businessIcon.setOrigin(0.5, 0.8)
        businessIcon.displayWidth = BUTTON_WIDTH / 2;
        businessIcon.displayHeight = BUTTON_HEIGHT / 2;

        businessButtonContainer.add(businessIcon);



        console.log('what is business: ', name, basePrice, multiplier);

        return businessButtonContainer;
    }

    create()
    {
        // background overlay
        const headerBg = this.add.rectangle(0, constants.HEADER_HEIGHT, constants.SIDE_PANEL_WIDTH, constants.GAME_HEIGHT * 2, constants.MENU_BACKGROUND_COLOR, constants.MENU_BACKGROUND_ALPHA)
        headerBg.setOrigin(0,0);

        const viewport = new Viewport(this, 0,constants.HEADER_HEIGHT, constants.SIDE_PANEL_WIDTH, constants.GAME_HEIGHT - constants.HEADER_HEIGHT);

        const column = new Column(this);

        viewport.addNode(column);
        // create the business buy buttons

        const buttonStartingY = BUTTON_HEIGHT / 2;
        businesses.forEach((business) => {
          viewport.addNode(this.createBusinessBuyButton(business));
        });
    }
}
