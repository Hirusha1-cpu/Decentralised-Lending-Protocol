// ============================================
// CONTRACT ADDRESSES (Sepolia Deployment)
// ============================================
export const CONTRACT_ADDRESSES = {
    DataStorage: "0x1BDCD3F0a69488B70974153873B6ef6B628c588e",
    PriceOracle: "0xF3f559F95F7BA49b16A9f70c2037b8C56c9b506d",
    CollateralManager: "0x8D0AFe8E6c07CE23064b92057178C875e8CC2a89",
    BorrowEngine: "0x695B9BF6046a4B6d02b40F0cA135f673fd6784B8",
    LiquidationEngine: "0xf0f9411DC8B5cFC3DfD3A035842b916425f3e204",
    HealthMonitor: "0x8C0B4E660eF8E682D7E743f7de2ABcBaAe23ef99"
};

// ============================================
// TOKEN ADDRESSES (Sepolia)
// ============================================
export const TOKEN_ADDRESSES = {
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"
};

// ============================================
// NETWORK CONFIG
// ============================================
export const NETWORK = {
    chainId: 11155111,
    name: "sepolia",
    rpcUrl: "https://rpc.sepolia.org",
    explorer: "https://sepolia.etherscan.io"
};

// ============================================
// MINIMAL ABIs (for frontend)
// ============================================
export const CONTRACT_ABIS = {
    DataStorage: [
        'function getUserData(address) view returns (uint256 collateral, uint256 debt, uint256 collateralUSD, uint256 healthFactor, uint256 lastUpdate)'
    ],
    CollateralManager: [
        'function depositCollateral(uint256 amount)',
        'function withdrawCollateral(uint256 amount)',
        'function getCollateralValueUSD(address) view returns (uint256)'
    ],
    BorrowEngine: [
        'function borrow(uint256 amount)',
        'function repay(uint256 amount)',
        'function getMaxBorrow(address) view returns (uint256)',
        'function calculateInterest(address) view returns (uint256)'
    ],
    LiquidationEngine: [
        'function liquidate(address user)',
        'function isLiquidatable(address) view returns (bool)',
        'function getPenalty(address) view returns (uint256)',
        'function getCollateralToReceive(address) view returns (uint256)'
    ],
    HealthMonitor: [
        'function getHealthFactor(address) view returns (uint256)',
        'function getRiskStatusString(address) view returns (string)',
        'function isSafe(address) view returns (bool)'
    ],
    PriceOracle: [
        'function getLatestPrice() view returns (uint256)'
    ]
};

// ============================================
// ERC20 ABI
// ============================================
export const ERC20_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)'
];