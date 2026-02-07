
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const sendEmail = require("../utils/sendEmail");


exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "User already Exist, Please Login" });
  }



  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const verifyOtpExpairy = Date.now() + 10 * 60 * 1000;

  const user = await User.create({
    username,
    password,
    email,
    actorUrl: `${process.env.BASE_URL}/users/${username}`,
    inbox: `${process.env.BASE_URL}/users/${username}/inbox`,
    outbox: `${process.env.BASE_URL}/users/${username}/outbox`,
    isVerified: false,
    verifyOtp: otp,
    verifyOtpExpairy: verifyOtpExpairy
  });

  const mailoption = {
    to: email,
    subject: "Verify your Fediverse account 🔐",
    text: `Hello ${username},

Welcome to Fediverse 👋

Your One-Time Password (OTP) to verify your email is:

👉 ${otp}

This OTP is valid for 10 minutes.
Please do not share it with anyone.

— Team Fediverse`
  }

  try {
    await sendEmail(mailoption);
    console.log("OTP email sent to:", email);
  } catch (err) {
    console.error("OTP email failed:", err.message);

  }

  return res.status(201).json({ success: true, message: "Otp Send to Mail", next: "Verify_OTP" });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, message: "User already verified", next: "Login" });
    }

    if (user.verifyOtp !== otp || user.verifyOtpExpairy < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpairy = undefined;
    await user.save();
    const welcomeHtml = `
<div style="background-color:#0b0b0b; color:#ffffff; padding:40px 20px; font-family:Arial, sans-serif;">
  <table style="max-width:600px; margin:0 auto; border-spacing:0; width:100%;">
    <tr>
      <td style="text-align:center; padding-bottom:25px;">
        <h1 style="margin:0; font-size:26px; color:#4f9cff;">Welcome to Fediverse 🚀</h1>
        <p style="margin-top:10px; font-size:14px; color:#bbbbbb;">Connect. Share. Decentralize.</p>
      </td>
    </tr>
    <tr>
      <td style="background-color:#111111; padding:30px; border-radius:12px;">
        <p style="font-size:16px; line-height:1.6; margin:0 0 15px 0;">Hi ${user.username} 👋,</p>
        <p style="font-size:15px; line-height:1.6; color:#dddddd; margin:0 0 20px 0;">
          Thank you for signing up on <strong>Fediverse</strong> ✨<br>
          We're excited to have you join a decentralized and open community where your voice truly matters.
        </p>
        <div style="text-align:center;">
          <a href="${process.env.DOMAIN || 'http://localhost:3000'}"
             style="display:inline-block; background-color:#4f9cff; color:#ffffff; padding:12px 28px; border-radius:30px; font-size:15px; text-decoration:none; font-weight:bold;">
            Explore Fediverse
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="text-align:center; padding-top:25px;">
        <p style="font-size:13px; color:#888888; margin-top:8px;">— Team Fediverse 💙</p>
      </td>
    </tr>
  </table>
</div>`;

    await sendEmail({
      to: user.email,
      subject: "Welcome to Fediverse! 🚀",
      html: welcomeHtml
    });
    console.log("Welcome email sent to:", user.email);

    return res.status(200).json({ success: true, message: "Email verified successfully", next: "Login" });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};








exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log("📥 Login attempt:", username);

  const user = await User.findOne({ username }).select("+password +privateKey");

  if (!user || !user.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate Token
  const token = jwt.sign({
    id: user._id,
    username: user.username,
    actor: `${process.env.BASE_URL}/users/${user.username}`,
  }, process.env.JWT_SECRET, { expiresIn: "7d" });

  const userData = user.toObject();
  delete userData.password;
  delete userData.privateKey;
  delete userData.verifyOtp;
  delete userData.verifyOtpExpairy;

  // Send Login Alert Email (Async - don't wait for it)
  const alertHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8f9fa;">
      <h3 style="color: #28a745;">New Login Detected</h3>
      <p>Hello ${user.username},</p>
      <p>We noticed a successful login to your account.</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p>If this was you, you can ignore this email.</p>
    </div>
  `;

  sendEmail({
    to: user.email,
    subject: "New Login Alert 🚨",
    html: alertHtml
  }).catch(err => console.error("Login alert email failed", err));

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