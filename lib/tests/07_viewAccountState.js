"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const f = async (network, addr) => {
    const b = await index_1.ltcCurrencyUtil.getBalance(network, addr);
    const schema = index_1.ltcCurrencyUtil.getHistorySchema();
    const rows = await index_1.ltcCurrencyUtil.getRecentHistory(network, addr);
    console.log(`balance is: ${b}`);
    console.log(`history view has ${schema.length} columns names`);
    console.log(`history column names: ${schema.map(s => s.label)}`);
    for (const row of rows) {
        console.log(`history row: ${schema.map(s => row[s.key].value + (row[s.key].link ? `(${row[s.key].link})` : ''))}`);
    }
};
f('testnet', 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR');
