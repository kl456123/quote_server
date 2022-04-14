import { ethers } from 'ethers';
import {
  UniswapV2Router02__factory,
  BalancerSampler__factory,
  BalancerV2Sampler__factory,
  DMMRouter02__factory,
  BancorNetwork__factory,
  QuoterV2__factory,
  UniswapV3Pool__factory,
  Vault__factory,
  BPool__factory,
} from './typechain';
import { logger } from './logging';
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
    logger.error(`poolAddress is not allowed for ${quoteParam.protocol}`);
    return null;
  }
  const poolAddress = quoteParam.poolAddress as string;
  // make sure all func called at the same blocknumber
  if (!quoteParam.blockNumber) {
    quoteParam.blockNumber = await provider.getBlockNumber();
  }
  const callOverrides = { blockTag: quoteParam.blockNumber };
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
        callOverrides
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
      const fromTokenIdx = coinsAddr.indexOf(quoteParam.inputToken);
      const toTokenIdx = coinsAddr.indexOf(quoteParam.outputToken);
      if (fromTokenIdx === -1 || toTokenIdx === -1) {
        logger.error(`cannot trade tokens in the pool: ${to}`);
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
    case Protocol.Balancer: {
      const bpoolContract = BPool__factory.connect(poolAddress, provider);
      const poolState = await Promise.all([
        bpoolContract.getBalance(quoteParam.inputToken, callOverrides),
        bpoolContract.getDenormalizedWeight(
          quoteParam.inputToken,
          callOverrides
        ),
        bpoolContract.getBalance(quoteParam.outputToken, callOverrides),
        bpoolContract.getDenormalizedWeight(
          quoteParam.outputToken,
          callOverrides
        ),
        bpoolContract.getSwapFee(callOverrides),
      ]);
      const takerTokenBalance = poolState[0];
      const takerTokenWeight = poolState[1];
      const makerTokenBalance = poolState[2];
      const makerTokenWeight = poolState[3];
      const swapFee = poolState[4];
      const outputAmount = await bpoolContract.calcOutGivenIn(
        takerTokenBalance,
        takerTokenWeight,
        makerTokenBalance,
        makerTokenWeight,
        quoteParam.inputAmount,
        swapFee,
        callOverrides
      );
      return outputAmount;
    }

    case Protocol.BalancerV2: {
      const vault = '0xba12222222228d8ba445958a75a0704d566bf2c8';
      const iface = new ethers.utils.Interface([
        'function getPoolId()view returns (bytes32)',
      ]);
      const poolContract = new ethers.Contract(poolAddress, iface, provider);
      const poolId = await poolContract.getPoolId();
      const vaultContract = Vault__factory.connect(vault, provider);
      const kind = 0;
      const swaps = [
        {
          poolId,
          assetInIndex: 0,
          assetOutIndex: 1,
          amount: quoteParam.inputAmount,
          userData: '0x',
        },
      ];
      const assets = [quoteParam.inputToken, quoteParam.outputToken];
      const funds = {
        sender: ethers.constants.AddressZero,
        fromInternalBalance: false,
        recipient: ethers.constants.AddressZero,
        toInternalBalance: false,
      };
      const outputAmounts = await vaultContract.callStatic.queryBatchSwap(
        kind,
        swaps,
        assets,
        funds,
        callOverrides
      );
      return outputAmounts[1].mul(-1);
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
        await quoterv2.callStatic.quoteExactInputSingle(params, callOverrides);
      return outputAmount;
    }
    case Protocol.Bancor: {
      const bancorNetworkContract = BancorNetwork__factory.connect(
        BANCOR_ADDRESS,
        provider
      );
      const path = await bancorNetworkContract.callStatic.conversionPath(
        quoteParam.inputToken,
        quoteParam.outputToken,
        callOverrides
      );
      const outputAmount = await bancorNetworkContract.callStatic.rateByPath(
        path,
        quoteParam.inputAmount,
        callOverrides
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
      const outputAmounts = await kyber_router02.callStatic.getAmountsOut(
        quoteParam.inputAmount,
        allPools,
        [quoteParam.inputToken, quoteParam.outputToken],
        callOverrides
      );
      return outputAmounts[outputAmounts.length - 1];
    }
    default: {
      return null;
    }
  }
};
