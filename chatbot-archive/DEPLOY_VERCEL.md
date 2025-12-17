# 🚀 Guida Rapida Deploy su Vercel

## ⚡ Deploy in 3 Minuti

### Metodo 1: Dashboard Vercel (Raccomandato)

#### Step 1: Prepara Repository
```bash
# Se non hai già un repository Git
git init
git add .
git commit -m "Initial commit - Renovation AI v0.1.0"

# Push su GitHub/GitLab (crea prima il repo online)
git remote add origin https://github.com/YOUR_USERNAME/renovation-ai.git
git push -u origin main
```

#### Step 2: Deploy su Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Importa il tuo repository GitHub/GitLab
4. Click **"Import"**

#### Step 3: Configura Environment Variable
**CRITICO**: Prima del deploy, aggiungi la variabile:

1. Nella sezione "Environment Variables"
2. Aggiungi:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `[La tua chiave API Gemini]`
   - **Environment**: Production, Preview, Development (seleziona tutte)

#### Step 4: Deploy!
- Click **"Deploy"**
- Attendi 2-3 minuti
- ✅ FATTO! Il tuo URL sarà: `https://renovation-ai-[random].vercel.app`

---

### Metodo 2: Vercel CLI (Avanzato)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Durante il deploy, rispondi:
# - Setup and deploy? Y
# - Which scope? [Seleziona il tuo account]
# - Link to existing project? N
# - Project name? renovation-ai
# - Directory? ./  
# - Want to modify settings? N

# Aggiungi environment variable
vercel env add GEMINI_API_KEY

# (Incolla la tua API key quando richiesto)
# Seleziona: Production, Preview, Development

# Deploy production
vercel --prod
```

---

## 🔐 Ottenere GEMINI_API_KEY

Se non hai ancora la chiave API:

1. Vai su [Google AI Studio](https://aistudio.google.com/apikey)
2. Accedi con account Google
3. Click **"Create API Key"**
4. Copia la chiave generata
5. Usala nel passo "Environment Variables"

---

## ✅ Verifica Deploy

Dopo il deploy:

1. Apri l'URL fornito da Vercel
2. Testa la chat (scrivi un messaggio)
3. Testa upload immagine
4. (Opzionale) Testa voice input

**Se la chat non risponde**:
- Verifica che `GEMINI_API_KEY` sia configurata
- Controlla i logs su Vercel Dashboard → Deployments → [tuo deploy] → Logs

---

## 🐛 Troubleshooting

### Errore: "GEMINI_API_KEY is not defined"
**Soluzione**: 
1. Vai su Vercel Dashboard
2. Settings → Environment Variables
3. Aggiungi `GEMINI_API_KEY`
4. Redeploy (Deployments → [...] → Redeploy)

### Build fallisce
**Soluzione**:
```bash
# Testa build localmente
npm run build

# Se OK localmente ma KO su Vercel:
# - Verifica Node version (deve essere 20.x)
# - Controlla package-lock.json sia committed
```

### Immagini generate non salvate
**Soluzione**: Vercel Serverless non supporta filesystem persistente.
- Migra a Vercel Blob Storage o S3 (post-MVP)

---

## 🎯 Post-Deploy Checklist

- [ ] URL pubblico funzionante
- [ ] Chat risponde correttamente
- [ ] Generazione immagini OK
- [ ] Voice input OK (permessi browser)
- [ ] UI responsive su mobile
- [ ] Setup Custom Domain (opzionale)
- [ ] Setup Google Analytics (consigliato)
- [ ] Setup Sentry error tracking (consigliato)

---

## 📊 Monitoring (Opzionale ma Raccomandato)

### Vercel Analytics
```bash
# Install
npm i @vercel/analytics

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Sentry (Error Tracking)
1. Crea account su [sentry.io](https://sentry.io)
2. Crea nuovo progetto Next.js
3. Segui wizard installazione
4. Deploy

---

## 🔄 Aggiornamenti Futuri

Ogni push su `main` trigghera auto-deploy su Vercel!

```bash
# Fai modifiche al codice
git add .
git commit -m "Feature: Added X"
git push

# Vercel deployerà automaticamente 🚀
```

---

## 💰 Costi

**Vercel Free Tier** include:
- ✅ 100GB Bandwidth/mese
- ✅ 1000 deployments/mese  
- ✅ Serverless Functions
- ✅ Edge Network globale
- ✅ HTTPS automatico
- ✅ CI/CD automatico

Sufficiente per **1000-5000 utenti/mese**.

**Gemini API** (separato):
- ~$3-6/mese stimati per 50-100 utenti

---

**Tempo totale deploy**: 5-10 minuti  
**Difficoltà**: ⭐⭐ (Facile)

---

## 📞 Supporto

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](../../../issues)

**Good luck! 🚀**
