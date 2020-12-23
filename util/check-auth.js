const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = require("../config");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    //  Parse token from "Bearer [token]"
    const token = authHeader.split("Bearer ")[1];
    //  Make sure there is a token
    if (token) {
      try {
        //  Verify the token
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        //  Throw error if token is invalid or expired
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    //  Throw error if no token is provided
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  //  Throw error if no authorization header is provided
  throw new Error("Authorization header must be provided");
};
