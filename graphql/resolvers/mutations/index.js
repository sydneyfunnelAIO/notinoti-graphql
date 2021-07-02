const user = require('./user.mutation');
const youtube = require("./youtube.mutation")
const twitter = require('./twitter.mutation')
const Mutation = {
  ...user,
  ...youtube,
  ...twitter
};

module.exports = Mutation;
