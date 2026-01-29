import { useRef, useEffect } from 'react';

/**
 * Custom hook for managing auto-scroll behavior in chat messages
 * @param dep - Dependency that triggers scroll check (e.g. messages array or length)
 * @param isOpen - Whether the chat window is open
 */
export function useChatScroll(dep: any, isOpen: boolean) {
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
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
            // Initial check
            checkScrollPosition();
            container.addEventListener('scroll', checkScrollPosition, { passive: true });
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [messagesContainerRef.current]);

    // Auto-scroll on dependency change (messages updated)
    useEffect(() => {
        if (isOpen && isNearBottomRef.current) {
            scrollToBottom('smooth');
        }
    }, [dep, isOpen]);

    // Initial scroll when opening
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure content is fully rendered
            setTimeout(() => {
                scrollToBottom('instant');
            }, 50);
        }
    }, [isOpen]);

    return {
        messagesContainerRef,
        messagesEndRef,
        scrollToBottom
    };
}
