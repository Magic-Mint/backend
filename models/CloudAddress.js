const mongoose = require('mongoose');
const { Schema } = mongoose;

const cloudAddress = new Schema({
  address: String,
  mnemonic: String,
  privateKey: String,
});

module.exports = mongoose.model('cloudAddress', cloudAddress);
