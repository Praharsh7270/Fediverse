
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const LocalUserSearch = () => {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    const fetchUsersAndFollowing = async () => {
      try {
        // Fetch all users
        const usersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        // Fetch following list (ActivityPub style)
        const followingRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUsername}/following`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const processFollowing = (data) => {
          if (data.orderedItems) return data.orderedItems;
          if (data.first?.orderedItems) return data.first.orderedItems;
          if (Array.isArray(data)) return data;
          return [];
        };

        const followingList = processFollowing(followingRes.data);

        const followingUsernames = followingList.map(url => {
          const parts = url.split('/');
          return parts[parts.length - 1];
        });

        setFollowing(followingUsernames);
        setUsers(usersRes.data.filter(u => u.username !== currentUsername));
      } catch (err) {
        console.error("Error fetching data", err);
        setError("Failed to load users.");
      }
    };

    fetchUsersAndFollowing();
  }, [currentUsername]);

  const followUser = async (username) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/${username}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFollowing(prev => [...prev, username]);
    } catch (err) {
      console.error("Follow failed", err);
      alert("Follow failed");
    }
  };

  const unfollowUser = async (username) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/${username}/unfollow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFollowing(prev => prev.filter(u => u !== username));
    } catch (err) {
      console.error("Unfollow failed", err);
      alert("Unfollow failed");
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="text-center mb-4">
        <h2 style={{ fontFamily: "cursive" }}>📸 Photoflux Network</h2>
        <p className="text-muted">Follow people to see their posts on your feed</p>
      </div>

      {/* Search Bar */}
      <div className="input-group mb-4 shadow-sm">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {filteredUsers.length === 0 ? (
        <p className="text-muted text-center">No users found</p>
      ) : (
        <div className="row g-3">
          {filteredUsers.map((user) => {
            const isFollowing = following.includes(user.username);

            return (
              <div key={user._id} className="col-md-6">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body d-flex align-items-center">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=64`}
                      alt={user.username}
                      className="rounded-circle me-3"
                      style={{ width: "64px", height: "64px" }}
                    />
                    <div className="flex-grow-1">
                      <Link
                        to={`/profile/${user.username}`}
                        className="text-dark text-decoration-none"
                      >
                        <h6 className="mb-1">@{user.username}</h6>
                      </Link>
                      <small className="text-muted">
                        {user.displayName || "No display name"}
                      </small>
                    </div>
                    <div>
                      {isFollowing ? (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => unfollowUser(user.username)}
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => followUser(user.username)}
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-5 text-muted small">
        © {new Date().getFullYear()} Photoflux
      </div>
    </div>
  );
};

export default LocalUserSearch;
