import React from 'react'
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';

import { 
  useMeQuery, 
  useProsumerDataQuery,
  useMarketDataQuery,
  useSetChargeRatioMutation,
  useSetDischargeRatioMutation,
} from '../src/generated/graphql.ts'

import { isServer } from '../src/utils/isServer';
import { powConv } from '../src/utils/powConv';

import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';

import clsx from 'clsx';
import { 
  Box,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    maxWidth: '700px',
  },
  table: {
    // minWidth: 650,
  },
  hideLastBorder: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
}));

function BatteryRow(props) {
  const { charge, capacity } = props;
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  return (
    <>
      <TableRow className={clsx(classes.hideLastBorder)}>
        <TableCell component="th" scope="row">
          Battery level <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell aria-label="expand row" align="right">
          {(charge / capacity * 100).toFixed(1) + '%'}
        </TableCell>
      </TableRow>
      <TableRow className={clsx(classes.hideLastBorder)}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Table size="small" aria-label="battery">
              <TableHead>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell>Stat</TableCell>
                  <TableCell align="right">Data</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell>Charge</TableCell>
                  <TableCell align="right">
                    {powConv(charge)}
                  </TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell>Capacity</TableCell>
                  <TableCell align="right">
                    {powConv(capacity)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

BatteryRow.propTypes = {
  charge: PropTypes.number.isRequired,
  capacity: PropTypes.number.isRequired,
};

const Stats = ({}) => {
  if (isServer()) return null; // Only use client side rendering

  const classes = useStyles();
  const router = useRouter();
  const [setChargeRatio] = useSetChargeRatioMutation();
  const [setDischargeRatio] = useSetDischargeRatioMutation();

  const { data: meData, loading: meLoading } = useMeQuery({
    skip: isServer(),
  });

  const skip1 = isServer() || meData?.me === undefined || meData?.me === null || meData.me.prosumerData.houseId === null;
  const skip2 = isServer() || meData?.me === undefined || meData?.me === null;

  const { data: psData, loading: psLoading } = useProsumerDataQuery({
    fetchPolicy: skip1 ? 'cache-only' : 'cache-and-network',
    variables: { id: meData?.me?.prosumerData.houseId },
    skip: skip1,
    pollInterval: 1000,
  });

  const { data: mdData, loading: mdLoading } = useMarketDataQuery({
    fetchPolicy: skip2 ? 'cache-only' : 'cache-and-network',
    skip: skip2,
    pollInterval: 1000,
  });

  if (meLoading) return null;

  if (isServer()) { // Serverside
    if (!meData?.me || meData.me === null) return null; // If not signed in
    if (!meData?.me.type >= 1) return null; // If not admin
  }
  else { // Client side
    if (!meData?.me || meData.me === null) {
      router.push("/login"); // If not signed in
      return null;
    }
    if (!meData?.me.type >= 1) return null; // If not admin
  }

  let houseBody = null;
  let weatherBody = null;
  let marketBody = null;
  let manageBody = null;

  if (meLoading || psLoading || mdLoading) {
    if (!meData || !psData || !mdData) return null;
  }

  if (meData?.me) {
    let hasHouse = meData.me?.prosumerData.houseId !== undefined && meData.me?.prosumerData.houseId !== null;
    let pState = psData?.prosumerState;
    let weather = mdData.weather;
    houseBody = (
      <TableContainer component={Paper} className={clsx(classes.paper)}>
        <Typography variant="h6">
          House
        </Typography>
        <Table className={clsx(classes.table)} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Stat</TableCell>
              <TableCell align="right">Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Banned</TableCell>
              <TableCell align="right">{hasHouse ? (pState.banned ? "BANNED" : "No") : "No house"}</TableCell>
            </TableRow>
              <TableRow className={clsx(classes.hideLastBorder)}>
                <TableCell component="th" scope="row">Ban duration</TableCell>
                <TableCell align="right">{hasHouse ? (pState?.banDuration / 1000).toFixed(0) + "s" : "No house"}</TableCell>
              </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Blackout</TableCell>
              <TableCell align="right">{hasHouse ? (pState.blackout ? "BLACKOUT" : "No") : "No house"}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Power production</TableCell>
              <TableCell align="right">{hasHouse ? powConv(pState?.powerProduction) : "No house"}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Power consumption</TableCell>
              <TableCell align="right">{hasHouse ? powConv(pState?.powerConsumption) : "No house"}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Net production</TableCell>
              <TableCell align="right">{hasHouse ? powConv(pState?.powerProduction - pState?.powerConsumption) : "No house"}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Charge ratio</TableCell>
              <TableCell align="right">{hasHouse ? pState.chargeRatio.toFixed(3) : "No house"}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Discharge ratio</TableCell>
              <TableCell align="right">{hasHouse ? pState.dischargeRatio.toFixed(3) : "No house"}</TableCell>
            </TableRow>
            {hasHouse ? (
              <BatteryRow charge={pState.battery.charge} capacity={pState.battery.capacity}/>
            ) : (
              <TableRow className={clsx(classes.hideLastBorder)}>
                <TableCell>Battery level</TableCell>
                <TableCell align="right">No house</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    )
    weatherBody = (
      <TableContainer component={Paper} className={clsx(classes.paper)}>
        <Typography variant="h6">
          Weather
        </Typography>
        <Table className={clsx(classes.table)} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Stat</TableCell>
              <TableCell align="right">Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Windspeed</TableCell>
              <TableCell align="right">{weather.windSpeed.toFixed(1) + " m/s"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
    marketBody = (
      <TableContainer component={Paper} className={clsx(classes.paper)}>
        <Typography variant="h6">
          Market
        </Typography>
        <Table className={clsx(classes.table)} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Stat</TableCell>
              <TableCell align="right">Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Market demand</TableCell>
              <TableCell align="right">{powConv(mdData.marketDemand)}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Current price</TableCell>
              <TableCell align="right">{(mdData.currentPrice / 100).toFixed(2) + " kr/kWh"}</TableCell>
            </TableRow>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TableCell component="th" scope="row">Modeled price</TableCell>
              <TableCell align="right">{(mdData.modeledPrice / 100).toFixed(2) + " kr/kWh"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )
    manageBody = (
      <Paper className={clsx(classes.paper)}>
        <Typography variant="h6">
          Manage
        </Typography>
        <Grid container spacing={2} justifyContent="flex-start">
          <Grid item xs={12} sm={6} lg={12} xl={6}>
            <Paper className={clsx(classes.paper, classes.actionPaper)}>
              <Typography variant="h6" gutterBottom>
                Set charge ratio
              </Typography>
              <Formik
                initialValues={{ ratio: 0 }}
                onSubmit={async (values) => {
                  const response = await setChargeRatio({
                    variables: {
                      id: meData.me.prosumerData.houseId,
                      ratio: values.ratio
                    }
                  });
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={6}>
                        <Field
                          component={TextField}
                          name="ratio"
                          type="number"
                          label="Ratio"
                          inputProps={{ min: 0, max: 1, step: 0.001 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <LoadingButton
                          size="small"
                          type="submit"
                          variant="contained"
                          pending={isSubmitting}
                          sx={{ height: 50 }}
                        >
                          Submit
                        </LoadingButton>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} lg={12} xl={6}>
            <Paper className={clsx(classes.paper, classes.actionPaper)}>
              <Typography variant="h6" gutterBottom>
                Set discharge ratio
              </Typography>
              <Formik
                initialValues={{ ratio: 0 }}
                onSubmit={async (values) => {
                  const response = await setDischargeRatio({
                    variables: {
                      id: meData.me.prosumerData.houseId,
                      ratio: values.ratio
                    }
                  });
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={6}>
                        <Field
                          component={TextField}
                          name="ratio"
                          type="number"
                          label="Ratio"
                          inputProps={{ min: 0, max: 1, step: 0.001 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <LoadingButton
                          size="small"
                          type="submit"
                          variant="contained"
                          pending={isSubmitting}
                          sx={{ height: 50 }}
                        >
                          Submit
                        </LoadingButton>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  return (
    <Box sx={{ overflow: "hidden", mx: 2 }}>
      <Grid container spacing={2} justifyContent="center" >
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>{houseBody}</Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box>{weatherBody}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Box>{marketBody}</Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: "grid", gap: 8, gridAutoFlow: "row" }}>
            <Box>{manageBody}</Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
};

export default Stats;
