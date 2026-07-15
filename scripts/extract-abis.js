const fs = require('fs');
const path = require('path');

const contracts = [
    'DataStorage',
    'PriceOracle',
    'CollateralManager',
    'BorrowEngine',
    'LiquidationEngine',
    'HealthMonitor',
    'Rollup',
    'Bridge',
    'Escrow',
    'DataAvailability'
];

const abis = {};

contracts.forEach(contract => {
    try {
        // Hardhat artifacts path
        const artifactPath = path.join(
            __dirname,
            '../artifacts/contracts/L2',
            `${contract}.sol`,
            `${contract}.json`
        );
        
        // Try L2 first, if not found try L1
        let artifact;
        try {
            artifact = require(artifactPath);
        } catch {
            const l1Path = path.join(
                __dirname,
                '../artifacts/contracts/L1',
                `${contract}.sol`,
                `${contract}.json`
            );
            artifact = require(l1Path);
        }
        
        abis[contract] = artifact.abi;
        console.log(`✅ ${contract} ABI extracted`);
    } catch (error) {
        console.error(`❌ Failed to extract ${contract}:`, error.message);
    }
});

// Save to frontend.
const outputPath = path.join(__dirname, '../frontend/src/utils/abi.js');
const output = `// Auto-generated ABIs - Do not edit manually\n\n`;
const abiContent = `export const ABIS = ${JSON.stringify(abis, null, 4)};\n\nexport default ABIS;`;

fs.writeFileSync(outputPath, output + abiContent);
console.log(`\n✅ ABIs saved to: ${outputPath}`);