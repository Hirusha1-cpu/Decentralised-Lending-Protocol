# Decentralised Lending Protocol

A full-stack decentralized lending protocol built on Ethereum (Sepolia testnet), inspired by Aave/Compound-style collateralized lending. Users can deposit WETH as collateral, borrow USDC against it, repay debt, and liquidate unhealthy positions.

🔗 **Live App:** [https://decentralised-lending-protocol.vercel.app/](https://decentralised-lending-protocol.vercel.app/)

---

## ✨ Features

- **Deposit Collateral** — Deposit WETH to back your borrowing power
- **Borrow** — Borrow USDC against deposited collateral (up to 150% collateral ratio)
- **Repay** — Repay outstanding USDC debt to improve your health factor
- **Liquidate** — Liquidate unhealthy positions (health factor < 1.0) and earn a 10% penalty bonus
- **Health Factor Monitoring** — Real-time on-chain health factor and risk status (Safe / Warning / Danger / Liquidatable)
- **Live Price Feeds** — ETH/USD pricing via Chainlink oracles
- **Wallet Integration** — Connect via MetaMask / any injected Web3 wallet

---

## 🏗️ Architecture

The protocol is split across L1 and L2 contract sets (bridging scaffolding included for future rollup support), with the core lending logic currently deployed and active on **Sepolia**.

```
contracts/
├── L2/
│   ├── DataStorage.sol         # Central storage for user positions & protocol params
│   ├── PriceOracle.sol         # Chainlink ETH/USD price feed wrapper
│   ├── CollateralManager.sol   # Deposit / withdraw collateral
│   ├── BorrowEngine.sol        # Borrow / repay debt
│   ├── LiquidationEngine.sol   # Liquidate unhealthy positions
│   └── HealthMonitor.sol       # Read-only health factor / risk status views
├── L1/
│   ├── Rollup.sol               # Batch submission & finalization (optimistic rollup scaffold)
│   ├── DataAvailability.sol     # L2 batch data storage on L1
│   ├── Bridge.sol               # L1 ↔ L2 asset bridging
│   └── Escrow.sol               # L1 asset custody
├── interfaces/                  # IERC20, IPriceOracle, IKeepers
└── mocks/                       # Mock USDC, WETH9, PriceOracle for local testing
```

### Core Protocol Parameters

| Parameter              | Value |
|-------------------------|-------|
| Collateral Ratio         | 150%  |
| Liquidation Threshold    | 80%   |
| Liquidation Penalty      | 10%   |
| Interest Rate            | 5% APY |

### Access Control

`DataStorage` uses an **authorized-caller pattern** (rather than a single `Ownable` owner) so that `CollateralManager`, `BorrowEngine`, and `LiquidationEngine` can all write user position data:

```solidity
mapping(address => bool) public authorizedCallers;
function setAuthorizedCaller(address caller, bool status) external onlyOwner;
```

---

## 🌐 Deployed Contracts (Sepolia)

| Contract            | Address |
|----------------------|---------|
| DataStorage           | `0x3f9D193070249A78a6A0558294AF9302CD366c4C` |
| PriceOracle            | `0xb8EfDddE70B71824114e30c8682BbC0fBD8C173F` |
| CollateralManager      | `0x69c961c437EDD25FD487138f95F6050062C66A3E` |
| BorrowEngine           | `0x02d09e014388A4B1cc39127EB4C7BCD47B68786c` |
| LiquidationEngine      | `0xF65aC9881A731c724ab56FE80F9B5b48DD5329e7` |
| HealthMonitor          | `0x2f562f5F0bc98fFa55192ba00F466e5058233C57` |
| Collateral Token (WETH)| `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9` |
| Debt Token (Mock USDC) | `0xDdE1B8e6AFBf97563B428920042B948262fc7913` |

> View any of these on [Sepolia Etherscan](https://sepolia.etherscan.io).

---

## 🖥️ Tech Stack

**Smart Contracts**
- Solidity `^0.8.19`
- Hardhat
- OpenZeppelin Contracts (Ownable, ReentrancyGuard, ERC20)
- Chainlink Price Feeds

**Frontend**
- React 19
- ethers.js v6
- web3modal (wallet connection)

**Deployment**
- Vercel (frontend)
- Sepolia testnet (contracts)

---

## 📦 Project Structure

```
├── contracts/          # Solidity smart contracts (L1 + L2)
├── frontend/            # React frontend application
│   └── src/
│       ├── components/  # Dashboard, Deposit, Borrow, Repay, Liquidate, HealthFactor
│       ├── hooks/        # useWeb3, useContract, usePosition
│       └── utils/        # ABIs, constants, helpers
├── scripts/              # Deployment & configuration scripts
├── test/unit/            # Hardhat unit tests
└── hardhat.config.js
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js
- MetaMask (or another injected wallet)
- Sepolia testnet ETH ([faucet](https://sepoliafaucet.com/))

### 1. Clone & Install

```bash
git clone https://github.com/Hirusha1-cpu/Decentralised-Lending-Protocol.git
cd Decentralised-Lending-Protocol
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_URL=your_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

This will:
- Deploy all core contracts
- Deploy a mock USDC token (for testnet liquidity, since real Sepolia USDC isn't controllable)
- Authorize `CollateralManager`, `BorrowEngine`, and `LiquidationEngine` to write to `DataStorage`
- Fund `BorrowEngine` with mock USDC liquidity so users can borrow

### 5. Update Frontend Contract Addresses

Copy the deployed addresses from the console output into `frontend/src/utils/constants.js`.

### 6. Run the Frontend

```bash
cd frontend
npm start
```

Visit `http://localhost:3000`.

---

## 🧪 Running Tests

```bash
npx hardhat test
```

Unit tests cover `BorrowEngine`, `LiquidationEngine`, and `CollateralManager` core logic.

---

## 📖 How It Works

1. **Deposit** — User deposits WETH into `CollateralManager`, which records the position in `DataStorage` and calculates the USD value via `PriceOracle`.
2. **Borrow** — User borrows USDC (up to 150% collateral ratio) via `BorrowEngine`, which checks the resulting health factor before approving.
3. **Health Factor** — Continuously derived from `collateralUSD` vs. `debt`. A health factor below `1.0` marks a position as liquidatable.
4. **Liquidate** — Anyone can call `LiquidationEngine.liquidate(user)` on an unhealthy position, repaying the debt (+10% penalty) in exchange for a discounted claim on the borrower's collateral.

---

## ⚠️ Disclaimer

This project is deployed on **Sepolia testnet** for educational/demonstration purposes only. It uses a custom mock USDC token (not real USDC) for borrow liquidity. **Do not use this protocol with real funds or on mainnet without a full security audit.**

---

## 📄 License

MIT