// Protocol contract addresses — filled from environment variables after deployment
// See .env.example for the required keys
// export const CONTRACT_ADDRESSES = {
//   DATA_STORAGE: process.env.REACT_APP_DATA_STORAGE_ADDRESS || '',
//   PRICE_ORACLE: process.env.REACT_APP_PRICE_ORACLE_ADDRESS || '',
//   COLLATERAL_MANAGER: process.env.REACT_APP_COLLATERAL_MANAGER_ADDRESS || '',
//   BORROW_ENGINE: process.env.REACT_APP_BORROW_ENGINE_ADDRESS || '',
//   LIQUIDATION_ENGINE: process.env.REACT_APP_LIQUIDATION_ENGINE_ADDRESS || '',
//   HEALTH_MONITOR: process.env.REACT_APP_HEALTH_MONITOR_ADDRESS || '',
//   COLLATERAL_TOKEN: process.env.REACT_APP_COLLATERAL_TOKEN_ADDRESS || '', // WETH
//   DEBT_TOKEN: process.env.REACT_APP_DEBT_TOKEN_ADDRESS || '', // USDC (mock, 18 decimals)
// };
// export const CONTRACT_ADDRESSES = {
//   DATA_STORAGE: "0x1BDCD3F0a69488B70974153873B6ef6B628c588e",
//   PRICE_ORACLE: "0xF3f559F95F7BA49b16A9f70c2037b8C56c9b506d",
//   COLLATERAL_MANAGER: "0x8D0AFe8E6c07CE23064b92057178C875e8CC2a89",
//   BORROW_ENGINE: "0x695B9BF6046a4B6d02b40F0cA135f673fd6784B8",
//   LIQUIDATION_ENGINE: "0xf0f9411DC8B5cFC3DfD3A035842b916425f3e204",
//   HEALTH_MONITOR: "0x8C0B4E660eF8E682D7E743f7de2ABcBaAe23ef99",
//   COLLATERAL_TOKEN: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Sepolia WETH
//   DEBT_TOKEN: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8", // Sepolia Mock USDC
// };
export const CONTRACT_ADDRESSES = {
  // ✅ UPDATED ADDRESSES - Sepolia
  DATA_STORAGE: "0x3f9D193070249A78a6A0558294AF9302CD366c4C",
  PRICE_ORACLE: "0xb8EfDddE70B71824114e30c8682BbC0fBD8C173F",
  COLLATERAL_MANAGER: "0x69c961c437EDD25FD487138f95F6050062C66A3E",
  BORROW_ENGINE: "0x02d09e014388A4B1cc39127EB4C7BCD47B68786c",
  LIQUIDATION_ENGINE: "0xF65aC9881A731c724ab56FE80F9B5b48DD5329e7",
  HEALTH_MONITOR: "0x2f562f5F0bc98fFa55192ba00F466e5058233C57",
  
  // Token Addresses (Sepolia)
  COLLATERAL_TOKEN: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  DEBT_TOKEN: "0xDdE1B8e6AFBf97563B428920042B948262fc7913",
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