# Project Context & Session Memory (Update: 2026-02-02)

Questo file serve come memoria storica per l'IA per evitare regressioni su bug critici risolti in questa sessione.

## 🛠️ Bug Critici Risolti

### 1. Loop Infinito di Render ("Infinite Loop")
- **Problema:** L'IA entrava in un loop chiamando `generate_render` ripetutamente o subito dopo il triage.
- **Soluzione:** 
    - Rimosso il flag `recursive=True` meccanico (sostituito da un "Circuit Breaker" a livello di backend).
    - **Protocollo IA:** Imposto un flusso a fasi: `Triage -> Conferma Utente -> Render`.
    - **Regola d'Oro:** Lo strumento `analyze_room` deve fare **solo** analisi. Non deve mai triggerare una generazione automatica.
    - Il prompt in `src/prompts/components/modes.py` (Designer Mode) ora aspetta esplicitamente l'input dell'utente dopo il Triage.

### 2. Deletion Silenziosa (Ghost Files)
- **Problema:** Cancellando un progetto, le foto rimanevano nella galleria e i file su Storage non venivano rimossi.
- **Causa:** "Split Brain" tra Frontend e Backend.
    - Il Frontend scriveva i metadati in `projects/{id}/files`.
    - Il Backend scriveva (e cercava di cancellare) solo in `sessions/{id}/files`.
    - I file dello Storage erano salvati in due percorsi diversi: `projects/{id}/uploads/` (Frontend) e `user-uploads/{id}/` (Backend).
- **Fix:** La funzione `delete_project` in `src/db/projects.py` ora esegue una **Deep Deletion** su entrambi i percorsi Firestore e Storage.

---

## 🏗️ Architettura & Percorsi (Source of Truth)

| Tipo di Dato | Percorso Firestore | Percorso Storage |
| :--- | :--- | :--- |
| **Sessione (Backend)** | `sessions/{id}` | `user-uploads/{id}/` |
| **Progetto (Frontend)** | `projects/{id}` | `projects/{id}/uploads/` |
| **Messaggi Chat** | `sessions/{id}/messages` | - |
| **Metadati File** | `projects/{id}/files` | - |

**Nota Tecnica:** Il backend Python deve essere avviato da `backend_python/main.py` (entry point principale). La cartella `src/` deve contenere un `__init__.py` per essere trattata come pacchetto.

---

## 📋 Regole Operative per l'IA
1. **Verifica i Percorsi:** Se devi leggere o cancellare file, controlla sempre sia la collezione `sessions` che `projects`.
2. **Confirm Before Action:** Mai avviare un render da crediti (DALL-E/Flux via Gemini) senza che l'utente abbia confermato la fase di Triage.
3. **Cleanup:** Ogni operazione di cancellazione deve usare l'helper `_delete_collection_batch` per evitare di lasciare documenti orfani.

---

## 🚀 Script di Utilità Disponibili
- `scripts/cleanup_orphaned_files.py`: Pulisce lo Storage dai file senza un documento Firestore padre.
- `scripts/cleanup_zombie_projects.py`: Pulisce i documenti `projects` rimasti orfani senza una `session` corrispondente.
- `scripts/verify_gemini.py`: Verifica la connessione e le capacità multimodali del modello.
