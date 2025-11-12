import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import MemberDashboard from './components/MemberDashboard';
import LoanManagement from './components/LoanManagement';
import { useCoopSaving } from './hooks/useCoopSaving';
import './index.css';

function App() {
  const {
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
    refreshAllData // Make sure this is included
  } = useCoopSaving();

  const [transactionLoading, setTransactionLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setTransactionLoading(true);
      await registerMember();
      alert('✅ Registered successfully!');
    } catch (error) {
      console.error('Register failed:', error);
      if (error.code === 4001) {
        alert('❌ Transaction cancelled');
      } else if (error.message.includes('Already registered')) {
        alert('ℹ️ Already registered');
      } else {
        alert('❌ Registration failed: ' + error.message);
      }
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleDeposit = async (amount) => {
    try {
      setTransactionLoading(true);
      await deposit(amount);
      alert('✅ Deposit successful!');
    } catch (error) {
      if (error.code === 4001) {
        alert('❌ Deposit cancelled');
      } else {
        alert('❌ Deposit failed: ' + error.message);
      }
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleWithdraw = async (amount) => {
    try {
      setTransactionLoading(true);
      await withdraw(amount);
      alert('✅ Withdrawal successful!');
    } catch (error) {
      if (error.code === 4001) {
        alert('❌ Withdrawal cancelled');
      } else {
        alert('❌ Withdrawal failed: ' + error.message);
      }
    } finally {
      setTransactionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <WalletConnect 
          connectWallet={connectWallet}
          account={account}
          isConnected={isConnected}
          loading={loading}
        />

        {isConnected && (
          <>
            <MemberDashboard
              account={account}
              isRegistered={isRegistered}
              registerMember={handleRegister}
              deposit={handleDeposit}
              withdraw={handleWithdraw}
              getBalance={getBalance}
              getLoan={getLoan}
              getTotalPool={getTotalPool}
              refreshAllData={refreshAllData} // ADD THIS PROP
              transactionLoading={transactionLoading}
            />

            <LoanManagement
              requestLoan={requestLoan}
              approveLoan={approveLoan}
              repayLoan={repayLoan}
              getMembers={getMembers}
              account={account}
              isRegistered={isRegistered}
              transactionLoading={transactionLoading}
            />
          </>
        )}

        {!isConnected && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              CoopSaving DApp
            </h2>
            <p className="text-gray-600">
              Connect your wallet to start
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;