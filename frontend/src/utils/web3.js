import { ethers } from 'ethers';

export const CONFIG = {
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  }
};

export const connectToSepolia = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== CONFIG.sepolia.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.sepolia.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [CONFIG.sepolia],
            });
          }
        }
      }
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      return { provider, signer, address, network: 'sepolia' };
      
    } catch (error) {
      console.error('Error connecting to Sepolia:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask!');
  }
};