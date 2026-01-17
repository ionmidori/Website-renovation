import { useRef, useEffect } from 'react';

/**
 * Custom hook for managing auto-scroll behavior in chat messages
 * Extracted from ChatWidget.tsx (lines 232-280)
 */
export function useChatScroll(messagesLength: number, isOpen: boolean) {
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const prevMessagesLengthRef = useRef(messagesLength);

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

    useEffect(() => {
        // Scroll when messages change or chat opens
        if (messagesLength !== prevMessagesLengthRef.current || isOpen) {
            scrollToBottom(isOpen && prevMessagesLengthRef.current === messagesLength ? 'instant' : 'smooth');
            prevMessagesLengthRef.current = messagesLength;
        }
    }, [messagesLength, isOpen]);

    return {
        messagesContainerRef,
        messagesEndRef,
        scrollToBottom
    };
}
