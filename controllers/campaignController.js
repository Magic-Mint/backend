const Campaign = require('../models/Campaign');
const CampaignNFT = require('../models/CampaignNFT');
const { uploadToCloudinary } = require('../helpers/utils_fn');
const User = require('../models/User');

exports.createCampaign = async (req, res) => {
  const campaign = req.body;
  // filePathNameNew = path.join(__dirname, '../public/assets/upload/NFTPrototype' )
  //create collection
  // one collection per campaign,
  // one collection for all campaigns for a user/dao/entity!
  // deploy a collection, how

  const newCampaign = new Campaign({
    campaignNFTID: campaign.campaignNFTID,
    creator: req.user._id,
    twitterPostID: campaign.twitterPostID,
    collectionAddress: campaign.collectionAddress,
    nftCopies: campaign.numberOfNFTs,
    includeLikesBeforeCreation: campaign.countOldLikes,
    includeResharesBeforeCreation: campaign.countOldReshares,
    campaignBase: campaign.campaignBase,
    campaignName: campaign.campaignName,
    startDate: Date.now(),
    endDate: campaign.endDate,
  });

  try {
    const saved = await newCampaign.save();
    res.status(200).json(saved);
  } catch (error) {
    res.status(500).json(error);
    
  }
};

exports.uploadNFTFile = async (req, res) => {};

exports.createNFT = async (req, res) => {
  const file = req.files?.file;
  if (file) {
    try {
      const fileBase64 = 'data:image/png;base64,' + file.data.toString('base64');
      const fileName = 'nft-upload-' + Date.now();
      const upload = await uploadToCloudinary(fileBase64, {
        public_id: fileName,
      });
      const campaignNFT = new CampaignNFT({
        creator: req.user._id,
        name: req.body.name,
        description: req.body.description,
        fileSrc: upload.secure_url,
      });
      const savedCampaignNFT = await campaignNFT.save();
      res.status(200).json(savedCampaignNFT);
    } catch (error) {
      console.log({ error });
      return res.status(500).json(error);
    }
  }
};

exports.getNFTPrototypeCreatedByUser = async (req, res) => {
  const NFTPrototypes = await CampaignNFT.find({ creator: req.user._id });

  res.status(200).json(NFTPrototypes);
};

exports.getCampaignById = async (req, res) => {};
exports.deleteCampaign = async (req, res) => {};
exports.archieveCampaign = async (req, res) => {};

//first finish createCampaign and then this
exports.getAllMyCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({
    creator: req.user._id,
  });

  res.status(200).json(campaigns);
};

exports.getAllCampaigns = async (req, res) => {
  const campaigns = await Campaign.find({});

  res.status(200).json(campaigns);
};
