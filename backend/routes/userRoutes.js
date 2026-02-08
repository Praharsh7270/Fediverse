const express = require("express");
const router = express.Router();
const {
  loginedUser,
  updateUser,
  getAllUsers,
  getUserById,
  getUserPosts,
  followUser,
  unfollowUser
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/authMiddleware");
const User = require("../models/User");
router.get("/me", verifyToken, loginedUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/:username/follow", verifyToken, followUser);
router.post("/:username/unfollow", verifyToken, unfollowUser);
router.get("/:username/posts", getUserPosts);
router.put("/:id", verifyToken, updateUser);






router.get("/:username/followers", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const followersUrl = `${process.env.DOMAIN}/users/${user.username}/followers`;

    res.set("Content-Type", "application/activity+json");
    return res.json({
      "@context": "https://www.w3.org/ns/activitystreams",
      id: followersUrl,
      type: "OrderedCollection",
      totalItems: user.followers.length,
      first: {
        type: "OrderedCollectionPage",
        totalItems: user.followers.length,
        partOf: followersUrl,
        orderedItems: user.followers, // should be array of actor URLs
      },
    });
  } catch (err) {
    console.error("Error fetching followers:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /users/:username/following
router.get("/:username/following", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const followingUrl = `${process.env.DOMAIN}/users/${user.username}/following`;

    res.set("Content-Type", "application/activity+json");
    return res.json({
      "@context": "https://www.w3.org/ns/activitystreams",
      id: followingUrl,
      type: "OrderedCollection",
      totalItems: user.following.length,
      first: {
        type: "OrderedCollectionPage",
        totalItems: user.following.length,
        partOf: followingUrl,
        orderedItems: user.following, // should be array of actor URLs
      },
    });
  } catch (err) {
    console.error("Error fetching following:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /users/:username/followers/:followerUsername
// Remove follower from :username
router.delete("/:username/followers/:followerUsername", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const follower = await User.findOne({ username: req.params.followerUsername });

    if (!user || !follower) return res.status(404).json({ error: "User not found" });

    // Remove follower from user's followers list
    user.followers = user.followers.filter(f => f !== `${process.env.DOMAIN}/users/${follower.username}`);
    await user.save();

    // Also remove user from follower's following list
    follower.following = follower.following.filter(f => f !== `${process.env.DOMAIN}/users/${user.username}`);
    await follower.save();

    res.status(200).json({ message: "Follower removed" });
  } catch (err) {
    console.error("Error removing follower:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// DELETE /users/:username/following/:followingUsername
// Unfollow someone from :username's following
router.delete("/:username/following/:followingUsername", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const target = await User.findOne({ username: req.params.followingUsername });

    if (!user || !target) return res.status(404).json({ error: "User not found" });

    // Remove target from user's following list
    user.following = user.following.filter(f => f !== `${process.env.DOMAIN}/users/${target.username}`);
    await user.save();

    // Also remove user from target's followers list
    target.followers = target.followers.filter(f => f !== `${process.env.DOMAIN}/users/${user.username}`);
    await target.save();

    res.status(200).json({ message: "Unfollowed user" });
  } catch (err) {
    console.error("Error unfollowing:", err);
    res.status(500).json({ error: "Server error" });
  }
});







module.exports = router;


