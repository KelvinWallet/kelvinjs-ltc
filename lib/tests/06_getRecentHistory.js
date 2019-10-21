"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
(async () => {
    console.log('getHistorySchema');
    console.log(index_1.ltcCurrencyUtil.getHistorySchema());
    console.log('getRecentHistory MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n');
    console.log(await index_1.ltcCurrencyUtil.getRecentHistory('mainnet', 'MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n'));
    console.log('getRecentHistory QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR');
    console.log(await index_1.ltcCurrencyUtil.getRecentHistory('testnet', 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR'));
})();
