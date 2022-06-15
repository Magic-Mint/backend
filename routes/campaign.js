var express = require('express');
let router = express.Router();
let campaignController = require('../controllers/campaignController');

router.get('/campaign/allCampaigns', campaignController.getAllCampaigns);

router.get('/campaign/myCampaigns', campaignController.getAllMyCampaigns);

router.get('/campaign/getById/:id', campaignController.getCampaignById);


router.get('/campaign/getNFTPrototype', campaignController.getNFTPrototypeCreatedByUser);

router.post('/campaign/create', campaignController.createCampaign);

router.post('/campaign/createNFT', campaignController.createNFT);

router.post('/campaign/archive', campaignController.archieveCampaign);

router.post('/campaign/delete', campaignController.deleteCampaign);

module.exports = router;
