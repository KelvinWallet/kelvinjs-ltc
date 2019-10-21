"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
(async () => {
    console.log(await index_1.ltcCurrencyUtil.getFeeOptions('mainnet'));
    console.log(await index_1.ltcCurrencyUtil.getFeeOptions('testnet'));
})();
