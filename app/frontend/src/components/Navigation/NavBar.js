import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
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

export default function NavBar(props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <AppBar position="fixed" className={clsx(classes.appBar)}>
        <Toolbar className={classes.toolbar}>
          {/* <Logo className={classes.toolbarIcon} /> */}
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Exerge
          </Typography>
          <Button variant="outlined">
            <Link to="/home">Home</Link>
          </Button>
          <Button variant="outlined">
            <Link to="/overview">Overview</Link>
          </Button>
          <Button variant="outlined">
            <Link to="/stats">Statistics</Link>
          </Button>
          {!props.token && (
            <Button href="/signin">
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
          {props.token && (
            <Button href="/signin">
              <Link to="/signout">Sign out</Link>
            </Button>
          )}
          <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
}