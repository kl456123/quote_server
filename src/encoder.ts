import { ethers, BigNumberish } from 'ethers';

import { ChainId, Protocol } from './types';
import { DexRouter, DexRouter__factory } from './typechain';
import { IMarketMaker } from './typechain/DexRouter';
import { getProvider, getAdapterAddr } from './utils';
import { dexRouterMap } from './constants';
import { tokensByChain } from './tokens';

export type SmartSwapParams = {
  fromTokenAmount: BigNumberish;
  fromToken: string;
  toToken: string;
  chainId: ChainId;
  protocol: Protocol;
  poolAddress: string;
};

export function encodeSmartSwap({
  fromTokenAmount,
  fromToken,
  toToken,
  chainId,
  protocol,
  poolAddress,
}: SmartSwapParams) {
  const minReturnAmount = 0;
  const deadLine = ethers.constants.MaxUint256;
  const baseRequest: DexRouter.BaseRequestStruct = {
    fromToken,
    toToken,
    fromTokenAmount,
    minReturnAmount,
    deadLine,
  };
  const batchesAmount = [fromTokenAmount];
  const exctraData: IMarketMaker.PMMSwapRequestStruct[] = [];
  const uniV2AdapterAddr = getAdapterAddr(chainId, protocol);
  const mixAdapters = [uniV2AdapterAddr];
  const assetTo = [poolAddress];
  const weight = Number(10000).toString(16).replace('0x', ''); // 100%
  const reverse = '8';
  // const reverse = '0';
  const rawData = [
    '0x' +
      reverse +
      '0000000000000000000' +
      weight +
      poolAddress.replace('0x', ''),
  ];
  const router: DexRouter.RouterPathStruct = {
    mixAdapters,
    assetTo,
    rawData,
    extraData: ['0x'],
    fromToken,
  };
  const batches: DexRouter.RouterPathStruct[][] = [[router]];

  const iface = DexRouter__factory.createInterface();
  const calldata = iface.encodeFunctionData('smartSwap', [
    baseRequest,
    batchesAmount,
    batches,
    exctraData,
  ]);
  return calldata;
}

export type UnxSwapParams = {
  fromToken: string;
  minReturn: BigNumberish;
  fromTokenAmount: BigNumberish;
  poolAddress: string;
  reversed: boolean;
};

export function encodeUnxswap(unxSwapParams: UnxSwapParams) {
  const iface = new ethers.utils.Interface([
    'function unxswap(address srcToken,uint256 amount,uint256 minReturn,bytes32[] pools)returns(uint256 returnAmount)',
  ]);
  const srcToken = unxSwapParams.fromToken;
  const minReturn = unxSwapParams.minReturn;
  const reversed = unxSwapParams.reversed ? '0x8' : '0x0';
  const poolFee = Number(997000000).toString(16).replace('0x', '');
  const poolBytes =
    reversed +
    '000000000000000' +
    poolFee +
    unxSwapParams.poolAddress.replace('0x', '');
  const pools = [poolBytes];
  const amount = unxSwapParams.fromTokenAmount;
  const calldata = iface.encodeFunctionData('unxswap', [
    srcToken,
    amount,
    minReturn,
    pools,
  ]);
  return calldata;
}
