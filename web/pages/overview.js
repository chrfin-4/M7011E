import React from 'react'
import { withApollo } from "../src/utils/withApollo";
import { isServer } from '../src/utils/isServer';
import { useRouter } from 'next/router';

import { 
  useMeQuery, 
  useOwnedQuery,
  useProsumersQuery, 
  useSellMutation,
  usePurchaseMutation,
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

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  wrapper: {
    width: '100%',
    height: '80vh',
    overflowY: 'auto',
    marginTop: 8,
    '&::-webkit-scrollbar': {
      width: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    }
  },
  formField: {
    marginTop: 8
  },
  itemContainer: {
    // width: '30%',
  },
  item: {
    height: 48,
    padding: '0 30px',
    width: '100%'
  },
  cnt: {
    display: 'grid', 
    gap: 8, 
    gridTemplateColumns: 'repeat(3, 1fr)',
    marginRight: '3px',
    marginLeft: '3px'
  }
}));

const Overview = ({}) => {
  const classes = useStyles();
  const router = useRouter();
  const [purchase] = usePurchaseMutation();
  const [sell] = useSellMutation();
  const apolloClient = useApolloClient();

  const { data, loading } = useMeQuery({
    skip: isServer(),
  });
  let skip = isServer() || data?.me == undefined || data?.me == null;

  const { data: oData, loading: oLoading } = useOwnedQuery({
    fetchPolicy: skip ? 'cache-only' : 'cache-and-network',
    skip: skip,
  })

  const { data: pData, loading: pLoading } = useProsumersQuery({
    skip: skip,
  });

  // Redirect if already signed in
  if (loading || !data?.me && isServer()) return null;
  else if (!data?.me && !isServer()) router.push("/login");

  let body1 = null;
  let body2 = null;

  if (pLoading || oLoading) {
  } else if(pData?.prosumerStates && oData?.users) {
    let owned = oData.users.map(usr=>usr.prosumerData.houseId);
    body1 = (
      <Box className={clsx(classes.wrapper)}>
        <Box className={clsx(classes.cnt)}>
          {
            pData.prosumerStates.map((ps) => !ps ? null : (
              <Box key={ps.id} className={clsx(classes.itemContainer)}>
                <Card>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      House
                    </Typography>
                    <Typography variant="h5" component="div">
                      House {ps.id}
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                      Status: {owned.includes(parseInt(ps.id)) ? "owned" : "free"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      sx={{ mb: 1 }}
                      variant="contained"
                      color="primary"
                      className={clsx(classes.item)}
                      id={"house"+ps.id}
                      disabled={owned.includes(parseInt(ps.id)) || data.me?.prosumerData.houseId !== undefined && data.me?.prosumerData.houseId !== null}
                      onClick={async () => {
                        if (owned.includes(parseInt(ps.id))) {
                        } else {
                          await purchase({
                            variables: {
                              prosumerId: parseInt(ps.id)
                            }
                          });
                          await apolloClient.resetStore();
                        }
                      }}
                    >
                      {owned.includes(parseInt(ps.id)) ? "Owned" : "Buy"}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))
          }
        </Box>
      </Box>
    )

    const houseId = data.me?.prosumerData.houseId;
    const ow = data.me?.prosumerData.houseId !== undefined && data.me?.prosumerData.houseId !== null
    body2 = (
      <Box sx={{ mx: 'auto', width: '30%'}}>
        <Card>
          <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              House
            </Typography>
            <Typography variant="h5" component="div">
              {ow ? "House " + houseId : "None Owned"}
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              sx={{ mb: 1 }}
              variant="contained"
              color="secondary"
              className={clsx(classes.item)}
              disabled={!ow}
              onClick={async () => {
                await sell();
                await apolloClient.resetStore();
              }}
            >
              Sell
            </Button>
          </CardActions>
        </Card>
      </Box>
    )
  }


  return (
    <Box>
      {
        data.me?.prosumerData.houseId !== undefined && data.me?.prosumerData.houseId !== null ? (
          <Alert severity="success" sx={{width: '30%', mx: 'auto', mb: 4 }}>You are a house owner!</Alert>
        ) : (
          <Alert severity="warning" sx={{width: '30%', mx: 'auto', mb: 4 }}>You don't own a house</Alert>
        )
      }
      <Grid container>
        <Grid item xs={6}>
          <Box>
            {body1}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box>
            {body2}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default withApollo({ ssr: true })(Overview);