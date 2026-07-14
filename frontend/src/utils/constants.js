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
  DATA_STORAGE: "0x70C702D17a05605131162286BbC9f3A3B15b1F9A",
  PRICE_ORACLE: "0xa288d0fD563bE993356B5CC60a0A572aC26ea525",
  COLLATERAL_MANAGER: "0xb77375054B74b450F582F832aCa172362600b850",
  BORROW_ENGINE: "0x69490CA0E40B80168a6A9d444857dDeDd56D392a",
  LIQUIDATION_ENGINE: "0xeDD5426186a4EdA3F32b986b295f604cF72D0fA9",
  HEALTH_MONITOR: "0x694616605B63c515bC61a2d851329d276803C422",
  
  // Token Addresses (Sepolia)
  COLLATERAL_TOKEN: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  DEBT_TOKEN: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
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