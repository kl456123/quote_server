import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { logger } from '../src/logging';
import axios from 'axios';

import { Token } from '../src/tokens';
import { tokensByChain } from '../src/tokens';
import { SwapResponse, SwapParam, ChainId, Protocol } from '../src/types';
import { isNativeToken, wealthyAccountsEthereum } from '../src/test_helper';

import dotenv from 'dotenv';
dotenv.config();

const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/swap`;

async function request(query: SwapParam) {
  try {
    const res = await axios.get(url, { params: query });
    const quoteRes = res.data as SwapResponse;
    return quoteRes;
  } catch (error: any) {
    return error.response.data;
  }
}

type OKToken = Token & {
  chainId: number;
  coinId: number;
};

type OKTokenMap = Record<string, OKToken>;

function readTokens(path: string) {
  const str = fs.readFileSync(path, 'utf-8');
  const lines = str
    .split('\n')
    .map(line => line.split(','))
    .slice(1);
  const tokens: OKToken[] = lines
    .filter(line => line[3])
    .map(line => ({
      address: line[3],
      symbol: line[2],
      decimals: parseInt(line[4]),
      chainId: parseInt(line[0]),
      coinId: parseInt(line[5]),
    }));
  return tokens;
}

async function executeSingleTest(
  amount: string,
  inputOKToken: OKToken,
  outputOKToken: OKToken,
  chainId: ChainId
) {
  const fromCoinId = inputOKToken.coinId;
  const fromTokenDecimal = inputOKToken.decimals;
  const outputToken = outputOKToken.address;
  const inputToken = inputOKToken.address;

  const toCoinId = outputOKToken.coinId;
  const toTokenDecimal = outputOKToken.decimals;
  const walletAddress = '0xbD11861D13caFa8Ad6e143DA7034f8A907CD47a8';
  const inputAmount = ethers.utils
    .parseUnits(amount, inputOKToken.decimals)
    .toString();
  const ethValue = isNativeToken(inputToken) ? inputAmount : '0';

  const query = {
    amount,
    fromCoinId,
    toCoinId,
    chainId: 1, // Ethereum mainnet
    toTokenDecimal,
    fromTokenDecimal,
    toTokenAddress: outputToken,
    fromTokenAddress: inputToken,
  };
  const result = await axios.get(
    'https://beta.okex.org/priapi/v1/dx/trade/multi/v2/quoteAndCalldata',
    { params: query }
  );
  const response = result.data as {
    data: { calldata: string; result: { receiveAmount: string } };
  };

  const calldata = response.data.calldata;
  if (!calldata) {
    return {
      inputToken,
      outputToken,
      inputAmount,
      chainId,
      error: 'cannot find any route path',
    };
  }
  let receiveAmount;
  receiveAmount = ethers.utils
    .parseUnits(response.data.result.receiveAmount, toTokenDecimal)
    .toString();

  const swapParam = {
    walletAddress,
    calldata,
    inputToken,
    outputToken,
    inputAmount,
    chainId,
    ethValue,
  };
  // console.log(swapParam);
  const swapResult = await request(swapParam);
  return { ...swapResult, receiveAmount };
}

async function executeAllTest(
  okTokens: OKToken[],
  tokensMap: OKTokenMap,
  chainId: ChainId
) {
  // const tokensMap: OKTokenMap = okTokens.reduce(
  // (res: OKTokenMap, cur: OKToken) => {
  // res[cur.address.toLowerCase()] = cur;
  // return res;
  // },
  // {}
  // );
  // test all ok tokens paired with some stable coins for convenience, swap stable coins for all
  // ok tokens so that we just need to prepare stable tokens only
  const fromTokens = [
    wealthyAccountsEthereum.USDC,
    wealthyAccountsEthereum.DAI,
    wealthyAccountsEthereum.USDT,
    // wealthyAccountsEthereum.WETH,
    // wealthyAccountsEthereum.NativeToken,
  ].map(item => item.contract.toLowerCase());
  const toTokens = Object.values(okTokens).filter(
    token =>
      !fromTokens.some(
        fromToken => fromToken.toLowerCase() == token.address.toLowerCase()
      )
  );

  const batchSize = 10;
  // num of results files to saved
  const numFiles = 10;
  let saveFreq = Math.ceil(toTokens.length / numFiles);
  // make sure freq is times of batchSize
  saveFreq = Math.ceil(saveFreq / batchSize) * batchSize;
  logger.info(
    `batch size: ${batchSize}, save frequency: ${saveFreq} num of total from tokens: ${toTokens.length}`
  );
  const dirname = './results';

  logger.info(`all results are saved to ${dirname}`);

  const swapResults = [];
  const swapPromises = [];
  // prefer larger amount to test
  const amounts = ['10000', '100000', '1000000', '10000000', '100000000'];
  for (let i = 0; i < toTokens.length; ++i) {
    const randAmountInd = Math.floor(Math.random() * amounts.length);
    const amount = amounts[randAmountInd];
    const outputToken = toTokens[i];
    const randInd = Math.floor(Math.random() * fromTokens.length);
    const inputToken = fromTokens[randInd];
    // const inputToken =
    // wealthyAccountsEthereum.NativeToken.contract.toLowerCase();

    const inputOKToken = tokensMap[inputToken];
    const outputOKToken = tokensMap[outputToken.address.toLowerCase()];
    if (!outputOKToken) {
      throw new Error(
        `unknown output token: ${outputToken.address.toLowerCase()}`
      );
    }
    if (!inputOKToken) {
      throw new Error(`unknown input token: ${inputToken}`);
    }
    swapPromises.push(
      executeSingleTest(amount, inputOKToken, outputOKToken, chainId)
    );
    if (swapPromises.length % batchSize == 0 || toTokens.length - 1 === i) {
      const swapResultsPerBatch = await Promise.all(swapPromises);
      logger.info(`processing ${i + 1} of txs`);
      swapResults.push(...swapResultsPerBatch);
      // clear promises
      swapPromises.length = 0;
    }

    if (
      swapResults.length &&
      (swapResults.length % saveFreq == 0 || toTokens.length - 1 === i)
    ) {
      const filepath = path.resolve(dirname, `./swapResults_${i + 1}.json`);
      fs.writeFileSync(filepath, JSON.stringify(swapResults, null, 4));
      logger.info(`some resuls are saved to ${filepath}`);
      // clear results
      swapResults.length = 0;
    }
  }
}

async function main() {
  const okTokens = readTokens(
    `${process.env.TOKENLIST_PATH}`
  ).filter(token => token.chainId === 1);
  const chainId = ChainId.Ethereum;
  const tokensMap: OKTokenMap = okTokens.reduce(
    (res: OKTokenMap, cur: OKToken) => {
      res[cur.address.toLowerCase()] = cur;
      return res;
    },
    {}
  );
  // ethereum only
  await executeAllTest(okTokens, tokensMap, chainId);

  // const tokens = tokensByChain[chainId]!;
  // const amount = '100000';
  // tokens.NativeToken.address.toLowerCase();
  // const inputOKToken = tokensMap['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'.toLowerCase()];
  // const outputOKToken = tokensMap['0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f'];
  // const swapResult = await executeSingleTest(amount, inputOKToken, outputOKToken, chainId);
  // console.log(swapResult);
}

main().catch(console.error);
