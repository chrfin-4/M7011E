import {
  useSetProfilePictureMutation,
} from '../src/generated/graphql.ts';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  input: {
    display: 'none'
  }
})


export const UploadFile = () => {
  const classes = useStyles();
  const [setProfilePicture, { loading }] = useSetProfilePictureMutation();
  
  const onImageChange = ({ target: { validity, files: [file] }}) => {
    if (validity.valid) {
      // console.log(file);
      setProfilePicture({
        variables: {
          file
        }
      });
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <input accept="image/*" className={classes.input} id="icon-button-file" type="file" onChange={onImageChange} />
  )
}