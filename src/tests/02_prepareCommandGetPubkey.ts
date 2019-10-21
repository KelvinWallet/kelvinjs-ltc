import { ltcCurrencyUtil as L } from '../index';

const f = async (network: string, id: number): Promise<void> => {
  const { commandId, payload } = L.prepareCommandGetPubkey(network, id);
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

/*
network=mainnet id=0
    armadillo command id: 262
    armadillo command payload 080212090a0780808080080000

network=mainnet id=1
    armadillo command id: 262
    armadillo command payload 080212090a0781808080080000

network=mainnet id=2
    armadillo command id: 262
    armadillo command payload 080212090a0782808080080000

network=testnet id=0
    armadillo command id: 262
    armadillo command payload 5001080212090a0780808080080000

network=testnet id=1
    armadillo command id: 262
    armadillo command payload 5001080212090a0781808080080000

network=testnet id=2
    armadillo command id: 262
    armadillo command payload 5001080212090a0782808080080000

*/
