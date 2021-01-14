import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
//import AppBar from '@material-ui/core/AppBar';
//import Toolbar from '@material-ui/core/Toolbar';
//import Typography from '@material-ui/core/Typography';
//import Button from '@material-ui/core/Button';
//import IconButton from '@material-ui/core/IconButton';
//import Badge from '@material-ui/core/Badge';
//import Box from "@material-ui/core/Box";
//import Link from '@material-ui/core/Link';

import NextLink from 'next/link';
import NotificationsIcon from '@material-ui/icons/Notifications';

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
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
  menuButton: {
    marginRight: 36,
  },
}));

export const NavBar = ({}) => {
  const classes = useStyles();

  let body = null;

  body = (
    <React.Fragment>
      <div className={classes.root}>
        <AppBar position="sticky" className={clsx(classes.appBar)}>
          <Toolbar className={classes.toolbar}>
            {/* <Logo className={classes.toolbarIcon} /> */}
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
              Exerge
            </Typography>
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
            <Button variant="outlined">
              <NextLink href="/signin" >
                <Link>Sign in</Link>
              </NextLink>
            </Button>
            <Button variant="outlined">
              <NextLink href="/signout" >
                <Link>Sign out</Link>
              </NextLink>
            </Button>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
      <Toolbar/>
    </React.Fragment>
  );

  return (
    <Box>{body}</Box>
  );
};