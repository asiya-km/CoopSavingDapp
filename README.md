
# CoopSaving dApp 🏦

A decentralized cooperative saving and lending platform built on Ethereum that enables community members to pool funds, save collectively, and access loans through peer approval.

## 🌟 Features

- **👥 Member Registration** – Join the cooperative saving pool
- **💰 Deposit/Withdraw** – Manage your savings in the pool  
- **📊 Loan Management** – Request and approve loans collectively
- **🤝 Community Governance** – Peer-to-peer loan approvals
- **🔒 Secure & Transparent** – All transactions on blockchain

## 🛠 Tech Stack

### Smart Contracts
- **Solidity (v0.8.28)** – Smart contract development
- **Hardhat** – Development framework & testing
- **Ethereum Sepolia** – Test network deployment

### Frontend
- **React 18** – Modern UI framework
- **Vite** – Fast build tool & dev server
- **Ethers.js** – Blockchain interactions
- **Tailwind CSS** – Styling & responsive design

### Deployment
- **Vercel** – Frontend hosting
- **GitHub** – Version control & CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/coopsaving-dapp.git
cd coopsaving-dapp
````

2. **Install dependencies**

```bash
npm install
cd frontend
npm install
```

3. **Set up environment variables**

```bash
# Create .env file in root
cp .env.example .env
```

Add your configuration:

```env
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

4. **Deploy smart contracts**

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

5. **Run frontend locally**

```bash
cd frontend
npm run dev
```

## 📁 Project Structure

```
coopsaving-dapp/
├── contracts/           # Smart contracts
│   └── CoopSaving.sol
├── scripts/             # Deployment scripts
│   └── deploy.js
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks
│   │   ├── artifacts/   # Contract ABIs
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── vite.config.js
├── hardhat.config.js    # Hardhat configuration
└── package.json
```

## 🔧 Smart Contract Functions

### Core Functions

* `registerMember()` – Join the cooperative
* `deposit()` – Add funds to savings pool
* `withdraw()` – Withdraw from savings
* `requestLoan()` – Request a loan
* `approveLoan()` – Approve another member's loan
* `repayLoan()` – Repay active loan

### View Functions

* `getBalance()` – Check member balance
* `getLoan()` – Get loan details
* `getMembers()` – List all members
* `getTotalPool()` – Total funds in pool

## 🌐 Deployment

### Smart Contracts

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend

The frontend automatically deploys to Vercel when pushing to the `main` branch.

## 🧪 Testing

### Run tests

```bash
npx hardhat test
```

### Test on Sepolia

1. Get test ETH from [Sepolia Faucet](https://faucet.quicknode.com/ethereum/sepolia)
2. Connect MetaMask to Sepolia network
3. Test all functions with test ETH

## 🔗 Links

* **Live Demo**: [https://coopsaving-dapp.vercel.app](https://coopsaving-dapp.vercel.app)
* **Contract Address**: `0x...` (Update after deployment)


---

