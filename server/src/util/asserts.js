function assertIsSignedIn(request) {
  if (!request.session.userId) {
    throw new Error('Unauthorized');
  }
}

function assertIsAuth(request) {
  if (!request.session.userType >= 2) {
    throw new Error('Unauthorized');
  }
}

module.exports = {
  assertIsAuth,
  assertIsSignedIn
}