import axios from 'axios';
import { ethers } from 'ethers';
import { QuoteResponse, QuoteParam } from '../src/types';
import { formatUnits, parseUnits } from '../src/utils';

async function test() {
  const url = 'http://localhost:3000/quote';
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
    console.log('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  console.log(formatUnits(quoteRes.outputAmount, 6));
}

async function testCurve() {
  const url = 'http://localhost:3000/quote';
  const blockNumber = 14000000;
  const inputAmount = parseUnits('1000', 18).toString(); // 1000 DAI
  const protocol = 2;
  const inputToken = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
  const outputToken = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  const poolAddress = '0xecd5e75afb02efa118af914515d6521aabd189f1';
  const query: QuoteParam = {
    protocol,
    inputAmount,
    inputToken,
    outputToken,
    blockNumber,
    poolAddress,
  };
  const res = await axios.get(url, { params: query });
  console.log(res.config.url);
  if (res.status != 200) {
    console.log('get failed');
  }
  const quoteRes = res.data as QuoteResponse;
  console.log(formatUnits(quoteRes.outputAmount, 6));
}

async function main() {
  const provider = ethers.providers.getDefaultProvider();
  const inputAmount = parseUnits('1000', 18).toString(); // 1000 DAI
  const encodedParams = ethers.utils.defaultAbiCoder.encode(
    ['int128', 'int128', 'uint256'],
    [1, 2, '1000000000000000000000']
  );
  const data = '0x07211ef7' + encodedParams.slice(2);
  const res = await provider.call({
    to: '0xecd5e75afb02efa118af914515d6521aabd189f1',
    data,
  });
  console.log(ethers.utils.defaultAbiCoder.decode(['uint256'], res).toString());
}

testCurve();
// main()
