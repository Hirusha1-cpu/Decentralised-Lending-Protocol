// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockPriceOracle {
    uint256 public mockPrice = 2000 * 1e18; // $2000

    function getLatestPrice() external view returns (uint256) {
        return mockPrice;
    }

    function getPrice(address) external view returns (uint256) {
        return mockPrice;
    }

    function updatePriceFeed(address) external {
        // Do nothing
    }

    function getPriceFeed() external view returns (address) {
        return address(this);
    }

    function setMockPrice(uint256 newPrice) external {
        mockPrice = newPrice;
    }
}