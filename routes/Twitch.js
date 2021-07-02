const express = require("express");
const router = express.Router();
const axios = require("axios");
const CryptoJS = require("crypto-js");
const admin = require("firebase-admin");
const serviceAccount = require("../notinoti-524fc-firebase-adminsdk-4qgvv-bdeabf5743.json");
const { Twitch } = require("../models/Twitch")
const { TOKEN, SERVER_API } = require("../Config");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


router.post("/verify", (req, res) => {
  console.log(req.body);
  if (typeof req.body.challenge !== "undefined") {
    let hmac_message =
      req.headers["twitch-eventsub-message-id"] +
      req.headers["twitch-eventsub-message-timestamp"] +
      req.rawBody;
    let signature =
      "sha256=" + CryptoJS.HmacSHA256(hmac_message, "123352462462");
    if (signature !== req.headers["twitch-eventsub-message-signature"]) {
      res.status(403);
    } else {
      res.send(req.body.challenge);
    }
  } else if (
    typeof req.body.event !== "undefined" &&
    req.body.subscription.type == "stream.online"
  ) {
    let event = req.body.event
    Twitch.find({channelName: event.broadcaster_user_name.toLowerCase()}).exec((err,channel)=>{
      if(channel[0].reachedMessages.includes(event.id)){}
      else{
        let tokens = channel[0].Users.map((user)=> user )
        admin.messaging().sendMulticast({
          tokens,
          data:{
            body:`${event.broadcaster_user_name} is Live!`,
            title:event.broadcaster_user_name,
            image:channel[0].ChannelPic,
            router: event.broadcaster_user_name,
            tag:"twitch"
          },
          android:{
            priority:"high"
          },
          priority:"high",
          show_in_foreground:true,
          color:"#16e6b4",
          sound:"default"
          
        })
        Twitch.updateOne({channelName: event.broadcaster_user_name.toLowerCase()},{
          reachedMessages:[...channel[0].reachedMessages, event.id ],
          type: event.type
        })
        res.status(200).send("200")
      }
    })
  } else if (
    typeof req.body.event !== "undefined" &&
    req.body.subscription.type == "stream.offline"
  ) {
    let event = req.body.event;
    Twitch.updateOne({channelName: event.broadcaster_user_name.toLowerCase()},{
      type:""
    })
    res.status(200).send("200")
  }
});


module.exports = router;
