const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://base.publicnode.com");

  const vmfAddress = "0xA3E82adF6bd3207a1d2470ED7Ad742596Ee81776";
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const yourWallet = "0x7b7fF9948c994d3748b0803C36Efb67047Fd4Cf4";

  console.log("=== Investigating VMF USDC Buy Function ===\n");

  // Check VMF's USDC balance
  const usdcAbi = ["function balanceOf(address) view returns (uint256)"];
  const usdc = new ethers.Contract(usdcAddress, usdcAbi, provider);

  const vmfUsdcBalance = await usdc.balanceOf(vmfAddress);
  console.log("VMF contract USDC balance:", ethers.formatUnits(vmfUsdcBalance, 6), "USDC");

  // Check contract storage for price/rate
  console.log("\n=== VMF Contract Storage ===\n");

  for (let i = 0; i < 10; i++) {
    const slot = await provider.getStorage(vmfAddress, i);
    if (slot !== "0x" + "00".repeat(32)) {
      const asNumber = BigInt(slot);
      const asAddress = "0x" + slot.slice(26);
      console.log(`Slot ${i}:`);
      console.log(`  Hex: ${slot}`);
      console.log(`  As number: ${asNumber.toString()}`);
      console.log(`  As address: ${asAddress}`);
      console.log("");
    }
  }

  // Slot 3 and 4 might be price/cap related
  // Let's decode them
  console.log("=== Potential Price/Cap Values ===\n");

  const slot3 = await provider.getStorage(vmfAddress, 3);
  const slot4 = await provider.getStorage(vmfAddress, 4);
  const slot5 = await provider.getStorage(vmfAddress, 5);

  // Slot 3: 0x00000000000000000000000000000000000000000000d3c0ea7f197d3e680000
  const slot3Val = BigInt(slot3);
  console.log("Slot 3 (maybe price?):", slot3Val.toString());
  console.log("  As 18 decimals:", ethers.formatUnits(slot3Val, 18));
  console.log("  As 6 decimals:", ethers.formatUnits(slot3Val, 6));

  // Slot 4: 0x0000000000000000000000000000000000000000000000000000000000002710
  const slot4Val = BigInt(slot4);
  console.log("\nSlot 4 (maybe rate/cap?):", slot4Val.toString());
  // 10000 = 0x2710, might be basis points (100% = 10000)

  // Slot 5: supply cap probably
  const slot5Val = BigInt(slot5);
  console.log("\nSlot 5 (maybe supply cap?):", slot5Val.toString());
  console.log("  As 18 decimals:", ethers.formatUnits(slot5Val, 18));

  // Check for buy-related functions
  console.log("\n=== Testing Buy Functions ===\n");

  // Function 0x612f5eef returned "to is not an allowed receiver"
  // This suggests a whitelist-based buy/claim function

  // Let's see what parameters it takes
  // Try with different parameter combinations

  console.log("Testing 0x612f5eef with different params...");

  // Try: buy(uint256 amount)
  try {
    await provider.call({
      to: vmfAddress,
      from: yourWallet,
      data: "0x612f5eef" + ethers.parseUnits("100", 18).toString(16).padStart(64, "0"),
    });
    console.log("  buy(uint256) works!");
  } catch (e) {
    console.log("  With uint256:", (e.reason || e.message || "").slice(0, 60));
  }

  // Let's look for a whitelist/allowlist function
  console.log("\n=== Checking for Whitelist Functions ===\n");

  const whitelistSelectors = {
    "0x2de94807": "rolesOf(address)",
    "0x514e62fc": "hasAllRoles(address,uint256)",
    "0x1cd64df4": "isAllowed(address) or similar",
  };

  for (const [sel, name] of Object.entries(whitelistSelectors)) {
    try {
      const result = await provider.call({
        to: vmfAddress,
        data: sel + yourWallet.slice(2).padStart(64, "0") + "f".repeat(64),
      });
      console.log(`${name}: ${result}`);

      if (result !== "0x" + "0".repeat(64)) {
        console.log("  ^ Non-zero result!");
      }
    } catch (e) {
      console.log(`${name}: error`);
    }
  }

  // Check if there's a setReceiver or addToWhitelist function
  console.log("\n=== Can owner add to whitelist? ===\n");

  // The problem is the owner is the proxy, which can't call anything
  console.log("Even if there's a whitelist function, the owner (proxy) can't call it.");
  console.log("So we can't add anyone to the whitelist to enable buying.");

  // Final check: is there ANY function that moves tokens without owner check?
  console.log("\n=== Final Check: Public Token Transfer Functions ===\n");

  // Try calling the 0x612f5eef function from the VMF contract itself
  // (as if the contract is sending to itself)
  try {
    await provider.call({
      to: vmfAddress,
      from: vmfAddress, // From the contract itself
      data: "0x612f5eef" + yourWallet.slice(2).padStart(64, "0"),
    });
    console.log("Can call from contract itself!");
  } catch (e) {
    console.log("From contract:", (e.reason || e.message || "").slice(0, 60));
  }

  console.log("\n=== Conclusion ===\n");
  console.log("The VMF contract appears to have:");
  console.log("1. A USDC integration (slot 1 = USDC address)");
  console.log("2. A whitelist-based receiver system");
  console.log("3. A mint function that requires authorization");
  console.log("");
  console.log("BUT - all these require the owner to configure them,");
  console.log("and the owner is the non-functional proxy contract.");
  console.log("");
  console.log("There's no public 'buy' function that anyone can call");
  console.log("to purchase VMF from the contract treasury.");
}

main().catch(console.error);
