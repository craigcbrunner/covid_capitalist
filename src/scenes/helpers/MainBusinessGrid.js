import { GridTable } from 'phaser3-rex-plugins/templates/ui/ui-components';
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle';
import GameStateManager from '../../utils/GameStateManager';
import constants from '../../utils/constants';


const SCROLL_BAR_COLOR = 0xFFCC00;
const SCROLL_BAR_BG_COLOR = 0x808080;
const STATUS_BAR_BORDER_COLOR = 0xFFCC00;

const CELL_WIDTH = 200;
const CELL_HEIGHT = 200;

let previousBusinessesBuilt = 0;

let table;

const ClickedBusinesses = {};

const StatusBars = {};

class MainBusinessGrid {
  constructor(scene) {
    this.scene = scene;
  }

    clickCompleted = (name) => {
      GameStateManager.clickBusiness(name);
      delete ClickedBusinesses[name];
      this.updateProgressBar(name, 0);
    }

    clickBusiness = (name, clickTime, managerClick) => {
      // check if we are in progress on a click
      if (GameStateManager.businessHasManager(name) && !managerClick) {
        return;
      }

      if (ClickedBusinesses[name] && ClickedBusinesses[name].timer && ClickedBusinesses[name].timer.getOverallProgress() < 1) {
        return;
      }

      // remove old timer on new create...
      if (ClickedBusinesses[name] && ClickedBusinesses[name].timer) {
        ClickedBusinesses[name].timer.destroy();
      }

      // create a new timer based on click time...
      const delay = clickTime * 1000;
      const timer = this.scene.time.addEvent({
        delay,
        repeat: 0,
        callbackScope: this,
        callback: () => {
          this.clickCompleted(name);
        },
      });

      ClickedBusinesses[name] = {
        timer,
      };
    }

    updateProgressBar = (name, progress) => {
      const currStatusBar = StatusBars[name];

      // update the bar size...
      currStatusBar.setDisplaySize(100 * progress, 24);
      currStatusBar.setSize(100 * progress, 24);
    }

    updateClicks = () => {
      Object.keys(ClickedBusinesses).forEach((name) => {
        const currentProgress = ClickedBusinesses[name].timer.getOverallProgress();

        this.updateProgressBar(name, currentProgress);
      });
    }

    renderBusiness = (cell, cellContainer) => {
      const { item } = cell;


      const {
        name, prevPrice, clickTime, hasManager,
      } = item;
      if (cellContainer === null) {
        cellContainer = this.scene.add.container(0, 0);
        const buildingImage = this.scene.add.image(35, 0, `${name}-building`);
        buildingImage.setDisplaySize(100, 100);
        buildingImage.setDisplayOrigin(0, 0);
        cellContainer.add(buildingImage);

        const managerIcon = this.scene.add.image(150, 100, 'manager');
        managerIcon.setName('manager-icon');
        managerIcon.setDisplaySize(30, 30);
        managerIcon.setDisplayOrigin(0.5);
        cellContainer.add(managerIcon);

        if (!hasManager) {
          managerIcon.setVisible(false);
        }


        // const background = new RoundRectangle(this.scene, 0, 0, CELL_WIDTH, CELL_HEIGHT, 2, SCROLL_BAR_BG_COLOR);
        // background.setOrigin(0, 0);
        // background.setStrokeStyle(2, STATUS_BAR_BORDER_COLOR);
        // cellContainer.add(background);

        const icon = this.scene.add.sprite(0, 90, `${name}-image`);
        icon.setDisplaySize(50, 50);
        icon.setDisplayOrigin(0, 0);
        cellContainer.add(icon);

        const statusBar = new RoundRectangle(this.scene, 55, 105, 100, 25, 2, SCROLL_BAR_BG_COLOR);
        statusBar.setOrigin(0, 0);
        statusBar.setStrokeStyle(2, STATUS_BAR_BORDER_COLOR);
        cellContainer.add(statusBar);

        const statusBarOverlay = new RoundRectangle(this.scene, 55, 105, 0, 24, 0, SCROLL_BAR_COLOR, 0.6);
        statusBarOverlay.setOrigin(0, 0);
        cellContainer.add(statusBarOverlay);

        StatusBars[name] = statusBarOverlay;


        const style = { font: '14px money', fill: constants.MONEY_FONT_COLOR };
        const priceText = this.scene.add.text(58, 105, `$${prevPrice}`, style);
        priceText.setName('price-text');
        cellContainer.add(priceText);


        // cellContainer.setDisplaySize(CELL_WIDTH, CELL_HEIGHT);
        // cellContainer.setSize(CELL_WIDTH, CELL_HEIGHT);
        //cellContainer.setInteractive();
        icon.setInteractive();
        statusBar.setInteractive();
        buildingImage.setInteractive();

        icon.on('pointerdown', () => {
          this.clickBusiness(name, clickTime);
        });
        statusBar.on('pointerdown', () => {
          this.clickBusiness(name, clickTime);
        });
        buildingImage.on('pointerdown', () => {
          this.clickBusiness(name, clickTime);
        });
      }

      cellContainer.getByName('price-text').setText(`$${prevPrice}`);

      if (hasManager) {
        cellContainer.getByName('manager-icon').setVisible(true);
      }

      return cellContainer;
    }

    runManagers = () => {
      const operatingBusinesses = GameStateManager.getOperatingBusinesses();
      operatingBusinesses.forEach((business) => {
        const { hasManager, clickTime, name } = business;
        if (hasManager) {
          this.clickBusiness(name, clickTime, true);
        }
      });
    }

    createAndUpdateBusinesses = () => {
      const currentBusinessesCount = GameStateManager.getCurrentBusinessCount();
      if (currentBusinessesCount > previousBusinessesBuilt) {
        const operatingBusinesses = GameStateManager.getOperatingBusinesses();
        table.setItems(operatingBusinesses);
        table.layout();
        previousBusinessesBuilt += 1;
      }
    }

    createGrid = () => {
      table = new GridTable(this.scene, {
        x: constants.SIDE_PANEL_WIDTH + 10,
        y: constants.HEADER_HEIGHT,
        width: constants.GAME_WIDTH - constants.SIDE_PANEL_WIDTH,
        height: constants.GAME_HEIGHT - constants.HEADER_HEIGHT,

        scrollMode: 0,


        table: {
          cellWidth: CELL_WIDTH,
          cellHeight: CELL_HEIGHT,

          columns: 3,

          reuseCellContainer: true,
        },

        // slider: {
        //     track: this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 20, 10, 10, SCROLL_BAR_BG_COLOR)),
        //     thumb: this.scene.add.existing(new RoundRectangle(this.scene, 0, 0, 0, 0, 13, SCROLL_BAR_COLOR)),
        // },


        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        },


        createCellContainerCallback: this.renderBusiness,
      })
        .layout();
      // .drawBounds(this.scene.add.graphics(), 0xff0000);
      table.setOrigin(0, 0);
      this.scene.add.existing(table);
    }
}

export default MainBusinessGrid;