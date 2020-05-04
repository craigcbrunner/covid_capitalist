# Covid Capitalist!

### Description
A short cookie clicker game, with a viral theme, by Craig Brunner, build on phaser.js.

This was just an experiment for me to learn more about game development in PhaserJS, and also test out Parcel.

This game is fully client side and doesn't have any serverside portion at the moment. All art was used from the internet, I claim no rights to them and were only used for sample purposes for this non profit project. I tried to use OpenGameArt for the majority of art.

### Usage
Check out the repository and run:

``` npm install ```

To run the game locally use

``` npm run start```

To build the distribution folder for serving off your server, run:

``` npm run dist```

# Architecture

### Why I chose Phaser JS

I have been wanting to learn Phaser for a while. It is based on JS and doesn't require you to write in a different language that is compiled down, and it seems well optimized for performance including a webGL renderer. It has a lot of built in classes and plugins which eases 2D game development, so it seemed like a good starting base for this project.

On top of Phaser I used Parcel JS, which is a nice build / project management system for JS. I liked parcel after using it, it seems similar to other build packaging systems(like create-react-app), uses all the stuff you would expect internally like babel and eslint. It keeps your directory structure very light, which I like, and the local web server was very fast in my experience using it. The hot reload was near instantaneous which made development nice.

### What I would change

While I liked PhaserJS, and would use it again. I made the mistake of writing my overlayed HUD UI's in Phaser, initially using `phaser-ui-tools`

`phaser-ui-tools` turned out to be pretty buggy, and unintuitiveto use. I ended up switching to `phaser grid table` from the `rex UI` phaser plugins. This what much more intuitive to use and better documented.

That being said, if I was to start again I would use typical DOM elements overlaying the canvas, with something like React for the menus and HUD overlay. I probably would have built the projectin half the time if I did that from the start. Partly due to being more familiar with it, but also partly due to css just being easier to lay out and more capable than the grid system in `Rex UI`.

### What I didn't like

Phaser is a nice framework once you learn it, but the documentation could use some work. There seemed to be major changes between Phaser 2 and Phaser 3, and most of the examples online are from Phaser 2, and syntax changed in many cases. This meant sometimes it was a bit of a goose chase to figure out how to do something complex in Phaser 3. But once I learned it the framework was pretty intuitive. 


### Project Architecture

The project architecture I created is as follows:

A single scene, with a `header`, and `buy panel` overlayed on it, with the underlying scene being the `main business grid`.

I created a `GameStateManager` singleton which was responsible for keeping all of the game state, this singleton saved a copy of the game state to localStorage every few seconds(currently set to 10s), so that it could be persisted after page reload.

The game statemanager has functions which could be called by the various scenes. I think this worked fine for the limited purposes of this game. On a more complicated project I would like to look into a more robust state management solution.

### Header

The header basically is a small scene that displays the money and the logo...

### Buy Panel

This basically creates the single column grid on the side of the businesses and managers to buy, and uses the GridTable for updating pricing, and whether or not something is affordable.

### Main business grid

This is the grid of the businesses that can be clicked, also shows the manager and a progress of the clicks. It is also updated through the Phaser GridTable and interacting with the GameStateManager.

### businesses.json

This is the datamodel I came up with for businesses, all businesses are loaded from this file:

Here is an example:

```
  {
    name: 'PPE Manufacturer',
    managerName: 'PPE Manager',
    basePrice: 1,
    multiplier: 1,
    managerPrice: 10000,
    clickTime: 0.5,
    image: 'assets/sprites/ppe-mask.png',
    buildingImage: 'assets/sprites/smaller_building_1.png',
  },
```

`name` - the name of the given business, displayed on the buy button for the business

`managerName` - the name to display on the buy button for a manager...

`basePrice` - the first price of the business

`multiplier` - the multiplier of how much the price goes up on each buy

`managerPrice` - the price of the manager for the given business

`clickTime` - how many seconds business takes to produce money after being clicked

`image` - the icon used for displaying related to the business

`buildingImage` - the sprite used for the building on the main business grid.


## What I haven't gotten to

* Responsive design, right now the size is fixed
* Server side statemanagement, saving, anti cheat, leaderboards
* In game tutorial
* Music, sound effects, animation
* Performance fixes, less re-renders of buy panel and main grid





