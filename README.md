# quote_server

## Installation

```bash
yarn && yarn compile
```

## Demo

```bash
# config env
cp .env.example .env # change env for yourself

# run server
yarn start

# use client to test server
yarn test_quote
yarn test_swap
```

## Devlopment

add new quote handlers for more DEXes in `src/quoteHandler`

TODO list

- [x] UniswapV2
- [x] UniswapV3
- [x] Curve
- [x] CurveV2
- [x] Balancer
- [x] BalancerV2
- [x] Bancor
- [x] Kyber
- [x] KSwap
