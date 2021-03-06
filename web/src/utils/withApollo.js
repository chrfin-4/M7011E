// import { createWithApollo } from "./createWithApollo";
import { withApollo as createWithApollo } from "next-apollo"
import { ApolloClient, InMemoryCache } from "@apollo/client";

const createClient = (ctx) => {
  return new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
    headers: {
      cookie:
        (typeof window === "undefined"
          ? ctx?.req?.headers.cookie
          : undefined) || "",
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
          },
        },
      },
    }),
  });
};

export const withApollo = createWithApollo(createClient);