import Phaser from 'phaser'

import Main from './scenes/Main'
import Header from './scenes/hud/header';
import constants from './utils/constants'
import './css/font_loader.css';
import BuyPanel from './scenes/hud/buy_panel';

const config = {
	type: Phaser.AUTO,
	width: constants.GAME_WIDTH,
	height: constants.GAME_HEIGHT,
	scene: [Main, Header, BuyPanel]
}

export default new Phaser.Game(config)
