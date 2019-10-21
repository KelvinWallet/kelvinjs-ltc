"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NUM_VBYTES_BASE = {
    P2PKH: 10,
    P2SHP2WPKH: 10.5,
    P2WPKH: 10.5,
};
const NUM_VBYTES_PER_IN = {
    P2PKH: 148,
    P2SHP2WPKH: 91,
    P2WPKH: 68,
};
const NUM_VBYTES_PER_OUT = {
    P2PKH: 34,
    P2SH: 32,
    P2WPKH: 31,
    P2WSH: 43,
};
const TXOUT_VALUE_MAX = 1e14;
const FEE_RATE_MIN = 1e3;
const FEE_RATE_MAX = 1e7;
const looksLikeTxOutValue = (n) => {
    return Number.isSafeInteger(n) && 0 <= n && n < TXOUT_VALUE_MAX;
};
const looksLikeFeeRate = (n) => {
    return (Number.isSafeInteger(n) &&
        (n === 0 || (FEE_RATE_MIN <= n && n <= FEE_RATE_MAX)));
};
const validate = (x) => {
    if (!x) {
        throw Error('input validation fails');
    }
};
const isDust = (value, mode, dustFeeRate) => {
    validate(looksLikeTxOutValue(value));
    validate(looksLikeFeeRate(dustFeeRate));
    return value < dustThreshold(mode, dustFeeRate);
};
const dustThreshold = (mode, dustFeeRate) => {
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
const compactSizeUintLen = (v) => {
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
const e = (numIns, insMode, outMode, change) => {
    if (!(Number.isInteger(numIns) && numIns >= 0 && numIns <= 999)) {
        throw Error(`numIns is out of range of our consideration: ${numIns}`);
    }
    const chgMode = insMode === 'P2SHP2WPKH' ? 'P2SH' : insMode;
    return Math.ceil(NUM_VBYTES_BASE[insMode] +
        (compactSizeUintLen(numIns) - 1) +
        NUM_VBYTES_PER_IN[insMode] * numIns +
        NUM_VBYTES_PER_OUT[outMode] * 1 +
        NUM_VBYTES_PER_OUT[chgMode] * (change ? 1 : 0));
};
exports.selectUtxos = (utxos, insMode, outMode, amount, feeRate, dustFeeRate, discardFeeRate = dustFeeRate) => {
    validate(utxos.length <= 999);
    validate(utxos.every(looksLikeTxOutValue));
    validate(looksLikeTxOutValue(amount));
    validate(looksLikeFeeRate(feeRate));
    validate(looksLikeFeeRate(dustFeeRate));
    validate(looksLikeFeeRate(discardFeeRate));
    if (isDust(amount, outMode, dustFeeRate)) {
        throw Error('the amount to send is too small');
    }
    const balance = utxos.reduce((a, b) => a + b, 0);
    if (amount > balance) {
        throw Error('insufficient balance');
    }
    const top = utxos
        .map((v, origArrIdx) => ({ v, origArrIdx }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 10);
    const S = (u) => u.map(u => u.v).reduce((a, b) => a + b, 0);
    const f = Math.ceil((e(top.length, insMode, outMode, true) * feeRate) / 1000);
    const c = S(top) - amount - f;
    const chgMode = insMode === 'P2SHP2WPKH' ? 'P2SH' : insMode;
    if (c > 0 && !isDust(c, chgMode, dustFeeRate)) {
        return [top.map(x => x.origArrIdx), c, f];
    }
    const f2a = Math.ceil((e(top.length, insMode, outMode, false) * feeRate) / 1000);
    const f2b = S(top) - amount - f2a;
    if (f2b >= 0) {
        return [top.map(x => x.origArrIdx), 0, f2a + f2b];
    }
    if (utxos.length > top.length) {
        const d = balance -
            amount -
            Math.ceil((e(utxos.length, insMode, outMode, true) * feeRate) / 1000);
        const q = balance -
            amount -
            Math.ceil((e(utxos.length, insMode, outMode, false) * feeRate) / 1000);
        if ((d > 0 && !isDust(d, chgMode, dustFeeRate)) || q >= 0) {
            throw Error('your UTXO set is too fragmented to pay the amount at once');
        }
    }
    throw Error('insufficient balance');
};
