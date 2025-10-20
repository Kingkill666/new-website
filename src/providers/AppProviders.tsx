import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { config } from "../wagmi";

const queryClient = new QueryClient();
const apolloClient = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/107901/vmf_staking/version/latest",
  cache: new InMemoryCache(),
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="light">
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
