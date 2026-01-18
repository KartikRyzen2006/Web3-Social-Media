const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy SocialMediaDapp Contract
  console.log("\nDeploying SocialMediaDapp contract...");
  const SocialMediaDapp = await hre.ethers.getContractFactory("SocialMediaDapp");
  const socialMediaDapp = await SocialMediaDapp.deploy();

  await socialMediaDapp.deployed();

  console.log("\nDeployment Successful!");
  console.log("------------------------");
  console.log("NEXT_PUBLIC_SocialMediaDapp_ADDRESS:", socialMediaDapp.address);
  console.log("NEXT_PUBLIC_OWNER_ADDRESS:", deployer.address);

  // Update .env.local in the root directory
  const envPath = path.join(__dirname, "../../.env.local");
  let envContent = "";
  try {
      envContent = fs.readFileSync(envPath, "utf8");
  } catch (err) {
      console.log(".env.local not found, creating new one.");
      envContent = "";
  }

  const contractAddressKey = "NEXT_PUBLIC_CONTRACT_ADDRESS";
  const contractAddressValue = socialMediaDapp.address;
  const newLine = `${contractAddressKey}=${contractAddressValue}`;
  const regex = new RegExp(`^${contractAddressKey}=.*$`, "m");

  if (regex.test(envContent)) {
      envContent = envContent.replace(regex, newLine);
  } else {
      envContent += `\n${newLine}`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Updated .env.local at ${envPath}`);

  // Add the requested admin
  const requestedAdmin = "0x0d16BceA4310633907Bcea19197988F16f8EF280";
  console.log(`\nAdding requested admin: ${requestedAdmin}...`);
  try {
    const tx = await socialMediaDapp.addAdmin(requestedAdmin);
    await tx.wait();
    console.log("Admin added successfully!");
  } catch (error) {
    console.error("Failed to add admin:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
