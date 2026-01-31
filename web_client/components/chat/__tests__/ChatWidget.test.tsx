
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ChatWidget from '../ChatWidget';
import '@testing-library/jest-dom';

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const mockUseAuth = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

jest.mock('@ai-sdk/react', () => ({
    useChat: () => ({
        messages: [], input: '', handleInputChange: jest.fn(), handleSubmit: jest.fn(), isLoading: false,
        setMessages: jest.fn(), setInput: jest.fn(), sendMessage: jest.fn(),
    }),
}));

// Exposed Mock for ChatHeader to verify props
const MockChatHeader = jest.fn(({ projectId }) => <div data-testid="chat-header">Header: {projectId || 'No Project'}</div>);
jest.mock('../ChatHeader', () => ({ ChatHeader: (props: any) => MockChatHeader(props) }));

// Other Mocks
jest.mock('../ChatMessages', () => ({ ChatMessages: () => <div /> }));
jest.mock('../ChatInput', () => ({ ChatInput: () => <div /> }));
jest.mock('../ChatToggleButton', () => ({ ChatToggleButton: () => <button>Toggle</button> }));
jest.mock('@/hooks/useSessionId', () => ({ useSessionId: () => 'fallback' }));
jest.mock('@/hooks/useChatHistory', () => ({ useChatHistory: () => ({ historyLoaded: true, historyMessages: [] }) }));
jest.mock('@/hooks/useMediaUpload', () => ({ useMediaUpload: () => ({ mediaItems: [], isGlobalUploading: false }) }));
jest.mock('@/hooks/useVideoUpload', () => ({ useVideoUpload: () => ({ videos: [], isUploading: false }) }));
jest.mock('@/hooks/useChatScroll', () => ({ useChatScroll: () => ({ scrollToBottom: jest.fn() }) }));
jest.mock('@/hooks/useMobileViewport', () => ({ useMobileViewport: () => ({ isMobile: false }) }));
jest.mock('@/hooks/useTypingIndicator', () => ({ useTypingIndicator: () => null }));

describe('ChatWidget Sync Debug', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('restores activeProjectId', async () => {
        // Setup
        mockUseAuth.mockReturnValue({ isInitialized: true, user: { uid: 'u1' }, refreshToken: jest.fn() });
        localStorage.setItem('activeProjectId', 'p-123');

        console.log('DEBUG: storage set', localStorage.getItem('activeProjectId'));

        render(<ChatWidget variant="inline" />);

        // Check calls
        await waitFor(() => {
            // Look at the latest call to ChatHeader
            if (MockChatHeader.mock.calls.length > 0) {
                const lastCall = MockChatHeader.mock.calls[MockChatHeader.mock.calls.length - 1][0];
                console.log('DEBUG: ChatHeader props', lastCall);
            }
            expect(screen.getByTestId('chat-header')).toHaveTextContent('Header: p-123');
        });
    });
});
