const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LiquidationEngine", function () {
    let liquidationEngine;
    let dataStorage;
    let priceOracle;
    let weth;
    let usdc;
    let owner;
    let user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Deploy mock tokens
        const WETH = await ethers.getContractFactory("WETH9");
        weth = await WETH.deploy();
        await weth.deployed();

        const USDC = await ethers.getContractFactory("USDC");
        usdc = await USDC.deploy();
        await usdc.deployed();

        // Deploy DataStorage
        const DataStorage = await ethers.getContractFactory("DataStorage");
        dataStorage = await DataStorage.deploy();
        await dataStorage.deployed();

        // Deploy PriceOracle
        const PriceOracle = await ethers.getContractFactory("PriceOracle");
        priceOracle = await PriceOracle.deploy("0x0000000000000000000000000000000000000000");
        await priceOracle.deployed();

        // Deploy LiquidationEngine
        const LiquidationEngine = await ethers.getContractFactory("LiquidationEngine");
        liquidationEngine = await LiquidationEngine.deploy(
            weth.address,
            usdc.address,
            dataStorage.address,
            priceOracle.address
        );
        await liquidationEngine.deployed();
    });

    describe("isLiquidatable", function () {
        it("Should return false if no debt", async function () {
            const isLiquidatable = await liquidationEngine.isLiquidatable(user1.address);
            expect(isLiquidatable).to.equal(false);
        });
    });

    describe("getPenalty", function () {
        it("Should return 0 if no debt", async function () {
            const penalty = await liquidationEngine.getPenalty(user1.address);
            expect(penalty).to.equal(0);
        });
    });
});