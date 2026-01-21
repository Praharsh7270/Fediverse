// utils/keys.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const keysDir = path.join(__dirname, "../data/keys");
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Generate and store private key if not exists
function generateKeyPair(username) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const privatePem = privateKey.export({ type: "pkcs8", format: "pem" });
  const publicPem = publicKey.export({ type: "spki", format: "pem" });

  const privatePath = path.join(keysDir, `${username}_private.pem`);
  const publicPath = path.join(keysDir, `${username}_public.pem`);

  fs.writeFileSync(privatePath, privatePem);
  fs.writeFileSync(publicPath, publicPem);

  return { privatePem, publicPem };
}

function getPrivateKeyForUser(username) {
  const privatePath = path.join(keysDir, `${username}_private.pem`);

  if (fs.existsSync(privatePath)) {
    return fs.readFileSync(privatePath, "utf8");
  }

  // Generate new key pair if not found
  const { privatePem } = generateKeyPair(username);
  return privatePem;
}

function getPublicKeyForUser(username) {
  const publicPath = path.join(keysDir, `${username}_public.pem`);

  if (fs.existsSync(publicPath)) {
    return fs.readFileSync(publicPath, "utf8");
  }

  const { publicPem } = generateKeyPair(username);
  return publicPem;
}

module.exports = {
  getPrivateKeyForUser,
  getPublicKeyForUser,
};
