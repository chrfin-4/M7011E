import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Form, Formik, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import { toErrorMap } from '../src/utils/toErrorMap';
import clsx from 'clsx';
import {
  Box,
  Radio,
  RadioGroup,
  FormLabel,
  FormControl,
  FormControlLabel,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';

const styles = (theme) => ({
  form: {
    maxWidth: 100,
    justifyContent: "center"
  },
  formField: {
    marginTop: 8
  }
});

class UpdateDialog extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    // this.handleUpdate = this.handleUpdate.bind(this);
  }

  handleClose() {
    this.props.close();
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <Dialog open={this.props.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">Update user</DialogTitle>
          <Formik
            initialValues={{
              name: this.props.user.name,
              email: this.props.user.email,
              password: "",
              type: this.props.user.type.toString(),
            }}
            onSubmit={async (values, { setErrors }) => {
              console.log(values);
              console.log(this.props.user.userId);
              const response = await this.props.update(this.props.user.userId, values);
              console.log(response);
              if (response.data?.updateUser.errors) {
                setErrors(toErrorMap(response.data.updateUser.errors));
              } else if (response.data?.updateUser.user) {
                this.props.close();
              }
            }}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form>
                <FormControl component="fieldset">
                  <DialogContent>
                    <DialogContentText>
                      Update user information.
                    </DialogContentText>
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
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color="primary">
                      Cancel
                    </Button>
                    <LoadingButton
                      mt={4}
                      type="submit"
                      pending={isSubmitting}
                    >
                      Update
                    </LoadingButton>
                  </DialogActions>
                </FormControl>
              </Form>
            )}
          </Formik>
        </Dialog>
      </div>
    );
  }
}

UpdateDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool,
  update: PropTypes.func,
  userId: PropTypes.string,
  name: PropTypes.string,
  email: PropTypes.string,
  password: PropTypes.string,
  type: PropTypes.number
}

export default withStyles(styles)(UpdateDialog);