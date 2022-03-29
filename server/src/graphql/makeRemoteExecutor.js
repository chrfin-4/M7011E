const originalFetch = require('cross-fetch');
const fetch = require('fetch-retry')(originalFetch);
const { print } = require('graphql');

// Builds a remote schema executor function,
// customize any way that you need (auth, headers, etc).
// Expects to receive an object with "document" and "variable" params,
// and asynchronously returns a JSON response from the remote.
module.exports = function makeRemoteExecutor(url) {
  return async ({ document, variables, context }) => {
    if (context && !context.res.req.session.userId) throw new Error('Unauthorized')

    const query = typeof document === 'string' ? document : print(document);
    const fetchResult = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      retryDelay: 1000,
      retries: 5
    });
    return fetchResult.json();
  };
};
