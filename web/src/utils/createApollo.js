import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";


const client = new ApolloClient({
  ssrMode: typeof window === "undefined",
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
    // headers: {
    //   cookie:
    //     (typeof window === "undefined"
    //       ? ctx?.req?.headers.cookie
    //       : undefined) || "",
    // },
  }),
});

export default client;