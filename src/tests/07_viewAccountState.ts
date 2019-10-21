import { ltcCurrencyUtil as L } from '../index';

const f = async (network: string, addr: string): Promise<void> => {
  const b = await L.getBalance(network, addr);

  const schema: Array<{
    key: string;
    label: string;
    format: string;
  }> = L.getHistorySchema();

  const rows = await L.getRecentHistory(network, addr);

  console.log(`balance is: ${b}`);
  console.log(`history view has ${schema.length} columns names`);
  console.log(`history column names: ${schema.map(s => s.label)}`);
  for (const row of rows) {
    console.log(
      `history row: ${schema.map(
        s => row[s.key].value + (row[s.key].link ? `(${row[s.key].link})` : '')
      )}`
    );
  }
};

// f('mainnet', 'MBuTKxJaHMN3UsRxQqpGRPdA7sCfE1UF7n');
f('testnet', 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR');
