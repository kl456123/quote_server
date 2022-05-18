import { ethers, BigNumber } from 'ethers';
import { SwapParam, SwapResponse } from './types';
import { BINANCE7, dexRouterMap } from './constants';
import { IERC20__factory } from './typechain';
import ganache from 'ganache';
import { getUrl } from './utils';
import {
  impersonateAndTransfer,
  isNativeToken,
  AccountsRecord,
  // impersonateAccount,
  wealthyAccountsByChains,
} from './test_helper';

function getDefaultEOA() {
  return BINANCE7;
}

async function prepareTokens(
  walletAddress: string,
  tokenAddr: string,
  tokenAmount: string,
  ethValue: string,
  wealthyAccounts: AccountsRecord,
  provider: ethers.providers.JsonRpcProvider
) {
  const accounts = Object.values(wealthyAccounts).filter(
    item => item.contract.toLowerCase() === tokenAddr.toLowerCase()
  );
  if (!accounts.length) {
    throw new Error(`trading from tokenAddr(${tokenAddr}) is not supported`);
  }
  const gasValue = ethers.utils.parseEther('10');
  const totalValue = BigNumber.from(ethValue).add(gasValue);
  const promises = [];
  promises.push(
    impersonateAndTransfer(
      totalValue,
      wealthyAccounts.NativeToken,
      walletAddress,
      provider
    )
  );
  if (BigNumber.from(tokenAmount).gt(0)) {
    promises.push(
      impersonateAndTransfer(tokenAmount, accounts[0], walletAddress, provider)
    );
  }
  await Promise.all(promises);
}

export async function swapHandler(swapParam: SwapParam): Promise<SwapResponse> {
  const approveAddress =
    swapParam.tokenApproveAddress ??
    dexRouterMap[swapParam.chainId].tokenApproveAddr;
  const exchangeAddress =
    swapParam.exchangeAddress ?? dexRouterMap[swapParam.chainId].dexRouterAddr;
  const wealthyAccounts = wealthyAccountsByChains[swapParam.chainId];
  if (!approveAddress.length || !exchangeAddress.length || !wealthyAccounts) {
    throw new Error(`chainId: ${swapParam.chainId} is not supported`);
  }
  const walletAddress = swapParam.walletAddress ?? getDefaultEOA();
  // get permission of a wealthy account
  // const signer = await impersonateAccount(walletAddress);
  const unlockedAccounts = Object.values(wealthyAccounts).map(
    item => item.holder
  );
  unlockedAccounts.push(walletAddress);
  const options = {
    fork: {
      url: getUrl(swapParam.chainId),
      blockNumber: swapParam.blockNumber,
    },
    wallet: { unlockedAccounts },
    // chain: { hardfork: 'berlin' },
  };
  const provider = new ethers.providers.Web3Provider(
    ganache.provider(options as any) as any
  );
  const signer = provider.getSigner(walletAddress);
  const ethValue = swapParam.ethValue ?? '0';

  // prepare tokens
  await prepareTokens(
    walletAddress,
    swapParam.inputToken,
    swapParam.inputAmount,
    ethValue,
    wealthyAccounts,
    provider
  );

  // to survery why it doesn't work here?
  // const signer = provider.getSigner(walletAddress || 0);
  const max = ethers.constants.MaxUint256;
  const outputTokenContract = IERC20__factory.connect(
    swapParam.outputToken,
    provider
  );

  // approve dexRouter for input token
  if (!isNativeToken(swapParam.inputToken)) {
    const inputTokenContract = IERC20__factory.connect(
      swapParam.inputToken,
      provider
    );
    await inputTokenContract.connect(signer).approve(approveAddress, max);
  }

  // execute swap in dexRouter
  const tx = {
    from: walletAddress,
    to: exchangeAddress,
    data: swapParam.calldata,
    value: BigNumber.from(ethValue),
  };
  // check output token balance before and after
  const promisesCalls = [];
  promisesCalls.push(outputTokenContract.balanceOf(walletAddress));
  promisesCalls.push(provider.estimateGas(tx));
  promisesCalls.push(provider.getBlockNumber());
  // promisesCalls.push(provider.getGasPrice());
  const promisesRes = await Promise.all(promisesCalls);
  const before = promisesRes[0];
  const gasLimit = promisesRes[1];
  // const gasPrice = promisesRes[2];
  const blockNumber = promisesRes[2] as number;
  const txRes = await signer.sendTransaction({ ...tx, gasLimit });
  const receipt = await txRes.wait();
  const gasUsed = receipt.gasUsed;

  // check balance again
  const after = await outputTokenContract.balanceOf(walletAddress);
  const outputAmount = after.sub(before);

  return {
    outputAmount: outputAmount.toString(),
    gasUsed: gasUsed.toString(),
    gasLimit: gasLimit.toString(),
    blockNumber,
  };
}
