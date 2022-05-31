const mongoose = require('mongoose');
const { Schema } = mongoose;

const claimNFT = new Schema({
  isMinted: {
    type: Boolean,
    default: false,
  },
  ipfsUri: {
    type: String,
    required: true,
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'campaign',
    required: true,
  },
  originNFT: {
    type: Schema.Types.ObjectId,
    ref: 'campaignNFT',
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  campaignMintNumber: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('claimNFT', claimNFT);
