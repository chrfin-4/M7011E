// import { createWithApollo } from "./createWithApollo";
import { withApollo as createWithApollo } from "next-apollo"
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";

const createClient = (ctx) => {
  return new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
          },
        },
      },
    }),
    link: createUploadLink({
      uri: process.env.NEXT_PUBLIC_API_URL,
      credentials: "include",
      headers: {
        cookie:
          (typeof window === "undefined"
            ? ctx?.req?.headers.cookie
            : undefined) || "",
      },
    }),
  });
};

export const withApollo = createWithApollo(createClient);