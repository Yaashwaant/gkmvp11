// Configuration for connecting to existing public blockchain networks
export interface BlockchainNetwork {
  name: string;
  chainId: number;
  rpcUrl: string;
  contractAddress?: string;
  explorerUrl: string;
  gasPrice: string;
  nativeCurrency: string;
  isTestnet: boolean;
}

// Popular blockchain networks for fraud prevention
export const BLOCKCHAIN_NETWORKS: Record<string, BlockchainNetwork> = {
  // Polygon (Recommended - Low cost, fast transactions)
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com/',
    contractAddress: undefined, // Deploy fraud prevention contract here
    explorerUrl: 'https://polygonscan.com',
    gasPrice: '30000000000', // 30 gwei
    nativeCurrency: 'MATIC',
    isTestnet: false
  },

  // Polygon Mumbai Testnet (For testing)
  polygonTestnet: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    contractAddress: undefined,
    explorerUrl: 'https://mumbai.polygonscan.com',
    gasPrice: '20000000000',
    nativeCurrency: 'MATIC',
    isTestnet: true
  },

  // Ethereum Mainnet (Higher cost but most secure)
  ethereum: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    contractAddress: undefined,
    explorerUrl: 'https://etherscan.io',
    gasPrice: '50000000000', // 50 gwei
    nativeCurrency: 'ETH',
    isTestnet: false
  },

  // BSC (Binance Smart Chain) - Lower cost alternative
  bsc: {
    name: 'Binance Smart Chain',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    contractAddress: undefined,
    explorerUrl: 'https://bscscan.com',
    gasPrice: '5000000000', // 5 gwei
    nativeCurrency: 'BNB',
    isTestnet: false
  },

  // Avalanche C-Chain - Fast and cheap
  avalanche: {
    name: 'Avalanche C-Chain',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    contractAddress: undefined,
    explorerUrl: 'https://snowtrace.io',
    gasPrice: '25000000000',
    nativeCurrency: 'AVAX',
    isTestnet: false
  }
};

// Smart contract ABI for fraud prevention
export const FRAUD_PREVENTION_CONTRACT_ABI = [
  {
    "inputs": [
      {"name": "vehicleNumber", "type": "string"},
      {"name": "odometerReading", "type": "uint256"},
      {"name": "readingHash", "type": "bytes32"},
      {"name": "appSignature", "type": "string"}
    ],
    "name": "registerReading",
    "outputs": [{"name": "success", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "readingHash", "type": "bytes32"}],
    "name": "isReadingUsed",
    "outputs": [
      {"name": "used", "type": "bool"},
      {"name": "appSource", "type": "string"},
      {"name": "timestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "vehicleNumber", "type": "string"}],
    "name": "getVehicleReadingCount",
    "outputs": [{"name": "count", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Instructions for deploying to real blockchain
export const DEPLOYMENT_GUIDE = `
# How to Connect to Real Public Blockchains

## Option 1: Polygon (Recommended)
- **Cost**: Very low (~$0.001-0.01 per transaction)
- **Speed**: 2-5 seconds
- **Setup**: 
  1. Get MATIC tokens for gas fees
  2. Deploy smart contract to Polygon
  3. Set POLYGON_RPC_URL in environment
  4. Set CONTRACT_ADDRESS after deployment

## Option 2: Ethereum Mainnet
- **Cost**: Higher ($1-10 per transaction depending on gas)
- **Speed**: 15 seconds - 5 minutes
- **Security**: Maximum security and decentralization
- **Setup**: Requires ETH for gas fees

## Option 3: BSC (Binance Smart Chain)
- **Cost**: Very low (~$0.20-0.50 per transaction)
- **Speed**: 3 seconds
- **Setup**: Requires BNB for gas fees

## Smart Contract Deployment
1. Use Remix IDE or Hardhat
2. Deploy the fraud prevention contract
3. Update CONTRACT_ADDRESS in environment
4. Fund the deployer wallet with native tokens

## Environment Variables Needed:
- BLOCKCHAIN_NETWORK (polygon/ethereum/bsc)
- RPC_URL (blockchain node endpoint)
- CONTRACT_ADDRESS (deployed contract address)
- PRIVATE_KEY (for signing transactions)
- INFURA_KEY or ALCHEMY_KEY (for Ethereum/Polygon)

## Testing
- Start with testnets (Mumbai, Sepolia, BSC Testnet)
- Use testnet faucets for free test tokens
- Verify contract on block explorer
`;

export function getSelectedNetwork(): BlockchainNetwork {
  const networkName = process.env.BLOCKCHAIN_NETWORK || 'polygonTestnet';
  return BLOCKCHAIN_NETWORKS[networkName] || BLOCKCHAIN_NETWORKS.polygonTestnet;
}