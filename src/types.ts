import { BigNumberish } from 'ethers';

export enum Protocol {
  UniswapV2 = 0,
  UniswapV3 = 1,
  Curve = 2,
  CurveV2 = 3,
  Balancer = 4,
  BalancerV2 = 5,
  Bancor = 6,
  Kyber = 7,
  KSwap = 8,
  SushiSwap = 9,
  DefiSwap = 10,
  Convergence = 11,
  LuaSwap = 12,
  ShibaSwap = 13,

  // BSC
  MDEX = 14,
  BiSwap = 15,
  ApeSwap = 16,
  BabySwap = 17,
  KnightSwap = 18,
  DefiBox = 19,
  BakerySwap = 20,
  AutoShark = 21,
  BenSwap = 22,
  BurgeSwap = 23,
  JetSwap = 24,
  PancakeSwap = 25,

  // OKC
  AISwap = 26,
  CherrySwap = 27,
  JSwap = 28,
}

export enum ChainId {
  Ethereum,
  BSC,
  OKC,
}

export type QuoteParam = {
  blockNumber?: number;
  inputAmount: BigNumberish;
  inputToken: string;
  outputToken: string;
  protocol: Protocol;
  poolAddress?: string;
  chainId?: ChainId;
};

export type SwapParam = {
  calldata: string;
  inputToken: string;
  inputAmount: string;
  outputToken: string;
  blockNumber?: number;
  ethValue?: string;
  exchangeAddress?: string;
  tokenApproveAddress?: string;
  walletAddress?: string;
};

export type QuoteResponse = {
  outputAmount: string;
};

export type SwapResponse = {
  outputAmount: string;
  gasUsed: string;
  gasLimit: string;
};
