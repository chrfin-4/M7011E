import { Typography } from '@material-ui/core';
import React from 'react';
import { useMeQuery } from "../src/generated/graphql.ts";

const Index = (p) => {
  const { data } = useMeQuery();

  return (
    <>
      <Typography variant="h3">
        Welcome to Exerge!
        <br/>
        Energy. Delivered.
      </Typography>
      {data?.me ? 
        <>
          <Typography variant="h4">
            <br/>
            You are logged in.
          </Typography>
          <Typography variant="h5">
            <code>
              Name: {data.me.name}<br/>
              Email: {data.me.email}<br/>
              Type: {(() => {
                switch (data.me.type) {
                  case 0: return "Consumer";
                  case 1: return "Prosumer";
                  case 2: return "Moderator";
                }
              })()}
            </code>
          </Typography>
          </>
        :
        <Typography variant="h4">
          <br/>
          You are not logged in.
        </Typography>
      }
    </>
  );
}

export default Index;