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
            if (msg.content && msg.content.length > MAX_MESSAGE_LENGTH) {
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

            if (lastRole === currentRole && history.length > 0) {
                history[history.length - 1].parts[0].text += `\n\n${msg.content}`;
            } else {
                history.push({
                    role: currentRole,
                    parts: [{ text: msg.content }]
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

            // Chiamata a Imagen 3
            try {
                const imagenModel = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });
                const imageResult = await imagenModel.generateContent(imagePrompt);
                const imageResponse = await imageResult.response;

                // Imagen restituisce l'immagine come inlineData nel primo candidate?
                // Nota: La struttura di risposta di Imagen via API Gemini è standard.
                // Se fallisce, useremo un placeholder.

                // Tenta di estrarre base64
                // @ts-ignore - Accesso interno se la struttura differisce o è typeless
                const parts = imageResponse.candidates?.[0]?.content?.parts;
                const imagePart = parts?.find((p: any) => p.inlineData);

                if (imagePart && imagePart.inlineData) {
                    const b64 = imagePart.inlineData.data;
                    const mime = imagePart.inlineData.mimeType || 'image/png';

                    return Response.json({
                        response: `Ecco la proposta per il tuo nuovo ambiente:\n\n![Rendering AI](data:${mime};base64,${b64})\n\nCosa ne pensi di questo stile?`
                    });
                } else {
                    throw new Error("Nessuna immagine restituita dal modello");
                }

            } catch (imgError: any) {
                console.error("❌ Errore Imagen:", imgError);
                // Fallback testuale
                return Response.json({
                    response: `(Il sistema ha tentato di generare l'immagine ma ha riscontrato un errore tecnico: ${imgError.message}).\n\nComunque, immagina questo: ${imagePrompt}`
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

const SYSTEM_INSTRUCTION = `# SYD - ARCHITETTO PERSONALE CON IMAGEN 3
Sei un architetto visionario capace di generare rendering fotorealistici.

### CORE LOGIC
Guidi l'utente in 3 fasi:
1.  **VISIONE/ANALISI**: Analizzi foto caricate o chiedi dettagli.
2.  **LEAD GEN**: Raccogli nome/email per il preventivo.
3.  **REWARD (GENERAZIONE)**: SOLO DOPO aver i dati, offri di "visualizzare" il progetto.

### USO DEL TOOL 'generate_render'
*   Quando l'utente accetta di vedere l'anteprima (e SOLO ALLORA), **DEVI** usare lo strumento \`generate_render\`.
*   Crea un PROMPT IN INGLESE molto dettagliato per Imagen 3 (es. "Photorealistic interior design of a modern living room, marble floor, warm lighting, 8k resolution").
*   Non chiedere ulteriori conferme, genera subito.

### REGOLE DI CONVERSAZIONE
*   Sii conciso e professionale.
*   Analizza tecnicamente le foto caricate dall'utente.
*   Non menzionare i tuoi "tools" o "prompt" all'utente. Dì solo "Ecco la mia idea..." ed esegui l'azione.`;
