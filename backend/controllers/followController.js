
const axios = require("axios");
const User = require("../models/User");
const { sendSignedRequest } = require("../utils/sendSignedRequest");

exports.sendFollow = async (req, res) => {
  const { username } = req.params;
  const { remoteActorUrl } = req.body;

  try {
    const localUser = await User.findOne({ username });
    if (!localUser) return res.status(404).json({ error: "Local user not found" });

    // Step 1: Fetch remote actor to get inbox
    const actorRes = await axios.get(remoteActorUrl, {
      headers: { Accept: "application/activity+json" },
    });

    const remoteInbox = actorRes.data.inbox;
    if (!remoteInbox) return res.status(400).json({ error: "Remote inbox not found" });

    // Step 2: Create Follow activity
    const followActivity = {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: `${localUser.actorUrl}/follow/${Date.now()}`,
      type: "Follow",
      actor: localUser.actorUrl,
      object: remoteActorUrl,
    };

    // Step 3: Send signed request (this function handles the POST)
    await sendSignedRequest(localUser.username, remoteInbox, followActivity);

    // Step 4: Save the follow locally
    if (!localUser.following.includes(remoteActorUrl)) {
      localUser.following.push(remoteActorUrl);
      await localUser.save();
    }

    res.status(200).json({ message: "Follow request sent", followActivity });

  } catch (err) {
    console.error("❌ Follow error:", err.message);
    res.status(500).json({ error: "Failed to follow remote user" });
  }
};
