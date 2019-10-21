import { ltcCurrencyUtil as L } from '../index';

(async () => {
  console.log('getBalance MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n');
  console.log(
    await L.getBalance('mainnet', 'MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n')
  );

  console.log('getBalance QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR');
  console.log(
    await L.getBalance('testnet', 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR')
  );
})();
