import React from 'react'
import { withApollo } from "../src/utils/withApollo";
import {useMeQuery} from '../src/generated/graphql.ts'
import { isServer } from '../src/utils/isServer';
import { useRouter } from 'next/router';

const Overview = ({}) => {
  const router = useRouter();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  // Redirect if already signed in
  if (typeof window !== 'undefined') {
    if (loading) {
    } else if (!data?.me) {
      router.push("/login")
    }
  }

    return <div>overview</div>;
};

export default withApollo({ ssr: true })(Overview);