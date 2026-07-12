// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Rollup Contract
 * @dev L1 contract that verifies and finalizes L2 batches
 */

// this contract is use for verifying and finalizing L2 batches
contract Rollup is Ownable, ReentrancyGuard {
    // State Variables
    bytes32 public currentStateRoot;
    // Mapping to store batch information
    mapping(uint256 => bytes32) public batchStateRoots;
    // Mapping to store batch submission timestamps
    mapping(uint256 => uint256) public batchSubmissionTime;
    // Mapping to store batch finalization status
    mapping(uint256 => bool) public batchFinalized;

    // Constants
    uint256 public constant CHALLENGE_PERIOD = 7 days;
    uint256 public nextBatchId = 1;

    // Events
    // event for batch submission, finalization, challenge, and rejection
    event BatchSubmitted(uint256 indexed batchId, bytes32 stateRoot);
    event BatchFinalized(uint256 indexed batchId, bytes32 stateRoot);
    event BatchChallenged(uint256 indexed batchId, address challenger);
    event BatchRejected(uint256 indexed batchId);

    // Structs
    struct Batch {
        uint256 id;
        bytes32 stateRoot;
        uint256 submissionTime;
        bool isFinalized;
        bool isChallenged;
    }
    
    mapping(uint256 => Batch) public batches;

    /**
     * @dev Submit L2 batch for verification
     */ 
    function submitBatch(uint256 batchId, bytes32 stateRoot,bytes calldata proof) external onlyOwner nonReentrant {

        require(batchId == nextBatchId, "Invalid batch ID");
        require(stateRoot != bytes32(0), "Invalid state root");
        require(!batches[batchId].isFinalized, "Already finalized");       

        // Store batch
        batches[batchId] = Batch({
            id: batchId,
            stateRoot: stateRoot,
            submissionTime: block.timestamp,
            isFinalized: false,
            isChallenged: false
        });

        // set the state for the batches
        batchStateRoots[batchId] = stateRoot;
        // set the timestamp for the batches
        batchSubmissionTime[batchId] = block.timestamp;

        // Verify proof (simplified)
        require(_verifyProof(proof, stateRoot), "Invalid proof");

        nextBatchId++;
        emit BatchSubmitted(batchId, stateRoot);
    }

    /**
     * @dev Finalize batch after challenge period
     */

    function finalizeBatch(uint256 batchId) external nonReentrant {
        require(batches[batchId].submissionTime != 0, "Batch does not exist");
        require(!batches[batchId].isFinalized, "Already finalized");
        require(!batches[batchId].isChallenged, "Batch is challenged");
        require(
            block.timestamp >= batches[batchId].submissionTime + CHALLENGE_PERIOD,
            "Challenge period not over"
        );

        batches[batchId].isFinalized = true;
        batchFinalized[batchId] = true;
        currentStateRoot = batches[batchId].stateRoot;
        
        emit BatchFinalized(batchId, batches[batchId].stateRoot);
    }

    /**
     * @dev Challenge a batch (Optimistic Rollup)
     */
    function challengeBatch(uint256 batchId) external nonReentrant {
        require(batches[batchId].submissionTime != 0, "Batch does not exist");
        require(!batches[batchId].isFinalized, "Already finalized");
        require(!batches[batchId].isChallenged, "Already challenged");
        // Ensure the challenge is within the challenge period
        require(
            block.timestamp < batches[batchId].submissionTime + CHALLENGE_PERIOD,
            "Challenge period expired"
        );
        // In production, this would require submitting a fraud proof
        batches[batchId].isChallenged = true;
        emit BatchChallenged(batchId, msg.sender);

    }    

    /**
     * @dev Reject a challenged batch (after verification)
     */
    function rejectBatch(uint256 batchId) external onlyOwner nonReentrant {
        require(batches[batchId].isChallenged, "Batch not challenged");
        require(!batches[batchId].isFinalized, "Already finalized");
        
        batches[batchId].isFinalized = true;
        batchFinalized[batchId] = true;
        // State root not updated - batch rejected
        
        emit BatchRejected(batchId);
    }

    /**
     * @dev Verify proof (simplified - production uses cryptographic proofs)
     */
    function _verifyProof(bytes calldata proof, bytes32 stateRoot) internal pure returns (bool) {
        // In production: verify cryptographic proof
        // For Optimistic: fraud proof
        // For ZK: validity proof
        return true;
    }

     /**
     * @dev Get batch status
     */
    function getBatchStatus(uint256 batchId) external view returns (bool isFinalized, bool isChallenged) {
        return (batches[batchId].isFinalized, batches[batchId].isChallenged);
    }


}
