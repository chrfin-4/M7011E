import { GraphQLClient } from 'graphql-request';
import { print } from 'graphql';
import { GraphQLError } from 'graphql-request/dist/types';
import { Headers } from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
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
  login: AuthData;
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


export type QueryLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type QueryProsumerStateArgs = {
  id: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createUser?: Maybe<User>;
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

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  password: Scalars['String'];
  type: Scalars['Int'];
  prosumerData?: Maybe<ProsumerData>;
  managerData?: Maybe<ManagerData>;
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

export type AuthData = {
  __typename?: 'AuthData';
  userId: Scalars['ID'];
  token: Scalars['String'];
  tokenExpiration: Scalars['Int'];
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

export type SigninQueryVariables = Exact<{ [key: string]: never; }>;


export type SigninQuery = (
  { __typename?: 'Query' }
  & { login: (
    { __typename?: 'AuthData' }
    & Pick<AuthData, 'userId' | 'token'>
  ) }
);


export const SigninDocument = gql`
    query Signin {
  login(email: "test", password: "pass") {
    userId
    token
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    Signin(variables?: SigninQueryVariables): Promise<{ data?: SigninQuery | undefined; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] | undefined; }> {
        return withWrapper(() => client.rawRequest<SigninQuery>(print(SigninDocument), variables));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;