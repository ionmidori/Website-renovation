import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';

interface Message {
    id: string;
    role: string;
    content: string;
    createdAt?: Date;
    toolInvocations?: any[];
    tool_call_id?: string;
    // Add other fields as needed based on DB schema
}

/**
 * Custom hook for loading chat history from Firestore
 * Uses Realtime Listener (onSnapshot) for instant updates
 */
export function useChatHistory(sessionId: string) {
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [historyMessages, setHistoryMessages] = useState<Message[]>([]);

    // ✅ Wait for Auth initialization
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        // If no user, we might still want to load if rules allow public reads for session?
        // But for now, let's keep the auth check safety.
        if (!user) {
            console.warn("[useChatHistory] No authenticated user - skipping history load");
            setHistoryLoaded(true);
            return;
        }

        if (!sessionId) {
            setHistoryLoaded(true);
            return;
        }

        console.log("[useChatHistory] Subscribing to session:", sessionId);
        setHistoryLoaded(false);

        // Reference to messages subcollection
        // Path: sessions/{sessionId}/messages
        // 🔥 FIX: Order by 'timestamp' (field used by backend), not 'createdAt'
        const messagesRef = collection(db, 'sessions', sessionId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        // Realtime Listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => {
                const data = doc.data();

                // Map Firestore 'tool_calls' to AI SDK 'toolInvocations'
                let toolInvocations = undefined;
                if (data.tool_calls && Array.isArray(data.tool_calls)) {
                    toolInvocations = data.tool_calls.map((tc: any) => ({
                        toolCallId: tc.id || tc.tool_call_id,
                        toolName: tc.function?.name || tc.name,
                        args: typeof tc.function?.arguments === 'string'
                            ? JSON.parse(tc.function.arguments)
                            : (tc.function?.arguments || tc.args),
                        state: 'result' // History items are always completed
                    }));
                }

                // Map Firestore attachments (Array) to UI attachments (Object)
                let attachments = undefined;
                if (data.attachments && Array.isArray(data.attachments)) {
                    attachments = {
                        images: data.attachments
                            .filter((a: any) => a.media_type === 'image' || a.contentType?.startsWith('image/'))
                            .map((a: any) => a.url),
                        videos: data.attachments
                            .filter((a: any) => a.media_type === 'video' || a.contentType?.startsWith('video/'))
                            .map((a: any) => a.url)
                    };
                }

                // Hide text markers in content if we have structured attachments to avoid duplicates
                // Also remove raw URL markers like [https://...] which might be causing the "hash" issue
                let content = data.content;
                if (content && (attachments?.images?.length || attachments?.videos?.length)) {
                    // Regex to remove legacy markers like [Immagine allegata: https://...] or just [https://...]
                    content = content
                        .replace(/\[(Immagine|Video) allegata:.*?\]/g, '')
                        .replace(/\[https?:\/\/.*?\]/g, '') // Remove naked URL markers too
                        .trim();
                }

                return {
                    id: doc.id,
                    role: data.role,
                    content,
                    createdAt: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
                    toolInvocations,
                    tool_call_id: data.tool_call_id,
                    attachments, // Injected structured attachments
                } as Message;
            });

            // 🔗 LINKING FIX: Backfill 'result' from Tool Messages into Assistant Invocations
            // This ensures ToolStatus can render the result immediately without relying on SDK internal merging
            const linkedMessages = messages.map((msg, index) => {
                if (msg.role === 'assistant' && msg.toolInvocations) {
                    return {
                        ...msg,
                        toolInvocations: msg.toolInvocations.map((tool: any) => {
                            // Find the corresponding tool result message
                            const toolResultMsg = messages.find(m =>
                                m.role === 'tool' && m.tool_call_id === tool.toolCallId
                            );

                            if (toolResultMsg) {
                                let parsedResult = toolResultMsg.content;
                                try {
                                    if (typeof toolResultMsg.content === 'string' &&
                                        (toolResultMsg.content.startsWith('{') || toolResultMsg.content.startsWith('['))) {
                                        parsedResult = JSON.parse(toolResultMsg.content);
                                    }
                                } catch (e) {
                                    // Keep as string if parse fails
                                }

                                return {
                                    ...tool,
                                    state: 'result',
                                    result: parsedResult // Inject parsed content
                                };
                            }
                            return tool;
                        })
                    };
                }
                return msg;
            });

            console.log(`[useChatHistory] Updated: ${linkedMessages.length} messages (Linked Tools)`);
            setHistoryMessages(linkedMessages);
            setHistoryLoaded(true);
        }, (error) => {
            console.error("[useChatHistory] Listener Error:", error);
            // 403 usually means rules blocked it or session doesn't exist for user
            setHistoryLoaded(true);
        });

        // Cleanup listener on unmount or sessionId change
        return () => unsubscribe();

    }, [sessionId, authLoading, user]);

    return { historyLoaded, historyMessages };
}
