import { ethers, BigNumber } from 'ethers';
import {
  UniswapV2Router02__factory,
  DMMRouter02__factory,
  BancorNetwork__factory,
  QuoterV2__factory,
  UniswapV3Pool__factory,
  Vault__factory,
  BPool__factory,
} from './typechain';
import { logger } from './logging';
import {
  uniswapv2LikeRouterMap,
  KYBER_ROUTER02,
  BANCOR_ADDRESS,
  UNISWAPV3_QUOTER,
} from './constants';
import { quoteV2CurveHandler } from './markets/quotev2_curve_handler';
import { QuoteParam, Protocol, QuoteResponse } from './types';

const nopoolAddrDEX = [
  Protocol.UniswapV2,
  Protocol.Bancor,
  // all protocols of uniswap like
  Protocol.KSwap,
  Protocol.SushiSwap,
  Protocol.DefiSwap,
  Protocol.Convergence,
  Protocol.LuaSwap,
  Protocol.ShibaSwap,

  // BSC
  Protocol.MDEX,
  Protocol.BiSwap,
  Protocol.ApeSwap,
  Protocol.BabySwap,
  Protocol.KnightSwap,
  Protocol.DefiBox,
  Protocol.BakerySwap,
  Protocol.AutoShark,
  Protocol.BenSwap,
  Protocol.BurgeSwap,
  Protocol.JetSwap,
  Protocol.PancakeSwap,

  // OKC
  Protocol.AISwap,
  Protocol.CherrySwap,
  Protocol.JSwap,

  // Polygon
  Protocol.QuickSwap,
  Protocol.Dfyn
];

export const quoteHandler = async (
  quoteParam: QuoteParam,
  provider: ethers.providers.BaseProvider
): Promise<QuoteResponse> => {
  if (!quoteParam.poolAddress && !nopoolAddrDEX.includes(quoteParam.protocol)) {
    const errorStr = `poolAddress is needed for ${quoteParam.protocol}`;
    throw new Error(errorStr);
  }
  const poolAddress = quoteParam.poolAddress as string;
  // make sure all func called at the same blocknumber
  if (!quoteParam.blockNumber) {
    quoteParam.blockNumber = await provider.getBlockNumber();
  }
  const callOverrides = { blockTag: quoteParam.blockNumber };
  let outputAmount;
  switch (quoteParam.protocol) {
    case Protocol.KSwap:
    case Protocol.SushiSwap:
    case Protocol.DefiSwap:
    case Protocol.Convergence:
    case Protocol.LuaSwap:
    case Protocol.ShibaSwap:
    case Protocol.MDEX:
    case Protocol.BiSwap:
    case Protocol.ApeSwap:
    case Protocol.BabySwap:
    case Protocol.KnightSwap:
    case Protocol.DefiBox:
    case Protocol.BakerySwap:
    case Protocol.AutoShark:
    case Protocol.BenSwap:
    case Protocol.BurgeSwap:
    case Protocol.JetSwap:
    case Protocol.PancakeSwap:
    case Protocol.AISwap:
    case Protocol.CherrySwap:
    case Protocol.JSwap:
    case Protocol.QuickSwap:
    case Protocol.Dfyn:
    case Protocol.UniswapV2: {
      const routesChain = uniswapv2LikeRouterMap[quoteParam.chainId!];
      const routerAddr = routesChain
        ? routesChain[quoteParam.protocol]
        : undefined;
      if (!routerAddr) {
        throw new Error(
          `cannot find protocol: ${quoteParam.protocol} in chain: ${quoteParam.chainId}`
        );
      }
      const uniswapv2_router = UniswapV2Router02__factory.connect(
        routerAddr,
        provider
      );
      const path = [quoteParam.inputToken, quoteParam.outputToken];
      const outputAmounts = await uniswapv2_router.callStatic.getAmountsOut(
        quoteParam.inputAmount,
        path,
        callOverrides
      );
      outputAmount = outputAmounts[outputAmounts.length - 1];
      break;
    }
    case Protocol.CurveV2:
    case Protocol.Curve: {
      // due to some metapool has no base pool api exposed,
      // we cannot get underlying coins from pool contract itself.
      // the only way to get the addition information is to query
      // for registry or factory
      outputAmount = await quoteV2CurveHandler(quoteParam, provider);
      // const outputAmount = await quoteCurveHandler(quoteParam, provider);
      break;
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
      outputAmount = await bpoolContract.calcOutGivenIn(
        takerTokenBalance,
        takerTokenWeight,
        makerTokenBalance,
        makerTokenWeight,
        quoteParam.inputAmount,
        swapFee,
        callOverrides
      );
      break;
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
      outputAmount = outputAmounts[1].mul(-1);
      break;
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
      const { amountOut } = await quoterv2.callStatic.quoteExactInputSingle(
        params,
        callOverrides
      );
      outputAmount = amountOut;
      break;
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
      outputAmount = await bancorNetworkContract.callStatic.rateByPath(
        path,
        quoteParam.inputAmount,
        callOverrides
      );
      break;
    }
    case Protocol.Kyber: {
      const kyber_router02 = DMMRouter02__factory.connect(
        KYBER_ROUTER02,
        provider
      );
      const allPools = [poolAddress];
      const outputAmounts = await kyber_router02.callStatic.getAmountsOut(
        quoteParam.inputAmount,
        allPools,
        [quoteParam.inputToken, quoteParam.outputToken],
        callOverrides
      );
      outputAmount = outputAmounts[outputAmounts.length - 1];
      break;
    }
    default: {
      throw new Error(`unsupported protocol: ${quoteParam.protocol}`);
    }
  }
  return {
    outputAmount: outputAmount.toString(),
    blockNumber: quoteParam.blockNumber,
    inputAmount: quoteParam.inputAmount.toString(),
    inputToken: quoteParam.inputToken,
    outputToken: quoteParam.outputToken,
    protocolName: Protocol[quoteParam.protocol],
  };
};
