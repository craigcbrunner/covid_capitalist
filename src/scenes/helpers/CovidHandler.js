import Phaser from 'phaser';
import constants from '../../utils/constants';
import GameStateManager from '../../utils/GameStateManager';

const VIRUS_SPAWN_TIME = 5000;
const COVID_HEIGHT = 30;
const COVID_WIDTH = 30;

class CovidHandler {
  constructor(game, collider) {
    this.game = game;
    this.collider = collider;
    this.covidList = [];
    this.game.time.addEvent({
      delay: VIRUS_SPAWN_TIME,
      loop: true,
      callbackScope: this,
      callback: this.spawnCovid,
    });
  }

  // spawn a covid virus...
    spawnCovid = () => {
      // start in a random place
      const xPos = Phaser.Math.Between(0, constants.GAME_WIDTH);
      const yPos = Phaser.Math.Between(0, constants.GAME_HEIGHT);

      // give it a semi random direction
      const yVelMod = Phaser.Math.Between(-10, 10) > 0 ? 1 : -1;
      const xVelMod = Phaser.Math.Between(-10, 10) > 0 ? 1 : -1;


      // give it a collider with the buildings
      const covid = this.game.physics.add.sprite(xPos, yPos, 'covid');
      covid.setDisplaySize(COVID_WIDTH, COVID_HEIGHT);
      covid.setInteractive();
      covid.setBounce(1);
      covid.setCollideWorldBounds(true);
      covid.setVelocity(xVelMod * 50, yVelMod * 50);

      // on collision set building as infected
      this.game.physics.add.collider(covid, this.collider, (hitCovid, buildingHit) => {
        this.game.children.bringToTop(covid);
        covid.setVelocity(0, 0);
        covid.collidedWith = buildingHit.name;

        GameStateManager.addInfection(buildingHit.name);
      });

      // if you click a covid it deletes
      covid.on('pointerdown', () => {
        if (covid.collidedWith) {
          GameStateManager.removeInfection(covid.collidedWith);
        }
        covid.destroy();
      });
    }
}

export default CovidHandler;
