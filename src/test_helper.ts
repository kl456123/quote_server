import { BigNumberish, BigNumber } from 'ethers';
import { ethers } from 'ethers';
import { IERC20__factory } from './typechain';
import { tokens } from './tokens';
import { BINANCE, BINANCE7, BINANCE8, MULTICHAIN } from './constants';

export async function impersonateAndTransfer(
  amt: BigNumberish,
  token: { holder: string; contract: string },
  toAddr: string,
  provider: ethers.providers.JsonRpcProvider
) {
  const signer = await provider.getSigner(token.holder);

  // await impersonateAccount(token.holder);
  if (token.contract.toLowerCase() === tokens.ETH.address.toLowerCase()) {
    // eth
    await signer.sendTransaction({ to: toAddr, value: BigNumber.from(amt) });
  } else {
    // erc20 token
    const contract = IERC20__factory.connect(token.contract, signer);
    await contract.transfer(toAddr, amt);
  }
}

export const wealthyAccounts: Record<
  string,
  { contract: string; holder: string }
> = {
  USDC: {
    contract: tokens.USDC.address,
    holder: BINANCE7,
  },
  WETH: {
    contract: tokens.WETH.address,
    holder: MULTICHAIN, // 137k weth
  },
  DAI: {
    contract: tokens.DAI.address,
    holder: BINANCE,
  },
  USDT: {
    contract: tokens.USDT.address,
    holder: BINANCE,
  },
  UNI: {
    contract: tokens.UNI.address,
    holder: BINANCE,
  },
  MATIC: {
    contract: tokens.MATIC.address,
    holder: BINANCE8,
  },
  AAVE: {
    contract: tokens.AAVE.address,
    holder: BINANCE,
  },
  YFI: {
    contract: tokens.YFI.address,
    holder: BINANCE,
  },
  ETH: {
    contract: tokens.ETH.address,
    holder: BINANCE7,
  },
};
