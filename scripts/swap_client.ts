import axios from 'axios';
import { SwapResponse, SwapParam, ChainId } from '../src/types';
import { formatUnits, parseUnits } from '../src/utils';
import { tokensByChain } from '../src/tokens';
import { logger } from '../src/logging';
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

async function testOKC() {
  const amount = '0.5';
  const chainId = ChainId.OKC;
  const tokens = tokensByChain[chainId]!;
  const inputAmount = ethers.utils.parseUnits(amount, 18).toString();
  const ethValue = inputAmount;
  const inputToken = tokens.NativeToken.address; // ETH
  const outputToken = tokens.USDT.address; // USDT
  const bridge = 1;
  const walletAddress = '0xF809B33c4a6E4E188D397688f9218216C52be8b4';
  const calldata =
    '0xdf1e83360000000000000000000000000000000000000000000000000000000000000020000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000382bb369d343125bfb2117af9c149795c6c65c50000000000000000000000000f809b33c4a6e4e188d397688f9218216c52be8b40000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008900000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000f390830df829cf22c53c8840554b98eafc5dcbc20000000000000000000000000dcb0cb0120d355cde1ce56040be57add0185baa00000000000000000000000000000000000000000000000000000000000000c4a6497e5c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006f05b59d3b20000000000000000000000000000000000000000000000000000a644264f9f90377a0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d0340f3098211d012ff5380a03d80f150ac6e5753caa800000000000000000000000000000000000000000000000000000000';
  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken,
    outputToken,
    inputAmount,
    chainId,
    ethValue,
    bridge,
  };
  console.log(swapParam);
  await request(swapParam);
}

async function main() {
  // testEthereum();
  testPolygon();
  testAvax();
  // testOKC();
}

main().catch(console.error);
