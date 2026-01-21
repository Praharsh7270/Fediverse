
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

// Utility to strip HTML from content
const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const OutboxPage = () => {
  const { username } = useParams();
  const { token } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [myActor, setMyActor] = useState(null); // logged-in actor URL

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setMyUserId(decoded.id);
        setMyActor(decoded.actor); // ✅ get actor from JWT
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!username) return;

    const fetchOutbox = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/${username}/outbox`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              Accept: "application/activity+json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (Array.isArray(res.data.orderedItems)) {
          setPosts(res.data.orderedItems);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error("Failed to fetch outbox:", err.message);
      }
    };

    fetchOutbox();
  }, [username, token]);

  const handleDelete = async (rawId) => {
    const postId = rawId.split("/").pop(); // ✅ get only the ID part from full URL

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/auth/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      setPosts((prev) =>
        prev.filter((post) => {
          const thisId = post.id || post._id;
          return thisId !== rawId;
        })
      );
    } catch (err) {
      console.error("Failed to delete post:", err.message);
      alert("Failed to delete the post.");
    }
  };

  const getImageUrl = (post) =>
    post.image ||
    post.imageUrl ||
    post.object?.image ||
    post.attachment?.[0]?.url ||
    post.object?.attachment?.[0]?.url ||
    null;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4" style={{ fontFamily: "cursive" }}>
        📤 Outbox of @{username}
      </h2>

      {posts.length === 0 ? (
        <div className="alert alert-info text-center">No posts found.</div>
      ) : (
        <div className="row justify-content-center">
          {posts.map((post, idx) => {
            const content =
              post.content ||
              post.object?.content ||
              post.object?.caption ||
              post.caption ||
              "No caption";
            const createdAt =
              post.createdAt ||
              post.object?.published ||
              post.published ||
              new Date();
            const rawId = post._id || post.id;

            const authorId = post.author?._id || post.object?.author?._id;
            const actorUrl =
              post.actor ||
              post.object?.actor ||
              post.object?.attributedTo;

            const isOwner =
              (myUserId && authorId === myUserId) ||
              (myActor && actorUrl && myActor === actorUrl);

            return (
              <div key={idx} className="col-md-6 mb-4">
                <div className="card shadow-sm border-0">
                  {getImageUrl(post) && (
                    <img
                      src={getImageUrl(post)}
                      alt="Post"
                      className="card-img-top"
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                  <div className="card-body">
                    <p className="card-text">{stripHtml(content)}</p>
                    <small className="text-muted">
                      🕒 {new Date(createdAt).toLocaleString()}
                    </small>

                    {isOwner && (
                      <button
                        className="btn btn-sm btn-outline-danger float-end"
                        onClick={() => handleDelete(rawId)}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OutboxPage;
 