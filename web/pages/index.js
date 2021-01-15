import React from 'react';
import { Layout } from '../components/Layout';
import { withApollo } from '../src/utils/withApollo';

const Index = () => {
  return (
    <div>index</div>
  );
}

export default withApollo({ ssr: true })(Index);