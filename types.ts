
export interface Chain {
  id: number;
  lzChainId: number;
  name: string;
  symbol: string;
  icon: string;
  rpcUrl: string;
  type: 'mainnet' | 'testnet';
}

export interface Token {
  addresses: Record<number, string>; // Map ChainID to Contract Address
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  abi: any[];
}

export enum BridgeState {
  IDLE = 'IDLE',
  ESTIMATING = 'ESTIMATING',
  READY = 'READY',
  APPROVING = 'APPROVING',
  BRIDGING = 'BRIDGING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface TransactionQuote {
  nativeFee: string;
  zroFee: string;
  amount: string;
  estimatedReceived: string;
}
