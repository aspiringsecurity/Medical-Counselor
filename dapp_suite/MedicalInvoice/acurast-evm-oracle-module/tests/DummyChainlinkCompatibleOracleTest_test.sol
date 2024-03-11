// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "hardhat/console.sol";
import "../contracts/DummyChainlinkCompatibleOracle.sol";

contract DummyChainlinkCompatibleOracleTest {

    DummyChainlinkCompatibleOracle dummyOracle;
    function beforeAll () public {
        dummyOracle = new DummyChainlinkCompatibleOracle();
    }

    function checkLatestRoundData () public {
        (, int256 answer, , uint256 lastUpdateTimestamp, ) = dummyOracle.latestRoundData();
        Assert.equal(answer, int256(0), "the latest data we set should be 0");
    }
}