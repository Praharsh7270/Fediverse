import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Animations ---------------- */
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------- Styles ---------------- */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#0f172a",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "24px 20px 48px",
  },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(12px)",
    background: "rgba(255,255,255,0.85)",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
  },
  topBarInner: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  badge: {
    fontSize: 12,
    color: "#334155",
    background: "#e2e8f0",
    padding: "4px 10px",
    borderRadius: 999,
  },
  profileCard: {
    background: "#ffffff",
    borderRadius: 20,
    padding: "24px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
    border: "1px solid rgba(15,23,42,0.06)",
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 20,
    alignItems: "center",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: "50%",
    border: "4px solid #ffffff",
    boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  handle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 14,
  },
  stats: {
    display: "flex",
    gap: 20,
    fontSize: 14,
    color: "#475569",
  },
  statBox: {
    background: "#f8fafc",
    borderRadius: 12,
    padding: "10px 14px",
    border: "1px solid rgba(15,23,42,0.06)",
  },
  tabsWrap: {
    marginTop: 20,
    background: "#ffffff",
    borderRadius: 14,
    padding: 6,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
  },
  tab: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  listCard: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
    border: "1px solid rgba(15,23,42,0.06)",
  },
  emptyState: {
    padding: 48,
    textAlign: "center",
    color: "#64748b",
  },
  footer: {
    textAlign: "center",
    padding: 18,
    fontSize: 13,
    color: "#94a3b8",
  },
};

/* ---------------- Component ---------------- */
const FollowersPage = () => {
  const { username } = useParams();
  const [view, setView] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [totalFollowing, setTotalFollowing] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  /* -------- Fetch current user (placeholder) -------- */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("/api/me");
        setCurrentUser(res.data);
      } catch {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  /* -------- ActivityPub collection handler -------- */
  const fetchCollection = useCallback(async (url) => {
    /* -------- Normalize ActivityPub item to URL string -------- */
    const normalizeItem = (item) => {
      // ActivityPub responses can be URL strings or actor objects
      if (typeof item === "string") {
        return item;
      }
      // Handle actor objects with id, url, or href properties
      if (typeof item === "object" && item !== null) {
        return item.id || item.url || item.href || null;
      }
      return null;
    };

    const headers = {
      Accept: "application/activity+json",
      "ngrok-skip-browser-warning": "true",
    };

    try {
      const res = await axios.get(url, { headers, timeout: 10000 });

      let items = [];
      let total = 0;

      if (res.data.orderedItems) {
        items = res.data.orderedItems;
        total = res.data.totalItems || 0;
      } else if (res.data.first?.orderedItems) {
        items = res.data.first.orderedItems;
        total = res.data.first.totalItems || res.data.totalItems || 0;
      } else if (res.data.items) {
        items = res.data.items;
        total = res.data.totalItems || 0;
      } else if (Array.isArray(res.data)) {
        items = res.data;
        total = res.data.length;
      }

      // Normalize items to URL strings, filtering out invalid entries
      const normalizedItems = items
        .map(normalizeItem)
        .filter((url) => url !== null);

      return { items: normalizedItems, total };
    } catch (err) {
      console.error(`Error fetching collection from ${url}:`, err);
      return { items: [], total: 0 };
    }
  }, []);

  /* -------- Fetch followers + following -------- */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl =
        process.env.REACT_APP_API_URL ||
        "https://5e52fc7be047.ngrok-free.app";

      const [f1, f2] = await Promise.all([
        fetchCollection(`${baseUrl}/users/${username}/followers`),
        fetchCollection(`${baseUrl}/users/${username}/following`),
      ]);

      setFollowers(f1.items);
      setFollowing(f2.items);
      setTotalFollowers(f1.total);
      setTotalFollowing(f2.total);
    } catch (err) {
      setError("Failed to load followers");
    } finally {
      setLoading(false);
    }
  }, [username, fetchCollection]);

  useEffect(() => {
    fetchData();
  }, [username, fetchData]);

  /* -------- Utils -------- */
  const cleanProfileUrl = (url) => {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}${u.pathname}`.replace(/\/+$/, "");
    } catch {
      return url;
    }
  };

  const getUsernameFromUrl = (url) => {
    const parts = cleanProfileUrl(url).split("/");
    return parts[parts.length - 1] || "user";
  };

  /* -------- Card renderer -------- */
  const renderUserItem = (url) => {
    const profileUrl = cleanProfileUrl(url);
    const uname = getUsernameFromUrl(profileUrl);
    const avatar = `https://ui-avatars.com/api/?name=${uname}&background=random&color=fff&size=64`;
    const isOwnProfile =
      currentUser && currentUser.username === username;

    return (
      <motion.div
        key={profileUrl}
        layout
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          background: "#ffffff",
        }}
      >
        <img
          src={avatar}
          alt={uname}
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            boxShadow: "0 10px 20px rgba(15,23,42,0.18)",
          }}
        />

        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>@{uname}</div>
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {profileUrl}
          </div>
        </div>

        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 13,
            padding: "7px 12px",
            borderRadius: 10,
            border: "1px solid #0ea5e9",
            color: "#0ea5e9",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          View
        </a>

        {isOwnProfile && (
          <button
            style={{
              fontSize: 13,
              padding: "7px 12px",
              borderRadius: 10,
              border: "1px solid #ef4444",
              background: "#fff5f5",
              color: "#ef4444",
              fontWeight: 600,
            }}
          >
            {view === "followers" ? "Remove" : "Unfollow"}
          </button>
        )}
      </motion.div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={styles.page} className="followers-page">
      {/* Header */}
      <div style={styles.topBar} className="followers-topbar">
        <div style={styles.topBarInner} className="followers-topbar-inner">
          <div>SocialApp</div>
          <div style={styles.badge}>Followers Hub</div>
        </div>
      </div>

      <div style={styles.container} className="followers-container">
        {/* Profile */}
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          style={styles.profileCard}
          className="followers-profile-card"
        >
          <img
            src={`https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`}
            alt="profile"
            style={styles.avatar}
            className="followers-avatar"
          />
          <div>
            <div style={styles.name}>@{username}</div>
            <div style={styles.handle}>
              Discover who follows and who you follow.
            </div>
            <div style={styles.stats} className="followers-stats">
              <div style={styles.statBox} className="followers-stat-box">
                <strong>{totalFollowers}</strong> followers
              </div>
              <div style={styles.statBox} className="followers-stat-box">
                <strong>{totalFollowing}</strong> following
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={styles.tabsWrap} className="followers-tabs">
          {["followers", "following"].map((t) => {
            const active = view === t;
            return (
              <button
                key={t}
                onClick={() => setView(t)}
                style={{
                  ...styles.tab,
                  background: active ? "#0f172a" : "#f8fafc",
                  color: active ? "#ffffff" : "#0f172a",
                }}
                className="followers-tab"
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div style={styles.listCard} className="followers-list">
          {loading ? (
            <div style={styles.emptyState}>Loading...</div>
          ) : error ? (
            <div style={{ ...styles.emptyState, color: "#ef4444" }}>
              {error}
            </div>
          ) : (
            <AnimatePresence>
              {(view === "followers" ? followers : following).length === 0 ? (
                <motion.div
                  style={styles.emptyState}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {view === "followers"
                    ? "No followers yet"
                    : "Not following anyone"}
                </motion.div>
              ) : (
                (view === "followers" ? followers : following).map(
                  renderUserItem
                )
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer} className="followers-footer">
        © {new Date().getFullYear()} SocialApp
      </div>

      <style>{`
        @media (max-width: 768px) {
          .followers-topbar-inner {
            padding: 12px 16px !important;
          }
          .followers-container {
            padding: 16px 14px 32px !important;
          }
          .followers-profile-card {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .followers-avatar {
            margin: 0 auto !important;
          }
          .followers-stats {
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          .followers-stat-box {
            min-width: 120px !important;
          }
          .followers-tabs {
            grid-template-columns: 1fr !important;
          }
          .followers-tab {
            width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .followers-topbar-inner {
            flex-direction: column !important;
            gap: 6px !important;
          }
          .followers-profile-card {
            padding: 18px !important;
          }
          .followers-avatar {
            width: 92px !important;
            height: 92px !important;
          }
          .followers-footer {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FollowersPage;
