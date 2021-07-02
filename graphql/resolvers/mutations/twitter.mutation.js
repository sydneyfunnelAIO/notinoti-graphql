const {
  addTwitchRequest,
  registerToTwitch,
  registerToYoutube,
  addTwitterRequest,
  registerToTwitter,
} = require("../../../helpers/Posts");

module.exports = {
  addTwitter: async (
    parent,
    { data: { userId, channelName } },
    { User, Twitter }
  ) => {
    let channel = await Twitter.findOne({
      twitterName: channelName.toLowerCase(),
    });
    console.log(channel)
    let data;
    if (!channel) {
      let response = await addTwitterRequest(channelName.toLowerCase());
      console.log(response)
      let newData = new Twitter({
        twitterName: channelName.toLowerCase(),
        twitterPic: response.image_link,
        twitterId: response.twitterId,
        Users: [userId],
      });
      data = await newData.save();
     await registerToTwitter(data.twitterId, Twitter);
      console.log("Start")

    } else {
      if (!channel.Users.includes(userId)) {
        channel.Users.push(userId);
        data = await Twitter.findByIdAndUpdate(
          channel._id,
          { Users: channel.Users },
          { new: true }
        );
      } else {
        throw new Error("ERROR");
      }
    }
    await User.findOneAndUpdate(
      { userId },
      { $push: { Twitter: data._id } },
      { new: true }
    );

    return { status: 200, message: "Success" };
  },
  deleteTwitter: async (
    parent,
    { data: { channelName, userId } },
    { User, Twitter }
  ) => {
    let channel = await Twitter.findOneAndUpdate(
      { twitterName: channelName.toLowerCase() },
      { $pull: { Users: userId } },
      { new: true }
    );
    await User.updateOne({ userId }, { $pull: { Twitter: channel._id } });
    return { status: 200, message: "success" };
  },
};
