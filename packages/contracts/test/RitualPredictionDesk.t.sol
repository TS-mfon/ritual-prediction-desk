// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/RitualPredictionDesk.sol";

interface Vm {
    function roll(uint256) external;
}

contract MinimalTest {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function assertEq(string memory a, string memory b) internal pure {
        require(keccak256(bytes(a)) == keccak256(bytes(b)), "string mismatch");
    }

    function assertEq(uint64 a, uint64 b) internal pure {
        require(a == b, "uint64 mismatch");
    }

    function assertEq(bytes32 a, bytes32 b) internal pure {
        require(a == b, "bytes32 mismatch");
    }

    function assertTrue(bool condition) internal pure {
        require(condition, "expected true");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "expected false");
    }
}

contract RitualPredictionDeskTest is MinimalTest {
    RitualPredictionDesk internal desk;
    bytes32 internal constant TOPIC_ID = keccak256("macro-cpi");

    function setUp() public {
        desk = new RitualPredictionDesk(100 ether, true);
        desk.registerTopic(TOPIC_ID, "Macro releases", "https://api.example.com/releases", true);
    }

    function testRegisterTopicStoresMetadata() public view {
        (string memory label, string memory sourceUrl, bool delegatedSecret, bool exists) = desk.topics(TOPIC_ID);
        assertEq(label, "Macro releases");
        assertEq(sourceUrl, "https://api.example.com/releases");
        assertTrue(delegatedSecret);
        assertTrue(exists);
    }

    function testRecordScheduledCheckpointStoresResearchDigest() public {
        desk.recordScheduledCheckpoint(0, TOPIC_ID);
        (bytes32 topicId, bytes32 bodyDigest, uint64 createdBlock, string memory sourceUrl) = desk.latestResearch(TOPIC_ID);
        assertEq(topicId, TOPIC_ID);
        assertTrue(bodyDigest != bytes32(0));
        assertEq(createdBlock, uint64(block.number));
        assertEq(sourceUrl, "https://api.example.com/releases");
    }

    function testPublishApproveAndExecuteRecommendation() public {
        desk.recordScheduledCheckpoint(0, TOPIC_ID);
        (, bytes32 researchDigest,,) = desk.latestResearch(TOPIC_ID);

        uint256 recommendationId = desk.publishRecommendation(
            TOPIC_ID,
            keccak256("draft"),
            "Open a CPI surprise market",
            "TEE-backed macro research suggests a volatility spike.",
            7200,
            40 ether,
            500,
            researchDigest
        );

        (bool approvedBefore, bool expiredBefore, bool executedBefore, bool liveBefore) = desk.recommendationState(recommendationId);
        assertFalse(approvedBefore);
        assertFalse(expiredBefore);
        assertFalse(executedBefore);
        assertTrue(liveBefore);

        desk.approveRecommendation(recommendationId);
        desk.executeRecommendation(recommendationId, "ritual:market/1");

        (bool approvedAfter, bool expiredAfter, bool executedAfter, bool liveAfter) = desk.recommendationState(recommendationId);
        assertTrue(approvedAfter);
        assertFalse(expiredAfter);
        assertTrue(executedAfter);
        assertFalse(liveAfter);
    }

    function testExpireRecommendationAfterExpiry() public {
        desk.recordScheduledCheckpoint(0, TOPIC_ID);
        (, bytes32 researchDigest,,) = desk.latestResearch(TOPIC_ID);

        uint256 recommendationId = desk.publishRecommendation(
            TOPIC_ID,
            keccak256("draft"),
            "Seed governance market",
            "Forum consensus points to a yes vote.",
            6500,
            20 ether,
            1,
            researchDigest
        );

        vm.roll(block.number + 10);
        desk.expireRecommendation(recommendationId);
        (, bool expired,, bool live) = desk.recommendationState(recommendationId);
        assertTrue(expired);
        assertFalse(live);
    }
}
