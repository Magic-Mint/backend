var express = require('express');
let router = express.Router();
let claimController = require('../controllers/claimController');

router.get('/claim/getAllClaimsByUser', claimController.getAllClaimsByUser);

router.get('/claim/getClaims', claimController.getClaims);

router.get('/claim/getClaimedNFTs', claimController.getClaimedNFTs);

router.get('/claim/claimSingleNFT/:nftId', claimController.claimSingleNFT);

module.exports = router;
