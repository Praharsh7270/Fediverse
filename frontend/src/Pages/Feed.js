
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { FaHeart, FaRegHeart, FaShare, FaSun, FaMoon, FaCommentDots } from "react-icons/fa";

const FeedPage = () => {
  const [feed, setFeed] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const { token } = useContext(AuthContext);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comments
  const [showModal, setShowModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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

  const closeModal = () => {
    setShowModal(false);
    setSelectedPostId(null);
    setNewComment("");
    setComments([]);
  };

  if (loading) {
    return (
      <div className={`d-flex justify-content-center align-items-center min-vh-100 ${darkMode ? "bg-dark" : "bg-light"}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-vh-100 d-flex justify-content-center align-items-center ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
        <div className="alert alert-danger text-center">
          {error}
          <button className="btn btn-sm btn-primary ms-3" onClick={fetchFeed}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">📸 InstaFeed</h3>
          <button className={`btn ${darkMode ? "btn-light" : "btn-dark"}`} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {feed.length === 0 ? (
          <div className="text-center py-5">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">No Posts Yet</h5>
                <p className="card-text">Follow users to see their posts or create your own!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {feed.map((post) => {
              const isLiked = (post.likes || []).includes(userId);
              const likeCount = (post.likes || []).length;
              const hasImage = post.image || post.imageUrl;

              return (
                <div className="col-md-4" key={post._id}>
                  <div className={`card h-100 shadow-sm ${darkMode ? "bg-secondary border-secondary" : ""}`}>
                    {hasImage && (
                      <img
                        src={post.image || post.imageUrl}
                        className="card-img-top"
                        alt="Post content"
                        style={{ height: "250px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300x250?text=Image+Not+Available";
                        }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <h6 className={`card-subtitle mb-2 ${darkMode ? "text-light" : "text-muted"}`}>
                        @{post.author?.username || "unknown"}
                      </h6>
                      <p className="card-text flex-grow-1">{post.caption || "No caption"}</p>

                      <div className="d-flex justify-content-between mt-3">
                        <button className="btn btn-sm p-0 border-0 bg-transparent" onClick={() => handleLike(post._id)}>
                          {isLiked ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-danger" />}
                          <span className="ms-2">{likeCount}</span>
                        </button>
                        <button className="btn btn-sm btn-outline-info" onClick={() => openCommentModal(post._id)}>
                          <FaCommentDots /> Comments
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => copyShareLink(post._id)}>
                          <FaShare /> Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMMENT MODAL */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-scrollable">
            <div className={`modal-content ${darkMode ? "bg-dark text-light" : ""}`}>
              <div className="modal-header">
                <h5 className="modal-title">Comments</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {!Array.isArray(comments) || comments.length === 0 ? (
                  <p>No comments yet.</p>
                ) : (
                  comments.map((comment, index) => (
                    <div key={index} className="mb-2">
                      <strong>@{comment.username || "User"}:</strong> {comment.content}
                    </div>
                  ))
                )}
              </div>
              <div className="modal-footer">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleCommentSubmit}>
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
