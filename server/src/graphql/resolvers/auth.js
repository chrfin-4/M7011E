const bcrypt = require('bcryptjs');
const { COOKIE_NAME } = require('../../constants');

const User = require('../../models/user');
const { validateRegister } = require('../../util/validateRegister');

module.exports = {
  Mutation: {
    login: async (parent, args, context, info) => {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        return {
          errors: [
            {
              field: "email",
              message: "email doesn't exist"
            }
          ]
        };
      }
      const isEqual = await bcrypt.compare(args.password, user.password);
      if (!isEqual) {
        return {
          errors: [
            {
              field: "password",
              message: "incorrect password"
            }
          ]
        };
      }

      // store user id session
      // this will set a cookie on the user
      // keep them logged in
      context.req.session.userId = user.id;
      context.req.session.userType = user.type;

      return {
        user: {
          ...user._doc
        }
      };
    },
    logout: (parent, args, {req, res}, info) => {
      return new Promise((resolve) => {
        req.session.destroy((err) => {
          res.clearCookie(COOKIE_NAME);
          if (err) {
            console.log(err);
            resolve(false);
            return;
          }
          resolve(true);
        });
      });
    },
  },
  Query: {
  }
};
