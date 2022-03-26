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
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Query = {
  __typename?: 'Query';
  online: Array<User>;
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
  updateUser: UserResponse;
  deleteUser?: Maybe<Scalars['Boolean']>;
  login: UserResponse;
  logout?: Maybe<Scalars['Boolean']>;
  assignProsumer?: Maybe<Scalars['Boolean']>;
  unassignProsumer?: Maybe<Scalars['Boolean']>;
  setProfilePicture: UploadResponse;
  setChargeRatio: Prosumer;
  setDischargeRatio: Prosumer;
  banProducer: Prosumer;
  turnProductionOn: Prosumer;
  turnProductionOff: Prosumer;
  setProductionLevel: Prosumer;
  setElectricityPrice: Prosumer;
  startSimulation: Simulation;
  stopSimulation: Simulation;
  advanceBy: Simulation;
  setSimulationParameters: Simulation;
};


export type MutationCreateUserArgs = {
  userInput?: Maybe<UserInput>;
};


export type MutationUpdateUserArgs = {
  userId: Scalars['String'];
  userInput?: Maybe<UserInput>;
};


export type MutationDeleteUserArgs = {
  userId: Scalars['String'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationAssignProsumerArgs = {
  prosumerId: Scalars['Int'];
};


export type MutationSetProfilePictureArgs = {
  file: Scalars['Upload'];
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


export type MutationSetElectricityPriceArgs = {
  id: Scalars['ID'];
  price: Scalars['Float'];
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
  name: Scalars['String'];
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
  houseId?: Maybe<Scalars['Int']>;
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
  name: Scalars['String'];
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

export type File = {
  __typename?: 'File';
  filename: Scalars['String'];
  mimeype: Scalars['String'];
  encoding: Scalars['String'];
};

export type UploadResponse = {
  __typename?: 'UploadResponse';
  errors?: Maybe<Array<Maybe<FieldError>>>;
  file?: Maybe<File>;
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

export type BanProducerMutationVariables = Exact<{
  id: Scalars['ID'];
  duration: Scalars['Int'];
}>;


export type BanProducerMutation = (
  { __typename?: 'Mutation' }
  & { banProducer: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'banned'>
  ) }
);

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

export type DeleteUserMutationVariables = Exact<{
  userId: Scalars['String'];
}>;


export type DeleteUserMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteUser'>
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

export type PurchaseMutationVariables = Exact<{
  prosumerId: Scalars['Int'];
}>;


export type PurchaseMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'assignProsumer'>
);

export type SellMutationVariables = Exact<{ [key: string]: never; }>;


export type SellMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'unassignProsumer'>
);

export type SetChargeRatioMutationVariables = Exact<{
  id: Scalars['ID'];
  ratio: Scalars['Float'];
}>;


export type SetChargeRatioMutation = (
  { __typename?: 'Mutation' }
  & { setChargeRatio: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'id' | 'chargeRatio'>
  ) }
);

export type SetDischargeRatioMutationVariables = Exact<{
  id: Scalars['ID'];
  ratio: Scalars['Float'];
}>;


export type SetDischargeRatioMutation = (
  { __typename?: 'Mutation' }
  & { setDischargeRatio: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'id' | 'chargeRatio'>
  ) }
);

export type SetElectricityPriceMutationVariables = Exact<{
  price: Scalars['Float'];
}>;


export type SetElectricityPriceMutation = (
  { __typename?: 'Mutation' }
  & { setElectricityPrice: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'powerProduction'>
  ) }
);

export type SetProductionLevelMutationVariables = Exact<{
  percent: Scalars['Int'];
}>;


export type SetProductionLevelMutation = (
  { __typename?: 'Mutation' }
  & { setProductionLevel: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'id' | 'productionStatus' | 'nextProductionTransition'>
  ) }
);

export type SetProfilePictureMutationVariables = Exact<{
  file: Scalars['Upload'];
}>;


export type SetProfilePictureMutation = (
  { __typename?: 'Mutation' }
  & { setProfilePicture: (
    { __typename?: 'UploadResponse' }
    & { errors?: Maybe<Array<Maybe<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'field' | 'message'>
    )>>>, file?: Maybe<(
      { __typename?: 'File' }
      & Pick<File, 'filename' | 'mimeype' | 'encoding'>
    )> }
  ) }
);

export type TurnProductionOffMutationVariables = Exact<{ [key: string]: never; }>;


export type TurnProductionOffMutation = (
  { __typename?: 'Mutation' }
  & { turnProductionOff: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'powerProduction'>
  ) }
);

export type TurnProductionOnMutationVariables = Exact<{ [key: string]: never; }>;


export type TurnProductionOnMutation = (
  { __typename?: 'Mutation' }
  & { turnProductionOn: (
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'powerProduction'>
  ) }
);

export type UpdateUserMutationVariables = Exact<{
  userId: Scalars['String'];
  userInput?: Maybe<UserInput>;
}>;


export type UpdateUserMutation = (
  { __typename?: 'Mutation' }
  & { updateUser: (
    { __typename?: 'UserResponse' }
    & { errors?: Maybe<Array<Maybe<(
      { __typename?: 'FieldError' }
      & Pick<FieldError, 'field' | 'message'>
    )>>>, user?: Maybe<(
      { __typename?: 'User' }
      & Pick<User, '_id' | 'name' | 'email' | 'type'>
    )> }
  ) }
);

export type HasBlackoutQueryVariables = Exact<{ [key: string]: never; }>;


export type HasBlackoutQuery = (
  { __typename?: 'Query' }
  & { hasBlackout: Array<(
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'blackout'>
  )> }
);

export type ManagerDataQueryVariables = Exact<{ [key: string]: never; }>;


export type ManagerDataQuery = (
  { __typename?: 'Query' }
  & { managerState?: Maybe<(
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'powerConsumption' | 'powerProduction' | 'chargeRatio' | 'banned' | 'productionStatus' | 'nextProductionTransition'>
    & { battery?: Maybe<(
      { __typename?: 'Battery' }
      & Pick<Battery, 'charge' | 'capacity'>
    )> }
  )> }
);

export type MarketDataQueryVariables = Exact<{ [key: string]: never; }>;


export type MarketDataQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'marketDemand' | 'currentPrice' | 'modeledPrice'>
  & { weather: (
    { __typename?: 'Weather' }
    & Pick<Weather, 'windSpeed'>
  ) }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'User' }
    & Pick<User, '_id' | 'name' | 'email' | 'type'>
    & { prosumerData?: Maybe<(
      { __typename?: 'ProsumerData' }
      & Pick<ProsumerData, 'banned' | 'houseId'>
    )> }
  )> }
);

export type OnlineQueryVariables = Exact<{ [key: string]: never; }>;


export type OnlineQuery = (
  { __typename?: 'Query' }
  & { online: Array<(
    { __typename?: 'User' }
    & Pick<User, '_id'>
  )> }
);

export type OwnedQueryVariables = Exact<{ [key: string]: never; }>;


export type OwnedQuery = (
  { __typename?: 'Query' }
  & { users: Array<(
    { __typename?: 'User' }
    & Pick<User, '_id' | 'name' | 'email' | 'type'>
    & { prosumerData?: Maybe<(
      { __typename?: 'ProsumerData' }
      & Pick<ProsumerData, 'houseId' | 'banned'>
    )> }
  )> }
);

export type ProsumerDataQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ProsumerDataQuery = (
  { __typename?: 'Query' }
  & { prosumerState?: Maybe<(
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'powerConsumption' | 'powerProduction' | 'chargeRatio' | 'dischargeRatio' | 'banned' | 'banDuration' | 'blackout' | 'productionStatus' | 'nextProductionTransition'>
    & { battery?: Maybe<(
      { __typename?: 'Battery' }
      & Pick<Battery, 'charge' | 'capacity'>
    )> }
  )> }
);

export type ProsumersQueryVariables = Exact<{ [key: string]: never; }>;


export type ProsumersQuery = (
  { __typename?: 'Query' }
  & { prosumerStates: Array<(
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'id'>
  )> }
);

export type ProsumersDataQueryVariables = Exact<{ [key: string]: never; }>;


export type ProsumersDataQuery = (
  { __typename?: 'Query' }
  & { prosumerStates: Array<(
    { __typename?: 'Prosumer' }
    & Pick<Prosumer, 'powerConsumption' | 'powerProduction' | 'chargeRatio' | 'dischargeRatio' | 'banned' | 'blackout' | 'productionStatus' | 'nextProductionTransition'>
    & { battery?: Maybe<(
      { __typename?: 'Battery' }
      & Pick<Battery, 'charge' | 'capacity'>
    )> }
  )> }
);


export const BanProducerDocument = gql`
    mutation BanProducer($id: ID!, $duration: Int!) {
  banProducer(id: $id, duration: $duration) {
    banned
  }
}
    `;
export type BanProducerMutationFn = Apollo.MutationFunction<BanProducerMutation, BanProducerMutationVariables>;

/**
 * __useBanProducerMutation__
 *
 * To run a mutation, you first call `useBanProducerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBanProducerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [banProducerMutation, { data, loading, error }] = useBanProducerMutation({
 *   variables: {
 *      id: // value for 'id'
 *      duration: // value for 'duration'
 *   },
 * });
 */
export function useBanProducerMutation(baseOptions?: Apollo.MutationHookOptions<BanProducerMutation, BanProducerMutationVariables>) {
        return Apollo.useMutation<BanProducerMutation, BanProducerMutationVariables>(BanProducerDocument, baseOptions);
      }
export type BanProducerMutationHookResult = ReturnType<typeof useBanProducerMutation>;
export type BanProducerMutationResult = Apollo.MutationResult<BanProducerMutation>;
export type BanProducerMutationOptions = Apollo.BaseMutationOptions<BanProducerMutation, BanProducerMutationVariables>;
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
export const DeleteUserDocument = gql`
    mutation DeleteUser($userId: String!) {
  deleteUser(userId: $userId)
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, baseOptions);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
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
export const PurchaseDocument = gql`
    mutation Purchase($prosumerId: Int!) {
  assignProsumer(prosumerId: $prosumerId)
}
    `;
export type PurchaseMutationFn = Apollo.MutationFunction<PurchaseMutation, PurchaseMutationVariables>;

/**
 * __usePurchaseMutation__
 *
 * To run a mutation, you first call `usePurchaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePurchaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [purchaseMutation, { data, loading, error }] = usePurchaseMutation({
 *   variables: {
 *      prosumerId: // value for 'prosumerId'
 *   },
 * });
 */
export function usePurchaseMutation(baseOptions?: Apollo.MutationHookOptions<PurchaseMutation, PurchaseMutationVariables>) {
        return Apollo.useMutation<PurchaseMutation, PurchaseMutationVariables>(PurchaseDocument, baseOptions);
      }
export type PurchaseMutationHookResult = ReturnType<typeof usePurchaseMutation>;
export type PurchaseMutationResult = Apollo.MutationResult<PurchaseMutation>;
export type PurchaseMutationOptions = Apollo.BaseMutationOptions<PurchaseMutation, PurchaseMutationVariables>;
export const SellDocument = gql`
    mutation Sell {
  unassignProsumer
}
    `;
export type SellMutationFn = Apollo.MutationFunction<SellMutation, SellMutationVariables>;

/**
 * __useSellMutation__
 *
 * To run a mutation, you first call `useSellMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSellMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sellMutation, { data, loading, error }] = useSellMutation({
 *   variables: {
 *   },
 * });
 */
export function useSellMutation(baseOptions?: Apollo.MutationHookOptions<SellMutation, SellMutationVariables>) {
        return Apollo.useMutation<SellMutation, SellMutationVariables>(SellDocument, baseOptions);
      }
export type SellMutationHookResult = ReturnType<typeof useSellMutation>;
export type SellMutationResult = Apollo.MutationResult<SellMutation>;
export type SellMutationOptions = Apollo.BaseMutationOptions<SellMutation, SellMutationVariables>;
export const SetChargeRatioDocument = gql`
    mutation SetChargeRatio($id: ID!, $ratio: Float!) {
  setChargeRatio(id: $id, ratio: $ratio) {
    id
    chargeRatio
  }
}
    `;
export type SetChargeRatioMutationFn = Apollo.MutationFunction<SetChargeRatioMutation, SetChargeRatioMutationVariables>;

/**
 * __useSetChargeRatioMutation__
 *
 * To run a mutation, you first call `useSetChargeRatioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetChargeRatioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setChargeRatioMutation, { data, loading, error }] = useSetChargeRatioMutation({
 *   variables: {
 *      id: // value for 'id'
 *      ratio: // value for 'ratio'
 *   },
 * });
 */
export function useSetChargeRatioMutation(baseOptions?: Apollo.MutationHookOptions<SetChargeRatioMutation, SetChargeRatioMutationVariables>) {
        return Apollo.useMutation<SetChargeRatioMutation, SetChargeRatioMutationVariables>(SetChargeRatioDocument, baseOptions);
      }
export type SetChargeRatioMutationHookResult = ReturnType<typeof useSetChargeRatioMutation>;
export type SetChargeRatioMutationResult = Apollo.MutationResult<SetChargeRatioMutation>;
export type SetChargeRatioMutationOptions = Apollo.BaseMutationOptions<SetChargeRatioMutation, SetChargeRatioMutationVariables>;
export const SetDischargeRatioDocument = gql`
    mutation SetDischargeRatio($id: ID!, $ratio: Float!) {
  setDischargeRatio(id: $id, ratio: $ratio) {
    id
    chargeRatio
  }
}
    `;
export type SetDischargeRatioMutationFn = Apollo.MutationFunction<SetDischargeRatioMutation, SetDischargeRatioMutationVariables>;

/**
 * __useSetDischargeRatioMutation__
 *
 * To run a mutation, you first call `useSetDischargeRatioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetDischargeRatioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setDischargeRatioMutation, { data, loading, error }] = useSetDischargeRatioMutation({
 *   variables: {
 *      id: // value for 'id'
 *      ratio: // value for 'ratio'
 *   },
 * });
 */
export function useSetDischargeRatioMutation(baseOptions?: Apollo.MutationHookOptions<SetDischargeRatioMutation, SetDischargeRatioMutationVariables>) {
        return Apollo.useMutation<SetDischargeRatioMutation, SetDischargeRatioMutationVariables>(SetDischargeRatioDocument, baseOptions);
      }
export type SetDischargeRatioMutationHookResult = ReturnType<typeof useSetDischargeRatioMutation>;
export type SetDischargeRatioMutationResult = Apollo.MutationResult<SetDischargeRatioMutation>;
export type SetDischargeRatioMutationOptions = Apollo.BaseMutationOptions<SetDischargeRatioMutation, SetDischargeRatioMutationVariables>;
export const SetElectricityPriceDocument = gql`
    mutation setElectricityPrice($price: Float!) {
  setElectricityPrice(id: -1, price: $price) {
    powerProduction
  }
}
    `;
export type SetElectricityPriceMutationFn = Apollo.MutationFunction<SetElectricityPriceMutation, SetElectricityPriceMutationVariables>;

/**
 * __useSetElectricityPriceMutation__
 *
 * To run a mutation, you first call `useSetElectricityPriceMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetElectricityPriceMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setElectricityPriceMutation, { data, loading, error }] = useSetElectricityPriceMutation({
 *   variables: {
 *      price: // value for 'price'
 *   },
 * });
 */
export function useSetElectricityPriceMutation(baseOptions?: Apollo.MutationHookOptions<SetElectricityPriceMutation, SetElectricityPriceMutationVariables>) {
        return Apollo.useMutation<SetElectricityPriceMutation, SetElectricityPriceMutationVariables>(SetElectricityPriceDocument, baseOptions);
      }
export type SetElectricityPriceMutationHookResult = ReturnType<typeof useSetElectricityPriceMutation>;
export type SetElectricityPriceMutationResult = Apollo.MutationResult<SetElectricityPriceMutation>;
export type SetElectricityPriceMutationOptions = Apollo.BaseMutationOptions<SetElectricityPriceMutation, SetElectricityPriceMutationVariables>;
export const SetProductionLevelDocument = gql`
    mutation SetProductionLevel($percent: Int!) {
  setProductionLevel(id: -1, percent: $percent) {
    id
    productionStatus
    nextProductionTransition
  }
}
    `;
export type SetProductionLevelMutationFn = Apollo.MutationFunction<SetProductionLevelMutation, SetProductionLevelMutationVariables>;

/**
 * __useSetProductionLevelMutation__
 *
 * To run a mutation, you first call `useSetProductionLevelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetProductionLevelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setProductionLevelMutation, { data, loading, error }] = useSetProductionLevelMutation({
 *   variables: {
 *      percent: // value for 'percent'
 *   },
 * });
 */
export function useSetProductionLevelMutation(baseOptions?: Apollo.MutationHookOptions<SetProductionLevelMutation, SetProductionLevelMutationVariables>) {
        return Apollo.useMutation<SetProductionLevelMutation, SetProductionLevelMutationVariables>(SetProductionLevelDocument, baseOptions);
      }
export type SetProductionLevelMutationHookResult = ReturnType<typeof useSetProductionLevelMutation>;
export type SetProductionLevelMutationResult = Apollo.MutationResult<SetProductionLevelMutation>;
export type SetProductionLevelMutationOptions = Apollo.BaseMutationOptions<SetProductionLevelMutation, SetProductionLevelMutationVariables>;
export const SetProfilePictureDocument = gql`
    mutation SetProfilePicture($file: Upload!) {
  setProfilePicture(file: $file) {
    errors {
      field
      message
    }
    file {
      filename
      mimeype
      encoding
    }
  }
}
    `;
export type SetProfilePictureMutationFn = Apollo.MutationFunction<SetProfilePictureMutation, SetProfilePictureMutationVariables>;

/**
 * __useSetProfilePictureMutation__
 *
 * To run a mutation, you first call `useSetProfilePictureMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetProfilePictureMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setProfilePictureMutation, { data, loading, error }] = useSetProfilePictureMutation({
 *   variables: {
 *      file: // value for 'file'
 *   },
 * });
 */
export function useSetProfilePictureMutation(baseOptions?: Apollo.MutationHookOptions<SetProfilePictureMutation, SetProfilePictureMutationVariables>) {
        return Apollo.useMutation<SetProfilePictureMutation, SetProfilePictureMutationVariables>(SetProfilePictureDocument, baseOptions);
      }
export type SetProfilePictureMutationHookResult = ReturnType<typeof useSetProfilePictureMutation>;
export type SetProfilePictureMutationResult = Apollo.MutationResult<SetProfilePictureMutation>;
export type SetProfilePictureMutationOptions = Apollo.BaseMutationOptions<SetProfilePictureMutation, SetProfilePictureMutationVariables>;
export const TurnProductionOffDocument = gql`
    mutation TurnProductionOff {
  turnProductionOff(id: -1) {
    powerProduction
  }
}
    `;
export type TurnProductionOffMutationFn = Apollo.MutationFunction<TurnProductionOffMutation, TurnProductionOffMutationVariables>;

/**
 * __useTurnProductionOffMutation__
 *
 * To run a mutation, you first call `useTurnProductionOffMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTurnProductionOffMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [turnProductionOffMutation, { data, loading, error }] = useTurnProductionOffMutation({
 *   variables: {
 *   },
 * });
 */
export function useTurnProductionOffMutation(baseOptions?: Apollo.MutationHookOptions<TurnProductionOffMutation, TurnProductionOffMutationVariables>) {
        return Apollo.useMutation<TurnProductionOffMutation, TurnProductionOffMutationVariables>(TurnProductionOffDocument, baseOptions);
      }
export type TurnProductionOffMutationHookResult = ReturnType<typeof useTurnProductionOffMutation>;
export type TurnProductionOffMutationResult = Apollo.MutationResult<TurnProductionOffMutation>;
export type TurnProductionOffMutationOptions = Apollo.BaseMutationOptions<TurnProductionOffMutation, TurnProductionOffMutationVariables>;
export const TurnProductionOnDocument = gql`
    mutation TurnProductionOn {
  turnProductionOn(id: -1) {
    powerProduction
  }
}
    `;
export type TurnProductionOnMutationFn = Apollo.MutationFunction<TurnProductionOnMutation, TurnProductionOnMutationVariables>;

/**
 * __useTurnProductionOnMutation__
 *
 * To run a mutation, you first call `useTurnProductionOnMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTurnProductionOnMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [turnProductionOnMutation, { data, loading, error }] = useTurnProductionOnMutation({
 *   variables: {
 *   },
 * });
 */
export function useTurnProductionOnMutation(baseOptions?: Apollo.MutationHookOptions<TurnProductionOnMutation, TurnProductionOnMutationVariables>) {
        return Apollo.useMutation<TurnProductionOnMutation, TurnProductionOnMutationVariables>(TurnProductionOnDocument, baseOptions);
      }
export type TurnProductionOnMutationHookResult = ReturnType<typeof useTurnProductionOnMutation>;
export type TurnProductionOnMutationResult = Apollo.MutationResult<TurnProductionOnMutation>;
export type TurnProductionOnMutationOptions = Apollo.BaseMutationOptions<TurnProductionOnMutation, TurnProductionOnMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($userId: String!, $userInput: UserInput) {
  updateUser(userId: $userId, userInput: $userInput) {
    errors {
      field
      message
    }
    user {
      _id
      name
      email
      type
    }
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      userInput: // value for 'userInput'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, baseOptions);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const HasBlackoutDocument = gql`
    query HasBlackout {
  hasBlackout: prosumerStates {
    blackout
  }
}
    `;

/**
 * __useHasBlackoutQuery__
 *
 * To run a query within a React component, call `useHasBlackoutQuery` and pass it any options that fit your needs.
 * When your component renders, `useHasBlackoutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHasBlackoutQuery({
 *   variables: {
 *   },
 * });
 */
export function useHasBlackoutQuery(baseOptions?: Apollo.QueryHookOptions<HasBlackoutQuery, HasBlackoutQueryVariables>) {
        return Apollo.useQuery<HasBlackoutQuery, HasBlackoutQueryVariables>(HasBlackoutDocument, baseOptions);
      }
export function useHasBlackoutLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<HasBlackoutQuery, HasBlackoutQueryVariables>) {
          return Apollo.useLazyQuery<HasBlackoutQuery, HasBlackoutQueryVariables>(HasBlackoutDocument, baseOptions);
        }
export type HasBlackoutQueryHookResult = ReturnType<typeof useHasBlackoutQuery>;
export type HasBlackoutLazyQueryHookResult = ReturnType<typeof useHasBlackoutLazyQuery>;
export type HasBlackoutQueryResult = Apollo.QueryResult<HasBlackoutQuery, HasBlackoutQueryVariables>;
export const ManagerDataDocument = gql`
    query ManagerData {
  managerState: prosumerState(id: -1) {
    powerConsumption
    powerProduction
    chargeRatio
    banned
    productionStatus
    nextProductionTransition
    battery {
      charge
      capacity
    }
  }
}
    `;

/**
 * __useManagerDataQuery__
 *
 * To run a query within a React component, call `useManagerDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useManagerDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useManagerDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useManagerDataQuery(baseOptions?: Apollo.QueryHookOptions<ManagerDataQuery, ManagerDataQueryVariables>) {
        return Apollo.useQuery<ManagerDataQuery, ManagerDataQueryVariables>(ManagerDataDocument, baseOptions);
      }
export function useManagerDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ManagerDataQuery, ManagerDataQueryVariables>) {
          return Apollo.useLazyQuery<ManagerDataQuery, ManagerDataQueryVariables>(ManagerDataDocument, baseOptions);
        }
export type ManagerDataQueryHookResult = ReturnType<typeof useManagerDataQuery>;
export type ManagerDataLazyQueryHookResult = ReturnType<typeof useManagerDataLazyQuery>;
export type ManagerDataQueryResult = Apollo.QueryResult<ManagerDataQuery, ManagerDataQueryVariables>;
export const MarketDataDocument = gql`
    query MarketData {
  weather {
    windSpeed
  }
  marketDemand
  currentPrice
  modeledPrice
}
    `;

/**
 * __useMarketDataQuery__
 *
 * To run a query within a React component, call `useMarketDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useMarketDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMarketDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useMarketDataQuery(baseOptions?: Apollo.QueryHookOptions<MarketDataQuery, MarketDataQueryVariables>) {
        return Apollo.useQuery<MarketDataQuery, MarketDataQueryVariables>(MarketDataDocument, baseOptions);
      }
export function useMarketDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MarketDataQuery, MarketDataQueryVariables>) {
          return Apollo.useLazyQuery<MarketDataQuery, MarketDataQueryVariables>(MarketDataDocument, baseOptions);
        }
export type MarketDataQueryHookResult = ReturnType<typeof useMarketDataQuery>;
export type MarketDataLazyQueryHookResult = ReturnType<typeof useMarketDataLazyQuery>;
export type MarketDataQueryResult = Apollo.QueryResult<MarketDataQuery, MarketDataQueryVariables>;
export const MeDocument = gql`
    query Me {
  me {
    _id
    name
    email
    type
    prosumerData {
      banned
      houseId
    }
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
export const OnlineDocument = gql`
    query Online {
  online {
    _id
  }
}
    `;

/**
 * __useOnlineQuery__
 *
 * To run a query within a React component, call `useOnlineQuery` and pass it any options that fit your needs.
 * When your component renders, `useOnlineQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnlineQuery({
 *   variables: {
 *   },
 * });
 */
export function useOnlineQuery(baseOptions?: Apollo.QueryHookOptions<OnlineQuery, OnlineQueryVariables>) {
        return Apollo.useQuery<OnlineQuery, OnlineQueryVariables>(OnlineDocument, baseOptions);
      }
export function useOnlineLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OnlineQuery, OnlineQueryVariables>) {
          return Apollo.useLazyQuery<OnlineQuery, OnlineQueryVariables>(OnlineDocument, baseOptions);
        }
export type OnlineQueryHookResult = ReturnType<typeof useOnlineQuery>;
export type OnlineLazyQueryHookResult = ReturnType<typeof useOnlineLazyQuery>;
export type OnlineQueryResult = Apollo.QueryResult<OnlineQuery, OnlineQueryVariables>;
export const OwnedDocument = gql`
    query Owned {
  users {
    _id
    name
    email
    type
    prosumerData {
      houseId
      banned
    }
  }
}
    `;

/**
 * __useOwnedQuery__
 *
 * To run a query within a React component, call `useOwnedQuery` and pass it any options that fit your needs.
 * When your component renders, `useOwnedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOwnedQuery({
 *   variables: {
 *   },
 * });
 */
export function useOwnedQuery(baseOptions?: Apollo.QueryHookOptions<OwnedQuery, OwnedQueryVariables>) {
        return Apollo.useQuery<OwnedQuery, OwnedQueryVariables>(OwnedDocument, baseOptions);
      }
export function useOwnedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OwnedQuery, OwnedQueryVariables>) {
          return Apollo.useLazyQuery<OwnedQuery, OwnedQueryVariables>(OwnedDocument, baseOptions);
        }
export type OwnedQueryHookResult = ReturnType<typeof useOwnedQuery>;
export type OwnedLazyQueryHookResult = ReturnType<typeof useOwnedLazyQuery>;
export type OwnedQueryResult = Apollo.QueryResult<OwnedQuery, OwnedQueryVariables>;
export const ProsumerDataDocument = gql`
    query ProsumerData($id: ID!) {
  prosumerState(id: $id) {
    powerConsumption
    powerProduction
    chargeRatio
    dischargeRatio
    banned
    banDuration
    blackout
    productionStatus
    nextProductionTransition
    battery {
      charge
      capacity
    }
  }
}
    `;

/**
 * __useProsumerDataQuery__
 *
 * To run a query within a React component, call `useProsumerDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useProsumerDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProsumerDataQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProsumerDataQuery(baseOptions: Apollo.QueryHookOptions<ProsumerDataQuery, ProsumerDataQueryVariables>) {
        return Apollo.useQuery<ProsumerDataQuery, ProsumerDataQueryVariables>(ProsumerDataDocument, baseOptions);
      }
export function useProsumerDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProsumerDataQuery, ProsumerDataQueryVariables>) {
          return Apollo.useLazyQuery<ProsumerDataQuery, ProsumerDataQueryVariables>(ProsumerDataDocument, baseOptions);
        }
export type ProsumerDataQueryHookResult = ReturnType<typeof useProsumerDataQuery>;
export type ProsumerDataLazyQueryHookResult = ReturnType<typeof useProsumerDataLazyQuery>;
export type ProsumerDataQueryResult = Apollo.QueryResult<ProsumerDataQuery, ProsumerDataQueryVariables>;
export const ProsumersDocument = gql`
    query Prosumers {
  prosumerStates {
    id
  }
}
    `;

/**
 * __useProsumersQuery__
 *
 * To run a query within a React component, call `useProsumersQuery` and pass it any options that fit your needs.
 * When your component renders, `useProsumersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProsumersQuery({
 *   variables: {
 *   },
 * });
 */
export function useProsumersQuery(baseOptions?: Apollo.QueryHookOptions<ProsumersQuery, ProsumersQueryVariables>) {
        return Apollo.useQuery<ProsumersQuery, ProsumersQueryVariables>(ProsumersDocument, baseOptions);
      }
export function useProsumersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProsumersQuery, ProsumersQueryVariables>) {
          return Apollo.useLazyQuery<ProsumersQuery, ProsumersQueryVariables>(ProsumersDocument, baseOptions);
        }
export type ProsumersQueryHookResult = ReturnType<typeof useProsumersQuery>;
export type ProsumersLazyQueryHookResult = ReturnType<typeof useProsumersLazyQuery>;
export type ProsumersQueryResult = Apollo.QueryResult<ProsumersQuery, ProsumersQueryVariables>;
export const ProsumersDataDocument = gql`
    query ProsumersData {
  prosumerStates {
    powerConsumption
    powerProduction
    chargeRatio
    dischargeRatio
    banned
    blackout
    productionStatus
    nextProductionTransition
    battery {
      charge
      capacity
    }
  }
}
    `;

/**
 * __useProsumersDataQuery__
 *
 * To run a query within a React component, call `useProsumersDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useProsumersDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProsumersDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useProsumersDataQuery(baseOptions?: Apollo.QueryHookOptions<ProsumersDataQuery, ProsumersDataQueryVariables>) {
        return Apollo.useQuery<ProsumersDataQuery, ProsumersDataQueryVariables>(ProsumersDataDocument, baseOptions);
      }
export function useProsumersDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProsumersDataQuery, ProsumersDataQueryVariables>) {
          return Apollo.useLazyQuery<ProsumersDataQuery, ProsumersDataQueryVariables>(ProsumersDataDocument, baseOptions);
        }
export type ProsumersDataQueryHookResult = ReturnType<typeof useProsumersDataQuery>;
export type ProsumersDataLazyQueryHookResult = ReturnType<typeof useProsumersDataLazyQuery>;
export type ProsumersDataQueryResult = Apollo.QueryResult<ProsumersDataQuery, ProsumersDataQueryVariables>;