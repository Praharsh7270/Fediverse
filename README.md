# 🌍 Photoflux – Fediverse Compatible Photo Sharing Platform

Photoflux is a decentralized, Fediverse-compatible photo sharing social media platform built using the ActivityPub protocol.  
It allows local and remote users (e.g., Mastodon users) to follow, interact, and exchange posts across federated servers.

This project demonstrates real-world implementation of distributed systems, federation, and open social networking standards.

---

## 🔥 Why This Project?

Centralized social networks control user data and content.  
Photoflux explores the future of decentralized social media using:

- Federation instead of central servers  
- Open protocols instead of closed APIs  
- Interoperability across platforms (Mastodon, Pleroma, etc.)

---

## 🚀 Key Features

### Core Platform
- User Registration & JWT Authentication  
- Create, view, and manage photo posts  
- Follow / Unfollow users  
- Like and comment on posts  

### Fediverse / ActivityPub Features
- WebFinger implementation  
- Actor JSON endpoints  
- Inbox / Outbox handling  
- Remote Follow support (Mastodon compatible)  
- HTTP Signatures for secure federation  
- Accept / Follow activity handling  
- Public feed via ActivityPub Outbox  

---

## 🛠️ Tech Stack

### Backend
- Node.js  
- Express.js  
- MongoDB  
- ActivityPub Protocol  
- HTTP Signatures  
- JWT Authentication  

### 4. Frontend Setup

- React  
- Bootstrap  
- Axios  

### Tools
- Ngrok (for federation testing)  
- Postman  
- Git & GitHub  

---
## ⚙️ Project Architecture

```text
[React Frontend]
        |
     REST + JWT
        |
[Express Backend] ---- ActivityPub ----> [Remote Fediverse Servers]
        |
     MongoDB
```

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/photoflux.git
cd photoflux
```
### 2. Backend
```bash
cd backend
npm install
```
### 3. Create a `.env` file:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
BASE_URL=https://your-ngrok-url

```
```bash
npm start
```
### Frontend
```bash

cd frontend
npm install
npm run dev
 
```
---
### ActivityPub Endpoints
WebFinger: /.well-known/webfinger

Actor: /activitypub/users/:username

Inbox: /activitypub/inbox/:username

Outbox: /activitypub/outbox/:username

Followers: /activitypub/followers/:username

Following: /activitypub/following/:username

---
### Tested With

Mastodon remote follow

Remote Accept / Follow flow

Public Outbox feed
---

### Future Enhancements

Full remote post ingestion into local feed

ActivityPub Like & Announce activities

Media federation improvements

Moderation & reporting system

Scalable inbox queue processing
 
---
### Contributing

Contributions are welcome!

Please read CONTRIBUTING.md before submitting pull requests.
 
---
### License

This project is licensed under the MIT License.

---
### Author

Avdhut Magar

---