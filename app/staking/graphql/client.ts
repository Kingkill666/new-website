import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/107901/vmf_staking/version/latest",
  cache: new InMemoryCache(),
});
