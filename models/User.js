const mongoose = require('mongoose');
const { Schema } = mongoose;

const user = new Schema({
  twitterProvider: {
    id: {
      required: true,
      unique: true,
      type: String,
    },
    username: {
      required: true,
      unique: true,
      type: String,
    },
    photo: {
      type: String,
    },
  },
  profileCreated: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model('user', user);
