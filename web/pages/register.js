import React from 'react';
import { useRouter } from "next/router";

import { useApolloClient } from '@apollo/client';
import { useMeQuery, useCreateUserMutation, MeDocument } from "../src/generated/graphql.ts";

import { toErrorMap } from "../src/utils/toErrorMap";
import { isServer } from "../src/utils/isServer";

import { Formik, Form, Field } from "formik";
import { TextField } from 'formik-material-ui';

import clsx from 'clsx';
import { 
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';

import UpdateDialog from '../components/UpdateDialog';

const useStyles = makeStyles((theme) => ({
  form: {
    maxWidth: 100,
    justifyContent: "center"
  },
  formField: {
    marginTop: 8
  }
}));

const Register = ({}) => {
  if (isServer()) return null; // Only use client side rendering

  const classes = useStyles();
  const router = useRouter();
  const [register] = useCreateUserMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  const [editUser, setEditUser] = React.useState({
    open: false,
    user: {
      name: "",
      email: "",
      password: "",
      type: 0,
    }
  });

  // Redirect if already signed in
  if (typeof window === 'undefined') {
    if (data?.me) return null;
  }
  else {
    if (loading) {
    } else if (data?.me) {
      router.push("/")
    }
  }

  return (
    <Box className={clsx(classes.form)}>
      <UpdateDialog
        open={editUser.open}
        user={editUser.user}
        close={() => {
          setEditUser(prevState => {
            return { open: false, user: prevState.user }
          });
        }}
        update={ async (userId, values) => {
          return updateUser({
            variables: {
              userId: userId,
              userInput: values
            }
          })
        }}
      />
      <Formik
        initialValues={{ name: "", email: "", password: "", type: "1" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { userInput: values },
            update: (cache, { data }) => {
              cache.writeQuery({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.createUser.user,
                },
              });
            },
          });
          if (response.data?.createUser.errors) {
            setErrors(toErrorMap(response.data.createUser.errors));
          } else if (response.data?.createUser.user) {
            await apolloClient.resetStore();
            router.push("/");
          }
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <FormControl component="fieldset">
            <Box className={clsx(classes.formField)}>
              <Field
                component={TextField}
                name="name"
                label="Name"
              />
            </Box>
            <Box className={clsx(classes.formField)}>
              <Field
                component={TextField}
                name="email"
                label="Email"
                id="email"
              />
            </Box>
            <Box className={clsx(classes.formField)}>
              <Field
                component={TextField}
                name="password"
                label="Password"
                id="password"
                type="password"
              />
            </Box>
            <Box className={clsx(classes.formField)}>
              <FormLabel component="legend">Type of user</FormLabel>
              <RadioGroup name="type" value={values.type.toString()} onChange={(event) => {
                setFieldValue("type", event.currentTarget.value)
              }}>
                <FormControlLabel
                  control={<Radio disabled={isSubmitting}/>}
                  disabled={isSubmitting}
                  label="Prosumer"
                  value="1"
                />
                <FormControlLabel
                  control={<Radio disabled={isSubmitting}/>}
                  disabled={isSubmitting}
                  label="Manager"
                  value="2"
                />
              </RadioGroup>
            </Box>
            <Box>Type: {values.type}</Box>
            <LoadingButton
              mt={4}
              type="submit"
              pending={isSubmitting}
            >
              register
            </LoadingButton>
            </FormControl>
          </Form>
        )}
      </Formik>
      <Button
        variant="contained"
        color="secondary"
        className={clsx(classes.item)}
        onClick={() => {
          setEditUser({
            open: true,
            user: {
              userId: "aaa",
              name: "abc",
              email: "ab@c",
              type: "2",
            }
          });
          console.warn(editUser);
        }}
      >
        Edit
      </Button>
    </Box>
  );
};

export default Register;