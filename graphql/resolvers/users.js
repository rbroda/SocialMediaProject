const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");

//  Helper function to generate JSON Web Token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = {
  Mutation: {
    login: async (_, { username, password }) => {
      //  Validate user login credentials
      const { errors, valid } = validateLoginInput(username, password);
      //  Make sure user input is valid
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      //  Attempt to find the user
      const user = await User.findOne({ username });
      //  Make sure user exists
      if (!user) {
        //  Else throw error
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }
      //  Make sure user input password matches user password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        //  Else throw error
        errors.general = "Wrong crendetials";
        throw new UserInputError("Wrong crendetials", { errors });
      }
      //  Create auth token
      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    register: (
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) => {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      //  Make sure user input is valid
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      //  Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        //  Else throw error
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      //  Hash password
      password = await bcrypt.hash(password, 12);
      //  Create new user
      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });
      //  Save new user in DB
      const res = await newUser.save();
      //  Create auth token
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
