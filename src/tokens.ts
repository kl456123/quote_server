import { ChainId } from './types';

export type Token = {
  symbol: string;
  decimals: number;
  address: string;
};

export const tokensEthereum: Record<string, Token> = {
  NativeToken: {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'ETH',
    decimals: 18,
  },
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
  },
  WBTC: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    decimals: 8,
  },
  DAI: {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    decimals: 18,
    symbol: 'DAI',
  },
  TUSD: {
    address: '0x0000000000085d4780b73119b644ae5ecd22b376',
    decimals: 6,
    symbol: 'TUSD',
  },
  SUSD: {
    address: '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
    decimals: 6,
    symbol: 'SUSD',
  },
  UNI: {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    decimals: 18,
    symbol: 'UNI',
  },
  MATIC: {
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    decimals: 18,
    symbol: 'MATIC',
  },
  AAVE: {
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    decimals: 18,
    symbol: 'AAVE',
  },

  YFI: {
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    decimals: 18,
    symbol: 'YFI',
  },
};

export const tokensPolygon: Record<string, Token> = {
  NativeToken: {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'MATIC',
    decimals: 18,
  },
  WMATIC: {
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    symbol: 'WMATIC',
    decimals: 18,
  },
  USDT: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    symbol: 'USDT',
    decimals: 6,
  },
  USDC: {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    decimals: 6,
  },
  WBTC: {
    address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    symbol: 'WBTC',
    decimals: 8,
  },
  DAI: {
    address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    decimals: 18,
    symbol: 'DAI',
  },
};

export const tokensBSC: Record<string, Token> = {
  NativeToken: {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'BNB',
    decimals: 18,
  },
  WBNB: {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    decimals: 18,
  },
  USDT: {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    decimals: 6,
  },
  USDC: {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC',
    decimals: 6,
  },
  BTCB: {
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    symbol: 'BTCB',
    decimals: 8,
  },
  DAI: {
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    decimals: 18,
    symbol: 'DAI',
  },
  ETH: {
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
    symbol: 'ETH',
  },
  BUSD: {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    decimals: 18,
    symbol: 'BUSD',
  },
};

export const tokensOKC: Record<string, Token> = {
  NativeToken: {
    address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    symbol: 'OKT',
    decimals: 18,
  },
  WOKT: {
    address: '0x8f8526dbfd6e38e3d8307702ca8469bae6c56c15',
    symbol: 'WOKT',
    decimals: 18,
  },
  USDT: {
    address: '0x382bb369d343125bfb2117af9c149795c6c65c50',
    symbol: 'USDT',
    decimals: 6,
  },
  USDC: {
    address: '0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85',
    symbol: 'USDC',
    decimals: 6,
  },
  DAI: {
    address: '0x21cde7e32a6caf4742d00d44b07279e7596d26b9',
    decimals: 18,
    symbol: 'DAI',
  },
  ETHK: {
    address: '0xef71ca2ee68f45b9ad6f72fbdb33d707b872315c',
    decimals: 18,
    symbol: 'ETHK',
  },
  OKB: {
    address: '0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2',
    decimals: 18,
    symbol: 'OKB',
  },
  BTCK: {
    address: '0x54e4622dc504176b3bb432dccaf504569699a7ff',
    decimals: 18,
    symbol: 'BTCK',
  },
};

export const tokensByChain: Partial<{
  [chainId in ChainId]: Record<string, Token>;
}> = {
  [ChainId.Ethereum]: tokensEthereum,
  [ChainId.Polygon]: tokensPolygon,
  [ChainId.BSC]: tokensBSC,
  [ChainId.OKC]: tokensOKC,
};
