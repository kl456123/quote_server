import { ethers } from 'ethers';
import { UniswapV2Router02__factory, BPool__factory, BalancerSampler__factory } from './typechain';
import { UNISWAPV2_ROUTER, SAMPLER_ADDRESS, Zero } from './constants';
import { CurveFunctionSelectors, getCurveInfosForPool } from './markets/curve';
import { QuoteParam, Protocol } from './types';



export const quoteHandler = async (
  quoteParam: QuoteParam,
  provider: ethers.providers.BaseProvider
) => {
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
    case Protocol.Curve: {
      const to = quoteParam.poolAddress as string;
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
          const sampler = BalancerSampler__factory.connect(SAMPLER_ADDRESS, provider);
          const poolAddress = quoteParam.poolAddress as string;
          const outputAmounts = await sampler.sampleSellsFromBalancer(
              poolAddress,
              quoteParam.inputToken,
              quoteParam.outputToken,
              [quoteParam.inputAmount]
          );

          return outputAmounts[0];
      }
    case Protocol.BalancerV2: {
          const outputAmount = Zero;
          return outputAmount;
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
          const outputAmount = Zero;
          return outputAmount;
      }
    default: {
      return null;
    }
  }
};
