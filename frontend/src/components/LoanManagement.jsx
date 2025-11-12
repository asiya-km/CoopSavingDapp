import React, { useState, useEffect } from 'react';

const LoanManagement = ({ 
  requestLoan, 
  approveLoan, 
  repayLoan, 
  getMembers,
  account,
  isRegistered,
  transactionLoading
}) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [repayLoanId, setRepayLoanId] = useState('');
  const [approveLoanId, setApproveLoanId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account && isRegistered) {
      loadMembers();
    }
  }, [account, isRegistered]);

  const loadMembers = async () => {
    try {
      const membersList = await getMembers();
      setMembers(membersList);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleRequestLoan = async () => {
    if (!loanAmount || !interestRate) return;
    
    try {
      setLoading(true);
      const loanId = await requestLoan(loanAmount, interestRate);
      setLoanAmount('');
      setInterestRate('');
      alert(`Loan requested successfully! Loan ID: ${loanId}`);
      await loadMembers();
    } catch (error) {
      console.error('Loan request error:', error);
      alert('Loan request failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async () => {
    if (!approveLoanId) return;
    
    try {
      setLoading(true);
      await approveLoan(approveLoanId);
      setApproveLoanId('');
      alert('Loan approved successfully!');
      await loadMembers();
    } catch (error) {
      console.error('Loan approval error:', error);
      alert('Loan approval failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayLoan = async () => {
    if (!repayAmount || !repayLoanId) return;
    
    try {
      setLoading(true);
      await repayLoan(repayLoanId, repayAmount);
      setRepayAmount('');
      setRepayLoanId('');
      alert('Loan repayment successful!');
      await loadMembers();
    } catch (error) {
      console.error('Loan repayment error:', error);
      alert('Loan repayment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Loan */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            💰 Request Loan
          </h3>
          <div className="space-y-3">
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="Loan Amount (ETH)"
              className="input"
              step="0.001"
              min="0"
              disabled={!isRegistered || loading}
            />
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Interest Rate (%)"
              className="input"
              step="1"
              min="0"
              max="50"
              disabled={!isRegistered || loading}
            />
            <button
              onClick={handleRequestLoan}
              disabled={!isRegistered || loading || !loanAmount || !interestRate}
              className="btn btn-purple btn-full"
            >
              {loading ? 'Processing...' : 'Request Loan'}
            </button>
          </div>
          {!isRegistered && (
            <p className="text-xs text-orange-600 mt-2">
              Register first to request loans
            </p>
          )}
        </div>

        {/* Approve Loan */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            ✅ Approve Loan
          </h3>
          <div className="space-y-3">
            <input
              type="number"
              value={approveLoanId}
              onChange={(e) => setApproveLoanId(e.target.value)}
              placeholder="Loan ID to Approve"
              className="input"
              min="1"
              disabled={!isRegistered || loading}
            />
            <button
              onClick={handleApproveLoan}
              disabled={!isRegistered || loading || !approveLoanId}
              className="btn btn-green btn-full"
            >
              {loading ? 'Processing...' : 'Approve Loan'}
            </button>
          </div>
          {!isRegistered && (
            <p className="text-xs text-orange-600 mt-2">
              Register first to approve loans
            </p>
          )}
        </div>

        {/* Repay Loan */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            ⏰ Repay Loan
          </h3>
          <div className="space-y-3">
            <input
              type="number"
              value={repayLoanId}
              onChange={(e) => setRepayLoanId(e.target.value)}
              placeholder="Loan ID"
              className="input"
              min="1"
              disabled={!isRegistered || loading}
            />
            <input
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              placeholder="Repayment Amount (ETH)"
              className="input"
              step="0.001"
              min="0"
              disabled={!isRegistered || loading}
            />
            <button
              onClick={handleRepayLoan}
              disabled={!isRegistered || loading || !repayAmount || !repayLoanId}
              className="btn btn-blue btn-full"
            >
              {loading ? 'Processing...' : 'Repay Loan'}
            </button>
          </div>
          {!isRegistered && (
            <p className="text-xs text-orange-600 mt-2">
              Register first to repay loans
            </p>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          👥 Cooperative Members ({members.length})
        </h3>
        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No members registered yet.</p>
        ) : (
          <div className="member-grid">
            {members.map((member, index) => (
              <div 
                key={index} 
                className={member.toLowerCase() === account.toLowerCase() ? 'member-card member-card-you' : 'member-card'}
              >
                <p className="member-address">
                  {member}
                </p>
                {member.toLowerCase() === account.toLowerCase() && (
                  <span className="you-badge">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanManagement;