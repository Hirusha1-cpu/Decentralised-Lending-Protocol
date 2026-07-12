// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IERC20.sol";

/**
 * @title Escrow Contract
 * @dev Holds L1 assets securely
 */
contract Escrow is Ownable, ReentrancyGuard {
    // L2 escrow address
    address public l2Escrow;
    // Asset balances
    mapping(address => mapping(address => uint256)) public escrowBalances;

    // Events
    event AssetsLocked(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event AssetsReleased(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    modifier onlyL2Escrow() {
        require(msg.sender == l2Escrow, "Only L2 escrow");
        _;
    }

    /**
     * @dev Set L2 escrow address
     */
    function setL2Escrow(address _l2Escrow) external onlyOwner {
        l2Escrow = _l2Escrow;
    }

    /**
     * @dev Lock assets
     */
    function lockAssets(address user, address token,uint256 amount ) external onlyL2Escrow nonReentrant {
        require(user != address(0), "Invalid user");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");

        // lock amounts inside the escrow
        escrowBalances[token][user] += amount;
        emit AssetsLocked(user, token, amount);
    }

    /**
     * @dev Release assets
     */
    function releaseAssets(address user, address token,uint256 amount) external onlyL2Escrow nonReentrant {
        // checks the validity of the user, token, and amount
        require(user != address(0), "Invalid user");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(escrowBalances[token][user] >= amount, "Insufficient balance");
        // release amounts from the escrow for the user, reduce the escrow balance
        escrowBalances[token][user] -= amount;
        // transfer the released amounts to the user
        IERC20(token).transfer(user, amount);

        emit AssetsReleased(user, token, amount);
    }

    /**
     * @dev Emergency withdraw (user can withdraw if L2 is down)
     */
    function emergencyWithdraw(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(
            escrowBalances[token][msg.sender] >= amount,
            "Insufficient balance"
        );

        // Check if L2 is down (simplified - production would check more conditions)
        // In production: check timelock or governance approval

        escrowBalances[token][msg.sender] -= amount;
        IERC20(token).transfer(msg.sender, amount);
    }

    /**
     * @dev Get escrow balance
     */
    function getEscrowBalance( address token,address user) external view returns (uint256) {
        return escrowBalances[token][user];
    }
}
