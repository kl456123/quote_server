import axios from 'axios';
import { SwapResponse, SwapParam, ChainId } from '../src/types';
import { formatUnits, parseUnits } from '../src/utils';
import { tokensByChain } from '../src/tokens';
import { logger } from '../src/logging';
import { ethers } from 'ethers';

import dotenv from 'dotenv';
dotenv.config();

const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/swap`;

async function testUniswapV3(query: SwapParam) {
  try {
    const res = await axios.get(url, { params: query });
    const quoteRes = res.data as SwapResponse;
    logger.info(quoteRes);
  } catch (error: any) {
    logger.fatal(`${error.response.data.error}`);
  }
}

async function main() {
  const amount = '10';
  const tokens = tokensByChain[ChainId.Polygon]!;
  // const ethValue = ethers.utils.parseEther(amount.toString()).toString();
  const inputAmount = ethers.utils.parseUnits(amount, 6).toString();
  const inputToken = tokens.USDC.address; // USDC
  const outputToken = tokens.WMATIC.address; //WMATIC
  const walletAddress = '0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8';
  // const chainId = 43114; // Avax
  // const chainId = 137;// Polygon
  // const chainId = 56;// BSC
  // const chainId = 66;// OKC
  // const query = {
  // amount,
  // fromCoinId: 818,
  // toCoinId: 41,
  // chainId,
  // toTokenDecimal: 6,
  // fromTokenDecimal: 6,
  // toTokenAddress: outputToken,
  // fromTokenAddress: inputToken,
  // };
  // const result = await axios.get(
  // 'https://beta.okex.org/priapi/v1/dx/trade/multi/v2/quoteAndCalldata',
  // { params: query }
  // );
  // const response = result.data as { data: { calldata: string } };

  // const calldata = response.data.calldata;
  const calldata =
    '0xa6497e5c0000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000000000000000000000000000000000000098968000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000180000000000000003b6d03406e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827';
  const swapParam: SwapParam = {
    walletAddress,
    calldata,
    inputToken,
    outputToken,
    inputAmount,
    chainId: ChainId.Polygon,
    // ethValue,
  };
  console.log(swapParam);
  await testUniswapV3(swapParam);
}

main().catch(console.error);
