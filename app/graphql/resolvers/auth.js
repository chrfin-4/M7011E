const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  Mutation: {
    createUser: async (obj, args, context, info) => {
      //console.log(obj);
      console.log(args);
      //console.log(context);
      //console.log(info);
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

        return { ...result._doc, password: null, _id: result.id };
      } catch (err) {
        console.log(err);
        throw err;
      }
    }
  },
  Query: {
    login: async ({ email, password }) => {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error('User does not exist!');
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error('Password is incorrect!');
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'somesupersecretkey',
        {
          expiresIn: '1h'
        }
      );
      return { userId: user.id, token: token, tokenExpiration: 1 };
    }
  }
};
