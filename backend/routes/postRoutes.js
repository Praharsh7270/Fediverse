
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

router.post("/po", verifyToken, upload.single("image"), postController.createPost);  
router.get("/feed", verifyToken, postController.getFeed);                         




router.post("/:postId/like", verifyToken, postController.likePost);

router.delete("/:postId/like", verifyToken, postController.unlikePost);



module.exports = router;
