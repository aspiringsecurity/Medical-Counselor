/* eslint-disable no-undef */
// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DummyChainlinkCompatibleOracle", function () {
  it("test initial value", async function () {
    const DummyChainlinkCompatibleOracle = await ethers.getContractFactory("DummyChainlinkCompatibleOracle");
    const dummyOracle = await DummyChainlinkCompatibleOracle.deploy();
    await dummyOracle.deployed();
    console.log("dummy oracle deployed at:" + dummyOracle.address);
    expect((await dummyOracle.latestAnswer()).toNumber()).to.equal(0);
  });

  it("test setting value", async function () {
    const DummyChainlinkCompatibleOracle = await ethers.getContractFactory("DummyChainlinkCompatibleOracle");
    const dummyOracle = await DummyChainlinkCompatibleOracle.deploy();
    await dummyOracle.deployed();
    console.log("dummy oracle deployed at:" + dummyOracle.address);
    await dummyOracle.setPrice(1337)
    expect((await dummyOracle.latestAnswer()).toNumber()).to.equal(1337);
  });
});
