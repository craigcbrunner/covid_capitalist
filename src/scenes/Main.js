import Phaser, { Game } from 'phaser'
import constants from '../utils/constants';
import loadFonts from '../utils/loadFonts';
import GameStateManager from '../utils/GameStateManager';
import businesses from '../data/businesses';
import { Viewport, Row } from 'phaser-ui-tools';
import { GridTable, Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { Label } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import RoundRectangle from 'phaser3-rex-plugins/plugins/roundrectangle.js';


const Random = Phaser.Math.Between;

const SCROLL_BAR_COLOR = 0x912c2c;
const SCROLL_BAR_BG_COLOR = 0x808080;


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
    }


    setupNewBusiness = (business) => {
        console.log('setting up new business: ', business);
    }

    createAndUpdateBusinesses = () => {
        const currentBusinessesCount = GameStateManager.getCurrentBusinessCount();
        if (currentBusinessesCount > previousBusinessesBuilt) {
            const operatingBusinesses = GameStateManager.getOperatingBusinesses();
            operatingBusinesses.forEach((business) => {
                const { name } = business;
                if (!OperatingBusinesses[name]) {
                    this.setupNewBusiness(business);
                }
            });

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


        var gridTable = new GridTable(this, {
            x: 450,
            y: 450,
            width: constants.GAME_WIDTH - constants.SIDE_PANEL_WIDTH - 100,
            height: constants.GAME_WIDTH - constants.HEADER_HEIGHT,

            scrollMode: scrollMode,


            table: {
                cellWidth: (scrollMode === 0) ? undefined : 60,
                cellHeight: (scrollMode === 0) ? 60 : undefined,

                columns: 3,

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

            
            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = this.add.existing(new Label(this, {
                        width: width,
                        height: height,

                        orientation: scrollMode,
                        background: this.add.existing(new RoundRectangle(this,  0, 0, 20, 20, 0)),
                        icon: this.add.existing(new RoundRectangle(this,  0, 0, 20, 20, 10, 0x0)),
                        text: scene.add.text(0, 0, ''),

                        space: {
                            icon: 10,
                            left: (scrollMode === 0) ? 15 : 0,
                            top: (scrollMode === 0) ? 0 : 15,
                        }
                    }));
                }

                // Set properties from item value
                cellContainer.setMinSize(width, height); // Size might changed in this demo
                cellContainer.getElement('text').setText(item.id); // Set text of text object

                cellContainer.getElement('icon').setFillStyle(item.color); // Set fill color of round rectangle object
                return cellContainer;
            },
            items: CreateItems(100)
        })
            .layout()
        //.drawBounds(this.add.graphics(), 0xff0000);

        this.add.existing(gridTable);
        this.print = this.add.text(0, 0, '');
        gridTable
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
