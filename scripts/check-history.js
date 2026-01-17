const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://base.publicnode.com");

  const vmfAddress = "0xA3E82adF6bd3207a1d2470ED7Ad742596Ee81776";

  console.log("=== Checking VMF Payment History ===\n");

  // Get current block
  const currentBlock = await provider.getBlockNumber();
  console.log("Current block:", currentBlock);

  // VMF was created ~31 days ago, so let's go back ~1M blocks (Base has ~2s blocks)
  // 31 days * 24 * 60 * 60 / 2 = ~1.3M blocks
  const startBlock = currentBlock - 1500000;

  console.log("Searching from block:", startBlock, "\n");

  // Check ownership transfer events in chunks
  console.log("=== Ownership Transfer Events ===\n");

  const ownershipTransferTopic = ethers.id("OwnershipTransferred(address,address)");

  // Search in chunks of 50000
  const chunkSize = 50000;
  let found = false;

  for (let from = startBlock; from < currentBlock && !found; from += chunkSize) {
    const to = Math.min(from + chunkSize - 1, currentBlock);

    try {
      const logs = await provider.getLogs({
        address: vmfAddress,
        topics: [ownershipTransferTopic],
        fromBlock: from,
        toBlock: to,
      });

      for (const log of logs) {
        const block = await provider.getBlock(log.blockNumber);
        const oldOwner = "0x" + log.topics[1].slice(26);
        const newOwner = "0x" + log.topics[2].slice(26);

        console.log(`Block ${log.blockNumber} (${new Date(block.timestamp * 1000).toISOString()}):`);
        console.log(`  From: ${oldOwner}`);
        console.log(`  To:   ${newOwner}`);
        console.log(`  Tx:   ${log.transactionHash}\n`);
      }
    } catch (e) {
      // Skip errors
    }
  }

  // Check Transfer events FROM the contract (pay function)
  console.log("=== Transfer Events FROM VMF Contract ===\n");

  const transferTopic = ethers.id("Transfer(address,address,uint256)");
  const vmfAddressPadded = "0x" + vmfAddress.slice(2).toLowerCase().padStart(64, "0");

  for (let from = startBlock; from < currentBlock; from += chunkSize) {
    const to = Math.min(from + chunkSize - 1, currentBlock);

    try {
      const logs = await provider.getLogs({
        address: vmfAddress,
        topics: [transferTopic, vmfAddressPadded],
        fromBlock: from,
        toBlock: to,
      });

      for (const log of logs) {
        const block = await provider.getBlock(log.blockNumber);
        const toAddr = "0x" + log.topics[2].slice(26);
        const amount = BigInt(log.data);
        const amountFormatted = ethers.formatUnits(amount, 18);

        console.log(`Block ${log.blockNumber} (${new Date(block.timestamp * 1000).toISOString()}):`);
        console.log(`  To:     ${toAddr}`);
        console.log(`  Amount: ${Number(amountFormatted).toLocaleString()} VMF`);
        console.log(`  Tx:     ${log.transactionHash}\n`);
      }
    } catch (e) {
      // Skip errors
    }
  }

  console.log("=== Summary ===\n");
  console.log("If the 118,771 VMF payment happened BEFORE ownership was transferred");
  console.log("to the proxy, that explains why it worked then but not now.\n");
  console.log("The ownership was transferred to the proxy (0x5827...) during an upgrade,");
  console.log("and now the proxy cannot call pay() because it has no such function.\n");
}

main().catch(console.error);
