import axios from 'axios';
import { QuoteResponse, QuoteParam } from '../src/types';
import { formatUnits, parseUnits, getProvider } from '../src/utils';
import { tokens } from '../src/tokens';
import { logger } from '../src/logging';

import dotenv from 'dotenv';
dotenv.config();

const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/quote`;

async function request(query: QuoteParam) {
  try {
    const res = await axios.get(url, { params: query });
    const quoteRes = res.data as QuoteResponse;
    logger.info(quoteRes.outputAmount);
  } catch (error: any) {
    logger.fatal(`${error.response.data.error}`);
  }
}

async function testUniswapV2() {
  const blockNumber = 14000000;
  const inputAmount = parseUnits('1', 18).toString(); // 1 ETH
  const protocol = 0;
  const inputToken = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    blockNumber,
  };
  await request(query);
}

async function testCurve() {
  const curvePools = [
    '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604', // husd metapool
    '0x80466c64868e1ab14a1ddf27a676c3fcbe638fe5', // tricrypto, [USDT/WBTC/WETH
    '0xd51a44d3fae010294c616388b506acda1bfaae46', // tricrypto2
  ];
  // const blockNumber = 14000000;
  const inputAmount = parseUnits('10', 18).toString(); // 1000 WETH
  const protocol = 2;
  // const inputToken = tokens.DAI.address; // DAI
  // const outputToken = tokens.USDT.address; // USDT
  const inputToken = '0x8e595470Ed749b85C6F7669de83EAe304C2ec68F';
  const outputToken = '0x76Eb2FE28b36B3ee97F3Adae0C69606eeDB2A37c';
  const poolAddress = '0x2dded6da1bf5dbdf597c45fcfaa3194e53ecfeaf';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    // blockNumber,
    poolAddress,
  };
  await request(query);
}

async function testBalancer() {
  // const blockNumber = 14000000;
  const inputAmount = parseUnits('0.1', 18).toString(); // 1 WETH
  const protocol = 4; // balancer
  const inputToken = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  const poolAddress = '0x8a649274E4d777FFC6851F13d23A86BBFA2f2Fbf';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    // blockNumber,
    poolAddress,
  };
  await request(query);
}

async function testBalancerV2() {
  // const blockNumber = 14000000;
  const inputAmount = parseUnits('1000', 18).toString(); // 1 DAI
  const protocol = 5; // balancerV2
  const inputToken = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  const poolAddress = '0x06Df3b2bbB68adc8B0e302443692037ED9f91b42';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    // blockNumber,
    poolAddress,
  };
  await request(query);
}

async function testKyberNetwork() {
  const blockNumber = 14000000;
  const inputAmount = parseUnits('1', 18).toString(); // 1 WETH
  const protocol = 7; // kyber
  const inputToken = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  const poolAddress = '0xD478953D5572f829f457A5052580cBEaee36c1Aa'; // or 0xD6f8E8068012622d995744cc135A7e8e680E2E76
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    blockNumber,
    poolAddress,
  };

  await request(query);
}

async function testBancor() {
  const blockNumber = 14000000;
  const inputAmount = parseUnits('1000', 18).toString(); // 1 DAI
  const protocol = 6; // bancor
  const inputToken = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  // poolAddress is no need here.
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    blockNumber,
  };

  await request(query);
}

async function testUniswapV3() {
  // const blockNumber = 14000000;
  // const inputAmount = parseUnits('1000', 18).toString(); // 1000 DAI
  const inputAmount = '1000000000';
  const protocol = 1; // uniswapv3
  const inputToken = '0xdac17f958d2ee523a2206206994597c13d831ec7'; // DAI
  const outputToken = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'; // USDC
  const poolAddress = '0x9db9e0e53058c89e5b94e29621a205198648425b';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    // blockNumber,
    poolAddress,
  };
  await request(query);
}

////// for okc
async function testKSwap() {
  // const blockNumber = 14000000;
  const inputAmount = parseUnits('1', 18).toString(); // 1 ETH
  const protocol = 8;
  const chainId = 2;
  const inputToken = '0x382bb369d343125bfb2117af9c149795c6c65c50';
  const outputToken = '0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    chainId,
    // blockNumber,
  };
  await request(query);
}

////// for bsc
async function testPancakeSwap() {
  // const blockNumber = 14000000;
  const inputAmount = parseUnits('1', 18).toString(); // 1 ETH
  const protocol = 25;
  const chainId = 1;
  const inputToken = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
  const outputToken = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    chainId,
    // blockNumber,
  };
  await request(query);
}

testPancakeSwap();
testUniswapV2();
testCurve();
testBalancer();
testBalancerV2();
testKyberNetwork();
testBancor();
testUniswapV3();
testKSwap();
