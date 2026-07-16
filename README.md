# Decentralised Lending Protocol

A decentralized lending protocol built on Ethereum, where users can deposit WETH as collateral, borrow USDC against it, repay their debt, and liquidate unhealthy positions — all on-chain.

🔗 **Live App:** [https://decentralised-lending-protocol.vercel.app/](https://decentralised-lending-protocol.vercel.app/)

---

## About

This is a full-stack DeFi lending protocol I built to understand how collateralized lending platforms like Aave and Compound work under the hood. It covers the full lending lifecycle — depositing collateral, borrowing against it, tracking health factor in real time, repaying debt, and liquidating risky positions.

Currently deployed and live on the **Sepolia testnet**.

----

## Features

- **Deposit Collateral** — Deposit WETH to unlock borrowing power
- **Borrow** — Borrow USDC against your deposited collateral (150% collateral ratio)
- **Repay** — Pay back debt to improve your health factor
- **Liquidate** — Liquidate positions that fall below a safe health factor and earn a liquidation bonus
- **Health Factor Tracking** — Live on-chain health factor with Safe / Warning / Danger / Liquidatable status
- **Live Price Feeds** — ETH/USD pricing pulled from Chainlink oracles
- **Wallet Connect** — Connect with MetaMask or any injected Web3 wallet

---

## How It Works

1. **Deposit** — Deposit WETH into the `CollateralManager` contract, which records your position and calculates its USD value using the price oracle.
2. **Borrow** — Borrow USDC through the `BorrowEngine`, capped at 150% collateral ratio. The contract checks your resulting health factor before approving the loan.
3. **Health Factor** — Calculated from your collateral value vs. your debt. A health factor below `1.0` means your position can be liquidated.
4. **Liquidate** — Anyone can liquidate an unhealthy position by repaying its debt, receiving a discounted claim on that position's collateral plus a 10% bonus.

---

## Smart Contract Architecture

```
contracts/
├── L2/
│   ├── DataStorage.sol         # Stores user positions & protocol parameters
│   ├── PriceOracle.sol         # Chainlink ETH/USD price feed wrapper
│   ├── CollateralManager.sol   # Handles deposits & withdrawals
│   ├── BorrowEngine.sol        # Handles borrowing & repayments
│   ├── LiquidationEngine.sol   # Handles liquidations
│   └── HealthMonitor.sol       # Read-only health factor & risk views
├── L1/
│   ├── Rollup.sol               # Batch submission & finalization
│   ├── DataAvailability.sol     # L2 batch data storage on L1
│   ├── Bridge.sol               # L1 ↔ L2 asset bridging
│   └── Escrow.sol               # L1 asset custody
├── interfaces/                  # IERC20, IPriceOracle, IKeepers
└── mocks/                       # Mock tokens & oracle for testing
```

### Protocol Parameters

| Parameter              | Value |
|--------------------------|-------|
| Collateral Ratio          | 150%  |
| Liquidation Threshold     | 80%   |
| Liquidation Penalty       | 10%   |
| Interest Rate             | 5% APY |

You can browse the deployed smart contracts directly on Etherscan:
🔗 [View on Sepolia Etherscan](https://sepolia.etherscan.io)

---

## Tech Stack

**Smart Contracts**
- Solidity `^0.8.19`
- Hardhat
- OpenZeppelin Contracts
- Chainlink Price Feeds

**Frontend**
- React 19
- ethers.js v6
- web3modal

**Deployment**
- Vercel (frontend)
- Sepolia testnet (contracts)

---

## Project Structure

```
├── contracts/          # Solidity smart contracts (L1 + L2)
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # Dashboard, Deposit, Borrow, Repay, Liquidate, HealthFactor
│       ├── hooks/        # useWeb3, useContract, usePosition
│       └── utils/        # ABIs, constants, helpers
├── scripts/              # Deployment scripts
├── test/unit/            # Hardhat unit tests
└── hardhat.config.js
```

---

## Running Locally

### Prerequisites
- Node.js
- MetaMask (or another injected wallet)
- Sepolia testnet ETH ([faucet](https://sepoliafaucet.com/))

### Setup

```bash
git clone https://github.com/Hirusha1-cpu/Decentralised-Lending-Protocol.git
cd Decentralised-Lending-Protocol
npm install
cd frontend && npm install && cd ..
```

Set up your own `.env` file in the project root with your RPC URL and wallet key (see `hardhat.config.js` for required variables).

### Compile & Deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

Update the deployed contract addresses in `frontend/src/utils/constants.js` after deploying.

### Run the Frontend

```bash
cd frontend
npm start
```

Then open `http://localhost:3000`.

---

## Tests

```bash
npx hardhat test
```

Covers core logic for `BorrowEngine`, `LiquidationEngine`, and `CollateralManager`.

---

## Disclaimer

This project is deployed on **Sepolia testnet** for learning and demonstration purposes only. It's not audited and shouldn't be used with real funds or deployed to mainnet as-is.

---

## License

MIT