// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataStorage.sol";
import "./PriceOracle.sol";

/**
 * @title LiquidationEngine Contract
 * @dev Handles liquidations of unhealthy positions
 */
contract LiquidationEngine is ReentrancyGuard, Ownable {
    IERC20 public collateralToken;
    IERC20 public debtToken;
    DataStorage public dataStorage;
    PriceOracle public priceOracle;

    uint256 public constant COLLATERAL_RATIO = 150; // 150%
    uint256 public constant LIQUIDATION_PENALTY = 10; // 10%

    // Events
    event Liquidated(address indexed user, address indexed liquidator, uint256 debtPaid, uint256 collateralReceived);

     constructor(
        address _collateralToken,
        address _debtToken,
        address _dataStorage,
        address _priceOracle
    ) {
        require(_collateralToken != address(0), "Invalid collateral token");
        require(_debtToken != address(0), "Invalid debt token");
        require(_dataStorage != address(0), "Invalid data storage");
        require(_priceOracle != address(0), "Invalid price oracle");
        
        collateralToken = IERC20(_collateralToken);
        debtToken = IERC20(_debtToken);
        dataStorage = DataStorage(_dataStorage);
        priceOracle = PriceOracle(_priceOracle);
    }
    
    /**
     * @dev Liquidate unhealthy position
     */
    function liquidate(address user) external nonReentrant {
        require(user != address(0), "Invalid user");
        require(isLiquidatable(user), "Position is not liquidatable");
        
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        require(userData.debt > 0, "No debt");

        // Calculate debt + penalty
        uint256 penalty = (userData.debt * LIQUIDATION_PENALTY) / 100;
        // total repay calculated
        uint256 totalRepay = userData.debt + penalty;

        // Transfer debt tokens from liquidator
        debtToken.transferFrom(msg.sender, address(this), totalRepay);

        // Calculate collateral to give
        uint256 price = priceOracle.getLatestPrice();
        // Calculate collateral 
        uint256 collateralToGive = (totalRepay * 1e18) / price;

        // Ensure we don't give more than they have
        if (collateralToGive > userData.collateral) {
            collateralToGive = userData.collateral;
        }

        // Update user data
        userData.collateral -= collateralToGive;
        userData.debt = 0;
        userData.lastUpdate = block.timestamp;
        // set data for this user
        dataStorage.setUserData(user, userData);

        // Transfer collateral to liquidator
        collateralToken.transfer(msg.sender, collateralToGive);
        
        emit Liquidated(user, msg.sender, totalRepay, collateralToGive);
    }

     /**
     * @dev Check if position is liquidatable
     */
    function isLiquidatable(address user) public view returns (bool) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.debt == 0) return false;
        
        uint256 price = priceOracle.getLatestPrice();
        uint256 collateralUSD = (userData.collateral * price) / 1e18;
        
        uint256 healthFactor = (collateralUSD * 1e18 * 100) / (userData.debt * COLLATERAL_RATIO);
        return healthFactor < 1e18;
    }

    /**
     * @dev Get liquidation penalty for user
     */
    function getPenalty(address user) public view returns (uint256) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.debt == 0) return 0;
        return (userData.debt * LIQUIDATION_PENALTY) / 100;
    }
    
    /**
     * @dev Get collateral to receive on liquidation
     */
    function getCollateralToReceive(address user) public view returns (uint256) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.debt == 0) return 0;
        
        uint256 penalty = (userData.debt * LIQUIDATION_PENALTY) / 100;
        uint256 totalRepay = userData.debt + penalty;
        uint256 price = priceOracle.getLatestPrice();
        uint256 collateralToGive = (totalRepay * 1e18) / price;
        
        if (collateralToGive > userData.collateral) {
            collateralToGive = userData.collateral;
        }
        
        return collateralToGive;
    }

}