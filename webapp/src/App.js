import React from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import NavBar from './components/Navigation/NavBar';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import Overview from './pages/Overview';
import Statistics from './pages/Statistics';
import Signin from './pages/Signin';
import Signout from './pages/Signout';
import { getAccessToken } from './Cookies';

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
        {getAccessToken() && <Redirect from="/" to="/home" exact />}
        {getAccessToken() && <Redirect from="/signin" to="/home" exact />}
        {!getAccessToken() && <Redirect from="/" to="/signin" exact />}
        {!getAccessToken() && <Redirect from="/home" to="/signin" exact />}
        {!getAccessToken() && <Redirect from="/signout" to="/signin" exact />}
        {!getAccessToken() && <Redirect from="/overview" to="/signin" exact />}
        {!getAccessToken() && <Redirect from="/stats" to="/signin" exact />}
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