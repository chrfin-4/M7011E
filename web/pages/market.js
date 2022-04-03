import React from 'react'
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
  Button,
  Alert,
  Grid,
  Paper,
  TablePagination,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TableFooter,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useApolloClient } from '@apollo/client';

const useStyles = makeStyles((theme) => ({
  tableCell: {
    left: 'auto',
  },
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
  container: {
    maxHeight: '75vh',
  },
  hideLastBorder: {
    '& > *': {
      borderBottom: 'unset',
    },
  },
}));

const Market = ({}) => {
  if (isServer()) return null; // Only use client side rendering

  const classes = useStyles();
  const router = useRouter();
  const [purchase] = usePurchaseMutation();
  const [sell] = useSellMutation();
  const apolloClient = useApolloClient();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const { data: meData, loading: meLoading } = useMeQuery();

  const skip = meData?.me === undefined || meData?.me === null;

  // fetchPolicy needs to be set due to a bug in apolloclient where if
  // skip is set to a variable it won't work.
  const { data: oData, loading: oLoading } = useOwnedQuery({
    fetchPolicy: skip ? 'cache-only' : 'cache-and-network',
    skip: skip,
  })

  const { data: pData, loading: pLoading } = useProsumersQuery({
    fetchPolicy: skip ? 'cache-only' : 'cache-and-network',
    skip: skip,
  });

  console.log(meData);
  
  // Redirect if already signed in
  if (meLoading) return null;
  if (!meData?.me || meData.me === null) {
    router.push("/login");
    return null;
  } // If not signed in
  if (!meData?.me.type >= 1) return null; // If not prosumer
  if (pLoading || oLoading) return null;


  let body1 = null;

  let owned = oData.users.map(usr=>usr.prosumerData.houseId);
  const rows = pData.prosumerStates;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const houseId = meData.me?.prosumerData.houseId;
  const ow = meData.me?.prosumerData.houseId !== undefined && meData.me?.prosumerData.houseId !== null

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  }

  body1 = (
    <Paper className={clsx(classes.paper)}>
      <TableContainer className={clsx(classes.container)}>
        <Table stickyHeader className={clsx(classes.table)} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={clsx(classes.tableCell)}>
                Your house --&gt;
              </TableCell>
              <TableCell className={clsx(classes.tableCell)}>
                {ow ? "House " + houseId : "None Owned"}
              </TableCell>
              <TableCell className={clsx(classes.tableCell)}>
                <Button 
                  size="small"
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
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={clsx(classes.tableCell)} style={{ top: 81 }}>House</TableCell>
              <TableCell className={clsx(classes.tableCell)} style={{ top: 81 }}>Status</TableCell>
              <TableCell className={clsx(classes.tableCell)} style={{ top: 81 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              (rowsPerPage > 0
                ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : rows
              ).map((ps) => !ps ? null : (
                <TableRow key={ps.id}>
                  <TableCell>
                    House {ps.id}
                  </TableCell>
                  <TableCell>
                    {owned.includes(parseInt(ps.id)) ? "owned" : "free"}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained"
                      color="primary"
                      className={clsx(classes.item)}
                      id={"house"+ps.id}
                      disabled={owned.includes(parseInt(ps.id)) || meData.me?.prosumerData.houseId !== undefined && meData.me?.prosumerData.houseId !== null}
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
                  </TableCell>
                </TableRow>
              ))
            }
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className={clsx(classes.hideLastBorder)}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={3}
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
  )

  return (
    <Box sx={{ overflow: "hidden", mx: 1 }}>
      {
        meData.me?.prosumerData.houseId !== undefined && meData.me?.prosumerData.houseId !== null ? (
          <Alert severity="success" sx={{ maxWidth: '535px', mx: 'auto', mb: 4 }}>You are a house owner!</Alert>
        ) : (
          <Alert severity="warning" sx={{ maxWidth: '535px', mx: 'auto', mb: 4 }}>You don't own a house</Alert>
        )
      }
      <Grid container>
        <Grid item xs={12}>
          <Box>
            {body1}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Market;