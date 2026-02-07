# 📉 Technical Debt & Future Refactorings

> **Last Updated:** 2026-02-07

---

## 📹 Video Persistence (PRIORITY: HIGH)

**Current Issue:**
- Video uploads currently use Google AI File API (`uri` starts with `https://generativelanguage.googleapis.com`).
- These files expire after **48 hours**.
- The Gallery will break for videos older than 2 days.

**Planned Refactoring:**
- [ ] Implement dual-upload strategy: Upload to Firebase Storage (Persistence) AND Google AI File API (Analysis).
- [ ] Update `VideoMediaAsset` to store `storage_url` (permanent) and `analysis_uri` (transient).

---

## 🧪 Testing Expansion (PRIORITY: LOW)

**Current Status:**
- Basic backend and frontend unit tests covers critical paths.
- Integration tests cover Magic Bytes.

**Future Considerations:**
- [ ] Add E2E tests with Playwright for upload cancellation flow.
- [ ] Add load tests for concurrent upload handling.

---

## ✅ Resolved (2026-02-07)

### � Security Hardening (Phase 5)
- **Completed:** Implemented `SecurityHeadersMiddleware` (HSTS, CSP, XSS protection, X-Content-Type-Options).
- **Completed:** Configured `Cache-Control` (1 year) and `Content-Disposition` for Firebase Storage uploads.
- **Completed:** Fixed MIME confusion vulnerability in `validate_image_magic_bytes()`.
- **Completed:** Strict MIME type matching enforced.

### �🔧 Hook Consolidation (Phase 2-3)
- **Completed:** Created unified `useUpload` hook replacing `useMediaUpload` + `useVideoUpload`.
- **Completed:** Refactored `ChatWidget.tsx` and `ChatInput.tsx` to use new upload system.
- **Completed:** Deleted deprecated hooks (`useMediaUpload.ts`, `useVideoUpload.ts`).

### 🏗️ API Protocol Alignment (Phase 1)
- **Completed:** Implemented `useUpload` hook routing to `/upload/image` or `/upload/video`.
- **Completed:** Centralized metadata extraction using discriminated unions.

### 🧪 Testing Coverage (Phase 4)
- **Completed:** Rewrote `useChatHistory.test.ts` to mock SWR.
- **Completed:** Added backend integration tests for Magic Bytes.
- **Completed:** Added frontend unit tests for `useUpload`.
