const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("=".repeat(60));
    console.log("🚀 DEPLOYING LENDING PROTOCOL");
    console.log("=".repeat(60));
    
    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`\n📤 Deploying with account: ${deployer.address}`);
    console.log(`💰 Balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);

     // ============================================
    // 1. DEPLOY DATA STORAGE
    // ============================================
     console.log("📦 1. Deploying DataStorage...");
    const DataStorage = await hre.ethers.getContractFactory("DataStorage");
    const dataStorage = await DataStorage.deploy();
    await dataStorage.deployed();
    console.log(`   ✅ DataStorage deployed to: ${dataStorage.address}`);

    // ============================================
    // 2. DEPLOY PRICE ORACLE
    // ============================================
    console.log("\n📦 2. Deploying PriceOracle...");

    // Chainlink Price Feed Addresses
    const PRICE_FEEDS = {
        // Ethereum Mainnet
        mainnet: {
            ETH_USD: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
            BTC_USD: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
            USDC_USD: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
        },
        // Arbitrum Mainnet
        arbitrum: {
            ETH_USD: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
            BTC_USD: "0x6ce185860a4963106506C203335A2910413708e9",
            USDC_USD: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3"
        },
        // Base Mainnet
        base: {
            ETH_USD: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
            USDC_USD: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B"
        },
        // Arbitrum Sepolia (Testnet)
        arbitrumSepolia: {
            ETH_USD: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
            USDC_USD: "0x2f958Cfc018Fe24b34f73c97Fc7E633c2eA9a31D"
        },
        // Base Sepolia (Testnet)
        baseSepolia: {
            ETH_USD: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
            USDC_USD: "0x22aC5D0EdfE7881D25bFcE5D65FE0f5e8E98F46B"
        }
    };

    // Get network name
    const network = hre.network.name;
    console.log(`   🌐 Network: ${network}`);

     // Select price feed
    let priceFeedAddress;
    if (network === "arbitrumSepolia") {
        priceFeedAddress = PRICE_FEEDS.arbitrumSepolia.ETH_USD;
    } else if (network === "baseSepolia") {
        priceFeedAddress = PRICE_FEEDS.baseSepolia.ETH_USD;
    } else if (network === "arbitrum") {
        priceFeedAddress = PRICE_FEEDS.arbitrum.ETH_USD;
    } else if (network === "base") {
        priceFeedAddress = PRICE_FEEDS.base.ETH_USD;
    } else if (network === "mainnet" || network === "hardhat") {
        priceFeedAddress = PRICE_FEEDS.mainnet.ETH_USD;
    } else {
        // Default to Arbitrum Sepolia for testing
        priceFeedAddress = PRICE_FEEDS.arbitrumSepolia.ETH_USD;
        console.log("   ⚠️  Unknown network, using Arbitrum Sepolia price feed");
    }
    
    console.log(`   🔗 Price Feed: ${priceFeedAddress}`);
    
    const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy(priceFeedAddress);
    await priceOracle.deployed();
    console.log(`   ✅ PriceOracle deployed to: ${priceOracle.address}`);

     // ============================================
    // 3. DEPLOY COLLATERAL MANAGER
    // ============================================
    console.log("\n📦 3. Deploying CollateralManager...");
    
    // Token Addresses
    const TOKENS = {
        // Ethereum Mainnet
        mainnet: {
            WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        },
        // Arbitrum Mainnet
        arbitrum: {
            WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
        },
        // Base Mainnet
        base: {
            WETH: "0x4200000000000000000000000000000000000006",
            USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
        },
        // Arbitrum Sepolia (Testnet)
        arbitrumSepolia: {
            WETH: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
            USDC: "0x2f958Cfc018Fe24b34f73c97Fc7E633c2eA9a31D"
        },
        // Base Sepolia (Testnet)
        baseSepolia: {
            WETH: "0x4200000000000000000000000000000000000006",
            USDC: "0x67B8c4F1F3f366d4C8294Cf48Bda4b156F03D1B2"
        }
    };

    // Select token addresses
    let collateralTokenAddress;
    let debtTokenAddress;
    
    if (network === "arbitrumSepolia") {
        collateralTokenAddress = TOKENS.arbitrumSepolia.WETH;
        debtTokenAddress = TOKENS.arbitrumSepolia.USDC;
    } else if (network === "baseSepolia") {
        collateralTokenAddress = TOKENS.baseSepolia.WETH;
        debtTokenAddress = TOKENS.baseSepolia.USDC;
    } else if (network === "arbitrum") {
        collateralTokenAddress = TOKENS.arbitrum.WETH;
        debtTokenAddress = TOKENS.arbitrum.USDC;
    } else if (network === "base") {
        collateralTokenAddress = TOKENS.base.WETH;
        debtTokenAddress = TOKENS.base.USDC;
    } else if (network === "mainnet" || network === "hardhat") {
        collateralTokenAddress = TOKENS.mainnet.WETH;
        debtTokenAddress = TOKENS.mainnet.USDC;
    } else {
        collateralTokenAddress = TOKENS.arbitrumSepolia.WETH;
        debtTokenAddress = TOKENS.arbitrumSepolia.USDC;
        console.log("   ⚠️  Unknown network, using Arbitrum Sepolia tokens");
    }
    
    console.log(`   🪙 Collateral Token (WETH): ${collateralTokenAddress}`);
    console.log(`   🪙 Debt Token (USDC): ${debtTokenAddress}`);
    
    const CollateralManager = await hre.ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy(
        collateralTokenAddress,
        dataStorage.address,
        priceOracle.address
    );
    await collateralManager.deployed();
    console.log(`   ✅ CollateralManager deployed to: ${collateralManager.address}`);

    // ============================================
    // 4. DEPLOY BORROW ENGINE
    // ============================================
    console.log("\n📦 4. Deploying BorrowEngine...");
    
    const BorrowEngine = await hre.ethers.getContractFactory("BorrowEngine");
    const borrowEngine = await BorrowEngine.deploy(
        debtTokenAddress,
        dataStorage.address,
        priceOracle.address
    );
    await borrowEngine.deployed();
    console.log(`   ✅ BorrowEngine deployed to: ${borrowEngine.address}`);

    // ============================================
    // 5. DEPLOY LIQUIDATION ENGINE
    // ============================================
    console.log("\n📦 5. Deploying LiquidationEngine...");
    
    const LiquidationEngine = await hre.ethers.getContractFactory("LiquidationEngine");
    const liquidationEngine = await LiquidationEngine.deploy(
        collateralTokenAddress,
        debtTokenAddress,
        dataStorage.address,
        priceOracle.address
    );
    await liquidationEngine.deployed();
    console.log(`   ✅ LiquidationEngine deployed to: ${liquidationEngine.address}`);

    // ============================================
    // 6. DEPLOY HEALTH MONITOR
    // ============================================
    console.log("\n📦 6. Deploying HealthMonitor...");
    
    const HealthMonitor = await hre.ethers.getContractFactory("HealthMonitor");
    const healthMonitor = await HealthMonitor.deploy(
        dataStorage.address,
        priceOracle.address
    );
    await healthMonitor.deployed();
    console.log(`   ✅ HealthMonitor deployed to: ${healthMonitor.address}`);

    // ============================================
    // SAVE DEPLOYMENT ADDRESSES
    // ============================================
    console.log("\n💾 Saving deployment addresses...");
    
    const deploymentData = {
        network: network,
        chainId: hre.network.config.chainId,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            DataStorage: dataStorage.address,
            PriceOracle: priceOracle.address,
            CollateralManager: collateralManager.address,
            BorrowEngine: borrowEngine.address,
            LiquidationEngine: liquidationEngine.address,
            HealthMonitor: healthMonitor.address
        },
        tokens: {
            collateralToken: collateralTokenAddress,
            debtToken: debtTokenAddress
        },
        priceFeed: priceFeedAddress
    };
    
    // Save to file
    const deployPath = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deployPath)) {
        fs.mkdirSync(deployPath);
    }
    
    const fileName = `deployment-${network}-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deployPath, fileName),
        JSON.stringify(deploymentData, null, 2)
    );
    
    // Also save as latest
    fs.writeFileSync(
        path.join(deployPath, "latest.json"),
        JSON.stringify(deploymentData, null, 2)
    );
    
    console.log(`   ✅ Deployment data saved to: deployments/${fileName}`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 CONTRACT ADDRESSES:");
    console.log(`   DataStorage:        ${dataStorage.address}`);
    console.log(`   PriceOracle:        ${priceOracle.address}`);
    console.log(`   CollateralManager:  ${collateralManager.address}`);
    console.log(`   BorrowEngine:       ${borrowEngine.address}`);
    console.log(`   LiquidationEngine:  ${liquidationEngine.address}`);
    console.log(`   HealthMonitor:      ${healthMonitor.address}`);
    console.log("\n🔗 Token Addresses:");
    console.log(`   Collateral (WETH):  ${collateralTokenAddress}`);
    console.log(`   Debt (USDC):        ${debtTokenAddress}`);
    console.log("\n📊 Price Feed:");
    console.log(`   ${priceFeedAddress}`);
    console.log("\n🌐 Network:");
    console.log(`   ${network} (Chain ID: ${hre.network.config.chainId})`);
    console.log("\n" + "=".repeat(60));
}

// Run deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed!");
        console.error(error);
        process.exit(1);
    });