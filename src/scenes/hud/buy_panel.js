import Phaser, { Game } from 'phaser';
import { RoundRectangle, GridTable } from 'phaser3-rex-plugins/templates/ui/ui-components';
import constants from '../../utils/constants';
import businesses from '../../data/businesses';

import GameStateManager from '../../utils/GameStateManager';

const BUTTON_HEIGHT = 120;
const BUTTON_WIDTH = constants.SIDE_PANEL_WIDTH;
const SCROLL_BAR_COLOR = 0x963d5a;
const SCROLL_BAR_BG_COLOR = 0x808080;

let buyGrid;
let prevBoughtBusinesses = -1;

export default class BuyPanel extends Phaser.Scene {
  constructor() {
    super({ key: 'buy-panel', active: false });
  }

  // load the manager icon and all of the icons for the businesses
  preload() {
    businesses.forEach((business) => {
      const { name, image } = business;
      this.load.image(`${name}_image`, image);
    });

    this.load.image('manager', constants.MANAGER_SPRITE);
  }

    // set the new price of available things to buy, for updates after first render
    updatePriceText = (name, text, isManager) => {
      if (isManager) {
        text.setText(`$${GameStateManager.getManagerPrice(name)}`);
      } else {
        text.setText(`$${GameStateManager.getCurrentBusinessPrice(name)}`);
      }
    }

    // set up the price for the first render
    createPriceText(name, isManager) {
      const style = { font: '18px money', align: 'center', fill: constants.MONEY_FONT_COLOR };
      const priceText = this.add.text(BUTTON_WIDTH / 2, 75, 'N/A', style);
      this.updatePriceText(name, priceText, isManager);

      priceText.setShadow(2, 2, '#333333', 2, false, true);

      priceText.setOrigin(0.5);


      return priceText;
    }

    // update buy button to see if it is able to be clicked or not, after first render
    updateBuyButton = (name, button, isManager) => {
      const canBuy = ((isManager && GameStateManager.canBuyManager(name))
            || (!isManager && GameStateManager.canBuyBusiness(name)));

      if (canBuy) {
        this.setBuyFunction(button, isManager, name);
        // switch color if user is hovering over it
        if (button.isHovered) {
          button.setFill(constants.BUY_HOVER_COLOR);
        } else {
          button.setFill(constants.BUY_TEXT_COLOR);
        }
        button.setStroke(constants.BUY_STROKE_COLOR, 6);
      } else if (!canBuy) {
        // can't buy with current money, set the button disabled
        button.setFill(constants.DISABLED_COLOR);
        button.setStroke(constants.DISABLED_COLOR, 0);
      }
    }

    // create the on click function and remove the ones from previous renders
    // I think there is a better way to handle this and optimize this, but due to time
    // I am leaving it as is, ideally I would only set this when the cell is reused...
    // but grid table seems to update in ways I don't fully understand
    setBuyFunction = (clickButton, isManager, name) => {
      clickButton.off('pointerup');

      clickButton.on('pointerup', () => {
        if (isManager) {
          if (GameStateManager.canBuyManager(name)) {
            GameStateManager.buyNewManager(name);

            // if they bought a manager, they should only be able to once
            // it will be removed from available items so we rerender the items in the grid
            buyGrid.setItems(this.getItems());
          }
        } else if (GameStateManager.canBuyBusiness(name)) {
          GameStateManager.buyNewBusiness(name);
        }
      });
    }

    // create the clickable buy text on first render
    createBuyButton = (name, isManager) => {
      const clickButton = this.add.text(BUTTON_WIDTH / 2, 105, 'BUY', { font: '28px Arial Black' })
        .setInteractive();

      clickButton.isDisabled = true;

      clickButton.setShadow(2, 2, '#333333', 2, false, true);

      // set the correct colors for the status
      this.updateBuyButton(name, clickButton, isManager);

      clickButton.setOrigin(0.5);

      this.setBuyFunction(clickButton, isManager, name);

      // set up hover events for highlight text...
      clickButton.on('pointerover', () => {
        clickButton.isHovered = true;

        if ((isManager && GameStateManager.canBuyManager(name))
            || (!isManager && GameStateManager.canBuyBusiness(name))) {
          clickButton.setFill(constants.BUY_HOVER_COLOR);
        } else {
          clickButton.setStyle({ fill: constants.DISABLED_COLOR });
        }
      });

      clickButton.on('pointerout', () => {
        clickButton.isHovered = false;

        if ((isManager && GameStateManager.canBuyManager(name))
            || (!isManager && GameStateManager.canBuyBusiness(name))) {
          clickButton.setStyle({ fill: constants.BUY_TEXT_COLOR });
        } else {
          clickButton.setStyle({ fill: constants.DISABLED_COLOR });
        }
      });

      return clickButton;
    }

    // set up the entire full buy button, icon/clickable buy text, price
    createBusinessBuyButton(business, title, spriteName) {
      const { name, isManager } = business;


      // create the button container
      const businessButtonContainer = this.add.container(200, 200);
      businessButtonContainer.setSize(BUTTON_WIDTH, BUTTON_HEIGHT);
      businessButtonContainer.setDisplaySize(BUTTON_WIDTH, BUTTON_HEIGHT);


      // rectangle behind the button
      const buttonBackground = this.add.rectangle(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, 0xffffff, 0.2);
      buttonBackground.setDisplayOrigin(0, 0);
      businessButtonContainer.add(buttonBackground);

      // button icon
      const businessIcon = this.add.sprite(BUTTON_WIDTH / 2, 40, spriteName);
      businessIcon.setName('business-icon');
      businessIcon.setDisplaySize(50, 50);

      businessIcon.setOrigin(0.5);

      // title text
      const titleText = this.add.text(BUTTON_WIDTH / 2, 10, title, { fill: '#000' })
        .setInteractive();
      titleText.setName('title');
      titleText.setOrigin(0.5);

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

    // grid cell rendering function for the table grid
    renderBuyCell = (cell, cellContainer) => {
      const { item } = cell;

      const { name, isManager, managerName } = item;
      const title = isManager ? managerName : name;
      const spriteName = isManager ? 'manager' : `${name}_image`;

      if (cellContainer === null) {
        // first render, create the entire button
        cellContainer = this.createBusinessBuyButton(item, title, spriteName);
      }

      // on later renders just update the price,
      // i'd like to understand how to better optimize this
      const priceText = cellContainer.getByName('price-text');
      const titleText = cellContainer.getByName('title');
      const businessIcon = cellContainer.getByName('business-icon');
      const buyButton = cellContainer.getByName('buy-button');

      this.updateBuyButton(name, buyButton, isManager);

      titleText.setText(title);
      businessIcon.setTexture(spriteName);

      this.updatePriceText(name, priceText, isManager);
      prevBoughtBusinesses += 1;


      return cellContainer;
    }

    // get the current businesses and create a manager button if one doesn't exit
    getItems = () => {
      const currentItems = [];

      businesses.forEach((business) => {
        const { name, managerName } = business;
        currentItems.push(business);
        if (!GameStateManager.businessHasManager(name)) {
          currentItems.push({
            name,
            managerName,
            isManager: true,
          });
        }
      });

      return currentItems;
    }

    // create the container grid for the sidebar
    // single column
    createGrid = () => {
      buyGrid = new GridTable(this, {
        x: 0,
        y: constants.HEADER_HEIGHT,
        width: constants.SIDE_PANEL_WIDTH + 21,
        height: constants.GAME_HEIGHT - constants.HEADER_HEIGHT,

        scrollMode: 0,


        table: {
          cellWidth: BUTTON_WIDTH,
          cellHeight: BUTTON_HEIGHT + 10,

          columns: 1,

          mask: {
            padding: 0,
            updateMode: 0,
          },

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
        .layout();
      // .drawBounds(this.add.graphics(), 0xff0000);

      buyGrid.setOrigin(0, 0);
      this.add.existing(buyGrid);

      buyGrid.setItems(this.getItems());
      buyGrid.layout();
    }

    create() {
      // background overlay
      const headerBg = this.add.rectangle(0, constants.HEADER_HEIGHT, constants.SIDE_PANEL_WIDTH, constants.GAME_HEIGHT * 2, constants.MENU_BACKGROUND_COLOR, constants.MENU_BACKGROUND_ALPHA);
      headerBg.setOrigin(0, 0);

      // create the business buy buttons

      this.createGrid();
    }

    // refresh the grid on update so the buttons change when money changes
    update() {
      buyGrid.refresh();
    }
}
