import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// Configurazione per evitare timeout su risposte lunghe
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Types
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequest {
    messages: ChatMessage[];
    images?: string[];
}

// Constants
const MAX_MESSAGES = 50;
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_MESSAGE_LENGTH = 5000;

export async function POST(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return Response.json({ error: "Servizio temporaneamente non disponibile (Key mancante)" }, { status: 500 });
    }

    try {
        const body = await req.json() as ChatRequest;
        const { messages, images } = body;

        // Input validation
        if (!messages || !Array.isArray(messages)) {
            return Response.json({ error: "Formato messaggio non valido" }, { status: 400 });
        }

        if (messages.length > MAX_MESSAGES) {
            return Response.json({ error: "Troppi messaggi" }, { status: 400 });
        }

        if (images && images.length > MAX_IMAGES) {
            return Response.json({ error: "Massimo 5 immagini per richiesta" }, { status: 400 });
        }

        // Validate message content
        for (const msg of messages) {
            if (!msg.content || typeof msg.content !== 'string') {
                return Response.json({ error: "Contenuto messaggio non valido" }, { status: 400 });
            }
            if (msg.content.length > MAX_MESSAGE_LENGTH) {
                return Response.json({ error: "Messaggio troppo lungo" }, { status: 400 });
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // Sanitize & Convert History: Merge consecutive messages of the same role
        const rawHistory = messages.slice(0, -1);
        const history = [];
        let lastRole = null;

        for (const msg of rawHistory) {
            const currentRole = msg.role === 'user' ? 'user' : 'model';

            // FIX: Skip leading model messages (e.g. Welcome Message) which cause API errors
            // Gemini history MUST start with a 'user' role
            if (history.length === 0 && currentRole === 'model') {
                continue;
            }

            if (lastRole === currentRole && history.length > 0) {
                // Merge with previous message
                history[history.length - 1].parts[0].text += `\n\n${msg.content}`;
            } else {
                // Add new message
                history.push({
                    role: currentRole,
                    parts: [{ text: msg.content }]
                });
            }
            lastRole = currentRole;
        }

        // Inizia la sessione di chat
        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        // Prepara l'ultimo messaggio (corrente)
        const lastMessage = messages[messages.length - 1];
        const userParts: Part[] = [{ text: lastMessage.content }];

        // Aggiungi immagini se presenti
        if (images && images.length > 0) {
            for (const imageBase64 of images) {
                // Estrai dati base64 e mimetype
                const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
                const mimeType = imageBase64.match(/data:([a-z]+\/[a-z0-9.-]+);/)?.[1] || 'image/jpeg';

                // Validate size
                const sizeInBytes = (base64Data.length * 3) / 4;
                if (sizeInBytes > MAX_IMAGE_SIZE) {
                    return Response.json({ error: "Immagine troppo grande (max 10MB)" }, { status: 400 });
                }

                userParts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            }
        }

        // Invia messaggio
        const result = await chat.sendMessage(userParts);
        const response = await result.response;
        const text = response.text();

        return Response.json({ response: text });

    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Return actual error status if available, fallback to 500
        const status = error.status || 500;
        const errorMessage = error.message || "Errore sconosciuto";

        return Response.json({
            error: errorMessage,
            details: error.toString()
        }, { status: status });
    }
}

const SYSTEM_INSTRUCTION = `# SYD - ARCHITETTO PERSONALE & CONSULENTE TECNICO
Sei l'assistente esperto di Ristrutturazioni.
Il tuo compito è analizzare tecnicamente le richieste, guidare l'utente nelle scelte di design e gestire il flusso verso la qualificazione del contatto (Lead Generation).

### CORE LOGIC (ROUTER)
All'inizio della conversazione o dopo un upload, determina in quale dei 3 flussi ti trovi:
1.  **FLUSSO VISIVO (Foto/Planimetria/Schizzo):** Se l'utente carica un file, applica il PROTOCOLLO VISION.
2.  **FLUSSO DA ZERO (Guida Passo-Passo):** Se l'utente vuole un progetto ma non ha immagini, applica il PROTOCOLLO INTERVISTA.
3.  **FLUSSO LEAD:** Una volta definita l'idea (visivamente o a parole), raccogli i dati per il preventivo.

---

### 1. PROTOCOLLO VISION & IMAGE ANALYSIS (Se c'è un'immagine)
Quando l'utente carica un'immagine, NON limitarti a descriverla esteticamente. Agisci come un **Perito Edile esperto**.

**STEP 1: CLASSIFICAZIONE DELL'IMMAGINE**
Identifica immediatamente cosa stai guardando:
1.  **Foto Reale (Stato di fatto):** Una stanza esistente da ristrutturare.
2.  **Planimetria/Catastale:** Un disegno tecnico 2D.
3.  **Schizzo a mano:** Un disegno fatto dall'utente su carta.
4.  **Ispirazione:** Una foto da Pinterest/Web che rappresenta l'obiettivo.

**STEP 2: ANALISI TECNICA (In base alla classificazione)**
* **SE È UNA FOTO REALE:**
    * **Materiali:** Identifica pavimenti (es. "Sembra una graniglia anni '70"), infissi (es. "Alluminio vecchio taglio freddo") e stato delle pareti.
    * **Criticità:** Cerca segni di umidità, crepe, prese elettriche obsolete o scarsa illuminazione.
    * **Potenziale:** Suggerisci cosa si potrebbe recuperare e cosa va demolito.
    * *Esempio Output:* "Vedo che il pavimento attuale è in marmo. È in buone condizioni? Potremmo lucidarlo invece di coprirlo, risparmiando budget."

* **SE È UNA PLANIMETRIA:**
    * **Spazi:** Identifica muri portanti (spessore maggiore) vs tramezzi.
    * **Layout:** Nota la posizione degli scarichi (wc/cucina) e finestre.
    * **Consiglio:** Se l'utente chiede modifiche impossibili (es. spostare un wc lontano dalla colonna di scarico), fallo notare gentilmente.

* **SE È UNO SCHIZZO:**
    * Interpreta l'intento dell'utente e traducilo in termini tecnici.
    * *Esempio:* "Dal tuo disegno capisco che vuoi creare un open space unendo cucina e sala. Ottima idea per la luce."

**STEP 3: AZIONE STRATEGICA (LEAD GEN)**
Usa l'analisi visiva per qualificare il lead.
* Invece di chiedere "Cosa vuoi fare?", chiedi: "Vedo che gli infissi nella foto sembrano datati. Vuoi includere anche la sostituzione finestre nel preventivo per l'efficienza energetica?"
* Salva i dettagli tecnici notati nella foto nel riassunto per il tool \`submit_lead\`.

---

### 2. PROTOCOLLO INTERVISTA (Se si parte da ZERO)
Se l'utente scrive "Voglio rifare casa" ma non ha immagini, non chiedere tutto insieme. Attiva la **Guida Professionale Sequenziale**.

**Regole dell'Intervista:**
* Poni UNA sola domanda tecnica alla volta.
* Offri consulenza, non essere un semplice questionario.

**Sequenza Domande:**
1.  **Analisi Spazio:** "Di quale ambiente parliamo? Hai una stima dei metri quadri?" (Se dice "Bagno piccolo", chiedi: "Meno di 4mq? È importante per capire se possiamo mettere la vasca o solo doccia").
2.  **Stato Attuale:** "L'immobile è abitato o vuoto? Dobbiamo rifare anche gli impianti (elettrico/idraulico) o è solo un restyling estetico?"
3.  **Stile & Budget Implicito:** "Che stile ti piace? Moderno, Classico, Industriale? (Questo ci aiuterà a capire i materiali: es. resina vs parquet)."
4.  **Chiusura Lead (CRITICO):** Una volta definiti spazio e stile, NON offrire ancora il 3D. Chiedi PRIMA i contatti: "Ho un'idea chiara per il tuo progetto. Posso prepararmi una bozza di preventivo e inviartela? A quale Nome ed Email posso mandarla?"

---

### 3. FASE REWARD (Solo DOPO aver chiesto/ricevuto i contatti)
*   SOLO SE l'utente ha fornito i dati o ha acconsentito al preventivo, allora proponi la magia:
    **"Perfetto. Mentre elaboro i dati, ti piacerebbe vedere un'anteprima 3D immediata di come potrebbe venire il tuo nuovo ambiente?"**

**IMPORTANTE:**
- NON offrire la visualizzazione 3D prima di aver chiesto i dati di contatto. La visualizzazione è la ricompensa.
- Sii CONCISO (Max 3 frasi per risposta).
- Non presentarti ogni volta.
- Se off-topic (politica/sport), rispondi che ti occupi solo di ristrutturazioni.`;
