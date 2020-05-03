import Phaser from 'phaser';
import constants from '../utils/constants';
import loadFonts from '../utils/loadFonts';
import businesses from '../data/businesses';
import MainBusinessGrid from './helpers/MainBusinessGrid';


export default class Main extends Phaser.Scene {
  constructor() {
    super('main');
    this.busGrid = new MainBusinessGrid(this);
  }

  preload() {
    // use plugin to preload the fonts...
    loadFonts(this);

    this.load.image('sky', 'assets/backgrounds/sky.png');
    businesses.forEach((business) => {
      const { name, image, buildingImage } = business;
      this.load.image(`${name}-building`, buildingImage);

      this.load.image(`${name}-image`, image);
    });

    this.load.image('manager', constants.MANAGER_SPRITE);
  }

  create() {
    // start other scenes after intial load:
    this.scene.launch('header');
    this.scene.launch('buy-panel');


    // sky background
    const skyBackground = this.add.tileSprite(0, 0, constants.GAME_WIDTH * 2, constants.GAME_HEIGHT * 2, 'sky');
    skyBackground.tileScaleY = 3;
    skyBackground.tileScaleX = 3;

    this.busGrid.createGrid();

    this.busGrid.createAndUpdateBusinesses();
  }

  update() {
    this.busGrid.createAndUpdateBusinesses();
    this.busGrid.runManagers();
    this.busGrid.updateClicks();
  }
}
