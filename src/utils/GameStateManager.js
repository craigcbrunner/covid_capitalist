import businesses from '../data/businesses';

let currentMoney;
let currentBusinesses = [];
let businessList = {};
const infectedList = {};

let businessCount;

let infectedCount;

const AUTO_SAVE_INTERVAL = 10000;
const LOCAL_STORAGE_NAME = 'COVID_CAPITALIST_GAME_SAVE';

// this manages all the game state
class GameStateManagerSingleton {
  // setup the initial game state
  constructor() {
    currentMoney = 1;
    businessCount = 0;

    const previousSaveString = localStorage.getItem(LOCAL_STORAGE_NAME);
    let previousSave = null;
    if (previousSaveString) {
      previousSave = JSON.parse(previousSaveString);
    }
    if (previousSave && previousSave.businessList) {
      // restore the saved state
      const {
        businessList: savedBusinessList,
        currentBusinesses: savedCurrentBusinesses,
        currentMoney: savedCurrentMoney,
        businessCount: savedBusinessCount,
      } = previousSave;

      businessList = savedBusinessList;
      currentBusinesses = savedCurrentBusinesses;
      currentMoney = savedCurrentMoney;
      businessCount = savedBusinessCount;
    } else {
    // run through all the businesses from the JSON and set up our business list

      businesses.forEach((business) => {
        const {
          name, basePrice, multiplier, managerPrice, clickTime,
        } = business;
        businessList[name] = {
          name,
          boughtCount: 0,
          basePrice,
          multiplier,
          managerPrice,
          prevPrice: 0,
          hasManager: false,
          clickTime,
        };
      });
    }

    // auto save the game state every so often to local storage
    setInterval(() => {
      // dirty way to save the object and recover it
      const saveObject = {
        businessList,
        currentBusinesses,
        currentMoney,
        businessCount,
      };
      const stateString = JSON.stringify(saveObject);
      localStorage.setItem(LOCAL_STORAGE_NAME, stateString);
    }, AUTO_SAVE_INTERVAL);
  }

    // set a business as infected by covid...
    addInfection = (name) => {
      if (!infectedList[name]) {
        infectedList[name] = 1;
      } else {
        infectedList[name] += 1;
      }
      infectedCount += 1;
    }

      // set a business as infected by covid...
      removeInfection = (name) => {
        infectedList[name] -= 1;
        if (infectedList[name] < 0) {
          infectedList[name] = 0;
        }
        infectedCount -= 1;
      }

      // returns if business is infected
      isInfected = (name) => !!infectedList[name]

      // returns total infected count
      getInfectedCount = () => infectedCount;

    // return the current money
    getMoney = () => currentMoney

    // handles the finished business click
    clickBusiness = (name) => {
      currentMoney += businessList[name].prevPrice;
    }

    // handles when a user buys a new business from the buy panel
    buyNewBusiness = (name) => {
      if (!this.canBuyBusiness(name)) {
        return false;
      }

      const currentPrice = this.getCurrentBusinessPrice(name);

      // deduct current price from money
      currentMoney -= currentPrice;

      // set the next price and increase the number of bought businesses
      businessList[name].prevPrice = currentPrice;
      businessList[name].boughtCount += 1;


      businessCount += 1;

      // replace it in our current business array we use to make the grid, or add it if it doesn't exist
      const currentBusinessIndex = currentBusinesses.findIndex((business) => business.name === name);

      if (currentBusinessIndex < 0) {
        currentBusinesses.push(businessList[name]);
      } else {
        currentBusinesses[currentBusinessIndex] = businessList[name];
      }

      return true;
    }

    // handle buying a manager, and add it to the state
    buyNewManager = (name) => {
      if (!this.canBuyManager(name)) {
        return false;
      }

      const currentPrice = this.getManagerPrice(name);

      // deduct manager price from current money
      currentMoney -= currentPrice;

      businessList[name].hasManager = true;

      businessCount += 1;

      return true;
    }

    // get the current manager price
    getManagerPrice = (name) => businessList[name].managerPrice

    // check if a business already has a purchased manager
    businessHasManager = (name) => businessList[name].hasManager

    // get the total number of purchases made so far
    getCurrentBusinessCount = () => businessCount

    // check if the user can buy this manager with his current money
    canBuyManager = (name) => {
      const business = businessList[name];

      // can't buy manager if you don't own the business
      if (business.boughtCount <= 0) {
        return false;
      }
      const managerPrice = this.getManagerPrice(name);
      if (currentMoney < managerPrice) {
        return false;
      }

      return true;
    }

    // get the list of currently running businesses
    getOperatingBusinesses = () => currentBusinesses

    // check if the user can afford the current business
    canBuyBusiness = (name) => {
      const currentPrice = this.getCurrentBusinessPrice(name);
      if (currentMoney < currentPrice) {
        return false;
      }

      return true;
    }

    // calculate the current price of the business
    // based on multiplier, number of bought businesses, and base price
    getCurrentBusinessPrice = (name) => {
      const {
        boughtCount, basePrice, multiplier, prevPrice,
      } = businessList[name];
      const currentBoughtCount = boughtCount <= 0 ? 1 : boughtCount;
      const currMultiplier = boughtCount <= 0 ? 1 : multiplier;
      return Math.floor((currentBoughtCount * basePrice * currMultiplier) + prevPrice);
    }
}

const GameStateManager = new GameStateManagerSingleton();
export default GameStateManager;
