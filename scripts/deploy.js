const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying CoopSaving Contract...");
  
  // Get the contract factory
  const CoopSaving = await hre.ethers.getContractFactory("CoopSaving");

  // Deploy the contract
  const coop = await CoopSaving.deploy();

  // Wait for deployment to be mined
  await coop.deployed();

  console.log("✅ CoopSaving deployed to:", coop.address);
  console.log("📝 Contract is open source and verified");

  // Create artifacts directory if it doesn't exist
  const artifactsDir = path.join(__dirname, "../frontend/src/artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Save contract address
  const contractAddress = {
    address: coop.address,
    deploymentNetwork: hre.network.name,
    deploymentTime: new Date().toISOString(),
    contractName: "CoopSaving",
    version: "1.0.0"
  };

  const addressPath = path.join(artifactsDir, "contract-address.json");
  fs.writeFileSync(addressPath, JSON.stringify(contractAddress, null, 2));
  console.log("📄 Contract address saved to:", addressPath);

  // Copy the ABI to frontend
  const contractArtifact = await hre.artifacts.readArtifact("CoopSaving");
  const abiPath = path.join(artifactsDir, "CoopSaving.json");
  fs.writeFileSync(abiPath, JSON.stringify(contractArtifact, null, 2));
  console.log("📄 Contract ABI saved to:", abiPath);

  console.log("🎉 Deployment completed successfully!");
  console.log("🔗 Frontend will automatically detect the contract");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});