import { useRef, useEffect } from 'react';

/**
 * Custom hook for managing auto-scroll behavior in chat messages
 * Extracted from ChatWidget.tsx (lines 232-280)
 */
export function useChatScroll(messagesLength: number, isOpen: boolean) {
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const prevMessagesLengthRef = useRef(messagesLength);
    const isNearBottomRef = useRef(true); // Track if user is at bottom

    // Auto-scroll logic - Optimized for iOS Safari compatibility
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        // Use only scrollIntoView for better cross-platform support
        // iOS Safari handles scrollIntoView more reliably than scrollTop
        messagesEndRef.current?.scrollIntoView({
            behavior,
            block: 'end',
            inline: 'nearest'
        });
    };

    const checkScrollPosition = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        // User is considered "near bottom" if within 100px of end
        isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    // Attach scroll listener to track position
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition, { passive: true });
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [messagesContainerRef.current]);

    useEffect(() => {
        // Scroll logic:
        // 1. If chat just opened -> force scroll
        // 2. If new message and we were near bottom -> smooth scroll
        // 3. If new message and we were scrolled up -> don't scroll (let user read)
        if (isOpen) {
            if (prevMessagesLengthRef.current !== messagesLength) {
                // New message arrived
                if (isNearBottomRef.current) {
                    scrollToBottom('smooth');
                }
            } else {
                // Chat opened or re-rendered without new messages
                // Force scroll to bottom initially
                scrollToBottom('instant');
            }
            prevMessagesLengthRef.current = messagesLength;
        }
    }, [messagesLength, isOpen]);

    return {
        messagesContainerRef,
        messagesEndRef,
        scrollToBottom
    };
}
