import React from 'react';
import clsx from 'clsx';
import NextLink from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useMeQuery, useLogoutMutation } from '../src/generated/graphql.ts';
import { isServer } from "../src/utils/isServer";
import { useRouter } from "next/router";

import { 
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Link
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    // ...theme.mixins.toolbar,
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  title: {
    marginRight: 36,
  },
  filler: {
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  menuButton: {
    marginRight: 36,
  },
}));

export const NavBar = ({}) => {
  const router = useRouter();
  const classes = useStyles();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  let body = null;

  if (loading) return null;
  body = (
    <React.Fragment>
      <Box className={classes.root}>
        <AppBar position="sticky" className={clsx(classes.appBar)}>
          <Toolbar className={classes.toolbar}>
            <Typography component="h1" variant="h6" noWrap className={clsx(classes.title)}>
              Exerge
            </Typography>
            <NextLink href="/" >
              <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                Home
              </Button>
            </NextLink>
            {!data?.me ?
            (
              <>
                <Box className={clsx(classes.filler)}/>
                <NextLink href="/login" >
                  <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                      Login
                  </Button>
                </NextLink>
                <NextLink href="/register" >
                  <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                      Register
                  </Button>
                </NextLink>
              </>
            ) : 
            (
              <>
                <NextLink href="/overview" >
                  <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                      Overview
                  </Button>
                </NextLink>
                <NextLink href="/stats" >
                  <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                      Statistics
                  </Button>
                </NextLink>
                <Box className={clsx(classes.filler)}/>
                <LoadingButton
                  variant="contained" disableElevation className={clsx(classes.linkButton)}
                  color="secondary"
                  onClick={async () => {
                    await logout();
                    await apolloClient.resetStore();
                    router.push("/");
                  }}
                  pending={logoutFetching}
                >
                  Logout
                </LoadingButton>
              </>
              )
            }
          </Toolbar>
        </AppBar>
      </Box>
    </React.Fragment>
  );

  return (
    <Box id="root" sx={{ mb: 4 }} >{body}</Box>
  );
};