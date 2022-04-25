import { ethers } from 'ethers';
import {
  CurvePoolFactory__factory,
  CurveRegistry__factory,
  CryptoPoolFactory__factory,
  CryptoRegistry__factory,
} from '../typechain';
import { QuoteParam } from '../types';
import {
  curveRegistryAddr,
  stablePoolFactoryAddr,
  curveV2RegistryAddr,
  cryptoPoolFactoryAddr,
} from '../constants';
import { logger } from '../logging';
import { tryCall } from '../utils';
import { iface } from './curve';

export async function quoteV2CurveHandler(
  quoteParam: QuoteParam,
  provider: ethers.providers.BaseProvider
) {
  const poolAddress = quoteParam.poolAddress as string;
  const callOverrides = { blockTag: quoteParam.blockNumber };
  const curveRegistry = CurveRegistry__factory.connect(
    curveRegistryAddr,
    provider
  );
  const stablePoolFactory = CurvePoolFactory__factory.connect(
    stablePoolFactoryAddr,
    provider
  );
  const cryptoRegistry = CryptoRegistry__factory.connect(
    curveV2RegistryAddr,
    provider
  );
  const cryptoFactory = CryptoPoolFactory__factory.connect(
    cryptoPoolFactoryAddr,
    provider
  );

  const fn0 = curveRegistry.get_coin_indices.bind(curveRegistry);
  const fn1 = stablePoolFactory.get_coin_indices.bind(stablePoolFactory);
  const fn2 = cryptoRegistry.get_coin_indices.bind(cryptoRegistry);
  const fn3 = cryptoFactory.get_coin_indices.bind(cryptoFactory);

  const args = [poolAddress, quoteParam.inputToken, quoteParam.outputToken];
  const curvePool = new ethers.Contract(poolAddress, iface, provider);
  let fromTokenIdx, toTokenIdx;
  let useUnderlying = false;

  const curveV1result =
    (await tryCall(fn0, args[0], args[1], args[2])) ||
    (await tryCall(fn1, args[0], args[1], args[2]));
  if (curveV1result) {
    fromTokenIdx = curveV1result[0];
    toTokenIdx = curveV1result[1];
    useUnderlying = curveV1result[2];
  }

  let curveV2result;
  if (!curveV1result) {
    // curvev2
    curveV2result =
      (await tryCall(fn2, args[0], args[1], args[2])) ||
      (await tryCall(fn3, args[0], args[1], args[2]));
    if (!curveV2result) {
      const errorStr = `unknown poolAddress: ${poolAddress}`;
      throw new Error(errorStr);
    }
    fromTokenIdx = curveV2result[0];
    toTokenIdx = curveV2result[1];
  }

  let outputAmount = ethers.constants.Zero;
  if (useUnderlying) {
    try {
      // curvev1
      outputAmount = await curvePool.callStatic[
        'get_dy_underlying(int128,int128,uint256)'
      ](fromTokenIdx, toTokenIdx, quoteParam.inputAmount, callOverrides);
    } catch {
      // curvev2
      outputAmount = await curvePool.callStatic[
        'get_dy_underlying(uint256,uint256,uint256)'
      ](fromTokenIdx, toTokenIdx, quoteParam.inputAmount, callOverrides);
    }
  } else {
    try {
      // curvev1
      outputAmount = await curvePool.callStatic[
        'get_dy(int128,int128,uint256)'
      ](fromTokenIdx, toTokenIdx, quoteParam.inputAmount, callOverrides);
    } catch {
      // curvev2
      outputAmount = await curvePool.callStatic[
        'get_dy(uint256,uint256,uint256)'
      ](fromTokenIdx, toTokenIdx, quoteParam.inputAmount, callOverrides);
    }
  }
  return outputAmount;
}
