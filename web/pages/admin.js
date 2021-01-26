import React from 'react'
import PropTypes from 'prop-types';
import { withApollo } from "../src/utils/withApollo";
import clsx from 'clsx';
import {
  Box,
  Button,
  Collapse,
  Grid,
  IconButton,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableFooter,
  TableContainer,
  TablePagination,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton } from '@material-ui/lab';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import combineQuery from 'graphql-combine-query';
import {useQuery} from '@apollo/client';

import { 
  useMeQuery, 
  useOwnedQuery,
  useOnlineQuery,
  useMarketDataQuery,
  useManagerDataQuery,
  useProsumerDataQuery,
  useProsumersDataQuery, 
  useDeleteUserMutation,
  useBanProducerMutation,
  useSetChargeRatioMutation,
  useTurnProductionOnMutation,
  useTurnProductionOffMutation,
  useSetProductionLevelMutation,
  useSetElectricityPriceMutation,

  MeDocument, 
  OwnedDocument,
  OnlineDocument,
  MarketDataDocument,
  ManagerDataDocument,
  HasBlackoutDocument,
  ProsumerDataDocument,
  ProsumersDataDocument,
} from '../src/generated/graphql.ts'
import { isServer } from '../src/utils/isServer';
import { useRouter } from 'next/router';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { TextField } from 'formik-material-ui';
import { Field, Form, Formik } from 'formik';

// Combine polling queries
const { document: nohDocument } = combineQuery('nohPollingQuery')
  .add(OnlineDocument)
  .add(ManagerDataDocument)
  .add(MarketDataDocument)
  .add(HasBlackoutDocument)

const useStyles = makeStyles((theme) => ({
  item: {
    width: '100%',
    maxWidth: '185px'
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    overflow: 'hidden',
    maxWidth: '700px'
  },
  actionPaper: {
    margin: 'auto',
  },
  container: {
    maxHeight: '75vh',
  },
  hideLastBorder: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case 'toggle':
      let obj = {...state};
      obj[action.payload] = !obj[action.payload];
      return obj;
  }
}

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
                    {charge?.toFixed(3)}
                  </TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell>Capacity</TableCell>
                  <TableCell align="right">
                    {capacity?.toFixed(3)}
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
  charge: PropTypes.number,
  capacity: PropTypes.number,
};

const Admin = (ctx) => {
  const classes = useStyles();
  const router = useRouter();
  const apolloClient = useApolloClient();

  // Mutations
  const [deleteUser] = useDeleteUserMutation();
  const [banProducer] = useBanProducerMutation();
  const [setChargeRatio] = useSetChargeRatioMutation();
  const [setProductionLevel] = useSetProductionLevelMutation();
  const [setElectricityPrice] = useSetElectricityPriceMutation();

  // States
  // const [user, userDispatch] = React.useReducer(reducer, {});
  const [user, setUser] = React.useState(null);
  const [house, setHouse] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Queries
  const { data: meData, loading: meLoading } = useMeQuery({
    skip: isServer()
  });

  const skip = isServer() || meData?.me === undefined || meData?.me === null;

  const { data: oData, loading: oLoading } = useOwnedQuery({
    fetchPolicy: skip ? 'cache-only' : 'cache-and-network',
    skip: skip,
  });

  const { data: cData, loading: cLoading } = useQuery(nohDocument, {
    fetchPolicy: skip ? 'cache-only' : 'cache-and-network',
    skip: skip,
    pollInterval: 1000,
  });

  const { data: pdData, loading: pdLoading, startPolling: pdStart, stopPolling: pdStop, refetch: pdRefetch } = useProsumerDataQuery({
    variables: {
      id: house
    },
    fetchPolicy: skip ? 'cache-only' : 'cache-and-network',
    skip: skip || house === undefined || house === null,
    pollInterval: 1000,
  });

  if (meLoading) return null;
  if (isServer()) { // Serverside
    if (!meData?.me) return null; // If not signed in
    if (!meData?.me.type >= 2) return null; // If not admin
  }
  else { // Client side
    if (!meData?.me) {
      router.push("/login");
      return null;
    } // If not signed in
    if (!meData?.me.type >= 2) return null; // If not admin
  }

  // if (pLoading || pdLoading || oLoading || onLoading || mLoading || mdLoading) return null;
  if (oLoading || cLoading || pdLoading) {
    if (!oData || !cData) return null;
  }

  // Extract data from gql
  const owned = oData.users.map(usr=>usr.prosumerData);
  const rows = oData.users;
  const online = cData.online.map(usr=>usr._id);
  const mState = cData.managerState;
  const mdState = cData;
  const powerState = mState.productionStatus > 50;
  const pdState = pdData?.prosumerState;
  const bState = cData;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  }

  return (
    <Box sx={{ overflow: "hidden", mx: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
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
                  <TableCell align="right">{mdState.marketDemand.toFixed(0).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Current price</TableCell>
                  <TableCell align="right">{mdState.currentPrice.toFixed(3)}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Modeled price</TableCell>
                  <TableCell align="right">{mdState.modeledPrice.toFixed(3)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TableContainer component={Paper} className={clsx(classes.paper)}>
            <Typography variant="h6">
              Powerplant
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
                  <TableCell component="th" scope="row">Production status</TableCell>
                  <TableCell align="right">{mState.productionStatus === 100 ? "ON" : "OFF"}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Next production transition</TableCell>
                  <TableCell align="right">{(mState.nextProductionTransition / 1000).toFixed(3)}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Power production</TableCell>
                  <TableCell align="right">{mState.powerProduction.toFixed(3)}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Power consumption</TableCell>
                  <TableCell align="right">{mState.powerConsumption.toFixed(3)}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Net production</TableCell>
                  <TableCell align="right">{(mState.powerProduction - mState.powerConsumption).toFixed(3)}</TableCell>
                </TableRow>
                <TableRow className={clsx(classes.hideLastBorder)}>
                  <TableCell component="th" scope="row">Charge ratio</TableCell>
                  <TableCell align="right">{mState.chargeRatio.toFixed(3)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={12} lg={4}>
          <Paper className={clsx(classes.paper)}>
            <Typography variant="h6">
              Manage
            </Typography>
            <Grid container spacing={2} justifyContent="flex-start">
              <Grid item xs={12} sm={6}>
                <Paper elevation={4} className={clsx(classes.paper, classes.actionPaper)}>
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
              <Grid item xs={12} sm={6}>
                <Paper elevation={4} className={clsx(classes.paper, classes.actionPaper)}>
                  <Typography variant="h6" gutterBottom>
                    Set electricity price
                  </Typography>
                  <Formik
                    initialValues={{ price: 0 }}
                    onSubmit={async (values) => {
                      const response = await setElectricityPrice({
                        variables: {
                          price: values.price
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
                              name="price"
                              type="number"
                              label="Price"
                              inputProps={{ min: 0, max: 100, step: 0.1 }}
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
              <Grid item xs={12} sm={6}>
                <Paper elevation={4} className={clsx(classes.paper, classes.actionPaper)}>
                  <Button
                    variant="contained"
                    sx={{ height: 50 }}
                    disabled={powerState || mState.nextProductionTransition !== null}
                    onClick={async () => {
                      await setProductionLevel({
                        variables: {
                          percent: 100
                        }
                      });
                    }}
                  >
                    Turn on powerplant
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={4} className={clsx(classes.paper, classes.actionPaper)}>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ height: 50 }}
                    disabled={!powerState || mState.nextProductionTransition !== null}
                    onClick={async () => {
                      await setProductionLevel({
                        variables: {
                          percent: 0
                        }
                      });
                    }}
                  >
                    Turn off powerplant
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={clsx(classes.paper)}>
            <TableContainer className={clsx(classes.container)}>
              <Table stickyHeader className={clsx(classes.table)} aria-label="simple table">
                <TableHead>
                  <TableRow className={clsx(classes.hideLastBorder)}>
                    <TableCell>Prosumer</TableCell>
                    <TableCell>Online</TableCell>
                    <TableCell>Blackout</TableCell>
                    <TableCell>House</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    (rowsPerPage > 0
                      ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : rows
                    ).map((usr) => {
                      if (!usr) return null;
                      let hasHouse = usr.prosumerData.houseId !== undefined && usr.prosumerData.houseId !== null;
                      return (
                      <>
                        <TableRow key={usr._id + "1"}>
                          <TableCell>
                            <IconButton
                              aria-label="expand row"
                              size="small"
                              onClick={() => {
                                if (!user) {
                                  setUser(usr._id);
                                  if (hasHouse) {
                                    setHouse(usr.prosumerData.houseId);
                                  }
                                } else {
                                  setUser(null);
                                  setHouse(null);
                                }
                              }}
                              // onClick={() => userDispatch({ type: 'toggle', payload: usr._id })}
                            >
                              {user === usr._id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                            </IconButton>
                            {usr._id === meData.me._id ? usr.name + " (YOU)" : usr.name}
                          </TableCell>
                          <TableCell>
                            {online.includes(usr._id) ? "ONLINE" : "OFFLINE"}
                          </TableCell>
                          <TableCell>
                            {bState.hasBlackout[parseInt(usr.prosumerData.houseId)]?.blackout ? "BLACKOUT" : "No"}
                          </TableCell>
                          <TableCell>
                            {hasHouse ? "House " + usr.prosumerData.houseId : "No house"}
                          </TableCell>
                        </TableRow>
                        <TableRow key={usr._id + "2"} className={clsx(classes.hideLastBorder)}>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                            <Collapse in={user === usr._id} timeout='auto'>
                              <Table size="small" aria-label="battery">
                                <TableHead>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell>Stat</TableCell>
                                    <TableCell align="right">Data</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Banned</TableCell>
                                    <TableCell align="right">{hasHouse ? (pdState?.banned ? "BANNED" : "No") : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Banned</TableCell>
                                    <TableCell align="right">{hasHouse ? (pdState?.banDuration / 1000).toFixed(0) : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Blackout</TableCell>
                                    <TableCell align="right">{hasHouse ? (pdState?.blackout ? "BLACKOUT" : "No") : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Power production</TableCell>
                                    <TableCell align="right">{hasHouse ? pdState?.powerProduction.toFixed(3) : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Power consumption</TableCell>
                                    <TableCell align="right">{hasHouse ? pdState?.powerConsumption.toFixed(3) : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Net production</TableCell>
                                    <TableCell align="right">{hasHouse ? (pdState?.powerProduction - pdState?.powerConsumption).toFixed(3) : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Charge ratio</TableCell>
                                    <TableCell align="right">{hasHouse ? pdState?.chargeRatio.toFixed(3) : "No house"}</TableCell>
                                  </TableRow>
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell component="th" scope="row">Discharge ratio</TableCell>
                                    <TableCell align="right">{hasHouse ? pdState?.dischargeRatio.toFixed(3) : "No house"}</TableCell>
                                  </TableRow>
                                  {hasHouse ? (
                                    <BatteryRow charge={pdState?.battery.charge} capacity={pdState?.battery.capacity}/>
                                  ) : (
                                    <TableRow className={clsx(classes.hideLastBorder)}>
                                      <TableCell>Battery level</TableCell>
                                      <TableCell align="right">No house</TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow className={clsx(classes.hideLastBorder)}>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        color="secondary"
                                        className={clsx(classes.item)}
                                        onClick={async () => {
                                          await deleteUser({
                                            variables: {
                                              userId: usr._id,
                                            }
                                          });
                                          await apolloClient.resetStore();
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </TableCell>
                                    <Formik
                                      initialValues={{ duration: 0 }}
                                      onSubmit={async (values) => {
                                        const response = await banProducer({
                                          variables: {
                                            id: usr.prosumerData.houseId,
                                            duration: values.duration * 1000
                                          }
                                        });
                                      }}
                                    >
                                      {({ isSubmitting }) => (
                                        <>
                                          <TableCell>
                                            <Form id={usr._id + "_banform"}>
                                              <Field
                                                className={clsx(classes.item)}
                                                component={TextField}
                                                name="duration"
                                                type="number"
                                                label="Duration"
                                                inputProps={{ min: 10, max: 100, step: 1 }}
                                              />
                                            </Form>
                                          </TableCell>
                                          <TableCell>
                                            <LoadingButton
                                              variant="contained"
                                              color="secondary"
                                              className={clsx(classes.item)}
                                              form={usr._id + "_banform"}
                                              type="submit"
                                              pending={isSubmitting}
                                              sx={{ height: 50 }}
                                            >
                                              Ban
                                            </LoadingButton>
                                          </TableCell>
                                        </>
                                      )}
                                    </Formik>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    )})
                  }
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }} className={clsx(classes.hideLastBorder)}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow className={clsx(classes.hideLastBorder)}>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                      colSpan={4}
                      count={rows.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default withApollo({ssr: true})(Admin);