import { ethers } from 'ethers';
import {
  UniswapV2Router02__factory,
  BalancerSampler__factory,
  BalancerV2Sampler__factory,
  DMMRouter02__factory,
  BancorNetwork__factory,
  QuoterV2__factory,
  UniswapV3Pool__factory,
} from './typechain';
import {
  UNISWAPV2_ROUTER,
  SAMPLER_ADDRESS,
  Zero,
  KYBER_ROUTER02,
  BANCOR_ADDRESS,
  UNISWAPV3_QUOTER,
} from './constants';
import { UNKNOWN_METAPOOLS } from './markets/curve';
import { QuoteParam, Protocol } from './types';

const nopoolAddrDEX = [Protocol.UniswapV2, Protocol.Bancor];

const iface = new ethers.utils.Interface([
  // base pool
  'function coins(uint256 arg0)view returns(address)',
  // Curve
  'function get_dy_underlying(int128 i,int128 j,uint256 dx)view returns(uint256)',
  'function get_dy(int128 i,int128 j,uint256 dx)view returns(uint256)',
  // CurveV2
  'function get_dy(uint256 i,uint256 j,uint256 dx)view returns(uint256)',
  'function get_dy_underlying(uint256 i,uint256 j,uint256 dx)view returns(uint256)',
  // to check if metapool
  'function base_pool()view returns(address)',
  // to check if curvev2
  'function gamma()view returns(uint256)',
]);
const ifaceCoin128 = new ethers.utils.Interface([
  'function coins(int128 arg0)view returns(address)',
]);

async function tryCall<Func extends (...args: any[]) => any>(
  call: Func,
  ...params: Parameters<Func>
) {
  let result: ReturnType<Func> | null;
  try {
    result = await call(params);
  } catch {
    result = null;
  }
  return result;
}

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
      console.log(`Call to int128 coins failed for ${poolAddr}`);
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
  if (UNKNOWN_METAPOOLS.has(curvePool.address)) {
    return UNKNOWN_METAPOOLS.get(curvePool.address);
  }
  const fn = curvePool.base_pool.bind(curvePool);
  const basePoolAddr = await tryCall(fn);
  return basePoolAddr;
}

export const quoteHandler = async (
  quoteParam: QuoteParam,
  provider: ethers.providers.BaseProvider
) => {
  if (!quoteParam.poolAddress && !nopoolAddrDEX.includes(quoteParam.protocol)) {
    console.log(`poolAddress is not allowed for ${quoteParam.protocol}`);
    return null;
  }
  const poolAddress = quoteParam.poolAddress as string;
  switch (quoteParam.protocol) {
    case Protocol.UniswapV2: {
      const uniswapv2_router = UniswapV2Router02__factory.connect(
        UNISWAPV2_ROUTER,
        provider
      );
      const path = [quoteParam.inputToken, quoteParam.outputToken];
      const outputAmounts = await uniswapv2_router.callStatic.getAmountsOut(
        quoteParam.inputAmount,
        path,
        { blockTag: quoteParam.blockNumber }
      );
      return outputAmounts[outputAmounts.length - 1];
    }
    case Protocol.CurveV2:
    case Protocol.Curve: {
      const to = poolAddress;

      const curvePool = new ethers.Contract(to, iface, provider);
      let coinsAddr = await getCoinsList(to, provider);
      let metaCoinsNum = coinsAddr.length;
      // check if pool is metapool, plain pool or crypto pool
      const basePoolAddr = await getBasePool(curvePool);
      if (basePoolAddr) {
        // make sure this is metapool
        metaCoinsNum -= 1; // exclude lp token
        const baseCoinsAddr = await getCoinsList(basePoolAddr, provider);
        coinsAddr = coinsAddr.slice(-1).concat(baseCoinsAddr);
      }
      console.log(coinsAddr);
      const fromTokenIdx = coinsAddr.indexOf(quoteParam.inputToken);
      const toTokenIdx = coinsAddr.indexOf(quoteParam.outputToken);
      if (fromTokenIdx === -1 || toTokenIdx === -1) {
        console.log(`cannot trade tokens in the pool: ${to}`);
        return null;
      }

      let useUnderlying = true;
      if (metaCoinsNum > fromTokenIdx && metaCoinsNum > toTokenIdx) {
        useUnderlying = false;
      }
      let outputAmount = Zero;
      if (useUnderlying) {
        try {
          // curvev1
          outputAmount = await curvePool[
            'get_dy_underlying(int128,int128,uint256)'
          ](fromTokenIdx, toTokenIdx, quoteParam.inputAmount);
        } catch {
          // curvev2
          outputAmount = await curvePool[
            'get_dy_underlying(uint256,uint256,uint256)'
          ](fromTokenIdx, toTokenIdx, quoteParam.inputAmount);
        }
      } else {
        try {
          // curvev1
          outputAmount = await curvePool['get_dy(int128,int128,uint256)'](
            fromTokenIdx,
            toTokenIdx,
            quoteParam.inputAmount
          );
        } catch {
          // curvev2
          outputAmount = await curvePool['get_dy(uint256,uint256,uint256)'](
            fromTokenIdx,
            toTokenIdx,
            quoteParam.inputAmount
          );
        }
      }

      return outputAmount;
    }
    case Protocol.Balancer: {
      const sampler = BalancerSampler__factory.connect(
        SAMPLER_ADDRESS,
        provider
      );
      const outputAmounts = await sampler.sampleSellsFromBalancer(
        poolAddress,
        quoteParam.inputToken,
        quoteParam.outputToken,
        [quoteParam.inputAmount]
      );

      return outputAmounts[0];
    }
    case Protocol.BalancerV2: {
      const sampler = BalancerV2Sampler__factory.connect(
        SAMPLER_ADDRESS,
        provider
      );
      const vault = '0xba12222222228d8ba445958a75a0704d566bf2c8';
      const iface = new ethers.utils.Interface([
        'function getPoolId()view returns (bytes32)',
      ]);
      const poolContract = new ethers.Contract(poolAddress, iface, provider);
      const poolId = await poolContract.getPoolId();
      const poolInfo = { poolId, vault };
      const outputAmounts = await sampler.callStatic.sampleSellsFromBalancerV2(
        poolInfo,
        quoteParam.inputToken,
        quoteParam.outputToken,
        [quoteParam.inputAmount]
      );
      return outputAmounts[0];
    }
    case Protocol.UniswapV3: {
      const quoterv2 = QuoterV2__factory.connect(UNISWAPV3_QUOTER, provider);
      const poolContract = await UniswapV3Pool__factory.connect(
        poolAddress,
        provider
      );
      const fee = await poolContract.fee();
      const params = {
        tokenIn: quoteParam.inputToken,
        tokenOut: quoteParam.outputToken,
        fee,
        amountIn: quoteParam.inputAmount,
        sqrtPriceLimitX96: 0,
      };
      const { amountOut: outputAmount } =
        await quoterv2.callStatic.quoteExactInputSingle(params);
      return outputAmount;
    }
    case Protocol.Bancor: {
      const bancorNetworkContract = BancorNetwork__factory.connect(
        BANCOR_ADDRESS,
        provider
      );
      const path = await bancorNetworkContract.conversionPath(
        quoteParam.inputToken,
        quoteParam.outputToken
      );
      const outputAmount = await bancorNetworkContract.rateByPath(
        path,
        quoteParam.inputAmount
      );
      return outputAmount;
    }
    case Protocol.Kyber: {
      const kyber_router02 = DMMRouter02__factory.connect(
        KYBER_ROUTER02,
        provider
      );
      const allPools = [poolAddress];
      if (allPools.length == 0) {
        return null;
      }
      const outputAmounts = await kyber_router02.getAmountsOut(
        quoteParam.inputAmount,
        allPools,
        [quoteParam.inputToken, quoteParam.outputToken]
      );
      return outputAmounts[outputAmounts.length - 1];
    }
    default: {
      return null;
    }
  }
};
