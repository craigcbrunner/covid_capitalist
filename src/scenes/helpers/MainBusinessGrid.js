import { GridTable } from 'phaser3-rex-plugins/templates/ui/ui-components';
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle';
import GameStateManager from '../../utils/GameStateManager';
import constants from '../../utils/constants';
import { Game } from 'phaser';


const SCROLL_BAR_COLOR = 0xFFCC00;
const SCROLL_BAR_BG_COLOR = 0x808080;
const STATUS_BAR_BORDER_COLOR = 0xFFCC00;
const BODY_X_OFFSET = 85;
const BODY_Y_OFFSET = 50;

const INFECTED_COLOR = 0x963d5a;


const CELL_WIDTH = 200;
const CELL_HEIGHT = 200;

let previousBusinessesBuilt = 0;

let previousInfections = 0;

let table;

const ClickedBusinesses = {};

const StatusBars = {};

// this is the main business grid with all of the clickable businesses
class MainBusinessGrid {
  constructor(scene) {
    this.scene = scene;
    this.containers = [];
  }

    // call back when the full click time completes
    // resets the progressbar and gives the cash from the game state manager
    clickCompleted = (name) => {
      GameStateManager.clickBusiness(name);
      delete ClickedBusinesses[name];
      this.updateProgressBar(name, 0);
    }

    // initial click, starts the timer to complete the click
    // if a click is in progress, discard it
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

    // update the progress bar of the click animation, and infects the progress bar
    updateProgressBar = (name, progress, isInfected = false) => {
      const currStatusBar = StatusBars[name];

      // update the bar size...
  
      currStatusBar.setDisplaySize(100 * progress, 24);
      currStatusBar.setSize(100 * progress, 24);

      // set progress to infected if building is infected
      if (isInfected) {
        currStatusBar.setFillStyle(INFECTED_COLOR, 0.6);

      }
      else {
        currStatusBar.setFillStyle(SCROLL_BAR_COLOR, 0.6);
      }
    }



    // go through all the currently running clicks and update their progress bars
    updateClicks = () => {
      Object.keys(ClickedBusinesses).forEach((name) => {
        const currentProgress = ClickedBusinesses[name].timer.getOverallProgress();
        const isInfected = GameStateManager.isInfected(name);
        // pause click timer if we are infected
        if (isInfected) {
          ClickedBusinesses[name].timer.paused = true;
        }
        else {
          ClickedBusinesses[name].timer.paused = false;
        }

        this.updateProgressBar(name, currentProgress, isInfected);
      });
    }

    // render the full business cell
    // building, icon, progress bar, price
    renderBusiness = (cell, cellContainer) => {
      const { item } = cell;

      const {
        name, prevPrice, clickTime, hasManager,
      } = item;
      if (cellContainer === null) {
        cellContainer = this.scene.add.container(0, 0);
        this.containers.push(cellContainer);

        const buildingImage = this.scene.add.sprite(35, 0, `${name}-building`);
        buildingImage.setDisplaySize(100, 100);
        buildingImage.setDisplayOrigin(0, 0);
        buildingImage.setName('building');

        cellContainer.add(buildingImage);

        const managerIcon = this.scene.add.image(150, 100, 'manager');
        managerIcon.setName('manager-icon');
        managerIcon.setDisplaySize(30, 30);
        managerIcon.setDisplayOrigin(0.5);
        cellContainer.add(managerIcon);

        if (!hasManager) {
          managerIcon.setVisible(false);
        }

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

        const style = { font: '8px money', fill: constants.MONEY_FONT_COLOR };
        const priceText = this.scene.add.text(58, 110, `$${prevPrice}`, style);
        priceText.setName('price-text');
        cellContainer.add(priceText);

        icon.setInteractive();
        statusBar.setInteractive();
        buildingImage.setInteractive();

        // give click events to all the individual elements
        // of the business, to count them as clicks
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

      // update new price
      cellContainer.getByName('price-text').setText(`$${prevPrice}`);

      // put the manager icon there if there is a manager on the business
      if (hasManager) {
        cellContainer.getByName('manager-icon').setVisible(true);
      }

      cellContainer.setName(name);

      return cellContainer;
    }

    // run all the currently bought managers to automate clicks
    runManagers = () => {
      const operatingBusinesses = GameStateManager.getOperatingBusinesses();
      operatingBusinesses.forEach((business) => {
        const { hasManager, clickTime, name } = business;
        if (hasManager && !GameStateManager.isInfected(name)) {
          this.clickBusiness(name, clickTime, true);
        }
      });
    }

    // create or update the currently purchased businesses
    createAndUpdateBusinesses = () => {
      const currentBusinessesCount = GameStateManager.getCurrentBusinessCount();
      const currentInfections = GameStateManager.getInfectedCount();

      if (currentBusinessesCount > previousBusinessesBuilt || previousInfections !== currentInfections) {
        const operatingBusinesses = GameStateManager.getOperatingBusinesses();
        table.setItems(operatingBusinesses);
        table.layout();
        previousBusinessesBuilt = currentBusinessesCount;
        previousInfections = currentInfections;

        // add colliders on top of the buildings, 
        // because the container colliders and sprite
        // colliders won't work with the grid
        this.buildingsGroup.clear(true, true);
        this.containers.forEach((container) => {
          const currCollider = this.scene.add.rectangle(container.x + BODY_X_OFFSET, container.y + BODY_Y_OFFSET, CELL_WIDTH / 5, CELL_HEIGHT / 5, 0xfff, 0);
          currCollider.setName(container.name);
          this.buildingsGroup.add(currCollider);
        });

      }
    }

    // create a collision group for buildings to covids
    createBuildingsGroup = () => {
      this.buildingsGroup = this.scene.physics.add.staticGroup();
      return this.buildingsGroup;
    }

    // create the business grid
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
