import React from "react";
import clsx from 'clsx';
import { Formik, Form, Field } from "formik";
import { useApolloClient } from '@apollo/client';
import { useMeQuery, useLoginMutation, MeDocument } from "../src/generated/graphql.ts";
import { toErrorMap } from "../src/utils/toErrorMap";
import { useRouter } from "next/router";
import { withApollo } from "../src/utils/withApollo";
import { TextField } from 'formik-material-ui';
import { isServer } from "../src/utils/isServer";

import { 
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: '100%',
    marginTop: 8
  },
  formField: {
    marginTop: 8
  }
}));


const Login = ({}) => {
  const classes = useStyles();
  const router = useRouter();
  const [login] = useLoginMutation();
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    skip: isServer(),
  });

  // Redirect if already signed in
  if (typeof window !== 'undefined') {
    if (loading) {
    } else if (data?.me) {
      router.push("/overview")
    }
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
                router.push("/overview");
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

export default withApollo({ ssr: false })(Login);