# Fediverse API Documentation

This document describes all available API endpoints in the Fediverse backend.

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [User Endpoints](#user-endpoints)
- [Post Endpoints](#post-endpoints)
- [Comment Endpoints](#comment-endpoints)
- [Reply Endpoints](#reply-endpoints)
- [Feed Endpoints](#feed-endpoints)
- [Follow Endpoints](#follow-endpoints)
- [ActivityPub Endpoints](#activitypub-endpoints)

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Auth:** No

**Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Otp Send to Mail",
  "next": "Verify_OTP"
}
```

---

### Verify OTP
**POST** `/api/auth/verify-otp`

**Auth:** No

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "next": "Login"
}
```

---

### Login
**POST** `/api/auth/login`

**Auth:** No

**Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "actorUrl": "http://localhost:4000/users/john_doe",
    "inbox": "http://localhost:4000/users/john_doe/inbox",
    "outbox": "http://localhost:4000/users/john_doe/outbox"
  }
}
```

---

### Forgot Password
**POST** `/api/auth/forgot-password`

**Auth:** No

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

---

### Reset Password
**POST** `/api/auth/reset-password`

**Auth:** No

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login."
}
```

---

### Delete Post (Auth)
**DELETE** `/api/auth/posts/:postId`

**Auth:** Required

**Response:**
```json
{
  "message": "Post deleted"
}
```

---

## User Endpoints

### Get All Users
**GET** `/api/users/`

**Auth:** No

**Query Parameters:**
- `currentUser` (optional): Username of the current user to exclude from results

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "jane_doe",
    "displayName": "Jane Doe"
  }
]
```

---

### Get User By ID
**GET** `/api/users/:id`

**Auth:** No

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "displayName": "John Doe",
  "actorUrl": "http://localhost:4000/users/john_doe",
  "followers": [],
  "following": []
}
```

---

### Follow User
**POST** `/api/users/:username/follow`

**Auth:** Required

**Response:**
```json
{
  "message": "Followed successfully"
}
```

---

### Unfollow User
**POST** `/api/users/:username/unfollow`

**Auth:** Required

**Response:**
```json
{
  "message": "Unfollowed successfully"
}
```

---

### Get User Posts
**GET** `/api/users/:username/posts`

**Auth:** No

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "caption": "Hello world!",
    "imageUrl": "https://cloudinary.com/image.jpg",
    "author": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "john_doe"
    },
    "createdAt": "2026-02-09T15:10:30.000Z"
  }
]
```

---

### Get User Followers
**GET** `/api/users/:username/followers`

**Auth:** No

**Response:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "http://localhost:4000/users/john_doe/followers",
  "type": "OrderedCollection",
  "totalItems": 5,
  "first": {
    "type": "OrderedCollectionPage",
    "totalItems": 5,
    "partOf": "http://localhost:4000/users/john_doe/followers",
    "orderedItems": [
      "http://localhost:4000/users/jane_doe",
      "http://example.com/users/remote_user"
    ]
  }
}
```

---

### Get User Following
**GET** `/api/users/:username/following`

**Auth:** No

**Response:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "http://localhost:4000/users/john_doe/following",
  "type": "OrderedCollection",
  "totalItems": 3,
  "first": {
    "type": "OrderedCollectionPage",
    "totalItems": 3,
    "partOf": "http://localhost:4000/users/john_doe/following",
    "orderedItems": [
      "http://localhost:4000/users/jane_doe"
    ]
  }
}
```

---

### Remove Follower
**DELETE** `/api/users/:username/followers/:followerUsername`

**Auth:** No

**Response:**
```json
{
  "message": "Follower removed"
}
```

---

### Remove Following
**DELETE** `/api/users/:username/following/:followingUsername`

**Auth:** No

**Response:**
```json
{
  "message": "Unfollowed user"
}
```

---

## Post Endpoints

### Create Post
**POST** `/api/posts/po`

**Auth:** Required

**Body:** (multipart/form-data)
- `caption`: Post caption text
- `image`: Image file (optional)

**Response:**
```json
{
  "message": "Post created and federated",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "author": "507f1f77bcf86cd799439012",
    "actor": "http://localhost:4000/users/john_doe",
    "caption": "Hello world!",
    "imageUrl": "https://cloudinary.com/image.jpg",
    "to": ["https://www.w3.org/ns/activitystreams#Public"],
    "remote": false,
    "createdAt": "2026-02-09T15:10:30.000Z"
  }
}
```

---

### Get Feed
**GET** `/api/posts/feed`

**Auth:** Required

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "actor": "http://localhost:4000/users/john_doe",
    "author": {
      "username": "john_doe",
      "displayName": "John Doe"
    },
    "imageUrl": "https://cloudinary.com/image.jpg",
    "caption": "Hello world!",
    "createdAt": "2026-02-09T15:10:30.000Z"
  }
]
```

---

### Like Post
**POST** `/api/posts/:postId/like`

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "liked": true,
  "likes": 5
}
```

---

### Unlike Post
**DELETE** `/api/posts/:postId/like`

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "liked": false,
  "likes": 4
}
```

---

## Comment Endpoints

### Create Comment
**POST** `/api/posts/:postId/comment`

**Auth:** Required

**Body:**
```json
{
  "content": "Nice post!"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "post": "507f1f77bcf86cd799439012",
  "author": "507f1f77bcf86cd799439013",
  "username": "john_doe",
  "content": "Nice post!",
  "createdAt": "2026-02-09T15:10:30.000Z"
}
```

---

### Get Comments by Post
**GET** `/api/posts/:postId/comment`

**Auth:** No

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "post": "507f1f77bcf86cd799439012",
    "author": "507f1f77bcf86cd799439013",
    "username": "john_doe",
    "content": "Nice post!",
    "createdAt": "2026-02-09T15:10:30.000Z"
  }
]
```

---

## Reply Endpoints

### Create Reply
**POST** `/replies/:postId/reply`

**Auth:** Required

**Body:**
```json
{
  "caption": "Great post!"
}
```

**Response:**
```json
{
  "message": "Reply created",
  "reply": {
    "_id": "507f1f77bcf86cd799439011",
    "post": "507f1f77bcf86cd799439012",
    "caption": "Great post!",
    "author": "507f1f77bcf86cd799439013",
    "actor": "http://localhost:4000/users/john_doe",
    "createdAt": "2026-02-09T15:10:30.000Z"
  }
}
```

---

### Get Replies for Post
**GET** `/replies/:postId/replies`

**Auth:** No

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "post": "507f1f77bcf86cd799439012",
    "caption": "Great post!",
    "author": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "john_doe"
    },
    "createdAt": "2026-02-09T15:10:30.000Z"
  }
]
```

---

## Feed Endpoints

### Get User Feed
**GET** `/api/feed/:username`

**Auth:** Required

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "content": "Hello from the fediverse!",
    "image": "https://cloudinary.com/image.jpg",
    "author": {
      "username": "john_doe",
      "displayName": "John Doe"
    },
    "createdAt": "2026-02-09T15:10:30.000Z",
    "remote": false
  }
]
```

---

## Follow Endpoints

### Send Follow Request (Remote)
**POST** `/follow/users/:username/follow`

**Auth:** Required

**Body:**
```json
{
  "remoteActorUrl": "https://mastodon.social/users/someone"
}
```

**Response:**
```json
{
  "message": "Follow request sent",
  "followActivity": {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "http://localhost:4000/users/john_doe/follow/1707502230000",
    "type": "Follow",
    "actor": "http://localhost:4000/users/john_doe",
    "object": "https://mastodon.social/users/someone"
  }
}
```

---

### Send Follow Request (Alternative Route)
**POST** `/follow/remote/:username/follow`

**Auth:** Required

**Body:**
```json
{
  "remoteActorUrl": "https://mastodon.social/users/someone"
}
```

**Response:**
```json
{
  "message": "Follow request sent",
  "followActivity": {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": "http://localhost:4000/users/john_doe/follow/1707502230000",
    "type": "Follow",
    "actor": "http://localhost:4000/users/john_doe",
    "object": "https://mastodon.social/users/someone"
  }
}
```

---

## ActivityPub Endpoints

### WebFinger
**GET** `/.well-known/webfinger`

**Auth:** No

**Query Parameters:**
- `resource`: acct:username@domain

**Response:**
```json
{
  "subject": "acct:john_doe@localhost:4000",
  "links": [
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "http://localhost:4000/users/john_doe"
    }
  ]
}
```

---

### Get Actor
**GET** `/users/:username`

**Auth:** No

**Response:**
```json
{
  "@context": ["https://www.w3.org/ns/activitystreams"],
  "id": "http://localhost:4000/users/john_doe",
  "type": "Person",
  "preferredUsername": "john_doe",
  "inbox": "http://localhost:4000/users/john_doe/inbox",
  "outbox": "http://localhost:4000/users/john_doe/outbox",
  "followers": "http://localhost:4000/users/john_doe/followers",
  "following": "http://localhost:4000/users/john_doe/following",
  "publicKey": {
    "id": "http://localhost:4000/users/john_doe#main-key",
    "owner": "http://localhost:4000/users/john_doe",
    "publicKeyPem": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
  }
}
```

---

### User Inbox
**POST** `/users/:username/inbox`

**Auth:** No (ActivityPub signature verification)

**Body:** ActivityPub Activity (Follow, Create, etc.)

**Response:**
- `202 Accepted` - Activity processed
- `201 Created` - Post created from remote activity

---

### User Inbox (GET)
**GET** `/users/:username/inbox`

**Auth:** No

**Response:**
- `202 Accepted`

---

### User Outbox
**GET** `/users/:username/outbox`

**Auth:** No

**Response:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "OrderedCollection",
  "totalItems": 10,
  "orderedItems": [
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "http://localhost:4000/posts/507f1f77bcf86cd799439011",
      "type": "Create",
      "actor": "http://localhost:4000/users/john_doe",
      "published": "2026-02-09T15:10:30.000Z",
      "to": ["https://www.w3.org/ns/activitystreams#Public"],
      "object": {
        "id": "http://localhost:4000/posts/507f1f77bcf86cd799439011",
        "type": "Note",
        "attributedTo": "http://localhost:4000/users/john_doe",
        "content": "Hello world!",
        "published": "2026-02-09T15:10:30.000Z",
        "attachment": [
          {
            "type": "Image",
            "mediaType": "image/jpeg",
            "url": "https://cloudinary.com/image.jpg"
          }
        ]
      }
    }
  ]
}
```

---

### Get Followers (ActivityPub)
**GET** `/users/:username/followers`

**Auth:** No

**Response:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "OrderedCollection",
  "totalItems": 5,
  "items": [
    "http://localhost:4000/users/jane_doe",
    "https://mastodon.social/users/someone"
  ]
}
```

---

### Get Following (ActivityPub)
**GET** `/users/:username/following`

**Auth:** No

**Response:**
```json
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "type": "OrderedCollection",
  "totalItems": 3,
  "items": [
    "http://localhost:4000/users/jane_doe",
    "https://mastodon.social/users/someone"
  ]
}
```

---

### Delete Post (ActivityPub)
**DELETE** `/users/:id`

**Auth:** Required

**Response:**
```json
{
  "message": "Post deleted"
}
```

---

## Authentication Notes

Endpoints marked with **Auth: Required** need a JWT token in the Authorization header:

```text
Authorization: Bearer <your-jwt-token>
```

The token is obtained from the `/api/auth/login` endpoint.

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid request data"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "error": "Not authorized"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```