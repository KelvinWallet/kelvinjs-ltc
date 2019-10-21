"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const bech32 = require("bech32");
const bs58 = require("bs58");
const kelvinjs_protob_1 = require("kelvinjs-protob");
const litecoin_pb_1 = require("kelvinjs-protob/dist/litecoin_pb");
const selectUtxos_1 = require("./selectUtxos");
const crypto = require("crypto");
var AddrType;
(function (AddrType) {
    AddrType[AddrType["INVALID"] = 0] = "INVALID";
    AddrType[AddrType["MAIN_P2PKH"] = 1] = "MAIN_P2PKH";
    AddrType[AddrType["MAIN_P2SH"] = 2] = "MAIN_P2SH";
    AddrType[AddrType["MAIN_P2SH_LEGACY"] = 3] = "MAIN_P2SH_LEGACY";
    AddrType[AddrType["MAIN_P2WPKH"] = 4] = "MAIN_P2WPKH";
    AddrType[AddrType["MAIN_P2WSH"] = 5] = "MAIN_P2WSH";
    AddrType[AddrType["TEST_P2PKH"] = 6] = "TEST_P2PKH";
    AddrType[AddrType["TEST_P2SH"] = 7] = "TEST_P2SH";
    AddrType[AddrType["TEST_P2SH_LEGACY"] = 8] = "TEST_P2SH_LEGACY";
    AddrType[AddrType["TEST_P2WPKH"] = 9] = "TEST_P2WPKH";
    AddrType[AddrType["TEST_P2WSH"] = 10] = "TEST_P2WSH";
})(AddrType || (AddrType = {}));
const { LtcShowAddr, LtcGetXPub, LtcSignTx } = litecoin_pb_1.LtcCommand;
const { LtcTxIn, LtcTxOut } = LtcSignTx;
const MIN_SAT_TO_SEND = 100000;
const MAX_SAT_TO_SEND = 99999999999999;
const DUST_TXOUT_FEE_RATE = 3000;
const DISCARD_CHANGE_FEE_RATE = 10000;
const MIN_FEE_RATE_SAT_PER_KVB = 1000;
const MAX_FEE_RATE_SAT_PER_KVB = 10000000;
const MAX_FEE_TOTAL = 999999999;
const MAX_TXOUT_IDX = 99999;
function isString(x) {
    return typeof x === 'string';
}
function isArray(x) {
    return Array.isArray(x);
}
function isNonNegativeInteger(x) {
    return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
}
function isObject(x) {
    return typeof x === 'object' && x !== null && !Array.isArray(x);
}
function isValidTxoutIndex(n) {
    return isNonNegativeInteger(n) && n <= MAX_TXOUT_IDX;
}
function isValidBlockchainTimestamp(n) {
    const LOW = 1317972665;
    const UPP = 4102444800;
    return isNonNegativeInteger(n) && n >= LOW && n <= UPP;
}
function isNonNegativeDecimalStr(s) {
    return isString(s) && /^(0|[1-9][0-9]*)$/.test(s);
}
function isValidTransactionId(s) {
    return isString(s) && /^[0-9a-f]{64}$/.test(s);
}
function isValidAmountNum(v) {
    return isNonNegativeInteger(v) && v <= 84e14;
}
function isValidAmountStr(s) {
    return (isNonNegativeDecimalStr(s) &&
        (s.length <= 15 || (s.length === 16 && s <= '8400000000000000')));
}
function isValidFeeRateToPayNum(v) {
    return (isNonNegativeInteger(v) &&
        v >= MIN_FEE_RATE_SAT_PER_KVB &&
        v <= MAX_FEE_RATE_SAT_PER_KVB);
}
function isValidFeeRateToPayStr(s) {
    return (isValidAmountStr(s) &&
        +s >= MIN_FEE_RATE_SAT_PER_KVB &&
        +s <= MAX_FEE_RATE_SAT_PER_KVB);
}
function isValidHexString(s) {
    return /^([0-9a-f]{2})*$/.test(s);
}
function isValidPubKey(s) {
    return /^04[0-9a-f]{128}$/.test(s);
}
function sha256(d) {
    return crypto
        .createHash('sha256')
        .update(d)
        .digest();
}
function ripemd160(d) {
    return crypto
        .createHash('ripemd160')
        .update(d)
        .digest();
}
function hash256(d) {
    return sha256(sha256(d));
}
function hash160(d) {
    return ripemd160(sha256(d));
}
const w = (errMsg, genValueOrError) => {
    try {
        return genValueOrError();
    }
    catch (err) {
        if (typeof errMsg === 'string') {
            throw Error(errMsg);
        }
        else {
            throw Error(errMsg(err));
        }
    }
};
function decodeBase58checkAddress(h) {
    if (!(h.length <= 99)) {
        throw Error('invalid input');
    }
    const b = w('invalid input', () => bs58.decode(h));
    if (!(b.length >= 5)) {
        throw Error('invalid input');
    }
    const versionAndData = b.slice(0, b.length - 4);
    const providedChecksum = b.slice(b.length - 4);
    const computedCheckSum = hash256(versionAndData).slice(0, 4);
    if (!(providedChecksum[0] === computedCheckSum[0] &&
        providedChecksum[1] === computedCheckSum[1] &&
        providedChecksum[2] === computedCheckSum[2] &&
        providedChecksum[3] === computedCheckSum[3])) {
        throw Error('invalid input');
    }
    const versionByteValue = versionAndData[0];
    const encodedPayloadBytes = versionAndData.slice(1);
    if (!(encodedPayloadBytes.length === 20)) {
        throw Error('invalid input');
    }
    return [versionByteValue, encodedPayloadBytes];
}
function decodeBech32Address(inputAddr) {
    const result = bech32.decode(inputAddr);
    if (!(result.words.length >= 1)) {
        throw Error('invalid input');
    }
    const witnessVersion = result.words[0];
    if (!(witnessVersion === 0)) {
        throw Error('invalid input');
    }
    const witnessProgramBytes = bech32.fromWords(result.words.slice(1));
    if (!(witnessProgramBytes.length === 20 || witnessProgramBytes.length === 32)) {
        throw Error('invalid input');
    }
    const hrp = result.prefix;
    return [hrp, witnessProgramBytes];
}
function decodeBase58checkAddressNoException(h, errorVer = 0xff) {
    try {
        return decodeBase58checkAddress(h);
    }
    catch (_) {
        return [errorVer, Buffer.from([])];
    }
}
function decodeBech32AddressNoException(inputAddr, errorHrp = 'ERROR') {
    try {
        return decodeBech32Address(inputAddr);
    }
    catch (_) {
        return [errorHrp, Buffer.from([])];
    }
}
function decodeLtcAddr(addr) {
    const [ver, b58content] = decodeBase58checkAddressNoException(addr);
    const [hrp, b32content] = decodeBech32AddressNoException(addr);
    const b58len = b58content.length;
    const b32len = b32content.length;
    if (ver === 0x30 && b58len === 20) {
        return [AddrType.MAIN_P2PKH, b58content];
    }
    if (ver === 0x32 && b58len === 20) {
        return [AddrType.MAIN_P2SH, b58content];
    }
    if (ver === 0x05 && b58len === 20) {
        return [AddrType.MAIN_P2SH_LEGACY, b58content];
    }
    if (ver === 0x6f && b58len === 20) {
        return [AddrType.TEST_P2PKH, b58content];
    }
    if (ver === 0x3a && b58len === 20) {
        return [AddrType.TEST_P2SH, b58content];
    }
    if (ver === 0xc4 && b58len === 20) {
        return [AddrType.TEST_P2SH_LEGACY, b58content];
    }
    if (hrp === 'ltc' && b32len === 20) {
        return [AddrType.MAIN_P2WPKH, b32content];
    }
    if (hrp === 'ltc' && b32len === 32) {
        return [AddrType.MAIN_P2WSH, b32content];
    }
    if (hrp === 'tltc' && b32len === 20) {
        return [AddrType.TEST_P2WPKH, b32content];
    }
    if (hrp === 'tltc' && b32len === 32) {
        return [AddrType.TEST_P2WSH, b32content];
    }
    return [AddrType.INVALID, Buffer.from([])];
}
function modernizeLtcAddr(addr) {
    const [addrType, content] = decodeLtcAddr(addr);
    if (addrType === AddrType.MAIN_P2SH_LEGACY) {
        return encodeBase58check(0x32, content);
    }
    if (addrType === AddrType.TEST_P2SH_LEGACY) {
        return encodeBase58check(0x3a, content);
    }
    return addr;
}
function truncateToSixDecimals(x) {
    const regexMatch = x.match(/^.*\..{6}/);
    if (regexMatch !== null) {
        return regexMatch[0];
    }
    return x;
}
function compressPubKey(input) {
    if (!(input.length === 65 && input[0] === 0x04)) {
        throw Error(`invalid input ${input.toString('hex')}`);
    }
    return Buffer.concat([
        Buffer.from([0x02 + (input[64] & 0x01)]),
        input.slice(1, 1 + 32),
    ]);
}
function encodeBase58check(ver, data) {
    if (!(Number.isInteger(ver) && ver >= 0x00 && ver <= 0xff)) {
        throw Error(`invalid ver: ${ver}`);
    }
    const a = Buffer.concat([Buffer.from([ver]), data]);
    const b = hash256(a).slice(0, 4);
    const c = Buffer.concat([a, b]);
    return bs58.encode(c);
}
function encodePubkeyToAddrP2SH(network, pubkey) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidPubKey(pubkey)) {
        throw Error(`invalid pubkey: ${pubkey}`);
    }
    const pubkeyBuf = compressPubKey(Buffer.from(pubkey, 'hex'));
    const pubkeyHash = hash160(pubkeyBuf);
    const redeemScript = Buffer.concat([Buffer.from([0x00, 0x14]), pubkeyHash]);
    const scriptHash = hash160(redeemScript);
    const verByte = network === 'mainnet' ? 0x32 : 0x3a;
    return encodeBase58check(verByte, scriptHash);
}
async function performMyGet({ endpoint, path, timeoutMs, }) {
    const { status, data } = await axios_1.default({
        baseURL: endpoint,
        url: path,
        timeout: timeoutMs,
        validateStatus: () => true,
    });
    return {
        statusCode: status,
        payload: data,
    };
}
async function performMyPost({ endpoint, path, timeoutMs, payload, }) {
    const { status, data } = await axios_1.default({
        method: 'post',
        baseURL: endpoint,
        url: path,
        timeout: timeoutMs,
        data: payload,
        validateStatus: () => true,
    });
    return {
        statusCode: status,
        payload: data,
    };
}
async function getUnspentTxOuts(network, addr) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidAddr(network, addr)) {
        throw Error(`not a valid address: ${addr}`);
    }
    if (network === 'mainnet') {
        const { statusCode, payload } = await performMyGet({
            endpoint: 'https://api.blockcypher.com',
            path: `/v1/ltc/main/addrs/${addr}?unspentOnly=1`,
            timeoutMs: 5000,
        });
        if (statusCode !== 200) {
            throw Error(`unexpected HTTP statusCode: ${statusCode}`);
        }
        if (!((x) => isObject(x) &&
            isArray(x.txrefs) &&
            x.txrefs.every((e) => isObject(e) &&
                isValidTransactionId(e.tx_hash) &&
                isValidTxoutIndex(e.tx_output_n) &&
                isValidAmountNum(e.value)))(payload)) {
            throw Error(`unexpected HTTP response: ${payload}`);
        }
        return payload.txrefs.map(e => [e.tx_hash, e.tx_output_n, e.value]);
    }
    else {
        const { statusCode, payload } = await performMyGet({
            endpoint: 'https://testnet.litecore.io',
            path: `/api/addr/${addr}/utxo`,
            timeoutMs: 5000,
        });
        if (statusCode !== 200) {
            throw Error(`unexpected HTTP statusCode: ${statusCode}`);
        }
        if (!((x) => isArray(x) &&
            x.every((e) => isObject(e) &&
                isValidTransactionId(e.txid) &&
                isValidTxoutIndex(e.vout) &&
                isValidAmountNum(e.satoshis)))(payload)) {
            throw Error(`unexpected HTTP response: ${payload}`);
        }
        return payload.map(e => [e.txid, e.vout, e.satoshis]);
    }
}
function getSupportedNetworks() {
    return ['mainnet', 'testnet'];
}
function getFeeOptionUnit() {
    return 'sat/kB';
}
function isValidFeeOption(network, feeOpt) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    return isValidFeeRateToPayStr(feeOpt);
}
function isValidAddr(network, addr) {
    const ltcAddrType = decodeLtcAddr(addr)[0];
    if (network === 'mainnet') {
        return [
            AddrType.MAIN_P2PKH,
            AddrType.MAIN_P2SH,
            AddrType.MAIN_P2SH_LEGACY,
            AddrType.MAIN_P2WPKH,
            AddrType.MAIN_P2WSH,
        ].includes(ltcAddrType);
    }
    else if (network === 'testnet') {
        return [
            AddrType.TEST_P2PKH,
            AddrType.TEST_P2SH,
            AddrType.TEST_P2SH_LEGACY,
            AddrType.TEST_P2WPKH,
            AddrType.TEST_P2WSH,
        ].includes(ltcAddrType);
    }
    else {
        throw Error(`invalid network: ${network}`);
    }
}
function isValidNormAmount(amount) {
    if (!/^(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(amount)) {
        return false;
    }
    if (amount.includes('.')) {
        const fractPart = amount.slice(amount.indexOf('.') + 1);
        if (fractPart.length > 8) {
            const afterThe8thDecimalPlace = fractPart.slice(8);
            if (!/^0+$/.test(afterThe8thDecimalPlace)) {
                return false;
            }
        }
    }
    const wholePart = amount.replace(/\..*$/, '');
    if (wholePart.length >= 9 ||
        (wholePart.length === 8 && wholePart > '84000000') ||
        (wholePart === '84000000' && /\..*[1-9]/.test(amount))) {
        return false;
    }
    return true;
}
function convertNormAmountToBaseAmount(amount) {
    if (!isValidNormAmount(amount)) {
        throw Error(`invalid LTC amount: ${amount}`);
    }
    const wholePart = amount.replace(/\..*$/, '');
    const fractPart = amount
        .replace(/^.*\.|^[0-9]$/, '')
        .padEnd(8, '0')
        .slice(0, 8);
    return (wholePart + fractPart).replace(/^0+/, '').padStart(1, '0');
}
function convertBaseAmountToNormAmount(amount) {
    if (!isValidAmountStr(amount)) {
        throw Error(`invalid satoshi amount: ${amount}`);
    }
    const zeroPaddedSatoshis = amount.padStart(16, '0');
    const wholeNumberPart = zeroPaddedSatoshis.slice(0, 8);
    const fractNumberPart = zeroPaddedSatoshis.slice(8);
    const partHead = wholeNumberPart === '00000000' ? '0' : wholeNumberPart.replace(/^0+/, '');
    const partTail = fractNumberPart === '00000000'
        ? ''
        : '.' + fractNumberPart.replace(/0+$/, '');
    return partHead + partTail;
}
function getUrlForAddr(network, addr) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidAddr(network, addr)) {
        throw Error(`not a valid address: ${addr}`);
    }
    if (network === 'mainnet') {
        return `https://blockchair.com/litecoin/address/${addr}`;
    }
    else {
        return `https://tltc.bitaps.com/${addr}`;
    }
}
function getUrlForTx(network, txid) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidTransactionId(txid)) {
        throw Error(`invalid txid: ${txid}`);
    }
    if (network === 'mainnet') {
        return `https://blockchair.com/litecoin/transaction/${txid}`;
    }
    else {
        return `https://tltc.bitaps.com/${txid}`;
    }
}
function encodePubkeyToAddr(network, pubkey) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidPubKey(pubkey)) {
        throw Error(`invalid pubkey: ${pubkey}`);
    }
    return encodePubkeyToAddrP2SH(network, pubkey);
}
async function getBalance(network, addr) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidAddr(network, addr)) {
        throw Error(`not a valid address: ${addr}`);
    }
    if (network === 'mainnet') {
        const { statusCode, payload } = await performMyGet({
            endpoint: 'https://api.blockcypher.com',
            path: `/v1/ltc/main/addrs/${addr}`,
            timeoutMs: 5000,
        });
        if (statusCode !== 200) {
            throw Error(`unexpected HTTP statusCode: ${statusCode}`);
        }
        if (!((x) => isObject(x) && isValidAmountNum(x.final_balance))(payload)) {
            throw Error(`unexpected HTTP response: ${payload}`);
        }
        const balanceBaseUnit = '' + payload.final_balance;
        const balanceNormUnit = convertBaseAmountToNormAmount(balanceBaseUnit);
        return balanceNormUnit;
    }
    else {
        const { statusCode, payload } = await performMyGet({
            endpoint: 'https://api.bitaps.com',
            path: `/ltc/testnet/v1/blockchain/address/state/${addr}`,
            timeoutMs: 5000,
        });
        if (statusCode !== 200) {
            throw Error(`unexpected HTTP statusCode: ${statusCode}`);
        }
        if (!((x) => isObject(x) && isObject(x.data) && isValidAmountNum(x.data.balance))(payload)) {
            throw Error(`unexpected HTTP response: ${payload}`);
        }
        const balanceBaseUnit = '' + payload.data.balance;
        const balanceNormUnit = convertBaseAmountToNormAmount(balanceBaseUnit);
        return balanceNormUnit;
    }
}
function getHistorySchema() {
    return [
        { key: 'txid', label: 'Transaction ID', format: 'hash' },
        { key: 'amount', label: 'Amount', format: 'value' },
        { key: 'date', label: 'Time', format: 'date' },
        { key: 'isConfirmed', label: 'isConfirmed', format: 'boolean' },
    ];
}
async function getRecentHistory(network, addr) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidAddr(network, addr)) {
        throw Error(`not a valid address: ${addr}`);
    }
    const { statusCode, payload } = await performMyGet({
        endpoint: 'https://api.bitaps.com',
        path: network === 'mainnet'
            ? `/ltc/v1/blockchain/address/transactions/${addr}`
            : `/ltc/testnet/v1/blockchain/address/transactions/${addr}`,
        timeoutMs: 5000,
    });
    if (statusCode !== 200) {
        throw Error(`unexpected HTTP statusCode: ${statusCode}`);
    }
    if (!((x) => isObject(x) &&
        isObject(x.data) &&
        isArray(x.data.list) &&
        x.data.list.every((e) => isObject(e) &&
            isValidTransactionId(e.txId) &&
            isValidAmountNum(e.received) &&
            isValidAmountNum(e.sent) &&
            isNonNegativeInteger(e.confirmations) &&
            isValidBlockchainTimestamp(e.timestamp)))(payload)) {
        throw Error(`unexpected HTTP response: ${payload}`);
    }
    const getAmountSummary = (recv, sent) => {
        if (recv >= sent) {
            return convertBaseAmountToNormAmount('' + (recv - sent));
        }
        else {
            return '-' + convertBaseAmountToNormAmount('' + (sent - recv));
        }
    };
    return payload.data.list.map(e => ({
        txid: { value: e.txId, link: getUrlForTx(network, e.txId) },
        amount: { value: getAmountSummary(e.received, e.sent) },
        date: { value: new Date(e.timestamp * 1000).toISOString() },
        isConfirmed: { value: '' + (e.confirmations > 0) },
    }));
}
async function getFeeOptions(network) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (network === 'testnet') {
        return ['1000', '100000', '500000'];
    }
    const { statusCode, payload } = await performMyGet({
        endpoint: 'https://api.blockcypher.com',
        path: '/v1/ltc/main',
        timeoutMs: 5000,
    });
    if (statusCode !== 200) {
        throw Error(`unexpected HTTP statusCode: ${statusCode}`);
    }
    if (!((x) => isObject(x) &&
        isValidFeeRateToPayNum(x.low_fee_per_kb) &&
        isValidFeeRateToPayNum(x.medium_fee_per_kb) &&
        isValidFeeRateToPayNum(x.high_fee_per_kb))(payload)) {
        throw Error(`unexpected HTTP response: ${payload}`);
    }
    return [
        '' + payload.low_fee_per_kb,
        '' + payload.medium_fee_per_kb,
        '' + payload.high_fee_per_kb,
    ];
}
function getPreparedTxSchema() {
    return [
        { key: 'amount', label: 'Amount', format: 'value' },
        { key: 'to', label: 'To', format: 'address' },
        { key: 'fee', label: 'Fee', format: 'value' },
    ];
}
function validateSignTxRequest(req) {
    if (!['mainnet', 'testnet'].includes(req.network)) {
        throw Error(`invalid network: ${req.network}`);
    }
    if (!(isNonNegativeInteger(req.accountIndex) && req.accountIndex < 2 ** 31)) {
        throw Error(`invalid account index: ${req.accountIndex}`);
    }
    if (!isValidPubKey(req.fromPubkey)) {
        throw Error(`invalid account public key: ${req.fromPubkey}`);
    }
    if (!isValidAddr(req.network, req.toAddr)) {
        throw Error(`not a valid address: ${req.toAddr}`);
    }
    if (!isValidNormAmount(req.amount)) {
        throw Error(`not a valid amount to send: ${req.amount}`);
    }
    const t = +convertNormAmountToBaseAmount(req.amount);
    if (!(t >= MIN_SAT_TO_SEND && t <= MAX_SAT_TO_SEND)) {
        throw Error(`not a valid amount to send: ${req.amount}`);
    }
    if (!isValidFeeRateToPayStr(req.feeOpt)) {
        throw Error(`not a valid fee option: ${req.feeOpt}`);
    }
    if (encodePubkeyToAddrP2SH(req.network, req.fromPubkey) ===
        modernizeLtcAddr(req.toAddr)) {
        throw Error('sending funds back to the same address is prohibited');
    }
}
function validatePreparedTx(preparedTx) {
    if (!(preparedTx.commandId >= 0x0000 &&
        preparedTx.commandId <= 0xffff &&
        preparedTx.payload.length <= 7000)) {
        throw Error('the input prepared tx is invalid');
    }
}
async function prepareCommandSignTx(req) {
    validateSignTxRequest(req);
    const toAddr = modernizeLtcAddr(req.toAddr);
    const fromAddr = encodePubkeyToAddrP2SH(req.network, req.fromPubkey);
    const satoshiAmount = +convertNormAmountToBaseAmount(req.amount);
    const [toAddrType, toAddrContent] = decodeLtcAddr(toAddr);
    const outMode = ((x) => {
        switch (x) {
            case AddrType.MAIN_P2PKH:
            case AddrType.TEST_P2PKH:
                return 'P2PKH';
            case AddrType.MAIN_P2SH:
            case AddrType.TEST_P2SH:
                return 'P2SH';
            case AddrType.MAIN_P2WPKH:
            case AddrType.TEST_P2WPKH:
                return 'P2WPKH';
            case AddrType.MAIN_P2WSH:
            case AddrType.TEST_P2WSH:
                return 'P2WSH';
            default:
                throw Error('control reaches a point which shall be unreachable');
        }
    })(toAddrType);
    const utxos = await getUnspentTxOuts(req.network, fromAddr);
    const [selectedUtxoIndices, chgAmount, feeAmount] = selectUtxos_1.selectUtxos(utxos.map(x => x[2]), 'P2SHP2WPKH', outMode, satoshiAmount, +(req.feeOpt || 0), DUST_TXOUT_FEE_RATE, DISCARD_CHANGE_FEE_RATE);
    if (!(isValidAmountNum(chgAmount) &&
        isValidAmountNum(feeAmount) &&
        feeAmount <= MAX_FEE_TOTAL)) {
        throw Error('failed to build a transaction with reasonable fee option');
    }
    const selectedUtxos = selectedUtxoIndices.map(i => utxos[i]);
    const mLtcSignTx = new LtcSignTx();
    mLtcSignTx.setInputsList(selectedUtxos.map(([txId, outIdx, value]) => {
        const mLtcTxIn = new LtcTxIn();
        mLtcTxIn.setPathList([2 ** 31 + req.accountIndex, 0, 0]);
        mLtcTxIn.setPrevTid(Buffer.from(txId, 'hex').reverse());
        mLtcTxIn.setPrevIndex(outIdx);
        mLtcTxIn.setValue(value);
        return mLtcTxIn;
    }));
    const mLtcTxOut0 = new LtcTxOut();
    const mLtcTxOut1 = new LtcTxOut();
    mLtcTxOut1.setValue(chgAmount);
    mLtcTxOut1.setP2shShash(decodeLtcAddr(fromAddr)[1]);
    mLtcTxOut0.setValue(satoshiAmount);
    switch (outMode) {
        case 'P2PKH':
            mLtcTxOut0.setP2pkhPkhash(toAddrContent);
            break;
        case 'P2SH':
            mLtcTxOut0.setP2shShash(toAddrContent);
            break;
        case 'P2WPKH':
            mLtcTxOut0.setP2pkhPkhash(toAddrContent);
            break;
        case 'P2WSH':
            mLtcTxOut0.setP2wshShash(toAddrContent);
            break;
        default:
            throw Error('control reaches a point which shall be unreachable');
    }
    mLtcSignTx.setOutputsList(chgAmount > 0 ? [mLtcTxOut0, mLtcTxOut1] : [mLtcTxOut0]);
    const mLtcCommand = new litecoin_pb_1.LtcCommand();
    mLtcCommand.setMode(litecoin_pb_1.LtcCommand.LtcMode.P2SH_P2WPKH);
    mLtcCommand.setTestnet(req.network === 'testnet');
    mLtcCommand.setSignTx(mLtcSignTx);
    const satoshisToKelvinWalletAmount = (s) => truncateToSixDecimals(convertBaseAmountToNormAmount(s));
    return [
        {
            commandId: kelvinjs_protob_1.LITECOIN_CMDID,
            payload: Buffer.from(mLtcCommand.serializeBinary()),
        },
        {
            to: { value: toAddr },
            amount: { value: satoshisToKelvinWalletAmount('' + satoshiAmount) },
            fee: { value: satoshisToKelvinWalletAmount('' + feeAmount) },
        },
    ];
}
function buildSignedTx(req, preparedTx, walletRsp) {
    validateSignTxRequest(req);
    validatePreparedTx(preparedTx);
    const rsp = w('Invalid wallet response: bad LtcResponse encoding', () => litecoin_pb_1.LtcResponse.deserializeBinary(walletRsp.payload));
    const signedTxObj = rsp.getSignedTx();
    if (signedTxObj === undefined) {
        if (rsp.hasError()) {
            throw Error(`Unexpected wallet errorCode response: ${rsp.getError()}`);
        }
        throw Error('Unexpected wallet response');
    }
    return Buffer.from(signedTxObj.getRawtx_asU8()).toString('hex');
}
async function submitTransaction(network, signedTx) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!isValidHexString(signedTx)) {
        throw Error(`invalid signedTx: ${signedTx}`);
    }
    if (network === 'mainnet') {
        const { statusCode, payload } = await performMyPost({
            endpoint: 'https://api.blockcypher.com',
            path: '/v1/ltc/main/txs/push',
            timeoutMs: 5000,
            payload: { tx: signedTx },
        });
        if (statusCode === 400) {
            if (((x) => isObject(x) && isString(x.error))(payload)) {
                throw Error(payload.error);
            }
            throw Error('API server api.blockcypher.com reports 400');
        }
        if (statusCode !== 201) {
            throw Error(`unexpected HTTP statusCode: ${statusCode}`);
        }
        if (!((x) => isObject(x) && isValidTransactionId(x.hash))(payload)) {
            throw Error(`unexpected HTTP response: ${payload}`);
        }
        return payload.hash;
    }
    else {
        const { statusCode, payload } = await performMyPost({
            endpoint: 'https://testnet.litecore.io',
            path: '/api/tx/send',
            timeoutMs: 5000,
            payload: { rawtx: signedTx },
        });
        if (statusCode === 400) {
            throw Error('Got HTTP 400 Bad Request from API server');
        }
        if (statusCode !== 200) {
            throw Error(`unexpected HTTP statusCode: ${statusCode}`);
        }
        if (!((x) => isObject(x) && isValidTransactionId(x.txid))(payload)) {
            throw Error(`unexpected HTTP response: ${payload}`);
        }
        return payload.txid;
    }
}
function prepareCommandGetPubkey(network, accountIndex) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!(isNonNegativeInteger(accountIndex) && accountIndex <= 0x7fffffff)) {
        throw Error(`invalid accountIndex: ${accountIndex}`);
    }
    const mLtcGetXPub = new LtcGetXPub();
    mLtcGetXPub.setPathList([2 ** 31 + accountIndex, 0, 0]);
    const mLtcCommand = new litecoin_pb_1.LtcCommand();
    mLtcCommand.setMode(litecoin_pb_1.LtcCommand.LtcMode.P2SH_P2WPKH);
    mLtcCommand.setTestnet(network === 'testnet');
    mLtcCommand.setGetXpub(mLtcGetXPub);
    return {
        commandId: kelvinjs_protob_1.LITECOIN_CMDID,
        payload: Buffer.from(mLtcCommand.serializeBinary()),
    };
}
function parsePubkeyResponse(walletRsp) {
    const rsp = w('Invalid wallet response: bad LtcResponse encoding', () => litecoin_pb_1.LtcResponse.deserializeBinary(walletRsp.payload));
    const xpubObj = rsp.getXpub();
    if (xpubObj === undefined) {
        if (rsp.hasError()) {
            throw Error(`Unexpected wallet errorCode response: ${rsp.getError()}`);
        }
        throw Error('Unexpected wallet response');
    }
    return ('04' +
        Buffer.from(xpubObj.getXpub_asU8())
            .slice(0, 64)
            .toString('hex'));
}
function prepareCommandShowAddr(network, accountIndex) {
    if (!['mainnet', 'testnet'].includes(network)) {
        throw Error(`invalid network: ${network}`);
    }
    if (!(isNonNegativeInteger(accountIndex) && accountIndex <= 0x7fffffff)) {
        throw Error(`invalid accountIndex: ${accountIndex}`);
    }
    const mLtcShowAddr = new LtcShowAddr();
    mLtcShowAddr.setPathList([2 ** 31 + accountIndex, 0, 0]);
    const mLtcCommand = new litecoin_pb_1.LtcCommand();
    mLtcCommand.setMode(litecoin_pb_1.LtcCommand.LtcMode.P2SH_P2WPKH);
    mLtcCommand.setTestnet(network === 'testnet');
    mLtcCommand.setShowAddr(mLtcShowAddr);
    return {
        commandId: kelvinjs_protob_1.LITECOIN_CMDID,
        payload: Buffer.from(mLtcCommand.serializeBinary()),
    };
}
exports.ltcCurrencyUtil = {
    getSupportedNetworks,
    getFeeOptionUnit,
    isValidFeeOption,
    isValidAddr,
    isValidNormAmount,
    convertNormAmountToBaseAmount,
    convertBaseAmountToNormAmount,
    getUrlForAddr,
    getUrlForTx,
    encodePubkeyToAddr,
    getBalance,
    getHistorySchema,
    getRecentHistory,
    getFeeOptions,
    getPreparedTxSchema,
    prepareCommandSignTx,
    buildSignedTx,
    submitTransaction,
    prepareCommandGetPubkey,
    parsePubkeyResponse,
    prepareCommandShowAddr,
};
exports.default = exports.ltcCurrencyUtil;
