// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Groth16Verifier.sol";
import "../src/QuantumSpectra.sol";

contract Deploy is Script {
    function run() external {
        // Loads PRIVATE_KEY from your .env
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer    = vm.addr(deployerKey);

        console.log("Deploying from:", deployer);

        vm.startBroadcast(deployerKey);

        // 1. Deploy verifier first — no constructor args
        Groth16Verifier verifier = new Groth16Verifier();
        console.log("Groth16Verifier:", address(verifier));

        // 2. Deploy QuantumSpectra, passing verifier address
        QuantumSpectra qs = new QuantumSpectra(address(verifier));
        console.log("QuantumSpectra: ", address(qs));

        vm.stopBroadcast();
    }
}
