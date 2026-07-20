// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DataStorage.sol";
import "./PriceOracle.sol";

/**
 * @title BorrowEngine Contract
 * @dev Handles borrowing and repaying
 */
// ReentrancyGuard - reentrant protection mechanism.
contract BorrowEngine is ReentrancyGuard, Ownable {
    IERC20 public debtToken;
    DataStorage public dataStorage;
    PriceOracle public priceOracle;

    uint256 public constant COLLATERAL_RATIO = 150; // 150%
    uint256 public constant INTEREST_RATE = 5; // 5% APY,

    // Events
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event InterestAccrued(address indexed user, uint256 interest);

    constructor(address _debtToken, address _dataStorage, address _priceOracle) {
        require(_debtToken != address(0), "Invalid debt token");
        require(_dataStorage != address(0), "Invalid data storage");
        require(_priceOracle != address(0), "Invalid price oracle");
        
        debtToken = IERC20(_debtToken);
        dataStorage = DataStorage(_dataStorage);
        priceOracle = PriceOracle(_priceOracle);
    }

    /**
     * @dev User borrows tokens
     */
    // borrow process
    function borrow(uint256 amount) external nonReentrant {
        // check the amount is more than 0.
        require(amount > 0, "Amount must be > 0");

        // get the userdata, and check whether collateral amount more than 0
        DataStorage.UserData memory userData = dataStorage.getUserData(msg.sender);
        require(userData.collateral > 0, "No collateral");

        // Calculate max borrow
        uint256 maxBorrow = getMaxBorrow(msg.sender);
        require(amount <= maxBorrow, "Amount exceeds max borrow");

        // Calculate new health factor
        // when borrow, then debt will increase
        uint256 newDebt = userData.debt + amount;
        uint256 price = priceOracle.getLatestPrice();
        uint256 collateralUSD = userData.collateralUSD;

        // uint256 healthFactor = (collateralUSD * 100) / (newDebt * COLLATERAL_RATIO);
        uint256 healthFactor = (collateralUSD * 1e18 * 100) / (newDebt * COLLATERAL_RATIO);
        require(healthFactor >= 1e18, "Position would be unsafe");

        // Update user data
        userData.debt = newDebt;
        userData.lastUpdate = block.timestamp;

        // Calculate interest
        uint256 interest = calculateInterest(msg.sender);
        if (interest > 0) {
            userData.debt += interest;
            emit InterestAccrued(msg.sender, interest);
        }
        // set the data 
        dataStorage.setUserData(msg.sender, userData);

        // Transfer tokens to user
        debtToken.transfer(msg.sender, amount);

        // Update health factor
        _updateHealthFactor(msg.sender);

        emit Borrowed(msg.sender, amount);
    }

    /**
     * @dev User repays debt
     */
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        DataStorage.UserData memory userData = dataStorage.getUserData(msg.sender);
        require(userData.debt > 0, "No debt");

        uint256 repayAmount = amount;
        if (repayAmount > userData.debt) {
            // set the debt amount as repay amount, if the amount more than repay amount
            repayAmount = userData.debt;
        }
        // Transfer tokens from user to contract
        debtToken.transferFrom(msg.sender, address(this), repayAmount);

        // Update user data, reduce the debt
        userData.debt -= repayAmount;
        userData.lastUpdate = block.timestamp;

        dataStorage.setUserData(msg.sender, userData);
        
        // Update health factor
        _updateHealthFactor(msg.sender);
        
        emit Repaid(msg.sender, repayAmount);
    }

    /**
     * @dev Get max borrow amount
     */
    function getMaxBorrow(address user) public view returns (uint256) {
        // get the userdata from datastorage
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.collateralUSD == 0) return 0;
        // get the max borrow
        uint256 maxBorrow = (userData.collateralUSD * 100) / COLLATERAL_RATIO;
        
        // Calculate interest
        uint256 interest = calculateInterest(user);
        // check the interest and debt
        if (interest > 0 && userData.debt > 0) {
            // reduce the interest and assign to max borrow
            maxBorrow -= interest;
        }
        
        return maxBorrow;
    }

      /**
     * @dev Calculate interest for user
     */
    function calculateInterest(address user) public view returns (uint256) {
        DataStorage.UserData memory userData = dataStorage.getUserData(user);
        if (userData.debt == 0) return 0;
        // timeElapsed
        uint256 timeElapsed = block.timestamp - userData.lastUpdate;
        uint256 interest = (userData.debt * INTEREST_RATE * timeElapsed) / (365 days * 100);
        
        return interest;
    }
    
    /**
     * @dev Update health factor
     */
    function _updateHealthFactor(address user) internal {
    DataStorage.UserData memory userData = dataStorage.getUserData(user);
    uint256 healthFactor = 0;
    
    if (userData.debt > 0) {
        healthFactor = (userData.collateralUSD * 1e18 * 100) / (userData.debt * 150);
    } else {
        // ✅ Fix: No debt = infinite health (type(uint256).max)
        healthFactor = type(uint256).max;
    }
    
    userData.healthFactor = healthFactor;
    dataStorage.setUserData(user, userData);
} 


}