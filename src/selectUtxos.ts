/**
 * This module implements Bitcoin coin selection routine
 */

export type InsMode = 'P2PKH' | 'P2SHP2WPKH' | 'P2WPKH';

export type OutMode = 'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2WSH';

const NUM_VBYTES_BASE: { [key in InsMode]: number } = {
  P2PKH: 10,
  P2SHP2WPKH: 10.5,
  P2WPKH: 10.5,
};

const NUM_VBYTES_PER_IN: { [key in InsMode]: number } = {
  P2PKH: 148,
  P2SHP2WPKH: 91,
  P2WPKH: 68,
};

const NUM_VBYTES_PER_OUT: { [key in OutMode]: number } = {
  P2PKH: 34,
  P2SH: 32,
  P2WPKH: 31,
  P2WSH: 43,
};

const TXOUT_VALUE_MAX = 1e14;
const FEE_RATE_MIN = 1e3;
const FEE_RATE_MAX = 1e7;

const looksLikeTxOutValue = (n: number): boolean => {
  return Number.isSafeInteger(n) && 0 <= n && n < TXOUT_VALUE_MAX;
};

const looksLikeFeeRate = (n: number): boolean => {
  return (
    Number.isSafeInteger(n) &&
    (n === 0 || (FEE_RATE_MIN <= n && n <= FEE_RATE_MAX))
  );
};

const validate = (x: boolean): void => {
  if (!x) {
    throw Error('input validation fails');
  }
};

const isDust = (value: number, mode: OutMode, dustFeeRate: number): boolean => {
  validate(looksLikeTxOutValue(value));
  validate(looksLikeFeeRate(dustFeeRate));
  return value < dustThreshold(mode, dustFeeRate);
};

/**
 * We don't know how to estimate the "actual size" it needs to spend a txout
 * that is not P2PKH or P2WPKH.  So let's just do a rough estimation, as we
 * can see in:
 *
 * https://github.com/bitcoin/bitcoin/blob/v0.18.1/src/policy/policy.cpp#L18-L50
 *
 * Ensure the result is not less than what is estimated by the C++ code.
 * Ensure return value is an non-negative INTEGER by rounding up.
 */
const dustThreshold = (mode: OutMode, dustFeeRate: number): number => {
  validate(looksLikeFeeRate(dustFeeRate));
  if (mode === 'P2PKH' || mode === 'P2SH') {
    const numVbytes = NUM_VBYTES_PER_OUT.P2PKH + NUM_VBYTES_PER_IN.P2PKH;
    return Math.ceil((numVbytes * dustFeeRate) / 1000);
  }
  if (mode === 'P2WPKH' || mode === 'P2WSH') {
    const numVbytes = NUM_VBYTES_PER_OUT.P2WPKH + NUM_VBYTES_PER_IN.P2WPKH;
    return Math.ceil((numVbytes * dustFeeRate) / 1000);
  }
  throw Error('control reaches a point which shall be unreachable');
};

/**
 * Get number of bytes of a CompactSize Unsigned Integer.
 *
 * @param - v the value to be serialize
 *
 * @returns byte length of v after serialization
 *
 * We don't need to consider values that are too large, because this function
 * is only used to estimate the serialization byte length of the "number of
 * inputs" field in a transaction.
 */
const compactSizeUintLen = (v: number): number => {
  if (!(Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER)) {
    throw Error(`v is out of range of our consideration: ${v}`);
  }
  if (v <= 252) {
    return 1;
  }
  if (v <= 0xffff) {
    return 3;
  }
  if (v <= 0xffffffff) {
    return 5;
  }
  return 9;
};

/**
 * Estimate (the maximum) virtual size of a transaction.
 *
 * @param - numIns the number of inputs; must not exceed 999
 * @param - insMode the kind of scriptSig to be generated for all inputs
 * @param - outMode the kind of scriptPubKey to which the money will go
 * @param - change whether we should add one extra output for change
 *
 * @returns number of virtual bytes
 *
 * We don't need extra information about the inputs because we require all
 * inputs to have the same scriptPubKey.
 */
const e = (
  numIns: number,
  insMode: InsMode,
  outMode: OutMode,
  change: boolean
): number => {
  if (!(Number.isInteger(numIns) && numIns >= 0 && numIns <= 999)) {
    throw Error(`numIns is out of range of our consideration: ${numIns}`);
  }
  const chgMode = insMode === 'P2SHP2WPKH' ? 'P2SH' : insMode;
  return Math.ceil(
    NUM_VBYTES_BASE[insMode] +
      (compactSizeUintLen(numIns) - 1) +
      NUM_VBYTES_PER_IN[insMode] * numIns +
      NUM_VBYTES_PER_OUT[outMode] * 1 +
      NUM_VBYTES_PER_OUT[chgMode] * (change ? 1 : 0)
  );
};

/**
 * Select UTXOs if the request is fulfillable.
 *
 * @param - utxos the list of values for currently available UTXO set
 * @param - insMode the kind of scriptSig to be generated for all inputs
 * @param - outMode the kind of scriptPubKey to which the money will go
 * @param - amount the number of satoshis to send
 * @param - feeRate the number of satoshis per kilo virtual byte to miner
 *
 * @returns a tuple of three elements; element 0 is a list of indices of the
 * input `utxos` representing the chosen subset of utxos; element 1 is the
 * amount of an extra txout (change) to send to original account (or zero if
 * no change is suggested); element 2 is the total remaining amount left for
 * miner as transaction fee.
 *
 * Apply the simplest algorithm to choose as many UTXOs as possible, up to 10.
 * Although we want to do transactions that are as small as possible, we also
 * want to do transactions that consume as many UTXOs as possible to reduce
 * the UTXO set.  These two goals seem equally significant and conflicting at
 * first, but for simplicity let the later take priority.
 */
export const selectUtxos = (
  utxos: number[],
  insMode: InsMode,
  outMode: OutMode,
  amount: number,
  feeRate: number,
  dustFeeRate: number,
  discardFeeRate: number = dustFeeRate
): [number[], number, number] => {
  // Perform input validation
  validate(utxos.length <= 999);
  validate(utxos.every(looksLikeTxOutValue));
  validate(looksLikeTxOutValue(amount));
  validate(looksLikeFeeRate(feeRate));
  validate(looksLikeFeeRate(dustFeeRate));
  validate(looksLikeFeeRate(discardFeeRate));

  // The amount to send cannot be too small
  if (isDust(amount, outMode, dustFeeRate)) {
    throw Error('the amount to send is too small');
  }

  // The amount to send cannot be higher than balance
  const balance = utxos.reduce((a, b) => a + b, 0);
  if (amount > balance) {
    throw Error('insufficient balance');
  }

  // The top UTXOs from given UTXO set for simplicity
  const top = utxos
    .map((v, origArrIdx) => ({ v, origArrIdx }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 10);

  // Define function to sum all values of top
  const S = (u: Array<{ v: number }>) =>
    u.map(u => u.v).reduce((a, b) => a + b, 0);

  // Check if the selected top UTXO set is already good with a change output
  const f = Math.ceil((e(top.length, insMode, outMode, true) * feeRate) / 1000);
  const c = S(top) - amount - f;
  const chgMode = insMode === 'P2SHP2WPKH' ? 'P2SH' : insMode;
  if (c > 0 && !isDust(c, chgMode, dustFeeRate)) {
    return [top.map(x => x.origArrIdx), c, f];
  }

  // Check if the selected top UTXO set is good without a change output
  const f2a = Math.ceil(
    (e(top.length, insMode, outMode, false) * feeRate) / 1000
  );
  const f2b = S(top) - amount - f2a;
  if (f2b >= 0) {
    return [top.map(x => x.origArrIdx), 0, f2a + f2b];
  }

  // Check whether the failure is only due to the fragmentation of balance...
  // In such case, the balance is actually enough to perform such tx, we
  // reject this request only because currently we don't support signing tx
  // with more than 10 inputs.
  if (utxos.length > top.length) {
    const d =
      balance -
      amount -
      Math.ceil((e(utxos.length, insMode, outMode, true) * feeRate) / 1000);
    const q =
      balance -
      amount -
      Math.ceil((e(utxos.length, insMode, outMode, false) * feeRate) / 1000);
    if ((d > 0 && !isDust(d, chgMode, dustFeeRate)) || q >= 0) {
      throw Error('your UTXO set is too fragmented to pay the amount at once');
    }
  }

  throw Error('insufficient balance');
};
