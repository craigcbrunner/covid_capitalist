import Phaser from 'phaser'

import Main from './scenes/Main'
import Header from './scenes/hud/header';
import constants from './utils/constants'
import BuyPanel from './scenes/hud/buy_panel';
import WebfontLoaderPlugin from 'phaser3-rex-plugins/plugins/webfontloader-plugin.js';


const config = {
	plugins: {
        global: [{
            key: 'rexWebfontLoader',
            plugin: WebfontLoaderPlugin,
            start: true
        },
        // ...
        ]
    },
	type: Phaser.AUTO,
	width: constants.GAME_WIDTH,
	height: constants.GAME_HEIGHT,
	scene: [Main, Header, BuyPanel]
}

export default new Phaser.Game(config)
