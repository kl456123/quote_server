export type Token = {
  symbol: string;
  decimals: number;
  address: string;
};

export const tokens: Record<string, Token> = {
  ETH: {
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
