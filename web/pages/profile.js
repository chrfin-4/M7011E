import { makeStyles } from "@material-ui/core";
import { withApollo } from "next-apollo";


const useStyles = makeStyles((theme) => ({

}));

const Profile = ({}) => {
  const classes = useStyles();

  return null;
}

export default withApollo({ssr: true})(Profile);