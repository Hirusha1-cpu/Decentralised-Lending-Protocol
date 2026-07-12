const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("=".repeat(60));
    console.log("⚙️  CONFIGURING PROTOCOL PARAMETERS");
    console.log("=".repeat(60));

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log(`\n📤 Configuring with account: ${deployer.address}\n`);

    // Load deployment data
    const deployPath = path.join(__dirname, "../deployments/latest.json");
    if (!fs.existsSync(deployPath)) {
        console.error("❌ No deployment found! Please run deploy.js first.");
        process.exit(1);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));
    console.log("📋 Loaded deployment from:", deployPath);
    console.log(`   Network: ${deployment.network}`);
    console.log(`   Chain ID: ${deployment.chainId}\n`);

    // ============================================
    // 1. CONNECT TO CONTRACTS
    // ============================================
    console.log("🔗 Connecting to contracts...");
    
    const dataStorage = await hre.ethers.getContractAt(
        "DataStorage",
        deployment.contracts.DataStorage
    );
    console.log(`   ✅ DataStorage: ${dataStorage.address}`);

    // ============================================
    // 2. SET PROTOCOL PARAMETERS
    // ============================================
    console.log("\n⚙️  Setting protocol parameters...");

    // Set Collateral Ratio (150%)
    console.log("   📊 Setting collateral ratio: 150%");
    await dataStorage.setCollateralRatio(150);
    console.log("   ✅ Collateral ratio set to 150%");

    // Set Liquidation Threshold (80%)
    console.log("   📊 Setting liquidation threshold: 80%");
    await dataStorage.setLiquidationThreshold(80);
    console.log("   ✅ Liquidation threshold set to 80%");

    // Set Liquidation Penalty (10%)
    console.log("   📊 Setting liquidation penalty: 10%");
    await dataStorage.setLiquidationPenalty(10);
    console.log("   ✅ Liquidation penalty set to 10%");

    // Set Interest Rate (5%)
    console.log("   📊 Setting interest rate: 5% APY");
    await dataStorage.setInterestRate(5);
    console.log("   ✅ Interest rate set to 5% APY");

    // ============================================
    // 3. VERIFY SETTINGS
    // ============================================
    console.log("\n🔍 Verifying settings...");
    
    const collateralRatio = await dataStorage.collateralRatio();
    const liquidationThreshold = await dataStorage.liquidationThreshold();
    const liquidationPenalty = await dataStorage.liquidationPenalty();
    const interestRate = await dataStorage.interestRate();
    
    console.log(`   Collateral Ratio: ${collateralRatio}%`);
    console.log(`   Liquidation Threshold: ${liquidationThreshold}%`);
    console.log(`   Liquidation Penalty: ${liquidationPenalty}%`);
    console.log(`   Interest Rate: ${interestRate}% APY`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(60));
    console.log("✅ CONFIGURATION COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Protocol Parameters:");
    console.log(`   Collateral Ratio:    ${collateralRatio}%`);
    console.log(`   Liquidation Threshold: ${liquidationThreshold}%`);
    console.log(`   Liquidation Penalty: ${liquidationPenalty}%`);
    console.log(`   Interest Rate:       ${interestRate}% APY`);
    console.log("\n🌐 Network:");
    console.log(`   ${deployment.network} (Chain ID: ${deployment.chainId})`);
    console.log("\n" + "=".repeat(60));
}

// Run configuration
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Configuration failed!");
        console.error(error);
        process.exit(1);
    });