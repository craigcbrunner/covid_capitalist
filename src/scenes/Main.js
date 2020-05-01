import Phaser, { Game } from 'phaser'
import constants from '../utils/constants';
import loadFonts from '../utils/loadFonts';
import GameStateManager from '../utils/GameStateManager';
import businesses from '../data/businesses';
import { Viewport, Row } from 'phaser-ui-tools';
import { GridTable, Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';
import { stat } from 'fs';


const Random = Phaser.Math.Between;

const SCROLL_BAR_COLOR = 0x912c2c;
const SCROLL_BAR_BG_COLOR = 0x808080;
const STATUS_BAR_BORDER_COLOR =  0xFFCC00;

const CELL_WIDTH = 200;
const CELL_HEIGHT = 200;

let previousBusinessesBuilt = 0;

let table;

const OperatingBusinesses = {};

export default class Main extends Phaser.Scene
{
	constructor()
	{
		super('main')
	}

	preload()
    {   

        // use plugin to preload the fonts...
        loadFonts(this);

        this.load.image('sky', 'assets/backgrounds/sky.png');
        businesses.forEach((business) => {
            const { name, image, buildingImage } = business;
            this.load.image(`${name}-building`, buildingImage);

            this.load.image(`${name}-image`, image);
        })
    }


    renderBusiness = (cell, cellContainer) => {
        //console.log('setting up new business: ', business);
        var scene = cell.scene,
        width = cell.width,
        height = cell.height,
        item = cell.item,
        index = cell.index;

        const { name, buildingImage, prevPrice, image} = item;
        if (cellContainer === null) {
            cellContainer = this.add.container(0, 0);
            const buildingImage = this.add.image(35, 0, `${name}-building`);
            buildingImage.setDisplaySize(100, 100);
            buildingImage.setDisplayOrigin(0, 0);
            cellContainer.add(buildingImage);


            const icon = this.add.image(0, 90, `${name}-image`);
            icon.setDisplaySize(50, 50);
            icon.setDisplayOrigin(0, 0);
            cellContainer.add(icon);

            const statusBar = new RoundRectangle(this, 55, 105, 100, 25, 8, SCROLL_BAR_BG_COLOR)
            statusBar.setOrigin(0, 0);
            statusBar.setStrokeStyle(2, STATUS_BAR_BORDER_COLOR);
            cellContainer.add(statusBar);

            var style = {font: "14px money", fill: constants.MONEY_FONT_COLOR};
            const priceText = this.add.text(58, 105, `$${prevPrice}`, style);
            cellContainer.add(priceText);
        }

        // Set properties from item value
        // cellContainer.setMinSize(width, height); // Size might changed in this demo
        // cellContainer.getElement('text').setText(item.id); // Set text of text object

        // cellContainer.getElement('icon').setFillStyle(item.color); // Set fill color of round rectangle object
        return cellContainer;
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

        var CreateItems = function (count) {
            var data = [];
            for (var i = 0; i < count; i++) {
                data.push({
                    id: i,
                    color: Random(0, 0xffffff)
                });
            }
            return data;
        }
        
        

        var scrollMode = 0; // 0:vertical, 1:horizontal


        table = new GridTable(this, {
            x: 450,
            y: 450,
            width: constants.GAME_WIDTH - constants.SIDE_PANEL_WIDTH - 100,
            height: constants.GAME_WIDTH - constants.HEADER_HEIGHT,

            scrollMode: scrollMode,


            table: {
                cellWidth: CELL_WIDTH,
                cellHeight: CELL_HEIGHT,

                columns: 2,

                mask: {
                    padding: 2,
                },

                reuseCellContainer: true,
            },

            slider: {
                track: this.add.existing(new RoundRectangle(this, 0, 0, 20, 10, 10, SCROLL_BAR_BG_COLOR)),
                thumb: this.add.existing(new RoundRectangle(this, 0, 0, 0, 0, 13, SCROLL_BAR_COLOR)),
            },


            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            
            createCellContainerCallback: this.renderBusiness,
        })
            .layout()
        //.drawBounds(this.add.graphics(), 0xff0000);

        this.add.existing(table);
        this.print = this.add.text(0, 0, '');
        table
            .on('cell.over', function (cellContainer, cellIndex) {
            }, this)
            .on('cell.out', function (cellContainer, cellIndex) {
            }, this)

  
      
    }

    create()
    {
        // start other scenes after intial load:
        this.scene.launch('header');
        this.scene.launch('buy-panel');


        // sky background
        const skyBackground = this.add.tileSprite(0, 0, constants.GAME_WIDTH * 2, constants.GAME_HEIGHT * 2, 'sky');
       skyBackground.tileScaleY = 3;
        skyBackground.tileScaleX = 3;

        this.createGrid();

        this.createAndUpdateBusinesses();

    }

    update() {
        this.createAndUpdateBusinesses();
    }
}
