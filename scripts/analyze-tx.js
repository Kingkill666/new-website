const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://base.publicnode.com");

  const txHash = "0x9d01214811016ac6635bd560154205d510d34d83c88bf5dd1ca10bd545127926";

  console.log("=== Analyzing Ownership Transfer Transaction ===\n");
  console.log("Tx:", txHash, "\n");

  // Get transaction
  const tx = await provider.getTransaction(txHash);
  const receipt = await provider.getTransactionReceipt(txHash);
  const block = await provider.getBlock(tx.blockNumber);

  console.log("=== Transaction Details ===\n");
  console.log("Block:", tx.blockNumber);
  console.log("Time:", new Date(block.timestamp * 1000).toISOString());
  console.log("From:", tx.from);
  console.log("To:", tx.to);
  console.log("Value:", ethers.formatEther(tx.value), "ETH");
  console.log("Gas Used:", receipt.gasUsed.toString());
  console.log("Status:", receipt.status === 1 ? "Success" : "Failed");

  console.log("\n=== Input Data ===\n");
  console.log("Raw data:", tx.data.slice(0, 100) + "...");
  console.log("Data length:", (tx.data.length - 2) / 2, "bytes");

  // Decode function selector
  const selector = tx.data.slice(0, 10);
  console.log("Function selector:", selector);

  // Known selectors
  const knownSelectors = {
    "0xf2fde38b": "transferOwnership(address)",
    "0x4f1ef286": "upgradeToAndCall(address,bytes)",
    "0x3659cfe6": "upgradeTo(address)",
    "0x8129fc1c": "initialize()",
    "0xc4d66de8": "initialize(address)",
    "0x1794bb3c": "initialize(address,address,uint256)",
  };

  if (knownSelectors[selector]) {
    console.log("Function:", knownSelectors[selector]);
  }

  // Try to decode the parameters
  if (selector === "0xf2fde38b") {
    // transferOwnership(address)
    const newOwner = "0x" + tx.data.slice(34, 74);
    console.log("\nDecoded: transferOwnership(", newOwner, ")");
  } else if (selector === "0x4f1ef286") {
    // upgradeToAndCall(address,bytes)
    const newImpl = "0x" + tx.data.slice(34, 74);
    console.log("\nDecoded: upgradeToAndCall");
    console.log("  New implementation:", newImpl);

    // The bytes parameter starts at offset indicated by second param
    const bytesOffset = parseInt(tx.data.slice(74, 138), 16);
    const bytesLength = parseInt(tx.data.slice(138, 202), 16);
    const bytesData = tx.data.slice(202, 202 + bytesLength * 2);
    console.log("  Bytes offset:", bytesOffset);
    console.log("  Bytes length:", bytesLength);
    if (bytesData.length > 0) {
      console.log("  Bytes data:", bytesData.slice(0, 50) + "...");
      const innerSelector = "0x" + bytesData.slice(0, 8);
      console.log("  Inner function selector:", innerSelector);
      if (knownSelectors[innerSelector]) {
        console.log("  Inner function:", knownSelectors[innerSelector]);
      }
    }
  }

  console.log("\n=== Events Emitted ===\n");

  for (const log of receipt.logs) {
    console.log("Contract:", log.address);

    // Decode known events
    const ownershipTransferTopic = ethers.id("OwnershipTransferred(address,address)");
    const upgradedTopic = ethers.id("Upgraded(address)");

    if (log.topics[0] === ownershipTransferTopic) {
      const oldOwner = "0x" + log.topics[1].slice(26);
      const newOwner = "0x" + log.topics[2].slice(26);
      console.log("  Event: OwnershipTransferred");
      console.log("    Old owner:", oldOwner);
      console.log("    New owner:", newOwner);
    } else if (log.topics[0] === upgradedTopic) {
      const newImpl = "0x" + log.topics[1].slice(26);
      console.log("  Event: Upgraded");
      console.log("    New implementation:", newImpl);
    } else {
      console.log("  Topic[0]:", log.topics[0].slice(0, 20) + "...");
    }
    console.log("");
  }

  // Check what contract the tx was sent to
  console.log("=== Target Contract Analysis ===\n");
  console.log("Transaction was sent to:", tx.to);

  if (tx.to.toLowerCase() === "0xa3e82adf6bd3207a1d2470ed7ad742596ee81776") {
    console.log("This is the VMF contract");
  } else if (tx.to.toLowerCase() === "0x5827e1c6a8d910c069c44f758da220a3fe774a65") {
    console.log("This is the proxy contract");
  }

  // Look for the actual ownership transfer
  console.log("\n=== Root Cause Analysis ===\n");

  // Check if this was a direct transferOwnership call
  if (selector === "0xf2fde38b") {
    const newOwner = "0x" + tx.data.slice(34, 74);
    console.log("DIRECT transferOwnership() call!");
    console.log("You transferred ownership from yourself to:", newOwner);
    console.log("\nThis was likely an accident or part of a script that");
    console.log("was meant to set up a governance structure but went wrong.");
  } else if (selector === "0x4f1ef286") {
    console.log("This was an upgradeToAndCall() transaction.");
    console.log("The upgrade may have included initialization code that");
    console.log("changed the owner as a side effect.");
  } else {
    console.log("Function:", selector);
    console.log("The full transaction data may reveal more.");
    console.log("\nFull data:");
    console.log(tx.data);
  }
}

main().catch(console.error);
