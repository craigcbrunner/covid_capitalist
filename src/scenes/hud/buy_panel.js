import Phaser from 'phaser'
import constants from '../../utils/constants';
import businesses from '../../data/businesses';

import { Viewport, Column } from 'phaser-ui-tools';
const BUTTON_HEIGHT = 100;
const BUTTON_WIDTH = constants.SIDE_PANEL_WIDTH;
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

        // create the button container 
        const businessButtonContainer = this.add.container(constants.SIDE_PANEL_WIDTH / 2,yPos);

        // rectangle behind the button
        const buttonBackground = this.add.rectangle(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff, 0.2);
        businessButtonContainer.add(buttonBackground);

        // button icon
        const businessIcon = this.add.sprite(0, 0, spriteName);
        businessIcon.setOrigin(0.5, 0.8)
        businessIcon.displayWidth = 50;
        businessIcon.displayHeight = 50;

        // title text 
        const titleText = this.add.text(0, 0, name, { fill: '#000' })
        .setInteractive();
        titleText.setOrigin(0.5, 3)

        // clickable buy button
        const clickButton = this.add.text(0, 0, 'Buy', { font: "28px Arial Black", fill: '#0f0' })
        .setInteractive();
        clickButton.setStroke(0xde77ae, 12);
        clickButton.strokeThickness = 32;
        clickButton.setShadow(2, 2, "#333333", 2, false, true);

        clickButton.setOrigin(0.5, -1.5)


        clickButton.on('pointerdown', () => {
            console.log('clicked!')
        } )
        clickButton.on('pointerover', () => {
            clickButton.setStyle({ fill: '#ff0'});
        } )
        clickButton.on('pointerout', () => {
            clickButton.setStyle({ fill: '#0f0' });
        } );

        // add everything to the container
        businessButtonContainer.add(businessIcon);
        businessButtonContainer.add(clickButton);
        businessButtonContainer.add(titleText);


        // return full button to add to view port
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

    update() {
    }
}
