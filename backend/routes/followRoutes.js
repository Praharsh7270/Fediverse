const express = require("express");
const router = express.Router();
const { sendFollow } = require("../controllers/followController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/users/:username/follow", verifyToken, sendFollow); // Remote actors
router.post("/remote/:username/follow", verifyToken, sendFollow);
module.exports = router;

