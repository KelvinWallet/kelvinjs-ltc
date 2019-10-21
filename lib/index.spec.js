"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('offline utilities', () => {
    test('getSupportedNetworks', () => {
        const f = index_1.ltcCurrencyUtil.getSupportedNetworks;
        expect(f()).toStrictEqual(['mainnet', 'testnet']);
    });
    test('getFeeOptionUnit', () => {
        const f = index_1.ltcCurrencyUtil.getFeeOptionUnit;
        expect(f()).toBe('sat/kB');
    });
    test('isValidFeeOption', () => {
        const f = index_1.ltcCurrencyUtil.isValidFeeOption;
        expect(() => f('foobarNetwork', '8000')).toThrow();
        for (const n of ['mainnet', 'testnet']) {
            expect(f(n, ' 12000')).toBe(false);
            expect(f(n, '12000 ')).toBe(false);
            expect(f(n, '12000\t')).toBe(false);
            expect(f(n, '12000\n')).toBe(false);
            expect(f(n, '12000\r')).toBe(false);
            expect(f(n, '12000.')).toBe(false);
            expect(f(n, '12000.345')).toBe(false);
            expect(f(n, '-3')).toBe(false);
            expect(f(n, '0')).toBe(false);
            expect(f(n, '1')).toBe(false);
            expect(f(n, '999')).toBe(false);
            expect(f(n, '10000001')).toBe(false);
            expect(f(n, '10000002')).toBe(false);
            expect(f(n, '999999999')).toBe(false);
            expect(f(n, '1000')).toBe(true);
            expect(f(n, '3000')).toBe(true);
            expect(f(n, '8000')).toBe(true);
            expect(f(n, '50000')).toBe(true);
            expect(f(n, '10000000')).toBe(true);
        }
    });
    test('isValidAddr', () => {
        const OK_MAINNET_ADDRESSES = [
            'MJT9UAWCTgUCc3cys8EZG11KE5KA9f6byn',
            '3CF1AH6EWZcmoYM5mFFDSMkuuNiiCDxu16',
            'Li7h2fFsPcuGmHtfpc37DWfYp2CA1iMZ27',
            'ltc1qafw6m2th7auhcuf7j2etj09vnlgmxdzvqclnau',
            'LPBBQoBPak64cW3HjCHL5PU6DPbWDyiNUn',
            '32kVUhaZVByHMRUhSZPxGY91yHonkYBwEh',
            'MMvzq9x8i99bb3WwaDgzcmWgYXnBdXfswU',
            'LU9kcSQJEKUTzMiTf2tfxbtks5kvaa4ccV',
            '3QpijHJTA4voYQa4w97dgA8UQQ59bUoEKM',
            'MSFR86iPxQ87BQCGbTTNzDEHVsbmYtvRBJ',
            'LWVfzV7W68Djnz32WLyjYcHy3TXSFWsh4P',
            '3QRwhTUU86dNhaCP7s3fcFZ8GMA9CkERCn',
            'MKUzupFsfyybDCqRLz9YP6SpqV1aDULhNd',
            'LYXzD1DBcLkWzZjVqq2PkyiSiVyAXJPKqb',
            '3QWYeq6844DBYhmb4T4pc6cJcwyiKDqNrm',
            'MNU82LmBdWJTPFVKhmvrykPypJoxNCwjgf',
            'LXK3T3y44WAav3QJRifkvTAPVhaEy3rV9P',
            '32n9RH1ZMe2bBmo8rAXgiv85MBECctwp3P',
            'MW8BtVPp54es2GXCrCgK5jBRym1d3Tip8N',
        ];
        const OK_TESTNET_ADDRESSES = [
            'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR',
            '2MsftP2YHXW9rvCqqHkttyrjqLEWWWd6EVD',
            'mgrqMMxuVVeS5izjUTvhAjupU7k7vm6Lf6',
            'tltc1qlz63rmxvtr46mxucnwq35lrl2e23jlrpry0sxm',
            'n2YHaV9e7ZpWj3ZnXnuoZ42zzj3YQJBGTj',
            '2NDPNKTHaqo4UxyZQhYxZsELkGNhfesAAop',
            'QZRUHvzWFbc7JMtH9LcYYXM3sZy6onwyT7',
            'mrdcrugR9T1WBe3guoYaPT8DTsRxvSEUnn',
            '2N7VWAAfRJaUbyZ2vZoLC9oGFtVgA7Zjj7J',
            'QeBazid1deSygCcVu2Ua5mfWESK7FnN9Bu',
            'mtByguWnLBX96VMpFrDhNeEv2g3zyStrvB',
            '2NASf8EkQDXvHD33Rks7fUUdKca4xCw3hhA',
            'QZb4KER8QjFYzMSr7uvesmnXUrbyQoZ65u',
            'mvL9CpAi7QC3o99Bdzs9JxjR8V27athfpY',
            '2NCAGwkZGMRjMd9uJn6tJ2zb9twEdeGVJJJ',
            'QWZAaafFGNGzcd8g6Fc4bAmK2vKBAoBwnT',
            'mhsApYi8jKyhgv6uEzMVKKEPmPECJwGEQz',
            '2N5CkNYZQz7JDynBt9xNNrHLbCwjUCCcz7H',
            'QURTysyqSpUsUuG7MwX37qgJ13TnrVECzQ',
        ];
        const NG_ADDRESSES = [
            '',
            'x',
            'gpghYDmAnRPEvFurp8RuBMU52PHCjMLYkhD7zUq5PwZ2unZzeZoTRrqDmGsvSbgJK2GfWE8nbpy',
            'DM4GFJ9p3yioJncnsgGAqP9efnXXDjPbf29GNzwSNRnsziT43Dtu',
            'cRhKP3LEYNfL7eZCkdr5PnJrkiaWmXKcWUsq2QAFLu2TZU5Y6gD1v',
            '2g3AmcnuWrch3wAXgnqpz44xRsZzPKVaRi7',
            'JsvfXviZPbo5gAzC2HQYkrgKvvnu6c6TQQAvti4yjbV6Aqq9MZHsxX8FMzcGbKTciV2GMxfUtQr',
            'muadTxqQgozRNfQdFNseukGmrjFL4yu8eQg',
            'nPG7Lvb6v45o2tJ8HScaT4NUsLhEhywHvQ',
            'cMzDZgJvfHrcuaHuUgkm7X8wdrVk6bH7XREbbK5H2Zs8xfhxGG3k1',
            'mviNmCnhYdKtXiN8RxxsbHA4vojRSKKusc',
            '2E7NDFM58NYqmhVt9cxiTAgr1HYjvqrDPgS',
            '25jJi7AMUaN87LW3UffhwaeAKYgsvapV9w9suwyJ3cpGzaGPriEjyi1kWC56Zq2RNsTzVia9Rm9w',
            '5Hc2jbsgFNRCUpBbfduSw3FEvcLyTRDiw8wCVnWozpYUWcHUCXyQ',
            'prp1b6opyhKHWdb6urdpd4XJNT9qronQjvLyXcq7pE9i4d6HVVtumu9n6VQepGpTkpj7tKteE2Z',
            '26qfgtgSZ5ivVc5ggUkvuUFJCGSshZxNJM9',
            'K2FxQRXVPiqggg3CkcFpoqcDYUjnHj18W2JLeMP2n8B5XoJRLrLFwE1djUJDTY77GJyg4uYrVTw',
            '2LqZC3TBAmb4qWSY6mvoFWrc8Vcj3ZY73Kx',
            '2hDxHceybW9Do3npiciAXvkRkXT5e96Lzmx7oZ2oAcnUQXkcvzY',
            '823NAy1BP7tkDdozKHW3neSZByykBc2uhJyFRksGcyJy4CEyWHo',
            'T2ds6G3ew1mCt97aDqjU9gS3n9XpgH4wpzkcupHRd9Xc4qa9Be2p',
            '2Ui8d4ZGMKEJvx5Daa6h11RnfduQzLUAWcU',
            '6tC6omd8TF8tYApNmotAa2RKakZjDJjRrK',
            'T5bcbJJrtTZFHnaX6MGETWMwxsjxPHQgqyGgFthuMvYLv1STUwDq',
            'e6JTu87E3x2ffdJHCoAPubG5eJQHKoQc3AfYbexWyoFBfs6RdQ6t',
            '2YArT7XzRoWgA6q3RsWic4KXsAQhjUQMHEJ',
            'gbvTQf1vkyozhCQTKGgYRF6Wk1fkX7kQN6ECvFdej8puXXxAB1pSeAxEGtCbg68YJBpgbqxJVzc',
            '2Cr5x7zDdNaD42AFG5G3gsQkStTHsmrH6KjrHjBceZVmrP14eV8ParrDaCdEY17ejWhGAHC3ubDW',
            '2cg6Dgced1XFwmAVe1Eg4G1YmeoxYRfLH3j',
            '84EneutRfswyd8kcynjqQ13ftpUF1ngfTty6er6Y4XNYkmJfuvm',
            'T8PHAswiYXpNkoiTEHJTd2RGVxSzh7bLaMmWXVcXqcF7zgn3jnuT',
            '2VnzRLA6etYm8ZBAnUyy2T5Jewcmc1shg4nvMSta6vXVLjz4Aqp',
            'DasuhGapnZ3qy7yxCG3DLgjidpCUaEGBV8',
            'ecBo9wyuRjo4BwHse91tHzmH8V8cmHqCd8',
            '2LHNpEbLRaXVDD1NNcfcQwpFWKjy958j1iE',
            '2DGDbUtTDoAcVv91xWhySVeRJDA3sk92Taf',
            'AzS7scVcXcTMqYg8EJ3VEmQpFk5fPYCV6d',
            'cSyoPfiu6t8YWD19Qw8NFW5aDvBigmtuYTmwTF3nwHZMqkogY5bg',
            'E7PX9h4gPG4zyo2NF882cgk3MMjaNRfvWN1EdqxpC2vSUx3zvfY69dyyZ59r4zYr3hCn9zZQCha',
            'mjpo2fv8SQqPiypp3rEWj7GPwxVRZzEFhb4LTHxAmYtwUcdcPJyCdD2b75bEQrwDcuUjtiPWjsb',
            '25weULrvXpn6Pd9Jf82eK8BD4QoB7tERbj6Xg7aSQNknXhkG2SaW6TeEyddJCeazE6wL2r6PDMBB',
            '3Yt8UAgjpJ4CagyBzqUNJiRciPpGLqcXyenKoQisXZn8WRQ69UcukJ5LVp34fF4CoD8ChCApghGZG',
            'uuRsWzECUdHU5EobACDb3AP9ufnJyWoZxH',
            '23vi1DRPXH6dwLz7AcebXLwBHi9HYH7ycLW',
            '2RHUvhyxC2NZomi5qBHLo9hV7fa32fMcWLY',
            '26rTSeW1xrUsojH1K83pviBj2NMYyqYYhh2',
            'QiBcJVKtt4eghFRWnLP681EPgmkfn6xYrPK',
            'qNxuZwCx7iT96dhzBB3ADskTj6nYFoNr2cCytKTEGWkhdVsJTi46RAuxNE6UVuBiNH5xrPQ33Qq',
            'c4dB2Yziv34h27c7HGDiqEpabwsGyUD5kK',
            'K4FqfLNVs5WGmtpjcv61HHeddWNkaAmM5oDrjbP8gDVUPMnJQasSbmabt2eXZPFMZ4T23dPKZid',
        ];
        const f = index_1.ltcCurrencyUtil.isValidAddr;
        for (const a of OK_MAINNET_ADDRESSES) {
            expect(f('mainnet', a)).toBe(true);
            expect(f('testnet', a)).toBe(false);
            expect(() => f('foobarNetwork', a)).toThrow();
        }
        for (const a of OK_TESTNET_ADDRESSES) {
            expect(f('mainnet', a)).toBe(false);
            expect(f('testnet', a)).toBe(true);
            expect(() => f('foobarNetwork', a)).toThrow();
        }
        for (const a of NG_ADDRESSES) {
            expect(f('mainnet', a)).toBe(false);
            expect(f('testnet', a)).toBe(false);
            expect(() => f('foobarNetwork', a)).toThrow();
        }
    });
    test('isValidNormAmount', () => {
        const f = index_1.ltcCurrencyUtil.isValidNormAmount;
        expect(f('')).toBe(false);
        expect(f(' ')).toBe(false);
        expect(f(' 1')).toBe(false);
        expect(f('1 ')).toBe(false);
        expect(f('1\n')).toBe(false);
        expect(f('-2')).toBe(false);
        expect(f('3.141592653589793')).toBe(false);
        expect(f('3.999999999')).toBe(false);
        expect(f('84000000.00000001')).toBe(false);
        expect(f('84000000.1')).toBe(false);
        expect(f('84000001')).toBe(false);
        expect(f('99000000')).toBe(false);
        expect(f('999000000')).toBe(false);
        expect(f('0')).toBe(true);
        expect(f('0.00000000')).toBe(true);
        expect(f('0.0000000000000000')).toBe(true);
        expect(f('0.00000001')).toBe(true);
        expect(f('0.0000000100000000')).toBe(true);
        expect(f('0.001')).toBe(true);
        expect(f('0.1')).toBe(true);
        expect(f('1')).toBe(true);
        expect(f('1.')).toBe(true);
        expect(f('3.1415')).toBe(true);
        expect(f('3.141500')).toBe(true);
        expect(f('3.14150000')).toBe(true);
        expect(f('3.14159265')).toBe(true);
        expect(f('3.141592650')).toBe(true);
        expect(f('3.141592650000000')).toBe(true);
        expect(f('84000000')).toBe(true);
        expect(f('84000000.')).toBe(true);
        expect(f('84000000.0')).toBe(true);
        expect(f('84000000.00000000')).toBe(true);
        expect(f('84000000.000000000000')).toBe(true);
    });
    test('convertNormAmountToBaseAmount', () => {
        const f = index_1.ltcCurrencyUtil.convertNormAmountToBaseAmount;
        expect(() => f('')).toThrow();
        expect(() => f(' ')).toThrow();
        expect(() => f('-3')).toThrow();
        expect(() => f('20\n')).toThrow();
        expect(() => f('.1')).toThrow();
        expect(() => f('999999999')).toThrow();
        expect(() => f('0.222222222222')).toThrow();
        expect(f('0.00000001')).toBe('1');
        expect(f('0.000000010')).toBe('1');
        expect(f('0.000002')).toBe('200');
        expect(f('0.00000200')).toBe('200');
        expect(f('0.001')).toBe('100000');
        expect(f('0.00100000')).toBe('100000');
        expect(f('1')).toBe('100000000');
        expect(f('1.0')).toBe('100000000');
        expect(f('1.00000000')).toBe('100000000');
        expect(f('1.23456789')).toBe('123456789');
        expect(f('1.234567890000')).toBe('123456789');
        expect(f('84000000.0')).toBe('8400000000000000');
    });
    test('convertBaseAmountToNormAmount', () => {
        const f = index_1.ltcCurrencyUtil.convertBaseAmountToNormAmount;
        expect(() => f('')).toThrow();
        expect(() => f(' ')).toThrow();
        expect(() => f('-3')).toThrow();
        expect(() => f('20\n')).toThrow();
        expect(() => f('.1')).toThrow();
        expect(() => f('8400000000000001')).toThrow();
        expect(() => f('9999999999999999')).toThrow();
        expect(f('100000000')).toBe('1');
        expect(f('100000002')).toBe('1.00000002');
        expect(f('100000020')).toBe('1.0000002');
        expect(f('100000200')).toBe('1.000002');
        expect(f('100002000')).toBe('1.00002');
        expect(f('100020000')).toBe('1.0002');
        expect(f('100200000')).toBe('1.002');
        expect(f('102000000')).toBe('1.02');
        expect(f('120000000')).toBe('1.2');
        expect(f('3276540000')).toBe('32.7654');
        expect(f('100695741814649')).toBe('1006957.41814649');
        expect(f('3182193309499877')).toBe('31821933.09499877');
        expect(f('7400000000000001')).toBe('74000000.00000001');
        expect(f('8399999999999999')).toBe('83999999.99999999');
        expect(f('8400000000000000')).toBe('84000000');
    });
    test('getUrlForAddr', () => {
        const f = index_1.ltcCurrencyUtil.getUrlForAddr;
        const OK_MAINNET_ADDRESSES = [
            'MMvzq9x8i99bb3WwaDgzcmWgYXnBdXfswU',
            'MSFR86iPxQ87BQCGbTTNzDEHVsbmYtvRBJ',
            'MKUzupFsfyybDCqRLz9YP6SpqV1aDULhNd',
            'MNU82LmBdWJTPFVKhmvrykPypJoxNCwjgf',
            'MW8BtVPp54es2GXCrCgK5jBRym1d3Tip8N',
        ];
        const OK_TESTNET_ADDRESSES = [
            'QZRUHvzWFbc7JMtH9LcYYXM3sZy6onwyT7',
            'QeBazid1deSygCcVu2Ua5mfWESK7FnN9Bu',
            'QZb4KER8QjFYzMSr7uvesmnXUrbyQoZ65u',
            'QWZAaafFGNGzcd8g6Fc4bAmK2vKBAoBwnT',
            'QURTysyqSpUsUuG7MwX37qgJ13TnrVECzQ',
        ];
        for (const a of OK_MAINNET_ADDRESSES) {
            expect(f('mainnet', a)).toEqual(expect.stringMatching(/^https:/));
        }
        for (const a of OK_TESTNET_ADDRESSES) {
            expect(f('testnet', a)).toEqual(expect.stringMatching(/^https:/));
        }
    });
    test('getUrlForTx', () => {
        const f = index_1.ltcCurrencyUtil.getUrlForTx;
        const M_TXID = '0ae3e52cb6d816b03c6c91d92cac8f2f7f615264c5c3452bdfaf128d3f726062';
        const T_TXID = 'a7617369d433291fa88afac61f2b0719fbd364ceea50441650e2c6dd0e666cf6';
        expect(f('mainnet', M_TXID)).toEqual(expect.stringMatching(/^https:/));
        expect(f('testnet', T_TXID)).toEqual(expect.stringMatching(/^https:/));
    });
    test('encodePubkeyToAddr', () => {
        const f = index_1.ltcCurrencyUtil.encodePubkeyToAddr;
        const OK_PUBKEY = '04cbc087ca2e14b79a981a868c44c70748c495bfb118c1031a6ec3ef1a36e1ff78fef60c25860224481989cdccf80f990203fa0c1b851a8d0ca3f46b11ee14129d';
        const NG_PUBKEYS = [
            'cbc087ca2e14b79a981a868c44c70748c495bfb118c1031a6ec3ef1a36e1ff78fef60c25860224481989cdccf80f990203fa0c1b851a8d0ca3f46b11ee14129d',
            '03cbc087ca2e14b79a981a868c44c70748c495bfb118c1031a6ec3ef1a36e1ff78',
            '\n',
            '',
        ];
        const OK_MAINNET_TESTVECTORS = [
            {
                pubkey: '04cbc087ca2e14b79a981a868c44c70748c495bfb118c1031a6ec3ef1a36e1ff78fef60c25860224481989cdccf80f990203fa0c1b851a8d0ca3f46b11ee14129d',
                answer: 'MJT9UAWCTgUCc3cys8EZG11KE5KA9f6byn',
            },
        ];
        const OK_TESTNET_TESTVECTORS = [
            {
                pubkey: '0411be1528cff183dfa82723f96443a20e3290a45eb482c217cd7c039b2cb8654676e296aa9603d5463a1104240fa1423f268674caec46d3cc0326fbd1fc8cc8e0',
                answer: 'QM2eW3QXYcCx4Pbsurvv4ZBGUcxLUtnFKR',
            },
        ];
        expect(() => f('foobarNetwork', OK_PUBKEY)).toThrow();
        for (const p of NG_PUBKEYS) {
            expect(() => f('mainnet', p)).toThrow();
        }
        for (const { pubkey, answer } of OK_MAINNET_TESTVECTORS) {
            expect(f('mainnet', pubkey)).toBe(answer);
        }
        for (const { pubkey, answer } of OK_TESTNET_TESTVECTORS) {
            expect(f('testnet', pubkey)).toBe(answer);
        }
    });
    test('getHistorySchema', () => {
        const f = index_1.ltcCurrencyUtil.getHistorySchema;
        expect(f().length).toBe(4);
    });
    test('getPreparedTxSchema', () => {
        const f = index_1.ltcCurrencyUtil.getPreparedTxSchema;
        expect(f().length).toBe(3);
    });
    test('buildSignedTx', () => {
    });
    test('prepareCommandGetPubkey', () => {
        const f = index_1.ltcCurrencyUtil.prepareCommandGetPubkey;
        for (const n of ['mainnet', 'testnet']) {
            expect(() => f(n, 0)).not.toThrow();
            expect(() => f(n, 1)).not.toThrow();
            expect(() => f(n, 2)).not.toThrow();
            expect(() => f(n, 3)).not.toThrow();
            expect(() => f(n, 100)).not.toThrow();
            expect(() => f(n, 200)).not.toThrow();
            expect(() => f(n, 255)).not.toThrow();
            expect(() => f(n, 256)).not.toThrow();
            expect(() => f(n, 65535)).not.toThrow();
            expect(() => f(n, 65536)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 4)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 3)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 2)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 1)).not.toThrow();
            expect(() => f(n, 2 ** 31 + 0)).toThrow();
            expect(() => f(n, 2 ** 31 + 1)).toThrow();
            expect(() => f(n, 999999999999)).toThrow();
        }
    });
    test('parsePubkeyResponse', () => {
    });
    test('prepareCommandShowAddr', () => {
        const f = index_1.ltcCurrencyUtil.prepareCommandShowAddr;
        for (const n of ['mainnet', 'testnet']) {
            expect(() => f(n, 0)).not.toThrow();
            expect(() => f(n, 1)).not.toThrow();
            expect(() => f(n, 2)).not.toThrow();
            expect(() => f(n, 3)).not.toThrow();
            expect(() => f(n, 100)).not.toThrow();
            expect(() => f(n, 200)).not.toThrow();
            expect(() => f(n, 255)).not.toThrow();
            expect(() => f(n, 256)).not.toThrow();
            expect(() => f(n, 65535)).not.toThrow();
            expect(() => f(n, 65536)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 4)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 3)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 2)).not.toThrow();
            expect(() => f(n, 2 ** 31 - 1)).not.toThrow();
            expect(() => f(n, 2 ** 31 + 0)).toThrow();
            expect(() => f(n, 2 ** 31 + 1)).toThrow();
            expect(() => f(n, 999999999999)).toThrow();
        }
    });
});
