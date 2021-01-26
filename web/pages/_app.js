import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../src/theme';
import { Layout } from '../components/Layout';
import { withApollo } from "../src/utils/withApollo";
import { io } from 'socket.io-client';
import { useMeQuery } from '../src/generated/graphql.ts';
import { isServer } from '../src/utils/isServer';

const useSocket = (url) => {
  const [socket, setSocket] = React.useState(null);

  React.useEffect(() => {
    const socketIo = io(url);

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};

const MyApp = (props) => {
  const { Component, pageProps } = props;
  const socket = useSocket(process.env.NEXT_PUBLIC_WEBSOCKET);
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  React.useEffect(() => {
    if (socket) {
      if (!loading && data?.me?._id) {
        socket.emit('active', data.me._id);
      } else {
        socket.emit('inactive', '1');
      }
    }
  }, [socket, data?.me?._id]);

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>Exerge</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Layout>
          <Component {...pageProps} socket={socket} />
        </Layout>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default withApollo({ ssr: false })(MyApp);