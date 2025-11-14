"use client"

import React from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConnectKitProvider } from "connectkit"
import { ApolloClient, InMemoryCache } from "@apollo/client"
import { ApolloProvider } from "@apollo/client/react"
import { config as stakingConfig } from "./wagmi"

// Create query client
const queryClient = new QueryClient()

// Create Apollo client for GraphQL
const apolloClient = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/107901/vmf_staking/version/latest",
  cache: new InMemoryCache(),
})

// Import staking components from local copies
import { Header } from "./components/Header"
import { StakingDashboard as StakingDashboardComponent } from "./components/StakingDashboard"

export default function StakingDashboard() {
  return (
    <WagmiProvider config={stakingConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="light">
          <ApolloProvider client={apolloClient}>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>
                <StakingDashboardComponent />
              </main>
            </div>
          </ApolloProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
