const fs = require('fs');
const path = require('path');

const artifactPath = path.join(__dirname, '../web3/artifacts/contracts/SocialMediaDapp.sol/SocialMediaDapp.json');
const outputPath = path.join(__dirname, '../lib/contractABI.js');

try {
    const artifact = require(artifactPath);
    const abi = artifact.abi;
    const content = `export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)};`;

    fs.writeFileSync(outputPath, content);
    console.log('Successfully updated lib/contractABI.js with new ABI');
} catch (error) {
    console.error('Error updating ABI:', error);
    process.exit(1);
}
