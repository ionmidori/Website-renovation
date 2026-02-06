import { useEffect } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/hooks/useAuth';
import { getChatHistory, type ChatHistoryResponse } from '@/lib/api-client';
import type { Message } from '@/types/chat';

/**
 * Backend message format from Python API
 */
interface BackendMessage {
    id: string;
    role: string;
    content: string;
    timestamp?: string;
    tool_call_id?: string;
    tool_calls?: any[];
    attachments?: {
        images?: string[];
        videos?: string[];
        documents?: string[];
    };
}

interface UseChatHistoryOptions {
    /**
     * Enable automatic polling (revalidation) for realtime-like updates.
     * Default: 5000ms (5 seconds)
     */
    refreshInterval?: number;
    /**
     * Disable automatic revalidation on focus/reconnect.
     */
    revalidateOnFocus?: boolean;
    /**
     * Number of messages to fetch per page.
     */
    limit?: number;
}

interface UseChatHistoryReturn {
    historyLoaded: boolean;
    historyMessages: Message[];
    isLoading: boolean;
    error: Error | undefined;
    mutate: () => void;
}

/**
 * Custom hook for loading chat history from Python backend.
 * 
 * **Migration from Firestore Direct Access:**
 * - Previously used `onSnapshot` for realtime updates
 * - Now uses SWR with polling for near-realtime behavior
 * - Provides automatic caching, deduplication, and error retry
 * 
 * **Best Practices Applied:**
 * - Client-side caching with SWR
 * - Automatic revalidation on focus/reconnect
 * - Optional polling for realtime-like updates
 * - Proper error handling and loading states
 * - Type-safe with full TypeScript support
 */
export function useChatHistory(
    sessionId: string | undefined,
    options: UseChatHistoryOptions = {}
): UseChatHistoryReturn {
    const { user, loading: authLoading } = useAuth();

    const {
        refreshInterval = 5000, // Poll every 5 seconds for new messages
        revalidateOnFocus = true,
        limit = 50
    } = options;

    // Only fetch if we have sessionId and user is authenticated
    const shouldFetch = !authLoading && !!user && !!sessionId;

    const {
        data,
        error,
        isLoading,
        mutate
    } = useSWR<ChatHistoryResponse>(
        shouldFetch ? [`/api/sessions/${sessionId}/messages`, sessionId] : null,
        async () => {
            if (!sessionId) throw new Error('Session ID required');
            return getChatHistory(sessionId, undefined, limit);
        },
        {
            refreshInterval: shouldFetch ? refreshInterval : 0,
            revalidateOnFocus,
            revalidateOnReconnect: true,
            dedupingInterval: 2000, // Prevent duplicate requests within 2s
            errorRetryCount: 3,
            errorRetryInterval: 5000,
            onError: (err) => {
                console.error('[useChatHistory] SWR Error:', err);
            },
            onSuccess: (data) => {
                console.log(`[useChatHistory] Loaded ${data.messages.length} messages`);
            }
        }
    );

    // Transform backend messages to match frontend Message format
    const transformedMessages: Message[] = (data?.messages || []).map((backendMsg: any) => {
        // Cast to BackendMessage for type safety
        const msg = backendMsg as BackendMessage;

        // Parse tool_calls from backend format to frontend toolInvocations
        let toolInvocations = undefined;
        if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
            toolInvocations = msg.tool_calls.map((tc: any) => ({
                toolCallId: tc.id || tc.tool_call_id,
                toolName: tc.function?.name || tc.name,
                args: typeof tc.function?.arguments === 'string'
                    ? JSON.parse(tc.function.arguments)
                    : (tc.function?.arguments || tc.args),
                state: 'result' as const
            }));
        }

        // Parse attachments from backend format
        let attachments = undefined;
        if (msg.attachments) {
            // Backend sends { images?: string[], videos?: string[], documents?: string[] }
            attachments = msg.attachments;
        }

        // Clean content from legacy markers
        let content = msg.content;
        if (content && (attachments?.images?.length || attachments?.videos?.length)) {
            content = content
                .replace(/\[(Immagine|Video) allegata:.*?\]/g, '')
                .replace(/\[https?:\/\/.*?\]/g, '')
                .trim();
        }

        return {
            id: msg.id,
            role: msg.role as 'user' | 'assistant' | 'system' | 'tool',
            content,
            createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            timestamp: msg.timestamp,
            toolInvocations,
            tool_call_id: msg.tool_call_id,
            attachments
        };
    });

    // Link tool results to assistant tool invocations
    const linkedMessages = transformedMessages.map(msg => {
        if (msg.role === 'assistant' && msg.toolInvocations) {
            return {
                ...msg,
                toolInvocations: msg.toolInvocations.map((tool: any) => {
                    const toolResultMsg = transformedMessages.find(m =>
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
                            state: 'result' as const,
                            result: parsedResult
                        };
                    }
                    return tool;
                })
            };
        }
        return msg;
    });

    // Determine if history is fully loaded
    const historyLoaded = !isLoading && !authLoading;

    return {
        historyLoaded,
        historyMessages: linkedMessages,
        isLoading,
        error,
        mutate // Expose for manual revalidation
    };
}
