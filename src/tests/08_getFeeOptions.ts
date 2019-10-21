import { ltcCurrencyUtil as L } from '../index';

(async () => {
  console.log(await L.getFeeOptions('mainnet'));
  console.log(await L.getFeeOptions('testnet'));
})();
