import { ethers } from 'ethers';
import { QuoteParam } from '../types';
import { logger } from '../logging';
import { tryCall } from '../utils';
import { iface, ifaceCoin128 } from './curve';

async function getCoinsList(
  poolAddr: string,
  provider: ethers.providers.BaseProvider
) {
  const coinsAddr: string[] = [];
  const curvePool = new ethers.Contract(poolAddr, iface, provider);
  const coinFn = curvePool.coins.bind(curvePool);
  let i = 0;
  let coinAddr = await tryCall(coinFn, i);
  if (!coinAddr) {
    // use coin128 instead
    const curvePoolCoin128 = new ethers.Contract(
      poolAddr,
      ifaceCoin128,
      provider
    );
    const coin128Fn = curvePoolCoin128.coins.bind(curvePoolCoin128);
    coinAddr = await tryCall(coin128Fn, 0);
    if (!coinAddr) {
      logger.error(`Call to int128 coins failed for ${poolAddr}`);
    }
    while (coinAddr) {
      coinsAddr.push(coinAddr.toLowerCase());
      i += 1;
      coinAddr = await tryCall(coin128Fn, i);
    }
    return coinsAddr;
  }

  while (coinAddr) {
    coinsAddr.push(coinAddr.toLowerCase());
    i += 1;
    coinAddr = await tryCall(coinFn, i);
  }

  return coinsAddr;
}

async function getUnderlyingCoinsList(
  poolAddr: string,
  provider: ethers.providers.BaseProvider
) {
  const coinsAddr: string[] = [];
  const curvePool = new ethers.Contract(poolAddr, iface, provider);
  const coinFn = curvePool.underlying_coins.bind(curvePool);
  let i = 0;
  let coinAddr = await tryCall(coinFn, i);
  if (!coinAddr) {
    // use coin128 instead
    const curvePoolCoin128 = new ethers.Contract(
      poolAddr,
      ifaceCoin128,
      provider
    );
    const coin128Fn = curvePoolCoin128.underlying_coins.bind(curvePoolCoin128);
    coinAddr = await tryCall(coin128Fn, 0);
    if (!coinAddr) {
      logger.error(`Call to int128 underlying coins failed for ${poolAddr}`);
    }
    while (coinAddr) {
      coinsAddr.push(coinAddr.toLowerCase());
      i += 1;
      coinAddr = await tryCall(coin128Fn, i);
    }
    return coinsAddr;
  }

  while (coinAddr) {
    coinsAddr.push(coinAddr.toLowerCase());
    i += 1;
    coinAddr = await tryCall(coinFn, i);
  }
  return coinsAddr;
}

async function getBasePool(curvePool: ethers.Contract) {
  // first check base_pool api
  const fn = curvePool.base_pool.bind(curvePool);
  const basePoolAddr = await tryCall(fn);
  // if failed, check get_base_pool api of metapool factory
  return basePoolAddr;
}

export async function quoteCurveHandler(
  quoteParam: QuoteParam,
  provider: ethers.providers.BaseProvider
) {
  const poolAddress = quoteParam.poolAddress as string;
  const callOverrides = { blockTag: quoteParam.blockNumber };

  const to = poolAddress;

  const curvePool = new ethers.Contract(to, iface, provider);
  const [coinsAddr, basePoolAddr] = await Promise.all([
    getCoinsList(to, provider),
    getBasePool(curvePool),
  ]);
  let metaCoinsNum = coinsAddr.length;
  // check if pool is metapool or not
  if (basePoolAddr) {
    // make sure this is metapool
    metaCoinsNum -= 1; // exclude lp token
    const baseCoinsAddr = await getCoinsList(basePoolAddr, provider);
    coinsAddr.splice(coinsAddr.length - 1, 1, ...baseCoinsAddr);
  }

  // find index for tokens
  let fromTokenIdx = coinsAddr.indexOf(quoteParam.inputToken);
  let toTokenIdx = coinsAddr.indexOf(quoteParam.outputToken);
  let isLending = false;
  if (fromTokenIdx === -1 || toTokenIdx === -1) {
    // try to find input and output tokens in underlying coins list
    // if some token cannot be found in coins list
    const underlyingCoinsAddr = await getUnderlyingCoinsList(to, provider);
    if (underlyingCoinsAddr.length > 0) {
      isLending = true;
    }
    if (underlyingCoinsAddr.length && fromTokenIdx === -1) {
      fromTokenIdx = underlyingCoinsAddr.indexOf(quoteParam.inputToken);
    }
    if (underlyingCoinsAddr.length && toTokenIdx === -1) {
      toTokenIdx = underlyingCoinsAddr.indexOf(quoteParam.outputToken);
    }
  }
  if (fromTokenIdx === -1 || toTokenIdx === -1) {
    logger.error(`cannot trade tokens in the pool: ${to}`);
    return null;
  }

  let useUnderlying = true;
  if (!isLending && metaCoinsNum > fromTokenIdx && metaCoinsNum > toTokenIdx) {
    useUnderlying = false;
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
