const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BorrowEngine", function () {
    let borrowEngine;
    let dataStorage;
    let priceOracle;
    let usdc;
    let owner;
    let user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Deploy mock USDC
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

        // Deploy BorrowEngine
        const BorrowEngine = await ethers.getContractFactory("BorrowEngine");
        borrowEngine = await BorrowEngine.deploy(
            usdc.address,
            dataStorage.address,
            priceOracle.address
        );
        await borrowEngine.deployed();
    });

    describe("getMaxBorrow", function () {
        it("Should return 0 if no collateral", async function () {
            const maxBorrow = await borrowEngine.getMaxBorrow(user1.address);
            expect(maxBorrow).to.equal(0);
        });
    });

    describe("calculateInterest", function () {
        it("Should return 0 if no debt", async function () {
            const interest = await borrowEngine.calculateInterest(user1.address);
            expect(interest).to.equal(0);
        });
    });
});