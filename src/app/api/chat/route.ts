import { GoogleGenerativeAI, Part, SchemaType } from '@google/generative-ai';

// Configurazione
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
        return Response.json({ error: "API Key mancante" }, { status: 500 });
    }

    try {
        const body = await req.json() as ChatRequest;
        const { messages, images } = body;

        // --- VALIDAZIONE INPUT ---
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
            // Check length only for user messages to allow long AI responses (images)
            if (msg.role === 'user' && msg.content && msg.content.length > MAX_MESSAGE_LENGTH) {
                return Response.json({ error: "Messaggio troppo lungo" }, { status: 400 });
            }
        }

        // Validate images size
        if (images) {
            for (const imageBase64 of images) {
                const base64Length = imageBase64.length - (imageBase64.indexOf(',') + 1);
                const sizeInBytes = (base64Length * 3) / 4;
                if (sizeInBytes > MAX_IMAGE_SIZE) {
                    return Response.json({ error: "Immagine troppo grande (max 10MB)" }, { status: 400 });
                }
            }
        }

        // --- INIZIALIZZAZIONE SDK ---
        const genAI = new GoogleGenerativeAI(apiKey);

        // Definiamo il Tool per la generazione immagini
        const tools = [
            {
                functionDeclarations: [
                    {
                        name: "generate_render",
                        description: "Genera un rendering fotorealistico 3D della stanza ristrutturata quando l'utente lo richiede esplicitamente.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                prompt: {
                                    type: SchemaType.STRING,
                                    description: "Prompt dettagliato in inglese per Imagen 3, descrivendo stile, materiali, luci e arredi."
                                }
                            },
                            required: ["prompt"]
                        }
                    }
                ]
            }
        ];

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: tools as any
        });

        // --- GESTIONE HISTORY ---
        // Sanitizzazione: unisce messaggi consecutivi dello stesso ruolo e rimuove messaggi di benvenuto iniziali del model
        const rawHistory = messages.slice(0, -1);
        const history = [];
        let lastRole = null;

        for (const msg of rawHistory) {
            const currentRole = msg.role === 'user' ? 'user' : 'model';

            // Skip leading model messages (i.e. Welcome) to prevent API errors
            if (history.length === 0 && currentRole === 'model') {
                continue;
            }

            // Sanitize content: Remove Base64 images from history to prevent context overflow/token waste
            // The model knows it generated an image, it doesn't need the Base64 string back.
            let cleanContent = msg.content;
            if (currentRole === 'model') {
                cleanContent = cleanContent.replace(/!\[.*?\]\(data:image.*?\)/g, '[Immagine Generata]');
            }

            if (lastRole === currentRole && history.length > 0) {
                history[history.length - 1].parts[0].text += `\n\n${cleanContent}`;
            } else {
                history.push({
                    role: currentRole,
                    parts: [{ text: cleanContent }]
                });
            }
            lastRole = currentRole;
        }

        // --- START CHAT ---
        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        });

        // Prepara messaggio corrente
        const lastMessage = messages[messages.length - 1];
        const userParts: Part[] = [{ text: lastMessage.content }];

        // Aggiungi immagini uploadate inline
        if (images && images.length > 0) {
            for (const imageBase64 of images) {
                const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
                const mimeType = imageBase64.match(/data:([a-z]+\/[a-z0-9.-]+);/)?.[1] || 'image/jpeg';
                userParts.push({
                    inlineData: { data: base64Data, mimeType: mimeType }
                });
            }
        }

        // --- RETRY LOGIC (ANTI-503) ---
        let result;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount < MAX_RETRIES) {
            try {
                result = await chat.sendMessage(userParts);
                break;
            } catch (error: any) {
                if (error.status === 503 && retryCount < MAX_RETRIES - 1) {
                    console.log(`⚠️ Gemini 503 - Retry ${retryCount + 1}...`);
                    retryCount++;
                    await new Promise(r => setTimeout(r, 1000 * retryCount));
                    continue;
                }
                throw error;
            }
        }

        if (!result) throw new Error("Failed to get response");
        const response = await result.response;

        // --- GESTIONE TOOL CALLS (IMAGEN) ---
        // Controlla se il modello vuole generare un'immagine
        const functionCall = response.functionCalls()?.[0];

        if (functionCall && functionCall.name === 'generate_render') {
            const imagePrompt = (functionCall.args as any).prompt as string;
            console.log("🎨 Generazione immagine richiesta:", imagePrompt);

            // Chiamata a Imagen 4 Fast (via endpoint predict manuale per compatibilità Vertex AI)
            try {
                // Endpoint specifico per Imagen 4 Fast
                const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${apiKey}`;

                const fetchResponse = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: imagePrompt }],
                        parameters: { sampleCount: 1, aspectRatio: "16:9" }
                    })
                });

                if (!fetchResponse.ok) {
                    const errText = await fetchResponse.text();
                    throw new Error(`Imagen API Error ${fetchResponse.status}: ${errText}`);
                }

                const result = await fetchResponse.json();

                // Imagen 4 Vertex response format: { predictions: [ { bytesBase64Encoded: "..." } ] }
                const prediction = result.predictions?.[0];

                if (prediction && prediction.bytesBase64Encoded) {
                    const b64 = prediction.bytesBase64Encoded;
                    const mime = prediction.mimeType || 'image/png'; // Imagen 4 default png

                    return Response.json({
                        response: `Ecco la proposta per il tuo nuovo ambiente:\n\n![Rendering AI](data:${mime};base64,${b64})\n\nCosa ne pensi? Se ti piace, posso prepararti un preventivo per realizzarlo esattamente così.`
                    });
                } else {
                    throw new Error("Nessuna immagine restituita dal modello");
                }

            } catch (imgError: any) {
                console.error("❌ Errore Imagen:", imgError);
                return Response.json({
                    response: `(Errore tecnico Imagen 4: ${imgError.message}).\n\nFallback Descrittivo: Immagina questo: ${imagePrompt}`
                });
            }
        }

        // Risposta Standard (Testo)
        return Response.json({ response: response.text() });

    } catch (error: any) {
        console.error("API Error:", error);
        return Response.json({
            error: error.message || "Errore sconosciuto",
            details: error.toString()
        }, { status: error.status || 500 });
    }
}

const SYSTEM_INSTRUCTION = `# SYD - ARCHITETTO PERSONALE & CONSULENTE
Sei SYD, un architetto visionario e pragmatico.
Il tuo stile è: **Guidato, Paziente, Professionale**.
Non chiedi mai liste di cose. Poni UNA SOLA domanda alla volta.

### LOGICA DI FLUSSO BI-DIREZIONALE
Devi identificare immediatamente l'intento dell'utente e seguire il percorso corretto.

**PERCORSO A: PREVENTIVO (Priorità Dati)**
(Es: "Voglio ristrutturare", "Quanto costa rifare il bagno?")
1.  **INTERVISTA GUIDATA (Step-by-Step)**:
    *   Devi raccogliere: Mq, Tipo Lavori, Stato Impianti.
    *   **REGOLA D'ORO:** Fai UNA sola domanda per messaggio.
    *   **REGOLA ESEMPI:** Includi sempre esempi concreti per aiutare.
        *   *Esempio:* "Partiamo dalle dimensioni. Di quanti metri quadri parliamo? È un bagno standard (circa 4-5mq) o una stanza più grande?"
2.  **RACCOLTA LEAD**: "Per inviarti la stima completa, a chi la intesto? Lasciami Nome e Email."
3.  **REWARD**: SOLO ALLA FINE offri il render: "Grazie [Nome]. Ora che ho i dati, vuoi vedere un'anteprima 3D immediata?"

**PERCORSO B: ISPIRAZIONE (Priorità Visiva)**
(Es: "Idee per salotto", "Vorrei vedere una cucina moderna")
1.  **BRIEFING CREATIVO (Step-by-Step)**:
    *   Chiedi stile e colori.
    *   Sempre una domanda alla volta con esempi.
    *   *Esempio:* "Che atmosfera cerchi? Qualcosa di Minimal (bianco, pulito) o più Caldo (legno, colori terra)?"
2.  **CHECK DETTAGLI (OBBLIGATORIO)**:
    *   Prima di generare, chiedi SEMPRE:
    *   "Perfetto. Vuoi aggiungere qualche dettaglio particolare a tua scelta (es. tipo di pavimento, lampadari), o procedo subito a creare l'immagine?"
3.  **AZIONE**: Chiama il tool \`generate_render\` SOLO dopo la risposta a questa domanda.
4.  **CONVERSIONE**: "Ti piace? Posso farti un preventivo per realizzarlo così. Mi servono solo i Mq..."

### REGOLE GENERALI
*   **MAI** chiedere più cose insieme.
*   **MAI** generare l'immagine senza aver chiesto "Vuoi aggiungere dettagli o procedo?".
*   Se l'utente divaga, riportalo gentilmente al prossimo step.`;
