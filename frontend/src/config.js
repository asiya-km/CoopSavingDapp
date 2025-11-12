// frontend/src/config.js
export const CONFIG = {
  sepolia: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://sepolia.infura.io/v3/a8327af40d8e476384bb58da87e44942'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  // Add other networks if needed
  localhost: {
    chainId: '0x7a69', // 31337 in hex
    chainName: 'Hardhat Local',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  }
};

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  sepolia: process.env.VITE_CONTRACT_ADDRESS || "YOUR_DEPLOYED_CONTRACT_ADDRESS",
  localhost: process.env.VITE_CONTRACT_ADDRESS || "YOUR_LOCAL_CONTRACT_ADDRESS"
};

// RPC URLs
export const RPC_URLS = {
  sepolia: process.env.VITE_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/a8327af40d8e476384bb58da87e44942",
  localhost: "http://127.0.0.1:8545"
};