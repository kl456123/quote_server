import { ethers, BigNumber, BigNumberish } from 'ethers';

export const provider = ethers.providers.getDefaultProvider();

export const makeBigNumber = (amount: BigNumberish) => {
  return BigNumber.from(amount);
};

export const formatUnits = ethers.utils.formatUnits;
export const parseUnits = ethers.utils.parseUnits;
