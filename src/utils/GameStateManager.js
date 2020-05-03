import businesses from '../data/businesses';

let currentMoney;
const currentBusinesses = {};

let businessCount;



class GameStateManagerSingleton {
    constructor() {
        currentMoney = 1;
        businessCount = 0;

        businesses.forEach((business) => {
            const { name, basePrice, image, multiplier, managerPrice, buildingImage, clickTime } = business;
            currentBusinesses[name] = {
                name,
                boughtCount: 0, 
                basePrice,
                multiplier,
                managerPrice,
                prevPrice: 0,
                managers: 0,
                clickTime
            }
        })
    }

    getMoney = () => {
        return currentMoney;    
    }

    clickBusiness = (name) => {
        currentMoney += currentBusinesses[name].prevPrice;
    }

    buyNewBusiness = (name) => {

        if (!this.canBuyBusiness(name)) {
            return false;
        }

        const currentPrice = this.getCurrentBusinessPrice(name);

        currentMoney = currentMoney - currentPrice;

        currentBusinesses[name].prevPrice = currentPrice;
        currentBusinesses[name].boughtCount += 1;

        businessCount += 1;

        return true;

    }

    getCurrentBusinessCount = () => {
        return businessCount;
    }

    getOperatingBusinesses = () => {
        const operatingBusinesses = Object.values(currentBusinesses).filter((business) => {
            return business.boughtCount > 0;
        })

        return operatingBusinesses;
    }

    canBuyBusiness = (name) => {
        const currentPrice = this.getCurrentBusinessPrice(name);
        if (currentMoney < currentPrice) {
            return false;
        }

        return true;
    }

    getCurrentBusinessPrice = (name) => {
        const {boughtCount, basePrice, multiplier, prevPrice} = currentBusinesses[name];
        let currentBoughtCount = boughtCount <= 0 ? 1 : boughtCount;
        return (currentBoughtCount * basePrice * multiplier) + prevPrice;
    }
}

const GameStateManager = new GameStateManagerSingleton();
export default GameStateManager;