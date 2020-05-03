import businesses from '../data/businesses';

let currentMoney;
const currentBusinesses = [];
const businessList = {};

let businessCount;


class GameStateManagerSingleton {
  constructor() {
    currentMoney = 1;
    businessCount = 0;

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

    getMoney = () => currentMoney

    clickBusiness = (name) => {
      currentMoney += businessList[name].prevPrice;
    }

    buyNewBusiness = (name) => {
      if (!this.canBuyBusiness(name)) {
        return false;
      }

      const currentPrice = this.getCurrentBusinessPrice(name);

      currentMoney -= currentPrice;

      businessList[name].prevPrice = currentPrice;
      businessList[name].boughtCount += 1;


      businessCount += 1;

      const currentBusinessIndex = currentBusinesses.findIndex((business) => business.name === name);

      if (currentBusinessIndex < 0) {
        currentBusinesses.push(businessList[name]);
      } else {
        currentBusinesses[currentBusinessIndex] = businessList[name];
      }

      return true;
    }

    buyNewManager = (name) => {
      if (!this.canBuyManager(name)) {
        return false;
      }

      const currentPrice = this.getManagerPrice(name);

      currentMoney -= currentPrice;

      businessList[name].hasManager = true;

      businessCount += 1;

      return true;
    }

    getManagerPrice = (name) => businessList[name].managerPrice

    businessHasManager = (name) => businessList[name].hasManager

    getCurrentBusinessCount = () => businessCount

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

    getOperatingBusinesses = () => currentBusinesses

    canBuyBusiness = (name) => {
      const currentPrice = this.getCurrentBusinessPrice(name);
      if (currentMoney < currentPrice) {
        return false;
      }

      return true;
    }

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
