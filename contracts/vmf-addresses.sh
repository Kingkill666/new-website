#!/bin/bash

# Shared VMF contract addresses for scripts in this directory.
# The proxy address is the primary contract users interact with.
export VMF_PROXY_ADDRESS="0x8157B303a10609C50e332717D70E53B09ebdb045"
export VMF_IMPLEMENTATION_ADDRESS="0x1dbd09aFf3A79463f1f02b0004965F4039fB87F0"

# Backwards compatibility: if scripts expect VMF_ADDRESS or PROXY_ADDRESS env vars,
# default them to the proxy address unless already provided by the caller.
export VMF_ADDRESS="${VMF_ADDRESS:-$VMF_PROXY_ADDRESS}"
export PROXY_ADDRESS="${PROXY_ADDRESS:-$VMF_PROXY_ADDRESS}"

