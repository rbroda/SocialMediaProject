const { model, Schema } = require("mongoose");
//  Create user db schema
const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
});

module.exports = model("User", userSchema);
