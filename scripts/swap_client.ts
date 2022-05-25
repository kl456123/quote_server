import axios from 'axios';
import { SwapResponse, SwapParam, ChainId, Protocol } from '../src/types';
import { formatUnits, parseUnits } from '../src/utils';
import { tokensByChain } from '../src/tokens';
import { logger } from '../src/logging';
import { encodeSmartSwap, encodeUnxswap } from '../src/encoder';
import { ethers } from 'ethers';

import dotenv from 'dotenv';
dotenv.config();

const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/swap`;

async function request(query: SwapParam) {
  try {
    const res = await axios.get(url, { params: query });
    const quoteRes = res.data as SwapResponse;
    logger.info(quoteRes);
  } catch (error: any) {
    logger.fatal(`${error.response.data.error}`);
  }
}

async function testAvax() {
  const amount = '10';
  const tokens = tokensByChain[ChainId.Avax]!;
  const ethValue = ethers.utils.parseEther(amount.toString()).toString();
  const inputToken = tokens.NativeToken; // AVAX
  const outputToken = tokens.USDC; // USDC
  const inputAmount = ethers.utils
    .parseUnits(amount, inputToken.decimals)
    .toString();
  const walletAddress = '0x4aeFa39caEAdD662aE31ab0CE7c8C2c9c0a013E8'; // have some native tokens
  const calldata =
    '0xa6497e5c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008ac7230489e8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000003b6d0340f4003f4efbe8691b60249e6afbd307abe7758adb';
  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken: inputToken.address,
    outputToken: outputToken.address,
    inputAmount,
    chainId: ChainId.Avax,
    ethValue,
  };
  logger.info(swapParam);
  await request(swapParam);
}

async function testPolygon() {
  const amount = '10';
  const tokens = tokensByChain[ChainId.Polygon]!;
  const inputAmount = ethers.utils.parseUnits(amount, 6).toString();
  const inputToken = tokens.USDC.address; // USDC
  const outputToken = tokens.WMATIC.address; //WMATIC
  const walletAddress = '0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8';
  const calldata =
    '0xa6497e5c0000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d03406e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827';
  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken,
    outputToken,
    inputAmount,
    chainId: ChainId.Polygon,
  };
  console.log(swapParam);
  await request(swapParam);
}

async function testEthereum() {
  const amount = '10';
  const tokens = tokensByChain[ChainId.Ethereum]!;
  const inputAmount = ethers.utils.parseUnits(amount, 6).toString();
  const inputToken = tokens.USDC.address; // USDC
  const outputToken = tokens.WETH.address; //WETH
  const walletAddress = '0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8';
  // const chainId = 56;// BSC
  // const chainId = 66;// OKC
  const query = {
    amount,
    fromCoinId: 818,
    toCoinId: 41,
    chainId: 1,
    toTokenDecimal: 6,
    fromTokenDecimal: 6,
    toTokenAddress: outputToken,
    fromTokenAddress: inputToken,
  };
  const result = await axios.get(
    'https://beta.okex.org/priapi/v1/dx/trade/multi/v2/quoteAndCalldata',
    { params: query }
  );
  const response = result.data as { data: { calldata: string } };

  const calldata = response.data.calldata;
  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken,
    outputToken,
    inputAmount,
    chainId: ChainId.Ethereum,
  };
  console.log(swapParam);
  await request(swapParam);
}

async function testSmartSwap() {
  const chainId = ChainId.Ethereum;
  const tokens = tokensByChain[ChainId.Ethereum]!;
  const fromTokenAmount = ethers.utils.parseUnits('10', 18).toString();
  const fromToken = tokens.WETH.address; // USDC
  const toToken = tokens.USDC.address; //WETH
  const protocol = Protocol.UniswapV2;
  const walletAddress = '0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8';
  const poolAddress = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'; // WETH/USDC uniswapv2

  const calldata = encodeSmartSwap({
    fromTokenAmount,
    fromToken,
    toToken,
    chainId,
    protocol,
    poolAddress,
  });
  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken: fromToken,
    outputToken: toToken,
    inputAmount: fromTokenAmount,
    chainId: ChainId.Ethereum,
  };
  console.log(swapParam);
  await request(swapParam);
}

async function testUnxswap() {
  const chainId = ChainId.Ethereum;
  const tokens = tokensByChain[ChainId.Ethereum]!;
  const walletAddress = '0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8';
  const poolAddress = '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc';
  const fromToken = tokens.WETH.address; // USDC
  const toToken = tokens.USDC.address;
  const minReturn = 0;
  const fromTokenAmount = ethers.utils.parseUnits('10', 18).toString();
  const reversed = true;
  const calldata = encodeUnxswap({
    fromToken,
    minReturn,
    fromTokenAmount,
    poolAddress,
    reversed,
  });

  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken: fromToken,
    outputToken: toToken,
    inputAmount: fromTokenAmount,
    chainId: ChainId.Ethereum,
  };
  console.log(swapParam);
  await request(swapParam);
}

async function main() {
  // testEthereum();
  // testPolygon();
  // testAvax();
  // testSmartSwap();
  testUnxswap();
}

main().catch(console.error);
