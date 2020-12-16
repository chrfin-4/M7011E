const user = require("../../models/user");

module.exports = {
  Query: {
    users: (_) => {
      return 34;
    },
    user(_, id) {
      return {
        email: "test@test.com",
        authkey: "123password",
        type: 2
      }
    },
  },
  Mutation: {
    createUser: (_, user) => {
    }
  }
}