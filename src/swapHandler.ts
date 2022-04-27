import { ethers } from 'ethers';
import { SwapParam } from './types';
import { tokenApproveAddr, dexRouterAddr, BINANCE7 } from './constants';
import { IERC20__factory } from './typechain';
import { logger } from './logging';
import { impersonateAndTransfer, impersonateAccount } from './test_helper';

function getDefaultEOA() {
  return BINANCE7;
}

export async function swapHandler(
  swapParam: SwapParam,
  provider: ethers.providers.JsonRpcProvider
) {
  const approveAddress = swapParam.tokenApproveAddress ?? tokenApproveAddr;
  const exchangeAddress = swapParam.exchangeAddress ?? dexRouterAddr;
  const walletAddress = swapParam.walletAddress ?? getDefaultEOA();
  // get permission of a wealthy account
  const signer = await impersonateAccount(walletAddress);

  // to survery why it doesn't work here?
  // const signer = provider.getSigner(walletAddress || 0);
  const max = ethers.constants.MaxUint256;
  const inputTokenContract = IERC20__factory.connect(
    swapParam.inputToken,
    provider
  );
  const outputTokenContract = IERC20__factory.connect(
    swapParam.outputToken,
    provider
  );

  // approve dexRouter for input token
  await inputTokenContract.connect(signer).approve(approveAddress, max);

  // check output token balance before and after
  const before = await outputTokenContract.balanceOf(walletAddress);
  // execute swap in dexRouter
  const tx = {
    from: walletAddress,
    to: exchangeAddress,
    data: swapParam.calldata,
    value: swapParam.ethValue ?? 0,
  };
  const gasLimit = await provider.estimateGas(tx);
  const gasPrice = await provider.getGasPrice();
  await signer.sendTransaction({ ...tx, gasLimit, gasPrice });

  // check balance again
  const after = await outputTokenContract.balanceOf(walletAddress);
  const outputAmount = after.sub(before);

  return outputAmount;
}
