import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import CoopSavingABI from '../artifacts/CoopSaving.json';
import contractAddress from '../artifacts/contract-address.json';

export const useCoopSaving = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  // Force refresh all data
  const refreshAllData = useCallback(() => {
    console.log('🔄 Refreshing all data...');
    setDataVersion(prev => prev + 1);
  }, []);

  // Check registration status
  const checkRegistrationStatus = useCallback(async (contractInstance, userAccount) => {
    if (!contractInstance || !userAccount) {
      console.log('❌ Cannot check registration: missing contract or account');
      return false;
    }

    try {
      console.log('🔍 Checking registration for:', userAccount);
      const registered = await contractInstance.isRegistered(userAccount);
      console.log('📝 Registration status:', registered);
      return registered;
    } catch (error) {
      console.log('⚠️ Registration check failed (user probably not registered):', error.message);
      return false;
    }
  }, []);

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          console.log('🚀 Initializing DApp...');
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const signer = provider.getSigner();
            const account = accounts[0];
            
            console.log('👤 Connected account:', account);
            setAccount(account);
            setIsConnected(true);
            
            const contractInstance = new ethers.Contract(
              contractAddress.address,
              CoopSavingABI.abi,
              signer
            );
            setContract(contractInstance);
            console.log('📄 Contract instance created');

            // Check registration status with detailed logging
            const registered = await checkRegistrationStatus(contractInstance, account);
            setIsRegistered(registered);
            
            if (registered) {
              console.log('✅ User is registered');
            } else {
              console.log('❌ User is NOT registered');
            }
          } else {
            console.log('🔌 No accounts connected');
          }
        } catch (error) {
          console.error('💥 Initialization error:', error);
        }
      } else {
        console.log('❌ MetaMask not detected');
      }
    };
    init();
  }, [dataVersion, checkRegistrationStatus]);

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Install MetaMask');
      return;
    }

    try {
      setLoading(true);
      console.log('🔗 Connecting wallet...');
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = accounts[0];

      console.log('👤 Connected account:', account);
      setAccount(account);
      setIsConnected(true);

      const contractInstance = new ethers.Contract(
        contractAddress.address,
        CoopSavingABI.abi,
        signer
      );
      setContract(contractInstance);

      // Check registration
      const registered = await checkRegistrationStatus(contractInstance, account);
      setIsRegistered(registered);
      
      console.log('🎯 Final registration status after connect:', registered);

    } catch (error) {
      if (error.code === 4001) {
        alert('Connection cancelled');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Register function with detailed logging
  const registerMember = async () => {
    if (!contract) throw new Error('No contract');
    
    try {
      setLoading(true);
      console.log('📝 Starting registration process...');
      console.log('👤 Registering account:', account);
      console.log('📄 Contract address:', contract.address);
      
      // Check current status before registering
      const currentStatus = await checkRegistrationStatus(contract, account);
      console.log('📊 Current registration status before:', currentStatus);
      
      if (currentStatus) {
        throw new Error('Already registered');
      }

      console.log('🔄 Sending registration transaction...');
      const tx = await contract.register({ 
        gasLimit: 100000 
      });
      console.log('📨 Transaction sent:', tx.hash);
      
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      console.log('✅ Registration successful! Receipt:', receipt);
      
      // Verify registration after transaction
      console.log('🔍 Verifying registration after transaction...');
      const newStatus = await checkRegistrationStatus(contract, account);
      console.log('📊 New registration status after:', newStatus);
      
      if (newStatus) {
        console.log('🎉 Registration confirmed on blockchain!');
        setIsRegistered(true);
        refreshAllData();
      } else {
        console.error('❌ Registration failed - contract still shows not registered');
        throw new Error('Registration not reflected on blockchain');
      }
      
      return receipt;
    } catch (error) {
      console.error('💥 Registration failed:', error);
      if (error.message.includes('Already registered')) {
        throw new Error('You are already registered as a member');
      } else if (error.code === 4001) {
        throw new Error('Registration cancelled by user');
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  // Deposit function
  const deposit = async (amount) => {
    if (!contract) throw new Error('No contract');
    try {
      setLoading(true);
      const tx = await contract.deposit({
        value: ethers.utils.parseEther(amount.toString()),
        gasLimit: 150000
      });
      const receipt = await tx.wait();
      refreshAllData();
      return receipt;
    } catch (error) {
      console.error('Deposit failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw function
  const withdraw = async (amount) => {
    if (!contract) throw new Error('No contract');
    try {
      setLoading(true);
      const tx = await contract.withdraw(
        ethers.utils.parseEther(amount.toString()),
        { gasLimit: 150000 }
      );
      const receipt = await tx.wait();
      refreshAllData();
      return receipt;
    } catch (error) {
      console.error('Withdraw failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Request loan function - Only for registered users
  const requestLoan = async (amount, interest) => {
    if (!contract) throw new Error('No contract');
    if (!isRegistered) throw new Error('You must be registered to request a loan');
    
    try {
      setLoading(true);
      const tx = await contract.requestLoan(
        ethers.utils.parseEther(amount.toString()),
        interest,
        { gasLimit: 250000 }
      );
      const receipt = await tx.wait();
      
      // Find loan ID from event
      const event = receipt.events?.find(e => e.event === 'LoanRequested');
      let loanId;
      
      if (event && event.args) {
        loanId = event.args.loanId.toString();
        console.log('Loan requested with ID:', loanId);
      } else {
        loanId = receipt.transactionHash;
        console.warn('LoanRequested event not found, using transaction hash');
      }
      
      refreshAllData();
      return loanId;
    } catch (error) {
      console.error('Loan request failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Approve loan function - Only for registered users
  const approveLoan = async (loanId) => {
    if (!contract) throw new Error('No contract');
    if (!isRegistered) throw new Error('You must be registered to approve loans');
    
    try {
      setLoading(true);
      const tx = await contract.approveLoan(loanId, { 
        gasLimit: 200000 
      });
      const receipt = await tx.wait();
      refreshAllData();
      return receipt;
    } catch (error) {
      console.error('Loan approval failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Repay loan function - Only for registered users
  const repayLoan = async (loanId, amount) => {
    if (!contract) throw new Error('No contract');
    if (!isRegistered) throw new Error('You must be registered to repay loans');
    
    try {
      setLoading(true);
      const amountWei = ethers.utils.parseEther(amount.toString());
      
      const tx = await contract.repayLoan(loanId, {
        value: amountWei,
        gasLimit: 200000
      });
      
      const receipt = await tx.wait();
      refreshAllData();
      return receipt;
    } catch (error) {
      console.error('Loan repayment failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // View functions
  const getBalance = async () => {
    if (!contract || !account) return '0';
    try {
      const balance = await contract.getBalance(account);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      return '0';
    }
  };

  const getLoan = async () => {
    if (!contract || !account) return '0';
    try {
      const loan = await contract.getLoan(account);
      return ethers.utils.formatEther(loan);
    } catch (error) {
      return '0';
    }
  };

  const getMembers = async () => {
    if (!contract) return [];
    try {
      const members = await contract.getMembers();
      console.log('📋 Fetched members:', members.length, 'members');
      return members;
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  };

  const getTotalPool = async () => {
    if (!contract) return '0';
    try {
      const pool = await contract.getTotalPool();
      return ethers.utils.formatEther(pool);
    } catch (error) {
      return '0';
    }
  };

  // Manual refresh function
  const manualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refreshAllData();
  };

  return {
    contract,
    account,
    isConnected,
    isRegistered,
    loading,
    connectWallet,
    registerMember,
    deposit,
    withdraw,
    requestLoan,
    approveLoan,
    repayLoan,
    getBalance,
    getLoan,
    getMembers,
    getTotalPool,
    refreshAllData: manualRefresh
  };
};