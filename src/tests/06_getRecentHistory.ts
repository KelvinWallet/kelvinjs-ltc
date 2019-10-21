import { ltcCurrencyUtil as L } from '../index';

(async () => {
  console.log('getHistorySchema');
  console.log(L.getHistorySchema());

  console.log('getRecentHistory MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n');
  console.log(
    await L.getRecentHistory('mainnet', 'MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n')
  );

  console.log('getRecentHistory QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR');
  console.log(
    await L.getRecentHistory('testnet', 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR')
  );
})();
