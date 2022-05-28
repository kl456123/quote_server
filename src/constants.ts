import { ethers } from 'ethers';
import { Protocol, ChainId } from './types';

export const UNISWAPV2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
export const SAMPLER_ADDRESS = '0xE9BBD6eC0c9Ca71d3DcCD1282EE9de4F811E50aF';
export const KYBER_ROUTER02 = '0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6';
export const BANCOR_ADDRESS = '0x2F9EC37d6CcFFf1caB21733BdaDEdE11c823cCB0';
export const UNISWAPV3_QUOTER = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
export const KYBER_FACTORY_ADDRESS =
  '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE';
export const Zero = ethers.constants.Zero;

// curve v1 and v2
export const curveRegistryAddr = '0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5';
export const curveV2RegistryAddr = '0x8F942C20D02bEfc377D41445793068908E2250D0';
export const stablePoolFactoryAddr =
  '0xB9fC157394Af804a3578134A6585C0dc9cc990d4';
export const cryptoPoolFactoryAddr =
  '0xF18056Bbd320E96A48e3Fbf8bC061322531aac99';

// export const dexRouterAddr = '0x3b3ae790Df4F312e745D270119c6052904FB6790';
// export const tokenApproveAddr = '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f';

// wealthy address
// ethereum
export const BINANCE = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503';
export const BINANCE8 = '0xf977814e90da44bfa03b6295a0616a897441acec';
export const BINANCE7 = '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8';
export const MULTICHAIN = '0xc564ee9f21ed8a2d8e7e76c085740d5e4c5fafbe';
export const CIRCLE = '0x55FE002aefF02F77364de339a1292923A15844B8';
export const BITFINEX = '0x5754284f345afc66a98fbB0a0Afe71e0F007B949';
// bsc
export const BINANCE6BSC = '0x8894e0a0c962cb723c1976a4421c95949be2d4e3';

// okc
export const WealthyOKC = '0xeB196a61f9A1E35Bf5053b65AAA57c5541dcBa86';

// okc dapp address
export const KSWAP_ROUTER = '0xc3364A27f56b95f4bEB0742a7325D67a04D80942';

export const uniswapv2LikeRouterMap: Partial<{
  [chainId in ChainId]: Partial<{ [protocol in Protocol]: string }>;
}> = {
  [ChainId.Ethereum]: {
    [Protocol.UniswapV2]: UNISWAPV2_ROUTER,
    [Protocol.SushiSwap]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    [Protocol.Convergence]: '0x8Cda39226daf33ae1Aba0C92C34d1a1982Cf0210',
    [Protocol.ShibaSwap]: '0x03f7724180AA6b939894B5Ca4314783B0b36b329',
    [Protocol.LuaSwap]: '0x1d5C6F1607A171Ad52EFB270121331b3039dD83e',
    [Protocol.DefiSwap]: '0xCeB90E4C17d626BE0fACd78b79c9c87d7ca181b3',
  },

  [ChainId.BSC]: {
    [Protocol.MDEX]: '0x7DAe51BD3E3376B8c7c4900E9107f12Be3AF1bA8',
    [Protocol.BiSwap]: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
    [Protocol.ApeSwap]: '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7',
    [Protocol.BabySwap]: '0x325E343f1dE602396E256B67eFd1F61C3A6B38Bd',
    [Protocol.KnightSwap]: '0x05E61E0cDcD2170a76F9568a110CEe3AFdD6c46f',
    [Protocol.DefiBox]: '0xfd0A50D0350Fa7A0cd233Fd229bAa6703F425BF8',
    [Protocol.BakerySwap]: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F',
    [Protocol.AutoShark]: '0xB0EeB0632bAB15F120735e5838908378936bd484',
    [Protocol.BenSwap]: '0xd07622f60543D1f744B6397C27Ac4a2e226d0943',
    [Protocol.BurgeSwap]: '',
    [Protocol.JetSwap]: '0xBe65b8f75B9F20f4C522e0067a3887FADa714800',
    [Protocol.PancakeSwap]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    [Protocol.SushiSwap]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  },

  [ChainId.OKC]: {
    [Protocol.KSwap]: KSWAP_ROUTER,
    [Protocol.JSwap]: '0x069A306A638ac9d3a68a6BD8BE898774C073DCb3',
    [Protocol.AISwap]: '0x9F843d9BA2A386BDA2845507450Fd47934fb3D03',
    [Protocol.CherrySwap]: '0x865bfde337C8aFBffF144Ff4C29f9404EBb22b15',
    [Protocol.SushiSwap]: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
  },
  [ChainId.Polygon]: {
    [Protocol.QuickSwap]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    [Protocol.Dfyn]: '0xA102072A4C07F06EC3B4900FDC4C7B80b6c57429',
    [Protocol.ApeSwap]: '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607',
  },
};

export type DexRouterAddrType =
  | 'balancerAdapterAddr'
  | 'uniswapV2AdapterAddr'
  | 'uniswapV3AdapterAddr'
  | 'balancerV2AdapterAddr'
  | 'curveAdapterAddr'
  | 'curveV2AdapterAddr'
  | 'kyberAdapterAddr'
  | 'bancorAdapterAddr'
  | 'pancakeAdapterAddr'
  | 'bakeryAdapterAddr';

export const dexRouterMap: {
  [chainId in ChainId]: Partial<{ [name in DexRouterAddrType]: string }> & {
    [name in 'tokenApproveAddr' | 'dexRouterAddr']: string;
  };
} = {
  [ChainId.Ethereum]: {
    tokenApproveAddr: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
    dexRouterAddr: '0x3b3ae790Df4F312e745D270119c6052904FB6790',
    uniswapV2AdapterAddr: '0xc837BbEa8C7b0caC0e8928f797ceB04A34c9c06e',
    uniswapV3AdapterAddr: '0x03F911AeDc25c770e701B8F563E8102CfACd62c0',
    balancerAdapterAddr: '0x2fa31d2ac017869998F9574bAC76094a8110cf7C',
    balancerV2AdapterAddr: '0x43c9361709bE9cE6B1E33ac31426b08dbC09e58a',
    kyberAdapterAddr: '0x1c8875B6A9Df43256b244a7Ba4790F6A7185d8c9',
    bancorAdapterAddr: '0xbF1840d0dB54357287Cf0736A1426Ea93321B0F7',
    curveAdapterAddr: '0x47B5BC2C49aD25dFa6d7363c5e9B28eF804e1185',
    curveV2AdapterAddr: '0xB2DC2da9684DfEF77CFa5c6bb07e733023715292',
  },
  [ChainId.BSC]: {
    tokenApproveAddr: '0x2c34A2Fb1d0b4f55de51E1d0bDEfaDDce6b7cDD6',
    dexRouterAddr: '0x9333C74BDd1E118634fE5664ACA7a9710b108Bab',
    uniswapV2AdapterAddr: '0x363FB85314c5d7BAF27e9e5AC3b6E8bDa9ae9b85',
    kyberAdapterAddr: '0x595Da5C1b445493f5C5dB7fb8813de594c760bee',
    pancakeAdapterAddr: '0x1cB017EC34cCD9B808e4F125163807885AB70338',
    bakeryAdapterAddr: '0xeB1426f967D9642317148b401EbB6a687E1a174a',
  },
  [ChainId.OKC]: {
    tokenApproveAddr: '0x70cBb871E8f30Fc8Ce23609E9E0Ea87B6b222F58',
    dexRouterAddr: '0xf6Aab105CB9e66e03CAD2c2F3f8558242593385c',
    uniswapV2AdapterAddr: '0x5eAe840294c757e6fffE462e9C989944386613d4',
  },
  [ChainId.Polygon]: {
    tokenApproveAddr: '0x3B86917369B83a6892f553609F3c2F439C184e31',
    dexRouterAddr: '0xA748D6573acA135aF68F2635BE60CB80278bd855',
    uniswapV2AdapterAddr: '0x0112bc6fDB78345e612B862a6B388FfeB00E2320',
  },
  [ChainId.Avax]: {
    tokenApproveAddr: '0x40aA958dd87FC8305b97f2BA922CDdCa374bcD7f',
    dexRouterAddr: '0x1daC23e41Fc8ce857E86fD8C1AE5b6121C67D96d',
    uniswapV2AdapterAddr: '0x078b9259b4dc543eCa8F85A70d4635F403238D21',
  },
  [ChainId.Tron]: {
    tokenApproveAddr: '',
    dexRouterAddr: '',
    balancerAdapterAddr: '',
  },
};
