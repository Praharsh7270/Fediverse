const express = require("express");
const router = express.Router();
const { sendFollow } = require("../controllers/followController");

router.post("/users/:username/follow", sendFollow); // Remote actors
router.post("/remote/:username/follow", sendFollow); 
module.exports = router;

