let Campaign = require('../models/Campaign');
let CampaignNFT = require('../models/CampaignNFT');
let User = require('../models/User');
const ClaimNFT = require('../models/ClaimNFT');
const fs = require('fs');
const path = require('path');
const axios = require('axios').default;
// const ipfsAPI = require('ipfs-http-client');
const { create } = require('ipfs-http-client');
const ipfs = create({
  host: 'ipfs.infura.io',
  port: '5001',
  protocol: 'https',
});

exports.getAllClaimsByUser = async (req, res) => {
  let campaigns = await Campaign.find({});
  let claims = null;
  let newNFTs = [];
  let ipfsData;

  twitterPostIDs = campaigns.map((campaign) => campaign.twitterPostID);
  const config = {
    headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
  };

  twitterPostIDs.forEach(async (twitterPostID) => {
    try {
      const campaignData = await axios.get(`https://api.twitter.com/2/tweets/${twitterPostID}/retweeted_by`, config);
      //needs future optimization
      // it creates requests to twitter to fetch the users that retweeted for every campaign in the database

      if (campaignData.data.meta.result_count == 0) {
        res.send('No one has reshared');
        console.log('no one has reshared');
        return;
      } else {
        let reshares = campaignData.data.data;

        reshares.forEach(async (reshare, index) => {
          if (reshare.id == req.user.twitterProvider.id) {
            let specificCampaign = await Campaign.findOne({}).where('twitterPostID').equals(twitterPostID);

            let specificNFTMetadata = await CampaignNFT.findOne({}).where('_id').equals(specificCampaign.campaignNFTID);

            fs.readFile(
              path.join(__dirname, `../public/assets/upload/NFTPrototype${specificNFTMetadata.fileSrc}`),
              async (err, data) => {
                if (err) {
                  throw err;
                } else {
                  if (specificNFTMetadata) {
                    let hm = true;

                    claims = await ClaimNFT.find({}).where('owner').equals(req.user._id);

                    claims.forEach(async (claim) => {
                      if (claim.name == specificNFTMetadata.name && specificCampaign.campaignName == claim.campaign) {
                        hm = false;
                      }
                    });
                    if (hm) {
                      ipfsData = await ipfs.add(data);

                      const claimNFT = new ClaimNFT({
                        isMinted: false,
                        name: specificNFTMetadata.name,
                        description: specificNFTMetadata.description,
                        ipfsUri: ipfsData.path,
                        campaign: specificCampaign._id,
                        owner: req.user._id,
                        campaignMintNumber: 0,
                      });

                      const saved = await claimNFT.save();
                      newNFTs.push(saved);
                    }
                  }
                }
              }
            );
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
      return;
    }
  });
  console.log({ newNFTs });

  res.status(200).json(newNFTs);
};

exports.getClaims = async (req, res) => {
  let claims = await ClaimNFT.find({}).where('owner').equals(req.user._id).where('isMinted').equals(false);
  res.status(200).json(claims);
};

exports.getClaimedNFTs = async (req, res) => {
  let claims = await ClaimNFT.find({}).where('owner').equals(req.user._id).where('isMinted').equals(true);
  res.status(200).json(claims);
};

exports.claimSingleNFT = async (req, res) => {
  const nftId = req.params.nftId;

  let updateNFT = await ClaimNFT.findOne({}).where('_id').equals(nftId);

  updateNFT.isMinted = true;

  const updated = await updateNFT.save();

  res.status(200).json(updated);
};
