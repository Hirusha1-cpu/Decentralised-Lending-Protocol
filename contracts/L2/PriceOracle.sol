// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceOracle Contract
 * @dev Fetches real-time prices from Chainlink
 */
contract PriceOracle is Ownable {
    AggregatorV3Interface internal priceFeed;

    uint256 public constant DECIMALS = 1e18;
    uint256 public constant MAX_STALENESS = 1 hours;

    // Events
    event PriceUpdated(uint256 price);
    event PriceFeedUpdated(address newFeed);

     constructor(address _priceFeed) {
        require(_priceFeed != address(0), "Invalid price feed");
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    /**
     * @dev Get latest ETH/USD price
     */
    function getLatestPrice() public view returns (uint256) {
        (
            uint80 roundId,
            int price,
            uint256 startedAt,
            uint256 timestamp,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // Check for stale price
        require(block.timestamp - timestamp <= MAX_STALENESS, "Stale price");
        require(price > 0, "Invalid price");
        require(answeredInRound >= roundId, "Stale round");

        // Convert to 18 decimals
        uint8 decimals = priceFeed.decimals();
        return uint256(price) * (10 ** (18 - decimals));
    }

     /**
     * @dev Get price for specific token (if multiple tokens supported)
     */
    function getPrice(address token) external view returns (uint256) {
        // In production: map tokens to different price feeds
        // For now, return ETH price
        return getLatestPrice();
    }

    /**
     * @dev Update price feed address
     */
    function updatePriceFeed(address newPriceFeed) external onlyOwner {
        require(newPriceFeed != address(0), "Invalid price feed");
        priceFeed = AggregatorV3Interface(newPriceFeed);
        emit PriceFeedUpdated(newPriceFeed);
    }
    
    /**
     * @dev Get price feed address
     */
    function getPriceFeed() external view returns (address) {
        return address(priceFeed);
    }


}