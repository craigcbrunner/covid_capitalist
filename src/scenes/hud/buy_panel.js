import Phaser from 'phaser'
import constants from '../../utils/constants';
import businesses from '../../data/businesses';

import { Viewport, Column } from 'phaser-ui-tools';
import GameStateManager from '../../utils/GameStateManager';
import loadFonts from '../../utils/loadFonts';
const BUTTON_HEIGHT = 120;
const BUTTON_WIDTH = constants.SIDE_PANEL_WIDTH;
const SCROLL_BAR_COLOR = 0x963d5a;
const SCROLL_BAR_BG_COLOR = 0x808080;

import { ScrollablePanel, RoundRectangle, GridTable } from 'phaser3-rex-plugins/templates/ui/ui-components.js';

let buyGrid;

let lastPurchaseCount = -1;
export default class BuyPanel extends Phaser.Scene
{
	constructor()
	{
		super({key: 'buy-panel', active: false})
	}

	preload()
    {
        businesses.forEach((business) => {
            const { name, image } = business;
            this.load.image(`${name}_image`, image);
        });

        this.load.image('manager', constants.MANAGER_SPRITE);


    }

    updatePriceText = (name, text, isManager) => {
        if (isManager) {
            text.setText(`$${GameStateManager.getManagerPrice(name)}`)
        }
        else {
            text.setText(`$${GameStateManager.getCurrentBusinessPrice(name)}`);
        }
    }

    createPriceText(name, isManager) {
        var style = {font: "18px money", align: "center", fill: constants.MONEY_FONT_COLOR};
        const priceText = this.add.text(BUTTON_WIDTH / 2, 75, 'N/A', style);
        this.updatePriceText(name, priceText, isManager);

        priceText.setShadow(2, 2, "#333333", 2, false, true);

        priceText.setOrigin(0.5)



        return priceText;
    }

    updateBuyButton = (name, button, isManager) => {
        const canBuy = ((isManager && GameStateManager.canBuyManager(name)) ||
            (!isManager && GameStateManager.canBuyBusiness(name)));

        if (canBuy ) {
            if (button.isHovered) {
                button.setFill(constants.BUY_HOVER_COLOR);
            }
            else {
                button.setFill(constants.BUY_TEXT_COLOR);
            }
            button.setStroke(constants.BUY_STROKE_COLOR, 6);


        }
        else if (!canBuy) {
            button.setFill(constants.DISABLED_COLOR);
            button.setStroke(constants.DISABLED_COLOR, 0);

        }

    }

    createBuyButton(name, isManager) {
        const clickButton = this.add.text(BUTTON_WIDTH / 2, 105, 'BUY', { font: "28px Arial Black"})
        .setInteractive();

        clickButton.isDisabled = true;

        clickButton.setShadow(2, 2, "#333333", 2, false, true);

        // set the correct colors for the status
        this.updateBuyButton(name, clickButton, isManager);

        clickButton.setOrigin(0.5);

        clickButton.on('pointerdown', () => {
            if (isManager) {
                if (GameStateManager.canBuyManager(name)) {
                    GameStateManager.buyNewManager(name);
                    buyGrid.setItems(this.getItems());
                    return;
                }
            }
            else {
                if (GameStateManager.canBuyBusiness(name)) {
                    GameStateManager.buyNewBusiness(name);
                    return;
                }
            }

            console.log('cannot afford to buy!');
        } )

        clickButton.on('pointerover', () => {
            clickButton.isHovered = true;

            if ((isManager && GameStateManager.canBuyManager(name)) ||
            (!isManager && GameStateManager.canBuyBusiness(name))) {
                clickButton.setFill(constants.BUY_HOVER_COLOR);
            }
            else {
                clickButton.setStyle({ fill: constants.DISABLED_COLOR});
            }
        } )
        clickButton.on('pointerout', () => {
            clickButton.isHovered = false;

            if ((isManager && GameStateManager.canBuyManager(name)) ||
            (!isManager && GameStateManager.canBuyBusiness(name))) {
                clickButton.setStyle({ fill: constants.BUY_TEXT_COLOR});
            }
            else {
                clickButton.setStyle({ fill: constants.DISABLED_COLOR});
            }
        } );

        return clickButton;
    }

    createBusinessBuyButton(business){
        console.log('creating button: ', business);
        const { name, basePrice, multiplier, managerName, isManager } = business;
        const spriteName = isManager ? 'manager' : `${name}_image`;
        const title = isManager ? managerName : name;


        // create the button container 
        const businessButtonContainer = this.add.container(200, 200);
        businessButtonContainer.setSize(BUTTON_WIDTH, BUTTON_HEIGHT);
        businessButtonContainer.setDisplaySize(BUTTON_WIDTH, BUTTON_HEIGHT);



        // rectangle behind the button
        const buttonBackground = this.add.rectangle(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff, 0.2);
        buttonBackground.setDisplayOrigin(0,0);
        businessButtonContainer.add(buttonBackground);

        // button icon
        const businessIcon = this.add.sprite(BUTTON_WIDTH / 2, 40, spriteName);
        businessIcon.displayWidth = 50;
        businessIcon.displayHeight = 50;
        
        businessIcon.setOrigin(0.5);

        // title text 
        const titleText = this.add.text(BUTTON_WIDTH / 2, 10, title, { fill: '#000' })
        .setInteractive();
        titleText.setOrigin(0.5)

        // price text
        const priceText = this.createPriceText(name, isManager);
        priceText.setName('price-text');

        // clickable buy button
        const clickButton = this.createBuyButton(name, isManager);
        clickButton.setName('buy-button');


        // add everything to the container
        businessButtonContainer.add(businessIcon);
        businessButtonContainer.add(clickButton);
        businessButtonContainer.add(priceText);
        businessButtonContainer.add(titleText);


        // return full button to add to view port
        return businessButtonContainer;
    }

    renderBuyCell = (cell, cellContainer) => {
        var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        item = cell.item,
        index = cell.index;

        const { name, isManager } = item;
        if (cellContainer === null) {
            cellContainer = this.createBusinessBuyButton(item)
        }

        const priceText = cellContainer.getByName('price-text');
        const buyButton = cellContainer.getByName('buy-button');

        this.updateBuyButton(name, buyButton, isManager);
        this.updatePriceText(name, priceText, isManager);

        return cellContainer;
    }

    getItems = () => {
        const currentItems = [];
        
        businesses.forEach((business) => {
            const { name, managerName } = business;
            currentItems.push(business);
            if (!GameStateManager.businessHasManager(name)) {
                currentItems.push({
                    name: name,
                    managerName, 
                    isManager: true,
                })
            }
        })

        return currentItems;
    }

    createGrid = () => {        
        buyGrid = new GridTable(this, {
            x: 0,
            y: constants.HEADER_HEIGHT,
            width: constants.SIDE_PANEL_WIDTH + 21,
            height: constants.GAME_HEIGHT - constants.HEADER_HEIGHT,

            scrollMode: 0,


            table: {
                cellWidth: BUTTON_HEIGHT,
                cellHeight: BUTTON_WIDTH,

                columns: 1,

                mask:false,

                reuseCellContainer: true,
            },

            slider: {
                track: this.add.existing(new RoundRectangle(this, 0, 0, 20, 10, 10, SCROLL_BAR_BG_COLOR)),
                thumb: this.add.existing(new RoundRectangle(this, 0, 0, 0, 0, 13, SCROLL_BAR_COLOR)),
            },


            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
            },

            
            createCellContainerCallback: this.renderBuyCell,
        })
            .layout()
        //.drawBounds(this.add.graphics(), 0xff0000);

        buyGrid.setOrigin(0,0);
        this.add.existing(buyGrid);

        buyGrid.setItems(this.getItems());
        buyGrid.layout();
        
  
      
    }

    create()
    {
        // background overlay
        const headerBg = this.add.rectangle(0, constants.HEADER_HEIGHT, constants.SIDE_PANEL_WIDTH, constants.GAME_HEIGHT * 2, constants.MENU_BACKGROUND_COLOR, constants.MENU_BACKGROUND_ALPHA)
        headerBg.setOrigin(0,0);

        // create the business buy buttons

        this.createGrid();
    }

    update() {
        buyGrid.refresh();
    }
}
