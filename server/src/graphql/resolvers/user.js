const User = require("../../models/user");

function assertIsAuth(context) {
  if (!context.req.session.userId) {
    throw new Error('Unauthorized');
  }
}

module.exports = {
  Query: {
    users: async (_, args, context) => {
      assertIsAuth(context);
      return await User.find();
    },
    user: async (_, {id}, context) => {
      assertIsAuth(context);
      return await User.findById(id);
    },
  },
}
