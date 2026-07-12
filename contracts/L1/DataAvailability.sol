// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DataAvailability Contract
 * @dev Stores L2 batch data and state roots on L1
 */

contract DataAvailability is Ownable {
    // L2 sequencer address
    address public sequencer;

    // Batch data storage
    mapping(uint256 => bytes) public batchData;
    mapping(uint256 => bytes32) public batchStateRoots;
    mapping(uint256 => uint256) public batchTimestamps;
    mapping(uint256 => bool) public batchVerified;

    uint256 public nextBatchId = 1;

    // Events
    event BatchDataStored(uint256 indexed batchId, bytes32 stateRoot);
    event BatchVerified(uint256 indexed batchId);
    event SequencerUpdated(address newSequencer);

    modifier onlySequencer() {
        require(msg.sender == sequencer, "Only sequencer");
        _;
    }

    /**
     * @dev Set sequencer address
     */
    function setSequencer(address _sequencer) external onlyOwner {
        sequencer = _sequencer;
        emit SequencerUpdated(_sequencer);
    }

    /**
     * @dev Store batch data
     */
    function storeBatchData(bytes calldata data, bytes32 stateRoot) external onlySequencer {
        //store data in next batch id
        uint256 batchId = nextBatchId;
        // assign data into batchData
        batchData[batchId] = data;
        // assign state root
        batchStateRoots[batchId] = stateRoot;
        // assign timestamp
        batchTimestamps[batchId] = block.timestamp;
        nextBatchId++;
        emit BatchDataStored(batchId, stateRoot);
    }

    /**
     * @dev Verify batch
     */
    function verifyBatch(uint256 batchId) external onlyOwner {
        require(batchData[batchId].length > 0, "Batch does not exist");
        require(!batchVerified[batchId], "Already verified");
        
        batchVerified[batchId] = true;
        emit BatchVerified(batchId);
    }

     /**
     * @dev Get batch data
     */
    function getBatchData(uint256 batchId) external view returns (bytes memory, bytes32, uint256, bool) {
        return (batchData[batchId], batchStateRoots[batchId], batchTimestamps[batchId], batchVerified[batchId]);
    }

    /**
     * @dev Get batch count
     */
    function getBatchCount() external view returns (uint256) {
        return nextBatchId - 1;
    }
}