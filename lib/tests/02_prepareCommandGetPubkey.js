"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const f = async (network, id) => {
    const { commandId, payload } = index_1.ltcCurrencyUtil.prepareCommandGetPubkey(network, id);
    console.log(`network=${network} id=${id}`);
    console.log('    armadillo command id:', commandId);
    console.log('    armadillo command payload', payload.toString('hex'));
    console.log('');
};
f('mainnet', 0);
f('mainnet', 1);
f('mainnet', 2);
f('testnet', 0);
f('testnet', 1);
f('testnet', 2);
