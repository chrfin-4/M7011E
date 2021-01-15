import React from 'react'
import { withApollo } from "../src/utils/withApollo";

const Stats = ({}) => {
    return <div>stats</div>;
};

export default withApollo({ ssr: true })(Stats);
