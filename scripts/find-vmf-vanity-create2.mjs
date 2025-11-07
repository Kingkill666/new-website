import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getCreate2Address, keccak256 } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const deployerAddressInput = process.argv[2] ?? process.env.CREATE2_DEPLOYER ?? "0x4e59b44847b379578588920ca78fbf26c0b4956c";

if (!/^0x[0-9a-fA-F]{40}$/.test(deployerAddressInput)) {
  throw new Error(`Invalid deployer address provided: ${deployerAddressInput}`);
}

const deployerAddress = deployerAddressInput.toLowerCase();
const creationBytecodePath = join(__dirname, "data", "vmf-bytecode.txt");
const creationBytecode = readFileSync(creationBytecodePath, "utf8").trim();

if (!creationBytecode.startsWith("0x")) {
  throw new Error("Creation bytecode file must contain a hex string prefixed with 0x");
}

const initCodeHash = keccak256(creationBytecode);

const preferredSuffix = "1776";
const preferredPrefix = "1776";
const maxChecks = 100_000_000n;

const start = Date.now();

let prefixMatch = null;
let suffixMatch = null;

for (let i = 0n; i < maxChecks; i++) {
  const salt = `0x${i.toString(16).padStart(64, "0")}`;
  const address = getCreate2Address(deployerAddress, salt, initCodeHash).toLowerCase();

  if (!prefixMatch && address.slice(2, 6) === preferredPrefix) {
    prefixMatch = { address, salt, attempts: i + 1n };
    console.log(`Found prefix match after ${i + 1n} attempts -> ${address} (salt: ${salt})`);
  }

  if (address.endsWith(preferredSuffix)) {
    suffixMatch = { address, salt, attempts: i + 1n };
    console.log(`Found suffix match after ${i + 1n} attempts -> ${address} (salt: ${salt})`);
    break;
  }

  if (i > 0n && i % 1_000_000n === 0n) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`Checked ${i} salts (${elapsed}s elapsed)`);
  }
}

const stop = Date.now();
const elapsedSeconds = ((stop - start) / 1000).toFixed(2);

console.log(`\nCompleted search in ${elapsedSeconds}s using deployer ${deployerAddress}`);

if (!suffixMatch) {
  console.log("No suffix match ending with 1776 found within the search window.");
} else {
  const { address, salt, attempts } = suffixMatch;
  console.log(`Best suffix match: address=${address}, salt=${salt}, attempts=${attempts}`);
}

if (prefixMatch) {
  const { address, salt, attempts } = prefixMatch;
  console.log(`Best prefix match: address=${address}, salt=${salt}, attempts=${attempts}`);
}
