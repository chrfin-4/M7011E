import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import NavBar from './components/Navigation/NavBar';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import Overview from './pages/Overview';
import Statistics from './pages/Statistics';
import Signin from './pages/Signin';
import Signout from './pages/Signout';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Exerge
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default function App(props) {
  return (
    <BrowserRouter>
      <NavBar />
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/overview" component={Overview} />
        <Route path="/stats" component={Statistics} />
        <Route path="/signin" component={Signin} />
        <Route path="/signout" component={Signout} />
      </Switch>
      <Copyright />
    </BrowserRouter>
  );
};