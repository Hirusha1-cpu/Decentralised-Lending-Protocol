// Contract ABIs — trimmed to the functions/events the frontend actually calls.
// Regenerate from build artifacts with scripts/extract-abis.js if the contracts change.

export const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export const DATA_STORAGE_ABI = [
  'function getUserData(address user) view returns (tuple(uint256 collateral, uint256 debt, uint256 collateralUSD, uint256 healthFactor, uint256 lastUpdate))',
  'function getCollateral(address user) view returns (uint256)',
  'function getDebt(address user) view returns (uint256)',
  'function getHealthFactor(address user) view returns (uint256)',
  'function collateralRatio() view returns (uint256)',
  'function liquidationThreshold() view returns (uint256)',
  'function liquidationPenalty() view returns (uint256)',
  'function interestRate() view returns (uint256)',
];

export const PRICE_ORACLE_ABI = [
  'function getLatestPrice() view returns (uint256)',
  'function getPrice(address token) view returns (uint256)',
];

export const COLLATERAL_MANAGER_ABI = [
  'function depositCollateral(uint256 amount)',
  'function withdrawCollateral(uint256 amount)',
  'function getCollateralValueUSD(address user) view returns (uint256)',
  'event CollateralDeposited(address indexed user, uint256 amount)',
  'event CollateralWithdrawn(address indexed user, uint256 amount)',
];

export const BORROW_ENGINE_ABI = [
  'function borrow(uint256 amount)',
  'function repay(uint256 amount)',
  'function getMaxBorrow(address user) view returns (uint256)',
  'function calculateInterest(address user) view returns (uint256)',
  'event Borrowed(address indexed user, uint256 amount)',
  'event Repaid(address indexed user, uint256 amount)',
];

export const LIQUIDATION_ENGINE_ABI = [
  'function liquidate(address user)',
  'function isLiquidatable(address user) view returns (bool)',
  'function getPenalty(address user) view returns (uint256)',
  'function getCollateralToReceive(address user) view returns (uint256)',
  'event Liquidated(address indexed user, address indexed liquidator, uint256 debtPaid, uint256 collateralReceived)',
];

export const HEALTH_MONITOR_ABI = [
  'function getHealthFactor(address user) view returns (uint256)',
  'function getUserData(address user) view returns (tuple(uint256 collateral, uint256 debt, uint256 collateralUSD, uint256 healthFactor, uint256 lastUpdate))',
  'function getRiskStatusString(address user) view returns (string)',
  'function isSafe(address user) view returns (bool)',
  'function needsAttention(address user) view returns (bool)',
  'function getLiquidationThresholdUSD(address user) view returns (uint256)',
];

const ABIS = {
  ERC20: ERC20_ABI,
  DataStorage: DATA_STORAGE_ABI,
  PriceOracle: PRICE_ORACLE_ABI,
  CollateralManager: COLLATERAL_MANAGER_ABI,
  BorrowEngine: BORROW_ENGINE_ABI,
  LiquidationEngine: LIQUIDATION_ENGINE_ABI,
  HealthMonitor: HEALTH_MONITOR_ABI,
};

export default ABIS;