import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import * as fs from "fs";
import * as path from "path";

// Build the module for AuctionPlatform deployment
const AuctionPlatformModule = buildModule("AuctionPlatform", (m) => {
  // Deploy the AuctionPlatform contract
  const auctionPlatform = m.contract("AuctionPlatform", []);
  
  // Add post-deployment hook to save contract address to frontend env
  m.afterDeploy(async (args) => {
    const contractAddress = await args.contracts.auctionPlatform.getAddress();
    console.log(`AuctionPlatform deployed to ${contractAddress}`);
    
    // Store the contract addresses in a file for the frontend
    const envPath = path.join(__dirname, "../../../frontend/.env.local");
    const envContent = `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}\n`;
    
    fs.writeFileSync(envPath, envContent, { flag: "w" });
    console.log("Contract address saved to frontend/.env.local");
  });
  
  return { auctionPlatform };
});

export default AuctionPlatformModule;