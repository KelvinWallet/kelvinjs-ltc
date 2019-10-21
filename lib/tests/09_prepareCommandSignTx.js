"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
(async () => {
    const schema = index_1.ltcCurrencyUtil.getPreparedTxSchema();
    const [cmd, info] = await index_1.ltcCurrencyUtil.prepareCommandSignTx({
        network: 'testnet',
        accountIndex: 0,
        fromPubkey: '0411be1528cff183dfa82723f96443a20e3290a45eb482c217cd7c039b2cb8654676e296aa9603d5463a1104240fa1423f268674caec46d3cc0326fbd1fc8cc8e0',
        toAddr: 'QPAkV3FQmMoeUfQ8DsD7nF9fb56PMWxt2g',
        amount: '800000',
        feeOpt: '100000',
    });
    console.log(`transaction info has ${schema.length} entries`);
    console.log(`transaction info entry names: ${schema.map(s => s.label)}`);
    console.log(`transaction info entry: ${schema.map(s => info[s.key].value + (info[s.key].link ? `(${info[s.key].link})` : ''))}`);
    console.log('USB armadillo command cmdid', cmd.commandId);
    console.log('USB armadillo command payload', cmd.payload.toString('hex'));
})();
