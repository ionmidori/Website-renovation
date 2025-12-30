# 🔒 Deploy Firestore & Storage Security Rules

## Step 1: Deploy Firestore Rules

1. Go to [Firebase Console > Firestore > Rules](https://console.firebase.google.com/project/chatbotluca-a8a73/firestore/rules)

2. Copy the contents of `firestore.rules` and paste into the editor

3. Click **"Publish"**

## Step 2: Deploy Storage Rules

1. Go to [Firebase Console > Storage > Rules](https://console.firebase.google.com/project/chatbotluca-a8a73/storage/rules)

2. Copy the contents of `storage.rules` and paste into the editor

3. Click **"Publish"**

---

## 🛡️ What These Rules Do

### Firestore Protection

**Sessions & Messages** (`/sessions/{sessionId}` and `/sessions/{sessionId}/messages/{messageId}`):
- ✅ **Public READ** - Anyone can view chat history
- ❌ **Server-only WRITE** - Only your backend (Firebase Admin SDK) can create/update messages
- 🎯 **Why**: Chat is public but controlled - prevents spam/tampering

**Leads** (`/leads/{leadId}`):
- ❌ **Server-only READ/WRITE** - Completely private
- 🎯 **Why**: Customer contact info is sensitive - only backend can access

**Users** (`/users/{userId}` - if you add authentication later):
- ✅ **Users can read/write their own data only**
- 🎯 **Why**: Standard user privacy pattern

### Storage Protection

**Renders folder** (`/renders/{fileName}`):
- ✅ **Public READ** - Anyone can view generated images
- ❌ **Server-only WRITE** - Only backend can upload
- 🎯 **Why**: Images need to be viewable in chat, but controlled uploads

---

## ⚠️ Important Notes

1. **Admin SDK bypasses rules**: Your server code using `firebase-admin` has full access regardless of these rules

2. **Client-side SDKs are blocked**: If you try to use `firebase` (client SDK) instead of `firebase-admin`, these rules will apply

3. **Public chat = SEO benefit**: Search engines can index your chat conversations (good for marketing)

4. **Lead data is safe**: Customer emails/phones are completely protected

---

## 🧪 Testing Rules

After deploying, test with:

```bash
# Try to write from browser console (should fail)
firebase.firestore().collection('leads').add({ test: true })
// Error: Missing or insufficient permissions

# Try to read sessions (should work)
firebase.firestore().collection('sessions').get()
// Success: Returns sessions
```

---

## 🔄 Optional: Deploy via Firebase CLI

If you want to version-control rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Firestore + Storage when prompted)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

This will use `firestore.rules` and `storage.rules` files automatically.
