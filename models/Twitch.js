const mongoose = require("mongoose");

const twitchSchema = mongoose.Schema({
  Users: { type:Array,default: []},
  channelId: { type:String},
  channelName: String,
  type: String,
  ChannelPic: { type:String},
  channelTitle: String,
  reachedMessages: {type: Array, default: []}
} );



module.exports =   mongoose.model("twitch", twitchSchema); ;
