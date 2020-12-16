const User = require("../../models/user");

module.exports = {
  Query: {
    users: async (obj, args, context, info) => {
      if (!context.isAuth) {
        throw new Error('Unauthorized');
      }

      try {
        const users = await User.find();
        return users.map(user => {

        });
      } catch (err) {
        throw err;
      }
    },
    user: async (obj, args, context, info) => {
    },
  },
  Mutation: {
    createUser: async (obj, args, context, info) => {
    }
  }
}