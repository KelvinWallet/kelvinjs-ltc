"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
(async () => {
    console.log('getBalance MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n');
    console.log(await index_1.ltcCurrencyUtil.getBalance('mainnet', 'MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n'));
    console.log('getBalance QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR');
    console.log(await index_1.ltcCurrencyUtil.getBalance('testnet', 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR'));
})();
