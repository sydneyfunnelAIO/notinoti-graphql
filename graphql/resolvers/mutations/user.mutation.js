const {addTwitchRequest, registerToTwitch} = require("../../../helpers/Posts")

module.exports = {
  registerUser: async (
    parent,
    { data: { userId }},
    { User}
  ) => {
      console.log("TESTS")
    const register = await new User({
     userId,
     Twitch:[],
     Twitter:[],
     Youtube:[]
    }).save();

    return register;
  },
  addTwitch: async(parent,{data:{channelName,userId}},{User,Twitch})=>{
      let channel = await Twitch.findOne({channelName})
      let newData;
     if(!channel){
      let response = await addTwitchRequest(channelName,userId)
      let newChannel =  new Twitch(response)
    newData = await  newChannel.save()
   await registerToTwitch(response.channelId)

     }
     else{
         if(!channel.Users.includes(userId)){
            channel.Users.push(userId)
            newData = await Twitch.findByIdAndUpdate(channel._id, {Users: channel.Users},{new:true})
         }
         else{
             //TODO: HATA MESAJI YOLLANACAK
            throw new Error("ERROR")
         }
     }
    await User.findOneAndUpdate({userId}, {$push: {Twitch:newData._id}},{new:true} )
  
    
    return {status:200, message:"Success"}

  },
  deleteTwitch: async(parent,{data:{channelName,userId}},{User,Twitch})=>{
    console.log("test"+channelName + " : " + userId)
      let channelId = await Twitch.findOneAndUpdate({channelName:channelName},{$pull: {Users:userId}},{new:true})
       await User.updateOne({userId},{$pull: {Twitch:channelId._id}})


      return {status:200, message:"Success"}
  },
  testMutation: async(parent,{data})=>{
    console.log(data)
  }
};
