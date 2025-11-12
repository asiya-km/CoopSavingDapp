import { ethers } from 'ethers';
import { CONFIG, CONTRACT_ADDRESSES, RPC_URLS } from '../config';
import CoopSavingABI from '../artifacts/CoopSaving.json';

export const connectToSepolia = async () => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if Sepolia network is active
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== CONFIG.sepolia.chainId) {
        try {
          // Switch to Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONFIG.sepolia.chainId }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [CONFIG.sepolia],
            });
          } else {
            throw switchError;
          }
        }
      }
      
      // Create provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Get contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia,
        CoopSavingABI.abi,
        signer
      );
      
      return { provider, signer, contract, address, network: 'sepolia' };
      
    } catch (error) {
      console.error('Error connecting to Sepolia:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask!');
  }
};

// Fallback to read-only provider
export const getReadOnlyContract = () => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URLS.sepolia);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESSES.sepolia,
    CoopSavingABI.abi,
    provider
  );
  return contract;
};