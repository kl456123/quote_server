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
import { CurveFunctionSelectors, getCurveInfosForPool } from './markets/curve';
import { QuoteParam, Protocol } from './types';

const nopoolAddrDEX = [Protocol.UniswapV2, Protocol.Bancor];

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
