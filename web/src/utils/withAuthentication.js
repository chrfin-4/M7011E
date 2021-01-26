export const withAuthentication = (getServerSidePropsFn) => ctx => {
  const token = ctx.req.cookies?.qid;
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

export const withNoAuthentication = (getServerSidePropsFn) => ctx => {
  const token = ctx.req.cookies?.qid;
  if (token) {
    return {
      redirect: {
        permanent: false,
        destination: "/overview"
      }
    }
  }

  return getServerSidePropsFn({ token });
}