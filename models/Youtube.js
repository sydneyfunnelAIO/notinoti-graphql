const mongoose = require("mongoose");

const youtubeSchema = mongoose.Schema({
  Users: { type:Array,default: []},
  channelId: { type:String},
  channelPicture: { type:String},
  channelTitle: String,
  reachedMessages: {type: Array, default: []}
} );

 

module.exports = mongoose.model("youtube", youtubeSchema);  ;
