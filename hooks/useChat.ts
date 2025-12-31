import { useState, useCallback, useEffect } from 'react';

/**
 * ✅ CRITICAL FIX #1: Custom useChat implementation
 * 
 * The @ai-sdk/react hook has API incompatibilities, so we use a custom implementation
 * that maintains the same interface as our ChatWidget expects.
 */
export function useChat(sessionId: string, initialMessages: any[] = []) {
    const [messages, setMessages] = useState<any[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();

    // Load message history on mount
    useEffect(() => {
        fetch(`/api/chat/history?sessionId=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.messages) {
                    setMessages(data.messages);
                }
            })
            .catch(err => console.error('[useChat] Failed to load history:', err));
    }, [sessionId]);

    const append = useCallback(async (
        message: { role: string; content: string },
        options?: { body?: { images?: string[] } }
    ) => {
        try {
            setIsLoading(true);
            setError(undefined);

            // Optimistically add user message to UI
            const userMessage = { ...message, id: `temp-${Date.now()}` };
            setMessages(prev => [...prev, userMessage]);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, message],
                    images: options?.body?.images,
                    sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error('No response body');
            }

            let assistantMessage = '';
            const assistantMsg = { role: 'assistant', content: '', id: `msg-${Date.now()}` };
            setMessages(prev => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMessage += chunk;

                // Update assistant message in real-time
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...assistantMsg, content: assistantMessage };
                    return updated;
                });
            }

            setIsLoading(false);
        } catch (err: any) {
            console.error('[useChat] Append error:', err);
            setError(err);
            setIsLoading(false);
            throw err;
        }
    }, [messages, sessionId]);

    return {
        messages,
        isLoading,
        append,
        error
    };
}
