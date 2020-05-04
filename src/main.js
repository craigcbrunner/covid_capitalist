import Phaser from 'phaser';

import WebfontLoaderPlugin from 'phaser3-rex-plugins/plugins/webfontloader-plugin.js';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import Main from './scenes/Main'
import Header from './scenes/hud/header';
import constants from './utils/constants'
import BuyPanel from './scenes/hud/buy_panel';


const config = {
  plugins: {
    global: [{
      key: 'rexWebfontLoader',
      plugin: WebfontLoaderPlugin,
      start: true,
    }],
    // ...
  },
  type: Phaser.AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  width: constants.GAME_WIDTH,
  height: constants.GAME_HEIGHT,
  scene: [Main, Header, BuyPanel],
};

const game = new Phaser.Game(config);
export default game;
