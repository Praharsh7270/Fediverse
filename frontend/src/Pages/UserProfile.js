
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaHeart, FaComment, FaTh, FaBookmark, FaUserTag } from "react-icons/fa";

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('posts');


  const currentUsername = localStorage.getItem("username");
  const isOwnProfile = currentUsername === username;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.REACT_APP_API_URL;
        const headers = {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        };

        // 1. Fetch User Details
        const userRes = await axios.get(`${baseUrl}/users/${username}`, { headers });
        setUser(userRes.data);

        // 2. Fetch User Posts (Outbox)
        const postsRes = await axios.get(`${baseUrl}/users/${username}/outbox`, {
          headers: { ...headers, Accept: "application/activity+json" }
        });
        const postsData = postsRes.data?.orderedItems || [];
        setPosts(postsData);

        // 3. Fetch Followers Count
        let followersCount = 0;
        try {
          const followersRes = await axios.get(`${baseUrl}/users/${username}/followers`, {
            headers: { ...headers, Accept: "application/activity+json" }
          });
          followersCount = followersRes.data.totalItems || (followersRes.data.orderedItems ? followersRes.data.orderedItems.length : 0);
        } catch (e) { console.error("Error fetching followers", e); }

        // 4. Fetch Following Count
        let followingCount = 0;
        try {
          const followingRes = await axios.get(`${baseUrl}/users/${username}/following`, {
            headers: { ...headers, Accept: "application/activity+json" }
          });
          followingCount = followingRes.data.totalItems || (followingRes.data.orderedItems ? followingRes.data.orderedItems.length : 0);
        } catch (e) { console.error("Error fetching following", e); }

        setStats({
          followers: followersCount,
          following: followingCount,
          posts: postsData.length
        });

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("User not found or failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  // Demo Content
  const DEMO_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ47hpKa1cmIps_YOLfoS92KzBldAuchoQzcQ&s";

  const DEMO_POSTS = [
    { image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", likes: Array(120), comments: 45 },
    { image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", likes: Array(85), comments: 20 },
    { image: "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", likes: Array(300), comments: 90 },
    { image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", likes: Array(250), comments: 60 },
    { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", likes: Array(150), comments: 33 },
    { image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", likes: Array(90), comments: 10 },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Use demo content if real content is missing
  const displayPosts = posts.length > 0 ? posts : DEMO_POSTS;
  const isDemoContent = posts.length === 0;

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <h3>😕</h3>
        <p className="text-muted">{error}</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "935px" }}>
      {/* Profile Header */}
      <div className="row mb-5">
        {/* Avatar Column */}
        <div className="col-md-4 d-flex justify-content-center align-items-start">
          <div className="position-relative">
            <div
              className="rounded-circle overflow-hidden border p-1"
              style={{ width: "150px", height: "150px", cursor: "pointer" }}
            >
              <img
                src={user?.icon?.url || DEMO_AVATAR}
                alt={user?.username}
                className="w-100 h-100 rounded-circle object-fit-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = DEMO_AVATAR; }}
              />
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="col-md-8">
          {/* Row 1: Username & Actions */}
          <div className="d-flex align-items-center mb-3 flex-wrap">
            <h2 className="fw-light mb-0 me-3">{user?.username}</h2>
            {isOwnProfile ? (
              <div className="d-flex gap-2">
                <button className="btn btn-light border fw-bold px-3 btn-sm">Edit Profile</button>
                <button className="btn btn-light border fw-bold px-3 btn-sm">View Archive</button>
                <button className="btn btn-light border px-2 btn-sm"><i className="fas fa-cog"></i></button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-primary fw-bold px-4 btn-sm">Follow</button>
                <button className="btn btn-light border fw-bold px-3 btn-sm">Message</button>
              </div>
            )}
          </div>

          {/* Row 2: Stats */}
          <div className="d-flex mb-3 gap-4">
            <span className="me-3">
              <span className="fw-bold">{isDemoContent ? DEMO_POSTS.length : stats.posts}</span> posts
            </span>
            <span className="me-3 cursor-pointer" style={{ cursor: 'pointer' }}>
              <Link to={`/followers/${username}`} className="text-decoration-none text-dark">
                <span className="fw-bold">{stats.followers}</span> followers
              </Link>
            </span>
            <span className="cursor-pointer" style={{ cursor: 'pointer' }}>
              <Link to={`/followers/${username}`} className="text-decoration-none text-dark">
                <span className="fw-bold">{stats.following}</span> following
              </Link>
            </span>
          </div>

          {/* Row 3: Bio */}
          <div>
            <div className="fw-bold">{user?.name || user?.displayName || user?.username}</div>
            <div className="text-break" style={{ whiteSpace: "pre-wrap" }}>
              {user?.summary ? (
                <div dangerouslySetInnerHTML={{ __html: user.summary }} />
              ) : (
                <p className="mb-0 text-muted">Digital Creator • Photography • Travel</p>
              )}
            </div>
            {user?.url && (
              <a href={user.url} target="_blank" rel="noopener noreferrer" className="d-block fw-bold text-decoration-none" style={{ color: '#00376b' }}>
                {user.url}
              </a>
            )}
            <div className="text-muted small mt-2">
              <i className="fas fa-calendar-alt me-1"></i>
              Joined {new Date(user?.published || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Story Highlights / Divider (Visual only placeholder) */}
      <div className="d-md-block d-none mb-5 border-bottom"></div>

      {/* Tabs */}
      <div className="d-flex justify-content-center border-top mb-4">
        <div
          className={`d-flex align-items-center py-3 me-5 cursor-pointer ${activeTab === 'posts' ? 'border-top border-dark border-2' : 'text-muted'}`}
          style={{ marginTop: '-1px', cursor: 'pointer', letterSpacing: '1px', fontSize: '12px', fontWeight: 'bold' }}
          onClick={() => setActiveTab('posts')}
        >
          <FaTh className="me-2" size={12} />
          POSTS
        </div>
        <div
          className={`d-flex align-items-center py-3 me-5 cursor-pointer ${activeTab === 'saved' ? 'border-top border-dark border-2' : 'text-muted'}`}
          style={{ marginTop: '-1px', cursor: 'pointer', letterSpacing: '1px', fontSize: '12px', fontWeight: 'bold' }}
          onClick={() => setActiveTab('saved')} // Placeholder functionality
        >
          <FaBookmark className="me-2" size={12} />
          SAVED
        </div>
        <div
          className={`d-flex align-items-center py-3 cursor-pointer ${activeTab === 'tagged' ? 'border-top border-dark border-2' : 'text-muted'}`}
          style={{ marginTop: '-1px', cursor: 'pointer', letterSpacing: '1px', fontSize: '12px', fontWeight: 'bold' }}
          onClick={() => setActiveTab('tagged')} // Placeholder functionality
        >
          <FaUserTag className="me-2" size={12} />
          TAGGED
        </div>
      </div>

      {/* Posts Grid */}
      {activeTab === 'posts' ? (
        <div className="row g-1 g-md-4">
          {displayPosts.map((post, index) => {
            const hasImage = post.image || post.imageUrl || (post.attachment && post.attachment.length > 0 && post.attachment[0].url);
            // Create a thumbnail or use placeholder if no image
            const displayImage = isDemoContent ? post.image : (hasImage || `https://ui-avatars.com/api/?name=${post.content || "Post"}&background=random&color=fff&size=400`);
            const likesCount = isDemoContent ? post.likes.length : (post.likes ? post.likes.length : 0);
            const commentsCount = isDemoContent ? post.comments : 0; // Placeholder as comments aren't in the list usually

            return (
              <div className="col-4" key={index}>
                <div className="ratio ratio-1x1 position-relative group-hover-container" style={{ cursor: 'pointer' }}>
                  <img
                    src={displayImage}
                    alt="Post"
                    className="w-100 h-100 object-fit-cover"
                  />
                  {/* Hover Overlay */}
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex justify-content-center align-items-center opacity-0 hover-opacity-100 transition-opacity">
                    <div className="text-white d-flex gap-4 fw-bold fs-5">
                      <span className="d-flex align-items-center">
                        <FaHeart className="me-2" /> {likesCount}
                      </span>
                      <span className="d-flex align-items-center">
                        <FaComment className="me-2" /> {commentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5 text-muted">
          <p>Section under construction</p>
        </div>
      )}

      {/* Custom Styles for Hover Effects */}
      <style jsx>{`
        .hover-opacity-100:hover {
            opacity: 1 !important;
        }
        .transition-opacity {
            transition: opacity 0.2s ease-in-out;
        }
    `}</style>
    </div>
  );
};

export default UserProfile;
