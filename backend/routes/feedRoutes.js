const express = require("express");
const router = express.Router();
const { getFeed } = require("../controllers/feedController");
const { verifyToken } = require("../middleware/authMiddleware");
router.get("/feed/:username", verifyToken,getFeed);

module.exports = router;

