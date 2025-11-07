#!/bin/bash

# Shared VMF contract addresses for scripts in this directory.
# The vanity CREATE2 deployment is the primary contract users interact with.
export VMF_PROXY_ADDRESS="0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776"
# No separate implementation contract for the vanity deployment; point to the same address
export VMF_IMPLEMENTATION_ADDRESS="0xa3e82aDf6bD3207a1D2470ed7Ad742596Ee81776"

# Backwards compatibility: if scripts expect VMF_ADDRESS or PROXY_ADDRESS env vars,
# default them to the proxy address unless already provided by the caller.
export VMF_ADDRESS="${VMF_ADDRESS:-$VMF_PROXY_ADDRESS}"
export PROXY_ADDRESS="${PROXY_ADDRESS:-$VMF_PROXY_ADDRESS}"

