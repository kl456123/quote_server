import { BigNumberish, BigNumber } from 'ethers';
import { ethers } from 'ethers';
import { IERC20__factory } from './typechain';
import {
  tokensEthereum,
  tokensPolygon,
  tokensBSC,
  tokensOKC,
  tokensAvax,
} from './tokens';
import {
  BINANCE,
  BINANCE7,
  BINANCE8,
  MULTICHAIN,
  BINANCE6BSC,
  CIRCLE,
  BITFINEX,
  WealthyOKC,
} from './constants';
import { ChainId } from './types';

export async function impersonateAndTransfer(
  amt: BigNumberish,
  token: { holder: string; contract: string },
  toAddr: string,
  provider: ethers.providers.JsonRpcProvider
) {
  const signer = await provider.getSigner(token.holder);

  // await impersonateAccount(token.holder);
  if (isNativeToken(token.contract)) {
    // eth
    await signer.sendTransaction({ to: toAddr, value: BigNumber.from(amt) });
  } else {
    // erc20 token
    const contract = IERC20__factory.connect(token.contract, signer);
    await contract.transfer(toAddr, amt);
  }
}

export type AccountsRecord = Record<
  string,
  { contract: string; holder: string }
>;

export const wealthyAccountsEthereum: AccountsRecord = {
  USDC: {
    contract: tokensEthereum.USDC.address,
    holder: CIRCLE,
  },
  WETH: {
    contract: tokensEthereum.WETH.address,
    holder: MULTICHAIN, // 137k weth
  },
  DAI: {
    contract: tokensEthereum.DAI.address,
    holder: BINANCE,
  },
  USDT: {
    contract: tokensEthereum.USDT.address,
    holder: BITFINEX,
  },
  UNI: {
    contract: tokensEthereum.UNI.address,
    holder: BINANCE,
  },
  MATIC: {
    contract: tokensEthereum.MATIC.address,
    holder: BINANCE8,
  },
  AAVE: {
    contract: tokensEthereum.AAVE.address,
    holder: BINANCE,
  },
  YFI: {
    contract: tokensEthereum.YFI.address,
    holder: BINANCE,
  },
  NativeToken: {
    contract: tokensEthereum.NativeToken.address,
    holder: BINANCE7,
  },
};

export const wealthyAccountsPolygon: AccountsRecord = {
  NativeToken: {
    contract: tokensPolygon.NativeToken.address,
    holder: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
  },
  WMATIC: {
    contract: tokensPolygon.WMATIC.address,
    holder: '0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4',
  },
  DAI: {
    contract: tokensPolygon.DAI.address,
    holder: '0x27F8D03b3a2196956ED754baDc28D73be8830A6e', // AAVE
  },
  USDC: {
    contract: tokensPolygon.USDC.address,
    holder: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
  },
  USDT: {
    contract: tokensPolygon.USDT.address,
    holder: '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe',
  },
};

export const wealthyAccountsBSC: AccountsRecord = {
  NativeToken: {
    contract: tokensBSC.NativeToken.address,
    holder: BINANCE6BSC,
  },
  WBNB: {
    contract: tokensBSC.WBNB.address,
    holder: '0xef7fb88F709aC6148C07D070BC71d252E8E13b92',
  },
  DAI: {
    contract: tokensBSC.DAI.address,
    holder: BINANCE6BSC,
  },
  USDC: {
    contract: tokensBSC.USDC.address,
    holder: BINANCE6BSC,
  },
  USDT: {
    contract: tokensBSC.USDT.address,
    holder: BINANCE6BSC,
  },
  ETH: {
    contract: tokensBSC.ETH.address,
    holder: BINANCE6BSC,
  },
  BTCB: {
    contract: tokensBSC.BTCB.address,
    holder: BINANCE6BSC,
  },
  BUSD: {
    contract: tokensBSC.BUSD.address,
    holder: BINANCE6BSC,
  },
};

export const wealthyAccountsOKC: AccountsRecord = {
  NativeToken: {
    contract: tokensOKC.NativeToken.address,
    holder: '0x4ce08FfC090f5c54013c62efe30D62E6578E738D',
  },
  WOKT: {
    contract: tokensOKC.WOKT.address,
    holder: '0x38D6a76675645A15c8E01e8Cbc1CF4381Ba0273D',
  },
  DAI: {
    contract: tokensOKC.DAI.address,
    holder: WealthyOKC,
  },
  ETHK: {
    contract: tokensOKC.ETHK.address,
    holder: WealthyOKC,
  },
  USDC: {
    contract: tokensOKC.USDC.address,
    holder: WealthyOKC,
  },
  USDT: {
    contract: tokensOKC.USDT.address,
    holder: WealthyOKC,
  },
  OKB: {
    contract: tokensOKC.OKB.address,
    holder: WealthyOKC,
  },
  BTCK: {
    contract: tokensOKC.BTCK.address,
    holder: WealthyOKC,
  },
};
export const wealthyAccountsAVAX: AccountsRecord = {
  NativeToken: {
    contract: tokensAvax.NativeToken.address,
    holder: '0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8',
  },
  WAVAX: {
    contract: tokensAvax.WAVAX.address,
    holder: '0xBBff2A8ec8D702E61faAcCF7cf705968BB6a5baB',
  },
  DAI: {
    contract: tokensAvax.DAI.address,
    holder: '0x4188663a85C92EEa35b5AD3AA5cA7CeB237C6fe9',
  },
  USDC: {
    contract: tokensAvax.USDC.address,
    holder: '0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8',
  },
};

export function isNativeToken(tokenAddr: string) {
  // no matter with any chain id
  return (
    tokenAddr.toLowerCase() === tokensEthereum.NativeToken.address.toLowerCase()
  );
}

export const wealthyAccountsByChains: Partial<{
  [chainId in ChainId]: AccountsRecord;
}> = {
  [ChainId.Ethereum]: wealthyAccountsEthereum,
  [ChainId.Polygon]: wealthyAccountsPolygon,
  [ChainId.BSC]: wealthyAccountsBSC,
  [ChainId.OKC]: wealthyAccountsOKC,
  [ChainId.Avax]: wealthyAccountsAVAX,
};
