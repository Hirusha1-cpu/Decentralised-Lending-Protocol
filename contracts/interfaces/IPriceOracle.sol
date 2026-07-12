// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPriceOracle {
    function getLatestPrice() external view returns (uint256);
    function getPrice(address token) external view returns (uint256);
    function updatePriceFeed(address newPriceFeed) external;
}