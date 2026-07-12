// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DataStorage Contract
 * @dev Stores user data and protocol parameters on L2
 */
contract DataStorage is Ownable {
    // User data structure
    struct UserData {
        uint256 collateral;
        uint256 debt;
        uint256 collateralUSD;
        uint256 healthFactor;
        uint256 lastUpdate;
    }

    // Storage
    mapping(address => UserData) public userData;

    // Protocol parameters
    uint256 public collateralRatio = 150; // 150%
    uint256 public liquidationThreshold = 80; // 80%
    uint256 public liquidationPenalty = 10; // 10%
    uint256 public interestRate = 5; // 5% APY

    // Events
    event UserDataUpdated(address indexed user);
    event ProtocolParameterUpdated(string parameter, uint256 value);

    /**
     * @dev Set user data
     */
    function setUserData(address user, UserData memory data) external onlyOwner {
        userData[user] = data;
        emit UserDataUpdated(user);
    }

    /**
     * @dev Get user data
     */
    function getUserData(address user) public view returns (UserData memory) {
        return userData[user];
    }

    /**
     * @dev Get collateral
     */
    function getCollateral(address user) external view returns (uint256) {
        return userData[user].collateral;
    }

    /**
     * @dev Get debt
     */
    function getDebt(address user) external view returns (uint256) {
        return userData[user].debt;
    }

    /**
     * @dev Get health factor
     */
    function getHealthFactor(address user) external view returns (uint256) {
        return userData[user].healthFactor;
    }

    /**
     * @dev Set collateral ratio
     */
    function setCollateralRatio(uint256 ratio) external onlyOwner {
        require(ratio >= 100, "Ratio must be >= 100");
        collateralRatio = ratio;
        emit ProtocolParameterUpdated("collateralRatio", ratio);
    }

    /**
     * @dev Set liquidation threshold
     */
    function setLiquidationThreshold(uint256 threshold) external onlyOwner {
        require(threshold > 0, "Threshold must be > 0");
        liquidationThreshold = threshold;
        emit ProtocolParameterUpdated("liquidationThreshold", threshold);
    }

    /**
     * @dev Set liquidation penalty
     */
    function setLiquidationPenalty(uint256 penalty) external onlyOwner {
        require(penalty <= 20, "Penalty must be <= 20%");
        liquidationPenalty = penalty;
        emit ProtocolParameterUpdated("liquidationPenalty", penalty);
    }

     /**
     * @dev Set interest rate
     */
    function setInterestRate(uint256 rate) external onlyOwner {
        require(rate <= 20, "Rate must be <= 20%");
        interestRate = rate;
        emit ProtocolParameterUpdated("interestRate", rate);
    }

}