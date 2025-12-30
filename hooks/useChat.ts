import { useState } from 'react';

interface Message {
    id: string;
    role: string;
    content: string;
}

interface AppendOptions {
    body?: {
        images?: string[];
        [key: string]: any;
    };
}

/**
 * Custom hook for chat state management and streaming logic
 * Extracted from ChatWidget.tsx (lines 42-214)
 * Handles message state, streaming with TextDecoder, and intelligent JSON parsing
 */
export function useChat(sessionId: string, initialMessages: Message[] = []) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);

    const append = async (message: { role: string; content: string }, options?: AppendOptions) => {
        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: message.content
        };

        // Optimistic update
        const currentMessages = [...messages, userMsg];
        setMessages(currentMessages);
        setIsLoading(true);

        try {
            const body = {
                messages: currentMessages,
                sessionId,
                ...(options?.body || {})
            };

            console.log("Fetching /api/chat...", { ...body, messages: `${body.messages.length} messages` });
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            console.log("Response received:", response.status, response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("SERVER ERROR DETAILS:", errorData);
                throw new Error(errorData.details || errorData.error || "Network response was not ok");
            }

            if (!response.body) {
                console.error("Response body is null!");
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Create placeholder assistant message
            const assistantMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantMsgId,
                role: 'assistant',
                content: ''
            }]);

            console.log("Stream Logic: Starting loop...");
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("Stream Logic: Done signal received.");
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log("Stream Chunk Received:", chunk.length, "bytes");

                // ✅ INTELLIGENT JSON FILTER: Extract useful content, block the rest
                const trimmedChunk = chunk.trim();

                // Detect if this looks like JSON (starts with { and likely ends with })
                if (trimmedChunk.startsWith('{') && trimmedChunk.includes('}')) {
                    console.log('[Frontend Filter] ⚠️ Detected JSON-like chunk, attempting parse...');

                    try {
                        const parsed = JSON.parse(trimmedChunk);
                        console.log('[Frontend Filter] Parsed JSON:', JSON.stringify(parsed, null, 2));

                        // 🖼️ PRIORITY 1: Check if this is a tool response with image URL
                        if (parsed.imageUrl || parsed.url || parsed.image) {
                            const imageUrl = parsed.imageUrl || parsed.url || parsed.image;
                            const description = parsed.description || 'Generated rendering';
                            console.log('[Frontend Filter] 🖼️ Found image URL in JSON, converting to markdown:', imageUrl);
                            // Convert to markdown image format for ReactMarkdown to render
                            accumulatedContent += `\n\n![${description}](${imageUrl})\n\n`;
                            continue;
                        }

                        // Try to extract readable content from common fields
                        const extractedText = parsed.content || parsed.text || parsed.message ||
                            parsed.question || parsed.response || '';

                        console.log('[Frontend Filter] Extraction attempt - text field:', parsed.text, 'extractedText:', extractedText);

                        if (extractedText && typeof extractedText === 'string') {
                            // Found text content in JSON, extract it
                            console.log('[Frontend Filter] ✅ Extracted text:', extractedText.substring(0, 50));
                            accumulatedContent += extractedText;
                        } else {
                            // This is pure data JSON (like tool params), skip entirely
                            console.log('[Frontend Filter] 🚫 Skipping data-only JSON:', Object.keys(parsed).join(', '));
                            continue;
                        }
                    } catch (e) {
                        // Not valid complete JSON, might be partial streaming
                        // Add as-is but this shouldn't happen often
                        console.log('[Frontend Filter] ⚠️ Invalid JSON, adding as-is');
                        accumulatedContent += chunk;
                    }
                } else {
                    // Normal text, add directly
                    accumulatedContent += chunk;
                }

                // Update specific message
                setMessages(prev => prev.map(msg =>
                    msg.id === assistantMsgId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                ));
            }
            console.log("Stream Logic: Loop finished.");

        } catch (error) {
            console.error("Manual fetch error:", error);
            alert("Errore di connessione. Riprova.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        setMessages,
        isLoading,
        append
    };
}
