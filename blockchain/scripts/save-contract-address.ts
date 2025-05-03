import fs from 'fs';
// Removed unused import as 'getAddress' is not exported from the module

async function main() {
  // Get the deployed contract artifact from Ignition
  const ignitionArtifact = require('../ignition/deployments/chain-1337/deployed_addresses.json');
  
  // Extract the address using the correct path
  const address = ignitionArtifact.AuctionPlatform?.address;
  
  if (!address) {
    throw new Error('Contract address not found in deployment artifacts');
  }
  
  // Save the address
  fs.writeFileSync(
    './contract-address.json',
    JSON.stringify({ AuctionPlatform: address }, null, 2)
  );
  
  console.log(`Contract address saved: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });