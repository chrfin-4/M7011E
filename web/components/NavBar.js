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
  linkButton: {
    // backgroundColor: 'rgb(20, 106, 98)',
    // color: 'rgb(119, 229, 219)'
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    color: 'white',
  }
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
                <NextLink href="/" >
              <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                  Home
              </Button>
                </NextLink>
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
          <AppBar position="fixed" className={clsx(classes.appBar)}>
            <Toolbar className={classes.toolbar}>
              {/* <Logo className={classes.toolbarIcon} /> */}
              <NextLink href="/" >
                <Typography component="h1" variant="h6" color="inherit" noWrap className={clsx(classes.title)}>
                  <Link>
                    Exerge
                  </Link>
                </Typography>
              </NextLink>
              <NextLink href="/" >
                <Button variant="contained" disableElevation className={clsx(classes.linkButton)}>
                  Home
                </Button>
              </NextLink>
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
            </Toolbar>
          </AppBar>
        </Box>
        <Toolbar />
      </React.Fragment>
    );
  }


  return (
    <Box id="root" sx={{ mb: 4 }} >{body}</Box>
  );
};