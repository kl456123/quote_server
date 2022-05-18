import { ethers, BigNumber, BigNumberish } from 'ethers';
import dotenv from 'dotenv';
import { ChainId } from './types';

dotenv.config();

export const alchemyUrl = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;
// export const provider = new ethers.providers.JsonRpcProvider(alchemyUrl);

export const makeBigNumber = (amount: BigNumberish) => {
  return BigNumber.from(amount);
};

export const formatUnits = ethers.utils.formatUnits;
export const parseUnits = ethers.utils.parseUnits;

export async function tryCall<Func extends (...args: any[]) => any>(
  call: Func,
  ...params: Parameters<Func>
) {
  let result: ReturnType<Func> | null;
  try {
    result = await call(...params);
  } catch (error) {
    error;
    result = null;
  }
  return result;
}

export function getUrl(chainId: ChainId) {
  let url;
  switch (chainId) {
    case ChainId.Ethereum: {
      url = alchemyUrl;
      break;
    }
    case ChainId.BSC: {
      url = `https://bsc-dataseed1.defibit.io`;
      break;
    }
    case ChainId.OKC: {
      url = 'https://exchainrpc.okex.org/';
      break;
    }
    case ChainId.Polygon: {
      url = 'https://matic-mainnet.chainstacklabs.com';
      break;
    }
    case ChainId.Avax: {
      url = 'https://avalanche.public-rpc.com';
      break;
    }
    default:
      throw new Error(`unsupported chainId: ${chainId}`);
  }
  return url;
}

export function getProvider(chainId: ChainId) {
  const url = getUrl(chainId);
  return new ethers.providers.JsonRpcProvider(url);
}
