import {useMeQuery} from '../src/generated/graphql.ts'


export const withAuthentication = (getServerSidePropsFn) => ctx => {
  const token = ctx.req.cookies?.token;
  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: "/login"
      }
    }
  }

  return getServerSidePropsFn({ token });
}
