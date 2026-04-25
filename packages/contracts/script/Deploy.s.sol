// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../src/RitualPredictionDesk.sol";

interface Vm {
    function envUint(string calldata key) external returns (uint256);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract DeployRitualPredictionDesk {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (RitualPredictionDesk deployed) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        deployed = new RitualPredictionDesk(125 ether, true);
        vm.stopBroadcast();
    }
}
