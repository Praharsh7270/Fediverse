const Comment = require('../models/Reply');
const User = require('../models/User');

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required.' });
    }

    // Fetch username of the logged-in user
    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const comment = new Comment({
      post: postId,
      author: userId,
      username: user.username, // store username in DB
      content,
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error('❌ Error creating comment:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 }); // no need to populate anymore

    res.json(comments);
  } catch (err) {
    console.error('❌ Error fetching comments:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};
