import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  users: Array<User>;
  user?: Maybe<User>;
  me?: Maybe<User>;
  prosumerStates: Array<Prosumer>;
  prosumerState?: Maybe<Prosumer>;
  weather: Weather;
  marketDemand: Scalars['Float'];
  currentPrice: Scalars['Float'];
  modeledPrice?: Maybe<Scalars['Float']>;
  simulation?: Maybe<Simulation>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryProsumerStateArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser: UserResponse;
  login: UserResponse;
  logout?: Maybe<Scalars['Boolean']>;
  setChargeRatio: Prosumer;
  setDischargeRatio: Prosumer;
  banProducer: Prosumer;
  turnProductionOn: Prosumer;
  turnProductionOff: Prosumer;
  setProductionLevel: Prosumer;
  startSimulation: Simulation;
  stopSimulation: Simulation;
  advanceBy: Simulation;
  setSimulationParameters: Simulation;
};


export type MutationCreateUserArgs = {
  userInput?: Maybe<UserInput>;
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationSetChargeRatioArgs = {
  id: Scalars['ID'];
  ratio: Scalars['Float'];
};


export type MutationSetDischargeRatioArgs = {
  id: Scalars['ID'];
  ratio: Scalars['Float'];
};


export type MutationBanProducerArgs = {
  id: Scalars['ID'];
  duration: Scalars['Int'];
};


export type MutationTurnProductionOnArgs = {
  id: Scalars['ID'];
};


export type MutationTurnProductionOffArgs = {
  id: Scalars['ID'];
};


export type MutationSetProductionLevelArgs = {
  id: Scalars['ID'];
  percent: Scalars['Int'];
};


export type MutationStartSimulationArgs = {
  interval?: Maybe<Scalars['Int']>;
  speed?: Maybe<Scalars['Float']>;
};


export type MutationAdvanceByArgs = {
  interval: Scalars['Int'];
  steps?: Maybe<Scalars['Int']>;
};


export type MutationSetSimulationParametersArgs = {
  interval?: Maybe<Scalars['Int']>;
  speed?: Maybe<Scalars['Float']>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  _id?: Maybe<Scalars['ID']>;
  email: Scalars['String'];
  password?: Maybe<Scalars['String']>;
  type: Scalars['Int'];
  prosumerData?: Maybe<ProsumerData>;
  managerData?: Maybe<ManagerData>;
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<Maybe<FieldError>>>;
  user?: Maybe<User>;
};

export type ProsumerData = {
  __typename?: 'ProsumerData';
  banned: Scalars['Boolean'];
  houseId: Scalars['Int'];
};

export type ManagerData = {
  __typename?: 'ManagerData';
  powerplants?: Maybe<Array<Powerplant>>;
};

export type Powerplant = {
  __typename?: 'Powerplant';
  powerplantId: Scalars['String'];
  name: Scalars['String'];
};

export type UserInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  type: Scalars['String'];
  prosumerData?: Maybe<ProsumerInput>;
  managerData?: Maybe<PowerplantInput>;
};

export type ProsumerInput = {
  banned?: Maybe<Scalars['Boolean']>;
  houseId: Scalars['Int'];
};

export type PowerplantInput = {
  powerplandId: Scalars['String'];
  name: Scalars['String'];
};

export type Prosumer = {
  __typename?: 'Prosumer';
  id: Scalars['ID'];
  powerConsumption: Scalars['Float'];
  powerProduction: Scalars['Float'];
  chargeRatio: Scalars['Float'];
  dischargeRatio: Scalars['Float'];
  banned?: Maybe<Scalars['Boolean']>;
  banDuration?: Maybe<Scalars['Int']>;
  blackout: Scalars['Boolean'];
  productionStatus: Scalars['Int'];
  nextProductionTransition?: Maybe<Scalars['Float']>;
  battery?: Maybe<Battery>;
};

export type Battery = {
  __typename?: 'Battery';
  charge: Scalars['Float'];
  capacity: Scalars['Float'];
};

export type Weather = {
  __typename?: 'Weather';
  windSpeed: Scalars['Float'];
};

export type Simulation = {
  __typename?: 'Simulation';
  time: Scalars['String'];
  startTime: Scalars['String'];
  duration: Scalars['Int'];
  updateInterval: Scalars['Int'];
  speed: Scalars['Float'];
  running: Scalars['Boolean'];
  prosumers: Scalars['Int'];
};

export type CreateUserMutationVariables = Exact<{
  userInput?: Maybe<UserInput>;
}>;


export type CreateUserMutation = (
  { __typename?: 'Mutation' }
  & { createUser: (
    { __typename?: 'UserResponse' }
    & { errors?: Maybe<Array<Maybe<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'field' | 'message'>
    )>>>, user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, '_id' | 'email'>
    )> }
  ) }
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'UserResponse' }
    & { errors?: Maybe<Array<Maybe<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'field' | 'message'>
    )>>>, user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, '_id' | 'email'>
    )> }
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, '_id' | 'email' | 'type'>
  )> }
);


export const CreateUserDocument = gql`
    mutation CreateUser($userInput: UserInput) {
  createUser(userInput: $userInput) {
    errors {
      field
      message
    }
    user {
      _id
      email
    }
  }
}
    `;
export type CreateUserMutationFn = Apollo.MutationFunction<CreateUserMutation, CreateUserMutationVariables>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      userInput: // value for 'userInput'
 *   },
 * });
 */
export function useCreateUserMutation(baseOptions?: Apollo.MutationHookOptions<CreateUserMutation, CreateUserMutationVariables>) {
        return Apollo.useMutation<CreateUserMutation, CreateUserMutationVariables>(CreateUserDocument, baseOptions);
      }
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<CreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<CreateUserMutation, CreateUserMutationVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    errors {
      field
      message
    }
    user {
      _id
      email
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    _id
    email
    type
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;