import axios from 'axios';
import { SwapResponse, SwapParam } from '../src/types';
import { formatUnits, parseUnits } from '../src/utils';
import { tokens } from '../src/tokens';
import { logger } from '../src/logging';
import { ethers } from 'ethers';

import dotenv from 'dotenv';
dotenv.config();

const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/swap`;

async function testUniswapV3(query: SwapParam) {
  try {
    const res = await axios.get(url, { params: query });
    const quoteRes = res.data as SwapResponse;
    logger.info(formatUnits(quoteRes.outputAmount, 6));
  } catch (error: any) {
    logger.fatal(`${error.response.data.error}`);
  }
}

async function main() {
  const amount = '50';
  const ethValue = ethers.utils.parseEther(amount.toString()).toString();
  const inputAmount = ethers.utils.parseUnits(amount, 6).toString();
  const inputToken = tokens.ETH.address; // WETH
  const outputToken = tokens.USDC.address; //AAVE
  const query = {
    amount,
    fromCoinId: 3,
    toCoinId: 41,
    chainId: 1,
    toTokenDecimal: 6,
    fromTokenDecimal: 1,
    toTokenAddress: outputToken,
    fromTokenAddress: inputToken,
  };
  const result = await axios.get(
    'https://beta.okex.org/priapi/v1/dx/trade/multi/v2/quoteAndCalldata',
    { params: query }
  );
  const response = result.data as { data: { calldata: string } };

  console.log(response.data.calldata);
  const calldata = response.data.calldata;
  const swapParam: SwapParam = {
    calldata,
    inputToken,
    outputToken,
    inputAmount,
    ethValue,
  };
  await testUniswapV3(swapParam);
}

main().catch(console.error);
