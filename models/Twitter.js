const mongoose = require("mongoose");

const twitchSchema = mongoose.Schema({
  Users: { type:Array,default: []},
  twitterId: { type:String},
  twitterName: String,
  twitterPic: { type:String},
} );



module.exports =   mongoose.model("twitter", twitchSchema); ;
