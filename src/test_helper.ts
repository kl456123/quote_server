import { BigNumberish } from 'ethers';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { IERC20__factory } from './typechain';
import { tokens } from './tokens';
import { BINANCE, BINANCE7, BINANCE8 } from './constants';

// util functions
export async function impersonateAccount(account: string) {
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [account],
  });
  return hre.ethers.provider.getSigner(account);
}

export async function impersonateAndTransfer(
  amt: BigNumberish,
  token: { holder: string; contract: string },
  toAddr: string
) {
  const signer = await hre.ethers.getSigner(token.holder);
  const contract = IERC20__factory.connect(token.contract, signer);

  await impersonateAccount(token.holder);
  await contract.transfer(toAddr, amt);
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
    holder: '0xc564ee9f21ed8a2d8e7e76c085740d5e4c5fafbe', // 137k weth
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
};
