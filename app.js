const http = require('http');
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const { ApolloServer, PubSub } = require("apollo-server-express");
const { importSchema } = require("graphql-import");
const GraphQLJSON = require('graphql-type-json');
const cors        = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const corsOptions = {
  
  credentials: true
};

// RESOLVERS
const resolvers = require("./graphql/resolvers/index");

// models
const User    = require('./models/User');
const Twitch    = require('./models/Twitch');
const Youtube = require('./models/Youtube')
const Twitter  = require('./models/Twitter')


const pubsub = new PubSub();

const resolveFunctions = {
  JSON: GraphQLJSON
};
// SCHEMA
const server = new ApolloServer({
  typeDefs: importSchema("./graphql/schema.graphql"),
  resolvers,
  resolveFunctions,
  context: ({req}) => ({
    User,
    Twitch,
    Youtube,
    Twitter
  }),
  introspection: true,
  playground: true,
});

// DB

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch(e => console.log(e));

const app = express();
//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json({
    verify:(req,res,buf)=>{
        req.rawBody = buf
    }
}))
app.use("/twitch", require("./routes/Twitch"))
app.use("/Youtube", require("./routes/Youtube"))

server.applyMiddleware({ app, cors: true });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.PORT || 4004, () =>
  console.log(`🚀 Wallids Dashboard ready at http://localhost:4004${server.graphqlPath}`)
);
