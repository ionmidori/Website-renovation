# Changelog

All notable changes to Renovation AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-12-14

### 🎉 Initial Release - Production Ready

#### Added
- ✨ AI Chat Assistant "SYD" powered by Google Gemini 2.0 Flash
- 🎨 3D Renovation Image Generation using Imagen 3
- 🎤 Voice Input with Speech-to-Text functionality
- 📸 Image Upload support for room analysis
- 💼 Lead Collection workflow (guided conversation)
- 🎭 Custom SYD Avatar with neon design (optimized v3)
- 📱 Fully responsive UI (mobile-first)
- 🌙 Dark mode premium interface
- ⚡ Optimized production build with Next.js 16 Turbopack
- 🔒 Environment variable configuration for API security

#### Technical
- Next.js 16.0.8 with App Router
- TypeScript 5.x with strict mode
- Tailwind CSS v4
- Framer Motion animations
- Google Gemini AI integration
- Vercel AI SDK (@ai-sdk/react v1.0.0)
- Build optimization and tree-shaking

#### Components
- `ArchitectAvatar` - Custom avatar component
- `VoiceRecorder` - 60s max voice recording
- Chat interface with message bubbles
- Image preview and upload UI
- Animated modal chat window

#### API Routes
- `/api/chat` - Main AI chat endpoint
- `/api/list-models` - Debug endpoint for model availability

### Fixed
- 🐛 Fixed TypeScript compilation error in `useChatLogic.ts` (removed incompatible onFinish handler)
- 🐛 Fixed avatar caching issues by using versioned filenames
- 🐛 Resolved chatbot conversational flow (quote → then 3D offer)
- 🐛 Fixed Speech-to-Text MIME type handling

### Changed
- 🔄 Reverted custom neon button icons to standard Lucide SVG icons
- 🔄 Improved error handling in chat API
- 🔄 Optimized image generation prompt for better quality

### Security
- 🔐 API key stored in environment variables only
- 🔐 Input validation for file uploads (size, type)
- 🔐 Rate limiting via Gemini API built-in limits

---

## [Unreleased] - Roadmap

### Planned Features
- [ ] User authentication (NextAuth.js)
- [ ] Payment integration (Stripe)
- [ ] Database persistence (Postgres/MongoDB)
- [ ] Email notifications (Resend/SendGrid)
- [ ] Admin dashboard for lead management
- [ ] PDF quote generation improvements
- [ ] Multi-language support
- [ ] Advanced 3D viewer integration
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)

### Under Consideration
- [ ] Custom AI model fine-tuning
- [ ] Integration with project management tools
- [ ] Cost estimation calculator
- [ ] Contractor marketplace
- [ ] AR/VR visualization

---

## Version History

### v0.1.0 (Current)
**Status**: Production Ready  
**Release Date**: December 14, 2025  
**Build**: Successful ✅  
**Compatible**: Vercel, Netlify, Docker, Self-hosted

---

**Note**: For detailed deployment instructions and troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
