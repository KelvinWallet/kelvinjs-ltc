export declare type InsMode = 'P2PKH' | 'P2SHP2WPKH' | 'P2WPKH';
export declare type OutMode = 'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2WSH';
export declare const selectUtxos: (utxos: number[], insMode: InsMode, outMode: OutMode, amount: number, feeRate: number, dustFeeRate: number, discardFeeRate?: number) => [number[], number, number];
