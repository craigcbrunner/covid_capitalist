import Phaser from 'phaser'
import constants from '../../utils/constants';
import businesses from '../../data/businesses';

import { Viewport, Column } from 'phaser-ui-tools';
import GameStateManager from '../../utils/GameStateManager';
const BUTTON_HEIGHT = 120;
const BUTTON_WIDTH = constants.SIDE_PANEL_WIDTH;

const BuyButtons = {};
const PriceTexts = {};
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

    updatePriceText = (name) => {
        const text = PriceTexts[name];

        text.setText(`$${GameStateManager.getCurrentBusinessPrice(name)}`);
        
    }

    createPriceText(name) {
        var style = {font: "18px money", fill: constants.MONEY_FONT_COLOR};
        const priceText = this.add.text(0, 0, 'N/A', style);
        PriceTexts[name] = priceText;

        this.updatePriceText(name);

        priceText.setShadow(2, 2, "#333333", 2, false, true);

        priceText.setOrigin(0.5, 0)



        return priceText;
    }

    updateBuyButton = (name) => {
        const button = BuyButtons[name];
        const canBuy = GameStateManager.canBuyBusiness(name);
        if (canBuy && button.isDisabled ) {
            button.setFill(constants.BUY_TEXT_COLOR);
            button.setStroke(constants.BUY_STROKE_COLOR, 6);
            button.setOrigin(0.5, -0.8)

            button.isDisabled = false;

        }
        else if (!canBuy && !button.isDisabled) {
            button.setFill(constants.DISABLED_COLOR);
            button.setStroke(constants.DISABLED_COLOR, 0);
            button.setOrigin(0.5, -1)

            button.isDisabled = true;
        }

    }
    createBuyButton(name) {
        const clickButton = this.add.text(0, 0, 'BUY', { font: "28px Arial Black"})
        .setInteractive();

        clickButton.isDisabled = true;


        BuyButtons[name] = clickButton;


        clickButton.setShadow(2, 2, "#333333", 2, false, true);

        // set the correct colors for the status
        this.updateBuyButton(name);

        clickButton.setOrigin(0.5, -0.8);

        clickButton.on('pointerdown', () => {
            if (GameStateManager.canBuyBusiness(name)) {
                GameStateManager.buyNewBusiness(name);
            }
            else {
                console.log('unable to buy!');
            }
        } )
        clickButton.on('pointerover', () => {
            if (GameStateManager.canBuyBusiness(name)) {
                clickButton.setFill(constants.BUY_HOVER_COLOR);
            }
            else {
                clickButton.setStyle({ fill: constants.DISABLED_COLOR});
            }
        } )
        clickButton.on('pointerout', () => {

            if (GameStateManager.canBuyBusiness(name)) {
                clickButton.setStyle({ fill: constants.BUY_TEXT_COLOR});
            }
            else {
                clickButton.setStyle({ fill: constants.DISABLED_COLOR});
            }
        } );

        return clickButton;
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

        // price text
        const priceText = this.createPriceText(name);

        // clickable buy button
        const clickButton = this.createBuyButton(name);


        // add everything to the container
        businessButtonContainer.add(businessIcon);
        businessButtonContainer.add(clickButton);
        businessButtonContainer.add(priceText);
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
        businesses.forEach((business) => {
            const { name } = business;
            this.updateBuyButton(name);
            this.updatePriceText(name);
        })
    }
}
