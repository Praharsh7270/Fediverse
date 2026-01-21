import React, { useState } from "react";
import axios from "axios";

function InboxDebug() {
  const [targetUsername, setTargetUsername] = useState("");
  const [activity, setActivity] = useState("");

  const sendToInbox = async () => {
    try {
      const inboxUrl = `/api/users/${targetUsername}/inbox`;
      await axios.post(inboxUrl, JSON.parse(activity), {
        headers: { "Content-Type": "application/activity+json" },
      });
      alert("Sent to inbox");
    } catch (err) {
      console.error(err);
      alert("Inbox post failed");
    }
  };

  return (
    <div className="container mt-4">
      <h4>Inbox Debugger</h4>
      <div className="mb-3">
        <label>Target Username</label>
        <input
          className="form-control"
          value={targetUsername}
          onChange={(e) => setTargetUsername(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label>Raw ActivityPub JSON</label>
        <textarea
          className="form-control"
          rows={6}
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />
      </div>
      <button className="btn btn-danger" onClick={sendToInbox}>
        Send
      </button>
    </div>
  );
}

export default InboxDebug;
