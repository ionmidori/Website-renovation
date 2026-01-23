import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from '@/lib/debounce';
import type {
    ChatButtonPosition,
    DragConstraints,
    UseDraggableButtonReturn
} from '@/types/chat';

// Constants
const STORAGE_KEY = 'chatbot-button-position';
const DRAG_THRESHOLD = 5; // pixels - minimum drag distance to count as drag vs click
const BUTTON_WIDTH = 128; // matches ChatToggleButton w-32 (8 * 4 = 32 * 4px = 128px)
const BUTTON_HEIGHT = 112; // matches ChatToggleButton h-28 (7 * 4 = 28 * 4px = 112px)

/**
 * Custom hook for managing draggable chat button functionality
 * 
 * Handles:
 * - Position state and persistence (localStorage)
 * - Drag constraints calculation (viewport bounds)
 * - Click vs drag detection
 * - Window resize with debouncing
 * - Mobile scroll prevention during drag
 * 
 * @param onClick - Callback to execute when button is clicked (not dragged)
 * @returns Position, constraints, drag state, and event handlers
 */
export function useDraggableButton(onClick: () => void): UseDraggableButtonReturn {
    // Calculate default bottom-right position (lazy initializer for SSR safety)
    const getDefaultPosition = (): ChatButtonPosition => {
        if (typeof window === 'undefined') {
            return { x: 0, y: 0 }; // SSR fallback
        }
        return {
            x: window.innerWidth - BUTTON_WIDTH - 24, // 24px from right edge
            y: window.innerHeight - BUTTON_HEIGHT - 32 // 32px from bottom
        };
    };

    // State - use lazy initializer to get correct position on mount
    const [position, setPosition] = useState<ChatButtonPosition>(getDefaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [windowSize, setWindowSize] = useState(() => ({
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080
    }));

    /**
     * Calculate drag constraints based on current window size
     * Memoized to avoid recalculation on every render
     */
    const constraints = useMemo<DragConstraints>(() => ({
        top: 0,
        left: 0,
        right: Math.max(0, windowSize.width - BUTTON_WIDTH),
        bottom: Math.max(0, windowSize.height - BUTTON_HEIGHT)
    }), [windowSize]);

    /**
     * Clamp position to valid viewport bounds
     * Prevents button from going off-screen
     */
    const clampPosition = useCallback((pos: ChatButtonPosition): ChatButtonPosition => ({
        x: Math.max(0, Math.min(pos.x, constraints.right)),
        y: Math.max(0, Math.min(pos.y, constraints.bottom))
    }), [constraints]);

    /**
     * Save position to localStorage with error handling
     * Clamps position before saving to ensure validity
     */
    const savePosition = useCallback((pos: ChatButtonPosition) => {
        // SSR safety check
        if (typeof window === 'undefined') return;

        try {
            const clamped = clampPosition(pos);

            // Check localStorage availability (can be disabled in private browsing)
            if (!window.localStorage) {
                console.warn('[useDraggableButton] localStorage not available');
                setPosition(clamped);
                return;
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
            setPosition(clamped);
        } catch (error) {
            // Handle QuotaExceededError, SecurityError, etc.
            if (error instanceof Error) {
                console.error(`[useDraggableButton] Failed to save position: ${error.message}`);
            }
            // Fallback: update state without persistence
            setPosition(clampPosition(pos));
        }
    }, [clampPosition]);

    /**
     * Restore position from localStorage on mount
     * Validates and clamps the saved position
     * Uses bottom-right corner as default if no saved position
     */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as ChatButtonPosition;
                // Validate and clamp in case viewport changed
                setPosition(clampPosition(parsed));
            } else {
                // No saved position - use bottom-right corner as default
                const defaultPos = {
                    x: Math.max(0, window.innerWidth - BUTTON_WIDTH - 24),
                    y: Math.max(0, window.innerHeight - BUTTON_HEIGHT - 32)
                };
                setPosition(clampPosition(defaultPos));
            }
        } catch (error) {
            console.error('[useDraggableButton] Failed to restore position:', error);
            // Use bottom-right as fallback
            const fallbackPos = {
                x: Math.max(0, window.innerWidth - BUTTON_WIDTH - 24),
                y: Math.max(0, window.innerHeight - BUTTON_HEIGHT - 32)
            };
            setPosition(clampPosition(fallbackPos));
        }
    }, [clampPosition]);

    /**
     * Handle window resize with debouncing for performance
     * Recalculates constraints and reclamps position if needed
     */
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = debounce(() => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
            // Reclamp position if window shrinks
            setPosition(prev => clampPosition(prev));
        }, 150);

        window.addEventListener('resize', handleResize);

        return () => {
            handleResize.cancel();
            window.removeEventListener('resize', handleResize);
        };
    }, [clampPosition]);

    /**
     * Handle drag start
     * Prevents page scroll on mobile during drag
     */
    const handleDragStart = useCallback(() => {
        setIsDragging(true);

        // Prevent scroll on mobile during drag
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        }
    }, []);

    /**
     * Handle drag end
     * Distinguishes between click and drag based on distance moved
     * Re-enables page scroll after drag
     */
    const handleDragEnd = useCallback((event: any, info: any) => {
        setIsDragging(false);

        // Re-enable scroll
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        // Calculate drag distance using Pythagorean theorem
        const dragDistance = Math.sqrt(
            info.offset.x ** 2 + info.offset.y ** 2
        );

        if (dragDistance < DRAG_THRESHOLD) {
            // Movement was minimal, treat as click
            onClick();
        } else {
            // Significant movement, was a drag - save new position
            savePosition(info.point);
        }
    }, [onClick, savePosition]);

    return {
        position,
        constraints,
        isDragging,
        handleDragStart,
        handleDragEnd
    };
}
