# 🔗 GitHub Repository Setup - Quick Guide

## ✅ Repository Git Locale: PRONTO

Il repository Git locale è stato configurato con successo:

```
✅ Commit: e26ae5d - "Release v0.1.0 - Production Ready"
✅ Tag: v0.1.0
✅ Files: 35 files changed, 2918 insertions
✅ Status: Clean working directory
```

---

## 🚀 PROSSIMI PASSI

### Opzione A: Crea Repository GitHub (Raccomandato per Vercel)

#### Step 1: Crea Repository su GitHub.com

1. Vai su [github.com/new](https://github.com/new)
2. **Repository name**: `renovation-ai` (o nome preferito)
3. **Description**: `AI-powered renovation assistant with 3D visualization - Powered by Google Gemini`
4. **Visibility**: Public o Private (a tua scelta)
5. **NON** inizializzare con README, .gitignore, o license (hai già questi file)
6. Click **"Create repository"**

#### Step 2: Push il Codice

GitHub ti mostrerà i comandi. Usa questi (sostituisci `YOUR_USERNAME`):

```bash
# Aggiungi remote origin
git remote add origin https://github.com/YOUR_USERNAME/renovation-ai.git

# Rinomina branch da master a main (se preferisci)
git branch -M main

# Push con tag
git push -u origin main
git push --tags
```

**Oppure**, se vuoi mantenere `master`:

```bash
git remote add origin https://github.com/YOUR_USERNAME/renovation-ai.git
git push -u origin master
git push --tags
```

#### Step 3: Verifica su GitHub

- Vai su `https://github.com/YOUR_USERNAME/renovation-ai`
- Dovresti vedere tutti i file
- Verifica che il tag `v0.1.0` sia presente nella sezione "Releases"

---

### Opzione B: Deploy Diretto con Vercel CLI (Senza GitHub)

Se preferisci non usare GitHub:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Aggiungi GEMINI_API_KEY
vercel env add GEMINI_API_KEY

# Deploy production
vercel --prod
```

---

## 📋 COMANDI COMPLETI (Copia-Incolla)

### Se hai creato il repo `renovation-ai` su GitHub:

```bash
# Naviga nella directory (se non ci sei già)
cd c:\Users\User01\.gemini\antigravity\scratch\renovation-next

# Aggiungi remote (sostituisci YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/renovation-ai.git

# Push con branch main
git branch -M main
git push -u origin main
git push --tags

# ✅ FATTO! Ora vai su Vercel e importa il repo
```

---

## 🎯 DOPO IL PUSH

### Deploy su Vercel (Via Dashboard)

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Seleziona `renovation-ai`
4. **IMPORTANTE**: Prima di deployare, aggiungi:
   - Environment Variable: `GEMINI_API_KEY`
   - Value: [La tua chiave API Gemini]
   - Environments: Production, Preview, Development ✅ (tutte)
5. Click **"Deploy"**
6. Attendi 2-3 minuti
7. ✅ **LIVE!**

---

## 🔍 Verifica Repository Status

Prima del push, verifica tutto sia OK:

```bash
# Status repository
git status

# Log commits
git log --oneline -3

# Tags
git tag

# Branch
git branch

# Remote (dopo aver aggiunto origin)
git remote -v
```

**Output atteso**:
```
On branch master (o main)
nothing to commit, working tree clean

Commits:
e26ae5d Release v0.1.0 - Production Ready
...

Tags:
v0.1.0
```

---

## 🐛 Troubleshooting

### Problema: "remote origin already exists"

```bash
# Rimuovi remote esistente
git remote remove origin

# Aggiungi quello corretto
git remote add origin https://github.com/YOUR_USERNAME/renovation-ai.git
```

### Problema: "Permission denied (publickey)"

**Opzione 1**: Usa HTTPS invece di SSH (più semplice)
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/renovation-ai.git
```

**Opzione 2**: Setup SSH key (più sicuro)
- Segui: [GitHub SSH Setup Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### Problema: "failed to push some refs"

```bash
# Pull prima di pushare
git pull origin main --allow-unrelated-histories

# Poi push
git push -u origin main
```

---

## ✨ BEST PRACTICES

### .gitignore Check

Verifica che `.env.local` sia ignorato (già configurato ✅):

```bash
# Verifica .gitignore
cat .gitignore | grep ".env"
```

**Output atteso**: `.env*`

### Protezione Secrets

❌ **NEVER** commit:
- `.env.local`
- `GEMINI_API_KEY` in codice
- Credentials di qualsiasi tipo

✅ **ALWAYS**:
- Usa Environment Variables
- Aggiungi secrets su piattaforma hosting (Vercel Dashboard)

---

## 📊 Repository Info

### Statistiche Progetto

```bash
# Linee di codice
git ls-files | grep -E '\.(ts|tsx|css|json)$' | xargs wc -l

# Numero di commit
git rev-list --count HEAD

# Contributors
git shortlog -sn
```

### README Badge (opzionale)

Aggiungi al README.md:

```markdown
![Deploy Status](https://img.shields.io/github/deployments/YOUR_USERNAME/renovation-ai/production?label=vercel&logo=vercel)
![Version](https://img.shields.io/github/v/tag/YOUR_USERNAME/renovation-ai)
![License](https://img.shields.io/github/license/YOUR_USERNAME/renovation-ai)
```

---

## 🎉 QUICK START

**TL;DR** - Copia e incolla questo:

```bash
# 1. Crea repo su github.com/new (nombre: renovation-ai)

# 2. Push (sostituisci YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/renovation-ai.git
git branch -M main
git push -u origin main --tags

# 3. Deploy su vercel.com:
#    - Import repo
#    - Add GEMINI_API_KEY
#    - Deploy!

# ✅ LIVE in 5 minuti!
```

---

**Next**: Una volta pushato su GitHub, vai a `DEPLOY_VERCEL.md` per completare il deploy!

---

*Last updated: 14 Dicembre 2025*
