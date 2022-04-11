import { BigNumberish } from 'ethers';

export enum Protocol {
  UniswapV2,
  UniswapV3,
  Curve,
  CurveV2,
}

export type QuoteParam = {
  blockNumber?: number;
  inputAmount: BigNumberish;
  inputToken: string;
  outputToken: string;
  protocol: Protocol;
  poolAddress?: string;
};

export type QuoteResponse = {
  outputAmount: string;
};
