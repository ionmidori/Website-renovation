# ⚡ QUICK DEPLOY REFERENCE - Renovation AI

**Usa questo come promemoria veloce. Per dettagli, vedi `FINAL_DEPLOYMENT_GUIDE.md`**

---

## 🎯 TUO PROGETTO

- **GitHub**: https://github.com/ionmidori/renovation-ai
- **GEMINI_API_KEY**: `AIzaSyDRkz7KoJOszP1_zq9KdSU2Hcu0cWSrJcs`
- **Status**: ✅ Codice Pronto, ⚠️ Da Deployare

---

## 🚀 DEPLOY RAPIDO (Scegli 1 opzione)

### OPZIONE 1: Netlify (PIÙ SEMPLICE) ⭐

```
1. Vai su: https://netlify.com
2. "Add new site" → "Import from Git"
3. Seleziona: ionmidori/renovation-ai
4. Build: npm run build
5. Publish: .next
6. Env Var: GEMINI_API_KEY = AIzaSyDRkz7KoJOszP1_zq9KdSU2Hcu0cWSrJcs
7. Deploy!
```

### OPZIONE 2: Vercel (Clean Start)

```
1. Delete progetto esistente su Vercel
2. https://vercel.com/new
3. Import: ionmidori/renovation-ai
4. Env Var: GEMINI_API_KEY = AIzaSyDRkz7KoJOszP1_zq9KdSU2Hcu0cWSrJcs
   (seleziona Production + Preview + Development)
5. Deploy!
```

### OPZIONE 3: Vercel CLI

```powershell
# Fix env var su Vercel Web prima!
# Poi:
powershell -ExecutionPolicy Bypass -Command "npx vercel login"
powershell -ExecutionPolicy Bypass -Command "npx vercel --prod"
```

---

## ✅ POST-DEPLOY CHECKLIST

- [ ] Sito si carica
- [ ] Chat funziona
- [ ] AI risponde
- [ ] Upload immagini OK
- [ ] Voice input OK
- [ ] Generazione 3D OK

---

## 🆘 PROBLEMA?

**Build Failed**: Test `npm run build` in locale  
**API Error**: Verifica GEMINI_API_KEY sia corretta  
**404**: Aspetta 2-3 min, poi ricarica

---

## 📖 DOCS COMPLETE

Vedi: `FINAL_DEPLOYMENT_GUIDE.md` (20+ pagine)

---

**Tempo totale deploy**: 10-20 min  
**Costo**: $0 hosting + ~$5/mese API

🚀 **VAI E DEPLOYA!**
