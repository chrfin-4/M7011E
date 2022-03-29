import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import { Layout } from '../components/Layout';
import { io } from 'socket.io-client';
import { useMeQuery } from '../src/generated/graphql.ts';
import { isServer } from '../src/utils/isServer';
import { ApolloProvider } from '@apollo/client';
import client from '../src/utils/createApollo';
import Active from '../components/Active';

const MyApp = (props) => {
  const { Component, pageProps } = props;

  return (
    <React.Fragment>
      <Head>
        <title>Exerge</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <ApolloProvider client={client}>
          <Active/>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ApolloProvider>
      </ThemeProvider>
    </React.Fragment>
  );
};

export default MyApp;