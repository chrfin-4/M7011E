const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  Mutation: {
    createUser: async (parent, args, context, info) => {
      console.log(args.userInput);
      try {
        const existingUser = await User.findOne({ email: args.userInput.email });
        if (existingUser) {
          throw new Error('User exists already.');
        }
        const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

        const user = new User({
          email: args.userInput.email,
          password: hashedPassword,
          type: args.userInput.type,
        });

        const result = await user.save();

        context.req.session.userId = user.id;

        return { ...result._doc, password: null, _id: result.id };
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  },
  Query: {
    login: async (parent, args, context, info) => {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw new Error('User does not exist!');
      }
      const isEqual = await bcrypt.compare(args.password, user.password);
      if (!isEqual) {
        throw new Error('Password is incorrect!');
      }

      // store user id session
      // this will set a cookie on the user
      // keep them logged in
      context.req.session.userId = user.id;

      return { userId: user.id, token: token, tokenExpiration: 1};
    }
  }
};
