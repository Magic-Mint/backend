const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaignNFT = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  fileSrc: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('campaignNFT', campaignNFT);
