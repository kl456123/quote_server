import { BigNumberish } from 'ethers';

export enum Protocol {
  UniswapV2,
  UniswapV3,
  Curve,
  CurveV2,
  Balancer,
  BalancerV2,
  Bancor,
  Kyber,
  KSwap,
  SushiSwap,
  DefiSwap,
  Convergence,
  LuaSwap,
  ShibaSwap,

  // BSC
  MDEX,
  BiSwap,
  ApeSwap,
  BabySwap,
  KnightSwap,
  DefiBox,
  BakerySwap,
  AutoShark,
  BenSwap,
  BurgeSwap,
  JetSwap,
  PancakeSwap,

  // OKC
  AISwap,
  CherrySwap,
  JSwap,
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
  inputAmount: string;
  outputAmount: string;
  inputToken: string;
  outputToken: string;
  blockNumber: number;
  protocolName: string;
};

export type SwapResponse = {
  outputAmount: string;
  gasUsed: string;
  gasLimit: string;
};
