const fs = require('fs');
const hre = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const targetAdmin = "0x0d16BceA4310633907Bcea19197988F16f8EF280";

    const logMsg = (msg) => {
        console.log(msg);
        fs.appendFileSync('admin_check_log.txt', msg + '\n');
    }

    logMsg(`Checking admin status for ${targetAdmin} on contract ${contractAddress}...`);

    try {
        const SocialMediaDapp = await hre.ethers.getContractFactory("SocialMediaDapp");
        const contract = SocialMediaDapp.attach(contractAddress);

        const isAdmin = await contract.checkIsAdmin(targetAdmin);
        logMsg(`Is Admin: ${isAdmin}`);

        const owner = await contract.owner();
        logMsg(`Contract Owner: ${owner}`);
    } catch (error) {
        logMsg(`Error checking admin status: ${error}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
