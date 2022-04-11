export type Token = {
  symbol: string;
  decimals: number;
  address: string;
};

export const tokens: Record<string, Token> = {
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
};
