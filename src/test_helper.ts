import { BigNumberish } from 'ethers';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { IERC20__factory } from './typechain';

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
  toAddr: string,
  provider: ethers.providers.JsonRpcProvider
) {
  const signer = await provider.getSigner(token.holder);
  const contract = IERC20__factory.connect(token.contract, signer);

  await impersonateAccount(token.holder);
  await contract.transfer(toAddr, amt);
}
