const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const { YOUTUBE } = require("../Config");
const parseString = require("xml2js").parseString;
const { YT } = require("../models/Youtube")

const pubsubhubbub = require("pubsubhubbub");
const client = pubsubhubbub.createServer({
  callbackUrl: `${YOUTUBE}/pubsubhubbub`,
  leaseSeconds: 90000
});

router.use("/pubsubhubbub", client.listener());

router.get("/refreshYoutube", (req, res) => {
  YT.find().exec((err, channels) => {
    channels.forEach((doc) => {
      console.log(doc.channelTitle)
      let topic =
        "https://www.youtube.com/xml/feeds/videos.xml?channel_id=" + doc.channelId;
      client.subscribe(
        topic,
        "http://pubsubhubbub.appspot.com/",
        (err, a) => {
          if (err) {
            console.log(err);
          } else {

          }
        }
      );
    })
  })
  res.json({ success: true, status: 200 })
})

router.post("/registerYoutube", async (req, res) => {
          let topic =
            "https://www.youtube.com/xml/feeds/videos.xml?channel_id=" + req.body.id;
          client.subscribe(
            topic,
            "http://pubsubhubbub.appspot.com/",
            (error, a) => {
              if (error) {
                res.json({ success: false, error })
              } else {
                console.log(a);
                res.json({ success: true });
              }
            }
          );
        })
    





client.on("unsubscribe", (data) => {
  console.log("Unsubscribe");
  console.log(data.topic);
});
client.on("error", error => {
  console.log(error)
})
client.on("denied", denied => {
  console.log(denied)

})


client.on("feed", (data) => {
  try {
    parseString(data.feed.toString(), (err, result) => {
      let entry = result.feed.entry[0];
      let videoId = entry["yt:videoId"][0];
      let channelId = entry["yt:channelId"][0];
      let channelName = entry.author[0].name;
      let title = entry.title[0];
      console.log(entry);//TODO: SEND NOTIFICATION
      YT.find({channelId}).exec((err,channels)=>{
        if(channels.length>0){
          if(!channels[0].reachedMessages.includes(videoId)){
            let tokens = channels[0].Users.map(user => user)
            admin.messaging().sendMulticast({
              tokens,
              data: {
                title: `${channelName} Published New Video!`,
                body: `${title}`,
                router: videoId,
                image: channels[0].channelPicture,
                tag: "youtube",
              },
              android: {
                priority: "high"
              },
              priority: "high",
              show_in_foreground: true,
              color: "#16e6b4",
              sound: "default",
            })
            YT.updateOne({channelId},{
              reachedMessages:[...channels[0].reachedMessages, videoId]
            })
          }
        }
      })
    });
  } catch (error) {
    console.log(error)
  }

});



module.exports = router;
