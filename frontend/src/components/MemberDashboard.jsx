import React, { useState, useEffect } from 'react';

const MemberDashboard = ({ 
  account, 
  isRegistered,
  registerMember, 
  deposit, 
  withdraw, 
  getBalance, 
  getLoan, 
  getTotalPool,
  refreshAllData, // Keep this prop but use it carefully
  transactionLoading
}) => {
  const [balance, setBalance] = useState('0');
  const [loan, setLoan] = useState('0');
  const [totalPool, setTotalPool] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading dashboard data...');
      const [balanceData, loanData, poolData] = await Promise.all([
        getBalance(),
        getLoan(),
        getTotalPool()
      ]);
      setBalance(balanceData);
      setLoan(loanData);
      setTotalPool(poolData);
      console.log('📊 Data loaded:', { balance: balanceData, loan: loanData, pool: poolData });
    } catch (error) {
      console.error('Error loading data:', error);
      setStatusMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      console.log('👤 Account changed, loading data...');
      loadData();
    }
  }, [account, isRegistered]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    try {
      setLoading(true);
      setStatusMessage('Processing deposit...');
      await deposit(depositAmount);
      setDepositAmount('');
      setStatusMessage('✅ Deposit successful!');
      await loadData();
    } catch (error) {
      console.error('Deposit error:', error);
      setStatusMessage('❌ Deposit failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    try {
      setLoading(true);
      setStatusMessage('Processing withdrawal...');
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
      setStatusMessage('✅ Withdrawal successful!');
      await loadData();
    } catch (error) {
      console.error('Withdrawal error:', error);
      setStatusMessage('❌ Withdrawal failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setStatusMessage('Registering...');
      await registerMember();
      setStatusMessage('✅ Registration successful!');
      // The hook will automatically refresh due to dataVersion change
      await loadData();
    } catch (error) {
      console.error('Registration error:', error);
      setStatusMessage('❌ Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Safe refresh function - only call if refreshAllData exists
  const handleRefresh = () => {
    setStatusMessage('Refreshing data...');
    loadData();
    if (refreshAllData && typeof refreshAllData === 'function') {
      refreshAllData();
    }
    setStatusMessage('Data refreshed!');
  };

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-lg ${
          statusMessage.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' :
          statusMessage.includes('❌') ? 'bg-red-100 text-red-800 border border-red-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {statusMessage}
        </div>
      )}

      {/* Registration Status */}
      {!isRegistered && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold mb-2">📝 Registration Required</h3>
          <p className="text-sm mb-4">
            You need to register as a member to access all cooperative features including loans.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn btn-blue"
            >
              {loading ? 'Registering...' : 'Register as Member'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-gray"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

      {/* Member Status */}
      {isRegistered && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold mb-2">✅ Registered Member</h3>
          <p className="text-sm">
            You are a registered member and can access all cooperative features.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm">💰 My Balance</p>
              <p className="text-2xl font-bold text-gray-800">
                {parseFloat(balance).toFixed(4)} ETH
              </p>
            </div>
            {!isRegistered && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Not Registered</span>
            )}
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-gray-600 text-sm">📈 Loan Owed</p>
            <p className="text-2xl font-bold text-gray-800">
              {parseFloat(loan).toFixed(4)} ETH
            </p>
          </div>
        </div>

        <div className="card">
          <div>
            <p className="text-gray-600 text-sm">🏦 Total Pool</p>
            <p className="text-2xl font-bold text-gray-800">
              {parseFloat(totalPool).toFixed(4)} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {isRegistered ? '✅ Member Status' : '👥 Registration'}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {isRegistered 
              ? 'You are a registered member of the cooperative.'
              : 'Register to become a member and access all cooperative features including loans.'
            }
          </p>
          {!isRegistered && (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="btn btn-blue btn-full"
            >
              {loading ? 'Registering...' : 'Register as Member'}
            </button>
          )}
          {isRegistered && (
            <button
              onClick={handleRefresh}
              className="btn btn-gray btn-full"
            >
              Refresh Status
            </button>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">💵 Deposit Funds</h3>
          <p className="text-gray-600 text-sm mb-4">
            Add funds to your cooperative account.
          </p>
          <div className="space-y-3">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="input"
              step="0.001"
              min="0"
              disabled={loading}
            />
            <button
              onClick={handleDeposit}
              disabled={loading || !depositAmount}
              className="btn btn-green btn-full"
            >
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">💸 Withdraw Funds</h3>
          <p className="text-gray-600 text-sm mb-4">
            Withdraw funds from your cooperative account.
          </p>
          <div className="space-y-3">
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="input"
              step="0.001"
              min="0"
              disabled={loading}
            />
            <button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount}
              className="btn btn-orange btn-full"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;