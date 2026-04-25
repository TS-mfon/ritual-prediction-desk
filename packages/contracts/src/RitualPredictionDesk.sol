// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRitualWallet, IScheduler, ISecretsAccessControl, RitualAddresses} from "./RitualInterfaces.sol";

contract RitualPredictionDesk {
    struct Topic {
        string label;
        string sourceUrl;
        bool delegatedSecret;
        bool exists;
    }

    struct PolicyVault {
        uint96 maxNotional;
        bool requireApproval;
        bool active;
    }

    struct ResearchDigest {
        bytes32 topicId;
        bytes32 bodyDigest;
        uint64 createdBlock;
        string sourceUrl;
    }

    struct Recommendation {
        bytes32 topicId;
        bytes32 draftDigest;
        bytes32 researchDigest;
        string marketTitle;
        string rationale;
        uint16 confidenceBps;
        uint96 maxNotional;
        uint64 createdBlock;
        uint64 expiryBlock;
        bool approved;
        bool expired;
        bool executed;
    }

    address public immutable owner;
    PolicyVault public policyVault;
    uint256 public nextRecommendationId = 1;

    mapping(bytes32 => Topic) public topics;
    mapping(bytes32 => uint256) public topicSchedules;
    mapping(bytes32 => ResearchDigest) public latestResearch;
    mapping(uint256 => Recommendation) public recommendations;
    mapping(bytes32 => bytes32) public topicSecretDigests;

    event TopicRegistered(bytes32 indexed topicId, string label, string sourceUrl, bool delegatedSecret);
    event TopicScheduleUpdated(bytes32 indexed topicId, uint256 indexed callId);
    event ResearchRecorded(bytes32 indexed topicId, bytes32 indexed researchDigest, string sourceUrl);
    event RecommendationPublished(
        uint256 indexed recommendationId,
        bytes32 indexed topicId,
        bytes32 indexed draftDigest,
        uint16 confidenceBps,
        uint96 maxNotional
    );
    event RecommendationApproved(uint256 indexed recommendationId);
    event RecommendationExpired(uint256 indexed recommendationId);
    event RecommendationExecuted(uint256 indexed recommendationId, string settlementRef);
    event WalletFunded(address indexed funder, uint256 value, uint256 lockDuration);
    event SecretDelegated(bytes32 indexed topicId, bytes32 indexed secretsHash, address indexed delegate, uint64 expiresAt);

    error NotOwner();
    error TopicMissing();
    error RecommendationMissing();
    error ApprovalRequired();
    error RecommendationInactive();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(uint96 maxNotional, bool requireApproval) {
        owner = msg.sender;
        policyVault = PolicyVault({
            maxNotional: maxNotional,
            requireApproval: requireApproval,
            active: true
        });
    }

    function registerTopic(bytes32 topicId, string calldata label, string calldata sourceUrl, bool delegatedSecret)
        external
        onlyOwner
    {
        topics[topicId] = Topic({
            label: label,
            sourceUrl: sourceUrl,
            delegatedSecret: delegatedSecret,
            exists: true
        });
        emit TopicRegistered(topicId, label, sourceUrl, delegatedSecret);
    }

    function fundPolicyWallet(uint256 lockDuration) external payable onlyOwner {
        IRitualWallet(RitualAddresses.RITUAL_WALLET).deposit{value: msg.value}(lockDuration);
        emit WalletFunded(msg.sender, msg.value, lockDuration);
    }

    function scheduleTopicResearch(
        bytes32 topicId,
        uint32 startBlock,
        uint32 numCalls,
        uint32 frequency,
        uint32 ttl,
        uint32 gasLimit,
        uint256 maxFeePerGas,
        uint256 maxPriorityFeePerGas
    ) external onlyOwner returns (uint256 callId) {
        if (!topics[topicId].exists) revert TopicMissing();

        bytes memory payload = abi.encodeWithSelector(
            this.recordScheduledCheckpoint.selector,
            uint256(0),
            topicId
        );

        callId = IScheduler(RitualAddresses.SCHEDULER).schedule(
            payload,
            gasLimit,
            startBlock,
            numCalls,
            frequency,
            ttl,
            maxFeePerGas,
            maxPriorityFeePerGas,
            0,
            address(this)
        );

        topicSchedules[topicId] = callId;
        emit TopicScheduleUpdated(topicId, callId);
    }

    function recordScheduledCheckpoint(uint256, bytes32 topicId) external {
        if (!topics[topicId].exists) revert TopicMissing();

        bytes32 researchDigest = keccak256(
            abi.encodePacked(topicId, topics[topicId].sourceUrl, block.number)
        );

        latestResearch[topicId] = ResearchDigest({
            topicId: topicId,
            bodyDigest: researchDigest,
            createdBlock: uint64(block.number),
            sourceUrl: topics[topicId].sourceUrl
        });

        emit ResearchRecorded(topicId, researchDigest, topics[topicId].sourceUrl);
    }

    function publishRecommendation(
        bytes32 topicId,
        bytes32 draftDigest,
        string calldata marketTitle,
        string calldata rationale,
        uint16 confidenceBps,
        uint96 maxNotional,
        uint64 expiryBlocks,
        bytes32 researchDigest
    ) external onlyOwner returns (uint256 recommendationId) {
        if (!topics[topicId].exists) revert TopicMissing();
        if (maxNotional > policyVault.maxNotional) revert ApprovalRequired();

        recommendationId = nextRecommendationId++;

        recommendations[recommendationId] = Recommendation({
            topicId: topicId,
            draftDigest: draftDigest,
            researchDigest: researchDigest,
            marketTitle: marketTitle,
            rationale: rationale,
            confidenceBps: confidenceBps,
            maxNotional: maxNotional,
            createdBlock: uint64(block.number),
            expiryBlock: uint64(block.number + expiryBlocks),
            approved: !policyVault.requireApproval,
            expired: false,
            executed: false
        });

        emit RecommendationPublished(
            recommendationId,
            topicId,
            draftDigest,
            confidenceBps,
            maxNotional
        );
    }

    function approveRecommendation(uint256 recommendationId) external onlyOwner {
        Recommendation storage recommendation = recommendations[recommendationId];
        if (recommendation.createdBlock == 0) revert RecommendationMissing();
        if (_isExpired(recommendation)) revert RecommendationInactive();

        recommendation.approved = true;
        emit RecommendationApproved(recommendationId);
    }

    function expireRecommendation(uint256 recommendationId) external {
        Recommendation storage recommendation = recommendations[recommendationId];
        if (recommendation.createdBlock == 0) revert RecommendationMissing();
        if (!_isExpired(recommendation)) revert RecommendationInactive();

        recommendation.expired = true;
        emit RecommendationExpired(recommendationId);
    }

    function executeRecommendation(uint256 recommendationId, string calldata settlementRef) external onlyOwner {
        Recommendation storage recommendation = recommendations[recommendationId];
        if (recommendation.createdBlock == 0) revert RecommendationMissing();
        if (policyVault.requireApproval && !recommendation.approved) revert ApprovalRequired();
        if (_isExpired(recommendation)) revert RecommendationInactive();

        recommendation.executed = true;
        emit RecommendationExecuted(recommendationId, settlementRef);
    }

    function delegateTopicSecret(bytes32 topicId, bytes32 secretsHash, address delegate, uint64 expiresAt, bytes calldata policy)
        external
        onlyOwner
    {
        if (!topics[topicId].exists) revert TopicMissing();
        topicSecretDigests[topicId] = secretsHash;
        ISecretsAccessControl(RitualAddresses.SECRETS_ACL).grantAccess(delegate, secretsHash, expiresAt, policy);
        emit SecretDelegated(topicId, secretsHash, delegate, expiresAt);
    }

    function recommendationState(uint256 recommendationId)
        external
        view
        returns (bool approved, bool expired, bool executed, bool live)
    {
        Recommendation memory recommendation = recommendations[recommendationId];
        if (recommendation.createdBlock == 0) revert RecommendationMissing();
        expired = _isExpired(recommendation) || recommendation.expired;
        approved = recommendation.approved;
        executed = recommendation.executed;
        live = !expired && !executed;
    }

    function _isExpired(Recommendation memory recommendation) internal view returns (bool) {
        return block.number > recommendation.expiryBlock;
    }
}
