import { ltcCurrencyUtil as L } from '../index';

(async () => {
  const schema: Array<{
    key: string;
    label: string;
    format: string;
  }> = L.getPreparedTxSchema();

  const [cmd, info] = await L.prepareCommandSignTx({
    network: 'testnet',
    accountIndex: 0,
    fromPubkey:
      '0411be1528cff183dfa82723f96443a20e3290a45eb482c217cd7c039b2cb8654676e296aa9603d5463a1104240fa1423f268674caec46d3cc0326fbd1fc8cc8e0',
    toAddr: 'QPAkV3FQmMoeUfQ8DsD7nF9fb56PMWxt2g',
    amount: '800000',
    feeOpt: '100000',
  });

  console.log(`transaction info has ${schema.length} entries`);
  console.log(`transaction info entry names: ${schema.map(s => s.label)}`);
  console.log(
    `transaction info entry: ${schema.map(
      s => info[s.key].value + (info[s.key].link ? `(${info[s.key].link})` : '')
    )}`
  );

  console.log('USB armadillo command cmdid', cmd.commandId);
  console.log('USB armadillo command payload', cmd.payload.toString('hex'));
})();

/*

GOAL:

SEND  0.00800000 LTC
FROM  QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR ( PUBKEY 0411be1528cff183dfa82723f96443a20e3290a45eb482c217cd7c039b2cb8654676e296aa9603d5463a1104240fa1423f268674caec46d3cc0326fbd1fc8cc8e0 )
TO    QPAkV3FQmMoeUfQ8DsD7nF9fb56PMWxt2g

RESULT:

transaction info has 3 entries
transaction info entry names: Amount,To,Fee
transaction info entry: 0.008,QPAkV3FQmMoeUfQ8DsD7nF9fb56PMWxt2g,0.000256
USB armadillo command cmdid 262
USB armadillo command payload 50010802229c010a2f0a07808080800800001220ddd91fc9c3721c20c3b4dab1f9082398d4e95134e91ae979c68fe7d37c994eeb20a0c21e0a310a07808080800800001220e0ee9ae216745b7a8967491248996ed7856c91744374f46cfee52e0ca28e976d180120989b1e121a0880ea301a141c229ac6c4928a7994d07b8552fc03374e35fe20121a0886ab0a1a1404aa07fdd9b5a2e0339afff708ff9f9dea6999ea

*/
