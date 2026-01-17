# Quick Reference: Vanity Address Generation

## Generate Vanity Address with "1776"

### Starting with 0x1776...
```bash
cd contracts
./generate_vanity_1776.sh mainnet start
```

### Ending with ...1776
```bash
cd contracts
./generate_vanity_1776.sh mainnet end
```

## Output

- **Console:** Colorized output with address and salt
- **File:** `vanity_address_1776.txt`

## Example Output

```
Address: 0x1776f2fcA2854C511Db2948BF306473d4CAc3a22
Salt: 0xedd7a89b15c498ae9ef154ae6903221d600dcd738586d6ede86b771c0930a02b
```

## Next Steps

1. Copy the salt to `.env`:
   ```bash
   CREATE2_SALT=0xedd7a89b15c498ae9ef154ae6903221d600dcd738586d6ede86b771c0930a02b
   ```

2. Deploy using CREATE2 with this salt to get the vanity address

## Performance

- Expected time: 10-30ms
- Uses 20 threads for parallel computation
- Deterministic (same salt = same address)

## Full Documentation

See `VANITY_ADDRESS_GENERATION.md` for complete guide.
