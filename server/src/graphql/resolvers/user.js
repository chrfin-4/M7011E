const User = require("../../models/user");
const { RedisClient} = require('redis');
const { promisify } = require('util');
const { validateRegister } = require("../../util/validateRegister");
const bcrypt = require('bcryptjs');

const redis = new RedisClient(process.env.REDIS_URL);
const keysAsync = promisify(redis.keys).bind(redis);

function assertIsSignedIn(context) {
  if (!context.req.session.userId) {
    throw new Error('Unauthorized');
  }
}

function assertIsAuth(context) {
  if (!context.req.session.userType >= 2) {
    throw new Error('Unauthorized');
  }
}

module.exports = {
  Query: {
    online: async (_, args, context) => {
      assertIsSignedIn(context);
      assertIsAuth(context);

      let ids;
      await keysAsync('active:*').then((keys) => {
        ids = keys.map(k => k.split(':')[1]);
      });

      const res = ids.map(id => {
        const result = User.findById(id);
        result.password = null;
        return result;
      });

      return res;
    },
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
    createUser: async (parent, args, context, info) => {
      try {
        const errors = validateRegister(args.userInput);
        if (errors) {
          return errors;
        }

        const existingUser = await User.findOne({ email: args.userInput.email });
        if (existingUser) {
          return {
            errors: [
              {
                field: "email",
                message: "email already exists"
              }
            ]
          };
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

        const user = new User({
          name: args.userInput.name,
          email: args.userInput.email,
          password: hashedPassword,
          type: args.userInput.type,
        });

        const result = await user.save();

        context.req.session.userId = user.id;
        context.req.session.userType = user.type;

        return { 
          user: {
            ...result._doc, 
            password: null, 
            _id: result.id
          }
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    updateUser: async(_, {userId, userInput}, context) => {
      assertIsSignedIn(context);
      assertIsAuth(context);

      try {
        const errors = validateRegister(userInput);
        if (errors) {
          return errors;
        }

        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
          return {
            errors: [
              {
                field: "email",
                message: "email already exists"
              }
            ]
          };
        }
        const hashedPassword = await bcrypt.hash(userInput.password, 12);

        const user = await User.findByIdAndUpdate(userId, {
          name: userInput.name,
          email: userInput.email,
          password: hashedPassword,
          type: userInput.type
        }, { new: true });

        context.req.session.userType = user.type;
        return {
          user: {
            ...user._doc,
            password: null,
            _id: user.id
          }
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    deleteUser: async(_, {userId}, context) => {
      assertIsSignedIn(context);
      assertIsAuth(context);
      const user = await User.findByIdAndDelete(userId);
      if (userId === context.req.session.userId) {
        return new Promise((resolve) => {
          context.req.session.destroy((err) => {
            context.res.clearCookie(COOKIE_NAME);
            if (err) {
              console.log(err);
              resolve(false);
              return;
            }
            resolve(true);
          })
        })
      }
      return true;
    },
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
