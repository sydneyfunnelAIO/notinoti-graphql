const axios = require("axios");

const { SERVER_API, TOKEN, YOUTUBE } = require("../Config");
const admin = require("firebase-admin");

const Twit = require("twit");
var T = new Twit({
  consumer_key: "fdbw1c3nzLrKxryaWVuLHIAbD",
  consumer_secret: "OdFouMzo9gPPWdkkJWoAsj7a0i03GYpOf8nX0LwrzZETWgWGu0",
  access_token: "1252990800843214850-zMI2xS1GIKvNT49l9jL2o7MAmZ7xGD",
  access_token_secret: "ZKUWhD6IWEVELzFERISvSNG2AKnVS54MvmsAZDKsTkxSp",
});
const addTwitterRequest = async (twitterName) => {
return new Promise((resolve,reject)=>{
  let data;

  T.get(
    "users/lookup",
    { screen_name: twitterName },
    (err, data, response) => {
      let twitterId = data[0].id_str;
      let image = data[0].profile_image_url.split("_");
      let image_link = image[0] + "_" + image[1] + "_400x400.jpg";

      
       resolve({ twitterId, image_link })
     
    }
  );
})
 
  
};
const addTwitchRequest = async (channelName, userId) => {
  let data = await axios.get(
    `https://api.twitch.tv/kraken/users?login=${channelName}`,
    {
      headers: {
        Accept: `application/vnd.twitchtv.v5+json`,
        "Client-ID": "ne63ji40tcy0jfrvc4qlofq0ryx1m8",
      },
    }
  );

  let data2 = await axios.get(
    `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
    {
      headers: {
        "Client-ID": "ne63ji40tcy0jfrvc4qlofq0ryx1m8",
        Authorization: `Bearer yrmcgzhi748jncip3vdz4wk2ke55vd`,
      },
    }
  );
  return {
    channelId: data.data.users[0]._id,
    channelName: channelName,
    Users: [userId],
    reachedMessages: [],
    ChannelPic: data.data.users[0].logo,
    type: data2.data.data.length > 0 ? "live" : "",
  };
};

const registerToTwitch = async (id) => {
  await axios.post(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      type: "stream.online",
      version: "1",
      condition: {
        broadcaster_user_id: id,
      },
      transport: {
        method: "webhook",
        callback: `${SERVER_API}/verify`,
        secret: "123352462462",
      },
    },
    {
      headers: {
        "Client-ID": "ne63ji40tcy0jfrvc4qlofq0ryx1m8",
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  await axios.post(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      type: "stream.offline",
      version: "1",
      condition: {
        broadcaster_user_id: id,
      },
      transport: {
        method: "webhook",
        callback: `${SERVER_API}/verify`,
        secret: "123352462462",
      },
    },
    {
      headers: {
        "Client-ID": "ne63ji40tcy0jfrvc4qlofq0ryx1m8",
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const registerToYoutube = async (id) => {
  console.log(id);
  let data = await axios.post(`http://localhost:4004/Youtube/registerYoutube`, {
    id: id,
  });
  console.log("CIKTI");
  return data;
};
const registerToTwitter = async (twitterId,Twitter) => {
  let stream = await T.stream("statuses/filter", { follow: [twitterId] });
  stream.on("tweet", async(tweet) => {
    let name = tweet.user.name;
    let screenName = tweet.user.screen_name.toLowerCase();
    let tweetId = tweet.id_str;
    let text = tweet.text;
    let data = await Twitter.findOne({twitterName:screenName})
    console.log(screenName+" :" + text)
    if(data){
      let tokens = await data.Users.map((user)=> user)
      console.log(tokens)
      admin.messaging().sendMulticast({
        tokens,
        data: {
          title: `${screenName} Published New Tweet!`,
          body: `${text}`,
          router:tweetId,
          image: data.twitterImage,
          tag:"twitter",
        },
        android: {
          priority: "high",
        },
        priority: "high",
        show_in_foreground: true,
        color: "#16e6b4",
        sound: "default",
      });

    }

  });
  return {success:true}
};

module.exports = {
  addTwitchRequest,
  registerToTwitch,
  registerToYoutube,
  addTwitterRequest,
  registerToTwitter
};
