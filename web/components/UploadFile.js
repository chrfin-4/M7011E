import {
  useSetProfilePictureMutation,
} from '../src/generated/graphql.ts';

import { makeStyles } from '@material-ui/core/styles';
import { Avatar, IconButton } from '@material-ui/core';
import { useEffect } from 'react';
import { useState } from 'react';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'none'
  },
  avatar: {
    backgroundColor: theme.palette.warning.main,
  },
  avatarButton: {
    // marginRight: "10px",
  },
}));


export const UploadFile = (name) => {
  const classes = useStyles();
  const [setProfilePicture, { loading }] = useSetProfilePictureMutation();
  const [image, setFileUrl] = useState({
    source: process.env.NEXT_PUBLIC_PROFILE_URL,
    hash: Date.now(),
  });
  
  const onImageChange = ({ target: { validity, files: [file] }}) => {
    if (validity.valid) {
      // console.log(file);
      setProfilePicture({
        variables: {
          file
        }
      });
      setFileUrl({
        source: image.source,
        hash: Date.now(),
      });
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <input accept="image/*" className={classes.input} id="icon-button-file" type="file" onChange={onImageChange} />
      <IconButton aria-label="Avatar" className={classes.avatarButton} component="span" >
        <Avatar className={classes.avatar} alt={name.toString()} src={`${image.source}?${image.hash}`} />
      </IconButton>
    </>
  )
}