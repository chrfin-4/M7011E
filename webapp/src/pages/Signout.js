import { removeAccessToken } from '../Cookies';

const Signout = ({history}) => {
  return(
    <div>
      {
        removeAccessToken()
      }
      {
        history.push("/")
      }
    </div>
  );
};

export default Signout;