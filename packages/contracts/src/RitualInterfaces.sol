// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRitualWallet {
    function deposit(uint256 lockDuration) external payable;
    function depositFor(address user, uint256 lockDuration) external payable;
    function withdraw(uint256 amount) external;
    function balanceOf(address user) external view returns (uint256);
    function lockUntil(address user) external view returns (uint256);
}

interface IScheduler {
    function schedule(
        bytes memory data,
        uint32 gas,
        uint32 startBlock,
        uint32 numCalls,
        uint32 frequency,
        uint32 ttl,
        uint256 maxFeePerGas,
        uint256 maxPriorityFeePerGas,
        uint256 value,
        address payer
    ) external returns (uint256 callId);

    function cancel(uint256 callId) external;
}

interface ISecretsAccessControl {
    function grantAccess(
        address delegate,
        bytes32 secretsHash,
        uint64 expiresAt,
        bytes calldata policy
    ) external;
}

library RitualAddresses {
    address internal constant HTTP_PRECOMPILE = 0x0000000000000000000000000000000000000801;
    address internal constant LLM_PRECOMPILE = 0x0000000000000000000000000000000000000802;
    address internal constant RITUAL_WALLET = 0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948;
    address internal constant SCHEDULER = 0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B;
    address internal constant SECRETS_ACL = 0xf9BF1BC8A3e79B9EBeD0fa2Db70D0513fecE32FD;
}
