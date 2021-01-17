import { Container } from 'next/app';
import React from 'react'
import { withApollo } from "../src/utils/withApollo";

import { 
  useMeQuery, 
  useOwnedQuery,
  useSimDataQuery,
} from '../src/generated/graphql.ts'

import clsx from 'clsx';
import { 
  Box,
  Radio,
  FormControlLabel,
  Typography,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LoadingButton} from '@material-ui/lab';
import { useApolloClient } from '@apollo/client';
import { isServer } from '../src/utils/isServer';

const useStyles = makeStyles((theme) => ({

}));

const Stats = ({}) => {
  const classes = useStyles();
  const apolloClient = useApolloClient();
  const { data: meData, loading: meLoading } = useMeQuery({
    skip: isServer(),
  });

  const { data: simData, loading: simLoading } = useSimDataQuery({
    variables: { id: meData?.me.prosumerData.houseId },
    skip: meData === undefined,
    pollInterval: 1000,
  });

  let houseBody = null;
  let weatherBody = null;
  let marketBody = null;
  let manageBody = null;

  if (meLoading || simLoading) {
  } else if (meData?.me) {

    let hasHouse = meData.me.prosumerData.houseId !== undefined && meData.me.prosumerData.houseId !== null;
    houseBody = (
      <Box>
        HouseBody {simData.marketDemand}
      </Box>
    )
    weatherBody = (
      <Box>
        WeatherBody
      </Box>
    )
    marketBody = (
      <Box>
        MarketBody
      </Box>
    )
    manageBody = (
      <Box>
        ManageBody
      </Box>
    )
  }

  return (
    <Box>
      <Box>{houseBody}</Box>
      <Box>{weatherBody}</Box>
      <Box>{marketBody}</Box>
      <Box>{manageBody}</Box>
    </Box>
  )
};

export default withApollo({ ssr: true })(Stats);
