const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CollateralManager", function () {
    let collateralManager;
    let dataStorage;
    let priceOracle;
    let weth;
    let owner;
    let user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        // Deploy mock WETH
        const WETH = await ethers.getContractFactory("contracts/mocks/WETH9.sol:WETH9");
        weth = await WETH.deploy();
        await weth.deployed();

        // Deploy DataStorage
        const DataStorage = await ethers.getContractFactory("DataStorage");
        dataStorage = await DataStorage.deploy();
        await dataStorage.deployed();

        // ✅ FIX: Deploy MockPriceOracle instead of real PriceOracle
        const MockPriceOracle = await ethers.getContractFactory("contracts/mocks/MockPriceOracle.sol:MockPriceOracle");
        priceOracle = await MockPriceOracle.deploy();
        await priceOracle.deployed();

        // Deploy CollateralManager with mock price oracle
        const CollateralManager = await ethers.getContractFactory("CollateralManager");
        collateralManager = await CollateralManager.deploy(
            weth.address,
            dataStorage.address,
            priceOracle.address
        );
        await collateralManager.deployed();
         // ✅ FIX: Transfer DataStorage ownership to CollateralManager
        await dataStorage.transferOwnership(collateralManager.address);
    });

    describe("depositCollateral", function () {
        it("Should allow user to deposit collateral", async function () {
            const depositAmount = ethers.utils.parseEther("1");
            
            // Mint WETH to user
            await weth.deposit({ value: depositAmount });
            await weth.transfer(user1.address, depositAmount);
            
            // Approve and deposit
            await weth.connect(user1).approve(collateralManager.address, depositAmount);
            await collateralManager.connect(user1).depositCollateral(depositAmount);
            
            // Check user data
            const userData = await dataStorage.getUserData(user1.address);
            expect(userData.collateral).to.equal(depositAmount);
        });

        it("Should revert if amount is 0", async function () {
            await expect(
                collateralManager.connect(user1).depositCollateral(0)
            ).to.be.revertedWith("Amount must be > 0");
        });
    });

    describe("withdrawCollateral", function () {
        it("Should allow user to withdraw collateral", async function () {
            const depositAmount = ethers.utils.parseEther("1");
            
            // Deposit first
            await weth.deposit({ value: depositAmount });
            await weth.transfer(user1.address, depositAmount);
            await weth.connect(user1).approve(collateralManager.address, depositAmount);
            await collateralManager.connect(user1).depositCollateral(depositAmount);
            
            // Withdraw
            await collateralManager.connect(user1).withdrawCollateral(depositAmount);
            
            // Check user data
            const userData = await dataStorage.getUserData(user1.address);
            expect(userData.collateral).to.equal(0);
        });

        it("Should revert if insufficient collateral", async function () {
            await expect(
                collateralManager.connect(user1).withdrawCollateral(ethers.utils.parseEther("1"))
            ).to.be.revertedWith("Insufficient collateral");
        });
    });
});