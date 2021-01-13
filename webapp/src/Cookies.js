import Cookies from 'js-cookie';

const setAccessToken = (token) => {
  console.log(token);
  Cookies.set('jstkn', token);
};

const getAccessToken = () => {
  return Cookies.get('jstkn');
}

const removeAccessToken = () => {
  Cookies.remove('jstkn');
}

export { setAccessToken, getAccessToken, removeAccessToken };