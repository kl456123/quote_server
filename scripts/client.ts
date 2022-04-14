import axios from 'axios';
import { QuoteResponse, QuoteParam } from '../src/types';
import { formatUnits, parseUnits } from '../src/utils';
import { tokens } from '../src/tokens';
import { logger } from '../src/logging';

import dotenv from 'dotenv';
dotenv.config();

const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/quote`;

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
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
}

async function testCurve() {
  const curvePools = [
    '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604', // husd metapool
    '0x80466c64868e1ab14a1ddf27a676c3fcbe638fe5', // tricrypto, [USDT/WBTC/WETH
    '0xd51a44d3fae010294c616388b506acda1bfaae46', // tricrypto2
  ];
  const blockNumber = 14000000;
  const inputAmount = parseUnits('1000', 18).toString(); // 1000 WETH
  const protocol = 2;
  const inputToken = tokens.WETH.address; // WETH
  const outputToken = tokens.USDT.address; // USDT
  const poolAddress = '0xd51a44d3fae010294c616388b506acda1bfaae46';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    blockNumber,
    poolAddress,
  };
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
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
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
}

async function testBalancerV2() {
  const blockNumber = 14000000;
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
    blockNumber,
    poolAddress,
  };
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
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
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
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
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
}

async function testUniswapV3() {
  const blockNumber = 14000000;
  const inputAmount = parseUnits('1000', 18).toString(); // 1000 DAI
  const protocol = 1; // uniswapv3
  const inputToken = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  const poolAddress = '0x5777d92f208679DB4b9778590Fa3CAB3aC9e2168';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    blockNumber,
    poolAddress,
  };
  const res = await axios.get(url, { params: query });
  if (res.status != 200) {
    logger.fatal('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  logger.info(formatUnits(quoteRes.outputAmount, 6));
}

testUniswapV2();
testCurve();
testBalancer();
testBalancerV2();
testKyberNetwork();
testBancor();
testUniswapV3();
