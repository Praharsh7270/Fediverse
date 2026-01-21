
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const FollowersPage = () => {
  const { username } = useParams();
  const [view, setView] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // Add current user state

  // Fetch current user (you'll need to implement this based on your auth system)
  useEffect(() => {
    // This is a placeholder - replace with your actual current user fetch logic
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/me'); // Adjust this endpoint
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  const fetchCollection = async (url) => {
    try {
      const headers = {
        Accept: "application/activity+json",
        "ngrok-skip-browser-warning": "true",
      };

      const response = await axios.get(url, { headers });
      console.log(`Response from ${url}:`, response.data);

      if (response.data.orderedItems) {
        return {
          items: response.data.orderedItems,
          total: response.data.totalItems || 0
        };
      } else if (response.data.first?.orderedItems) {
        return {
          items: response.data.first.orderedItems,
          total: response.data.first.totalItems || response.data.totalItems || 0
        };
      } else if (response.data.items) {
        return {
          items: response.data.items,
          total: response.data.totalItems || 0
        };
      } else if (Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length
        };
      }

      return { items: [], total: 0 };
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      throw err;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = process.env.REACT_APP_API_URL || "https://5e52fc7be047.ngrok-free.app";
      const followersUrl = `${baseUrl}/users/${username}/followers`;
      const followingUrl = `${baseUrl}/users/${username}/following`;

      const [followersData, followingData] = await Promise.all([
        fetchCollection(followersUrl),
        fetchCollection(followingUrl)
      ]);

      setFollowers(followersData.items);
      setFollowing(followingData.items);
      setTotalFollowers(followersData.total);
      setTotalFollowing(followingData.total);

    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const removeFollower = async (followerUsername) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "https://5e52fc7be047.ngrok-free.app";
      await axios.delete(`${baseUrl}/users/${username}/followers/${followerUsername}`);
      
      // Update local state
      setFollowers(followers.filter(f => {
        const url = typeof f === 'string' ? f : f.url;
        return !url.endsWith(`/users/${followerUsername}`);
      }));
      setTotalFollowers(totalFollowers - 1);
      
    } catch (err) {
      console.error("Error removing follower:", err);
      setError(err.response?.data?.message || err.message || "Failed to remove follower");
    }
  };

  const unfollowUser = async (followingUsername) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "https://5e52fc7be047.ngrok-free.app";
      await axios.delete(`${baseUrl}/users/${username}/following/${followingUsername}`);
      
      // Update local state
      setFollowing(following.filter(f => {
        const url = typeof f === 'string' ? f : f.url;
        return !url.endsWith(`/users/${followingUsername}`);
      }));
      setTotalFollowing(totalFollowing - 1);
      
    } catch (err) {
      console.error("Error unfollowing user:", err);
      setError(err.response?.data?.message || err.message || "Failed to unfollow user");
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const cleanProfileUrl = (url) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/+$/, "");
    } catch {
      return url.toString().replace(/\/+$/, "");
    }
  };

  const getUsernameFromUrl = (url) => {
    try {
      const cleaned = cleanProfileUrl(url);
      const parts = cleaned.split('/');
      return parts[parts.length - 1] || parts[parts.length - 2] || "user";
    } catch {
      return "user";
    }
  };

  const renderUserItem = (url) => {
    const profileUrl = cleanProfileUrl(url);
    const uname = getUsernameFromUrl(profileUrl);
    const avatarUrl = `https://ui-avatars.com/api/?name=${uname}&background=random&color=fff&size=48`;
    const isCurrentUserProfile = currentUser && currentUser.username === username;

    return (
      <div key={profileUrl} className="list-group-item d-flex align-items-center">
        <img
          src={avatarUrl}
          alt={uname}
          className="rounded-circle me-3"
          style={{ width: 50, height: 50, objectFit: "cover" }}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${uname}&background=random&color=fff&size=48`;
          }}
        />
        <div className="flex-grow-1">
          <strong>@{uname}</strong>
          <div className="text-muted small text-truncate" style={{ maxWidth: "200px" }}>
            {profileUrl}
          </div>
        </div>
        <div className="d-flex gap-2">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline-primary"
          >
            View
          </a>
          {isCurrentUserProfile && (
            view === "followers" ? (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeFollower(uname)}
              >
                Remove
              </button>
            ) : (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => unfollowUser(uname)}
              >
                Unfollow
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  // ... rest of your component code remains the same ...

  return (
    <div className="instagram-theme" style={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
      <header className="navbar navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <a className="navbar-brand mx-auto" href="#">
            <h3 className="m-0" style={{ fontFamily: "cursive" }}>SocialApp</h3>
          </a>
        </div>
      </header>

      <div className="container py-4">
        <div className="row align-items-center">
          <div className="col-md-2 text-center">
            <img
              src={`https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=96`}
              alt="Profile"
              className="rounded-circle"
              style={{ width: "100px", height: "100px", border: "2px solid #e1306c" }}
            />
          </div>
          <div className="col-md-10">
            <h4 className="mb-1">@{username}</h4>
            <div className="d-flex gap-4">
              <span><strong>{totalFollowers}</strong> followers</span>
              <span><strong>{totalFollowing}</strong> following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="btn-group mb-3 w-100" role="group">
          <button
            className={`btn ${view === "followers" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setView("followers")}
          >
            Followers
          </button>
          <button
            className={`btn ${view === "following" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setView("following")}
          >
            Following
          </button>
        </div>
      </div>

      <div className="container pb-5">
        <div className="card shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-3">Loading {view}...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger m-3">
                <strong>Error:</strong> {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={fetchData}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {(view === "followers" ? followers : following).length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    {view === "followers" 
                      ? "No followers yet" 
                      : "Not following anyone"}
                  </div>
                ) : (
                  (view === "followers" ? followers : following).map(renderUserItem)
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="navbar fixed-bottom navbar-light bg-white border-top">
        <div className="container justify-content-center">
          <span className="navbar-text text-muted">
            © {new Date().getFullYear()} SocialApp
          </span>
        </div>
      </nav>
    </div>
  );
};

export default FollowersPage;