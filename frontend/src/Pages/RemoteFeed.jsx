// RemoteFeed.jsx
import React, { useEffect, useState } from "react";
import API from "../utils/api";

function RemoteFeed() {
  const [posts, setPosts] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    API.get(`/api/posts/remote-feed/${username}`)
      .then((res) => setPosts(res.data.feed || []))
      .catch((err) => console.error("Remote feed error", err));
  }, [username]);

  return (
    <div className="container mt-4">
      <h3>Remote Feed (Mastodon)</h3>
      {posts.map((post, i) => (
        <div className="card mb-3" key={i}>
          {post.imageUrl && (
            <img src={post.imageUrl} className="card-img-top" alt="Remote" />
          )}
          <div className="card-body">
            <h6 className="text-muted">@{post.author.username}</h6>
            <p className="card-text">{post.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RemoteFeed;
