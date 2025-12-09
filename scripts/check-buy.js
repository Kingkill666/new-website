const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://base.publicnode.com");

  const vmfAddress = "0xA3E82adF6bd3207a1d2470ED7Ad742596Ee81776";

  console.log("=== Checking VMF Buy/Swap Functions ===\n");

  // Get all function selectors from the contract
  const vmfCode = await provider.getCode(vmfAddress);
  const vmfHex = vmfCode.slice(2);

  // Known buy/swap related selectors
  const buySelectors = {
    "0xd96a094a": "buy(uint256)",
    "0xa6f2ae3a": "buy()",
    "0xf088d547": "buyTokens(address)",
    "0xec8ac4d8": "buyTokens(address)",
    "0x47e7ef24": "deposit(address,uint256)",
    "0xd0e30db0": "deposit()",
    "0x6a627842": "mint(address)",
    "0x40c10f19": "mint(address,uint256)",
    "0xa0712d68": "mint(uint256)",
    "0x7a3226ec": "publicMint()",
    "0x2db11544": "publicMint(uint256)",
  };

  console.log("Checking for buy/mint functions...\n");

  for (const [selector, name] of Object.entries(buySelectors)) {
    const selectorHex = selector.slice(2);
    if (vmfHex.toLowerCase().includes(selectorHex)) {
      console.log(`✅ Found: ${selector} - ${name}`);

      // Test if callable
      try {
        await provider.call({
          to: vmfAddress,
          data: selector + "0".repeat(64),
          value: ethers.parseEther("0.001"),
        });
        console.log(`   Can be called (with ETH)!`);
      } catch (e) {
        try {
          await provider.call({
            to: vmfAddress,
            data: selector + "0".repeat(64),
          });
          console.log(`   Can be called (no ETH required)!`);
        } catch (e2) {
          console.log(`   Reverts: ${(e2.reason || e2.message || "").slice(0, 40)}`);
        }
      }
    }
  }

  // Check if contract has receive() or fallback() that accepts ETH
  console.log("\n=== Checking if contract accepts ETH ===\n");

  try {
    await provider.estimateGas({
      to: vmfAddress,
      value: ethers.parseEther("0.001"),
    });
    console.log("✅ Contract accepts ETH transfers!");
    console.log("   There might be a way to buy by sending ETH directly.");
  } catch (e) {
    console.log("❌ Contract does NOT accept plain ETH transfers");
  }

  // Check contract balance
  const ethBalance = await provider.getBalance(vmfAddress);
  console.log("\nContract ETH balance:", ethers.formatEther(ethBalance), "ETH");

  // Check for any public functions that might move tokens
  console.log("\n=== Checking other token movement functions ===\n");

  // These functions from earlier analysis
  const unknownFunctions = [
    ["0x40c10f19", "mint(address,uint256)"],
    ["0x47786d37", "unknown"],
    ["0x530e784f", "unknown"],
    ["0x612f5eef", "unknown"],
    ["0x6dddb3f4", "unknown"],
    ["0x751ab7a4", "unknown"],
    ["0xfca3b5aa", "unknown - might be setMinter"],
  ];

  for (const [selector, name] of unknownFunctions) {
    try {
      // Try with a dummy address parameter
      const testAddr = "0x7b7fF9948c994d3748b0803C36Efb67047Fd4Cf4";
      const result = await provider.call({
        to: vmfAddress,
        from: testAddr,
        data: selector + testAddr.slice(2).padStart(64, "0") + "0".repeat(64),
      });
      console.log(`${selector} (${name}): returns ${result.slice(0, 20)}...`);
    } catch (e) {
      const reason = e.reason || e.message || "";
      if (reason.includes("Unauthorized") || reason.includes("owner")) {
        console.log(`${selector} (${name}): requires owner`);
      } else if (!reason.includes("require(false)")) {
        console.log(`${selector} (${name}): ${reason.slice(0, 50)}`);
      }
    }
  }

  // Check if there's a USDC or other token swap function
  console.log("\n=== Contract Slot 1 (might be payment token) ===\n");

  const slot1 = await provider.getStorage(vmfAddress, 1);
  const slot1Addr = "0x" + slot1.slice(26);
  console.log("Slot 1 address:", slot1Addr);

  // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 is USDC on Base
  if (slot1Addr.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") {
    console.log("This is USDC on Base!");
    console.log("\nThe contract might have a buy function that accepts USDC.");
  }

  console.log("\n=== Summary ===\n");
  console.log("The VMF contract treasury holds ~9.8M VMF tokens.");
  console.log("To 'buy' from it, there would need to be a public function");
  console.log("that transfers tokens in exchange for ETH or USDC.");
  console.log("\nLet me check if any function does this...");

  // Try all unknown selectors with ETH value
  console.log("\n=== Testing functions with ETH value ===\n");

  const allSelectors = [
    "0x47786d37",
    "0x530e784f",
    "0x612f5eef",
    "0x6dddb3f4",
    "0x751ab7a4",
    "0xba4851be",
    "0xec669036",
  ];

  for (const sel of allSelectors) {
    try {
      await provider.estimateGas({
        to: vmfAddress,
        data: sel + "0".repeat(64),
        value: ethers.parseEther("0.01"),
      });
      console.log(`✅ ${sel} accepts ETH!`);
    } catch (e) {
      // Skip
    }
  }

  console.log("\nDone checking.");
}

main().catch(console.error);
