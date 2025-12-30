# Environment Variables Setup Guide

## Required Variables for Vercel Deployment

Copy these to your Vercel Dashboard → Settings → Environment Variables:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=chatbotluca-a8a73
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chatbotluca-a8a73.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAo...\n-----END PRIVATE KEY-----\n"

# Gemini API Key
GEMINI_API_KEY=AIzaSy...your-key-here...
```

## How to Get These Values

### 1. FIREBASE_PROJECT_ID
- Open `firebase-service-account.json`
- Copy the value of `project_id`

### 2. FIREBASE_CLIENT_EMAIL
- Open `firebase-service-account.json`
- Copy the value of `client_email`

### 3. FIREBASE_PRIVATE_KEY
- Open `firebase-service-account.json`
- Copy the ENTIRE `private_key` value (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- **IMPORTANT**: Keep the `\n` characters as-is
- Wrap in double quotes

### 4. GEMINI_API_KEY
- Already have this from your `.env.local`

## Local Development (.env.local)

For local development, create/update `.env.local`:

```bash
# Option 1: Use environment variables (same as Vercel)
FIREBASE_PROJECT_ID=chatbotluca-a8a73
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chatbotluca-a8a73.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GEMINI_API_KEY=AIzaSy...

# Option 2: Keep using firebase-service-account.json (will auto-fallback)
# Just keep GEMINI_API_KEY
GEMINI_API_KEY=AIzaSy...
```

## Vercel Deployment Steps

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. **Important**: Select "Production", "Preview", and "Development" for each
6. Click **Save**
7. Redeploy your app

## Testing

After setting env variables:

```bash
# Local test
npm run dev
# Should see: [Firebase] Loading credentials from environment variables

# Vercel test
vercel --prod
# Check logs for: [Firebase] ✅ Successfully initialized from environment variables
```

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Never commit `firebase-service-account.json` to git
- ✅ Use Vercel's encrypted env variables for production
- ✅ The `FIREBASE_PRIVATE_KEY` must include `\n` characters (they will be replaced at runtime)
