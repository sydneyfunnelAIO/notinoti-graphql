const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  Twitter: [{ type:mongoose.Schema.Types.ObjectId, ref:"twitter"}],
  Youtube: [{ type:mongoose.Schema.Types.ObjectId, ref:"youtube"}],
  Twitch: [{ type:mongoose.Schema.Types.ObjectId, ref:"twitch"}],
  userId: String,
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
