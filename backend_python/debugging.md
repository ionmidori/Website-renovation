# 🛠️ Debugging Guide: Security & SDK Migration (2026-01-24)

> **Purpose:** Professional debugging documentation for the recent security hardening and SDK migration changes. Use this guide to verify deployment stability and troubleshoot any issues.

---

## 📋 Summary of Changes

| File | Change | Risk Level |
|:-----|:-------|:-----------|
| `src/auth/jwt_handler.py` | Switched from custom JWT to Firebase ID Token verification | **HIGH** |
| `src/api/upload.py` | Migrated from `google.generativeai` to `google.genai` SDK | **MEDIUM** |
| `src/api/passkey.py` | Updated to use `get_current_user_id` + Firebase Custom Tokens | **MEDIUM** |
| `src/db/firebase_client.py` | Made `init_firebase()` public | **LOW** |
| `web_client/app/api/chat/route.ts` | Removed `INTERNAL_JWT_SECRET`, now forwards raw ID Token | **HIGH** |

---

## 🔍 Pre-Deployment Verification Checklist

### 1. Syntax Check (Build-Time)
The Dockerfile includes a syntax check step. Run locally to verify:

```bash
cd backend_python
python -m compileall src main.py
```

**Expected:** No output (success). Any `SyntaxError` will be printed.

### 2. Import Check (Runtime Simulation)
Run the diagnostic script:

```bash
cd backend_python
python check_imports.py
```

**Expected Output:**
```
✅ Import successful: fastapi
✅ Import successful: uvicorn
✅ Import successful: firebase_admin
✅ Import successful: google.cloud.firestore
✅ Import successful: google.genai
✅ Import successful: langchain_core
✅ Import successful: langgraph
✅ Import successful: dotenv
✅ Import successful: multipart
✅ All core dependencies verified.
```

**If `google.genai` fails:** Run `pip install google-genai`

### 3. Local Server Startup
Start the server and check logs:

```bash
cd backend_python
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

**Expected Startup Logs:**
```
INFO:     Uvicorn running on http://0.0.0.0:8080
INFO:main:🚀 SYD Brain API starting on port 8080...
```

**Watch for these FATAL errors:**
- `ModuleNotFoundError: No module named 'google.genai'` → Install SDK
- `firebase_admin._apps is empty` → Check service account credentials
- `RuntimeError: GEMINI_API_KEY not found` → Check `.env` file

---

## 🚨 Common Failure Points & Solutions

### Issue 1: `401 Unauthorized` on All Requests
**Symptom:** Frontend receives 401 for every `/chat/stream` call.

**Root Cause:** The backend now expects a **Firebase ID Token**, not a custom JWT.

**Verification:**
```bash
# Check what token is being sent
curl -X POST http://localhost:8080/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"messages":[], "sessionId":"test"}'
```

**Fix:** Ensure the frontend (`route.ts`) is forwarding the original Firebase ID Token:
```typescript
// CORRECT
'Authorization': `Bearer ${idToken}`  // Raw Firebase token from client

// WRONG (OLD CODE)
'Authorization': `Bearer ${internalToken}`  // Custom minted JWT
```

---

### Issue 2: `ImportError: cannot import name 'types' from 'google.genai'`
**Symptom:** Server crashes on startup when importing `upload.py`.

**Root Cause:** Old `google-genai` package version installed.

**Fix:**
```bash
pip install --upgrade google-genai
```

**Verify:**
```python
from google.genai import types
print(types.UploadFileConfig)  # Should not error
```

---

### Issue 3: `auth.RevokedIdTokenError` for Valid Users
**Symptom:** Authenticated users suddenly get 401 errors.

**Root Cause:** The new `check_revoked=True` flag is working correctly, but the user's session was invalidated in Firebase Console.

**Verification:**
1. Go to Firebase Console → Authentication → Users
2. Find the user and check if they are disabled or if "Revoke refresh tokens" was triggered

**Fix:** User must re-authenticate on the client.

---

### Issue 4: Video Upload Returns `500 Internal Server Error`
**Symptom:** `/upload/video` endpoint fails.

**Possible Causes:**
1. `GEMINI_API_KEY` not set
2. Magic Bytes validation failing (file is not a real video)
3. Google GenAI File API quota exceeded

**Debugging Steps:**
```bash
# Check logs for specific error
tail -f server.log | grep -i "upload"
```

**Expected Log Pattern for Success:**
```
🛡️ Magic Bytes check passed: video/mp4
📹 User abc123 uploading video: safe_filename.mp4 (video/mp4)
✅ Video uploaded successfully: googleapi://...
```

---

### Issue 5: Passkey Registration Fails with `403 Forbidden`
**Symptom:** User cannot register a passkey.

**Root Cause:** The `user_id` from the token doesn't match the `user_id` in the request body.

**Verification:**
Check that the frontend is sending the correct user ID:
```typescript
body: JSON.stringify({ user_id: user.uid })  // Must match token's uid
```

---

## 🔄 Rollback Procedures

### Rollback: Authentication (jwt_handler.py)
If Firebase ID Token verification causes widespread auth failures:

```python
# TEMPORARY ROLLBACK - jwt_handler.py
# Replace verify_token with original custom JWT logic

import os
import jwt
from dotenv import load_dotenv
load_dotenv()

INTERNAL_JWT_SECRET = os.getenv("INTERNAL_JWT_SECRET")

def verify_token(credentials):
    token = credentials.credentials
    payload = jwt.decode(token, INTERNAL_JWT_SECRET, algorithms=["HS256"])
    return payload
```

**Also rollback `route.ts` to mint internal tokens:**
```typescript
const { createInternalToken } = await import('@/lib/auth/jwt');
internalToken = createInternalToken({ uid: decodedToken.uid, email: decodedToken.email });
```

---

### Rollback: Video Upload SDK (upload.py)
If the new `google.genai` SDK causes upload failures:

```python
# TEMPORARY ROLLBACK - upload.py
# Replace google.genai with google.generativeai

import google.generativeai as genai

# In the route handler:
genai.configure(api_key=GEMINI_API_KEY)
uploaded_file = genai.upload_file(
    path=file.file,
    display_name=file.filename,
    mime_type=file.content_type
)
```

---

## 📊 Health Check Endpoints

### Backend Health
```bash
curl http://localhost:8080/health
# Expected: {"status":"ok","service":"syd-brain"}
```

### Full Auth Flow Test
```bash
# 1. Get a valid Firebase ID Token from frontend console
# 2. Test the protected endpoint
curl -X POST http://localhost:8080/chat/stream \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}],"sessionId":"debug-session"}'
```

---

## 🔐 Environment Variables Required

### Backend (`.env`)
```bash
GEMINI_API_KEY=<required>
FIREBASE_PROJECT_ID=<required>
FIREBASE_PRIVATE_KEY=<required>
FIREBASE_CLIENT_EMAIL=<required>
FIREBASE_STORAGE_BUCKET=<required>
# INTERNAL_JWT_SECRET is NO LONGER USED
```

### Frontend (`.env.local`)
```bash
PYTHON_BACKEND_URL=http://localhost:8080  # or Cloud Run URL
NEXT_PUBLIC_FIREBASE_API_KEY=<required>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<required>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<required>
# INTERNAL_JWT_SECRET is NO LONGER USED
```

---

## ✅ Post-Deployment Validation

After a successful Cloud Run deployment, run these checks:

1. **Service Health:** `curl https://<service-url>/health`
2. **Auth Smoke Test:** Send a request with a valid Firebase token
3. **Upload Test:** Upload a small video file (< 1MB)
4. **Passkey Test:** Register a passkey on a mobile device

If all pass, the deployment is stable. 🎉
