import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { setAccessToken } from '../Cookies';
import { getSdk } from '../generated/graphql';
import { endpointUrl } from '../GraphqlConfig';
import { GraphQLClient } from 'graphql-request';

const Home = ({ history }) => {
  const client = new GraphQLClient(endpointUrl, {
    headers: {

    }
  });
  const sdk = getSdk(client);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <form onSubmit={async e => {
      e.preventDefault();
      const response = await sdk.Signin({
        variables: {
          email,
          password
        },
      });

      if (response && response.data) {
        setAccessToken(response.data.login.token);
      }

      history.push("/");
    }}>
      <TextField label="Email" onChange={e => {
        setEmail(e.target.value);
      }} />
      <TextField label="Password" type="password" onChange={e => {
        setPassword(e.target.value);
      }} />
      <Button variant="contained" type="submit">Sign in</Button>
    </form>
  );
};

export default Home;
