import { ethers } from 'ethers';
import {
  UniswapV2Router02__factory,
  BalancerSampler__factory,
  BalancerV2Sampler__factory,
  DMMRouter02__factory,
} from './typechain';
import {
  UNISWAPV2_ROUTER,
  SAMPLER_ADDRESS,
  Zero,
  KYBER_ROUTER02,
  KYBER_FACTORY_ADDRESS,
} from './constants';
import { CurveFunctionSelectors, getCurveInfosForPool } from './markets/curve';
import { QuoteParam, Protocol } from './types';

export const quoteHandler = async (
  quoteParam: QuoteParam,
  provider: ethers.providers.BaseProvider
) => {
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
    case Protocol.CurveV2: {
      const outputAmount = Zero;
      return outputAmount;
    }
    case Protocol.Curve: {
      const to = poolAddress;
      // const curvePool = Curve__factory.connect(to, provider);

      const curveInfo = getCurveInfosForPool(to);
      const fromTokenIdx = curveInfo.tokens.indexOf(quoteParam.inputToken);
      const toTokenIdx = curveInfo.tokens.indexOf(quoteParam.outputToken);
      // const outputAmount = await curvePool["get_dy_underlying(int128,int128,uint256)"](fromTokenIdx, toTokenIdx, quoteParam.inputAmount);
      const encodedParams = ethers.utils.defaultAbiCoder.encode(
        ['int128', 'int128', 'uint256'],
        [fromTokenIdx, toTokenIdx, quoteParam.inputAmount.toString()]
      );
      const data =
        CurveFunctionSelectors.get_dy_underlying + encodedParams.slice(2);
      const tx = { to, data };
      const results = await provider.call(tx, quoteParam.blockNumber);
      const outputAmount = ethers.utils.defaultAbiCoder.decode(
        ['uint256'],
        results
      );
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
      const outputAmount = Zero;
      return outputAmount;
    }
    case Protocol.Bancor: {
      const outputAmount = Zero;
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
