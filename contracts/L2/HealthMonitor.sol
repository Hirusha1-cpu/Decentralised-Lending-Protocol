// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DataStorage.sol";
import "./PriceOracle.sol";

/**
 * @title HealthMonitor Contract
 * @dev Monitors user positions and calculates health factors
 */
contract HealthMonitor {
    DataStorage public dataStorage;
    PriceOracle public priceOracle;
    
    uint256 public constant COLLATERAL_RATIO = 150; // 150%
    
    // Health status enums
    enum RiskStatus { Safe, Warning, Danger, Liquidatable }
    
    constructor(address _dataStorage, address _priceOracle) {
        require(_dataStorage != address(0), "Invalid data storage");
        require(_priceOracle != address(0), "Invalid price oracle");
        
        dataStorage = DataStorage(_dataStorage);
        priceOracle = PriceOracle(_priceOracle);
    }
    
    /**
     * @dev Get user's health factor
     */
    function getHealthFactor(address user) public view returns (uint256) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.debt == 0) {
            return type(uint256).max; // No debt = infinite health
        }
        
        uint256 price = priceOracle.getLatestPrice();
        uint256 collateralUSD = (userData.collateral * price) / 1e18;
        
        return (collateralUSD * 100) / (userData.debt * COLLATERAL_RATIO);
    }
    
    /**
     * @dev Get user data
     */
    function getUserData(address user) public view returns (DataStorage.UserData memory) {
        return dataStorage.getUserData(user);
    }
    
    /**
     * @dev Get user's risk status
     */
    function getRiskStatus(address user) public view returns (RiskStatus) {
        uint256 hf = getHealthFactor(user);
        
        if (hf >= 15e17) { // >= 1.5
            return RiskStatus.Safe;
        } else if (hf >= 12e17) { // >= 1.2
            return RiskStatus.Warning;
        } else if (hf >= 1e18) { // >= 1.0
            return RiskStatus.Danger;
        } else {
            return RiskStatus.Liquidatable;
        }
    }
    
    /**
     * @dev Get risk status as string
     */
    function getRiskStatusString(address user) public view returns (string memory) {
        RiskStatus status = getRiskStatus(user);
        
        if (status == RiskStatus.Safe) {
            return "Safe";
        } else if (status == RiskStatus.Warning) {
            return "Warning";
        } else if (status == RiskStatus.Danger) {
            return "Danger";
        } else {
            return "Liquidatable";
        }
    }
    
    /**
     * @dev Check if position is safe
     */
    function isSafe(address user) public view returns (bool) {
        return getHealthFactor(user) >= 15e17;
    }
    
    /**
     * @dev Check if position needs attention
     */
    function needsAttention(address user) public view returns (bool) {
        uint256 hf = getHealthFactor(user);
        return hf < 15e17 && hf >= 1e18;
    }
    
    /**
     * @dev Get liquidation threshold in USD
     */
    function getLiquidationThresholdUSD(address user) public view returns (uint256) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.debt == 0) return 0;
        
        // Threshold = debt * 150 / 100 (when HF = 1.0)
        return (userData.debt * COLLATERAL_RATIO) / 100;
    }
}