import { ethers, BigNumber, BigNumberish } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const url = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
export const provider = new ethers.providers.JsonRpcProvider(url);

export const makeBigNumber = (amount: BigNumberish) => {
  return BigNumber.from(amount);
};

export const formatUnits = ethers.utils.formatUnits;
export const parseUnits = ethers.utils.parseUnits;
