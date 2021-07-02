const {addTwitchRequest, registerToTwitch, registerToYoutube} = require("../../../helpers/Posts")
const { YouTube } = require("popyt");
const youtube = new YouTube("AIzaSyDCfcSbh1xuPx6OIYWAsF06FXIvejFpvsw");

module.exports = {
  addYoutube:async(parent,{data:{userId,channelName}},{User,Youtube})=>{
      let yt = await youtube.getChannel(channelName).catch(e=> {
          throw new Error("THERE IS NO CHANNEL CALLED")
      } )
      let { id, snippet } = yt.data
      let {url} = yt.profilePictures.high
      let channel = await Youtube.findOne({channelId:id})
      let newData;
      if(!channel){
        let createYoutube = new Youtube({
            channelTitle:snippet.title,
            channelId:id,
            channelPicture:url,
            Users:[userId],
            reachedMessages:[]
        })
      newData =  await createYoutube.save()
      console.log("GIRDI")
      registerToYoutube(id)
      
      }else{
          if(!channel.Users.includes(userId)){
              channel.Users.push(userId)
              newData = await Youtube.findByIdAndUpdate(channel._id,{Users:channel.Users},{new:true})
          }
          else{
              throw new Error("ERROOR")
          }
      }
      await User.findOneAndUpdate({userId}, {$push:{Youtube:newData._id}},{new:true})
      return {status:200,message:"Success"}
  },
  deleteYoutube: async(parent,{data:{channelName,userId}},{User,Youtube})=>{
      let channel =  await Youtube.findOneAndUpdate({channelId:channelName},{$pull: {Users:userId}},{new:true})
      await User.updateOne({userId},{$pull:{Youtube:channel._id}})
      return {status:200,message:"Success"}
  }
};
