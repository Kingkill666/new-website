#!/bin/bash

set -ex

# Load environment variables
source .env

# Path to file containing deployed forwarder addresses (one per line, format: <charity_address> <forwarder_address>)
FORWARDERS_FILE="deployed_forwarders.txt"

# Loop through each line in the file
while read -r CHARITY FORWARDER; do
    echo "Sweeping forwarder $FORWARDER to charity $CHARITY"
    # Call forwardAll on the forwarder to sweep all tokens to the charity
    cast send "$FORWARDER" "forwardAll()" --private-key "$PRIVATE_KEY"
    echo "Sweep complete for $FORWARDER"
done < "$FORWARDERS_FILE"

echo "Sweep complete for all forwarders."
