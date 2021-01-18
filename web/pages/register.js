import React from 'react'
import { Wrapper } from "../components/Wrapper";
import { useApolloClient } from '@apollo/client';
import { useMeQuery, useCreateUserMutation, MeDocument } from "../src/generated/graphql.ts";
import { toErrorMap } from "../src/utils/toErrorMap";
import { useRouter } from "next/router";
import { withApollo } from "../src/utils/withApollo";
import { isServer } from "../src/utils/isServer";

import { Formik, Form, Field } from "formik";
import { TextField, RadioGroup } from 'formik-material-ui';

import clsx from 'clsx';
import { 
  Box,
  Radio,
  FormControlLabel,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  formField: {
    marginTop: 8
  }
}));

const Register = ({}) => {
  const classes = useStyles();
  const router = useRouter();
  const [register] = useCreateUserMutation();
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
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", password: "", type: "0" }}
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
            router.push("/overview");
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
            <Box className={clsx(classes.formField)}>
                  <Field label="Type of user" component={RadioGroup} name="type">
                    <FormControlLabel
                      control={<Radio disabled={isSubmitting}/>}
                      label="Consumer"
                      value="0"
                      disabled={isSubmitting}
                    />
                    <FormControlLabel
                      control={<Radio disabled={isSubmitting}/>}
                      label="Prosumer"
                      value="1"
                      disabled={isSubmitting}
                    />
                    <FormControlLabel
                      control={<Radio disabled={isSubmitting}/>}
                      label="Manager"
                      value="2"
                      disabled={isSubmitting}
                    />
                  </Field>
            </Box>
            <LoadingButton
              mt={4}
              type="submit"
              pending={isSubmitting}
            >
              register
            </LoadingButton>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: true })(Register);