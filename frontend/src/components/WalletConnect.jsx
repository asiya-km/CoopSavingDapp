import React from 'react';

const WalletConnect = ({ 
  connectWallet, 
  account, 
  isConnected, 
  loading, 
  network, 
  isSafeNetwork,
  switchToSepolia 
}) => {
  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = () => {
    if (!network) return 'Unknown';
    const networkNames = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      31337: 'Local Development',
      1337: 'Local Hardhat'
    };
    return networkNames[network.chainId] || `Chain ${network.chainId}`;
  };

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🏦</div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">CoopSaving DApp</h2>
            <p className="text-gray-600">Secure Cooperative Microfinance Platform</p>
          </div>
        </div>
        
        {!isConnected ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              disabled={loading}
              className="btn btn-blue"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Connect to Sepolia or Localhost
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center space-x-4">
              {!isSafeNetwork && (
                <div className="status-warning flex items-center">
                  <span>⚠️ Unknown Network</span>
                </div>
              )}
              {isSafeNetwork && (
                <div className="status-safe flex items-center">
                  <span>🛡️ {getNetworkName()}</span>
                </div>
              )}
              <div className="address-box">
                {truncateAddress(account)}
              </div>
            </div>
            {!isSafeNetwork && (
              <button
                onClick={switchToSepolia}
                className="link text-sm mt-1"
              >
                Switch to Sepolia
              </button>
            )}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="alert alert-info mt-4">
        <div className="flex items-start">
          <div className="text-lg mr-2">🛡️</div>
          <div>
            <p className="text-sm font-semibold">Security Notice</p>
            <p className="text-xs">
              This is a test DApp. Only use test networks (Sepolia) or local development. 
              Never connect to unknown networks or share your private keys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;