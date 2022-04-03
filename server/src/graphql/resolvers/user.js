const bcrypt = require('bcryptjs');
const path = require("path");
const glob = require("glob");
const { createWriteStream, unlink } = require("fs");

const { validateRegister } = require("../../util/validateRegister");
const { validateUpdate } = require("../../util/validateUpdate");
const User = require("../../models/user");

const { getKeysByPattern } = require('../../redis');
const { UPLOADS_DIR, UPLOADS_PATH } = require("../../constants");
const { assertIsAuth, assertIsSignedIn } = require('../../util/asserts');

// const { finished } = require("stream/promises");
// const keysAsync = promisify(redis.keys).bind(redis);


module.exports = {
  Query: {
    online: async (_, args, { req }) => {
      assertIsSignedIn(req);
      assertIsAuth(req);

      let ids;
      await getKeysByPattern('active:*').then((keys) => {
        ids = keys.map(k => k.split(':')[2]);
      });

      const res = ids.map(id => {
        const result = User.findById(id);
        result.password = null;
        return result;
      });

      return res;
    },
    users: async (_, args, { req }) => {
      assertIsSignedIn(req);
      // assertIsAuth(context);
      const result = await User.find();
      return result.map((e) => {
        e.password = null;
        return e;
      });
    },
    user: async (_, {id}, { req }) => {
      assertIsSignedIn(req);
      // assertIsAuth(context);
      const result = await User.findById(id);
      result.password = null;
      return result;
    },
    me: async (_, args, { req }) => {
      if (!req.session.userId) return null;
      return await User.findById(req.session.userId);
    }
  },
  Mutation: {
    createUser: async (parent, args, { req }, info) => {
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

        req.session.userId = user.id;
        req.session.userType = user.type;

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
    updateUser: async(_, {userId, userInput}, { req }) => {
      assertIsSignedIn(req);
      assertIsAuth(req);

      try {
        const errors = validateUpdate(userInput);
        if (errors) {
          return errors;
        }

        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser && existingUser.id != userId) {
          return {
            errors: [
              {
                field: "email",
                message: "email already exists"
              }
            ]
          };
        }

        const hashedPassword = (!!userInput.password) ? await bcrypt.hash(userInput.password, 12) : undefined;

        console.log({
          name: userInput.name,
        });

        const user = await User.findByIdAndUpdate(userId, {
          name: userInput.name,
          email: userInput.email,
          ...(!!hashedPassword && { password: hashedPassword }),
          type: userInput.type
        }, { new: true });

        req.session.userType = user.type;
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
    deleteUser: async(_, {userId}, { res, req }) => {
      assertIsSignedIn(req);
      assertIsAuth(req);
      const user = await User.findByIdAndDelete(userId);
      if (userId === req.session.userId) {
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
      }
      return true;
    },
    assignProsumer: async(_, {prosumerId}, { req }) => {
      assertIsSignedIn(req);
      const user = await User.findById(req.session.userId);
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
    unassignProsumer: async(_, args, { req }) => {
      assertIsSignedIn(req);
      const user = await User.findById(req.session.userId);
      if (user.prosumerData.houseId === undefined) {
        return false;
      } 
      if (user.prosumerData.houseId === null) {
        return false;
      }

      user.prosumerData.houseId = null;
      user.save();

      return true;
    },
    setProfilePicture: async(_, { file }, { req }) => {
      assertIsSignedIn(req);

      const { createReadStream, filename, mimetype, encoding } = await file;
      const stream = createReadStream();
      const storedFileExt = filename.split('.').pop();
      const storedFileName = req.session.userId + '_image.' + storedFileExt;
      const storedFilePath = path.join(UPLOADS_PATH, storedFileName);

      // We store files as '{userId}_image.{fileExtension}
      // Here we get a list of image paths uploaded by the user
      // Then remove any path that matches the image about to be uploaded
      const deleteFiles = glob.sync(path.join(UPLOADS_PATH, req.session.userId + '_image.*'));
      const index = deleteFiles.indexOf(storedFilePath);
      if (index > -1) {
        deleteFiles.splice(index, 1);
      }
      console.log(deleteFiles);
      
      // Invoking the `createReadStream` will return a Readable Stream.
      // See https://nodejs.org/api/stream.html#stream_readable_streams
      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(storedFilePath);

        writeStream.on("finish", resolve);

        writeStream.on("error", (error) => {
          unlink(storedFilePath, () => {
            reject(error);
          });
        });

        stream.on("error", (error) => writeStream.destroy(error));

        stream.pipe(writeStream);
      }).then(() => {
        deleteFiles.map((filePath) => {
          unlink(filePath, err => {
            // Idk..
          });
        })
      });

      return { filename, mimetype, encoding };
    },
  }
}
