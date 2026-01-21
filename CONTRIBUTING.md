## Ngrok Setup (Required for Federation)

ActivityPub federation requires a public HTTPS URL.  
We use ngrok to expose the local server.

1. Install ngrok  
   https://ngrok.com/download  

2. Start backend server  
   cd backend  
   npm run dev  

3. In a new terminal, run:  
   ngrok http 4000  

4. Copy the HTTPS URL provided by ngrok  
   Example: https://abcd1234.ngrok.io  

5. Update your .env file:

BASE_URL=https://abcd1234.ngrok.io

⚠️ Note: Do not use localhost for ActivityPub actor URLs.  
Always use the ngrok public HTTPS URL.
