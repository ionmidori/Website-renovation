# 🏗️ SYD Bioedilizia - AI Renovation Platform

> **SYD** è una piattaforma SaaS d'avanguardia per la ristrutturazione edilizia, che combina Intelligenza Artificiale generativa, analisi di mercato in tempo reale e gestione progetti persistente.

---

## 🏛️ Architettura Operativa (Enterprise 3-Tier)

La piattaforma adotta un'architettura **Service-Oriented** strutturata su tre livelli per massimizzare scalabilità e manutenibilità:

1.  **Tier 1: Directives (Strategy)**: Gestito da `IntentClassifier` e `SystemPrompts`. Analizza l'intento dell'utente e seleziona la SOP (Standard Operating Procedure) più adatta, caricando istruzioni versionate e contesto dinamico.
2.  **Tier 2: Orchestration (Service Layer)**: `AgentOrchestrator` coordina il flusso di lavoro. Gestisce lo streaming tipizzato (Vercel Protocol), la persistenza dei dati tramite pattern **Repository** (`ConversationRepository`) e la sicurezza delle sessioni.
3.  **Tier 3: Execution (Muscle)**: `AgentGraphFactory` e `MediaProcessor`. Qui risiede la logica pesante: esecuzione di grafi LangGraph isolati, analisi Vision asincrona (Gemini 2.0 Flash) e generazione di asset.


---

## 📋 Tech Stack

### Frontend (`web_client`)
- **Framework**: Next.js 15.5.11 (App Router)
- **Library**: React 18.3.1
- **Styling**: Tailwind CSS 4.0 (Design Premium / Glassmorphism)
- **Motion**: Framer Motion (Liquid UI)
- **Auth**: Firebase Auth (Biometrics & Magic Links)
- **Data Fetching**: Server Actions & SWR/React Hooks

### Backend (`backend_python`)
- **API**: FastAPI (Asincrono / Enterprise Hardened)
- **AI Engine**: Google Vertex AI (Gemini 2.0 Flash, Imagen 3)
- **Orchestration**: LangGraph (Agentic Workflows)
- **Vision**: Custom Image Processing (Pillow, Vision API)
- **Market Intel**: Perplexity AI (Sonar)
- **Database**: Firestore (NoSQL)

---

## ✨ Funzionalità Core

### 1. Chat Assistant Intelligente
Un assistente che "vede" e "capisce" gli spazi. Capace di:
- Analizzare foto/video caricati per estrarre metrature e stato di fatto.
- Generare rendering fotorealistici basati su stili specifici.
- Formulare preventivi dettagliati basati su prezzi di mercato reali.

### 2. Dashboard Project Management
Trasformazione da semplice chatbot a strumento professionale:
- **I Miei Progetti**: Gestione persistente di più cantieri.
- **Galleria Intelligente**: Organizzazione automatica di rendering, preventivi e foto originali.
- **Dettagli Cantiere**: Salvataggio di vincoli tecnici (metratura, budget, note) per un'AI sempre più precisa.

### 3. Sicurezza & Affidabilità Enterprise
- **Asymmetric Auth**: Identità verificata tramite **Firebase Admin RSA** (addio chiavi condivise).
- **App Check**: Protezione granulare contro bot tramite middleware dedicato.
- **Request Tracing**: Ogni azione è tracciata da un `X-Request-ID` unico propagato in tutti i log.
- **JSON Logging**: Log strutturati e machine-readable per un'osservabilità totale.
- **Async Safety**: Gestione sicura dei task in background e protezione dell'event loop.

---

## 🚀 Setup & Sviluppo

### Installazione
Il progetto utilizza npm workspaces. Dalla root:

```bash
npm install
```

### Configurazione
È necessario configurare i file `.env` sia in `web_client/` che in `backend_python/` (vedi i rispettivi file `.env.example`).

### Avvio Sviluppo
```bash
# Frontend (localhost:3000)
cd web_client && npm run dev

# Backend (localhost:8000)
cd backend_python && uv sync && python -m main
```

---

## 🛠️ Manutenzione e Qualità
- **Linting**: `npm run lint` (Frontend)
- **Testing**: `pytest` (Backend)
- **Type Check**: `npm run type-check` (Frontend)

---

## 🤝 Project Owner
**SYD Bioedilizia** - *Trasformiamo la tua visione in realtà con l'AI.*

---
*Copyright © 2026 SYD Bioedilizia. All rights reserved.*
