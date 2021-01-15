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
    ...theme.mixins.toolbar,
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

  if (loading) {

  } else if (!data?.me) {
    body = (
      <React.Fragment>
        <Box className={classes.root}>
          <AppBar position="sticky" className={clsx(classes.appBar)}>
            <Toolbar className={classes.toolbar}>
              <Typography component="h1" variant="h6" color="inherit" noWrap className={clsx(classes.title)}>
                Exerge
              </Typography>
              <Button variant="outlined">
                <NextLink href="/" >
                  <Link>Home</Link>
                </NextLink>
              </Button>
              <Box className={clsx(classes.filler)}/>
              <Button variant="outlined">
                <NextLink href="/login" >
                  <Link>Login</Link>
                </NextLink>
              </Button>
              <Button variant="outlined">
                <NextLink href="/register" >
                  <Link>Register</Link>
                </NextLink>
              </Button>
            </Toolbar>
          </AppBar>
        </Box>
        <Toolbar/>
      </React.Fragment>
    );
  } else {
    body = (
      <React.Fragment>
        <Box className={classes.root}>
          <AppBar position="sticky" className={clsx(classes.appBar)}>
            <Toolbar className={classes.toolbar}>
              {/* <Logo className={classes.toolbarIcon} /> */}
              <NextLink href="/" >
                <Typography component="h1" variant="h6" color="inherit" noWrap className={clsx(classes.title)}>
                  <Link>
                    Exerge
                  </Link>
                </Typography>
              </NextLink>
              <Button variant="outlined">
                <NextLink href="/" >
                  <Link>Home</Link>
                </NextLink>
              </Button>
              <Button variant="outlined">
                <NextLink href="/overview" >
                  <Link>Overview</Link>
                </NextLink>
              </Button>
              <Button variant="outlined">
                <NextLink href="/stats" >
                  <Link>Statistics</Link>
                </NextLink>
              </Button>
              <Box className={clsx(classes.filler)}/>
              <LoadingButton
                variant="outlined"
                onClick={async () => {
                  await logout();
                  await apolloClient.resetStore();
                  router.push("/");
                }}
                pending={logoutFetching}
                >
                  Logout
              </LoadingButton>
            </Toolbar>
          </AppBar>
        </Box>
        <Toolbar/>
      </React.Fragment>
    );
  }


  return (
    <Box id="root">{body}</Box>
  );
};