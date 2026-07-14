// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataStorage.sol";
import "./PriceOracle.sol";

/**
 * @title CollateralManager Contract
 * @dev Manages user collateral deposits and withdrawals
 */
contract CollateralManager is ReentrancyGuard, Ownable {
    // Collateral token (e.g., USDC)
    IERC20 public collateralToken;
    DataStorage public dataStorage;
    PriceOracle public priceOracle;

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event HealthFactorUpdated(address indexed user, uint256 healthFactor);
    

    constructor(
        address _collateralToken,
        address _dataStorage,
        address _priceOracle
    ) {
        require(_collateralToken != address(0), "Invalid collateral token");
        require(_dataStorage != address(0), "Invalid data storage");
        require(_priceOracle != address(0), "Invalid price oracle");

        // get the collateral token, data storage, and price oracle addresses
        collateralToken = IERC20(_collateralToken);
        // get the data storage and price oracle address
        dataStorage = DataStorage(_dataStorage);
        priceOracle = PriceOracle(_priceOracle);
    }
    

    /**
     * @dev User deposits collateral
     */
    function depositCollateral(uint256 amount) external nonReentrant {
        // amount should more than 0
        require(amount > 0, "Amount must be > 0");

        // transfer tokens from user to contract
        collateralToken.transferFrom(msg.sender, address(this), amount);

        // Get user data
        DataStorage.UserData memory userData = dataStorage.getUserData(
            msg.sender
        );

        // Update collateral
        userData.collateral += amount;

        // Calculate collateral value in USD
        uint256 price = priceOracle.getLatestPrice();
        // assign collatralUSD of userdata to the value of collateral in USD
        userData.collateralUSD = (userData.collateral * price) / 1e18;

        // Update last update time
        userData.lastUpdate = block.timestamp;

        // Save user data
        dataStorage.setUserData(msg.sender, userData);

        // Update health factor
        _updateHealthFactor(msg.sender);

        emit CollateralDeposited(msg.sender, amount);
    }

    /**
     * @dev User withdraws collateral
     */
    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        // get user data
        DataStorage.UserData memory userData = dataStorage.getUserData(
            msg.sender
        );
        require(userData.collateral >= amount, "Insufficient collateral");

        // Check if user has debt
        if (userData.debt > 0) {
            // Calculate new health factor after withdrawal
            // get the value after get the amount
            uint256 newCollateral = userData.collateral - amount;
            // check the latest usd price of chainlink
            uint256 price = priceOracle.getLatestPrice();
            // get the usd price of collataral
            uint256 newCollateralUSD = (newCollateral * price) / 1e18;
            // check the health factor if there is existing debt, if still healthy, then can be withdraw
            uint256 healthFactor = (newCollateralUSD * 1e18 * 100) /
                (userData.debt * 150);
            require(healthFactor >= 1e18, "Position would be liquidatable");
        }

        // Update user data
        // reduce the collataral amount from userData
        userData.collateral -= amount;
        // get the latest USD price from chainlink
        uint256 price = priceOracle.getLatestPrice();
        // get the usd amount of collateral
        userData.collateralUSD = (userData.collateral * price) / 1e18;
        userData.lastUpdate = block.timestamp;

        dataStorage.setUserData(msg.sender, userData);
        // Transfer tokens back to user
        collateralToken.transfer(msg.sender, amount);

        // Update health factor
        _updateHealthFactor(msg.sender);

        emit CollateralWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Get user's collateral value in USD
     */
    function getCollateralValueUSD(
        address user
    ) external view returns (uint256) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        return userData.collateralUSD;
    }

    /**
     * @dev Update health factor
     */
    function _updateHealthFactor(address user) internal {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        uint256 healthFactor = 0;

        if (userData.debt > 0) {
            healthFactor =
                (userData.collateralUSD * 100) /
                (userData.debt * 150);
            // Cap at 1e18 for safety
            if (healthFactor > 1e18) {
                healthFactor = 1e18;
            }
        } else {
            // ✅ No debt = infinite health
            healthFactor = type(uint256).max;
        }

        userData.healthFactor = healthFactor;
        dataStorage.setUserData(user, userData);

        emit HealthFactorUpdated(user, healthFactor);
    }

    function updateHealthFactor(address user) external {
        _updateHealthFactor(user);
    }
}
