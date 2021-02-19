import React from 'react';
import clsx from 'clsx';
import NextLink from 'next/link';
import { useApolloClient } from '@apollo/client';
import { useMeQuery, useLogoutMutation } from '../src/generated/graphql.ts';
import { isServer } from "../src/utils/isServer";
import { useRouter } from "next/router";

import { 
  AppBar,
  Avatar,
  Drawer,
  Divider,
  Hidden,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Link,
  ListItem,
  List,
  ListItemText,
  ListItemIcon
} from '@material-ui/core';
import { 
  makeStyles,
  useTheme
} from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';
import { 
  Menu as MenuIcon,
  Home,
  Store,
  ShowChart,
  Build
} from '@material-ui/icons';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.warning.main,
    marginRight: "10px",
  },
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
  drawerPaper: {
    width: drawerWidth,
  },
}));

export const NavBar = ({ window }) => {
  const router = useRouter();
  const classes = useStyles();
  const theme = useTheme();
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  };

  if (loading) return null;

  const drawer = (
    <div
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <div className={classes.toolbar} />
      <Divider />
      <List>
        <ListItem button >
          <ListItemIcon>
            <Home/>
          </ListItemIcon>
          <NextLink href="/" >
            <ListItemText>
              Home
            </ListItemText>
          </NextLink>
        </ListItem>
        {data?.me ?
        (
          <>
            <ListItem button >
              <ListItemIcon>
                <Store/>
              </ListItemIcon>
              <NextLink href="/market" >
                <ListItemText>
                  Market
                </ListItemText>
              </NextLink>
            </ListItem>
            <ListItem button >
              <ListItemIcon>
                <ShowChart/>
              </ListItemIcon>
              <NextLink href="/stats" >
                <ListItemText>
                  Statistics
                </ListItemText>
              </NextLink>
            </ListItem>
            {data.me.type >= 2 ?
              (
                <ListItem button >
                  <ListItemIcon>
                    <Build/>
                  </ListItemIcon>
                  <NextLink href="/admin" >
                    <ListItemText>
                      Admin
                    </ListItemText>
                  </NextLink>
                </ListItem>
              ) : null
            }
          </>
        ) : null
        }
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  let body = null;

  body = (
    <React.Fragment>
      <Box className={classes.root}>
        <AppBar position="sticky" className={clsx(classes.appBar)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" noWrap className={clsx(classes.title)}>
              Exerge
            </Typography>
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
                  <Box className={clsx(classes.filler)}/>
                  <Avatar className={classes.avatar} alt={data.me.name} />
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
        <nav className={classes.drawer} aria-label="navbar">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor='left'
              open={mobileOpen}
              onClose={toggleDrawer(false)}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
      </Box>
    </React.Fragment>
  );

  return (<Box id="root" sx={{ mb: 4 }} >{body}</Box>);
};