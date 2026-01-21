const express = require("express");
const router = express.Router();
const { webfinger}  = require('../controllers/activityPubController');

router.get('/webfinger', webfinger); // Handles /.well-known/webfinger

module.exports = router;
