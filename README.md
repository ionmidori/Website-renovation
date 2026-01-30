# 🏗️ SYD Bioedilizia - AI Renovation Platform

> **SYD** è una piattaforma SaaS d'avanguardia per la ristrutturazione edilizia, che combina Intelligenza Artificiale generativa, analisi di mercato in tempo reale e gestione progetti persistente.

---

## 🏛️ Architettura Operativa (3-Tier)

La piattaforma adotta un modello ibrido per garantire massime performance e scalabilità:

1.  **Directive Layer (Intent)**: Gestione della logica di business e flussi agentici via LangGraph.
2.  **Orchestration Layer (Frontend)**: **Next.js 15.5.11** gestisce l'interazione utente, l'autenticazione (Passkeys/Magic Links) e il routing della Dashboard.
3.  **Execution Layer (Backend)**: **Python (FastAPI)** gestisce i calcoli deterministici, l'elaborazione delle immagini (Computer Vision) e l'integrazione con i modelli LLM.

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
- **API**: FastAPI (Asincrono)
- **AI Engine**: Google Vertex AI (Gemini 1.5 Pro/Flash, Imagen 3)
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

### 3. Sicurezza di Grado Enterprise
- **Passwordless**: Accesso sicuro tramite dati biometrici (Passkeys).
- **App Check**: Protezione contro bot e accessi non autorizzati via Firebase App Check.
- **Strict Typing**: Sincronizzazione rigorosa dei tipi tra Pydantic (Python) e TypeScript.

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
