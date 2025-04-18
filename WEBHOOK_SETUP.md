# Setting Up Supabase Webhooks

This guide explains how to set up Supabase webhooks to notify your backend when authentication events occur.

## Prerequisites

1. Your backend server is running and accessible via a public URL
2. You have a Supabase project set up with authentication enabled

## Steps to Configure Webhooks in Supabase

### 1. Get a Public URL for Your Local Development Server (if needed)

For development, you need a public URL that points to your local server. You can use a service like ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server (assuming it runs on port 5000)
ngrok http 5000
```

This will give you a URL like `https://abc123def456.ngrok.io` that forwards to your local server.

### 2. Set Up Database Webhooks in Supabase

1. Log in to your Supabase dashboard
2. Go to your project
3. Navigate to "Database" > "Database Webhooks" in the sidebar
4. Click "Create a new hook"

### 3. Configure the Webhook

Fill in the webhook configuration:

1. **Name**: Choose a descriptive name like "Auth Events"
2. **Table**: `auth.users`
3. **Events**: 
   - Check "INSERT" (for user creation)
   - Check "DELETE" (for user deletion)
4. **URL to notify**: Enter your webhook URL
   - For production: `https://your-domain.com/api/auth/webhook`
   - For development: `https://your-ngrok-url.ngrok.io/api/auth/webhook`
5. **HTTP Method**: POST
6. **Security**:
   - Add an HTTP header: `X-Webhook-Signature`
   - Value: The same value as your `WEBHOOK_SECRET` from your .env file

### 4. (Optional) Set Up Webhook Verification

For better security in production, add signature verification:

1. Generate a secure random string to use as your webhook secret
2. Add this to your .env file as `WEBHOOK_SECRET`
3. In your webhook controller, add code to verify the signature:

```javascript
const crypto = require('crypto');

// In your webhook handler
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const expectedSignature = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

## Testing Your Webhook

1. Start your backend server
2. If developing locally, start ngrok to get a public URL
3. Go to the Supabase Authentication section in your dashboard
4. Create a new user
5. Check your server logs to verify the webhook was received
6. Delete the user and check your logs again

## Troubleshooting

If your webhook isn't working:

1. Check that your server is running and accessible
2. Verify the URL is correct in the Supabase webhook settings
3. Look for any error logs in your backend
4. Use the "Test webhook" feature in Supabase to send a test event
5. Ensure your network/firewall allows incoming webhook requests

## Webhook Event Payload Example

Here's an example of the payload your server will receive for a user creation event:

```json
{
  "type": "auth.user.created",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "phone": "",
    "created_at": "2023-01-01T00:00:00Z",
    "confirmed_at": "2023-01-01T00:00:00Z",
    "last_sign_in_at": "2023-01-01T00:00:00Z",
    "user_metadata": {
      "name": "John Doe"
    }
  }
}
``` 