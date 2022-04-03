const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');

function assertIsSignedIn(request) {
  if (!request.session.userId) {
    throw new AuthenticationError();
  }
}

function assertIsAuth(request) {
  if (!request.session.userType >= 2) {
    throw new ForbiddenError();
  }
}

module.exports = {
  assertIsAuth,
  assertIsSignedIn
}