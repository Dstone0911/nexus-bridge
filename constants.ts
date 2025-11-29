
import { Chain, Token } from './types';

// Human-Readable ABIs based on the user's provided JSON files
export const NATIVE_OFT_ABI = [
  "function sendFrom(address _from, uint16 _dstChainId, bytes calldata _toAddress, uint _amount, address payable _refundAddress, address _zroPaymentAddress, bytes calldata _adapterParams) external payable",
  "function estimateSendFee(uint16 _dstChainId, bytes calldata _toAddress, uint _amount, bool _useZro, bytes calldata _adapterParams) external view returns (uint nativeFee, uint zroFee)",
  "function deposit() public payable",
  "function balanceOf(address account) external view returns (uint256)",
  "function minSendAmount() external view returns (uint)",
  "function circulatingSupply() external view returns (uint)"
];

export const ERC20_OFT_ABI = [
  "function sendFrom(address _from, uint16 _dstChainId, bytes calldata _toAddress, uint _amount, address payable _refundAddress, address _zroPaymentAddress, bytes calldata _adapterParams) external payable",
  "function estimateSendFee(uint16 _dstChainId, bytes calldata _toAddress, uint _amount, bool _useZro, bytes calldata _adapterParams) external view returns (uint nativeFee, uint zroFee)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function minSendAmount() external view returns (uint)",
  "function circulatingSupply() external view returns (uint)"
];

// LayerZero Endpoints required for deployment
export const LZ_ENDPOINTS: Record<number, string> = {
  1: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675", // Ethereum Mainnet
  5: "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23", // Goerli
  11155111: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1", // Sepolia
  42161: "0x3c2269811836af69497E5F486A85D7316753cf62", // Arbitrum
  137: "0x3c2269811836af69497E5F486A85D7316753cf62", // Polygon
  56: "0x3c2269811836af69497E5F486A85D7316753cf62", // BSC
  80001: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8", // Mumbai
  97: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1", // BSC Testnet
  421613: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab" // Arbitrum Goerli
};

// Contract Addresses from the User's provided files
const GOERLI_NATIVE_OFT = "0x2e5221B0f855Be4ea5Cefffb8311EED0563B6e87";
const MAINNET_NATIVE_OFT = "0x4f7A67464B5976d7547c860109e4432d50AfB38e";

// Standard Zero Address for placeholders
const PLACEHOLDER_OFT = "0x0000000000000000000000000000000000000000"; 

export const CHAINS: Chain[] = [
  // Mainnets
  {
    id: 1,
    lzChainId: 101,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026',
    rpcUrl: 'https://eth.llamarpc.com',
    type: 'mainnet'
  },
  {
    id: 42161,
    lzChainId: 110,
    name: 'Arbitrum',
    symbol: 'ETH',
    icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=026',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    type: 'mainnet'
  },
  {
    id: 137,
    lzChainId: 109,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=026',
    rpcUrl: 'https://polygon-rpc.com',
    type: 'mainnet'
  },
  {
    id: 56,
    lzChainId: 102,
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    type: 'mainnet'
  },
  // Testnets
  {
    id: 5,
    lzChainId: 10121,
    name: 'Goerli',
    symbol: 'ETH',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026',
    rpcUrl: 'https://rpc.ankr.com/eth_goerli',
    type: 'testnet'
  },
  {
    id: 11155111,
    lzChainId: 10161,
    name: 'Sepolia',
    symbol: 'SEP',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026',
    rpcUrl: 'https://rpc.sepolia.org',
    type: 'testnet'
  },
  {
    id: 421613,
    lzChainId: 10143,
    name: 'Arbitrum Goerli',
    symbol: 'AGOR',
    icon: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=026',
    rpcUrl: 'https://goerli-rollup.arbitrum.io/rpc',
    type: 'testnet'
  },
  {
    id: 80001,
    lzChainId: 10109,
    name: 'Mumbai',
    symbol: 'MATIC',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png?v=026',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    type: 'testnet'
  },
  {
    id: 97,
    lzChainId: 10102,
    name: 'BSC Testnet',
    symbol: 'tBNB',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    type: 'testnet'
  }
];

export const TOKENS: Token[] = [
  {
    addresses: {
      1: MAINNET_NATIVE_OFT, 
      5: GOERLI_NATIVE_OFT, 
      11155111: PLACEHOLDER_OFT, // Explicit placeholder for Sepolia
      97: PLACEHOLDER_OFT, 
      80001: PLACEHOLDER_OFT,
      42161: PLACEHOLDER_OFT,
      137: PLACEHOLDER_OFT,
      56: PLACEHOLDER_OFT,
      421613: PLACEHOLDER_OFT
    },
    symbol: 'ETH',
    name: 'Native Ether',
    decimals: 18,
    isNative: true,
    abi: NATIVE_OFT_ABI
  },
  {
    addresses: {
      1: PLACEHOLDER_OFT,
      5: PLACEHOLDER_OFT,
      11155111: PLACEHOLDER_OFT,
      97: PLACEHOLDER_OFT,
      80001: PLACEHOLDER_OFT,
      42161: PLACEHOLDER_OFT,
      137: PLACEHOLDER_OFT,
      56: PLACEHOLDER_OFT,
      421613: PLACEHOLDER_OFT
    },
    symbol: 'METH',
    name: 'Mock Ether OFT',
    decimals: 18,
    isNative: false,
    abi: ERC20_OFT_ABI
  }
];
