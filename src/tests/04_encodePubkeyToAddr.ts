import { ltcCurrencyUtil as L } from '../index';

const f = L.encodePubkeyToAddr;

console.log(
  f(
    'testnet',
    '0411be1528cff183dfa82723f96443a20e3290a45eb482c217cd7c039b2cb8654676e296aa9603d5463a1104240fa1423f268674caec46d3cc0326fbd1fc8cc8e0'
  )
);
console.log(
  f(
    'testnet',
    '04434b4913e58aef8861c026d4c6e0b070a5fccd27478e25e934359aafa5e3d019a8631c2c1174e952403f72909d10252164406dff98d9e2fba9dafc29fea51194'
  )
);
console.log(
  f(
    'testnet',
    '04342115b3b93014a015e73d47fbd44cc0a2e0225b7a3c3401fd8653062c69070f13f71ff37e7bad33debf2acfab1615687ccf0a3918bfc3433fbc24c2bdf286ef'
  )
);

/*

QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR
QPAkV3FQmMoeUfQ8DsD7nF9fb56PMWxt2g
QX1oC55bytJD36R8tftTjiPMnDfLSbEQm2

*/
