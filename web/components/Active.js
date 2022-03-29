import React from 'react';
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


const Active = () => {
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

  return <></>;
}

export default Active;