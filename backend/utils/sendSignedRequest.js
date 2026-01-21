
// sendSignedRequest.js
const crypto = require("crypto");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const sendSignedRequest = async (actorUsername, inboxUrl, activity) => {
  try {
    const actorUrl = `${process.env.DOMAIN}/users/${actorUsername}`;

    const privateKeyPath = path.join(__dirname, "../private.pem");
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");

    const date = new Date().toUTCString();
    const digest = crypto
      .createHash("sha256")
      .update(JSON.stringify(activity))
      .digest("base64");

    const signatureHeaders = `(request-target): post ${new URL(inboxUrl).pathname}
host: ${new URL(inboxUrl).host}
date: ${date}
digest: SHA-256=${digest}`;

    const signer = crypto.createSign("rsa-sha256");
    signer.update(signatureHeaders);
    signer.end();

    const signature = signer.sign(privateKey).toString("base64");

    const signatureHeader = `keyId="${actorUrl}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature}"`;

    const headers = {
      "Content-Type": "application/activity+json",
      Host: new URL(inboxUrl).host,
      Date: date,
      Digest: `SHA-256=${digest}`,
      Signature: signatureHeader,
    };

    // Actually send the POST request
    await axios.post(inboxUrl, activity, { headers });
    console.log("Signed follow request sent to:", inboxUrl);
  } catch (err) {
    console.error("❌ Failed to send signed request:", err.message);
    throw err;
  }
};

module.exports = { sendSignedRequest };
