import { renderHook, waitFor } from '@testing-library/react';
import { useChatHistory } from '../useChatHistory';
import { SWRConfig, cache } from 'swr';
import React from 'react';

// Mock modules
jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: { uid: 'test-user-123', email: 'test@example.com' },
        loading: false,
    }),
}));

jest.mock('@/lib/api-client', () => ({
    getChatHistory: jest.fn(),
}));

import { getChatHistory } from '@/lib/api-client';

const mockGetChatHistory = getChatHistory as jest.MockedFunction<typeof getChatHistory>;

/**
 * SWR wrapper to provide fresh cache for each test
 */
const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <SWRConfig value= {{ provider: () => new Map(), dedupingInterval: 0 }
}>
    { children }
    </SWRConfig>
    );
};

describe('useChatHistory', () => {
    const mockSessionId = 'test-session-123';

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear SWR cache between tests
        cache.clear();
    });

    it('should initialize with empty history and historyLoaded as false during loading', async () => {
        mockGetChatHistory.mockResolvedValue({ messages: [], has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        // Initially loading
        expect(result.current.isLoading).toBe(true);
        expect(result.current.historyMessages).toEqual([]);
    });

    it('should fetch history on mount and set historyLoaded to true', async () => {
        const mockMessages = [
            { id: 'msg-1', role: 'user', content: 'Hello' },
            { id: 'msg-2', role: 'assistant', content: 'Hi there!' },
        ];

        mockGetChatHistory.mockResolvedValue({ messages: mockMessages, has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        expect(mockGetChatHistory).toHaveBeenCalledWith(mockSessionId, undefined, 50);
        expect(result.current.historyMessages).toHaveLength(2);
    });

    it('should transform backend messages to frontend format', async () => {
        const mockMessages = [
            {
                id: 'msg-1',
                role: 'user',
                content: 'Test message',
                timestamp: '2026-02-07T12:00:00Z',
            },
        ];

        mockGetChatHistory.mockResolvedValue({ messages: mockMessages, has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        const message = result.current.historyMessages[0];
        expect(message).toMatchObject({
            id: 'msg-1',
            role: 'user',
            content: 'Test message',
        });
        expect(message.createdAt).toBeInstanceOf(Date);
    });

    it('should handle empty history response', async () => {
        mockGetChatHistory.mockResolvedValue({ messages: [], has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        expect(result.current.historyMessages).toEqual([]);
        expect(result.current.error).toBeUndefined();
    });

    it('should handle fetch errors gracefully', async () => {
        const testError = new Error('Network error');
        mockGetChatHistory.mockRejectedValue(testError);

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
        });

        expect(result.current.error).toEqual(testError);
    });

    it('should not fetch when sessionId is undefined', async () => {
        mockGetChatHistory.mockResolvedValue({ messages: [], has_more: false });

        const { result } = renderHook(() => useChatHistory(undefined), {
            wrapper: createWrapper(),
        });

        // Should immediately be "loaded" with empty messages (no fetch attempted)
        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        expect(mockGetChatHistory).not.toHaveBeenCalled();
    });

    it('should parse tool_calls and link with tool results', async () => {
        const mockMessages = [
            {
                id: 'msg-1',
                role: 'assistant',
                content: 'Let me analyze that.',
                tool_calls: [
                    {
                        id: 'tc-123',
                        function: {
                            name: 'analyze_room',
                            arguments: '{"image_url": "https://example.com/room.jpg"}',
                        },
                    },
                ],
            },
            {
                id: 'msg-2',
                role: 'tool',
                content: '{"result": "Modern living room"}',
                tool_call_id: 'tc-123',
            },
        ];

        mockGetChatHistory.mockResolvedValue({ messages: mockMessages, has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        const assistantMsg = result.current.historyMessages.find(m => m.role === 'assistant');
        expect(assistantMsg?.toolInvocations).toBeDefined();
        expect(assistantMsg?.toolInvocations?.[0]).toMatchObject({
            toolCallId: 'tc-123',
            toolName: 'analyze_room',
            state: 'result',
        });
    });

    it('should strip legacy attachment markers from content', async () => {
        const mockMessages = [
            {
                id: 'msg-1',
                role: 'user',
                content: '[Immagine allegata: room.jpg] Can you analyze this?',
                attachments: {
                    images: ['https://storage.example.com/room.jpg'],
                },
            },
        ];

        mockGetChatHistory.mockResolvedValue({ messages: mockMessages, has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        const message = result.current.historyMessages[0];
        expect(message.content).toBe('Can you analyze this?');
        expect(message.attachments?.images).toContain('https://storage.example.com/room.jpg');
    });

    it('should expose mutate function for manual revalidation', async () => {
        mockGetChatHistory.mockResolvedValue({ messages: [], has_more: false });

        const { result } = renderHook(() => useChatHistory(mockSessionId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.historyLoaded).toBe(true);
        });

        expect(typeof result.current.mutate).toBe('function');
    });
});
