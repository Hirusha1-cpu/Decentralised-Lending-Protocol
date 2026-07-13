// Protocol contract addresses — filled from environment variables after deployment
// See .env.example for the required keys
export const CONTRACT_ADDRESSES = {
  DATA_STORAGE: process.env.REACT_APP_DATA_STORAGE_ADDRESS || '',
  PRICE_ORACLE: process.env.REACT_APP_PRICE_ORACLE_ADDRESS || '',
  COLLATERAL_MANAGER: process.env.REACT_APP_COLLATERAL_MANAGER_ADDRESS || '',
  BORROW_ENGINE: process.env.REACT_APP_BORROW_ENGINE_ADDRESS || '',
  LIQUIDATION_ENGINE: process.env.REACT_APP_LIQUIDATION_ENGINE_ADDRESS || '',
  HEALTH_MONITOR: process.env.REACT_APP_HEALTH_MONITOR_ADDRESS || '',
  COLLATERAL_TOKEN: process.env.REACT_APP_COLLATERAL_TOKEN_ADDRESS || '', // WETH
  DEBT_TOKEN: process.env.REACT_APP_DEBT_TOKEN_ADDRESS || '', // USDC (mock, 18 decimals)
};

export const SUPPORTED_CHAINS = {
  31337: { name: 'Localhost', currency: 'ETH', explorer: '' },
  11155111: { name: 'Sepolia', currency: 'ETH', explorer: 'https://sepolia.etherscan.io' },
  421614: { name: 'Arbitrum Sepolia', currency: 'ETH', explorer: 'https://sepolia.arbiscan.io' },
  84532: { name: 'Base Sepolia', currency: 'ETH', explorer: 'https://sepolia.basescan.org' },
  42161: { name: 'Arbitrum One', currency: 'ETH', explorer: 'https://arbiscan.io' },
  8453: { name: 'Base', currency: 'ETH', explorer: 'https://basescan.org' },
};

// Mirrors the on-chain constants in DataStorage.sol / BorrowEngine.sol / LiquidationEngine.sol
export const PROTOCOL_PARAMS = {
  COLLATERAL_RATIO: 150, // 150%
  LIQUIDATION_PENALTY: 10, // 10%
  INTEREST_RATE: 5, // 5% APY
};

// Thresholds match HealthMonitor.sol's getRiskStatus (values are *1e18 fixed point on-chain)
export const RISK_THRESHOLDS = {
  SAFE: 1.5,
  WARNING: 1.2,
  DANGER: 1.0,
};

export const RISK_STATUS = {
  SAFE: 'Safe',
  WARNING: 'Warning',
  DANGER: 'Danger',
  LIQUIDATABLE: 'Liquidatable',
};

// All amounts (WETH collateral + mock USDC debt) use 18 decimals in this protocol
export const TOKEN_DECIMALS = 18;