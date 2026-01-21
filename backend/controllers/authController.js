
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post"); 
const sendGreetingEmail=require("./mail")


exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  // const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password,
    email,
    actorUrl: `${process.env.BASE_URL}/users/${username}`,
    inbox: `${process.env.BASE_URL}/users/${username}/inbox`,    
    outbox: `${process.env.BASE_URL}/users/${username}/outbox`,   
  });
  sendGreetingEmail(email, username)
  .then(() => console.log("Welcome email sent"))
  .catch((err) => console.error("❌ Failed to send greeting email:", err));

  res.status(201).json({ message: "User created" });
};








exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log("📥 Login attempt:", username, password);

  const user = await User.findOne({ username }).select("+password +privateKey");
  console.log("👤 Found user from DB:", user);

  if (!user || !user.password) {
    console.log("❌ User not found or password missing");
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  console.log("🔐 Password match result:", isMatch);

  if (!isMatch) {
    console.log("❌ Password did not match");
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({
    id: user._id,
    username: user.username,
    actor: `${process.env.BASE_URL}/users/${user.username}`, 
  }, process.env.JWT_SECRET, { expiresIn: "7d" });
  console.log(" Token created:", token);

  const userData = user.toObject();
  delete userData.password;
  delete userData.privateKey;

  return res.json({ token, user: userData });
};



exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Authorization check (for local or remote)
    if (
      post.author?.toString() !== req.user.id &&
      post.actor !== req.user.actor
    ) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
};