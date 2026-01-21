const Post = require('../models/Post');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mime = require("mime-types"); 

const {sendSignedRequest} = require("../utils/sendSignedRequest");




exports.createPost = async (req, res) => {
  const { caption } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const actorUrl = `${process.env.DOMAIN}/users/${user.username}`;

    //  Get image URL from req.file if uploaded
    let imageUrl = "";
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary image URL
    }

    // Create new Post in DB
    const newPost = new Post({
      author: user._id,
      actor: actorUrl,
      caption,
      imageUrl,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      remote: false,
    });

    await newPost.save();

    // Prepare attachment for ActivityPub
    let attachment = [];
    if (imageUrl && typeof imageUrl === "string") {
      const mediaType = mime.lookup(imageUrl) || "image/jpeg";
      attachment.push({
        type: "Image",
        mediaType,
        url: imageUrl,
      });
    }

    // Construct ActivityPub Create activity
    const postActivity = {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: `${process.env.DOMAIN}/posts/${newPost._id}`,
      type: "Create",
      actor: actorUrl,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      object: {
        id: `${process.env.DOMAIN}/posts/${newPost._id}`,
        type: "Note",
        published: newPost.createdAt.toISOString(),
        attributedTo: actorUrl,
        content: caption,
        attachment,
      },
    };

    //  Send to followers
    const followers = user.followers || [];
    for (const followerActor of followers) {
      const inboxUrl = followerActor.endsWith("/inbox")
        ? followerActor
        : `${followerActor}/inbox`;

      try {
        await sendSignedRequest(user.username, inboxUrl, postActivity);
        console.log(` Post sent to ${inboxUrl}`);
      } catch (err) {
        console.error(`❌ Failed to send post to ${inboxUrl}:`, err.message);
      }
    }

    res.status(201).json({
      message: "Post created and federated",
      post: newPost,
    });
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ error: "Server error" });
  }
};






// POST /:postId/like
exports.likePost = async (req, res) => {
  try {
    const userId = req.user.username; 
    const postId = req.params.postId;
    console.log("➡️ likePost triggered | user:", userId, "| postId:", postId);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    return res.status(200).json({
      success: true,
      liked: true,
      likes: post.likes.length,
    });
  } catch (err) {
    console.error("Like error:", err.message);
    res.status(500).json({ error: "Failed to like post" });
  }
};

// DELETE /:postId/like
exports.unlikePost = async (req, res) => {
  try {
    const userId = req.user.username; 
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id !== userId);
      await post.save();
    }

    return res.status(200).json({
      success: true,
      liked: false,
      likes: post.likes.length,
    });
  } catch (err) {
    console.error("Unlike error:", err.message);
    res.status(500).json({ error: "Failed to unlike post" });
  }
};







exports.getFeed = async (req, res) => {
  try {
    const localUser = await User.findById(req.user.id);
    if (!localUser) return res.status(404).json({ message: "User not found" });

    const following = localUser.following || [];

    const localFollowing = following.filter((url) => url.startsWith(process.env.BASE_URL));
    const remoteFollowing = following.filter((url) => !url.startsWith(process.env.BASE_URL));

    // LOCAL POSTS (by you + those you follow)
    const localUsernames = localFollowing.map((url) => url.split("/users/")[1]);
    const localFollowingUsers = await User.find({ username: { $in: localUsernames } });
    const localFollowingIds = localFollowingUsers.map((user) => user._id);

    const localPosts = await Post.find({
      author: { $in: [...localFollowingIds, localUser._id] },
      remote: false
    })
      .sort({ createdAt: -1 })
      .populate("author", "username displayName");

    // REMOTE POSTS (already saved by inbox)
    const remotePosts = await Post.find({
      actor: { $in: remoteFollowing },
      remote: true
    }).sort({ createdAt: -1 });

    // Optional: format remotePosts to match structure of local ones
    const formattedRemotePosts = remotePosts.map((post) => ({
      _id: post._id,
      actor: post.actor,
      author: {
        username: post.actor?.split("/users/")[1],
        displayName: post.actor?.split("/users/")[1]
      },
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt
    }));

    // Combine and sort
    const allPosts = [...localPosts, ...formattedRemotePosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(allPosts);
  } catch (err) {
    console.error("❌ Error in getFeed:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
