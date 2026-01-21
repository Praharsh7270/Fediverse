## Public URL Requirement

ActivityPub requires a publicly accessible HTTPS URL.

Localhost cannot be used for federation.

We use ngrok to expose the local server:

- Start backend on port 4000
- Run: ngrok http 4000
- Use the generated HTTPS URL as BASE_URL
- All actor, inbox, and outbox URLs are generated using this BASE_URL

Mastodon -> https://<ngrok-url>/activitypub/inbox
