let Campaign = require('../models/Campaign');
let CampaignNFT = require('../models/CampaignNFT');
let User = require('../models/User');
const ClaimNFT = require('../models/ClaimNFT');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
const { create } = require('ipfs-http-client');

const ipfs = create({
  host: 'ipfs.infura.io',
  port: '5001',
  protocol: 'https',
});

exports.getAllClaimsByUser = async (req, res) => {
  let campaigns = await Campaign.find({});
  let newNFTs = [];
  const claims = await ClaimNFT.find({}).where('owner').equals(req.user._id);
  const claimsOriginNFTIds = claims.map((claim) => claim.originNFT.toString());

  const twitterPostIDs = campaigns.map((campaign) => campaign.twitterPostID);
  const config = {
    headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
  };
  for (let twitterPostID of twitterPostIDs) {
    try {
      //needs future optimization
      const campaignData = await axios.get(`https://api.twitter.com/2/tweets/${twitterPostID}/retweeted_by`, config);
      // it creates requests to twitter to fetch the users that retweeted for every campaign in the database
      if (campaignData.data.meta.result_count !== 0) {
       let reshares = campaignData.data.data;
       for (let reshare of reshares) {
         if (reshare.id == req.user.twitterProvider.id) {
           let specificCampaign = await Campaign.findOne({}).where('twitterPostID').equals(twitterPostID);
           
           let specificNFTMetadata = await CampaignNFT.findOne({}).where('_id').equals(specificCampaign.campaignNFTID);
           if (specificNFTMetadata) {
             const nftFileData = await axios.get(specificNFTMetadata.fileSrc, {
               responseType: 'arraybuffer',
              });
              const isSaved = claimsOriginNFTIds.find((orgId) => orgId === specificNFTMetadata._id.toString());
             if (!isSaved) {
               const ipfsData = await ipfs.add(nftFileData.data);
               const claimNFT = new ClaimNFT({
                 isMinted: false,
                 originNFT: specificNFTMetadata._id,
                 campaign: specificCampaign._id,
                 ipfsUri: ipfsData.path,
                 owner: req.user._id,
                 campaignMintNumber: 0,
               });
               const saved = await claimNFT.save();
               newNFTs.push(saved);
             }
           }
         }
       }
      } 
    } catch (error) {
      res.status(500).json(error);
      return;
    }
  }
  res.status(200).json(newNFTs);
};

exports.getClaims = async (req, res) => {
  let claims = await ClaimNFT.find({}).where('owner').populate('originNFT').equals(req.user._id).where('isMinted').equals(false);
  res.status(200).json(claims);
};

exports.getClaimedNFTs = async (req, res) => {
  let claims = await ClaimNFT.find({}).populate('originNFT').where('owner').equals(req.user._id).where('isMinted').equals(true);
  res.status(200).json(claims);
};

exports.claimSingleNFT = async (req, res) => {
  const nftId = req.params.nftId;

  let updateNFT = await ClaimNFT.findOne({}).where('_id').equals(nftId);

  updateNFT.isMinted = true;

  const updated = await updateNFT.save();

  res.status(200).json(updated);
};
