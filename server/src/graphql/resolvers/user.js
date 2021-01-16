const User = require("../../models/user");

function assertIsSignedIn(context) {
  if (!context.req.session.userId) {
    throw new Error('Unauthorized');
  }
}

function assertIsAuth(context) {
  if (context.req.session.userType !== 2) {
    throw new Error('Unauthorized');
  }
}

module.exports = {
  Query: {
    users: async (_, args, context) => {
      assertIsSignedIn(context);
      // assertIsAuth(context);
      const result = await User.find();
      return result.map((e) => {
        e.password = null;
        return e;
      });
    },
    user: async (_, {id}, context) => {
      assertIsSignedIn(context);
      // assertIsAuth(context);
      const result = await User.findById(id);
      result.password = null;
      return result;
    },
    me: async (_, args, context) => {
      if (!context.req.session.userId) {
        return null;
      }
      return await User.findById(context.req.session.userId);
    }
  },
  Mutation: {
    assignProsumer: async(_, {prosumerId}, context) => {
      assertIsSignedIn(context);
      const user = await User.findById(context.req.session.userId);
      if (user.prosumerData.houseId !== undefined) {
        if (user.prosumerData.houseId !== null) {
          return false;
        }
      } 

      const result = await User.find({prosumerData: { houseId: prosumerId }});
      if (result.length !== 0) {
        console.log(result);
        return false;
      }

      user.prosumerData.houseId = prosumerId;
      user.save();

      return true;
    },
    unassignProsumer: async(_, args, context) => {
      assertIsSignedIn(context);
      const user = await User.findById(context.req.session.userId);
      if (user.prosumerData.houseId === undefined) {
        return false;
      } 
      if (user.prosumerData.houseId === null) {
        return false;
      }

      user.prosumerData.houseId = null;
      user.save();

      return true;
    }
  }
}
