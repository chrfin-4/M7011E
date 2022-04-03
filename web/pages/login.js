import React from "react";
import clsx from 'clsx';
import { Formik, Form, Field } from "formik";
import { useApolloClient } from '@apollo/client';
import { useMeQuery, useLoginMutation, MeDocument } from "../src/generated/graphql.ts";
import { toErrorMap } from "../src/utils/toErrorMap";
import { useRouter } from "next/router";
import { TextField } from 'formik-material-ui';

import { 
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';
import { isServer } from "../src/utils/isServer";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    marginTop: 8
  },
  formField: {
    marginTop: 8
  }
}));

const Login = () => {
  if (isServer()) return null; // Only use client side rendering

  const classes = useStyles();
  const router = useRouter();
  const [login] = useLoginMutation();
  const apolloClient = useApolloClient();

  const { meData, meLoading } = useMeQuery({
    skip: isServer()
  });

  if (meLoading) return null;
  if (isServer()) { // Serverside
    if (meData?.me) return null; // If not signed in
    if (meData?.me.type >= 2) return null; // If not admin
  }
  else { // Client side
    if (meData?.me) {
      router.push("/market");
      return null;
    } // If not signed in
    if (meData?.me.type >= 2) return null; // If not admin
  }

  return (
    <Box className={clsx(classes.wrapper)}>
      <Box mx="auto">
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await login({
              variables: values,
              update: (cache, { data }) => {
                cache.writeQuery({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.login.user,
                  },
                });
              },
            });
            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user) {
              if (typeof router.query.next === "string") {
                router.push(router.query.next);
              } else {
                // worked
                await apolloClient.resetStore();
                router.push("/market");
              }
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field
                component={TextField}
                name="email"
                label="Email"
                id="email"
              />
              <Box className={clsx(classes.formField)}>
                <Field
                  component={TextField}
                  name="password"
                  label="Password"
                  id="password"
                  type="password"
                />
              </Box>
              {/*
              <Box display="flex" mt={2}>
                <NextLink href="/forgot-password">
                  <Link ml="auto">forgot password?</Link>
                </NextLink>
              </Box>
              */}
              <LoadingButton
                mt={4}
                type="submit"
                pending={isSubmitting}
              >
                login
              </LoadingButton>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default Login;