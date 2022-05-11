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
  error?: string;
};

export type SwapResponse = {
  outputAmount: string;
  error?: string;
};
