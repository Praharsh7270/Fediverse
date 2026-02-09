
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHeart, 
  FaRegHeart, 
  FaShare, 
  FaSun, 
  FaMoon, 
  FaCommentDots,
  FaTrash,
  FaEdit,
  FaTimes
} from "react-icons/fa";

const feedContainerVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const feedItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 10, scale: 0.98 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const FeedPage = () => {
  const [feed, setFeed] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const { token, user: authUser } = useContext(AuthContext);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comments
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.id);
        }
        await fetchFeed();
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize. Please refresh the page.");
      }
    };
    initialize();
  }, [token]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setFeed(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError("Failed to load feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!token || !postId) return;

    try {
      setFeed(prevFeed =>
        prevFeed.map(post => {
          if (post._id === postId) {
            const likesArray = post.likes || [];
            const isLiked = likesArray.includes(userId);
            return {
              ...post,
              likes: isLiked
                ? likesArray.filter(id => id !== userId)
                : [...likesArray, userId]
            };
          }
          return post;
        })
      );

      const targetPost = feed.find(p => p._id === postId);
      const currentLikes = targetPost?.likes || [];
      const method = currentLikes.includes(userId) ? "delete" : "post";

      await axios({
        method,
        url: `${process.env.REACT_APP_API_URL}/api/posts/${postId}/like`,
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
    } catch (err) {
      console.error("Like action failed:", err);
      fetchFeed();
    }
  };

  const copyShareLink = (postId) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
    alert("Link copied to clipboard!");
  };

  const openCommentModal = async (postId) => {
    setSelectedPostId(postId);
    setShowModal(true);
    setEditingComment(null);
    setEditCommentText("");

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts/${postId}/comment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const commentsArray = Array.isArray(res.data) ? res.data : [];
      setComments(commentsArray);
    } catch (err) {
      console.error("❌ Failed to fetch comments", err);
      setComments([]);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts/${selectedPostId}/comment`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(prev => [...prev, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("❌ Failed to post comment", err);
    }
  };

  // Delete Comment Function
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Remove comment from state
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error("❌ Failed to delete comment", err);
      alert("Failed to delete comment");
    }
  };

  // Edit Comment Functions
  const startEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.content);
  };

  const cancelEditComment = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/comments/${commentId}`,
        { content: editCommentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update comment in state
      setComments(prev => 
        prev.map(comment => 
          comment._id === commentId ? res.data : comment
        )
      );
      
      setEditingComment(null);
      setEditCommentText("");
    } catch (err) {
      console.error("❌ Failed to edit comment", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPostId(null);
    setNewComment("");
    setComments([]);
    setEditingComment(null);
    setEditCommentText("");
  };

  // Format date to show time ago
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center p-5">
          <div className="display-1 mb-3">😕</div>
          <h4 className="mb-3">Something went wrong</h4>
          <p className="text-muted mb-4">{error}</p>
          <button className="btn btn-primary px-4" onClick={fetchFeed}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light feed-page">
      {/* Modern Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top feed-navbar">
        <div className="container">
          <a className="navbar-brand fw-bold fs-3 text-primary" href="/" style={{ fontFamily: "'Poppins', sans-serif" }}>
            PhotoFlux
          </a>
          
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-secondary rounded-circle me-3 feed-icon-btn"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            
            <div className="dropdown">
              <button 
                className="btn btn-primary rounded-pill px-4 feed-profile-btn"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user me-2"></i>
                Profile
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row">
          {/* Main Feed */}
          <div className="col-lg-8 mx-auto feed-main">
            {feed.length === 0 ? (
              <motion.div
                className="text-center py-5"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <div className="card border-0 shadow-sm feed-empty-card">
                  <div className="card-body py-5">
                    <div className="display-1 text-muted mb-3">📷</div>
                    <h4 className="card-title mb-3">No Posts Yet</h4>
                    <p className="card-text text-muted mb-4">Follow users to see their posts or create your own!</p>
                    <button className="btn btn-primary px-4 feed-cta-btn">
                      Create Your First Post
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="feed-container"
                variants={feedContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                {feed.map((post) => {
                  const isLiked = (post.likes || []).includes(userId);
                  const likeCount = (post.likes || []).length;
                  const hasImage = post.image || post.imageUrl;

                  return (
                    <motion.div
                      className="card mb-4 shadow-sm border-0 rounded-3 overflow-hidden feed-card"
                      key={post._id}
                      variants={feedItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      {/* Post Header */}
                      <div className="card-header bg-white border-0 d-flex align-items-center justify-content-between py-3 feed-post-header">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle overflow-hidden me-3 border border-3 border-primary feed-post-avatar" style={{width: '50px', height: '50px'}}>
                            <img 
                              src={post.author?.profilePic || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
                              alt="Profile"
                              className="w-100 h-100 object-fit-cover"
                            />
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{post.author?.username || "unknown"}</h6>
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              {post.createdAt ? formatDate(post.createdAt) : "Recently"}
                            </small>
                          </div>
                        </div>
                        <button className="btn btn-link text-muted feed-ghost-btn">
                          <i className="fas fa-ellipsis-h"></i>
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="card-body p-0">
                        {/* Post Image */}
                        {hasImage && (
                          <div className="post-image feed-post-image">
                            <img
                              src={post.image || post.imageUrl}
                              className="w-100"
                              alt="Post content"
                              style={{ height: "400px", objectFit: "cover" }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
                              }}
                            />
                          </div>
                        )}

                        {/* Medical Data Display (like your screenshot) */}
                        {post.caption?.includes("Diabetes Care") && (
                          <div className="p-4 border-bottom">
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Pregnancies</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 2</div>
                                </div>
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Blood Pressure</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 70</div>
                                </div>
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Insulin Level</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 85</div>
                                </div>
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Diabetes Pedigree</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 0.45</div>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Glucose Level</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 130</div>
                                </div>
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Skin Thickness</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 32</div>
                                </div>
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">BMI</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 28.5</div>
                                </div>
                                <div className="mb-3">
                                  <small className="text-muted d-block mb-1">Age</small>
                                  <div className="badge bg-info text-white px-3 py-2">e.g. 35</div>
                                </div>
                              </div>
                            </div>
                            <button className="btn btn-success w-100 mt-3">
                              <i className="fas fa-chart-line me-2"></i>
                              Get Prediction
                            </button>
                          </div>
                        )}

                        {/* Post Caption */}
                          <div className="p-4 feed-post-body">
                          <h5 className="fw-bold mb-3">{post.caption || "No caption"}</h5>
                          
                          {/* Post Actions */}
                            <div className="d-flex justify-content-between align-items-center mb-3 feed-actions">
                              <div className="d-flex gap-3 feed-action-group">
                              <button 
                                  className="btn btn-link p-0 text-decoration-none feed-action-btn"
                                onClick={() => handleLike(post._id)}
                              >
                                {isLiked ? (
                                  <FaHeart className="text-danger" size={24} />
                                ) : (
                                  <FaRegHeart className="text-dark" size={24} />
                                )}
                              </button>
                              <button 
                                  className="btn btn-link p-0 text-decoration-none feed-action-btn"
                                onClick={() => openCommentModal(post._id)}
                              >
                                <FaCommentDots className="text-dark" size={24} />
                              </button>
                              <button 
                                  className="btn btn-link p-0 text-decoration-none feed-action-btn"
                                onClick={() => copyShareLink(post._id)}
                              >
                                <FaShare className="text-dark" size={24} />
                              </button>
                            </div>
                              <span className="text-muted feed-like-count">
                              <i className="fas fa-heart text-danger me-1"></i>
                              {likeCount} likes
                            </span>
                          </div>

                          {/* Quick Links (like your screenshot) */}
                          {post.caption?.includes("Diabetes Care") && (
                            <div className="mt-4 pt-3 border-top">
                              <h6 className="fw-bold mb-3">Quick Links</h6>
                              <div className="d-flex flex-wrap gap-2">
                                <a href="#" className="btn btn-outline-primary btn-sm rounded-pill">
                                  View Dashboard
                                </a>
                                <a href="#" className="btn btn-outline-success btn-sm rounded-pill">
                                  Lifestyle Check
                                </a>
                                <a href="#" className="btn btn-outline-info btn-sm rounded-pill">
                                  Explore Data
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* COMMENT MODAL with Delete Feature */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0 rounded-top-4">
                <h5 className="modal-title fw-bold mb-0">
                  <i className="fas fa-comments me-2"></i>
                  Comments
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              
              <div className="modal-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="display-1 text-muted mb-3">💬</div>
                    <h5>No comments yet</h5>
                    <p className="text-muted">Be the first to comment!</p>
                  </div>
                ) : (
                  <div className="p-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="mb-4 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle overflow-hidden me-3" style={{width: '40px', height: '40px'}}>
                              <img 
                                src={comment.user?.profilePic || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`}
                                alt="User"
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold">{comment.user?.username || "User"}</h6>
                              <small className="text-muted">
                                {formatDate(comment.createdAt)}
                              </small>
                            </div>
                          </div>
                          
                          {/* Edit/Delete buttons (only for comment owner or post owner) */}
                          {(comment.user?._id === userId || comment.userId === userId) && (
                            <div className="dropdown">
                              <button 
                                className="btn btn-link text-muted p-0"
                                data-bs-toggle="dropdown"
                              >
                                <i className="fas fa-ellipsis-h"></i>
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => startEditComment(comment)}
                                  >
                                    <FaEdit className="me-2" /> Edit
                                  </button>
                                </li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDeleteComment(comment._id)}
                                  >
                                    <FaTrash className="me-2" /> Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Comment Content - Edit Mode or View Mode */}
                        {editingComment === comment._id ? (
                          <div className="mt-3">
                            <textarea
                              className="form-control mb-2"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              rows="2"
                            />
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => handleEditComment(comment._id)}
                              >
                                Save
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={cancelEditComment}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mb-0 ps-5">{comment.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="modal-footer border-0 bg-light rounded-bottom-4">
                <div className="w-100">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control rounded-pill border-0 shadow-sm"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    />
                    <button 
                      className="btn btn-primary rounded-pill ms-2 px-4"
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .feed-page {
          background: radial-gradient(circle at top, #eef2ff 0%, #f5f7fb 45%, #f8fafc 100%) !important;
        }
        .feed-navbar {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9) !important;
        }
        .feed-icon-btn {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .feed-profile-btn {
          box-shadow: 0 10px 22px rgba(37, 99, 235, 0.2);
        }
        .feed-main {
          max-width: 760px;
        }
        .feed-empty-card {
          border-radius: 20px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .feed-cta-btn {
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
        }
        .feed-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border-radius: 18px;
        }
        .feed-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12) !important;
        }
        .feed-post-header {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .feed-post-avatar {
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
        }
        .feed-ghost-btn {
          border-radius: 999px;
        }
        .feed-post-image {
          position: relative;
          overflow: hidden;
        }
        .feed-post-image::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.25) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .feed-post-image:hover::after {
          opacity: 1;
        }
        .feed-post-image img {
          transition: transform 0.5s ease;
        }
        .feed-post-image:hover img {
          transform: scale(1.04);
        }
        .feed-post-body {
          background: #ffffff;
        }
        .feed-actions .feed-action-btn {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }
        .feed-actions .feed-action-btn:hover {
          background: #e2e8f0;
        }
        .feed-like-count {
          font-weight: 600;
        }
        .badge.bg-info {
          background: linear-gradient(45deg, #17a2b8, #20c997) !important;
          font-size: 0.9rem;
        }
        .modal-content {
          animation: modalSlideIn 0.3s ease-out;
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 992px) {
          .feed-main {
            max-width: 100%;
          }
        }
        @media (max-width: 768px) {
          .feed-navbar .container {
            padding-left: 16px;
            padding-right: 16px;
          }
          .feed-post-image img {
            height: 280px !important;
          }
          .feed-post-body {
            padding: 20px !important;
          }
          .feed-actions {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 10px;
          }
          .feed-action-group {
            gap: 10px !important;
          }
        }
        @media (max-width: 576px) {
          .feed-navbar .container {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 12px;
          }
          .feed-profile-btn {
            width: 100%;
            justify-content: center;
          }
          .feed-post-header {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 10px;
          }
          .feed-post-avatar {
            width: 44px !important;
            height: 44px !important;
          }
          .feed-post-image img {
            height: 220px !important;
          }
          .feed-actions {
            align-items: stretch !important;
          }
          .feed-like-count {
            align-self: flex-start;
          }
        }
      `}</style>
      
      {/* Add Font Awesome for icons */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {/* Add Google Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" 
        rel="stylesheet"
      />
    </div>
  );
};

export default FeedPage;