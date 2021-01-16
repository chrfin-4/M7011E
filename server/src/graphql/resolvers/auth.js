const bcrypt = require('bcryptjs');
const { COOKIE_NAME } = require('../../constants');

const User = require('../../models/user');
const { validateRegister } = require('../../util/validateRegister');

module.exports = {
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
      console.log(user);

      return {
        user: {
          ...user._doc
        }
      };
    },
    logout: async (parent, args, {req, res}, info) => {
      return new Promise((resolve) => {
        req.session.destroy((err) => {
          res.clearCookie(COOKIE_NAME);
          if (err) {
            console.log(err);
            resolve(false);
            return;
          }
          resolve(true);
        })
      })
    },
  },
  Query: {
  }
};
