

const Query = {
  users: async (parent,args,{User})=>{
      return await User.find().populate("Twitch")
  },
  user: async (parent, args, { User }) => {
   return await User.findOne({userId:args.userId}).populate('Twitch').populate("Youtube").populate("Twitter")

    
  },
  Twitch:async(parent,args,{Twitch})=>{
      return await Twitch.findOne({channelId: args.channelId})
  },
  Youtube:async(parent,args,{Youtube})=>{
      return await Youtube.findOne({channelId:args.channelId})
  },
  test: (parent,args)=>{
      return args.userId
  }
};

module.exports = Query;
