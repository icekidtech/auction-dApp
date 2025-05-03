import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AuctionPlatformModule = buildModule("AuctionPlatform", (m) => {
  const auctionPlatform = m.contract("AuctionPlatform", []);
  return { auctionPlatform };
});

export default AuctionPlatformModule;