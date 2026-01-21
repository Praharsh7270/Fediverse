import React, { useState } from "react";
import axios from "axios";

const RemoteSearch = () => {
  const [handle, setHandle] = useState("");
  const [actor, setActor] = useState(null);
  const [error, setError] = useState(null);

  const resolveActor = async () => {
    try {
      setError(null);
      const [username, domain] = handle.split("@");

      if (!username || !domain) {
        setError("⚠️ Invalid handle format. Use username@domain");
        return;
      }

      const webfingerRes = await axios.get(
        `https://${domain}/.well-known/webfinger?resource=acct:${handle}`
      );

      const actorUrl = webfingerRes.data.links.find(
        (link) => link.rel === "self"
      ).href;

      const actorProfile = await axios.get(actorUrl, {
        headers: {
          Accept: "application/activity+json",
        },
      });

      setActor(actorProfile.data);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to resolve actor.");
      setActor(null);
    }
  };

  const sendFollow = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/follow/remote/${localStorage.getItem("username")}/follow`,
        { remoteActorUrl: actor.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("✅ Follow request sent!");
    } catch (err) {
      console.error("Follow failed:", err.response?.data || err.message);
      alert("❌ Follow failed");
    }
  };

  return (
    <div className="container mt-5 col-md-8">
      <div className="card shadow p-4">
        <h3 className="mb-3 text-center">🌐 Follow a Remote User</h3>

        <div className="input-group mb-3">
          <input
            className="form-control"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g., avdhut_077@mastodon.social"
          />
          <button onClick={resolveActor} className="btn btn-primary">
            🔍 Search
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {actor && (
          <div className="card mt-3 p-3 bg-light border border-success">
            <h5 className="mb-1">@{actor.preferredUsername}</h5>
            <small className="text-muted">{actor.id}</small>
            {actor.summary && (
              <p
                className="mt-2"
                dangerouslySetInnerHTML={{ __html: actor.summary }}
              ></p>
            )}
            <button className="btn btn-success mt-2" onClick={sendFollow}>
               Follow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteSearch;
