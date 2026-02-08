# Key Management Documentation

## Overview

This application uses **per-user RSA key pairs** for ActivityPub federation. Each user has their own unique public/private key pair that is generated automatically upon account creation and stored securely in MongoDB.

## Architecture

### Previous Implementation (Removed)
- ❌ **Single shared keypair** (`public.pem`, `private.pem`) for all users
- ❌ Security risk: One compromised key affected all users
- ❌ Federation compatibility issues with some servers

### Current Implementation (Active)
- ✅ **Per-user RSA-2048 key pairs**
- ✅ Private keys stored in database with `select: false` (not returned in queries by default)
- ✅ Public keys exposed via ActivityPub Actor endpoint
- ✅ Keys generated automatically on user registration

---

## Key Generation

### When Keys Are Generated
Keys are automatically generated when a new user is created during the **pre-save hook** in the User model.

**Location**: `backend/models/User.js`

```javascript
userSchema.pre("save", async function (next) {
  // ... password hashing ...
  
  if (!this.publicKey || !this.privateKey) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }
  
  next();
});
```

### Key Specifications
- **Algorithm**: RSA
- **Key Length**: 2048 bits (recommended for ActivityPub)
- **Public Key Format**: SPKI (Subject Public Key Info) in PEM
- **Private Key Format**: PKCS#8 in PEM
- **Signature Algorithm**: RSA-SHA256

---

## Key Storage

### Database Schema

**Model**: `User` (`backend/models/User.js`)

```javascript
{
  username: String,
  password: String (select: false),
  email: String,
  actorUrl: String,
  publicKey: String,              // ✅ Public key (visible)
  privateKey: String (select: false),  // 🔒 Private key (hidden by default)
  followers: [String],
  following: [String]
}
```

### Security Measures

1. **Private Key Protection**
   - `select: false` prevents accidental inclusion in queries
   - Must explicitly use `.select("+privateKey")` to retrieve
   - Never sent in API responses

2. **Access Control**
   - Private keys only accessed during:
     - Outgoing ActivityPub signature generation
     - Federation activities (Follow, Create, etc.)
   - Never exposed to frontend or API responses

3. **Query Examples**
   ```javascript
   // ❌ Private key NOT included
   const user = await User.findOne({ username: "alice" });
   
   // ✅ Private key INCLUDED (only when needed)
   const user = await User.findOne({ username: "alice" }).select("+privateKey");
   ```

---

## Key Usage

### 1. Public Key Distribution

Public keys are distributed via the **ActivityPub Actor endpoint**.

**Endpoint**: `GET /users/:username`

**Controller**: `backend/controllers/activityPubController.js`

```javascript
exports.actor = async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  
  res.json({
    "@context": ["https://www.w3.org/ns/activitystreams"],
    id: `${process.env.BASE_URL}/users/${username}`,
    type: "Person",
    preferredUsername: username,
    publicKey: {
      id: `${process.env.BASE_URL}/users/${username}#main-key`,
      owner: `${process.env.BASE_URL}/users/${username}`,
      publicKeyPem: user.publicKey  // ← User's public key
    }
  });
};
```

**Example Response**:
```json
{
  "@context": ["https://www.w3.org/ns/activitystreams"],
  "id": "https://your-instance.com/users/alice",
  "type": "Person",
  "preferredUsername": "alice",
  "inbox": "https://your-instance.com/users/alice/inbox",
  "publicKey": {
    "id": "https://your-instance.com/users/alice#main-key",
    "owner": "https://your-instance.com/users/alice",
    "publicKeyPem": "-----BEGIN PUBLIC KEY-----\n..."
  }
}
```

### 2. HTTP Signature Generation

Private keys are used to **sign outgoing ActivityPub requests** (Follow, Create, Accept, etc.).

**Utility**: `backend/utils/sendSignedRequest.js`

```javascript
const sendSignedRequest = async (actorUsername, inboxUrl, activity) => {
  // 1. Fetch user's private key
  const user = await User.findOne({ username: actorUsername }).select("+privateKey");
  if (!user || !user.privateKey) {
    throw new Error(`Private key not found for user: ${actorUsername}`);
  }

  // 2. Create signature string
  const date = new Date().toUTCString();
  const digest = crypto.createHash("sha256")
    .update(JSON.stringify(activity))
    .digest("base64");

  const signatureHeaders = `(request-target): post ${new URL(inboxUrl).pathname}
host: ${new URL(inboxUrl).host}
date: ${date}
digest: SHA-256=${digest}`;

  // 3. Sign with user's private key
  const signer = crypto.createSign("rsa-sha256");
  signer.update(signatureHeaders);
  signer.end();
  const signature = signer.sign(user.privateKey).toString("base64");

  // 4. Send signed request
  await axios.post(inboxUrl, activity, { headers });
};
```

### 3. Signature Verification (Incoming)

When receiving ActivityPub activities, remote servers verify signatures using our public keys.

**Flow**:
1. Remote server sends signed request to our inbox
2. We fetch their public key from their Actor endpoint
3. We verify the signature matches the request
4. ⚠️ **Currently not implemented** (See Security Considerations)

---

## Federation Flow

### Outgoing Activities (e.g., Follow Request)

```
┌─────────────┐
│ Local User  │
│ @alice      │
└──────┬──────┘
       │ 1. Click "Follow @bob@mastodon.social"
       ↓
┌─────────────────────────────────────┐
│ followController.js                 │
│ - Fetch Alice's private key from DB │
│ - Create Follow activity            │
│ - Sign request with Alice's key     │
└──────┬──────────────────────────────┘
       │ 2. POST to remote inbox (signed)
       ↓
┌─────────────────────────┐
│ mastodon.social/inbox   │
│ - Verify Alice's signature│
│ - Fetch Alice's public key│
│ - Validate signature     │
│ - Add Alice as follower  │
│ - Send Accept activity   │
└─────────────────────────┘
```

### Incoming Activities (e.g., Follow from Remote)

```
┌─────────────────────────┐
│ Remote User             │
│ @bob@mastodon.social    │
└──────┬──────────────────┘
       │ 1. Follow @alice (local user)
       ↓
┌─────────────────────────────────────┐
│ /users/alice/inbox                  │
│ - Receive signed Follow activity    │
│ - ⚠️ TODO: Verify Bob's signature    │
│ - Add Bob to Alice's followers      │
│ - Send Accept (signed with Alice's key)│
└─────────────────────────────────────┘
```

---

## Security Considerations

### Implemented ✅
1. **Per-user key isolation** - Each user has unique keys
2. **Private key protection** - `select: false` in schema
3. **Secure key generation** - Using Node.js crypto module (2048-bit RSA)
4. **HTTP Signature signing** - All outgoing requests signed
5. **Key validation** - Username validation prevents key mix-ups

### Not Yet Implemented ⚠️
1. **Signature verification on incoming requests** (Critical!)
   - Currently accepts unsigned/unverified activities
   - Risk: Anyone can impersonate remote actors
   - **Action Required**: Implement verification in inbox handler

2. **Key rotation** - No mechanism to rotate/regenerate keys
3. **Key backup/recovery** - Keys lost if database corrupted
4. **Key revocation** - No way to invalidate compromised keys

---

## Troubleshooting

### Common Key-Related Issues

#### 1. "Private key not found for user"
**Cause**: User created before key management migration, or database corruption

**Solution**:
```javascript
// Manually regenerate keys for existing user
const user = await User.findOne({ username: "alice" }).select("+privateKey");
if (!user.publicKey || !user.privateKey) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  user.publicKey = publicKey;
  user.privateKey = privateKey;
  await user.save();
}
```

#### 2. "Invalid username: username cannot be undefined"
**Cause**: Username not properly passed to signing function

**Solution**: Ensure username is always provided when calling `sendSignedRequest()`

#### 3. Remote server rejects Follow request
**Possible Causes**:
- Public key not accessible (check Actor endpoint)
- Signature format incorrect
- BASE_URL/DOMAIN mismatch
- Date header too far off (clock skew)

**Debug Steps**:
```bash
# 1. Verify Actor endpoint is accessible
curl -H "Accept: application/activity+json" https://your-instance.com/users/alice

# 2. Check public key is valid PEM format
# Should see: -----BEGIN PUBLIC KEY----- ... -----END PUBLIC KEY-----

# 3. Verify signature headers
# Check server logs for outgoing request details
```

#### 4. "Public key not configured"
**Cause**: User record missing public key

**Solution**: Re-save user to trigger key generation:
```javascript
const user = await User.findOne({ username: "alice" });
await user.save(); // Triggers pre-save hook
```

---

## Migration Guide

### From Shared Keys to Per-User Keys

If migrating from the old shared key system:

1. **Backup database**
   ```bash
   mongodump --uri="mongodb://localhost:27017/fediverse" --out=backup/
   ```

2. **Generate keys for existing users**
   ```javascript
   const crypto = require("crypto");
   const User = require("./models/User");
   
   async function migrateKeys() {
     const users = await User.find({}).select("+privateKey");
     
     for (const user of users) {
       if (!user.publicKey || !user.privateKey) {
         const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
           modulusLength: 2048,
           publicKeyEncoding: { type: "spki", format: "pem" },
           privateKeyEncoding: { type: "pkcs8", format: "pem" },
         });
         user.publicKey = publicKey;
         user.privateKey = privateKey;
         await user.save();
         console.log(`✅ Generated keys for ${user.username}`);
       }
     }
   }
   
   migrateKeys().then(() => console.log("Migration complete"));
   ```

3. **Remove old PEM files**
   ```bash
   rm backend/public.pem backend/private.pem
   ```

4. **Update remote followers**
   - Remote instances cache public keys
   - May need to re-follow from remote instances
   - Old follows might fail until cache expires

---

## Testing Checklist

### Local Testing
- [ ] New user registration generates keys
- [ ] Public key visible in Actor endpoint
- [ ] Private key NOT visible in API responses
- [ ] User can create posts
- [ ] User can follow local users

### Federation Testing
- [ ] Remote server can fetch Actor endpoint
- [ ] Can send Follow request to remote user (Mastodon, Pleroma, etc.)
- [ ] Remote user sees and accepts Follow
- [ ] Can post content that appears on remote server
- [ ] Can receive posts from remote user
- [ ] Images federate properly in both directions
- [ ] No "signature verification failed" errors

### Security Testing
- [ ] Private key never exposed in logs
- [ ] Cannot retrieve private key via API
- [ ] Signature validation works with third-party tools
- [ ] Multiple users can federate simultaneously without key conflicts

---

## Best Practices

1. **Never log private keys** - Remove any `console.log()` calls that might expose keys
2. **Monitor key usage** - Track failed signature attempts
3. **Regular backups** - Database backups include all keys
4. **Secure database** - Encrypt MongoDB connections, use authentication
5. **Key length** - 2048-bit minimum, consider 4096-bit for higher security
6. **Signature expiration** - Validate Date header (reject if >5 minutes old)

---

## References

- [ActivityPub Specification](https://www.w3.org/TR/activitypub/)
- [HTTP Signatures (Draft)](https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures)
- [Mastodon Federation Guide](https://docs.joinmastodon.org/spec/activitypub/)
- [Security Considerations for ActivityPub](https://www.w3.org/TR/activitypub/#security-considerations)

---

**Last Updated**: February 8, 2026  
**Version**: 2.0 (Per-User Keys)  
**Status**: Active Implementation
