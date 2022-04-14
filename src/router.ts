import Router from '@koa/router';
import { QuoteParam } from './types';
import { quoteHandler } from './quoteHandler';
import { provider } from './utils';
import { logger } from './logging';

const router = new Router();

// homepage
router.get('/', async ctx => {
  ctx.body = 'hello world';
});

router.get('/swap', async ctx => {
  ctx;
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
  const outputAmount = await quoteHandler(quoteParam, provider);
  if (!outputAmount) {
    ctx.body = `unsupported protocol: ${quoteParam.protocol}`;
    ctx.error = 400;
    return;
  }
  ctx.body = {
    outputAmount: outputAmount.toString(),
  };

  // logging
  logger.info('query: ', query);
  logger.info('outputAmount: ', outputAmount.toString());
});

export { router };
