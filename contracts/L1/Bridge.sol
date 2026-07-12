// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IERC20.sol";

/**
 * @title Bridge Contract
 * @dev Handles L1 ↔ L2 asset transfers
 */

contract Bridge is Ownable, ReentrancyGuard {
    // L2 bridge address
    address public l2Bridge;

    // Token balances locked on L1
    mapping(address => mapping(address => uint256)) public lockedTokens;

    // Events
    event TokensLocked(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event TokensUnlocked(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event BridgeMessageRelayed(address indexed from, bytes message);

    modifier onlyL2Bridge() {
        require(msg.sender == l2Bridge, "Only L2 bridge");
        _;
    }

    /**
     * @dev Set L2 bridge address
     */
    function setL2Bridge(address _l2Bridge) external onlyOwner {
        l2Bridge = _l2Bridge;
    }

    /**
     * @dev Deposit tokens from L1 to L2
     */
    function depositToL2(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");

        // Transfer tokens from user to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Lock tokens
        lockedTokens[token][msg.sender] += amount;

        // Send message to L2
        bytes memory message = abi.encode("Deposit", msg.sender, token, amount);
        _sendMessage(message);

        emit TokensLocked(msg.sender, token, amount);
    }

    /**
     * @dev Withdraw tokens from L2 to L1
     */
    function withdrawFromL1(
        address token,
        address user,
        uint256 amount
    ) external onlyL2Bridge nonReentrant {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");
        require(
            lockedTokens[token][user] >= amount,
            "Insufficient locked balance"
        );

        // Unlock tokens
        lockedTokens[token][user] -= amount;

        // Transfer tokens to user
        IERC20(token).transfer(user, amount);

        emit TokensUnlocked(user, token, amount);
    }

    /**
     * @dev Send message to L2 bridge
     */
    function _sendMessage(bytes memory message) internal {
        // In production: send message to L2 via rollup
        emit BridgeMessageRelayed(msg.sender, message);
    }

    /**
     * @dev Receive message from L2 bridge
     */
    function receiveMessage(bytes memory message) external onlyL2Bridge {
        // In production: decode and execute message
        // Example: Withdraw tokens
        ( string memory action,address user, address token,uint256 amount) = abi.decode(message, (string, address, address, uint256));

        if (keccak256(bytes(action)) == keccak256(bytes("Withdraw"))) {
            withdrawFromL1(token, user, amount);
        }
    }

    /**
     * @dev Get locked balance
     */
    function getLockedBalance( address token, address user) external view returns (uint256) {
        return lockedTokens[token][user];
    }
}
