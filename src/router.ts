import Router from '@koa/router';
import { QuoteParam, SwapParam } from './types';
import { quoteHandler } from './quoteHandler';
import { swapHandler } from './swapHandler';
import { provider, testProvider } from './utils';
import { logger } from './logging';

const router = new Router();

// homepage
router.get('/', async ctx => {
  ctx.body = 'hello world';
});

router.get('/swap', async ctx => {
  const query = ctx.query;
  const swapParam: SwapParam = {
    calldata: query.calldata as string,
    inputToken: (query.inputToken as string).toLowerCase(), // lowercase for address
    inputAmount: query.inputAmount as string,
    outputToken: (query.outputToken as string).toLowerCase(),
    ethValue: query.ethValue as string | undefined,
    blockNumber: query.blockNumber
      ? parseInt(query.blockNumber as string)
      : undefined,
  };
  try {
    const outputAmount = await swapHandler(swapParam, testProvider);
    ctx.body = {
      outputAmount: outputAmount.toString(),
    };
    ctx.status = 200;
    // logging
    logger.info('query: ', query);
    logger.info('outputAmount: ', outputAmount.toString());
  } catch (error) {
    ctx.body = {
      error: JSON.stringify(error),
    };
    ctx.status = 400;
    logger.info('query: ', query);
    logger.error(`error: ${error}`);
  }
});

router.get('/quote', async ctx => {
  const query = ctx.query;
  const quoteParam: QuoteParam = {
    blockNumber: query.blockNumber
      ? parseInt(query.blockNumber as string)
      : undefined,
    inputAmount: query.inputAmount as string,
    inputToken: (query.inputToken as string).toLowerCase(), // lowercase for address
    outputToken: (query.outputToken as string).toLowerCase(),
    protocol: parseInt(query.protocol as string),
    poolAddress: query.poolAddress as string,
  };

  try {
    const outputAmount = await quoteHandler(quoteParam, provider);
    ctx.body = {
      outputAmount: outputAmount.toString(),
    };
    ctx.status = 200;
    // logging
    logger.info('query: ', query);
    logger.info('outputAmount: ', outputAmount.toString());
  } catch (error) {
    ctx.body = {
      error: error,
    };
    ctx.status = 400;
    logger.info('query: ', query);
    logger.error(`error: ${error}`);
  }
});

export { router };
